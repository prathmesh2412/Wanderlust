# 🚀 Cancel Booking - Complete Implementation Guide

## 📋 Quick Summary

The 404 error when canceling a booking is typically caused by **incorrect middleware order** or **missing method-override** configuration. This guide provides the complete, tested solution.

---

## 🔧 Step-by-Step Implementation

### STEP 1: Install method-override (If Not Already Installed)

```bash
npm install method-override
```

Verify it's installed:
```bash
npm list method-override
```

### STEP 2: Fix app.js Middleware Order

Your `app.js` needs middleware in this EXACT order:

```javascript
// 1️⃣ FIRST: Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 2️⃣ SECOND: Method override (MUST be after urlencoded)
app.use(methodOverride("_method"));

// 3️⃣ THIRD: View engine
app.set("view engine", "ejs");
// ... other setup ...

// 4️⃣ FOURTH: Routes (AFTER all middleware)
app.use("/bookings", bookingRouter);
```

**WHY THIS ORDER MATTERS:**
- `methodOverride` intercepts the request before routing
- If you register routes first, `methodOverride` won't work
- Result: 404 error!

### STEP 3: Verify routes/booking.js Route

Your route must use `PUT` method:

```javascript
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync");
const { isLoggedIn } = require("../middleware");
const bookingController = require("../controllers/bookings");

// ✅ CORRECT - PUT method with :id parameter
router.put(
  "/:id/cancel",
  isLoggedIn,
  wrapAsync(bookingController.cancelBooking)
);

module.exports = router;
```

### STEP 4: Add Controller Function

In `controllers/bookings.js`:

```javascript
module.exports.cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id);

    // Check if booking exists
    if (!booking) {
      req.flash("error", "Booking not found.");
      return res.redirect("/bookings/history");
    }

    // Check if user owns the booking
    if (!booking.user.equals(req.user._id)) {
      req.flash("error", "You can only cancel your own bookings.");
      return res.redirect("/bookings/history");
    }

    // Check if already cancelled
    if (booking.status === "Cancelled") {
      req.flash("error", "This booking is already cancelled.");
      return res.redirect("/bookings/history");
    }

    // Check if 24 hours before check-in
    const now = new Date();
    const hoursToCheckIn = (booking.checkIn - now) / (1000 * 60 * 60);
    
    if (hoursToCheckIn < 24) {
      req.flash(
        "error",
        "Bookings can only be cancelled at least 24 hours before check-in."
      );
      return res.redirect("/bookings/history");
    }

    // Update booking status
    booking.status = "Cancelled";
    booking.cancelledAt = new Date();
    await booking.save();

    req.flash("success", "Booking cancelled successfully.");
    res.redirect("/bookings/history");

  } catch (error) {
    console.error("Error cancelling booking:", error);
    req.flash("error", "An error occurred while cancelling the booking.");
    res.redirect("/bookings/history");
  }
};
```

### STEP 5: Fix the EJS Form

In `views/bookings/history.ejs`:

```html
<!-- ✅ CORRECT FORM STRUCTURE -->
<% if (booking.status !== 'Cancelled' && booking.paymentStatus === 'success') { %>
    <form 
        action="/bookings/<%= booking._id %>/cancel" 
        method="POST"
        onsubmit="return confirm('Are you sure you want to cancel this booking?');">
        
        <!-- ✅ CRITICAL: _method=PUT -->
        <input type="hidden" name="_method" value="PUT">
        
        <button type="submit" class="btn btn-danger">
            Cancel Booking
        </button>
    </form>
<% } %>
```

