const User = require("../models/user");
const { cloudinary } = require("../cloudConfig");


module.exports.renderSignupForm =  (req , res) => {
    res.render("users/signup.ejs");
};


module.exports.signup = async (req, res, next) => {
   try {
     const { username, email, password } = req.body;
     // Assign role only on the backend using the trusted admin email from env
     const role = email === process.env.ADMIN_EMAIL ? "admin" : "user";
     const newUser = new User({ email, username, role });
     const registeredUser = await User.register(newUser, password);
     req.login(registeredUser, (err) => {
       if (err) {
         return next(err);
       }
       req.flash("success", "Welcome to wanderlust");
       res.redirect("/listings");
     });
   } catch (e) {
      req.flash("error", e.message);
      res.redirect("/signup");
   }
};

module.exports.renderLoginForm =(req, res) =>{
   res.render("users/login.ejs")
};


module.exports.Login =async(req, res) => {
            req.flash("success", "Welcome back to Wanderlust!");
            let redirectUrl = res.locals.redirectUrl || "/listings";
            res.redirect(redirectUrl);
};



module.exports.Logout =(req , res , next) =>{
   req.logout((err)=> {
      if(err){
         return next(err);
      }
      req.flash("success","you are logged out!");
      res.redirect("/listings");
   });
};


// Profile Routes
module.exports.renderProfile = async (req, res) => {
   try {
      const user = await User.findById(req.user._id);
      res.render("users/profile", { user });
   } catch(e) {
      req.flash("error", "Could not load profile");
      res.redirect("/listings");
   }
};


module.exports.renderEditForm = async (req, res) => {
   try {
      const user = await User.findById(req.user._id);
      res.render("users/edit", { user });
   } catch(e) {
      req.flash("error", "Could not load edit form");
      res.redirect("/profile");
   }
};


module.exports.updateProfile = async (req, res) => {
   try {
      const { username, email, password } = req.body;
      const user = await User.findById(req.user._id);
      
      // Update username and email
      if(username) user.username = username;
      if(email) user.email = email;

      // Handle profile picture upload
      if(req.file) {
         // Delete old image from Cloudinary if it exists
         if(user.image?.filename) {
            await cloudinary.uploader.destroy(user.image.filename);
         }
         
         // Save new image
         user.image = {
            url: req.file.path,
            filename: req.file.filename
         };
      }

      // Update password if provided
      if(password) {
         await user.setPassword(password);
      }

      await user.save();
      
      // Re-authenticate user with updated info
      req.login(user, (err) => {
         if(err) {
            req.flash("error", "Error updating profile");
            return res.redirect("/profile/edit");
         }
         req.flash("success", "Profile updated successfully!");
         res.redirect("/profile");
      });

   } catch(e) {
      req.flash("error", e.message);
      res.redirect("/profile/edit");
   }
};