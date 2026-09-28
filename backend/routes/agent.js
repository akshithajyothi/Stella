// backend/routes/agent.js
const express = require("express");
const router = express.Router();
const db = require("../db");
const Product = require("../models/Product");
const Order = require("../models/Order");
const { requireAuth } = require("../middleware/auth");
const { chatCompletion, isConfigured } = require("../services/groq");
const { createPaymentLink, isConfigured: isRazorpayConfigured } = require("../services/razorpay");
const { ALL_TOOLS, DATA_TOOL_NAMES, runDataTool } = require("../agent/buyingAgentTools");
const { runNegotiationTurn, MAX_ROUNDS } = require("../agent/negotiationEngine");

function requireGroq(req, res, next) {
  if (!isConfigured()) {
    return res.status(503).json({ message: "The AI agent isn't configured yet — GROQ_API_KEY is missing." });
  }
  next();
}

// ---------------------------------------------------------------------------
// Stella — unified buying, styling, wardrobe, try-on, and negotiation assistant
// ---------------------------------------------------------------------------

const BUYING_AGENT_PERSONA = `You are Stella, ReStyle's AI fashion & shopping assistant — upbeat, concise,
and genuinely into sustainable fashion. You help with styling advice, outfit ideas, finding products,
trying them on, negotiating price, and checking out. Keep replies to ONE short sentence unless the buyer
asked for actual styling advice/reasoning, where two or three sentences are fine. Never invent products
or prices — always use search_products/get_product_details. NEVER list product names, prices, or sizes
in your text reply — the app already shows them as picture cards from the tool result, so just say
something like "Here's what I found:" and stop there.
Use add_to_cart when the buyer clearly wants an item, add_to_wishlist when they want to save one for
later. Use show_checkout_form when they're ready to pay and you don't have their address yet.
Use generate_payment_link once the cart and address are both known. When searching, only set the
filters the buyer actually mentioned — never invent a price limit, category, or color they didn't ask for.
Use try_on when the buyer wants to see a specific product on themselves — only for a product actually
shown/discussed in this conversation or the one they're currently viewing; if none is clear, ask them
to pick one first, don't invent a product.
Use submit_offer whenever the buyer proposes a specific rupee amount for a product, or responds to an
ongoing negotiation (accepting, rejecting, countering) — pass their message through verbatim. You never
decide or state a price yourself; submit_offer's result tells you the real number to relay.
For occasion/mood/climate styling questions, give real, concrete advice reasoned from what you know, then
offer to search matching products. If asked about live weather, say you don't have real-time weather
data and ask the buyer to describe the climate/occasion themselves — never invent a forecast.
If the buyer has wardrobe items listed below, you can suggest combinations from them.

Recently shown products are listed below with their id, name, category, color, and price. When the buyer
says "this", "that", "this dress", "this pant", "that top", "those pieces", or otherwise refers to
something without naming it, resolve it against that list by product_id — don't re-search from scratch.
When they ask for a complementary item ("show a top for this pant"), use the listed category/color to
search for something that actually matches, not a generic keyword search. When they ask for "more",
"different", or "other" results, call search_products again with exclude_ids set to the ids already
shown so you don't repeat them. If the buyer's message is short or ambiguous ("yes", "sure", "ok", "find
me"), interpret it against your own immediately preceding message and this product list before asking
for clarification — only ask if there are genuinely multiple different things it could mean.
ReStyle's catalog has no discount/sale field today. If the buyer asks what's on sale or discounted: do NOT
call search_products with "sale" or "discount" as the query text (nothing will match). Instead call
search_products with sort_by set to "price_asc" or "newest" (plus category if they mentioned one), and — as
the one exception to the "just say Here's what I found" rule above — your reply text must plainly say
nothing is currently marked down, and that you're showing the newest/lowest-priced pieces instead. Never
claim an item is discounted or "on sale" unless you have real data saying so.`;

