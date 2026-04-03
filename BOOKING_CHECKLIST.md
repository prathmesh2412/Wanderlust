# Booking System - Implementation Checklist

## ✅ Pre-Implementation

- [x] Razorpay dependency installed (`npm install razorpay`)
- [x] Booking model created (`models/booking.js`)
- [x] Booking controller created (`controllers/bookings.js`)
- [x] Booking routes created (`routes/booking.js`)
- [x] Listing show.ejs updated with booking form
- [x] Booking router added to app.js

## 🔧 Configuration Setup

### Environment Variables
- [ ] Create `.env` file (if not exists)
- [ ] Add `RAZORPAY_KEY_ID` from Razorpay dashboard
- [ ] Add `RAZORPAY_KEY_SECRET` from Razorpay dashboard
- [ ] Verify `.env` is in `.gitignore`
- [ ] Restart Node server after adding variables

### Razorpay Account Setup
- [ ] Sign up at https://razorpay.com
- [ ] Login to dashboard
- [ ] Navigate to Settings → API Keys
- [ ] Generate new API key
- [ ] Copy Key ID (public)
- [ ] Copy Key Secret (confidential)
- [ ] Paste in `.env` file
- [ ] Verify you're in TEST mode initially

### Database
- [ ] MongoDB connection is working
- [ ] Test listing exists with valid price
- [ ] User authentication (Passport) is configured

## 📝 File Checklist

### Models
- [x] `models/booking.js` - Complete with all fields
  - [x] User reference
  - [x] Listing reference
  - [x] Date fields (checkIn, checkOut)
  - [x] Price fields (pricePerNight, totalPrice)
  - [x] Payment status field
  - [x] Razorpay fields (orderId, paymentId, signature)
  - [x] Booking status field
  - [x] Timestamps

### Controllers
- [x] `controllers/bookings.js` - All functions implemented
  - [x] `createBookingOrder()` - Create order and booking
  - [x] `verifyPayment()` - Verify signature
  - [x] `handlePaymentFailure()` - Handle failures
  - [x] `getUserBookings()` - Get user's bookings
  - [x] `getBookingDetails()` - Get single booking
  - [x] `cancelBooking()` - Cancel booking
  - [x] `validateDates()` - Date validation helper

### Routes
- [x] `routes/booking.js` - All routes defined
  - [x] POST `/bookings/:id` - Create order
  - [x] POST `/bookings/verify/payment` - Verify payment
  - [x] POST `/bookings/payment/failed` - Handle failure
  - [x] GET `/bookings` - Get all bookings
  - [x] GET `/bookings/:id` - Get booking details
  - [x] DELETE `/bookings/:id` - Cancel booking

### Views
- [x] `views/listings/show.ejs` - Updated with:
  - [x] Booking form for non-owners
  - [x] Date input fields with validation
  - [x] Total price display
  - [x] Book Now button
  - [x] Login prompt for guests
  - [x] Razorpay script import
  - [x] JavaScript functions for booking flow
  - [x] Price calculation logic
  - [x] Payment verification logic

### Main App
- [x] `app.js` - Updated with:
  - [x] Booking router import
  - [x] Booking router mounting

## 📚 Documentation

- [x] `BOOKING_SETUP.md` - Setup and configuration guide
- [x] `BOOKING_TECHNICAL.md` - Technical documentation
- [x] `BOOKING_QUICKSTART.md` - Quick start guide
- [x] `BOOKING_EXAMPLES.md` - Code examples
- [x] `ENV_TEMPLATE.md` - Environment setup template

## 🧪 Testing Phase 1: Local Setup

### Basic Server Tests
- [ ] Start Node server: `node app.js`
- [ ] Check for errors in console
- [ ] Verify server running on correct port
- [ ] Navigate to application home page
- [ ] Verify no errors in browser console (F12)

### Database Tests
- [ ] MongoDB connection shows "Connected to MongoDB"
- [ ] Can access listings page (`/listings`)
- [ ] Can view specific listing (`/listings/:id`)
- [ ] Listing has valid price and details

### Authentication Tests
- [ ] Can login to application
- [ ] Authentication persists across pages
- [ ] Can logout successfully
- [ ] Booking form hidden when not logged in
- [ ] Shows "Please login" message for guests

## 🧪 Testing Phase 2: Booking Form

