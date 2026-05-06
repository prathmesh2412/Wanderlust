const Listing = require("./models/listing");
const Review = require("./models/review.js");
const ExpressError = require("./utils/ExpressError");
const { listingSchema, reviewSchema} = require("./schema.js");

module.exports.isLoggedIn = (req , res, next) => {
     if(!req.isAuthenticated())
    {
        req.session.redirectUrl = req.originalUrl;
        req.flash("error", "You must be logged in to create listing!");
        return res.redirect("/login");
    }
    next();
};

module.exports.saveRedirectUrl =(req, res, next ) => {
    if(req.session.redirectUrl){
        res.locals.redirectUrl = req.session.redirectUrl;

    }
    next();
};

module.exports.isAdmin = (req, res, next) => {
  if (!req.isAuthenticated() || req.user.role !== "admin") {
    req.flash("error", "You must be an admin to access that page.");
    return res.redirect("/listings");
  }
  next();
};

module.exports.isOwner = async (req , res , next) => {
  let { id }  = req.params;
  let listing = await Listing.findById(id);
  if(!listing.owner.equals(res.locals.currUser._id)) {
    req.flash("error", "Your are not the owner of this listing");
    return res.redirect(`/listings/${id}`);
  }
  next();
};

module.exports.validateListing = (req, res, next) => {
    let{ error } = listingSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map((el) => el.message).join(",");
        return next(new ExpressError(400, errMsg));
    }else{
        next();
    }
};

module.exports.validateReview = (req, res, next) => {
    if (!req.body) {
        return next(new ExpressError(400, "Request body is empty. Make sure Content-Type is application/json"));
    }
    let{ error } = reviewSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map((el) => el.message).join(",");
        return next(new ExpressError(400, errMsg));
    }else{
        next();
    }
};

module.exports.isReviewAuthor= async (req , res , next) => {
  let { id , reviewId }  = req.params;
  let review = await Review.findById(reviewId);
  if(!review.author.equals(res.locals.currUser._id)) {
    req.flash("error", "Your are not the author of this review");
    return res.redirect(`/listings/${id}`);
  }
  next();
};