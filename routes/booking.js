const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync");
const { isLoggedIn } = require("../middleware");
const bookingController = require("../controllers/bookings");

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

// Get user booking history (must come BEFORE /:id routes)
router.get(
  "/history",
  isLoggedIn,
  wrapAsync(bookingController.getUserBookings)
);

// Cancel booking
router.put(
  "/:id/cancel",
  isLoggedIn,
  wrapAsync(bookingController.cancelBooking)
);

// Safety fallback if method-override fails and the browser submits a plain POST
router.post(
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

// Availability check for a listing (query: checkIn, checkOut)
router.get(
  "/:id/availability",
  wrapAsync(bookingController.getAvailability)
);

module.exports = router;