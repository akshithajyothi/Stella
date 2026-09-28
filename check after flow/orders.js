// backend/routes/orders.js
const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const Listing = require("../models/Listing"); // assumes an existing Listing model
const User = require("../models/User");
const { requireAuth, requireAdmin } = require("../middleware/auth");
const { createRazorpayOrder, verifySignature, transferToSeller, refundPayment } = require("../services/razorpay");

const PLATFORM_FEE_PERCENT = 10;
const INSPECTION_WINDOW_DAYS = 3;

// POST /api/orders — buyer clicks "Pay securely" on Checkout.tsx
// Creates the order row (pending_payment) and a matching Razorpay order in one step.
router.post("/", requireAuth, async (req, res) => {
  const { cartItems, shippingAddress } = req.body;
  if (!cartItems?.length) return res.status(400).json({ message: "Your bag is empty." });

  // MVP: one order per listing item (matches ReStyle's one-of-a-kind secondhand inventory —
  // there's no "quantity 5" for a single pre-loved jacket). Extend to multi-item baskets
  // by creating one Order per seller if you allow mixed-seller carts.
  const item = cartItems[0];
  const listing = await Listing.findById(item.listingId).populate("sellerId");
  if (!listing || listing.status !== "active") {
    return res.status(400).json({ message: "This item is no longer available." });
  }

  const deliveryFee = listing.price >= 1000 ? 0 : 50;
  const total = listing.price + deliveryFee;
  const platformFee = Math.round(listing.price * (PLATFORM_FEE_PERCENT / 100));
  const sellerPayout = listing.price - platformFee;

  const order = await Order.create({
    buyerId: req.user.id,
    sellerId: listing.sellerId._id,
    listingId: listing._id,
    itemTitle: listing.title,
    itemImage: listing.imageUrls[0],
    price: total,
    deliveryFee,
    platformFeePercent: PLATFORM_FEE_PERCENT,
    platformFee,
    sellerPayout,
    shippingAddress,
    status: "pending_payment",
    delivery: { inspectionWindowDays: INSPECTION_WINDOW_DAYS },
  });

  const razorpayOrder = await createRazorpayOrder(total, order._id.toString());
  order.payment = { razorpayOrderId: razorpayOrder.id };
  await order.save();

  res.status(201).json({
    order,
    razorpayOrderId: razorpayOrder.id,
    amount: razorpayOrder.amount,
    keyId: process.env.RAZORPAY_KEY_ID,
  });
});

// POST /api/orders/:id/verify — called from the Razorpay success handler in Checkout.tsx.
// This is the "funds enter escrow" transition: pending_payment -> escrow_held.
router.post("/:id/verify", requireAuth, async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  const order = await Order.findOne({ _id: req.params.id, buyerId: req.user.id });
  if (!order) return res.status(404).json({ message: "Order not found." });

  const valid = verifySignature({ razorpay_order_id, razorpay_payment_id, razorpay_signature });
  if (!valid) return res.status(400).json({ message: "Payment verification failed." });

  order.status = "escrow_held";
  order.payment.razorpayPaymentId = razorpay_payment_id;
  order.payment.razorpaySignature = razorpay_signature;
  order.payment.capturedAt = new Date();
  order.escrow.heldAt = new Date();
  await order.save();

  await Listing.findByIdAndUpdate(order.listingId, { status: "sold" });
  // TODO: notify seller (email/push) — "You made a sale, ship within 3 days."

  res.json({ order });
});

// POST /api/orders/:id/ship — seller marks shipped with tracking info (SellerOrders.tsx).
router.post("/:id/ship", requireAuth, async (req, res) => {
  const { trackingNumber, carrier } = req.body;
  const order = await Order.findOne({ _id: req.params.id, sellerId: req.user.id });
  if (!order) return res.status(404).json({ message: "Order not found." });
  if (order.status !== "escrow_held") {
    return res.status(400).json({ message: `Can't ship an order in status "${order.status}".` });
  }

  order.status = "shipped";
  order.shipping = { trackingNumber, carrier, shippedAt: new Date() };
  await order.save();
  // TODO: notify buyer — "Your item shipped."

  res.json({ order });
});

