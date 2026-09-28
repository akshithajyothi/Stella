# Critical Gaps & Production Readiness Checklist

This document outlines what's **missing** or **stubbed** in the escrow checkout implementation, and what you need to complete before going live.

---

## 🚨 CRITICAL - BLOCKS PRODUCTION

### 1. Seller Payout Account Onboarding (HIGHEST PRIORITY)

**Status:** ❌ NOT IMPLEMENTED

**The Problem:**
The entire payout system depends on sellers having a `razorpayLinkedAccountId` stored in their User document. This ID comes from Razorpay's Linked Account API and represents the seller's verified bank account. **Without this, no seller can ever receive payment.**

**What Fails:**
- `autoReleaseEscrow.js` cron job throws error
- Admin dispute resolution with "release" fails
- Error message: `"Seller has no linked payout account — cannot release funds"`

**What's Needed:**

1. **Create Seller Onboarding Page** (`/seller-onboarding` or in Profile)
   - Form to collect seller details (if not already in User model):
     - Legal business name (or personal name)
     - Business type (individual / partnership / company)
     - Business category
     - Bank account details
     - PAN card (India KYC requirement)
     - Address proof

2. **Backend Endpoint** (`POST /api/sellers/create-linked-account`)
   ```javascript
   const Razorpay = require("razorpay");
   const razorpay = new Razorpay({ key_id, key_secret });

   // Call Razorpay Linked Account API
   const account = await razorpay.accounts.create({
     email: seller.email,
     phone: seller.phone,
     legal_business_name: seller.name,
     business_type: "individual",
     contact_name: seller.name,
     profile: {
       category: "fashion",
       subcategory: "clothing",
       addresses: {
         registered: {
           street: seller.address.street,
           city: seller.address.city,
           state: seller.address.state,
           postal_code: seller.address.postalCode,
           country: "IN"
         }
       }
     },
     legal_info: {
       pan: seller.panCard,  // Required for India
       gst: seller.gstNumber  // Optional
     }
   });

   // Save to database
   await User.findByIdAndUpdate(seller._id, {
     razorpayLinkedAccountId: account.id
   });
   ```

3. **KYC Completion Flow**
   - After creating linked account, seller must complete KYC through Razorpay
   - Add UI to show KYC status
   - Poll or use webhooks to check when approved
   - Block selling (or at least payouts) until KYC complete

4. **Reference Documentation:**
   - Razorpay Route: https://razorpay.com/docs/payments/route/
   - Linked Accounts: https://razorpay.com/docs/api/route/#create-an-account

**Temporary Testing Workaround:**
Manually insert a test linked account ID in MongoDB:
```javascript
db.users.updateOne(
  { email: "seller@test.com" },
  { $set: { razorpayLinkedAccountId: "acc_test_xxxxx" } }
);
```

---

### 2. Authentication System Not Wired

**Status:** ⚠️ PLACEHOLDER ONLY

**The Problem:**
`backend/middleware/auth.js` is a stub that checks for JWT tokens but doesn't integrate with your actual auth system.

**What's Stubbed:**
```javascript
// Current placeholder code
function requireAuth(req, res, next) {
  const token = req.cookies?.token || req.headers.authorization?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ message: "Authentication required" });
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Assumes { id, email, ... }
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
}
```

**What's Needed:**

1. **Determine Your Auth Strategy:**
   - JWT tokens in cookies? ✓ (already assumes this)
   - JWT in Authorization header? ✓ (already assumes this)
   - Session-based auth? (needs different approach)
   - OAuth/Social login? (additional complexity)

2. **Wire to Real User Model:**
   - Ensure decoded JWT contains `userId` or `id`
   - Load full user from database if needed:
     ```javascript
     const user = await User.findById(decoded.id);
     if (!user) return res.status(401).json({ message: "User not found" });
     req.user = user;
     ```

3. **Test Coverage:**
   - Verify all order endpoints require auth
   - Test expired tokens are rejected
   - Test invalid signatures are rejected

4. **Admin Auth:**
   - `requireAdmin()` checks `req.user.isAdmin`
   - Add `isAdmin` boolean to User model
   - Protect `/api/orders/:id/resolve` with this

---

### 3. Cart-to-Listing Integration Mismatch

**Status:** ⚠️ FRAGILE MAPPING

**The Problem:**
The frontend cart uses different field names than what the backend expects:

| Frontend Cart | Backend Order |
|---------------|---------------|
| `id` (number) | `listingId` (ObjectId string) |
| `name` | `itemTitle` |
| `image` | `itemImage` |
| No seller info | Needs `sellerId` from Listing |

**Current Workaround:**
`Checkout.tsx` does:
```typescript
cartItems.map(i => ({ 
  listingId: i.id.toString(),  // ⚠️ Converts cart ID to listingId
  quantity: i.quantity 
}))
```

This only works if cart IDs match listing IDs, which is **not guaranteed**.

**What's Needed:**

