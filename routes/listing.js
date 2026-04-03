const express = require('express');
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing =  require("../models/listing.js");
const {isLoggedIn, isOwner, validateListing} = require("../middleware.js");
const { populate } = require('../models/review.js');
const listingcontroller = require("../controllers/listings.js");
const multer  = require('multer');
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });


router
    .route("/")
    .get(wrapAsync(listingcontroller.index))
    //Create Route - to create new listing
    .post(
       isLoggedIn , 
       upload.single("listing[image]"),
       validateListing, 
       wrapAsync(listingcontroller.createListing)
     );    

//New Route - to show form to create new listing
router.get("/new", isLoggedIn , listingcontroller.renderNewform);

//Search Route - to search for listings by title, country, or category
router.get("/search", wrapAsync(listingcontroller.searchListings));


//Category route - to show listings of a specific category    
router.get("/category/:category", wrapAsync(listingcontroller.categoryListings));

//Blog routes - must be before /:id route to be matched correctly
router.get("/pending", isLoggedIn, listingcontroller.pendingBlogs);
router.post("/blogs/:id/approve", isLoggedIn, listingcontroller.approveBlog);
router.post("/blogs/:id/reject", isLoggedIn, listingcontroller.rejectBlog);
router.delete("/blogs/:id", isLoggedIn, listingcontroller.deleteBlog);

// ✅ BLOG CREATE
router.post("/:id/blogs", isLoggedIn, listingcontroller.createBlog);

//Delete Route - to delete a listing
//show route - to show details of one listing

router.route("/:id")
    .get(wrapAsync(listingcontroller.showListing))
    .put(
        isLoggedIn , 
        isOwner , 
        upload.single("listing[image]"),
        validateListing ,
         wrapAsync(listingcontroller.updateListing))
    .delete(
        isLoggedIn ,
        isOwner, 
        wrapAsync(listingcontroller.deleteListing));



//edit route - to show form to edit a listing
router.get("/:id/edit",
     isLoggedIn , 
     isOwner, 
     wrapAsync(listingcontroller.editListing));

module.exports = router;