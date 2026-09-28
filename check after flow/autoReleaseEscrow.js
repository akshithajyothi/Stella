// backend/jobs/autoReleaseEscrow.js
// This is the "No / window expires" branch of the flow: if a buyer marks an item received
// and never raises a dispute, the money shouldn't sit in escrow forever — release it once
// the inspection window passes. Run this on a schedule (see server.js) or as a serverless
// cron (Vercel Cron / AWS EventBridge) hitting a protected endpoint that calls run().
const Order = require("../models/Order");
const { releaseEscrowToSeller } = require("../routes/orders");

async function run() {
  const dueOrders = await Order.find({
    status: "delivered",
    "delivery.autoReleaseAt": { $lte: new Date() },
  });

  let released = 0;
  let failed = 0;

  for (const order of dueOrders) {
    try {
      await releaseEscrowToSeller(order);
      order.status = "completed";
      await order.save();
      released += 1;
      // TODO: notify seller — "You've been paid."
    } catch (err) {
      failed += 1;
      console.error(`Auto-release failed for order ${order._id}:`, err.message);
      // Left in "delivered" status so it's retried next run; alert ops if this repeats.
    }
  }

  console.log(`Auto-release run: ${released} released, ${failed} failed, ${dueOrders.length} checked.`);
  return { released, failed, checked: dueOrders.length };
}

module.exports = { run };
