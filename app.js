if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}
console.log("Environment variable SECRET:", process.env.SECRET);



const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError");
const session = require("express-session");
const {isLoggedIn, isOwner, validateListing} = require("./middleware.js");
// connect-mongo exports an object with the class under a property
// so we grab the default/class itself so that .create() is available
const MongoStore = require("connect-mongo").default || require("connect-mongo");

const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user");
const multer = require('multer');
const { storage, cloudinary } = require('./cloudConfig.js');

const upload = multer({ storage });

const listingsRouter = require("./routes/listing");
const reviewsRouter = require("./routes/review");
const userRouter = require("./routes/user");
const bookingRouter = require("./routes/booking");
const ownerRouter = require("./routes/owner");



const dburl =  process.env.ATLASDB_URL; // const dburl = "mongodb://localhost:27017/wonderlust";
main()
 .then(() => {
    console.log("Connected to MongoDB");
 })
 .catch((err) =>{
    console.log(err);
 });

async function main(){
    await mongoose.connect(dburl);  
} 

app.use(express.json());
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "public")));

const store =  MongoStore.create({
    mongoUrl: dburl,
    crypto: {
        secret: process.env.SECRET,
    },
    touchAfter: 24 * 3600,
});

store.on("error",() => {
    console.log("ERROR IN SESSION STORE");
});

const sessionOptions = {
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie : {
        expires: Date.now() + 7*24*60*60*1000,
        maxAge: 7*24*60*60*1000,
        httpOnly: true
    },
};

// app.get("/", (req, res) => {
//     res.send("Welcome to Wonderlust");
// });


app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());

passport.deserializeUser(User.deserializeUser());
app.use((req, res, next) => {
  res.locals.currUser = req.user;
  next();
});

app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});


// app.get("/demouser", async (req , res) => {
//    let fakeUser =new User({
//     email:"student@gmail.com",
//     username: "delta-student",
//    });

//    let registeredUser = await User.register(fakeUser, "helloworld");
//    res.send(registeredUser); 

// });


app.get("/profile", isLoggedIn, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        res.render("users/profile.ejs", { user });
    } catch(e) {
        req.flash("error", "Could not load profile");
        res.redirect("/listings");
    }
});

app.get("/profile/edit", isLoggedIn, async (req, res) => {
    try {
        let user = await User.findById(req.user._id);
        res.render("users/edit.ejs", { user });
    } catch(e) {
        req.flash("error", "Could not load edit form");
        res.redirect("/profile");
    }
});

app.put("/profile/edit", isLoggedIn, upload.single("image"), async (req, res) => {
    try {
        let { username, email, password } = req.body;
        let user = await User.findById(req.user._id);

        user.username = username;
        user.email = email;

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
        if(password && password.length > 0) {
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
});


//Debug route to check listings data

app.use("/listings", listingsRouter);
app.use("/listings/:id/reviews", reviewsRouter);
app.use("/bookings", bookingRouter);
app.use("/owner", ownerRouter);
app.use("/", userRouter);


/*app.get("/testlisting", async(req, res) => {
    let sampleListing = new Listing({
        title: "My New Villa",
        description: "A beautiful villa with sea view",
        price : 1300,
        location: "California",
        country: "USA",
    });
    await sampleListing.save();
    console.log("sample listing saved");
    res.send("Successfully tested");
});
*/

app.use((req, res, next) => {
    next(new ExpressError(404,"Page Not Found"));
});

app.use((err ,req, res, next) =>{
    let { statusCode=500, message="Something went wrong!"} = err;
    if(!res.headersSent){
        res.status(statusCode).render("error.ejs", { message });
    }
});

app.listen(8080, () => {
    console.log("Server is running on port 8080");
});