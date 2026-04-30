const crypto = require("crypto");
const Booking = require("../models/booking");
const Listing = require("../models/listing");
const User = require("../models/user");
const { sendBookingNotification } = require("../utils/email");

module.exports.verifyPayment = async (req, res) => {
  try {
    console.log("🔥 VERIFY PAYMENT HIT");

    const {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      bookingId,
    } = req.body;

    console.log("🔐 Verifying payment...");

    // Verify signature
    const hmac = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET);
    hmac.update(razorpayOrderId + "|" + razorpayPaymentId);
    const generatedSignature = hmac.digest("hex");

    if (generatedSignature !== razorpaySignature) {
      console.log("❌ Payment verification failed");

      await Booking.findByIdAndUpdate(bookingId, {
        paymentStatus: "failed",
      });

      return res.status(400).json({
        success: false,
        message: "Payment verification failed",
      });
    }

    console.log("✅ Payment verified");

    // Get booking
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    console.log("🔍 Checking availability...");

    // Prevent double booking
    const conflict = await Booking.findOne({
      listing: booking.listing,
      paymentStatus: "success",
      _id: { $ne: booking._id },
      $or: [
        {
          checkIn: { $lt: booking.checkOut },
          checkOut: { $gt: booking.checkIn },
        },
      ],
    });

    if (conflict) {
      console.log("❌ Dates already booked");

      await Booking.findByIdAndUpdate(bookingId, {
        paymentStatus: "failed",
      });

      return res.status(400).json({
        success: false,
        message: "Dates already booked",
      });
    }

    // Confirm booking
    booking.paymentStatus = "success";
    booking.razorpayPaymentId = razorpayPaymentId;
    booking.razorpaySignature = razorpaySignature;

    await booking.save();

    console.log("✅ Booking confirmed");

    // Populate owner
    await booking.populate({
      path: "listing",
      populate: { path: "owner" },
    });

    const user = await User.findById(booking.user);

    // Send email
    try {
      console.log("📧 Sending email...");
      await sendBookingNotification(booking, booking.listing, user);
      console.log("📧 Email sent successfully");
    } catch (err) {
      console.error("❌ Email error:", err.message);
    }

    res.json({
      success: true,
      message: "Payment successful & booking confirmed",
    });

  } catch (error) {
    console.error("💥 Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};