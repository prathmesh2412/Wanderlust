// ============================================================
// CORRECTED: routes/booking.js - CANCEL BOOKING ROUTE FIX
// ============================================================

const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync");
const { isLoggedIn } = require("../middleware");
const bookingController = require("../controllers/bookings");

// 🔍 DEBUG MIDDLEWARE - Log all incoming requests to this router
router.use((req, res, next) => {
  console.log("📍 BOOKING ROUTER: Incoming", req.method, "request to", req.path);
  console.log("   Full URL:", req.originalUrl);
  console.log("   User authenticated:", !!req.user);
  next();
});

// ============================================================
// ✅ VERIFY PAYMENT (MAIN LOGIC HERE)
// ============================================================
router.post(
  "/verify-payment",
  isLoggedIn,
  wrapAsync(bookingController.verifyPayment)
);

// Payment failed
router.post(
  "/payment/failed",
  isLoggedIn,
  wrapAsync(bookingController.handlePaymentFailure)
);

// Get user booking history (must come BEFORE /:id routes)
router.get(
  "/history",
  isLoggedIn,
  wrapAsync(bookingController.getUserBookings)
);

// ============================================================
// 🔴 CANCEL BOOKING - CRITICAL ROUTE
// ============================================================
// This route MUST:
// 1. Use PUT method (not POST)
// 2. Have :id parameter for booking ID
// 3. Have isLoggedIn middleware
// 4. Have wrapAsync wrapper
router.put(
  "/:id/cancel",
  isLoggedIn,
  wrapAsync(bookingController.cancelBooking)
);

// Create Razorpay order + pending booking
router.post(
  "/:id",
  isLoggedIn,
  wrapAsync(bookingController.createBookingOrder)
);

module.exports = router;
