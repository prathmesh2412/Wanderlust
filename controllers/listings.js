const Listing = require("../models/listing");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });
const Blog = require("../models/blog");

module.exports.index = async (req, res) => {
   const allListings = await Listing.find({});
   res.render("listings/index.ejs",{ allListings });
};

module.exports.renderNewform = (req, res) => {
    res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res, next) => {
    let { id } = req.params;

    const listing = await Listing.findById(id)
      .populate({
        path: "reviews",
        populate: {
            path: "author",
        },
      })
      .populate({
        path: "blogs",   // ✅ ADD THIS
        populate: {
            path: "author",
        },
      })
      .populate("owner");

    if (!listing) {
        req.flash("error", "Listing does not exist!");
        return res.redirect("/listings");
    }

    res.render("listings/show.ejs", { listing });
};

module.exports.createListing = async (req, res, next) => {
  let response = await geocodingClient
      .forwardGeocode({
        query: req.body.listing.location,
        limit:1,
    })
    .send();
  

    let url = req.file.path;
    let filename = req.file.filename;

    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = {url, filename};

    newListing.geometry = response.body.features[0].geometry;
    let savedListing = await newListing.save();
    console.log(savedListing);
    
    req.flash("success", " New listing Created!");
    return res.redirect("/listings");
};

module.exports.editListing = async (req, res, next) => {
    let {id}= req.params;
    const listing = await Listing.findById(id);
    if(!listing){
        req.flash("error"," Listing you requested for does not exist!");
        res.redirect("/listings");
    }
    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload/", "/upload/w_250/");
    res.render("listings/edit.ejs", { listing, originalImageUrl });
};

module.exports.updateListing =async (req, res, next) => {
    let {id}= req.params;
    let listing =await Listing.findByIdAndUpdate(id, { ...req.body.listing });

    if(typeof req.file !== "undefined") {
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image = {url, filename};
    await listing.save();
    }
    req.flash("success", " Listing Updated!");
    return res.redirect(`/listings/${id}`);
};

module.exports.deleteListing =async (req, res, next) => {
    let {id}= req.params;
    await Listing.findByIdAndDelete(id);
    console.log("Deleted Listing:", id);
    req.flash("success","Listing Deleted!");
    return res.redirect("/listings");
};

module.exports.searchListings = async (req, res) => {
    let { query } = req.query;

    if (!query) {
        return res.redirect("/listings");
    }

    const listings = await Listing.find({
        $or: [
            { title: { $regex: query, $options: "i" } },
            { country: { $regex: query, $options: "i" } },
            { category: { $regex: query, $options: "i" } }
        ]
    });

    res.render("listings/index.ejs", { allListings: listings });
};

module.exports.categoryListings = async (req, res) => {
      const { category } = req.params;
      const allListings = await Listing.find({ category });
      res.render("listings/index.ejs", { allListings });
};

module.exports.createBlog = async (req, res) => {
  let { id } = req.params;

  let listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing not found!");
    return res.redirect("/listings");
  }

  let blog = new Blog({
    content: req.body.content,
    author: req.user._id,
    listing: listing._id,
  });

  await blog.save();

  listing.blogs.push(blog);   
  await listing.save();

  req.flash("success", "Blog submitted for approval!");
  res.redirect(`/listings/${id}`);
};

// SHOW PENDING BLOGS
module.exports.pendingBlogs = async (req, res) => {
  let blogs = await Blog.find({ status: "pending" })
    .populate("author")
    .populate("listing");

  res.render("blog/pending.ejs", { blogs });
};

// APPROVE BLOG
module.exports.approveBlog = async (req, res) => {
  let blog = await Blog.findById(req.params.id).populate("listing");

  if (!blog) {
    req.flash("error", "Blog not found!");
    return res.redirect("/listings");
  }

  // 🔐 AUTHORIZATION
  if (!blog.listing.owner.equals(req.user._id)) {
    req.flash("error", "Not authorized!");
    return res.redirect("/listings");
  }

  blog.status = "approved";
  await blog.save();

  res.redirect("/listings/pending");
};

// REJECT BLOG
module.exports.rejectBlog = async (req, res) => {
  let blog = await Blog.findById(req.params.id).populate("listing");

  if (!blog) {
    req.flash("error", "Blog not found!");
    return res.redirect("/listings");
  }

  if (!blog.listing.owner.equals(req.user._id)) {
    req.flash("error", "Not authorized!");
    return res.redirect("/listings");
  }

  blog.status = "rejected";
  await blog.save();

  res.redirect("/listings/pending");
};

module.exports.deleteBlog = async (req, res) => {
  let blog = await Blog.findById(req.params.id).populate("listing");

  if (!blog) {
    req.flash("error", "Blog not found!");
    return res.redirect("/listings");
  }

  //  ONLY OWNER CAN DELETE
  if (!blog.listing.owner.equals(req.user._id)) {
    req.flash("error", "Not authorized!");
    return res.redirect("/listings");
  }

  // remove blog from listing
  await Listing.findByIdAndUpdate(blog.listing._id, {
    $pull: { blogs: blog._id },
  });

  // delete blog
  await Blog.findByIdAndDelete(blog._id);

  req.flash("success", "Blog deleted!");
  res.redirect("/listings/pending");
};