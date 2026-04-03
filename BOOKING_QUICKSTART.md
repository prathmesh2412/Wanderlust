# Booking System - Quick Start Guide

## ⚡ 5-Minute Setup

### Step 1: Install Package
```bash
npm install razorpay
```
✅ Already done!

### Step 2: Add Environment Variables
Add these to your `.env` file:
```env
RAZORPAY_KEY_ID=your_key_id_here
RAZORPAY_KEY_SECRET=your_key_secret_here
```

### Step 3: Get Razorpay Keys
1. Go to https://dashboard.razorpay.com
2. Login/Signup
3. Navigate to Settings → API Keys
4. Copy Key ID and Key Secret
5. Paste in .env

**That's it!** ✅

---

## 📁 Files Created

| File | Purpose |
|------|---------|
| `models/booking.js` | Database schema |
| `controllers/bookings.js` | Business logic & Razorpay API calls |
| `routes/booking.js` | API endpoints |
| `views/listings/show.ejs` | Updated with booking form |
| `BOOKING_SETUP.md` | Detailed setup guide |
| `BOOKING_TECHNICAL.md` | Technical documentation |

---

## 🎯 How It Works

### User Perspective:
1. Visit listing page while logged in
2. See "Book This Listing" form (if not listing owner)
3. Select check-in and check-out dates
4. See total price calculate automatically
5. Click "Book Now"
6. Razorpay checkout opens
7. Enter card details and confirm
8. Payment processed
9. Booking confirmed! ✅

### For Non-Logged-In Users:
- See "Please login to book" message
- Can click to login

---

## 💳 Test Payment

### Test Credentials:
- Card Number: `4111 1111 1111 1111`
- Expiry: Any future date (MM/YY)
- CVV: Any 3 digits
- OTP: Any 6 digits

### Test Razorpay in Test Mode:
- Go to Dashboard
- Ensure TEST MODE is enabled
- Make test payments
- Check bookings in database

---

## 📊 Database

### Booking Collection Fields:
```javascript
{
  _id: ObjectId,
  user: ObjectId (User reference),
  listing: ObjectId (Listing reference),
  checkIn: Date,
  checkOut: Date,
  numberOfDays: Number,
  pricePerNight: Number,
  totalPrice: Number,
  paymentStatus: "pending" | "completed" | "failed",
  razorpayOrderId: String,
  razorpayPaymentId: String,
  razorpaySignature: String,
  bookingStatus: "confirmed" | "cancelled",
  createdAt: Date,
  cancelledAt: Date (if cancelled)
}
```

---

## 🔗 API Endpoints Summary

```
POST   /bookings/:id                 Create booking & Razorpay order
POST   /bookings/verify/payment      Verify payment signature
POST   /bookings/payment/failed      Handle payment failure
GET    /bookings                     Get all user bookings
GET    /bookings/:id                 Get booking details
DELETE /bookings/:id                 Cancel booking
```

---

## ✅ Features Implemented

- ✅ Date selection with validation
- ✅ Price calculation (days × price per night)
- ✅ Razorpay payment gateway integration
- ✅ Payment signature verification
- ✅ Booking status management
- ✅ Error handling and validation
- ✅ User authentication check
- ✅ Listing owner protection (can't book own listing)
- ✅ Bootstrap UI components
- ✅ Real-time price updates
- ✅ Protected routes with middleware

---

## 🐛 Troubleshooting

### Payment not opening?
- Check if Razorpay script is loaded
- Verify KEY_ID in .env
- Check browser console (F12)

### Signature verification fails?
- Verify KEY_SECRET is correct
- Check for typos in .env
- Restart your Node server

### Dates not calculating?
- Check date inputs have correct IDs
- Open browser console for errors
- Verify date format (YYYY-MM-DD)

### Can't see booking form?
- Make sure you're logged in
- Check you're not the listing owner
- Refresh the page

---

## 📞 Quick Support

1. **Read**: BOOKING_SETUP.md (setup issues)
2. **Read**: BOOKING_TECHNICAL.md (code questions)
3. **Check**: Browser console F12 (client errors)
4. **Check**: Server logs (backend errors)
5. **Visit**: Razorpay docs (payment issues)

---

## 🚀 Going Live

### Before Production:

1. Switch Razorpay to Live Mode
2. Update .env with LIVE keys:
   ```env
   RAZORPAY_KEY_ID=rzp_live_xxxxx
   RAZORPAY_KEY_SECRET=xxxxx
   ```
3. Test with real card (small amount)
4. Verify HTTPS is enabled
5. Set `NODE_ENV=production`

---

## 📝 Example Usage

### Frontend - HTML
```html
<div class="card p-4">
  <h4>Book This Listing</h4>
  <input type="date" id="checkIn" required />
  <input type="date" id="checkOut" required />
  <p>Total: <span id="totalPrice">₹0</span></p>
  <button onclick="initiateBooking('<%= listing._id %>')">
    Book Now
  </button>
</div>
```

### Frontend - JavaScript
```javascript
calculateTotalPrice();      // On date change
validateBookingForm();      // Before submit
initiateBooking(listingId); // Create order
openRazorpayCheckout(data); // Open payment
verifyPayment(response);    // Verify & save
```

### Backend - Controller
```javascript
createBookingOrder();     // Create order
verifyPayment();          // Verify signature
handlePaymentFailure();   // Handle failure
getUserBookings();        // Get user's bookings
cancelBooking();          // Cancel booking
```

---

## 📊 Complete Payment Flow in Seconds

```
Select Dates → Calculate Price → Click "Book Now"
    ↓
Backend validates & creates Razorpay order
    ↓
Razorpay checkout opens
    ↓
User enters payment details
    ↓
Payment processed by Razorpay
    ↓
Frontend verifies signature (security check)
    ↓
Backend saves booking with "completed" status
    ↓
Success! Booking confirmed ✅
```

---

## 🎓 Learning Resources

- Razorpay Docs: https://razorpay.com/docs/
- Crypto Module: https://nodejs.org/api/crypto.html
- Date Handling: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date
- MongoDB Queries: https://docs.mongodb.com/manual/

---

## ✨ What's Next?

- Add more validation rules
- Implement refunds
- Send confirmation emails
- Add booking history page
- Create admin dashboard
- Add reviews after booking
- Implement cancellation policies
- Add payment plans/installments

---

**Ready to go!** 🚀

For detailed info: 📖 See BOOKING_SETUP.md and BOOKING_TECHNICAL.md
