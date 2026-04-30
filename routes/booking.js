const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync");
const { isLoggedIn } = require("../middleware");
const bookingController = require("../controllers/bookings");

/**
 * Create a new booking order
 * POST /bookings/:id
 * Creates a Razorpay order and saves booking in database
 */
router.post(
  "/:id",
  isLoggedIn,
  wrapAsync(bookingController.createBookingOrder)
);

/**
 * Verify Razorpay payment signature
 * POST /bookings/verify-payment
 * Verifies the payment and updates booking status
 */
router.post(
  "/verify/payment",
  isLoggedIn,
  wrapAsync(bookingController.verifyPayment)
);

/**
 * Handle payment failure
 * POST /bookings/payment-failed
 * Updates booking status to failed
 */
router.post(
  "/payment/failed",
  isLoggedIn,
  wrapAsync(bookingController.handlePaymentFailure)
);

router.post(
  "/payment-success/:id",
  isLoggedIn,
  wrapAsync(bookingController.paymentSuccess)
);

/**
 * Get all bookings for logged-in user
 * GET /bookings
 */
router.get("/", isLoggedIn, wrapAsync(bookingController.getUserBookings));

/**
 * Get specific booking details
 * GET /bookings/:id
 */
router.get(
  "/:id",
  isLoggedIn,
  wrapAsync(bookingController.getBookingDetails)
);

/**
 * Cancel a booking
 * DELETE /bookings/:id
 */
router.delete(
  "/:id",
  isLoggedIn,
  wrapAsync(bookingController.cancelBooking)
);

/**
 * Create booking API (new)
 * POST /bookings
 */
router.post("/", isLoggedIn, wrapAsync(bookingController.createBooking));

/**
 * Get booked dates for a listing
 * GET /bookings/listing/:id/booked-dates
 */
router.get("/listing/:id/booked-dates", wrapAsync(bookingController.getBookedDates));

/**
 * Simulate payment success
 * POST /bookings/payment/simulate
 */
router.post("/payment/simulate", bookingController.simulatePayment);

module.exports = router;
