# Booking & Payment System - Technical Documentation

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Model Schema](#model-schema)
3. [Controller Logic](#controller-logic)
4. [Route Definitions](#route-definitions)
5. [Frontend Implementation](#frontend-implementation)
6. [Payment Flow](#payment-flow)
7. [Error Handling](#error-handling)
8. [Security Considerations](#security-considerations)
9. [API Reference](#api-reference)

---

## Architecture Overview

### MVC Pattern
```
User (Frontend)
    ↓
Routes (routes/booking.js)
    ↓
Controllers (controllers/bookings.js)
    ↓
Models (models/booking.js)
    ↓
Database (MongoDB)
```

### Key Components

| Component | File | Purpose |
|-----------|------|---------|
| **Model** | `models/booking.js` | Database schema for bookings |
| **Controller** | `controllers/bookings.js` | Business logic for bookings & Razorpay |
| **Routes** | `routes/booking.js` | API endpoints |
| **Views** | `views/listings/show.ejs` | Booking form UI |
| **Scripts** | Inline in show.ejs | Frontend payment integration |

---

## Model Schema

### Booking Schema (models/booking.js)

```javascript
{
  user: ObjectId,           // Reference to User
  listing: ObjectId,        // Reference to Listing
  checkIn: Date,            // Check-in date
  checkOut: Date,           // Check-out date
  numberOfDays: Number,     // Calculated days
  pricePerNight: Number,    // Price from listing
  totalPrice: Number,       // Total amount in rupees
  paymentStatus: String,    // pending | completed | failed
  razorpayOrderId: String,  // Order ID from Razorpay
  razorpayPaymentId: String,// Payment ID from Razorpay
  razorpaySignature: String,// Signature for verification
  bookingStatus: String,    // confirmed | cancelled
  createdAt: Date,          // Booking creation timestamp
  cancelledAt: Date         // Cancellation timestamp
}
```

### Indexes (Optional but Recommended)
```javascript
// Add to booking.js for faster queries
bookingSchema.index({ user: 1, createdAt: -1 });
bookingSchema.index({ listing: 1, checkIn: 1, checkOut: 1 });
bookingSchema.index({ paymentStatus: 1 });
```

---

## Controller Logic

### createBookingOrder()
**Function**: Creates Razorpay order and saves pending booking

**Flow**:
```
1. Get listing ID from params
2. Get checkIn and checkOut from request body
3. Validate dates (not past, checkout > checkin, min 1 day)
4. Fetch listing from DB
5. Calculate numberOfDays and totalPrice
6. Convert to paise (multiply by 100)
7. Create Razorpay order with options:
   - amount: totalPrice * 100 (in paise)
   - currency: "INR"
   - receipt: unique identifier
   - notes: listing_id, user_id
8. Save booking with pending status
9. Return order details to frontend
```

**Parameters**:
```javascript
{
  checkIn: "2026-04-15",  // Date string (YYYY-MM-DD)
  checkOut: "2026-04-20"  // Date string (YYYY-MM-DD)
}
```

**Response**:
```javascript
{
  success: true,
  orderId: "order_xxxx",          // Razorpay order ID
  totalPrice: 5000,               // In rupees
  bookingId: "booking_xxxx",      // MongoDB ID
  keyId: "rzp_test_xxxx",         // Razorpay Key ID
  userEmail: "user@example.com",
  userName: "username"
}
```

### validateDates()
**Function**: Validates booking dates

**Validation Rules**:
```javascript
- Check-in date >= Today
- Check-out date > Check-in date
- Minimum stay >= 1 day
```

**Returns**:
```javascript
{
  isValid: true|false,
  message: "Error message if invalid",
  days: number
}
```

### verifyPayment()
**Function**: Verifies Razorpay payment signature

**Flow**:
```
1. Receive razorpayOrderId, razorpayPaymentId, razorpaySignature
2. Create HMAC-SHA256 hash of order_id|payment_id
3. Compare generated hash with received signature
4. If match: Update booking with completed status
5. If no match: Return failure
```

**Security Note**: Signature verification is crucial to prevent payment fraud.

**Signature Verification Logic**:
```javascript
hmac = HMAC-SHA256(
  razorpayOrderId + "|" + razorpayPaymentId,
  RAZORPAY_KEY_SECRET
)
if (hmac === razorpaySignature) {
  // Payment is genuine
} else {
  // Payment is fraudulent
}
```

### handlePaymentFailure()
**Function**: Updates booking when payment fails

**Flow**:
```
1. Receive bookingId
2. Update booking.paymentStatus = "failed"
3. Return updated booking
```

### getUserBookings()
**Function**: Retrieves all bookings for current user

**Flow**:
```
1. Find all bookings where user = req.user._id
2. Populate listing details
3. Sort by createdAt descending
4. Return bookings array
```

**Response**:
```javascript
{
  success: true,
  bookings: [
    {
      _id: "booking_xxxx",
      user: { ... },
      listing: { title, price, ... },
      checkIn: Date,
      checkOut: Date,
      totalPrice: Number,
      paymentStatus: "completed",
      ...
    }
  ]
}
```

### cancelBooking()
**Function**: Cancels a confirmed booking

**Validations**:
```
- User must own the booking
- Booking not already cancelled
- Only cancels bookings that are confirmed
```

**Flow**:
```
1. Fetch booking by ID
2. Verify user ownership
3. Check if already cancelled
4. Update bookingStatus = "cancelled"
5. Set cancelledAt = now
```

---

## Route Definitions

### Create Booking Order
```
POST /bookings/:id
Required: Logged in user
Body: { checkIn, checkOut }
Response: { orderId, totalPrice, bookingId, ... }
```

### Verify Payment
```
POST /bookings/verify/payment
Required: Logged in user
Body: { razorpayOrderId, razorpayPaymentId, razorpaySignature, bookingId }
Response: { success, message, booking }
```

### Payment Failed
```
POST /bookings/payment/failed
Required: Logged in user
Body: { bookingId }
Response: { success, message, booking }
```

### Get User Bookings
```
GET /bookings
Required: Logged in user
Response: { success, bookings: [{ ... }] }
```

### Get Booking Details
```
GET /bookings/:id
Required: Logged in user (must own booking)
Response: { success, booking: { ... } }
```

### Cancel Booking
```
DELETE /bookings/:id
Required: Logged in user (must own booking)
Response: { success, message, booking }
```

---

## Frontend Implementation

### Booking Form (show.ejs)

**Location**: `views/listings/show.ejs`

**HTML Structure**:
```html
<div class="card p-4 border-primary">
  <h4>Book This Listing</h4>
  <form id="bookingForm">
    <input type="date" id="checkIn" required />
    <input type="date" id="checkOut" required />
    <p>Total Price: <span id="totalPrice">₹0</span></p>
    <button type="button" onclick="initiateBooking(listingId)">
      Book Now
    </button>
  </form>
</div>
```

### JavaScript Functions

#### calculateTotalPrice()
```javascript
// Triggered on date change
// Calculates: days × pricePerNight
// Updates #totalPrice element
```

#### validateBookingForm()
```javascript
// Validates form before submission
// Checks dates validity
// Returns true/false
```

#### initiateBooking(listingId)
```javascript
// Main booking flow
// 1. Validates form
// 2. Sends POST /bookings/:id
// 3. Calls openRazorpayCheckout()
```

#### openRazorpayCheckout(data)
```javascript
// Creates Razorpay checkout options
// Options:
// {
//   key: RAZORPAY_KEY_ID,
//   amount: in paise,
//   currency: "INR",
//   order_id: from server,
//   prefill: { name, email },
//   handler: verifyPayment (success callback)
// }
// Handles success and failure cases
```

#### verifyPayment(response, bookingId)
```javascript
// Called when Razorpay payment succeeds
// Sends POST /bookings/verify/payment
// Updates booking to completed status
// Redirects on success
```

---

## Payment Flow

### Complete Flow Diagram

```
┌─────────────────────────────────────────────────────────┐
│ 1. User Selects Dates on Listing Page                   │
│    - checkIn: 2026-04-15                                │
│    - checkOut: 2026-04-20                               │
│    - Real-time price calculation                        │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ 2. User Clicks "Book Now"                               │
│    - Validates dates                                    │
│    - Sends POST /bookings/:listingId                    │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ 3. Backend: createBookingOrder()                        │
│    - Validates dates again                              │
│    - Calculates totalPrice                              │
│    - Creates Razorpay order (amount in paise)           │
│    - Saves booking with paymentStatus: "pending"        │
│    - Returns orderId and booking details                │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ 4. Frontend: openRazorpayCheckout()                     │
│    - Loads Razorpay checkout script                     │
│    - Opens payment modal                                │
│    - User enters card details                           │
└──────────────────┬──────────────────────────────────────┘
                   │
         ┌─────────┴─────────┐
         │                   │
         ▼                   ▼
    ✅ PAYMENT            ❌ PAYMENT
    SUCCESSFUL           FAILED
         │                   │
         │                   ▼
         │           ┌───────────────────┐
         │           │ handlePayment     │
         │           │ Failure()         │
         │           │ Update status:    │
         │           │ "failed"          │
         │           └───────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────┐
│ 5. Frontend: verifyPayment()                            │
│    - Gets payment details from Razorpay                 │
│    - Sends POST /bookings/verify/payment                │
│    - Passes signature for verification                  │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ 6. Backend: verifyPayment()                             │
│    - Verify signature using HMAC-SHA256                 │
│    - If valid: Update booking status to "completed"     │
│    - If invalid: Return error (fraud detected)          │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ 7. Frontend: Success!                                   │
│    - Show confirmation message                          │
│    - Redirect to listing page                           │
└─────────────────────────────────────────────────────────┘
```

---

## Error Handling

### Validation Errors

| Error | Status | Cause | Solution |
|-------|--------|-------|----------|
| "Please provide both dates" | 400 | Missing dates | Fill both date fields |
| "Check-in date cannot be past" | 400 | Past check-in date | Select future date |
| "Check-out before check-in" | 400 | Invalid date range | Check-out > Check-in |
| "Listing not found" | 404 | Invalid listing ID | Verify listing exists |
| "You must be logged in" | 401 | Not authenticated | Login first |

### Payment Errors

| Error | Status | Cause | Solution |
|-------|--------|-------|----------|
| "Payment verification failed" | 400 | Invalid signature | Check KEY_SECRET |
| "Booking not found" | 404 | Invalid booking ID | Check booking exists |
| "Unauthorized" | 403 | Don't own booking | Can't modify others' bookings |

### Server Errors

| Error | Status | Cause |
|-------|--------|-------|
| "Failed to create order" | 500 | Razorpay API error |
| "Failed to verify payment" | 500 | Database error |

---

## Security Considerations

### 1. Signature Verification
```javascript
// Always verify signature on backend
const hmac = crypto.createHmac("sha256", RAZORPAY_KEY_SECRET);
hmac.update(orderId + "|" + paymentId);
const signature = hmac.digest("hex");
if (signature !== receivedSignature) {
  throw new Error("Invalid signature - potential fraud");
}
```

### 2. Authentication
```javascript
// All booking routes require isLoggedIn middleware
router.post("/:id", isLoggedIn, wrapAsync(createBookingOrder));
```

### 3. Authorization
```javascript
// Verify user owns the booking before operations
if (!booking.user.equals(req.user._id)) {
  return res.status(403).json({ success: false });
}
```

### 4. Environment Variables
```env
# Never commit these to version control
RAZORPAY_KEY_ID=xxx       # Public key (OK to expose)
RAZORPAY_KEY_SECRET=xxx   # KEEP SECRET!
```

### 5. HTTPS
```javascript
// Always use HTTPS in production
// Razorpay requires HTTPS for payment processing
```

### 6. Input Validation
```javascript
// Validate all inputs
- Date format validation
- Amount validation (no manipulation)
- User ID validation
```

---

## API Reference

### Headers Required
```
Content-Type: application/json
```

### Authentication
All endpoints except GET require valid session cookie from passport.js

### Response Format
```javascript
Success:
{
  success: true,
  message: "Operation successful",
  data: { ... }
}

Failure:
{
  success: false,
  message: "Error description"
}
```

### Rate Limiting (Recommended)
Add to your app.js:
```javascript
const rateLimit = require("express-rate-limit");
const bookingLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10 // 10 requests per windowMs
});
router.post("/", bookingLimiter, ...);
```

---

## Testing

### Test Endpoints

Use Postman or curl:

```bash
# Create booking
curl -X POST http://localhost:3000/bookings/listing_id \
  -H "Content-Type: application/json" \
  -d '{"checkIn":"2026-04-15","checkOut":"2026-04-20"}'

# Verify payment
curl -X POST http://localhost:3000/bookings/verify/payment \
  -H "Content-Type: application/json" \
  -d '{
    "razorpayOrderId":"order_xxx",
    "razorpayPaymentId":"pay_xxx",
    "razorpaySignature":"sig_xxx",
    "bookingId":"booking_xxx"
  }'

# Get bookings
curl -X GET http://localhost:3000/bookings
```

### Test Payment Flow

1. Use Razorpay test credentials
2. Use test card: `4111 1111 1111 1111`
3. Any future expiry and CVV
4. Test OTP: 111111

---

## Future Enhancements

1. **Refunds**: Implement refund API
2. **Cancellation Policy**: Add refund rules
3. **Email Notifications**: Send booking confirmations
4. **Invoice Generation**: Create PDF invoices
5. **Booking Calendar**: Show unavailable dates
6. **Review After Booking**: Require booking for reviews
7. **Loyalty Rewards**: Reward repeat bookings
8. **Payment Plans**: Allow installments
9. **Admin Dashboard**: Track bookings and payments
10. **Analytics**: Revenue and booking reports

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-04-02 | Initial implementation |

---

**Last Updated**: 2026-04-02  
**Maintenance**: Check Razorpay API changes quarterly
