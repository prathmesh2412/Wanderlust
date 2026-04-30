const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync");
const { isLoggedIn } = require("../middleware");
const bookingController = require("../controllers/bookings");

// Create Razorpay order + pending booking
router.post(
  "/:id",
  isLoggedIn,
  wrapAsync(bookingController.createBookingOrder)
);

// Show payment page
router.get(
  "/:id/payment",
  isLoggedIn,
  wrapAsync(bookingController.showPaymentPage)
);

// ✅ VERIFY PAYMENT (MAIN LOGIC HERE)
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

// ============================================================
// BONUS: Get booked dates for frontend date picker
// GET /bookings/:id/booked-dates
// Returns array of disabled dates for the listing
// ============================================================
router.get(
  "/:id/booked-dates",
  isLoggedIn,
  wrapAsync(bookingController.getBookedDates)
);

// ============================================================
// BONUS: Check availability without creating booking
// POST /bookings/check-availability
// Used to validate dates before showing booking form
// ============================================================
router.post(
  "/check-availability",
  isLoggedIn,
  wrapAsync(bookingController.checkAvailability)
);

module.exports = router;