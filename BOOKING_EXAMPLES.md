# Booking System - Code Examples & Testing

## Table of Contents
1. [Frontend Implementation Examples](#frontend-implementation-examples)
2. [Testing with Postman/Curl](#testing-with-postman)
3. [Integration Examples](#integration-examples)
4. [Advanced Usage](#advanced-usage)
5. [Common Patterns](#common-patterns)

---

## Frontend Implementation Examples

### Example 1: Basic Booking Form
```html
<!-- views/listings/show.ejs -->
<% if(currUser && !listing.owner._id.equals(currUser._id)) { %>
  <div class="booking-container">
    <h4>Book This Listing</h4>
    <form id="bookingForm">
      <div class="form-group">
        <label>Check-in Date</label>
        <input 
          type="date" 
          id="checkIn" 
          name="checkIn"
          required
          min="<%= new Date().toISOString().split('T')[0] %>"
        />
      </div>

      <div class="form-group">
        <label>Check-out Date</label>
        <input 
          type="date" 
          id="checkOut" 
          name="checkOut"
          required
        />
      </div>

      <div class="price-info">
        <p>Price per night: ₹<%= listing.price %></p>
        <p>Total price: ₹<span id="totalPrice">0</span></p>
      </div>

      <button 
        type="button" 
        onclick="initiateBooking('<%= listing._id %>')"
        class="btn btn-primary"
      >
        Book Now
      </button>
    </form>
  </div>
<% } %>
```

### Example 2: Advanced Date Validation
```javascript
// advancedBooking.js

function validateDates(checkIn, checkOut) {
  const errors = [];
  
  // Check if dates are provided
  if (!checkIn || !checkOut) {
    errors.push("Both dates are required");
    return errors;
  }

  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Check if check-in is before today
  if (checkInDate < today) {
    errors.push("Check-in date cannot be in the past");
  }

  // Check if check-out is before check-in
  if (checkOutDate <= checkInDate) {
    errors.push("Check-out date must be after check-in date");
  }

  // Check minimum nights
  const nightsCount = Math.ceil(
    (checkOutDate - checkInDate) / (1000 * 3600 * 24)
  );
  if (nightsCount < 1) {
    errors.push("Minimum stay is 1 night");
  }

  // Check maximum booking (optional - e.g., 90 days max)
  if (nightsCount > 90) {
    errors.push("Maximum stay is 90 days");
  }

  return errors;
}

// Usage
const errors = validateDates(checkInDate, checkOutDate);
if (errors.length > 0) {
  alert(errors.join("\n"));
  return;
}
```

### Example 3: Dynamic Price Updates
```javascript
// priceCalculator.js

function calculatePrice(checkIn, checkOut, pricePerNight) {
  if (!checkIn || !checkOut) return 0;

  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);

  // Ensure dates are valid
  if (checkOutDate <= checkInDate) return 0;

  const nights = Math.ceil(
    (checkOutDate - checkInDate) / (1000 * 3600 * 24)
  );

  return nights * pricePerNight;
}

// Real-time update on UI
document.getElementById("checkIn").addEventListener("change", () => {
  updateTotalPrice();
});

document.getElementById("checkOut").addEventListener("change", () => {
  updateTotalPrice();
});

function updateTotalPrice() {
  const checkIn = document.getElementById("checkIn").value;
  const checkOut = document.getElementById("checkOut").value;
  const pricePerNight = <% listing.price %>;

  const totalPrice = calculatePrice(checkIn, checkOut, pricePerNight);
  
  if (totalPrice > 0) {
    document.getElementById("totalPrice").textContent = 
      "₹" + totalPrice.toLocaleString("en-IN");
  } else {
    document.getElementById("totalPrice").textContent = "Enter valid dates";
  }
}
```

---

## Testing with Postman

### Setup Postman
1. Download [Postman](https://www.postman.com/downloads/)
2. Create new request
3. Set request type, URL, headers, body

### Test 1: Create Booking Order

**Request Type**: POST  
**URL**: `http://localhost:3000/bookings/YOUR_LISTING_ID`

**Headers**:
```
Content-Type: application/json
```

**Body** (raw JSON):
```json
{
  "checkIn": "2026-04-15",
  "checkOut": "2026-04-20"
}
```

**Expected Response** (Success):
```json
{
  "success": true,
  "orderId": "order_9s6RxqIpFxfDhb",
  "totalPrice": 5000,
  "bookingId": "65f1a2b3c4d5e6f7g8h9i0j1",
  "keyId": "rzp_test_9s6RxqIpFxfDhb",
  "userEmail": "user@example.com",
  "userName": "user123"
}
```

### Test 2: Verify Payment

**Request Type**: POST  
**URL**: `http://localhost:3000/bookings/verify/payment`

**Body**:
```json
{
  "razorpayOrderId": "order_9s6RxqIpFxfDhb",
  "razorpayPaymentId": "pay_9s6RxqIpFxfDhb",
  "razorpaySignature": "9s6RxqIpFxfDhbSignature",
  "bookingId": "65f1a2b3c4d5e6f7g8h9i0j1"
}
```

**Expected Response** (Success):
```json
{
  "success": true,
  "message": "Payment verified successfully",
  "booking": {
    "_id": "65f1a2b3c4d5e6f7g8h9i0j1",
    "user": "user_id",
    "listing": "listing_id",
    "checkIn": "2026-04-15T00:00:00.000Z",
    "checkOut": "2026-04-20T00:00:00.000Z",
    "totalPrice": 5000,
    "paymentStatus": "completed",
    "razorpayOrderId": "order_9s6RxqIpFxfDhb",
    "razorpayPaymentId": "pay_9s6RxqIpFxfDhb",
    "bookingStatus": "confirmed"
  }
}
```

### Test 3: Get User Bookings

**Request Type**: GET  
**URL**: `http://localhost:3000/bookings`

**Expected Response**:
```json
{
  "success": true,
  "bookings": [
    {
      "_id": "65f1a2b3c4d5e6f7g8h9i0j1",
      "user": {...},
      "listing": {
        "title": "Beach Villa",
        "price": 1000
      },
      "checkIn": "2026-04-15T00:00:00.000Z",
      "checkOut": "2026-04-20T00:00:00.000Z",
      "totalPrice": 5000,
      "paymentStatus": "completed"
    }
  ]
}
```

### Test 4: Cancel Booking

**Request Type**: DELETE  
**URL**: `http://localhost:3000/bookings/BOOKING_ID`

**Expected Response**:
```json
{
  "success": true,
  "message": "Booking cancelled successfully",
  "booking": {
    "_id": "65f1a2b3c4d5e6f7g8h9i0j1",
    "bookingStatus": "cancelled",
    "cancelledAt": "2026-04-02T10:30:00.000Z"
  }
}
```

---

## Testing with cURL

### Test 1: Create Booking
```bash
curl -X POST http://localhost:3000/bookings/LISTING_ID \
  -H "Content-Type: application/json" \
  -d '{
    "checkIn": "2026-04-15",
    "checkOut": "2026-04-20"
  }'
```

### Test 2: Verify Payment
```bash
curl -X POST http://localhost:3000/bookings/verify/payment \
  -H "Content-Type: application/json" \
  -d '{
    "razorpayOrderId": "order_xxx",
    "razorpayPaymentId": "pay_xxx",
    "razorpaySignature": "sig_xxx",
    "bookingId": "booking_xxx"
  }'
```

### Test 3: Get Bookings
```bash
curl -X GET http://localhost:3000/bookings \
  -H "Content-Type: application/json"
```

### Test 4: Cancel Booking
```bash
curl -X DELETE http://localhost:3000/bookings/BOOKING_ID \
  -H "Content-Type: application/json"
```

---

## Integration Examples

### Example 1: Node.js Script to Create Booking
```javascript
// scripts/createTestBooking.js

const axios = require('axios');

const createBooking = async () => {
  try {
    const response = await axios.post(
      'http://localhost:3000/bookings/LISTING_ID',
      {
        checkIn: '2026-04-15',
        checkOut: '2026-04-20'
      },
      {
        headers: {
          'Content-Type': 'application/json'
        },
        withCredentials: true // Include cookies
      }
    );

    console.log('Booking created:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error creating booking:', error.response?.data);
  }
};

createBooking();
```

### Example 2: Email Notification After Booking
```javascript
// In bookings.js controller - after payment verification

const nodemailer = require('nodemailer');

async function sendBookingConfirmation(booking) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });

  await booking.populate('user listing');

  const mailOptions = {
    from: 'your-email@gmail.com',
    to: booking.user.email,
    subject: 'Booking Confirmed!',
    html: `
      <h2>Your Booking is Confirmed!</h2>
      <p>Thank you for booking <strong>${booking.listing.title}</strong></p>
      <p><strong>Check-in:</strong> ${booking.checkIn.toDateString()}</p>
      <p><strong>Check-out:</strong> ${booking.checkOut.toDateString()}</p>
      <p><strong>Total Amount:</strong> ₹${booking.totalPrice}</p>
      <p>Your booking reference: ${booking._id}</p>
    `
  };

  await transporter.sendMail(mailOptions);
}

// Usage in verifyPayment()
await sendBookingConfirmation(booking);
```

### Example 3: Admin Dashboard Query
```javascript
// Data for admin dashboard

// Total bookings
const totalBookings = await Booking.countDocuments();

// Revenue
const revenue = await Booking.aggregate([
  { $match: { paymentStatus: 'completed' } },
  { $group: { _id: null, total: { $sum: '$totalPrice' } } }
]);

// Bookings by month
const monthlyBookings = await Booking.aggregate([
  { $group: {
      _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
      count: { $sum: 1 },
      revenue: { $sum: '$totalPrice' }
    }
  },
  { $sort: { _id: -1 } }
]);

// Most booked listings
const popularListings = await Booking.aggregate([
  { $group: {
      _id: '$listing',
      bookingCount: { $sum: 1 }
    }
  },
  { $sort: { bookingCount: -1 } },
  { $limit: 10 },
  { $lookup: {
      from: 'listings',
      localField: '_id',
      foreignField: '_id',
      as: 'listing'
    }
  }
]);
```

---

## Advanced Usage

### Example 1: Custom Validation Rules
```javascript
// In createBookingOrder controller

// Additional validation - check listing availability
async function checkListingAvailability(
  listingId,
  checkInDate,
  checkOutDate
) {
  // Find conflicting bookings
  const conflicting = await Booking.findOne({
    listing: listingId,
    paymentStatus: 'completed',
    bookingStatus: 'confirmed',
    $or: [
      {
        checkIn: { $lt: checkOutDate },
        checkOut: { $gt: checkInDate }
      }
    ]
  });

  return !conflicting; // Returns true if available
}

// Usage
const isAvailable = await checkListingAvailability(
  listingId,
  new Date(checkIn),
  new Date(checkOut)
);

if (!isAvailable) {
  req.flash('error', 'Dates are not available');
  return res.redirect(`/listings/${listingId}`);
}
```

### Example 2: Cancellation with Refund
```javascript
// Add to bookings controller

module.exports.refundAndCancel = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id);

    // Process refund
    const refund = await razorpayInstance.payments.refund(
      booking.razorpayPaymentId,
      {
        amount: Math.round(booking.totalPrice * 100)
      }
    );

    // Update booking
    booking.bookingStatus = 'cancelled';
    booking.cancelledAt = new Date();
    await booking.save();

    res.json({
      success: true,
      message: 'Refund processed and booking cancelled',
      refundId: refund.id
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
```

### Example 3: Booking Calendar
```javascript
// API endpoint to get booked dates

module.exports.getBookedDates = async (req, res) => {
  const { listingId } = req.query;

  try {
    const bookedDates = await Booking.find({
      listing: listingId,
      paymentStatus: 'completed',
      bookingStatus: 'confirmed'
    }).select('checkIn checkOut');

    const dates = bookedDates.flatMap(booking => {
      const dates = [];
      let current = new Date(booking.checkIn);
      
      while (current <= new Date(booking.checkOut)) {
        dates.push(current.toISOString().split('T')[0]);
        current.setDate(current.getDate() + 1);
      }
      
      return dates;
    });

    res.json({
      success: true,
      bookedDates: dates
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
```

---

## Common Patterns

### Pattern 1: Error Handling Wrapper
```javascript
// wrapAsync already handles this, but here's detailed example

const wrapAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch((err) => {
      if (err.message.includes('validation')) {
        req.flash('error', 'Invalid input data');
      } else if (err.message.includes('verification')) {
        req.flash('error', 'Payment verification failed');
      } else {
        req.flash('error', 'Something went wrong');
      }
      next(err);
    });
  };
};
```

### Pattern 2: Response Standardization
```javascript
// Helper function for consistent API responses

function sendResponse(res, success, message, data = null, statusCode = 200) {
  return res.status(statusCode).json({
    success,
    message,
    ...(data && { data })
  });
}

// Usage
sendResponse(res, true, 'Booking created', { orderId, totalPrice }, 201);
sendResponse(res, false, 'Invalid dates', null, 400);
```

### Pattern 3: Logging
```javascript
// For debugging and analytics

function logBookingEvent(event, bookingId, userId, details = {}) {
  console.log({
    timestamp: new Date(),
    event,
    bookingId,
    userId,
    ...details
  });

  // Optional: Save to database
  // BookingLog.create({ event, bookingId, userId, ...details });
}

// Usage
logBookingEvent('BOOKING_CREATED', bookingId, userId, { totalPrice });
logBookingEvent('PAYMENT_VERIFIED', bookingId, userId, { paymentId });
logBookingEvent('BOOKING_CANCELLED', bookingId, userId);
```

---

## Summary

These examples show how to:
- ✅ Implement the booking form
- ✅ Test with Postman/cURL
- ✅ Handle advanced scenarios
- ✅ Follow best practices
- ✅ Extend the system

**For more details**, see:
- `BOOKING_SETUP.md` - Setup guide
- `BOOKING_TECHNICAL.md` - Technical documentation
- Controller files - Actual implementation
