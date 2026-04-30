const Razorpay = require("razorpay");
const crypto = require("crypto");
const Booking = require("../models/booking");
const Listing = require("../models/listing");
const User = require("../models/user");
const ExpressError = require("../utils/ExpressError");
const { sendBookingNotification } = require("../utils/email");

// Lazy initialize Razorpay instance (only when needed)
let razorpayInstance = null;

const getRazorpayInstance = () => {
  if (!razorpayInstance) {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      throw new Error(
        "RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET must be set in environment variables"
      );
    }
    razorpayInstance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }
  return razorpayInstance;
};

/**
 * Validate booking dates
 * @param {Date} checkIn - Check-in date
 * @param {Date} checkOut - Check-out date
 * @returns {Object} - Validation result with error and message
 */
const validateDates = (checkIn, checkOut) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);

  checkInDate.setHours(0, 0, 0, 0);
  checkOutDate.setHours(0, 0, 0, 0);

  // Check if dates are in the past
  if (checkInDate < today) {
    return { isValid: false, message: "Check-in date cannot be in the past" };
  }

  // Check if check-out is before check-in
  if (checkOutDate <= checkInDate) {
    return {
      isValid: false,
      message: "Check-out date must be after check-in date",
    };
  }

  // Check minimum stay (optional: minimum 1 day)
  const timeDifference = checkOutDate - checkInDate;
  const daysDifference = Math.ceil(timeDifference / (1000 * 3600 * 24));

  if (daysDifference < 1) {
    return { isValid: false, message: "Minimum stay is 1 day" };
  }

  return { isValid: true, days: daysDifference };
};

/**
 * Create a Razorpay order and save booking in database
 * GET /bookings/new/:id (show booking form)
 * POST /bookings/:id (create booking and order)
 */
module.exports.createBookingOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { checkIn, checkOut } = req.body;

    // Validate dates
    if (!checkIn || !checkOut) {
      req.flash("error", "Please provide both check-in and check-out dates");
      return res.redirect(`/listings/${id}`);
    }

    const dateValidation = validateDates(checkIn, checkOut);
    if (!dateValidation.isValid) {
      req.flash("error", dateValidation.message);
      return res.redirect(`/listings/${id}`);
    }

    // Get listing details
    const listing = await Listing.findById(id);
    if (!listing) {
      req.flash("error", "Listing not found");
      return res.redirect("/listings");
    }

    // Calculate total price with GST
    const numberOfDays = dateValidation.days;
    const subtotal = listing.price * numberOfDays;
    const gstAmount = Math.round(subtotal * 0.18 * 100) / 100; // 18% GST
    const totalPrice = Math.round((subtotal + gstAmount) * 100) / 100;
    const priceInPaise = Math.round(totalPrice * 100); // Convert to paise (1 rupee = 100 paise)

    // Create Razorpay order
    const options = {
      amount: priceInPaise,
      currency: "INR",
      receipt: `booking_${Date.now()}`,
      notes: {
        listing_id: id,
        user_id: req.user._id,
      },
    };

    const order = await getRazorpayInstance().orders.create(options);

    // Save booking with pending status and order ID
    const booking = new Booking({
      user: req.user._id,
      listing: id,
      checkIn: new Date(checkIn),
      checkOut: new Date(checkOut),
      numberOfDays,
      pricePerNight: listing.price,
      subtotal,
      gstAmount,
      totalPrice,
      paymentStatus: "pending",
      razorpayOrderId: order.id,
    });

    await booking.save();

    // Return order details to frontend
    res.json({
      subtotal,
      gstAmount,
      success: true,
      orderId: order.id,
      totalPrice,
      bookingId: booking._id,
      keyId: process.env.RAZORPAY_KEY_ID,
      userEmail: req.user.email,
      userName: req.user.username,
    });
  } catch (error) {
    console.error("Error creating booking order:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create booking order",
    });
  }
};

/**
 * Verify payment signature and update booking status
 * POST /bookings/verify-payment
 */
module.exports.verifyPayment = async (req, res, next) => {
  try {
    const {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      bookingId,
    } = req.body;

    // Verify the signature
    const hmac = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET);
    hmac.update(razorpayOrderId + "|" + razorpayPaymentId);
    const generatedSignature = hmac.digest("hex");

    if (generatedSignature !== razorpaySignature) {
      return res.status(400).json({
        success: false,
        message: "Payment verification failed",
      });
    }

    // Update booking with payment details
    const booking = await Booking.findByIdAndUpdate(
      bookingId,
      {
        paymentStatus: "completed",
        razorpayPaymentId,
        razorpaySignature,
      },
      { returnDocument: 'after' }
    );

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    return res.json({
      success: true,
      message: "Payment verified successfully",
      booking,
    });
  } catch (error) {
    console.error("Error verifying payment:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Payment verification failed",
    });
  }
};

/**
 * Handle payment failure
 * POST /bookings/payment-failed
 */
module.exports.handlePaymentFailure = async (req, res, next) => {
  try {
    const { bookingId } = req.body;

    const booking = await Booking.findByIdAndUpdate(
      bookingId,
      { paymentStatus: "failed" },
      { returnDocument: 'after' }
    );

    return res.json({
      success: true,
      message: "Booking status updated to failed",
      booking,
    });
  } catch (error) {
    console.error("Error handling payment failure:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update booking status",
    });
  }
};

