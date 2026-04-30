const crypto = require("crypto");
const Booking = require("../models/booking");
const Listing = require("../models/listing");
const User = require("../models/user");
const { sendBookingNotification } = require("../utils/email");
const Razorpay = require("razorpay");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

module.exports.createBookingOrder = async (req, res) => {
  try {
    console.log("CREATE BOOKING HIT");
    console.log("req.body:", req.body);
    console.log("req.params:", req.params);
    console.log("req.user:", req.user);

    const { id } = req.params;
    const { checkIn, checkOut } = req.body;

   const booking = await Booking.findById(bookingId);

     if (!booking) {
            return res.status(404).json({
          success: false,
            message: "Booking not found",
        });
      }

      const checkIn = booking.checkIn;
      const checkOut = booking.checkOut;

     console.log("📅 Using DB dates:", checkIn, checkOut);

    if (!req.user) {
      console.log("❌ User not authenticated");
      return res.status(401).json({
        success: false,
        message: "User not authenticated"
      });
    }

    // Find listing
    const listing = await Listing.findById(id);
    if (!listing) {
      console.log("❌ Listing not found");
      return res.status(404).json({
        success: false,
        message: "Listing not found"
      });
    }

    // ============================================================
    // CHECK FOR DOUBLE BOOKING - Prevent overlapping bookings
    // ============================================================
    console.log("🔍 Checking booking availability...");
    
    const overlappingBookings = await Booking.checkAvailability(
      id, 
      checkIn, 
      checkOut
    );
    
    if (overlappingBookings.length > 0) {
      console.log("❌ Dates already booked!");
      return res.status(400).json({
        success: false,
        message: "Selected dates are already booked",
        bookedDates: overlappingBookings.map(b => ({
          checkIn: b.checkIn,
          checkOut: b.checkOut
        }))
      });
    }
    
    console.log("✅ Availability check passed - dates are available");

    console.log("✅ Validation passed");

    // Calculate total price
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
    const totalPrice = nights * listing.price;

    console.log("💰 Total price calculated:", totalPrice);

    // Create Razorpay order
    const options = {
      amount: totalPrice * 100, // Razorpay expects amount in paisa
      currency: "INR",
      receipt: `booking_${Date.now()}`,
    };

    console.log("🔄 Creating Razorpay order...");
    const order = await razorpay.orders.create(options);
    console.log("✅ Razorpay order created:", order.id);

    // Create pending booking
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
    console.log("✅ Booking created with ID:", booking._id);

    res.json({
      success: true,
      order,
      bookingId: booking._id,
      listingId: listing._id,
      razorpayKeyId: process.env.RAZORPAY_KEY_ID,
      totalAmount: totalPrice,
      listing: {
        title: listing.title,
        price: listing.price,
      },
      userDetails: {
        name: req.user.username,
        email: req.user.email,
      },
    });

  } catch (error) {
    console.error("💥 Error in createBookingOrder:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while initiating booking",
      error: error.message
    });
  }
};

