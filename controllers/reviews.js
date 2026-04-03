const Listing = require("../models/listing");
const Review = require("../models/review");

// reviews.js – updated createReview

module.exports.createReview = async (req, res) => {
     // verify the listing exists
     const listing = await Listing.findById(req.params.id);
     if (!listing) {
         req.flash("error", "Cannot add review to a listing that does not exist");
         return res.redirect(`/listings`);
     }
     // create & save the review document
     const newReview = new Review(req.body.review);
     newReview.author = req.user._id;
     await newReview.save();
     // atomically push the review _id (no listing.save, no revalidation)
     await Listing.findByIdAndUpdate(req.params.id, { $push: { reviews: newReview._id } });

     req.flash("success", " New Review Created!");
     return res.redirect(`/listings/${req.params.id}`);
};

module.exports.destroyReview = async (req, res) => {
        let { id, reviewId } = req.params;
    
        await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
        await Review.findByIdAndDelete(reviewId);
        req.flash("success", "  Review Deleted!");
        return res.redirect(`/listings/${id}`);
  };