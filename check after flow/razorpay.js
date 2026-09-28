// backend/services/razorpay.js
// Thin wrapper around the Razorpay SDK. All escrow money-movement goes through here so
// there is exactly one place that talks to the payment gateway.
const Razorpay = require("razorpay");
const crypto = require("crypto");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// amountInRupees -> Razorpay order. Razorpay works in paise, so multiply by 100.
async function createRazorpayOrder(amountInRupees, receiptId) {
  return razorpay.orders.create({
    amount: Math.round(amountInRupees * 100),
    currency: "INR",
    receipt: receiptId,
    payment_capture: 1, // auto-capture on success; funds land in your Razorpay/escrow balance
  });
}

// Confirms the payment actually came from Razorpay and wasn't spoofed client-side.
function verifySignature({ razorpay_order_id, razorpay_payment_id, razorpay_signature }) {
  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");
  return expected === razorpay_signature;
}

// The actual escrow release: split the captured payment and transfer the seller's share
// to their Linked Account via Razorpay Route. This is what "pays the seller" means.
async function transferToSeller({ paymentId, linkedAccountId, amountInRupees, notes }) {
  return razorpay.payments.transfer(paymentId, {
    transfers: [
      {
        account: linkedAccountId,
        amount: Math.round(amountInRupees * 100),
        currency: "INR",
        notes,
        on_hold: false,
      },
    ],
  });
}

// Full refund back to the buyer's original payment method — used when a dispute
// resolves in the buyer's favor.
async function refundPayment(paymentId, amountInRupees) {
  return razorpay.payments.refund(paymentId, {
    amount: Math.round(amountInRupees * 100),
  });
}

module.exports = { createRazorpayOrder, verifySignature, transferToSeller, refundPayment };
