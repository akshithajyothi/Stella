// backend/agent/buyingAgentTools.js
const Product = require("../models/Product");

// "Data" tools — the backend executes these itself and feeds the result back to the model.
const DATA_TOOLS = [
  {
    type: "function",
    function: {
      name: "search_products",
      description: "Search the ReStyle catalog by name, category, gender, color, or max price.",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "Free-text search term, e.g. 'blue top'" },
          category: { type: "string", enum: ["tops", "dresses", "bottoms", "coats", "skirts", "sweatshirts"] },
          gender: { type: "string", enum: ["women", "men"] },
          colors: { type: "array", items: { type: "string" }, description: "One or more colors, e.g. ['white','pink']" },
          max_price: { type: ["number", "null"], description: "Omit or leave null if the buyer gave no price limit." },
          exclude_ids: {
            type: "array",
            items: { type: "number" },
            description: "Product ids to leave out of the results — use this when the buyer asks for 'more', 'different', or 'other' items than what you already showed them.",
          },
          sort_by: {
            type: "string",
            enum: ["newest", "price_asc", "price_desc"],
            description: "Optional sort order. Use 'newest' or 'price_asc' when the buyer asks what's on sale — ReStyle has no discount data, so offer these as an honest alternative instead of claiming something is discounted.",
          },
        },
        required: [],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_product_details",
      description: "Get full details for one product by id.",
      parameters: {
        type: "object",
        properties: { product_id: { type: "number" } },
        required: ["product_id"],
      },
    },
  },
];

// "Client action" tools — the backend does NOT execute these; it hands the proposed action
// back to the frontend, which performs it for real against CartContext/router/payment.
const CLIENT_ACTION_TOOLS = [
  {
    type: "function",
    function: {
      name: "add_to_cart",
      description: "Add a specific product to the buyer's cart.",
      parameters: {
        type: "object",
        properties: {
          product_id: { type: "number" },
          quantity: { type: "number", default: 1 },
        },
        required: ["product_id"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "show_checkout_form",
      description: "Show the buyer a delivery-address form so they can check out. Call this when the buyer wants to pay/checkout and you don't have their address yet.",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function",
    function: {
      name: "generate_payment_link",
      description: "Create the order and generate a real Razorpay payment link. Only call this once the buyer has confirmed their cart and their delivery address is known.",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function",
    function: {
      name: "add_to_wishlist",
      description: "Save a specific product to the buyer's wishlist.",
      parameters: {
        type: "object",
        properties: { product_id: { type: "number" } },
        required: ["product_id"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "try_on",
      description: "Open the existing Virtual Fitting Room for a specific product the buyer wants to try on. Only call this for a product that's actually been shown/discussed in this conversation — never invent one.",
      parameters: {
        type: "object",
        properties: { product_id: { type: "number" } },
        required: ["product_id"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "submit_offer",
      description: "Submit the buyer's price offer for a specific product to start or continue negotiating. Use this whenever the buyer proposes a specific rupee amount for an item, or says things like 'accept'/'never mind' while negotiating. Never decide or state a price yourself — this tool is the only way prices move.",
      parameters: {
        type: "object",
        properties: {
          product_id: { type: "number" },
          message: { type: "string", description: "The buyer's own words about their offer, verbatim." },
        },
        required: ["product_id", "message"],
      },
    },
  },
];

const ALL_TOOLS = [...DATA_TOOLS, ...CLIENT_ACTION_TOOLS];
const DATA_TOOL_NAMES = new Set(DATA_TOOLS.map((t) => t.function.name));

function runDataTool(name, args) {
  if (name === "search_products") {
    return Product.search({
      query: args.query,
      category: args.category,
      gender: args.gender,
      colors: args.colors,
      maxPrice: args.max_price,
      excludeIds: args.exclude_ids,
      sortBy: args.sort_by,
      limit: 6,
    });
  }
  if (name === "get_product_details") {
    const product = Product.findById(args.product_id);
    return product ? [product] : [];
  }
  throw new Error(`Unknown data tool: ${name}`);
}

module.exports = { ALL_TOOLS, DATA_TOOL_NAMES, runDataTool };
