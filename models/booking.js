const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const bookingSchema = new Schema({
  listing: {
    type: Schema.Types.ObjectId,
    ref: "Listing",
    required: true,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  checkIn: {
    type: Date,
    required: true,
  },
  checkOut: {
    type: Date,
    required: true,
  },
  totalPrice: {
    type: Number,
    required: true,
  },
  paymentStatus: {
    type: String,
    enum: ["pending", "success", "failed"],  
    default: "pending",                      
  },
  razorpayOrderId: {
    type: String,
  },
  razorpayPaymentId: {
    type: String,
  },
  razorpaySignature: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Static method to check availability for a listing
bookingSchema.statics.checkAvailability = async function (listingId, checkIn, checkOut) {
  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);

  // Find overlapping bookings:
  // - New checkIn is before existing checkOut AND
  // - New checkOut is after existing checkIn
  const overlappingBookings = await this.find({
    listing: listingId,
    paymentStatus: "success", // Only check confirmed bookings
    $or: [
      {
        checkIn: { $lt: checkOutDate },
        checkOut: { $gt: checkInDate },
      },
    ],
  });

  return overlappingBookings;
};

module.exports = mongoose.model("Booking", bookingSchema);