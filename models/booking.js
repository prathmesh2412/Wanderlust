const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const bookingSchema = new Schema({
  // References to User and Listing
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  
  listing: {
    type: Schema.Types.ObjectId,
    ref: "Listing",
    required: true,
  },
  
  // Booking Details
  checkIn: {
    type: Date,
    required: true,
  },
  
  checkOut: {
    type: Date,
    required: true,
  },
  
  numberOfDays: {
    type: Number,
    required: true,
  },
  
  pricePerNight: {
    type: Number,
    required: true,
  },
  
  subtotal: {
    type: Number,
    required: true,
  },
  
  gstAmount: {
    type: Number,
    required: true,
  },
  
  totalPrice: {
    type: Number,
    required: true,
  },
  
  // Payment Information
  paymentStatus: {
    type: String,
    enum: ["pending", "completed", "failed"],
    default: "pending",
  },
  
  // Razorpay Payment Details
  razorpayOrderId: {
    type: String,
  },
  
  razorpayPaymentId: {
    type: String,
  },
  
  razorpaySignature: {
    type: String,
  },
  
  // Booking Status
  bookingStatus: {
    type: String,
    enum: ["confirmed", "cancelled"],
    default: "confirmed",
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now,
  },
  
  cancelledAt: {
    type: Date,
  },
});

module.exports = mongoose.model("Booking", bookingSchema);