### Date Input Tests
- [ ] Can select check-in date
- [ ] Can select check-out date
- [ ] Date picker shows only future dates (no past dates)
- [ ] Real-time price calculation works
- [ ] Price updates when dates change
- [ ] Total price displays correctly

### Validation Tests
- [ ] Cannot select check-out before check-in
- [ ] Shows error for past check-in date
- [ ] Shows error when dates are empty
- [ ] Shows error for same day check-in/check-out
- [ ] Minimum 1 day stay enforced
- [ ] Error message clear and helpful

### Form Submission Tests
- [ ] Book Now button is clickable
- [ ] Button disabled while processing (optional UX improvement)
- [ ] Form validates before submission
- [ ] Prevents double-click submission

## 🧪 Testing Phase 3: Razorpay Integration

### Test Credentials Setup
- [ ] Have test card: `4111 1111 1111 1111`
- [ ] Have test expiry date
- [ ] Have test CVV
- [ ] Razorpay in TEST mode (not production)

### Order Creation Tests
- [ ] Clicking "Book Now" makes POST request to `/bookings/:id`
- [ ] Razorpay checkout opens in modal
- [ ] Modal shows correct amount (in rupees)
- [ ] Booking saved in database with "pending" status
- [ ] Order ID received from Razorpay

### Payment Tests
- [ ] Can enter test card details
- [ ] Razorpay asks for OTP
- [ ] Can complete payment successfully
- [ ] Payment processes (test transaction)

### Payment Verification Tests
- [ ] Backend receives payment callback
- [ ] Signature verification passes
- [ ] Booking status updated to "completed"
- [ ] Success message shown to user
- [ ] Can verify booking in database

### Payment Failure Tests
- [ ] Can trigger payment failure (use invalid card)
- [ ] Booking status updates to "failed"
- [ ] User sees error message
- [ ] Can try again with different card

## 🧪 Testing Phase 4: API Endpoints

### Using Postman or cURL

#### Test: Create Booking Order
- [ ] POST `/bookings/:id` with valid dates
- [ ] Response includes orderId
- [ ] Response includes totalPrice
- [ ] Booking created in database
- [ ] [ ] Status is "pending"

#### Test: Verify Payment
- [ ] POST `/bookings/verify/payment` with valid signature
- [ ] Booking status updates to "completed"
- [ ] Response includes updated booking

#### Test: Get User Bookings
- [ ] GET `/bookings` returns all user bookings
- [ ] Response includes listing details
- [ ] Can see payment status
- [ ] Can see booking dates

#### Test: Get Booking Details
- [ ] GET `/bookings/:id` returns specific booking
- [ ] User can only access own bookings
- [ ] Returns 403 error for others' bookings

#### Test: Cancel Booking
- [ ] DELETE `/bookings/:id` cancels booking
- [ ] Booking status updates to "cancelled"
- [ ] cancelledAt timestamp is set
- [ ] Only booking owner can cancel

## 🔐 Security Testing

### Authentication Tests
- [ ] Cannot book without login (redirect to login)
- [ ] Cannot create order for others (verified by req.user)
- [ ] Cannot verify payment for others' bookings
- [ ] Only owner can cancel booking

### Signature Verification Tests
- [ ] Valid signature accepted
- [ ] Invalid signature rejected
- [ ] Tampered signature detected
- [ ] Missing signature returns error

### Input Validation Tests
- [ ] Invalid dates rejected
- [ ] Empty dates rejected
- [ ] Negative amounts rejected
- [ ] SQL injection attempts prevented
- [ ] XSS attempts prevented

## 📊 Database Testing

### Booking Collection
- [ ] Can create new booking record
- [ ] All required fields populated
- [ ] Correct data types
- [ ] Timestamps set correctly
- [ ] References point to valid documents

### Queries Test
- [ ] Find bookings by user
- [ ] Find bookings by listing
- [ ] Find completed bookings
- [ ] Find cancelled bookings
- [ ] Aggregate by payment status

## 🚀 Production Preparation

### Before Going Live
- [ ] Code reviewed for errors
- [ ] No console.error() statements left
- [ ] Proper error messages in production
- [ ] HTTPS enabled on server
- [ ] Rate limiting implemented
- [ ] Logging configured
- [ ] Monitoring setup