module.exports.verifyPayment = async (req, res) => {
  try {
    console.log("🔥 VERIFY PAYMENT HIT");

    const {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      bookingId,
    } = req.body;

    // Validate required fields
    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature || !bookingId) {
      return res.status(400).json({
        success: false,
        message: "Missing required payment details",
      });
    }

    // Verify Razorpay signature
    console.log("🔐 Verifying Razorpay signature...");
    const hmac = require("crypto").createHmac(
      "sha256",
      process.env.RAZORPAY_KEY_SECRET
    );
    hmac.update(razorpayOrderId + "|" + razorpayPaymentId);
    const generatedSignature = hmac.digest("hex");

    if (generatedSignature !== razorpaySignature) {
      console.log("❌ Invalid signature");

      await Booking.findByIdAndUpdate(bookingId, {
        paymentStatus: "failed",
      });

      return res.status(400).json({
        success: false,
        message: "Payment verification failed",
      });
    }

    console.log("✅ Payment verified");

    // Fetch booking
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    console.log("📅 Booking Dates:", booking.checkIn, booking.checkOut);

    // ✅ Check for overlapping bookings (NO $or needed)
    const conflict = await Booking.findOne({
      listing: booking.listing,
      paymentStatus: "success",
      _id: { $ne: booking._id },
      checkIn: { $lt: booking.checkOut },
      checkOut: { $gt: booking.checkIn },
    });

    if (conflict) {
      console.log("❌ Conflict found");

      await Booking.findByIdAndUpdate(bookingId, {
        paymentStatus: "failed",
      });

      return res.status(400).json({
        success: false,
        message: "Selected dates are already booked",
      });
    }

    console.log("✅ No conflict, confirming booking");

    // Update booking
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

    // Send email
    try {
      console.log("📧 Sending email...");
      await sendBookingNotification(booking, booking.listing, user);
      console.log("✅ Email sent");
    } catch (err) {
      console.error("❌ Email failed:", err.message);
    }

    return res.json({
      success: true,
      message: "Payment successful & booking confirmed",
    });

  } catch (error) {
    console.error("💥 verifyPayment error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports.showPaymentPage = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id).populate('listing');

    if (!booking || booking.user.toString() !== req.user._id.toString()) {
      return res.status(404).send("Booking not found");
    }

    const nights = Math.ceil((booking.checkOut - booking.checkIn) / (1000 * 60 * 60 * 24));

    res.render("bookings/payment", {
      bookingId: booking._id,
      razorpayOrderId: booking.razorpayOrderId,
      razorpayKeyId: process.env.RAZORPAY_KEY_ID,
      totalAmount: booking.totalPrice,
      listing: booking.listing,
      checkInDate: booking.checkIn.toLocaleDateString(),
      checkOutDate: booking.checkOut.toLocaleDateString(),
      nights,
      userDetails: {
        name: req.user.username,
        email: req.user.email,
      },
    });

  } catch (error) {
    console.error("Error showing payment page:", error);
    res.status(500).send("Error loading payment page");
  }
};

module.exports.handlePaymentFailure = async (req, res) => {
  try {
    console.log("PAYMENT FAILURE HIT");
    console.log("req.body:", req.body);

    const { bookingId, error } = req.body;

    if (bookingId) {
      await Booking.findByIdAndUpdate(bookingId, {
        paymentStatus: "failed",
      });
      console.log("✅ Booking marked as failed:", bookingId);
    }

    res.json({
      success: false,
      message: "Payment failed",
      error: error || "Unknown error"
    });

  } catch (error) {
    console.error("💥 Error in handlePaymentFailure:", error);
    res.status(500).json({
      success: false,
      message: "Error handling payment failure"
    });
  }
};

// ============================================================
// BONUS: Get booked dates for frontend date picker
// GET /bookings/:id/booked-dates
// Returns array of disabled dates for the listing
// ============================================================
module.exports.getBookedDates = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log("📅 Getting booked dates for listing:", id);
    
    // Get disabled dates using the model method
    const disabledDates = await Booking.getDisabledDates(id);
    
    console.log("✅ Found disabled dates:", disabledDates.length);
    
    res.json({
      success: true,
      disabledDates: disabledDates,
      count: disabledDates.length
    });
    
  } catch (error) {
    console.error("💥 Error getting booked dates:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching booked dates",
      error: error.message
    });
  }
};

// ============================================================
// BONUS: Check availability without creating booking
// POST /bookings/check-availability
// Used to validate dates before showing booking form
// ============================================================
module.exports.checkAvailability = async (req, res) => {
  try {
    const { listingId, checkIn, checkOut } = req.body;
    
    console.log("🔍 Checking availability for listing:", listingId);
    console.log("📅 Dates:", checkIn, "to", checkOut);
    
    if (!listingId || !checkIn || !checkOut) {
      return res.status(400).json({
        success: false,
        message: "listingId, checkIn, and checkOut are required"
      });
    }
    
    // Use the model method to check availability
    const overlappingBookings = await Booking.checkAvailability(
      listingId,
      checkIn,
      checkOut
    );
    
    if (overlappingBookings.length > 0) {
      console.log("❌ Dates already booked:", overlappingBookings.length);
      return res.json({
        success: false,
        available: false,
        message: "Selected dates are already booked",
        bookedRanges: overlappingBookings.map(b => ({
          checkIn: b.checkIn,
          checkOut: b.checkOut
        }))
      });
    }
    
    console.log("✅ Dates are available");
    
    res.json({
      success: true,
      available: true,
      message: "Dates are available for booking"
    });
    
  } catch (error) {
    console.error("💥 Error checking availability:", error);
    res.status(500).json({
      success: false,
      message: "Error checking availability",
      error: error.message
    });
  }
};