// ============================================================
// CORRECTED: app.js - MIDDLEWARE CONFIGURATION FOR CANCEL BOOKING
// ============================================================

// This is the CORRECT ORDER of middleware in app.js

const express = require("express");
const app = express();
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const passport = require("passport");
// ... other imports ...

// ============================================================
// STEP 1: BODY PARSING MIDDLEWARE
// ============================================================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============================================================
// STEP 2: METHOD OVERRIDE - CRITICAL FOR PUT/DELETE
// ============================================================
// ✅ IMPORTANT: This MUST come AFTER urlencoded
// This middleware allows HTML forms (which only support GET/POST)
// to send PUT/DELETE requests using the _method parameter
app.use(methodOverride("_method"));

// ============================================================
// STEP 3: VIEW ENGINE SETUP
// ============================================================
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);

// ============================================================
// STEP 4: STATIC FILES
// ============================================================
app.use(express.static(path.join(__dirname, "public")));

// ============================================================
// STEP 5: SESSION SETUP
// ============================================================
app.use(session(sessionOptions));
app.use(flash());

// ============================================================
// STEP 6: PASSPORT AUTHENTICATION
// ============================================================
app.use(passport.initialize());
app.use(passport.session());

// ============================================================
// STEP 7: CUSTOM MIDDLEWARE
// ============================================================
app.use((req, res, next) => {
  res.locals.currUser = req.user;
  next();
});

// ============================================================
// STEP 8: ROUTE ROUTERS
// ============================================================
// These MUST come AFTER all middleware
const listingsRouter = require("./routes/listing");
const reviewsRouter = require("./routes/review");
const userRouter = require("./routes/user");
const bookingRouter = require("./routes/booking");

app.use("/listings", listingsRouter);
app.use("/reviews", reviewsRouter);
app.use("/users", userRouter);
app.use("/bookings", bookingRouter);  // ✅ Booking router mounted with /bookings prefix

// ============================================================
// CRITICAL NOTES FOR 404 FIX:
// ============================================================

/*
❌ WRONG ORDER - Will cause 404:
  app.use(express.urlencoded({ extended: true }));
  app.use("/bookings", bookingRouter);      // Routes before middleware!
  app.use(methodOverride("_method"));       // Middleware after routes!

✅ CORRECT ORDER - Works perfectly:
  app.use(express.urlencoded({ extended: true }));
  app.use(methodOverride("_method"));       // Middleware BEFORE routes
  app.use("/bookings", bookingRouter);      // Routes after middleware

REASON:
- methodOverride middleware needs to see the request BEFORE
  it reaches the route handler
- If route is registered first, method-override can't convert
  POST to PUT, so no matching route found = 404!
*/

// ============================================================
// TEST ROUTE - Verify method-override works
// ============================================================
app.post("/test-method-override", (req, res) => {
  console.log("Request method:", req.method);
  console.log("_method value:", req.body._method);
  res.send(`Method: ${req.method}, _method: ${req.body._method}`);
});

// ============================================================
// ERROR HANDLING
// ============================================================
app.all("*", (req, res, next) => {
  next(new ExpressError("Page Not Found", 404));
});

app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  res.status(statusCode).render("error", { err });
});

module.exports = app;
