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


// ============================================================
// ✅ CREATE BOOKING ORDER
// ============================================================
module.exports.createBookingOrder = async (req, res) => {
  try {
    console.log("🔥 CREATE BOOKING HIT");

    const { id } = req.params;
    const { checkIn, checkOut } = req.body;

    // Validation
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

    // ✅ Prevent double booking
    const conflict = await Booking.findOne({
      listing: id,
      paymentStatus: "success",
      checkIn: { $lt: checkOutDate },
      checkOut: { $gt: checkInDate },
    });

    if (conflict) {
      return res.status(400).json({
        success: false,
        message: "Selected dates are already booked",
      });
    }

    // Price calculation
    const nights = Math.ceil(
      (checkOutDate - checkInDate) / (1000 * 60 * 60 * 24)
    );
    const totalPrice = nights * listing.price;

    console.log("💰 Total:", totalPrice);

    // Razorpay order
    const order = await razorpay.orders.create({
      amount: totalPrice * 100,
      currency: "INR",
      receipt: `booking_${Date.now()}`,
    });

    // Save booking (pending)
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

    // Verify signature
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

    // Prevent double booking again
    const conflict = await Booking.findOne({
      listing: booking.listing,
      paymentStatus: "success",
      _id: { $ne: booking._id },
      checkIn: { $lt: booking.checkOut },
      checkOut: { $gt: booking.checkIn },
    });

    if (conflict) {
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

    // Populate owner
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

      emailStatus = "sent"; // ⭐ FIX HERE
    } catch (err) {
        console.error("❌ Email failed FULL ERROR:");
       console.error(err);
}

res.json({
  success: true,
  message: "Booking confirmed",
  emailStatus,
});


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