router.post("/buying/chat", requireAuth, requireGroq, async (req, res) => {
  try {
    const { message, history = [], cart = [], address, wardrobe = [], currentProduct, recentProducts = [] } = req.body;

    const cartSummary = cart.length
      ? cart.map((i) => `${i.name} x${i.quantity} (₹${i.price})`).join(", ")
      : "empty";
    const addressSummary = address ? `already provided (${address.city})` : "not provided yet";
    const wardrobeSummary = wardrobe.length
      ? wardrobe.map((i) => `${i.name} (${i.category}${i.color ? ", " + i.color : ""})`).join(", ")
      : "no items saved yet";
    const contextSummary = currentProduct
      ? `The buyer is currently viewing: ${currentProduct.name}, ₹${currentProduct.price} (product_id ${currentProduct.id}). "it"/"this" likely refers to this product.`
      : "The buyer isn't currently viewing a specific product.";
    const recentProductsSummary = recentProducts.length
      ? recentProducts
          .map((p) => `#${p.id} ${p.name} (${p.category || "?"}, ${p.color || "?"}, ₹${p.price})`)
          .join("; ")
      : "none shown yet";

    let messages = [
      {
        role: "system",
        content: `${BUYING_AGENT_PERSONA}\n\nCurrent cart: ${cartSummary}.\nDelivery address: ${addressSummary}.\nBuyer's wardrobe: ${wardrobeSummary}.\n${contextSummary}\nRecently shown products: ${recentProductsSummary}.`,
      },
      ...history.map((h) => ({ role: h.role, content: h.content })),
      { role: "user", content: message },
    ];

    let lastProducts = null;

    // Bounded tool loop: a data-tool hop (search/details) always leaves `tools` available on
    // the next call so the model can chain straight into a client-action tool (e.g. add the
    // item it just found) without Groq erroring on an unexpected tool call with no tools registered.
    // 3 hops (not 2): the model sometimes retries/refines its own search on a second hop, so a
    // 2-hop cap could spend the whole budget on data tools and leave nothing for the final reply.
    for (let hop = 0; hop < 3; hop++) {
      let result;
      try {
        result = await chatCompletion({ messages, tools: ALL_TOOLS, toolChoice: "auto" });
      } catch (groqErr) {
        // Never let a raw Groq/tool-schema error (e.g. a model-emitted null against a
        // number-typed param) reach the customer as chat text — log it, reply plainly.
        console.error("Buying agent Groq call failed:", groqErr);
        return res.json({
          reply: "I couldn't load that right now — could you try again?",
          products: lastProducts || undefined,
          quickReplies: defaultQuickReplies(cart),
        });
      }
      const toolCall = result.tool_calls?.[0];

      if (!toolCall) {
        return res.json({
          reply: result.content || "…",
          products: lastProducts || undefined,
          quickReplies: defaultQuickReplies(cart),
        });
      }

      const name = toolCall.function.name;
      const args = JSON.parse(toolCall.function.arguments || "{}");

      if (DATA_TOOL_NAMES.has(name)) {
        const results = runDataTool(name, args);
        lastProducts = results;
        messages = [
          ...messages,
          { role: "assistant", content: result.content || null, tool_calls: [toolCall] },
          { role: "tool", tool_call_id: toolCall.id, content: JSON.stringify(results) },
        ];
        continue;
      }

      if (name === "add_to_cart") {
        const product = Product.findById(args.product_id);
        if (!product) return res.json({ reply: "I couldn't find that item anymore, sorry!" });
        return res.json({
          reply: `Added ${product.name} to your bag!`,
          products: lastProducts || undefined,
          action: { type: "add_to_cart", product: { id: product.id, name: product.name, price: product.price, image: product.image, size: product.size }, quantity: args.quantity || 1 },
          quickReplies: ["Checkout now", "Keep shopping"],
        });
      }

      if (name === "add_to_wishlist") {
        const product = Product.findById(args.product_id);
        if (!product) return res.json({ reply: "I couldn't find that item anymore, sorry!" });
        return res.json({
          reply: `Saved ${product.name} to your wishlist!`,
          products: lastProducts || undefined,
          action: { type: "add_to_wishlist", product: { id: product.id, name: product.name, price: product.price, image: product.image, size: product.size } },
          quickReplies: ["Keep shopping", "Checkout now"],
        });
      }

      if (name === "try_on") {
        const product = Product.findById(args.product_id);
        if (!product) return res.json({ reply: "I couldn't find that item to try on, sorry!" });
        return res.json({
          reply: `Opening the Virtual Fitting Room for ${product.name}...`,
          action: { type: "try_on", garmentImage: product.image, garmentName: product.name },
        });
      }

      if (name === "submit_offer") {
        const product = Product.findById(args.product_id);
        if (!product) return res.json({ reply: "I couldn't find that item to negotiate on, sorry!" });

        let session = db
          .prepare(`SELECT * FROM negotiation_sessions WHERE user_id = ? AND product_id = ? AND status = 'active' ORDER BY id DESC LIMIT 1`)
          .get(req.user.id, product.id);

        if (!session) {
          const floorPrice = Math.round(product.price * 0.75);
          const info = db
            .prepare(
              `INSERT INTO negotiation_sessions (user_id, product_id, listing_price, floor_price, current_offer, round, status)
               VALUES (?, ?, ?, ?, ?, 0, 'active')`
            )
            .run(req.user.id, product.id, product.price, floorPrice, product.price);
          session = db.prepare(`SELECT * FROM negotiation_sessions WHERE id = ?`).get(info.lastInsertRowid);
        }

        db.prepare(`INSERT INTO negotiation_messages (session_id, role, content) VALUES (?, 'buyer', ?)`).run(session.id, args.message);
        const turn = await runNegotiationTurn(session, args.message);
        db.prepare(
          `UPDATE negotiation_sessions SET current_offer = ?, round = round + 1, status = ?, updated_at = datetime('now') WHERE id = ?`
        ).run(turn.offer, turn.status, session.id);
        db.prepare(`INSERT INTO negotiation_messages (session_id, role, content, offer_amount) VALUES (?, 'agent', ?, ?)`).run(session.id, turn.reply, turn.offer);

        return res.json({
          reply: turn.reply,
          action: {
            type: "negotiation",
            productId: product.id,
            productName: product.name,
            listingPrice: product.price,
            offer: turn.offer,
            status: turn.status,
          },
          quickReplies:
            turn.status === "accepted"
              ? ["Add to bag at this price", "Keep shopping"]
              : turn.status === "active"
              ? ["Accept this offer", "Offer a different amount"]
              : ["Keep shopping"],
        });
      }

      if (name === "show_checkout_form") {
        return res.json({ reply: "Let's get your delivery details:", action: { type: "show_checkout_form" } });
      }

      if (name === "generate_payment_link") {
        if (!cart.length) return res.json({ reply: "Your bag is empty — add something first!" });
        if (!address) {
          return res.json({ reply: "I still need your delivery address first.", action: { type: "show_checkout_form" } });
        }

        const products = Product.findByIds(cart.map((i) => i.id));
        const items = cart.map((c) => {
          const p = products.find((pr) => pr.id === c.id);
          return { productId: p.id, name: p.name, price: p.price, image: p.image, quantity: c.quantity };
        });
        const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
        const deliveryFee = subtotal >= 1000 ? 0 : 50;
        const total = subtotal + deliveryFee;

        const order = Order.create({ userId: req.user.id, items, shippingAddress: address, subtotal, deliveryFee, total });

        if (!isRazorpayConfigured()) {
          return res.json({
            reply: `Your order is placed (total ₹${total}) — payment isn't configured yet, so there's no link to pay just yet.`,
            action: { type: "order_placed", orderId: order.id },
          });
        }

        const link = await createPaymentLink({ amountInRupees: total, orderId: order.id, customerName: address.name, customerPhone: address.phone });
        Order.setPaymentLink(order.id, { razorpayPaymentLinkId: link.id, razorpayPaymentLinkUrl: link.short_url });

        return res.json({
          reply: `All set! Your total is ₹${total}. Tap below to pay securely.`,
          action: { type: "payment_link", url: link.short_url, orderId: order.id },
        });
      }
    }

    res.json({ reply: "Sorry, I got a bit confused there — could you rephrase?", products: lastProducts || undefined });
  } catch (err) {
    console.error("Buying agent chat failed:", err);
    res.status(500).json({ message: err.message || "The agent hit an error." });
  }
});

