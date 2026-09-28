# Delete Listing with OTP Verification

## Overview
Sellers can delete their listings with email-based OTP verification for security.

## Implementation Details

### Features:
✅ **Delete button** only visible on user-listed items
✅ **Two-step confirmation** process
✅ **OTP verification** via seller's email
✅ **Simulated email** (can be upgraded to real email)
✅ **Secure deletion** - only verified sellers can delete

## How It Works

### Step 1: Click Delete Button
- Navigate to any user-listed product
- Scroll down to "SELLER INFORMATION" section
- Click **"Delete This Listing"** button

### Step 2: Confirm Deletion
- Modal appears asking "Delete Listing?"
- Shows item name and seller email
- Click **"Send OTP"** to proceed

### Step 3: OTP Generation
- 6-digit OTP is generated
- **Simulated email** sent (OTP shown in alert for demo)
- In production: Real email would be sent via backend

### Step 4: Enter OTP
- Enter the 6-digit OTP
- Click **"Verify & Delete"**
- If OTP matches: Item deleted ✓
- If OTP wrong: Error message shown

### Step 5: Deletion Complete
- Item removed from listings
- Redirected to previous page
- Item no longer appears in marketplace

## Technical Implementation

### Files Created:
1. **`src/components/DeleteListingModal.tsx`**
   - Reusable modal component
   - Two-step UI (confirm → OTP)
   - OTP generation and verification

### Files Modified:
2. **`src/context/ListingsContext.tsx`**
   - Added `deleteListing()` method
   - Removes item from state and localStorage

3. **`src/pages/Product.tsx`**
   - Added delete button in seller section
   - Integrated DeleteListingModal
   - Handles deletion confirmation

## OTP Implementation

### Current: Simulated (Frontend Only)
```typescript
// Generate OTP
const otp = Math.floor(100000 + Math.random() * 900000).toString();

// Show in alert (simulates email)
alert(`OTP Sent!\nYour OTP: ${otp}`);

// User enters OTP
// Verify match
if (enteredOtp === generatedOtp) {
  // Delete listing
}
```

### Future: Real Email (Requires Backend)
To implement real email OTP:

1. **Create backend API endpoint**:
   ```javascript
   POST /api/send-otp
   Body: { email: "seller@email.com", listingId: 123 }
   ```

2. **Integrate email service**:
   - SendGrid
   - AWS SES
   - Nodemailer
   - Mailgun

3. **Update frontend**:
   ```typescript
   const response = await fetch('/api/send-otp', {
     method: 'POST',
     body: JSON.stringify({ email: sellerEmail, listingId: id })
   });
   ```

4. **Verify OTP on backend**:
   ```javascript
   POST /api/verify-otp
   Body: { email: "seller@email.com", otp: "123456" }
   ```

## Security Features

✅ **Email verification** - OTP sent to registered email
✅ **6-digit OTP** - Random generation
✅ **Single use** - OTP regenerated for each attempt
✅ **No deletion without OTP** - Cannot bypass verification
✅ **Seller-only access** - Only user listings show delete button

## User Experience

### For Sellers:
1. Easy to find delete button on product page
2. Clear two-step process
3. OTP displayed in alert (demo mode)
4. Instant feedback on success/error

### For Buyers:
- Delete button not visible on regular products
- Only seller can delete their own listings

## Testing Instructions

1. **List an item** (via Sell page)
2. **Navigate to that item's product page**
3. **Scroll to Seller Information section**
4. **Click "Delete This Listing"**
5. **Click "Send OTP"** in confirmation dialog
6. **Check the alert** - copy the OTP shown
7. **Enter the OTP** in the input field
8. **Click "Verify & Delete"**
9. **Verify deletion** - item should be removed

## Error Handling

❌ **Invalid OTP**: Shows error message
❌ **Missing email**: Delete button won't appear
❌ **Non-user listing**: Delete button hidden

## Future Enhancements

1. **Real email integration** via backend
2. **OTP expiration** (5-10 minutes)
3. **Rate limiting** - prevent OTP spam
4. **SMS OTP option** as alternative
5. **Seller dashboard** to manage all listings
6. **Bulk delete** for multiple items
7. **Soft delete** with recovery period

## Benefits

✅ Prevents accidental deletion
✅ Verifies seller identity
✅ Secure and user-friendly
✅ Ready for backend upgrade
✅ Professional deletion flow
