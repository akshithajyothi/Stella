# ReStyle Backend - Escrow Order System

Express + MongoDB + Razorpay backend for ReStyle marketplace with secure escrow payment flow.

## Quick Start

### Prerequisites
- Node.js 16+ installed
- MongoDB running locally or connection URI
- Razorpay test account

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```bash
cp .env.example .env
```

3. Configure environment variables in `.env`:
```env
MONGODB_URI=mongodb://localhost:27017/restyle
JWT_SECRET=your-secret-key-change-in-production
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxx
PORT=4000
FRONTEND_URL=http://localhost:5173
```

4. Start the server:
```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

5. Verify it's running:
```bash
curl http://localhost:4000/health
```

Should return:
```json
{"status":"ok","timestamp":"2024-..."}
```

## API Endpoints

### Orders
- `POST /api/orders` - Create order + Razorpay order
- `POST /api/orders/:id/verify` - Verify payment (escrow capture)
- `POST /api/orders/:id/ship` - Seller marks shipped
- `POST /api/orders/:id/mark-received` - Buyer confirms delivery
- `POST /api/orders/:id/dispute` - Buyer raises dispute
- `POST /api/orders/:id/resolve` - Admin resolves dispute
- `GET /api/orders/mine` - Buyer's orders
- `GET /api/orders/selling` - Seller's orders
- `GET /api/orders/:id` - Single order details

### System
- `GET /health` - Health check

## Architecture

### Models
- **Order.js** - Complete order state machine with escrow tracking
- **User.js** - User model with `razorpayLinkedAccountId` for payouts
- **Listing.js** - Product listing model

### Services
- **razorpay.js** - All payment gateway interactions isolated here

### Jobs
- **autoReleaseEscrow.js** - Cron job that auto-pays sellers after inspection window

### Middleware
- **auth.js** - JWT authentication (needs wiring to your auth system)

## Order Flow

```
1. Buyer places order
   └─> Status: pending_payment
   
2. Buyer pays via Razorpay
   └─> Status: escrow_held (money in escrow)
   
3. Seller ships with tracking
   └─> Status: shipped
   
4. Buyer confirms delivery
   └─> Status: delivered (3-day inspection window starts)
   
5. Either:
   a) No dispute + 3 days pass → Auto-release cron runs
      └─> Status: completed (seller paid)
      
   b) Buyer raises dispute
      └─> Status: disputed → Admin resolves → refunded or completed
```

## Testing with Razorpay Test Mode

Use these test credentials in Razorpay Checkout:
- Card: `4111 1111 1111 1111`
- Expiry: Any future date
- CVV: Any 3 digits
- OTP: `123456`

## Important Notes

### 🚨 Auth Middleware is a Placeholder
`middleware/auth.js` needs to be connected to your real authentication system. Currently it just verifies JWT tokens but doesn't load actual users.

### 🚨 Seller Payout Requires Linked Accounts
Before a seller can receive payouts, they need:
1. A Razorpay Linked Account created via API
2. KYC completion in Razorpay dashboard
3. `razorpayLinkedAccountId` stored in their User document

See `CRITICAL_GAPS_AND_TODOS.md` for implementation details.

### 🚨 Email Notifications are TODO
All `// TODO: notify` comments indicate where email sending should be added.

## Development Tips

### Manually Trigger Auto-Release (Testing)

Add this route temporarily to `server.js`:
```javascript
app.post("/api/admin/test-auto-release", async (req, res) => {
  const result = await autoReleaseEscrow.run();
  res.json(result);
});
```

Then trigger:
```bash
curl -X POST http://localhost:4000/api/admin/test-auto-release
```

### View Orders in MongoDB

```bash
mongosh
use restyle
db.orders.find().pretty()
db.orders.find({ status: "delivered" })
db.orders.find({ sellerId: ObjectId("...") })
```

### Check Auto-Release Eligible Orders

```bash
db.orders.find({
  status: "delivered",
  "delivery.autoReleaseAt": { $lte: new Date() }
})
```

## Error Handling

Common errors and solutions:

**"Seller has no linked payout account"**
- Seller needs `razorpayLinkedAccountId` in User model
- See seller onboarding section in `CRITICAL_GAPS_AND_TODOS.md`

**"Payment verification failed"**
- Check `RAZORPAY_KEY_SECRET` is correct
- Ensure signature is being passed correctly from frontend

**"Order not found"**
- Check user is authenticated (req.user exists)
- Verify order ID is valid MongoDB ObjectId
- Ensure user is buyer or seller of that order

**CORS errors**
- Check `FRONTEND_URL` matches your frontend dev server
- Ensure `credentials: "include"` in frontend fetch calls

## Production Deployment

Before deploying:

1. **Set secure JWT_SECRET** (not "your-secret-key")
2. **Use production MongoDB** (MongoDB Atlas recommended)
3. **Switch to Razorpay live keys** (after account approval)
4. **Set NODE_ENV=production**
5. **Configure real FRONTEND_URL** (your production domain)
6. **Add rate limiting** (express-rate-limit)
7. **Set up monitoring** (PM2, New Relic, DataDog)
8. **Configure webhooks** in Razorpay dashboard
9. **Add logging service** (Winston + CloudWatch/Papertrail)
10. **Run behind reverse proxy** (nginx) with HTTPS

See `ESCROW_CHECKOUT_SETUP.md` for complete setup guide.

## Support

For issues:
- Backend code: Check this README and docs
- Razorpay integration: https://razorpay.com/docs/
- MongoDB: https://docs.mongodb.com/

## License

Private project
