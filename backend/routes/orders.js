// backend/routes/orders.js
// Buyer-side only: create an order from the cart, get a Razorpay payment link, check its
// status. No shipping/dispute/escrow — that's out of scope for this prototype.
const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const Product = require("../models/Product");
const { requireAuth } = require("../middleware/auth");
const { createPaymentLink, getPaymentLinkStatus, isConfigured } = require("../services/razorpay");

// POST /api/orders — buyer (or the buying agent) checks out.
// Trusts server-side product prices, not whatever the client sends, to prevent tampering.
router.post("/", requireAuth, async (req, res) => {
  try {
    const { cartItems, shippingAddress } = req.body;
    if (!cartItems?.length) return res.status(400).json({ message: "Your bag is empty." });

    const products = Product.findByIds(cartItems.map((i) => i.productId));
    const items = cartItems.map((cartItem) => {
      const product = products.find((p) => p.id === cartItem.productId);
      if (!product) throw new Error(`Product ${cartItem.productId} not found`);
      return {
        productId: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: cartItem.quantity || 1,
      };
    });

    const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const deliveryFee = subtotal >= 1000 ? 0 : 50;
    const total = subtotal + deliveryFee;

    const order = Order.create({
      userId: req.user.id,
      items,
      shippingAddress,
      subtotal,
      deliveryFee,
      total,
    });

    if (!isConfigured()) {
      return res.status(201).json({ order, paymentConfigured: false });
    }

    const link = await createPaymentLink({
      amountInRupees: total,
      orderId: order.id,
      customerName: shippingAddress?.name,
      customerPhone: shippingAddress?.phone,
    });
    const updated = Order.setPaymentLink(order.id, {
      razorpayPaymentLinkId: link.id,
      razorpayPaymentLinkUrl: link.short_url,
    });

    res.status(201).json({ order: updated, paymentConfigured: true });
  } catch (err) {
    console.error("Order creation failed:", err);
    res.status(400).json({ message: err.message || "Could not place this order." });
  }
});

// GET /api/orders/mine — buyer's order history (Orders.tsx)
router.get("/mine", requireAuth, (req, res) => {
  res.json({ orders: Order.findByUser(req.user.id) });
});

// GET /api/orders/:id — order confirmation page. Polls Razorpay for a status change since
// there's no public webhook URL in this dev setup — self-heals on each view instead.
router.get("/:id", requireAuth, async (req, res) => {
  const order = Order.findById(req.params.id);
  if (!order || order.userId !== req.user.id) {
    return res.status(404).json({ message: "Order not found." });
  }

  if (order.status === "pending" && order.razorpayPaymentLinkId && isConfigured()) {
    try {
      const status = await getPaymentLinkStatus(order.razorpayPaymentLinkId);
      if (status === "paid") {
        return res.json({ order: Order.setStatus(order.id, "paid") });
      }
      if (status === "cancelled" || status === "expired") {
        return res.json({ order: Order.setStatus(order.id, "cancelled") });
      }
    } catch (err) {
      console.error("Payment link status check failed:", err);
    }
  }

  res.json({ order });
});

module.exports = router;
