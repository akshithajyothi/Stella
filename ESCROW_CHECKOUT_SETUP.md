# Escrow Checkout & Order Flow - Setup Guide

This document provides complete instructions for setting up and testing the escrow-based checkout flow in ReStyle.

## Overview

The escrow system ensures secure transactions between buyers and sellers:
1. Buyer pays → Money held in escrow
2. Seller ships → Tracking info added
3. Buyer confirms receipt → Inspection window starts (3 days)
4. If no dispute → Auto-release payment to seller
5. If dispute → Admin review and resolution

## Architecture

### Backend Structure
```
backend/
├── models/
│   ├── User.js           # User model with razorpayLinkedAccountId
│   ├── Listing.js        # Product listing model
│   └── Order.js          # Order state machine
├── routes/
│   └── orders.js         # All order transition endpoints
├── services/
│   └── razorpay.js       # Payment gateway wrapper
├── jobs/
│   └── autoReleaseEscrow.js  # Cron job for auto-payouts
├── middleware/
│   └── auth.js           # Auth middleware (NEEDS WIRING)
├── .env.example          # Environment variables template
├── package.json          # Dependencies
└── server.js             # Express server setup


### Frontend Structure
```
src/
├── lib/api/
│   └── orders.ts         # TypeScript API client
├── components/
│   └── OrderStatusBadge.tsx  # Status display component
├── pages/
│   ├── Checkout.tsx      # Address form + Razorpay integration
│   ├── OrderConfirmation.tsx  # Post-payment success page
│   ├── Orders.tsx        # Buyer's order list
│   └── SellerOrders.tsx  # Seller's sales list
└── styles/
    ├── Checkout.css
    ├── OrderConfirmation.css
    └── Orders.css
