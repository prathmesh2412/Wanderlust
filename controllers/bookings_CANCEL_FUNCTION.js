// ============================================================
// CORRECTED: controllers/bookings.js - CANCEL BOOKING FUNCTION
// ============================================================

// ... (keep all existing code above, then replace the cancelBooking function with this)

// ============================================================
// 🔴 CANCEL BOOKING - COMPLETE WITH ERROR HANDLING
// ============================================================
module.exports.cancelBooking = async (req, res) => {
  try {
    console.log("\n╔════════════════════════════════════════╗");
    console.log("║  🔴 CANCEL BOOKING ROUTE HIT           ║");
    console.log("╚════════════════════════════════════════╝");

    const { id } = req.params;
    const userId = req.user._id;

    console.log("📋 Parameters:");
    console.log(`  - Booking ID: ${id}`);
    console.log(`  - User ID: ${userId}`);
    console.log(`  - User authenticated: ${!!req.user}`);
    console.log(`  - Request method: ${req.method}`);
    console.log(`  - Request URL: ${req.originalUrl}`);

    // ============================================================
    // EDGE CASE 1: Booking Not Found
    // ============================================================
    const booking = await Booking.findById(id);

    if (!booking) {
      console.log("❌ ERROR: Booking not found!");
      console.log(`   Searched for booking ID: ${id}`);

      req.flash("error", "Booking not found.");
      return res.redirect("/bookings/history");
    }

    console.log("✅ Booking found:", booking._id);
    console.log(`   Current status: ${booking.status}`);
    console.log(`   Owner: ${booking.user}`);

    // ============================================================
    // EDGE CASE 2: Unauthorized User
    // ============================================================
    if (!booking.user.equals(userId)) {
      console.log(
        `❌ ERROR: Unauthorized! Booking owner (${booking.user}) ≠ Current user (${userId})`
      );

      req.flash("error", "You can only cancel your own bookings.");
      return res.redirect("/bookings/history");
    }

    console.log("✅ Authorization verified - user owns this booking");

    // ============================================================
    // EDGE CASE 3: Already Cancelled
    // ============================================================
    if (booking.status === "Cancelled") {
      console.log(`❌ ERROR: Booking already cancelled at ${booking.cancelledAt}`);

      req.flash("error", "This booking is already cancelled.");
      return res.redirect("/bookings/history");
    }

    console.log("✅ Booking is not already cancelled");

    // ============================================================
    // EDGE CASE 4: Cancellation Within 24 Hours
    // ============================================================
    const now = new Date();
    const hoursToCheckIn = (booking.checkIn - now) / (1000 * 60 * 60);

    console.log(`⏰ Time calculations:`);
    console.log(`   - Current time: ${now}`);
    console.log(`   - Check-in time: ${booking.checkIn}`);
    console.log(`   - Hours until check-in: ${hoursToCheckIn.toFixed(2)}`);

    if (hoursToCheckIn < 24) {
      console.log(
        `❌ ERROR: Cannot cancel within 24 hours (Only ${hoursToCheckIn.toFixed(
          2
        )} hours until check-in)`
      );

      req.flash(
        "error",
        `Bookings can only be cancelled at least 24 hours before check-in. You have ${hoursToCheckIn.toFixed(
          2
        )} hours.`
      );
      return res.redirect("/bookings/history");
    }

    console.log("✅ More than 24 hours until check-in - cancellation allowed");

    // ============================================================
    // CANCEL BOOKING - UPDATE STATUS
    // ============================================================
    booking.status = "Cancelled";
    booking.cancelledAt = new Date();

    await booking.save();

    console.log("💾 Booking updated:");
    console.log(`   - New status: ${booking.status}`);
    console.log(`   - Cancelled at: ${booking.cancelledAt}`);
    console.log("✅ SUCCESS: Booking cancelled successfully!");
    console.log("╚════════════════════════════════════════╝\n");

    req.flash("success", "Booking cancelled successfully.");
    res.redirect("/bookings/history");

  } catch (error) {
    console.error("\n❌ CRITICAL ERROR in cancelBooking:");
    console.error("   Error message:", error.message);
    console.error("   Error stack:", error.stack);

    req.flash("error", "An error occurred while cancelling the booking.");
    res.redirect("/bookings/history");
  }
};

// ... (keep all other existing controller functions below)
