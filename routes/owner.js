const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const { isLoggedIn } = require("../middleware");
const ownerController = require("../controllers/owner");

/**
 * GET /owner/bookings
 * Fetch all bookings where the logged-in user is the owner of the listing
 * Requires authentication
 */
router.get(
  "/bookings",
  isLoggedIn,
  wrapAsync(ownerController.getOwnerBookings)
);

/**
 * GET /owner/dashboard
 * Render the owner dashboard page
 * Requires authentication
 */
router.get(
  "/dashboard",
  isLoggedIn,
  wrapAsync(ownerController.renderDashboard)
);

module.exports = router;
