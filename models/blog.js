const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema({
  content: String,

  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  listing: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Listing",
  },

  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },

  createdAt: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model("Blog", blogSchema);