```

## Installation

### 1. Backend Setup

#### Install Dependencies
```bash
cd ReStyle-project-main/backend
npm install
```

#### Configure Environment Variables
Create a `.env` file in the `backend` folder:
```bash
cp .env.example .env
```

Edit `.env` with your actual values:
```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/restyle

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Razorpay Configuration (Get from https://dashboard.razorpay.com/app/keys)
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxx

# Server Configuration
PORT=4000
FRONTEND_URL=http://localhost:5173

# Node Environment
NODE_ENV=development
```

#### Start MongoDB
Make sure MongoDB is running locally:
```bash
# macOS (with Homebrew)
brew services start mongodb-community

# Windows
# Start MongoDB as a service or run mongod.exe

# Linux
sudo systemctl start mongod
```

#### Start Backend Server
```bash
npm run dev
```

The server should start on `http://localhost:4000`. Verify with:
```
http://localhost:4000/health
```

### 2. Frontend Setup

#### Configure Environment Variables
Create a `.env` file in the root `ReStyle-project-main` folder:
```bash
cp .env.example .env
```

Content:
```env
VITE_API_BASE_URL=http://localhost:4000/api
```

#### Start Frontend Development Server
```bash
cd ReStyle-project-main
npm run dev
```

The frontend should start on `http://localhost:5173`.

## Testing the Flow

### Prerequisites
1. MongoDB running
2. Backend server running on port 4000
3. Frontend running on port 5173
4. Razorpay test account set up

### Test Workflow

#### 1. Create a Test Listing
- Navigate to `/sell`
- Fill out the form with test product details
- Submit to create a listing

#### 2. Add to Cart & Checkout
- Navigate to the product page
- Add item to cart
- Go to `/cart`
- Click "CHECKOUT" button
- Should navigate to `/checkout`

#### 3. Place Order
- Fill in shipping address on checkout page
- Click "Pay ₹{amount} securely"
- Razorpay Checkout modal should open
- Use Razorpay test card:
  - Card Number: `4111 1111 1111 1111`
  - Expiry: Any future date
  - CVV: Any 3 digits
  - Name: Any name

#### 4. Payment Verification
- After successful payment, you should be redirected to `/order-confirmation/{orderId}`
- Order status should be "Payment Held" (escrow_held)
- Check backend logs for confirmation

#### 5. Seller Ships Order
- Navigate to `/selling` (seller's view)
- Find the order with "Payment Held" status
- Click "Mark as shipped"
- Enter carrier (e.g., "Delhivery") and tracking number
- Submit

#### 6. Buyer Confirms Delivery
- Navigate to `/orders` (buyer's view)
- Find the order with "Shipped" status
- Click "Mark as received"
- Status changes to "Delivered"
- Inspection window starts (3 days)

#### 7. Auto-Release or Dispute

**Option A: No Issues (Happy Path)**
- Wait for 3 days (or manually trigger the cron job)
- Payment automatically releases to seller
- Status becomes "Completed"

**Option B: Buyer Raises Dispute**
- While status is "Delivered", click "Something's wrong"
- Enter dispute reason
- Submit dispute
- Status becomes "Disputed"
- Requires admin intervention (not yet implemented in UI)

## Current Limitations & Gaps

### 🚨 CRITICAL GAP: Seller Payout Account Onboarding

**Problem:** The `releaseEscrowToSeller()` function requires sellers to have a `razorpayLinkedAccountId` in their User document. There is currently **no UI or flow** to set this field.

**Impact:** 
- Orders can be created and marked as shipped
- But auto-release and manual payout will **fail** for all sellers
- Error: "Seller has no linked payout account — cannot release funds"

**Required Solution:**
Before this goes to production, you must implement seller onboarding:

1. Add a "Connect Payout Account" page in seller profile
2. Call Razorpay's Linked Account API:
   ```javascript
   const account = await razorpay.accounts.create({
     email: seller.email,
     phone: seller.phone,
     legal_business_name: seller.businessName || seller.name,
     business_type: "individual",
     contact_name: seller.name,
     profile: {
       category: "fashion",
       subcategory: "clothing",
       addresses: {
         registered: { /* seller's address */ }
       }
     }
   });
   ```
3. Store `account.id` in `user.razorpayLinkedAccountId`
4. Seller must complete KYC through Razorpay dashboard
5. Only after approval can they receive payouts

**Temporary Workaround for Testing:**
Manually add a test linked account ID to your seller's User document in MongoDB:
```javascript
db.users.updateOne(
  { _id: ObjectId("seller_id_here") },
  { $set: { razorpayLinkedAccountId: "acc_test_xxxxx" } }
);
```

### Other Gaps

1. **Authentication System Not Wired**
   - `backend/middleware/auth.js` is a placeholder
   - Need to connect to your actual JWT auth system
   - Currently returns mock user data

2. **No Admin Dispute Resolution UI**
   - Backend endpoint exists: `POST /api/orders/:id/resolve`
   - No frontend admin panel yet
   - Must be called via API directly

3. **Email Notifications Not Implemented**
   - All `// TODO: notify` comments in code
   - Need email service integration (SendGrid, AWS SES, etc.)

4. **Cart-to-Listing Mapping**
   - Cart items use `id` field
   - Backend expects `listingId`
   - Current implementation uses `id.toString()` as `listingId`
   - Need proper mapping when real listings are integrated

## API Endpoints

### Order Management
```
POST   /api/orders                 Create order + Razorpay order
POST   /api/orders/:id/verify       Verify payment signature
POST   /api/orders/:id/ship         Seller marks shipped
POST   /api/orders/:id/mark-received  Buyer confirms delivery
POST   /api/orders/:id/dispute      Buyer raises dispute
POST   /api/orders/:id/resolve      Admin resolves dispute
GET    /api/orders/mine             Buyer's orders
GET    /api/orders/selling          Seller's orders
GET    /api/orders/:id              Single order details
```

### Health Check
```
GET    /health                      Server health check
```

## Order Status Flow

```
pending_payment  →  [Payment verified]
    ↓
escrow_held      →  [Seller ships]
    ↓
shipped          →  [Buyer confirms]
    ↓
delivered        →  [3-day window]
    ↓
    ├── [No dispute] → completed (payout released)
    └── [Dispute raised] → disputed → [Admin resolves]
            ↓
            ├── [Refund] → refunded
            └── [Release] → completed
```

## Cron Job

The auto-release job runs every hour:
```javascript
// In server.js
cron.schedule("0 * * * *", async () => {
  await autoReleaseEscrow.run();
});
```

**Manual Trigger for Testing:**
```bash
# Add this route to server.js for testing
app.post("/api/admin/auto-release", async (req, res) => {
  const result = await autoReleaseEscrow.run();
  res.json(result);
});
```

Then call:
```bash
curl -X POST http://localhost:4000/api/admin/auto-release
```

## Troubleshooting

### Payment Verification Fails
- Check Razorpay signature calculation
- Ensure `RAZORPAY_KEY_SECRET` is correct
- Check browser console for errors

### Order Not Created
- Check MongoDB connection
- Verify listing exists and status is "active"
- Check backend logs for errors

### Auto-Release Not Working
- Verify seller has `razorpayLinkedAccountId`
- Check order's `delivery.autoReleaseAt` timestamp
- Check cron job is running (backend logs)

### CORS Errors
- Ensure `FRONTEND_URL` in backend `.env` matches frontend URL
- Check browser network tab for preflight OPTIONS requests

## Security Notes

1. **Never commit `.env` files** - They contain secrets
2. **Use test mode for development** - Razorpay keys with `rzp_test_` prefix
3. **Signature verification is critical** - Don't skip `verifySignature()` check
4. **Auth middleware needs implementation** - Current version is a placeholder
5. **Rate limiting recommended** - Add to production deployment
6. **HTTPS required in production** - Razorpay requires secure connections

## Next Steps

1. **Implement seller onboarding** (highest priority - see CRITICAL GAP above)
2. **Wire real authentication** to replace placeholder auth
3. **Add email notifications** for order state changes
4. **Build admin panel** for dispute resolution
5. **Add order history pagination** for scale
6. **Implement webhooks** for Razorpay events (payment.failed, etc.)
7. **Add refund flow UI** for admins
8. **Test with real Razorpay linked accounts** after KYC approval

## Support

For issues with:
- **Razorpay Integration**: https://razorpay.com/docs/
- **MongoDB**: https://docs.mongodb.com/
- **Express**: https://expressjs.com/

## License

Private project - all rights reserved
