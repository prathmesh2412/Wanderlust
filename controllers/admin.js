const User = require("../models/user");
const Listing = require("../models/listing");
const Booking = require("../models/booking");

module.exports.dashboard = async (req, res) => {
  const userCount = await User.countDocuments();
  const listingCount = await Listing.countDocuments();
  const bookingCount = await Booking.countDocuments();
  res.render("admin/dashboard", { userCount, listingCount, bookingCount });
};

module.exports.listUsers = async (req, res) => {
  const users = await User.find({}).sort({ username: 1 });
  res.render("admin/users", { users });
};

module.exports.deleteUser = async (req, res) => {
  const { id } = req.params;
  if (id === req.user._id.toString()) {
    req.flash("error", "Admins cannot delete themselves.");
    return res.redirect("/admin/users");
  }

  const user = await User.findById(id);
  if (!user) {
    req.flash("error", "User not found.");
    return res.redirect("/admin/users");
  }

  if (user.role === "admin") {
    req.flash("error", "Admin users cannot be deleted.");
    return res.redirect("/admin/users");
  }

  await User.findByIdAndDelete(id);
  await Listing.deleteMany({ owner: user._id });
  req.flash("success", "User removed and their listings deleted.");
  res.redirect("/admin/users");
};

module.exports.listListings = async (req, res) => {
  const listings = await Listing.find({}).populate("owner").sort({ title: 1 });
  res.render("admin/listings", { listings });
};

module.exports.deleteListing = async (req, res) => {
  const { id } = req.params;
  await Listing.findByIdAndDelete(id);
  req.flash("success", "Listing deleted successfully.");
  res.redirect("/admin/listings");
};