module.exports.paymentSuccess = async (req, res, next) => {
  try {
    const { id: bookingId } = req.params;

    const booking = await Booking.findByIdAndUpdate(
      bookingId,
      { paymentStatus: "success" },
      { new: true }
    ).populate({
      path: "listing",
      populate: { path: "owner" },
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    console.log("Booking updated");

    const user = await User.findById(booking.user);

    await sendBookingNotification(booking, booking.listing, user);

    console.log("Email sent to owner");
    console.log("Payment successful");

    res.json({
      success: true,
      message: "Payment successful & booking confirmed",
    });
  } catch (error) {
    console.error("Error processing payment success:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Payment success failed",
    });
  }
};

/**
 * Get user's bookings
 * GET /bookings
 */
module.exports.getUserBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate("listing")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      bookings,
    });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch bookings",
    });
  }
};

/**
 * Cancel a booking
 * DELETE /bookings/:id
 */
module.exports.cancelBooking = async (req, res, next) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // Check if user owns this booking
    if (!booking.user.equals(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to cancel this booking",
      });
    }

    // Check if already cancelled
    if (booking.bookingStatus === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Booking is already cancelled",
      });
    }

    // Update booking status
    const updatedBooking = await Booking.findByIdAndUpdate(
      id,
      {
        bookingStatus: "cancelled",
        cancelledAt: new Date(),
      },
      { returnDocument: 'after' }
    );

    res.json({
      success: true,
      message: "Booking cancelled successfully",
      booking: updatedBooking,
    });
  } catch (error) {
    console.error("Error cancelling booking:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to cancel booking",
    });
  }
};

/**
 * Get booking details
 * GET /bookings/:id
 */
module.exports.getBookingDetails = async (req, res, next) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findById(id)
      .populate("user")
      .populate("listing");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // Check if user owns this booking
    if (!booking.user._id.equals(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to view this booking",
      });
    }

    res.json({
      success: true,
      booking,
    });
  } catch (error) {
    console.error("Error fetching booking details:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch booking details",
    });
  }
};

/**
 * Check availability for dates
 * @param {String} listingId - Listing ID
 * @param {Date} checkIn - Check-in date
 * @param {Date} checkOut - Check-out date
 * @returns {Boolean} - True if available
 */
const checkAvailability = async (listingId, checkIn, checkOut) => {
  const overlappingBookings = await Booking.find({
    listing: listingId,
    paymentStatus: 'success',
    $or: [
      { checkIn: { $lt: checkOut }, checkOut: { $gt: checkIn } }
    ]
  });
  return overlappingBookings.length === 0;
};

/**
 * Create booking API
 * POST /bookings
 */
/**
 * Create booking API
 * POST /bookings
 */
module.exports.createBooking = async (req, res, next) => {
  try {
    const { listingId, checkIn, checkOut, totalPrice, paymentSuccess } = req.body;

    console.log(`📅 Booking request started for user ${req.user._id}, listing ${listingId}`);

    // Validate input
    if (!listingId || !checkIn || !checkOut || !totalPrice) {
      console.error(`❌ Booking validation failed: Missing required fields for user ${req.user._id}`);
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    if (!paymentSuccess) {
      console.error(`❌ Booking failed: Payment not successful for user ${req.user._id}`);
      return res.status(400).json({ success: false, message: "Payment not successful" });
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (checkInDate >= checkOutDate) {
      console.error(`❌ Booking validation failed: Invalid dates for user ${req.user._id}`);
      return res.status(400).json({ success: false, message: "Invalid dates" });
    }

    // Check availability
    console.log(`🔍 Checking availability for listing ${listingId} from ${checkIn} to ${checkOut}`);
    const isAvailable = await checkAvailability(listingId, checkInDate, checkOutDate);

    if (!isAvailable) {
      console.error(`❌ Booking failed: Dates already booked for listing ${listingId}, user ${req.user._id}`);
      return res.status(400).json({ success: false, message: "Selected dates are already booked" });
    }

    // Create booking
    const booking = new Booking({
      listing: listingId,
      user: req.user._id,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      totalPrice,
      paymentStatus: 'success',
    });

    await booking.save();
    console.log(`✅ Booking saved successfully: ${booking._id} for user ${req.user._id}, listing ${listingId}`);

    // Send email notification
    const listing = await Listing.findById(listingId).populate('owner');
    const user = await User.findById(req.user._id);

    await sendBookingNotification(booking, listing, user);
    console.log(`📧 Email notification sent to owner ${listing.owner.email} for booking ${booking._id}`);

    console.log(`🎉 Booking process completed successfully for booking ${booking._id}`);
    res.status(201).json({ success: true, booking });
  } catch (error) {
    console.error(`💥 Error creating booking for user ${req.user._id}:`, error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};
/**
 * Get booked dates for a listing
 * GET /bookings/listing/:id/booked-dates
 */
module.exports.getBookedDates = async (req, res, next) => {
  try {
    const { id } = req.params;
    const bookings = await Booking.find({ listing: id, paymentStatus: 'success' }, 'checkIn checkOut');
    const bookedDates = bookings.map(b => ({ checkIn: b.checkIn, checkOut: b.checkOut }));
    res.json({ success: true, bookedDates });
  } catch (error) {
    console.error("Error fetching booked dates:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Simulate payment success
 * POST /bookings/payment/simulate
 */
module.exports.simulatePayment = (req, res) => {
  // Simulate payment success
  res.json({ success: true, message: "Payment simulated successfully" });
};
