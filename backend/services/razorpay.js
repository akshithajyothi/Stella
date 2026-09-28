// backend/services/razorpay.js
// Payment Links API only — one code path for both the human checkout page and the buying
// agent, since a payment link is just a URL either of them can open. No escrow/seller-payout
// APIs here; this is a buyer-side prototype.
const Razorpay = require("razorpay");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

function isConfigured() {
  return Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET && !process.env.RAZORPAY_KEY_ID.includes("xxxx"));
}

// amountInRupees -> a real, shareable Razorpay Payment Link (test mode until real keys are set).
async function createPaymentLink({ amountInRupees, orderId, customerName, customerPhone }) {
  return razorpay.paymentLink.create({
    amount: Math.round(amountInRupees * 100),
    currency: "INR",
    description: `ReStyle order #${orderId}`,
    reference_id: String(orderId),
    customer: { name: customerName, contact: customerPhone },
    notify: { sms: false, email: false },
    callback_url: `${process.env.FRONTEND_URL || "http://localhost:5173"}/order-confirmation/${orderId}`,
    callback_method: "get",
  });
}

// Polled (not webhook-based, to keep this runnable without a public callback URL) — call this
// whenever an order confirmation is viewed to pick up a payment that's since completed.
async function getPaymentLinkStatus(paymentLinkId) {
  const link = await razorpay.paymentLink.fetch(paymentLinkId);
  return link.status; // 'created' | 'paid' | 'cancelled' | 'expired'
}

module.exports = { createPaymentLink, getPaymentLinkStatus, isConfigured };
