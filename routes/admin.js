const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const adminController = require("../controllers/admin");
const { isLoggedIn, isAdmin } = require("../middleware.js");

router.get("/dashboard", isLoggedIn, isAdmin, wrapAsync(adminController.dashboard));
router.get("/users", isLoggedIn, isAdmin, wrapAsync(adminController.listUsers));
router.delete("/users/:id", isLoggedIn, isAdmin, wrapAsync(adminController.deleteUser));
router.get("/listings", isLoggedIn, isAdmin, wrapAsync(adminController.listListings));
router.delete("/listings/:id", isLoggedIn, isAdmin, wrapAsync(adminController.deleteListing));

module.exports = router;
