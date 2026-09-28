// backend/models/Order.js
const mongoose = require("mongoose");

const ORDER_STATUSES = [
  "pending_payment", // order row created, buyer hasn't paid yet
  "escrow_held",      // payment captured into escrow/nodal account, seller notified
  "shipped",          // seller added tracking info
  "delivered",        // buyer confirmed receipt, inspection window running
  "disputed",         // buyer raised an issue inside the inspection window
  "completed",        // payout released to seller — terminal
  "refunded",          // admin resolved dispute in buyer's favor — terminal
  "cancelled",         // payment never completed / buyer cancelled before payment
];

const shippingAddressSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    line1: { type: String, required: true },
    line2: String,
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    phone: { type: String, required: true },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    buyerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    listingId: { type: mongoose.Schema.Types.ObjectId, ref: "Listing", required: true },

    itemTitle: { type: String, required: true },
    itemImage: { type: String, required: true },
    price: { type: Number, required: true },
    deliveryFee: { type: Number, default: 0 },

    // Commission model: platform keeps platformFee, seller receives sellerPayout.
    // Kept as separate stored fields (not computed at payout time) so a later fee-schedule
    // change never alters the amount already promised to buyer/seller for this order.
    platformFeePercent: { type: Number, default: 10 },
    platformFee: { type: Number, required: true },
    sellerPayout: { type: Number, required: true },

    status: { type: String, enum: ORDER_STATUSES, default: "pending_payment", index: true },
    shippingAddress: { type: shippingAddressSchema, required: true },

    payment: {
      razorpayOrderId: String,
      razorpayPaymentId: String,
      razorpaySignature: String,
      capturedAt: Date,
    },

    escrow: {
      heldAt: Date,
      // Linked account (Razorpay Route) that receives the seller's share on release.
      sellerLinkedAccountId: String,
      transferId: String, // Route transfer id, set once payout completes
      releasedAt: Date,
    },

    shipping: {
      carrier: String,
      trackingNumber: String,
      shippedAt: Date,
    },

    delivery: {
      markedReceivedAt: Date,
      inspectionWindowDays: { type: Number, default: 3 },
      autoReleaseAt: Date, // markedReceivedAt + inspectionWindowDays; the cron job's cutoff
    },

    dispute: {
      raisedAt: Date,
      reason: String,
      resolvedAt: Date,
      resolution: { type: String, enum: ["refund", "release"] },
      adminNote: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
module.exports.ORDER_STATUSES = ORDER_STATUSES;
