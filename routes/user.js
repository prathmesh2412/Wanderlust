const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync");
const passport =require("passport");
const { saveRedirectUrl, isLoggedIn } = require("../middleware.js");
const userController = require("../controllers/users.js");
const multer  = require('multer');
const { storage } = require('../cloudConfig.js');

const upload = multer({ storage });


router
      .route("/signup")
      .get(userController.renderSignupForm )
      .post(wrapAsync(userController.signup)); 

router
      .route("/login")
      .get(userController.renderLoginForm)
      .post(
           saveRedirectUrl,
           passport.authenticate("local", {
           failureRedirect: "/login", 
           failureFlash: true
           }), 
           userController.Login
        );


router.get("/logout", userController.Logout );


// Profile Routes (Protected - requires login)
router.get("/profile", isLoggedIn, wrapAsync(userController.renderProfile));

router.get("/profile/edit", isLoggedIn, wrapAsync(userController.renderEditForm));

router.put(
      "/profile/edit",
      isLoggedIn,
      upload.single("image"),
      wrapAsync(userController.updateProfile)
);

module.exports = router;