const Booking = require("../models/booking");
const Listing = require("../models/listing");
const User = require("../models/user");

/**
 * GET /owner/bookings
 * API endpoint to fetch all bookings for the logged-in owner
 * Returns JSON response with bookings, count, and total earnings
 */
module.exports.getOwnerBookings = async (req, res) => {
  try {
    // ✅ Get the logged-in user ID
    const ownerId = req.user._id;

    // ✅ Fetch all bookings where:
    // 1. The listing owner is the logged-in user
    // 2. Payment status is "success"
    // 3. Populate listing and user details
    const bookings = await Booking.find()
      .populate({
        path: "listing",
        select: "title price owner",
        match: { owner: ownerId }, // ✅ Filter by owner
      })
      .populate({
        path: "user",
        select: "username email",
      })
      .lean();

    // ✅ Filter out bookings where listing is null (user is not the owner)
    const ownerBookings = bookings.filter((booking) => booking.listing !== null);

    // ✅ Filter for only successful bookings
    const successfulBookings = ownerBookings.filter(
      (booking) => booking.paymentStatus === "success"
    );

    // ✅ Calculate total earnings
    const totalEarnings = successfulBookings.reduce(
      (sum, booking) => sum + booking.totalPrice,
      0
    );

    // ✅ Return JSON response
    return res.status(200).json({
      success: true,
      bookings: successfulBookings,
      totalBookings: successfulBookings.length,
      totalEarnings: totalEarnings,
      message: "Owner bookings fetched successfully",
    });
  } catch (error) {
    console.error("Error fetching owner bookings:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching owner bookings",
      error: error.message,
    });
  }
};

/**
 * GET /owner/dashboard
 * Renders the owner dashboard page
 * The page will fetch data from /owner/bookings API
 */
module.exports.renderDashboard = async (req, res) => {
  try {
    // Render the dashboard view
    // The frontend will load the data dynamically via the API
    res.render("owner/dashboard");
  } catch (error) {
    console.error("Error rendering dashboard:", error);
    req.flash("error", "Could not load dashboard");
    res.redirect("/listings");
  }
};
