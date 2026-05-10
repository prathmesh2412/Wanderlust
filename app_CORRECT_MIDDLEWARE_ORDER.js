


const express = require("express");
const app = express();
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const passport = require("passport");

//  BODY PARSING MIDDLEWARE
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// METHOD OVERRIDE - CRITICAL FOR PUT/DELETE

app.use(methodOverride("_method"));

//  VIEW ENGINE SETUP
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);

// STATIC FILES
app.use(express.static(path.join(__dirname, "public")));

// SESSION SETUP
app.use(session(sessionOptions));
app.use(flash());

//  PASSPORT AUTHENTICATION
app.use(passport.initialize());
app.use(passport.session());

// CUSTOM MIDDLEWARE
app.use((req, res, next) => {
  res.locals.currUser = req.user;
  next();
});

//  ROUTE ROUTERS
const listingsRouter = require("./routes/listing");
const reviewsRouter = require("./routes/review");
const userRouter = require("./routes/user");
const bookingRouter = require("./routes/booking");

app.use("/listings", listingsRouter);
app.use("/reviews", reviewsRouter);
app.use("/users", userRouter);
app.use("/bookings", bookingRouter);  // ✅ Booking router mounted with /bookings prefix


// TEST ROUTE - Verify method-override works
app.post("/test-method-override", (req, res) => {
  console.log("Request method:", req.method);
  console.log("_method value:", req.body._method);
  res.send(`Method: ${req.method}, _method: ${req.body._method}`);
});

// ERROR HANDLING
app.all("*", (req, res, next) => {
  next(new ExpressError("Page Not Found", 404));
});

app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  res.status(statusCode).render("error", { err });
});

module.exports = app;