**KEY POINTS:**
- Form method: `POST` (not PUT - HTML doesn't support PUT)
- Hidden input: `_method=PUT` (tells middleware to convert to PUT)
- Action: `/bookings/<%= booking._id %>/cancel` (matches the route)
- Confirmation: `onsubmit` popup

---

## 🐛 Debugging Steps

### 1. Check if method-override is installed
```bash
npm list method-override
```

### 2. Add debugging logs to routes/booking.js
```javascript
router.use((req, res, next) => {
  console.log("🔍 Request:", req.method, req.path);
  next();
});

router.put("/:id/cancel", isLoggedIn, (req, res, next) => {
  console.log("✅ PUT /cancel route HIT!");
  next();
}, wrapAsync(bookingController.cancelBooking));
```

### 3. Open browser Developer Tools (F12)
1. Go to Network tab
2. Click "Cancel Booking"
3. Look for the request:
   - Should show `/bookings/[bookingId]/cancel`
   - Should show `PUT` method (not POST)
   - If 404, the route didn't match

### 4. Check server console
When you click cancel, you should see:
```
🔍 Request: PUT /cancel
✅ PUT /cancel route HIT!
```

### 5. Test method-override separately
```javascript
// Add temporary test route in app.js
app.post("/test", (req, res) => {
  console.log("Method:", req.method);
  console.log("_method:", req.body._method);
  res.send(`OK - Method is ${req.method}`);
});

// In browser console, run:
// fetch('/test', {
//   method: 'POST',
//   headers: {'Content-Type': 'application/x-www-form-urlencoded'},
//   body: '_method=PUT'
// })
// If you see "Method is PUT", then method-override works!
```

---

## ✅ Complete Verification Checklist

Go through each item:

- [ ] `npm list method-override` shows method-override is installed
- [ ] `app.js` has `app.use(methodOverride("_method"))` AFTER `urlencoded`
- [ ] `routes/booking.js` has route: `router.put("/:id/cancel", ...)`
- [ ] Controller function `module.exports.cancelBooking` exists
- [ ] `app.js` has `app.use("/bookings", bookingRouter)`
- [ ] EJS form has `method="POST"` with `_method=PUT` hidden input
- [ ] Form action is `/bookings/<%= booking._id %>/cancel`
- [ ] Browser Network tab shows PUT request (not POST)
- [ ] Server console shows "PUT /cancel route HIT!"
- [ ] Booking is cancelled successfully and status updates to "Cancelled"
- [ ] User is redirected to `/bookings/history` after cancellation
- [ ] Flash message shows success confirmation

---

## 🚨 Common Mistakes

### ❌ Mistake 1: Wrong middleware order
```javascript
app.use("/bookings", bookingRouter);      // Routes first
app.use(methodOverride("_method"));       // Middleware after routes
```
**Fix:** Put middleware BEFORE routes

### ❌ Mistake 2: Using PUT in form method
```html
<form method="PUT" action="/bookings/cancel">  <!-- ❌ Wrong -->
```
**Fix:** Use `method="POST"` with `_method=PUT` hidden input

### ❌ Mistake 3: Typo in _method
```html
<input name="method" value="PUT">         <!-- ❌ Wrong - should be _method -->
<input name="_method" value="put">        <!-- ✅ Correct - PUT in caps -->
```

### ❌ Mistake 4: Route uses POST instead of PUT
```javascript
router.post("/:id/cancel", ...);          <!-- ❌ Wrong -->
router.put("/:id/cancel", ...);           <!-- ✅ Correct -->
```

### ❌ Mistake 5: Form path doesn't match route
```javascript
// Route: router.put("/cancel/:id", ...);
// Form: action="/bookings/<%= booking._id %>/cancel"  <!-- ❌ Mismatch -->
```
**Fix:** Ensure both use same path pattern

### ❌ Mistake 6: method-override not installed
```bash
npm install method-override  <!-- Run this if not already installed -->
```

---

## 🧪 Test the Implementation

### Manual Test Steps

1. **Start server:**
   ```bash
   npm start
   ```

2. **Open browser:** http://localhost:3000

3. **Navigate to booking history:** Click "My Bookings" or go to `/bookings/history`

4. **Find a confirmed booking:** Look for one with "Confirmed" status

5. **Click "Cancel Booking":**
   - Should show confirmation popup: "Are you sure you want to cancel this booking?"
   - Click "OK" to confirm

6. **Verify:**
   - Should see green success message: "Booking cancelled successfully."
   - Booking status should change from "Confirmed" to "Cancelled"
   - "Cancel Booking" button should disappear for that booking

7. **Check Server Console:**
   - Should show logs like:
     ```
     🔍 Request: PUT /cancel
     ✅ PUT /cancel route HIT!
     ✅ Booking cancelled successfully!
     ```

---

## 📁 Files to Update/Check

| File | Action | Reason |
|------|--------|--------|
| `app.js` | Update middleware order | Put methodOverride before routes |
| `routes/booking.js` | Verify PUT route exists | Must use PUT method, not POST |
| `controllers/bookings.js` | Add/update cancelBooking function | Must handle all edge cases |
| `views/bookings/history.ejs` | Update form structure | Form must use POST + _method=PUT |
| `models/booking.js` | Verify schema fields | Must have status and cancelledAt fields |

---

## 🎯 Edge Cases Handled

✅ **Booking not found** - Shows error message  
✅ **Unauthorized user** - Only owner can cancel  
✅ **Already cancelled** - Can't cancel twice  
✅ **Cancellation within 24 hours** - Not allowed  
✅ **User not authenticated** - isLoggedIn middleware required  
✅ **Payment status** - Only confirmed bookings can be cancelled  
✅ **Database error** - Try-catch handles errors gracefully  

---

## 💡 How method-override Works

```
User submits form:
  <form method="POST" action="/bookings/123/cancel">
    <input name="_method" value="PUT">
  </form>

Browser sends:
  POST /bookings/123/cancel
  Body: _method=PUT

method-override middleware intercepts:
  Sees _method=PUT in body
  Changes req.method from POST to PUT

Express router matches:
  router.put("/:id/cancel", handler)
  
Result:
  Handler executes successfully!
```

---

## 🔗 Related Resources

- Express method-override docs: https://github.com/expressjs/method-override
- RESTful routing with HTML forms: https://expressjs.com/en/guide/routing.html
- HTTP methods: https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods

---

## ❓ Still Not Working?

1. **Clear browser cache:** Ctrl+Shift+Delete, then Ctrl+Shift+R
2. **Restart Node server:** Ctrl+C, then `npm start`
3. **Check for typos:** Especially `_method` vs `method`
4. **Verify MongoDB connection:** Check Atlas clusters
5. **Check console for errors:** Look at both browser and server consoles
6. **Reinstall dependencies:** `rm node_modules` then `npm install`

---

## 🎓 Learning Resources

**What you learned:**
- How method-override converts POST to PUT for HTML forms
- Why middleware order matters in Express
- How to implement proper REST API methods
- How to handle edge cases in booking cancellation

**Best Practices:**
- Always log requests for debugging
- Verify user authorization before updates
- Handle all edge cases (not found, unauthorized, etc.)
- Use flash messages for user feedback
- Test with browser DevTools Network tab

