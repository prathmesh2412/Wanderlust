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

module.exports = router;