function defaultQuickReplies(cart) {
  return cart.length ? ["Checkout now", "Show me tops", "Show me dresses"] : ["Show me tops", "Show me dresses", "What's on sale?"];
}

// ---------------------------------------------------------------------------
// Standalone negotiation entry point (per-product NEGOTIATE button) — kept as a second,
// direct door to the SAME negotiation_sessions/runNegotiationTurn machinery Stella uses.
// ---------------------------------------------------------------------------

router.post("/negotiate/start", requireAuth, (req, res) => {
  const { productId } = req.body;
  const product = Product.findById(productId);
  if (!product) return res.status(404).json({ message: "Product not found." });

  const floorPrice = Math.round(product.price * 0.75);
  const info = db
    .prepare(
      `INSERT INTO negotiation_sessions (user_id, product_id, listing_price, floor_price, current_offer, round, status)
       VALUES (?, ?, ?, ?, ?, 0, 'active')`
    )
    .run(req.user.id, product.id, product.price, floorPrice, product.price);

  res.status(201).json({
    sessionId: info.lastInsertRowid,
    reply: `Hi! This ${product.name} is listed at ₹${product.price}. What would you like to offer?`,
    offer: product.price,
    status: "active",
  });
});

router.post("/negotiate/:sessionId/message", requireAuth, requireGroq, async (req, res) => {
  try {
    const { message } = req.body;
    const session = db.prepare(`SELECT * FROM negotiation_sessions WHERE id = ?`).get(req.params.sessionId);
    if (!session) return res.status(404).json({ message: "Negotiation session not found." });
    if (session.status !== "active") {
      return res.json({ reply: "This negotiation has already ended.", offer: session.current_offer, status: session.status });
    }

    db.prepare(`INSERT INTO negotiation_messages (session_id, role, content) VALUES (?, 'buyer', ?)`).run(session.id, message);

    const turn = await runNegotiationTurn(session, message);

    db.prepare(
      `UPDATE negotiation_sessions SET current_offer = ?, round = round + 1, status = ?, updated_at = datetime('now') WHERE id = ?`
    ).run(turn.offer, turn.status, session.id);
    db.prepare(`INSERT INTO negotiation_messages (session_id, role, content, offer_amount) VALUES (?, 'agent', ?, ?)`).run(session.id, turn.reply, turn.offer);

    res.json({ reply: turn.reply, offer: turn.offer, status: turn.status, round: session.round + 1, maxRounds: MAX_ROUNDS });
  } catch (err) {
    console.error("Negotiation message failed:", err);
    res.status(500).json({ message: err.message || "The negotiation agent hit an error." });
  }
});

module.exports = router;
