const crypto = require("crypto");
const Booking = require("../models/booking");
const Listing = require("../models/listing");
const User = require("../models/user");
const { sendBookingNotification } = require("../utils/email");
const Razorpay = require("razorpay");

// Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Default number of rooms per listing (can be overridden via env)
const DEFAULT_ROOMS = parseInt(process.env.DEFAULT_ROOMS, 10) || 5;


// ============================================================
// ✅ CREATE BOOKING ORDER
// ============================================================
module.exports.createBookingOrder = async (req, res) => {
  try {
    console.log("🔥 CREATE BOOKING HIT");

    const { id } = req.params;
    const { checkIn, checkOut } = req.body;

    if (!checkIn || !checkOut) {
      return res.status(400).json({
        success: false,
        message: "Check-in and check-out dates are required",
      });
    }

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const listing = await Listing.findById(id);

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: "Listing not found",
      });
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    // Count overlapping confirmed bookings and compare with capacity
    const overlappingConfirmed = await Booking.find({
      listing: id,
      paymentStatus: "success",
      checkIn: { $lt: checkOutDate },
      checkOut: { $gt: checkInDate },
    });

    if (overlappingConfirmed.length >= DEFAULT_ROOMS) {
      return res.status(400).json({
        success: false,
        message: "Selected dates are fully booked",
      });
    }

    const nights = Math.ceil(
      (checkOutDate - checkInDate) / (1000 * 60 * 60 * 24)
    );

    const totalPrice = nights * listing.price;

    console.log("💰 Total:", totalPrice);

    const order = await razorpay.orders.create({
      amount: totalPrice * 100,
      currency: "INR",
      receipt: `booking_${Date.now()}`,
    });

    const booking = new Booking({
      listing: id,
      user: req.user._id,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      totalPrice,
      paymentStatus: "pending",
      razorpayOrderId: order.id,
    });

    await booking.save();

    console.log("✅ Booking created:", booking._id);

    res.json({
      success: true,
      order,
      bookingId: booking._id,
      razorpayKeyId: process.env.RAZORPAY_KEY_ID,
      totalAmount: totalPrice,
    });

  } catch (error) {
    console.error("💥 createBookingOrder error:", error);

    res.status(500).json({
      success: false,
      message: "Error creating booking",
    });
  }
};


// ============================================================
// ✅ VERIFY PAYMENT
// ============================================================
module.exports.verifyPayment = async (req, res) => {
  try {
    console.log("🔥 VERIFY PAYMENT HIT");

    const {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      bookingId,
    } = req.body;

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature || !bookingId) {
      return res.status(400).json({
        success: false,
        message: "Missing payment details",
      });
    }

    const hmac = crypto.createHmac(
      "sha256",
      process.env.RAZORPAY_KEY_SECRET
    );

    hmac.update(razorpayOrderId + "|" + razorpayPaymentId);

    const generatedSignature = hmac.digest("hex");

    if (generatedSignature !== razorpaySignature) {
      await Booking.findByIdAndUpdate(bookingId, {
        paymentStatus: "failed",
      });

      return res.status(400).json({
        success: false,
        message: "Payment verification failed",
      });
    }

    console.log("✅ Payment verified");

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    booking.paymentStatus = "success";
    booking.status = "Confirmed";
    booking.razorpayPaymentId = razorpayPaymentId;
    booking.razorpaySignature = razorpaySignature;

    await booking.save();

    await booking.populate({
      path: "listing",
      populate: { path: "owner" },
    });

    const user = await User.findById(booking.user);

    let emailStatus = "failed";

    try {
      console.log("📧 Sending email...");

      await sendBookingNotification(booking, booking.listing, user);

      console.log("✅ Email sent successfully");

      emailStatus = "sent";

    } catch (err) {
      console.error("❌ Email failed FULL ERROR:");
      console.error(err);
    }

    return res.json({
      success: true,
      message: "Booking confirmed",
      emailStatus,
    });

  } catch (error) {
    console.error("💥 verifyPayment error:", error);

    return res.status(500).json({
      success: false,
      message: "Verification failed",
    });
  }
};


// ============================================================
// ❌ PAYMENT FAILURE
// ============================================================
module.exports.handlePaymentFailure = async (req, res) => {
  try {
    const { bookingId } = req.body;

    if (bookingId) {
      await Booking.findByIdAndUpdate(bookingId, {
        paymentStatus: "failed",
      });
    }

    res.json({
      success: false,
      message: "Payment failed",
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error handling payment failure",
    });
  }
};


// ============================================================
// � CANCEL BOOKING
// ============================================================
module.exports.cancelBooking = async (req, res) => {
  const { id } = req.params;
  const booking = await Booking.findById(id);

  if (!booking) {
    req.flash("error", "Booking not found.");
    return res.redirect("/bookings/history");
  }

  if (!booking.user.equals(req.user._id)) {
    req.flash("error", "You can only cancel your own bookings.");
    return res.redirect("/bookings/history");
  }

  if (booking.status === "Cancelled") {
    req.flash("error", "This booking is already cancelled.");
    return res.redirect("/bookings/history");
  }

  const now = new Date();
  const hoursToCheckIn = (booking.checkIn - now) / (1000 * 60 * 60);
  if (hoursToCheckIn < 24) {
    req.flash(
      "error",
      "Bookings can only be cancelled at least 24 hours before check-in."
    );
    return res.redirect("/bookings/history");
  }

  booking.status = "Cancelled";
  booking.cancelledAt = new Date();
  await booking.save();

  req.flash("success", "Booking cancelled successfully.");
  res.redirect("/bookings/history");
};


// ============================================================
// �📋 GET USER BOOKING HISTORY
// ============================================================
module.exports.getUserBookings = async (req, res) => {
  try {
    const userId = req.user._id;

    // Fetch bookings for the logged-in user, populate listing details, sort by latest first
    const bookings = await Booking.find({ user: userId })
      .populate({
        path: 'listing',
        select: 'title price location image' // Select only needed fields
      })
      .sort({ createdAt: -1 }); // Sort by latest first

    res.render('bookings/history', { bookings });
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    req.flash('error', 'Unable to load booking history');
    res.redirect('/listings'); // Or some other page
  }
};

// GET availability for a listing between two dates
module.exports.getAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const { checkIn, checkOut } = req.query;

    if (!checkIn || !checkOut) {
      return res.status(400).json({ success: false, message: "checkIn and checkOut are required" });
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (isNaN(checkInDate) || isNaN(checkOutDate) || checkOutDate <= checkInDate) {
      return res.status(400).json({ success: false, message: "Invalid date range" });
    }

    const overlappingConfirmed = await Booking.find({
      listing: id,
      paymentStatus: "success",
      checkIn: { $lt: checkOutDate },
      checkOut: { $gt: checkInDate },
    });

    const available = Math.max(0, DEFAULT_ROOMS - overlappingConfirmed.length);

    return res.json({ success: true, available });
  } catch (err) {
    console.error("getAvailability error:", err);
    return res.status(500).json({ success: false, message: "Error checking availability" });
  }
};