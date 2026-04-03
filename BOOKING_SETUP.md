# Booking and Payment System Setup Guide

## Overview
This guide explains how to set up and use the Razorpay payment integration with the booking system in your Wonderlust application.

## Prerequisites
- Node.js and npm installed
- MongoDB database connected
- Razorpay account (create at https://razorpay.com)
- Express.js and Passport authentication already set up

## Step 1: Install Dependencies
Razorpay package has been installed. Verify it in your `package.json`:

```bash
npm install razorpay
```

## Step 2: Set Up Environment Variables
Add the following to your `.env` file:

```env
# Razorpay Configuration
RAZORPAY_KEY_ID=your_razorpay_key_id_here
RAZORPAY_KEY_SECRET=your_razorpay_key_secret_here
```

### How to get Razorpay credentials:
1. Sign up at [Razorpay Dashboard](https://dashboard.razorpay.com)
2. Go to **Settings → API Keys**
3. Create a new API key
4. Copy your **Key ID** and **Key Secret**
5. Paste them in your `.env` file

> **Important**: Keep your `RAZORPAY_KEY_SECRET` confidential. Never commit it to version control.

## Step 3: Database Schema
The Booking model has been created at `models/booking.js` with the following fields:

- **user**: Reference to the User who made the booking
- **listing**: Reference to the Listing being booked
- **checkIn**: Check-in date
- **checkOut**: Check-out date
- **numberOfDays**: Calculated number of days
- **pricePerNight**: Price per night from listing
- **totalPrice**: Total booking price
- **paymentStatus**: pending | completed | failed
- **razorpayOrderId**: Razorpay order ID
- **razorpayPaymentId**: Razorpay payment ID
- **razorpaySignature**: Payment signature for verification
- **bookingStatus**: confirmed | cancelled
- **createdAt**: Timestamp of booking creation
- **cancelledAt**: Timestamp of cancellation (if applicable)

## Step 4: File Structure
Added files:
```
models/
  └── booking.js                 (Booking schema)
controllers/
  └── bookings.js                (Booking logic & Razorpay integration)
routes/
  └── booking.js                 (Booking routes)
views/
  └── listings/
      └── show.ejs               (Updated with booking form)
```

## Step 5: Routes Overview

### POST /bookings/:id
Creates a new booking order with Razorpay
- **Required**: User must be logged in
- **Body**: checkIn, checkOut dates
- **Response**: Razorpay order details

### POST /bookings/verify/payment
Verifies payment signature after successful Razorpay payment
- **Required**: User must be logged in
- **Body**: razorpayOrderId, razorpayPaymentId, razorpaySignature, bookingId
- **Response**: Updated booking with completed status

### POST /bookings/payment/failed
Updates booking status when payment fails
- **Required**: User must be logged in
- **Body**: bookingId
- **Response**: Updated booking with failed status

### GET /bookings
Retrieves all bookings for the logged-in user
- **Required**: User must be logged in
- **Response**: Array of bookings with listing details

### GET /bookings/:id
Retrieves specific booking details
- **Required**: User must be logged in, must own the booking
- **Response**: Booking details

### DELETE /bookings/:id
Cancels a booking
- **Required**: User must be logged in, must own the booking
- **Response**: Updated booking with cancelled status

## Step 6: Frontend Integration
The booking form is displayed on the listing show page (`views/listings/show.ejs`):

### Features:
- ✅ Date input fields (check-in and check-out)
- ✅ Real-time price calculation
- ✅ Validation of dates (past dates, checkout after checkin)
- ✅ Razorpay checkout button
- ✅ Login required message for non-logged-in users

### Price Calculation Logic:
```javascript
Total Price = Price Per Night × Number of Days
```

## Step 7: Validation Rules

### Date Validation:
1. ❌ Check-in date cannot be in the past
2. ❌ Check-out date must be after check-in date
3. ❌ Minimum stay is 1 day
4. ❌ Both dates are required

### Booking Validation:
1. ❌ User must be logged in
2. ❌ User cannot be the listing owner
3. ❌ Listing must exist

## Step 8: Payment Flow

```
1. User selects check-in and check-out dates
2. System calculates total price
3. User clicks "Book Now"
4. Backend validates dates and creates Razorpay order
5. Frontend opens Razorpay checkout
6. User enters payment details and confirms
7. Razorpay processes payment
8. On success: Backend verifies signature and updates booking
9. On failure: Backend marks booking as failed
10. User sees confirmation message
```

## Step 9: Testing the Integration

### Test Cards (Razorpay Test Mode):
```
Card: 4111 1111 1111 1111
Expiry: Any future date (MM/YY)
CVV: Any 3 digits
OTP: Any 6 digits
```

### Test Payment Scenarios:
- **Successful**: Complete all fields correctly
- **Failed**: Use invalid card details
- **Timeout**: Don't enter OTP within time limit

## Step 10: Error Handling

### Common Errors and Solutions:

| Error | Cause | Solution |
|-------|-------|----------|
| "Payment verification failed" | Invalid signature | Check if correct RAZORPAY_KEY_SECRET is set |
| "Listing not found" | Invalid listing ID | Ensure listing exists before booking |
| "Check-out before check-in" | Invalid date selection | Select checkout date after checkin |
| "You must be logged in" | User not authenticated | Login before attempting to book |

## Step 11: Production Deployment

### Before Going Live:

1. **Switch Razorpay Mode**:
   - Go to Razorpay Dashboard
   - Switch from Test mode to Live mode
   - Update `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` with live credentials

2. **Update Environment**:
   ```env
   NODE_ENV=production
   RAZORPAY_KEY_ID=your_live_key_id
   RAZORPAY_KEY_SECRET=your_live_key_secret
   ```

3. **Security Checklist**:
   - ✅ Never expose RAZORPAY_KEY_SECRET
   - ✅ Always verify signatures on the backend
   - ✅ Use HTTPS for all transactions
   - ✅ Implement rate limiting on booking endpoints
   - ✅ Add logging for payment transactions

4. **Testing in Live Mode**:
   - Test with actual card payments
   - Test refund process
   - Test edge cases (network failures, timeouts)

## Step 12: Additional Features (Optional)

### Implement Refunds:
```javascript
// In bookings controller
module.exports.refundBooking = async (req, res) => {
  const refund = await razorpayInstance.payments.refund(paymentId);
  // Update booking status to refunded
};
```

### Send Confirmation Emails:
```javascript
// Install nodemailer and send booking confirmation
const transporter = nodemailer.createTransport(...);
transporter.sendMail({
  to: user.email,
  subject: "Booking Confirmation",
  // ... email details
});
```

### Add Booking History Page:
```html
<!-- Create a new page to display user's bookings -->
<div class="bookings-list">
  <% bookings.forEach(booking => { %>
    <div class="booking-card">
      <p>Listing: <%= booking.listing.title %></p>
      <p>Dates: <%= booking.checkIn %> to <%= booking.checkOut %></p>
      <p>Status: <%= booking.paymentStatus %></p>
    </div>
  <% }) %>
</div>
```

## Troubleshooting

### Issue: Razorpay Checkout Not Opening
- Check if Razorpay script is loaded: `<script src="https://checkout.razorpay.com/v1/checkout.js"></script>`
- Verify RAZORPAY_KEY_ID is correct

### Issue: Payment Verification Failing
- Check if RAZORPAY_KEY_SECRET is correct
- Ensure signature verification logic is correct
- Check browser console for errors (F12)

### Issue: Dates Not Calculating
- Check browser console for JavaScript errors
- Verify date input fields have correct IDs (#checkIn, #checkOut)
- Ensure calculateTotalPrice() function is called

## Resources

- [Razorpay Documentation](https://razorpay.com/docs/)
- [Razorpay Payment Gateway Integration](https://razorpay.com/docs/payment-gateway/web-integration/standard/)
- [Node.js Razorpay SDK](https://github.com/razorpay/razorpay-node)
- [Crypto Module Documentation](https://nodejs.org/api/crypto.html)

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review Razorpay documentation
3. Check browser console (F12) for errors
4. Review server logs for backend errors

---

**Version**: 1.0  
**Last Updated**: 2026-04-02