// POST /api/orders/:id/mark-received — buyer confirms delivery (Orders.tsx).
// Starts the inspection window that the auto-release cron job watches.
router.post("/:id/mark-received", requireAuth, async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, buyerId: req.user.id });
  if (!order) return res.status(404).json({ message: "Order not found." });
  if (order.status !== "shipped") {
    return res.status(400).json({ message: `Can't confirm an order in status "${order.status}".` });
  }

  const windowDays = order.delivery?.inspectionWindowDays ?? INSPECTION_WINDOW_DAYS;
  order.status = "delivered";
  order.delivery.markedReceivedAt = new Date();
  order.delivery.autoReleaseAt = new Date(Date.now() + windowDays * 24 * 60 * 60 * 1000);
  await order.save();

  res.json({ order });
});

// POST /api/orders/:id/dispute — buyer raises an issue inside the inspection window.
router.post("/:id/dispute", requireAuth, async (req, res) => {
  const { reason } = req.body;
  const order = await Order.findOne({ _id: req.params.id, buyerId: req.user.id });
  if (!order) return res.status(404).json({ message: "Order not found." });
  if (order.status !== "delivered") {
    return res.status(400).json({ message: "You can only raise a dispute after confirming delivery and before the window closes." });
  }

  order.status = "disputed";
  order.dispute = { raisedAt: new Date(), reason };
  await order.save();
  // TODO: notify admin queue + seller — payout is now on hold.

  res.json({ order });
});

// POST /api/orders/:id/resolve — admin resolves a dispute either way.
router.post("/:id/resolve", requireAuth, requireAdmin, async (req, res) => {
  const { resolution, adminNote } = req.body; // "refund" | "release"
  const order = await Order.findById(req.params.id);
  if (!order || order.status !== "disputed") {
    return res.status(400).json({ message: "No active dispute on this order." });
  }

  if (resolution === "refund") {
    await refundPayment(order.payment.razorpayPaymentId, order.price);
    order.status = "refunded";
  } else {
    await releaseEscrowToSeller(order);
    order.status = "completed";
  }
  order.dispute.resolvedAt = new Date();
  order.dispute.resolution = resolution;
  order.dispute.adminNote = adminNote;
  await order.save();

  res.json({ order });
});

// GET /api/orders/mine — buyer's order list (Orders.tsx)
router.get("/mine", requireAuth, async (req, res) => {
  const orders = await Order.find({ buyerId: req.user.id }).sort({ createdAt: -1 });
  res.json({ orders });
});

// GET /api/orders/selling — seller's incoming sales (SellerOrders.tsx)
router.get("/selling", requireAuth, async (req, res) => {
  const orders = await Order.find({ sellerId: req.user.id }).sort({ createdAt: -1 });
  res.json({ orders });
});

router.get("/:id", requireAuth, async (req, res) => {
  const order = await Order.findOne({
    _id: req.params.id,
    $or: [{ buyerId: req.user.id }, { sellerId: req.user.id }],
  });
  if (!order) return res.status(404).json({ message: "Order not found." });
  res.json({ order });
});

// Shared by the /resolve route and the auto-release cron job (jobs/autoReleaseEscrow.js).
async function releaseEscrowToSeller(order) {
  const seller = await User.findById(order.sellerId);
  if (!seller?.razorpayLinkedAccountId) {
    throw new Error(`Seller ${order.sellerId} has no linked payout account — cannot release funds.`);
  }
  const transfer = await transferToSeller({
    paymentId: order.payment.razorpayPaymentId,
    linkedAccountId: seller.razorpayLinkedAccountId,
    amountInRupees: order.sellerPayout,
    notes: { orderId: order._id.toString() },
  });
  order.escrow.transferId = transfer.id;
  order.escrow.releasedAt = new Date();
}

module.exports = router;
module.exports.releaseEscrowToSeller = releaseEscrowToSeller;
