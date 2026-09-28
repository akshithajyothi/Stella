# ReStyle — Escrow Checkout & Order Flow

Implements the flow from the diagram: **Checkout → Payment → Escrow held → Seller ships →
Buyer confirms → Auto-release or Dispute → Payout**.

## What's here

```
frontend/src/
  lib/api/orders.ts          typed API client + Order/OrderStatus types (source of truth
                              for the status union — keep in sync with backend/models/Order.js)
  components/
    OrderStatusBadge.tsx      colored status pill used on both order pages
  pages/
    Checkout.tsx              new — address form, order summary, opens Razorpay Checkout
    OrderConfirmation.tsx     new — post-payment success screen
    Orders.tsx                new — buyer's "My Orders": mark received / raise dispute
    SellerOrders.tsx          new — seller's "My Sales": mark shipped with tracking

backend/
  models/Order.js             the state machine, as a Mongoose schema
  routes/orders.js            every transition as an endpoint (create, verify, ship,
                               mark-received, dispute, resolve)
  services/razorpay.js        the only file that talks to the payment gateway
  jobs/autoReleaseEscrow.js   the "no dispute after N days" auto-payout job
  middleware/auth.js          stub — wire to your real auth
  server.js                   wiring example
```

## Wiring into your existing app

1. **Routing** — add to your router:
   ```tsx
   <Route path="/checkout" element={<Checkout />} />
   <Route path="/order-confirmation/:orderId" element={<OrderConfirmation />} />
   <Route path="/orders" element={<Orders />} />
   <Route path="/selling" element={<SellerOrders />} />
   ```
   Point Cart.tsx's existing "PROCEED TO CHECKOUT" button at `/checkout` instead of wherever
   it currently goes (per your page guide it doesn't have a destination yet).

2. **Cart context** — `Checkout.tsx` assumes a `useCart()` hook exposing `items`, `subtotal`,
   `clearCart()`. Adjust the import path and field names to match your actual `CartContext`.

3. **Backend models** — `routes/orders.js` assumes `Listing` (with `sellerId`, `price`,
   `imageUrls`, `status`) and `User` (with `razorpayLinkedAccountId`) models already exist.
   Rename fields to match your real schema.

4. **Env vars** (`.env` on the backend):
   ```
   RAZORPAY_KEY_ID=...
   RAZORPAY_KEY_SECRET=...
   MONGODB_URI=...
   JWT_SECRET=...
   ```
   Frontend (`.env`): `VITE_API_BASE_URL=http://localhost:4000/api`

5. **Install:**
   - Backend: `npm i express mongoose razorpay cookie-parser jsonwebtoken node-cron dotenv`
   - Frontend: no new package — Razorpay Checkout loads via the script tag in `Checkout.tsx`.

## The one manual step this doesn't cover: seller payout accounts

Razorpay Route can only pay a seller once that seller has a **Linked Account** (their bank
details, verified through Razorpay's onboarding — this is what makes the payout legal and
traceable, not a workaround). That means you need a seller onboarding step — during signup or
before their first listing goes live — that calls Razorpay's Linked Account API and stores the
returned `razorpayLinkedAccountId` on the `User` document. Until a seller has that, `ship`
still works, but `autoReleaseEscrow` will fail for their orders (it logs and retries rather
than losing the money). This is genuinely the biggest missing piece — worth building before
the rest of this goes live, everything else here already assumes it exists.

## Where the platform fee is actually decided

`platformFeePercent` in `routes/orders.js` (currently a flat 10%) is stored on the order at
creation time, not recomputed later — so if you change the fee schedule next month, past
orders still pay out at the rate the seller agreed to when they made the sale.

## What's stubbed, not faked

Every `// TODO: notify ...` comment is a real notification you'll want (email/push) but isn't
wired to a provider here — the state machine and money movement are real, notifications are
just not implemented yet.