**Option A: Add Listing Fields to Cart Items**
Update `CartContext.tsx`:
```typescript
export interface CartItem {
  id: number;          // Keep for cart operations
  listingId: string;   // ✅ Add: MongoDB ObjectId of listing
  sellerId: string;    // ✅ Add: MongoDB ObjectId of seller
  name: string;
  price: number;
  quantity: number;
  image: string;
  // ... other fields
}
```

When adding to cart from Product page:
```typescript
addToCart({
  id: listing.id,
  listingId: listing._id,    // ✅ Pass MongoDB ID
  sellerId: listing.sellerId, // ✅ Pass seller ID
  name: listing.title,
  price: listing.price,
  image: listing.imageUrls[0],
  // ...
});
```

**Option B: Fetch Listing Data at Checkout**
In `Checkout.tsx`, before creating order:
```typescript
// Fetch full listing details for each cart item
const listingPromises = cartItems.map(item => 
  fetch(`/api/listings/${item.id}`)
);
const listings = await Promise.all(listingPromises);

// Create orders with real listing data
const { order } = await createOrder({
  cartItems: listings.map(l => ({
    listingId: l._id,
    quantity: 1  // Pre-loved items are always quantity 1
  })),
  shippingAddress
});
```

**Recommendation:** Use Option A - cleaner and more efficient.

---

## ⚠️ IMPORTANT - NEEDED FOR GOOD UX

### 4. Email Notifications

**Status:** ❌ NOT IMPLEMENTED (TODO comments in code)

**What's Missing:**
All order state transitions should send emails, but currently don't:

| Event | Who Gets Email | Status |
|-------|----------------|--------|
| Order placed | Seller | ❌ `// TODO: notify seller` |
| Payment held | Buyer (confirmation) | ❌ |
| Item shipped | Buyer | ❌ `// TODO: notify buyer` |
| Delivery confirmed | Seller | ❌ |
| Auto-payout released | Seller | ❌ `// TODO: notify seller` |
| Dispute raised | Seller + Admin | ❌ `// TODO: notify admin + seller` |
| Dispute resolved | Buyer + Seller | ❌ |

**What's Needed:**

1. **Choose Email Service:**
   - SendGrid (recommended for transactional emails)
   - AWS SES (if already on AWS)
   - Mailgun
   - Postmark

2. **Add Email Service to Backend:**
   ```bash
   npm install @sendgrid/mail
   ```

   ```javascript
   // backend/services/email.js
   const sgMail = require('@sendgrid/mail');
   sgMail.setApiKey(process.env.SENDGRID_API_KEY);

   async function sendOrderConfirmation(order, buyer, seller) {
     await sgMail.send({
       to: seller.email,
       from: 'orders@restyle.com',
       subject: 'New Order - Ship within 3 days',
       text: `You sold ${order.itemTitle} for ₹${order.sellerPayout}...`,
       html: `<p>You sold <strong>${order.itemTitle}</strong>...</p>`
     });
   }
   ```

3. **Add Email Templates:**
   - Create HTML email templates
   - Include order details, tracking links, CTA buttons
   - Match ReStyle brand design

4. **Call in Order Routes:**
   Replace all `// TODO: notify` with actual email calls:
   ```javascript
   // In routes/orders.js after escrow_held transition
   const buyer = await User.findById(order.buyerId);
   const seller = await User.findById(order.sellerId);
   await sendOrderConfirmation(order, buyer, seller);
   ```

---

### 5. Admin Dispute Resolution UI

**Status:** ❌ BACKEND ONLY, NO UI

**What Exists:**
Backend endpoint: `POST /api/orders/:id/resolve`
```javascript
{
  "resolution": "refund",  // or "release"
  "adminNote": "Refund approved - item not as described"
}
```

**What's Missing:**
- No admin panel to view disputed orders
- No UI to resolve disputes
- No workflow for admin review

**What's Needed:**

1. **Admin Dashboard Page** (`/admin/disputes`)
   ```typescript
   // List all disputed orders
   const disputes = await fetch('/api/orders?status=disputed');
   
   // Show order details, buyer reason, evidence
   // UI buttons: "Refund Buyer" | "Release to Seller"
   ```

2. **Admin Authentication:**
   - Add `isAdmin` field to User model
   - Protect `/admin/*` routes
   - Use `requireAdmin` middleware

3. **Evidence Collection:**
   - Allow buyers to upload photos when disputing
   - Store in cloud storage (AWS S3, Cloudinary)
   - Display in admin panel

4. **Communication Thread:**
   - Let admin ask for more info
   - Notify buyer/seller of admin questions
   - Store messages in Order.dispute.messages array

---

### 6. Webhook Integration for Razorpay Events

**Status:** ❌ NOT IMPLEMENTED

**The Problem:**
Currently relying entirely on client-side success callback. If user closes browser before `verifyPayment()` completes, order could be stuck in `pending_payment` even though money was captured.

**What's Needed:**

