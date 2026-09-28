// backend/models/Order.js
// Deliberately simple for a buyer-side prototype: no escrow, no shipping/dispute states.
const db = require("../db");

function serialize(row) {
  if (!row) return null;
  const { user_id, shipping_address, delivery_fee, razorpay_payment_link_id, razorpay_payment_link_url, created_at, ...rest } = row;
  return {
    ...rest,
    userId: user_id,
    items: JSON.parse(row.items),
    shippingAddress: JSON.parse(shipping_address),
    deliveryFee: delivery_fee,
    razorpayPaymentLinkId: razorpay_payment_link_id,
    razorpayPaymentLinkUrl: razorpay_payment_link_url,
    createdAt: created_at,
  };
}

const Order = {
  create({ userId, items, shippingAddress, subtotal, deliveryFee, total }) {
    const info = db
      .prepare(
        `INSERT INTO orders (user_id, items, shipping_address, subtotal, delivery_fee, total)
         VALUES (?, ?, ?, ?, ?, ?)`
      )
      .run(userId, JSON.stringify(items), JSON.stringify(shippingAddress), subtotal, deliveryFee, total);
    return Order.findById(info.lastInsertRowid);
  },
  findById(id) {
    return serialize(db.prepare(`SELECT * FROM orders WHERE id = ?`).get(id));
  },
  findByUser(userId) {
    return db
      .prepare(`SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC`)
      .all(userId)
      .map(serialize);
  },
  setPaymentLink(id, { razorpayPaymentLinkId, razorpayPaymentLinkUrl }) {
    db.prepare(
      `UPDATE orders SET razorpay_payment_link_id = ?, razorpay_payment_link_url = ? WHERE id = ?`
    ).run(razorpayPaymentLinkId, razorpayPaymentLinkUrl, id);
    return Order.findById(id);
  },
  setStatus(id, status) {
    db.prepare(`UPDATE orders SET status = ? WHERE id = ?`).run(status, id);
    return Order.findById(id);
  },
};

module.exports = Order;