### Razorpay Production Switch
- [ ] Created live API keys in Razorpay
- [ ] Updated RAZORPAY_KEY_ID with live key
- [ ] Updated RAZORPAY_KEY_SECRET with live secret
- [ ] Tested with small real payment
- [ ] Verified payment processing
- [ ] Verified refund process

### Environment Configuration
- [ ] NODE_ENV=production
- [ ] All secrets in environment variables
- [ ] No hardcoded values
- [ ] Database backups configured
- [ ] Error logging enabled
- [ ] Performance monitoring active

## 📋 Edge Cases Testing

### Date-Related Edge Cases
- [ ] Check leap year dates (Feb 29)
- [ ] Check month boundary dates (Jan 31 → Feb 1)
- [ ] Check year boundary dates (Dec 31 → Jan 1)
- [ ] Check timezone differences handling
- [ ] Check daylight saving time impact

### Payment Edge Cases
- [ ] Network timeout handling
- [ ] Partial payment handling
- [ ] Double payment prevention
- [ ] Currency conversion (if applicable)
- [ ] Large amount handling

### User Edge Cases
- [ ] User deletes account after booking
- [ ] Listing deleted after booking
- [ ] User changed listing price
- [ ] Multiple bookings same period
- [ ] Concurrent booking attempts

## 📱 Browser Testing

- [ ] Chrome latest version
- [ ] Firefox latest version
- [ ] Safari (if using Mac)
- [ ] Edge (Windows)
- [ ] Mobile browsers (iOS Safari, Chrome Android)
- [ ] Responsive design working
- [ ] Mobile checkout flow working

## 📝 Documentation Testing

- [ ] BOOKING_SETUP.md is accurate
- [ ] BOOKING_TECHNICAL.md is complete
- [ ] BOOKING_QUICKSTART.md is clear
- [ ] BOOKING_EXAMPLES.md code works
- [ ] ENV_TEMPLATE.md has all required vars
- [ ] All links in docs are valid

## 🐛 Debugging Checklist

### Common Issues to Check
- [ ] NODE_ENV correctly set
- [ ] RAZORPAY_KEY_ID valid
- [ ] RAZORPAY_KEY_SECRET valid
- [ ] MongoDB connected
- [ ] Server restarted after .env changes
- [ ] Port not in use
- [ ] CORS issues (if separate frontend)
- [ ] Session/cookies working

### Logging Points
- [ ] Log when booking created
- [ ] Log when order created with Razorpay
- [ ] Log signature verification attempts
- [ ] Log successful payment updates
- [ ] Log failed bookings
- [ ] Log cancellations

## ✨ Optional Enhancements

- [ ] Email confirmations
- [ ] SMS notifications
- [ ] Refund API
- [ ] Booking history page
- [ ] Calendar view of bookings
- [ ] Cancellation policies
- [ ] Payment plans/installments
- [ ] Admin dashboard
- [ ] Analytics/Reports
- [ ] Automated invoice generation

## 🎯 Final Verification

- [ ] All files created successfully
- [ ] No import/require errors
- [ ] App starts without errors
- [ ] At least one booking created and verified
- [ ] Payment successfully processed (test)
- [ ] Booking saved in database correctly
- [ ] All documentation reviewed
- [ ] Ready for user testing/production

## 📞 Support Resources

### If Something Goes Wrong

1. **Check:**
   - Node console for errors
   - Browser console (F12) for JS errors
   - Network tab for API calls
   - MongoDB for data

2. **Review:**
   - BOOKING_TECHNICAL.md for your error
   - BOOKING_SETUP.md for configuration
   - Controller code for logic
   - Razorpay documentation

3. **Test:**
   - Use Postman to test endpoints
   - Check Razorpay test dashboard
   - Verify database records
   - Review server logs

4. **Common Fixes:**
   - Restart Node server
   - Clear browser cache
   - Check .env file
   - Verify database connection
   - Update Razorpay package

---

## Sign-Off Checklist

- [ ] All main features tested
- [ ] Security verified
- [ ] Documentation complete
- [ ] Ready for production
- [ ] Team member reviewed

**Date Completed**: _______________  
**Completed By**: _______________  
**Notes**: 

---

**Version**: 1.0  
**Last Updated**: 2026-04-02

Good luck! 🚀