1. **Add Webhook Endpoint** (`POST /api/webhooks/razorpay`)
   ```javascript
   router.post('/webhooks/razorpay', async (req, res) => {
     const signature = req.headers['x-razorpay-signature'];
     
     // Verify webhook signature
     const isValid = verifyWebhookSignature(req.body, signature);
     if (!isValid) return res.status(400).send('Invalid signature');
     
     const { event, payload } = req.body;
     
     if (event === 'payment.captured') {
       // Find order by razorpayOrderId
       const order = await Order.findOne({
         'payment.razorpayOrderId': payload.order.entity.id
       });
       
       if (order && order.status === 'pending_payment') {
         // Transition to escrow_held (same as verify endpoint)
         order.status = 'escrow_held';
         order.payment.razorpayPaymentId = payload.payment.entity.id;
         order.payment.capturedAt = new Date();
         order.escrow.heldAt = new Date();
         await order.save();
         
         await Listing.findByIdAndUpdate(order.listingId, { status: 'sold' });
       }
     }
     
     res.json({ received: true });
   });
   ```

2. **Configure in Razorpay Dashboard:**
   - Go to Settings → Webhooks
   - Add webhook URL: `https://yourdomain.com/api/webhooks/razorpay`
   - Subscribe to events:
     - `payment.captured`
     - `payment.failed`
     - `transfer.processed` (for payout confirmation)
     - `transfer.failed`

3. **Benefits:**
   - Catch payments even if user closes browser
   - Get notified of payment failures
   - Track transfer completion/failure

---

## 📋 NICE TO HAVE - FUTURE ENHANCEMENTS

### 7. Order History Pagination

**Current:** `GET /api/orders/mine` returns ALL orders
**Problem:** Will be slow once users have hundreds of orders
**Solution:** Add pagination params: `?page=1&limit=20`

### 8. Order Search & Filters

Allow users to filter orders by:
- Status (shipped, delivered, completed, etc.)
- Date range
- Price range
- Search by item name

### 9. Order Cancellation

Currently no way for buyer to cancel before payment or immediately after.
Add `POST /api/orders/:id/cancel` with refund logic.

### 10. Partial Refunds

Currently refunds are all-or-nothing. Consider:
- Partial refunds (item damaged but usable)
- Restocking fees
- Return shipping costs

### 11. Multi-Item Orders

Current: One order per item
Future: Support baskets with multiple items from multiple sellers
Challenge: Split payment, separate escrow per seller

### 12. Real-Time Order Status Updates

Use WebSockets or Server-Sent Events to push status updates to frontend:
```typescript
// Buyer sees "Seller marked as shipped" toast notification in real-time
```

### 13. Order Invoice Generation

Generate PDF invoices for completed orders:
- Buyer invoice (for records)
- Seller invoice (for taxes)

### 14. Delivery Tracking Integration

Integrate with Delhivery/BlueDart API to:
- Fetch real tracking status
- Auto-mark as delivered when tracking shows delivery
- Show live tracking map

### 15. Automated Reminders

Cron jobs for:
- Remind seller to ship if 2 days passed
- Remind buyer to confirm delivery
- Remind buyer that inspection window closing soon

---

## Testing Checklist Before Production

- [ ] Seller onboarding flow works end-to-end
- [ ] Real Razorpay linked accounts tested (after KYC approval)
- [ ] Auth system properly integrated (no placeholder code)
- [ ] Email notifications working for all events
- [ ] Webhooks configured and tested
- [ ] Admin panel accessible only to admins
- [ ] Test all order state transitions:
  - [ ] Place order → escrow_held
  - [ ] Ship order → shipped
  - [ ] Confirm delivery → delivered
  - [ ] Auto-release → completed
  - [ ] Raise dispute → disputed
  - [ ] Admin refund → refunded
  - [ ] Admin release → completed
- [ ] Error handling works (network failures, API errors, etc.)
- [ ] CORS configured for production domain
- [ ] Environment variables set in production
- [ ] MongoDB indexes created for performance:
  ```javascript
  db.orders.createIndex({ buyerId: 1, createdAt: -1 });
  db.orders.createIndex({ sellerId: 1, createdAt: -1 });
  db.orders.createIndex({ status: 1 });
  db.orders.createIndex({ "delivery.autoReleaseAt": 1 });
  ```
- [ ] Rate limiting added to prevent abuse
- [ ] Logging configured (Winston, Pino, etc.)
- [ ] Error tracking service integrated (Sentry, Rollbar, etc.)
- [ ] Load testing performed
- [ ] Security audit completed

---

## Summary

**Must Fix Before Launch:**
1. ✅ Seller payout account onboarding (CRITICAL)
2. ✅ Real authentication integration
3. ✅ Cart-to-listing field mapping

**Should Fix Before Launch:**
4. ✅ Email notifications
5. ✅ Admin dispute resolution UI
6. ✅ Razorpay webhooks

**Can Add Later:**
7-15. Pagination, search, cancellation, multi-item, real-time updates, etc.

The codebase is **structurally complete** but has **critical integration gaps** that block real-world use. Focus on items 1-3 first, then 4-6, before considering production deployment.
