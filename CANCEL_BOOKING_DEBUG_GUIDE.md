# 🐛 Cancel Booking - 404 Error Debug Guide

## 📋 Problem Summary
When clicking the "Cancel Booking" button, users get a "Page Not Found (404)" error instead of canceling the booking.

---

## ✅ Common Causes of 404 Error

### 1. **method-override not configured**
```javascript
// ❌ WRONG - Missing method-override
app.use(express.urlencoded({ extended: true }));

// ✅ CORRECT - method-override MUST come after urlencoded
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
```

### 2. **Route not registered**
```javascript
// ❌ WRONG - Router not mounted
const bookingRouter = require("./routes/booking");
// Missing: app.use("/bookings", bookingRouter);

// ✅ CORRECT - Router mounted with correct prefix
app.use("/bookings", bookingRouter);
```

### 3. **Wrong HTTP method in route**
```javascript
// ❌ WRONG - Using POST instead of PUT
router.post("/:id/cancel", isLoggedIn, wrapAsync(bookingController.cancelBooking));

// ✅ CORRECT - Must use PUT method
router.put("/:id/cancel", isLoggedIn, wrapAsync(bookingController.cancelBooking));
```

### 4. **Form method incorrect**
```html
<!-- ❌ WRONG - Missing _method or wrong form structure -->
<form action="/bookings/<%= booking._id %>/cancel" method="PUT">
    <button type="submit">Cancel</button>
</form>

<!-- ✅ CORRECT - POST with _method=PUT -->
<form action="/bookings/<%= booking._id %>/cancel" method="POST">
    <input type="hidden" name="_method" value="PUT">
    <button type="submit">Cancel</button>
</form>
```

### 5. **Route path mismatch**
```javascript
// ❌ WRONG - Different path in route and form
// Route: router.put("/cancel/:id", ...)
// Form: action="/bookings/<%= booking._id %>/cancel"

// ✅ CORRECT - Path must match exactly
// Route: router.put("/:id/cancel", ...)
// Form: action="/bookings/<%= booking._id %>/cancel"
```

### 6. **Controller function not exported**
```javascript
// ❌ WRONG - Function not added to module.exports
cancelBooking = async (req, res) => { ... }

// ✅ CORRECT - Function properly exported
module.exports.cancelBooking = async (req, res) => { ... }
```

### 7. **Missing middleware in route**
```javascript
// ❌ WRONG - No isLoggedIn check
router.put("/:id/cancel", wrapAsync(bookingController.cancelBooking));

// ✅ CORRECT - Middleware ensures user is authenticated
router.put("/:id/cancel", isLoggedIn, wrapAsync(bookingController.cancelBooking));
```

---

## 🔍 Step-by-Step Debugging

### Step 1: Check Browser Console & Network Tab
1. Open Developer Tools (F12)
2. Click "Cancel Booking"
3. Go to **Network** tab
4. Look for the failed request:
   - **URL should be**: `/bookings/[bookingId]/cancel`
   - **Method should be**: `PUT` (not POST)
   - **Status should be**: 404 (not found)

### Step 2: Check Server Console Logs
Add this debugging log to see if route is being hit:

```javascript
// Add to routes/booking.js BEFORE the route
router.use((req, res, next) => {
  console.log("🔍 Incoming request:", req.method, req.path);
  next();
});

// Add console log INSIDE the cancelBooking controller
module.exports.cancelBooking = async (req, res) => {
  console.log("✅ cancelBooking route HIT!");
  console.log("🆔 Booking ID:", req.params.id);
  console.log("👤 User ID:", req.user._id);
  // ... rest of code
};
```

### Step 3: Verify method-override configuration
Add this test route in app.js:

```javascript
// Add temporary test route
app.post("/test-method", (req, res) => {
  console.log("Request method:", req.method);
  console.log("Hidden _method:", req.body._method);
  res.send(`Method: ${req.method}, _method: ${req.body._method}`);
});

// Test in browser:
// Create a form with method="POST" and _method="PUT"
// If you see "Method: PUT", then method-override works
```

### Step 4: Check Route Registration Order
Routes must be registered in the CORRECT order in app.js:

```javascript
// ✅ CORRECT ORDER
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));  // MUST be before routes
app.use("/bookings", bookingRouter);
```

### Step 5: Verify route is actually defined
In terminal, run:
```bash
grep -n "router.put.*cancel" routes/booking.js
```
Should output:
```
3: router.put("/:id/cancel", isLoggedIn, wrapAsync(bookingController.cancelBooking));
```

---

## 📝 Complete Checklist

- [ ] method-override is `npm install`ed
- [ ] method-override middleware is AFTER `urlencoded` in app.js
- [ ] Route uses `router.put()` (not POST)
- [ ] Controller function `cancelBooking` is exported
- [ ] Route is registered with `app.use("/bookings", bookingRouter)`
- [ ] Form uses `method="POST"` with `_method=PUT`
- [ ] Form action path matches route: `/bookings/<%= booking._id %>/cancel`
- [ ] `isLoggedIn` middleware is present
- [ ] `wrapAsync` wrapper is present
- [ ] Booking ID is valid and exists in database
- [ ] Console logs show route is being hit
- [ ] Network tab shows PUT request (not POST)

---

## 🛠️ Quick Test

1. Add this to your browser console when on booking history page:
```javascript
// Test if method-override works
document.querySelector('form').method = 'POST';
document.querySelector('form').action = '/bookings/test-cancel/cancel';
console.log('Form ready to test');
```

2. Check server logs to see if request hits the route

3. If still 404, run in terminal:
```bash
npm list method-override
```
Should show installed version

---

## 🚀 If Still Not Working

1. **Clear Node modules and reinstall**:
   ```bash
   rm -r node_modules
   npm install
   ```

2. **Restart server**:
   ```bash
   npm start
   ```

3. **Hard refresh browser**: Ctrl + Shift + R

4. **Check for typos**:
   - `method-override` (with hyphen, not underscore)
   - `_method` (with underscore)
   - `isLoggedIn` (case-sensitive)

---

## 📊 Visual Request Flow

```
User clicks "Cancel Booking"
    ↓
Form submits: POST /bookings/bookingId/cancel with _method=PUT
    ↓
method-override middleware intercepts
    ↓
Converts to: PUT /bookings/bookingId/cancel
    ↓
Express matches route: router.put("/:id/cancel", ...)
    ↓
isLoggedIn middleware checks authentication
    ↓
wrapAsync wraps controller
    ↓
cancelBooking controller runs
    ↓
Response: Redirect to /bookings/history
```

If 404 occurs, it means one step above is failing!

---

## 💡 Pro Tips

- Use `console.log()` liberally to trace execution flow
- Check browser Network tab FIRST before looking at code
- method-override must be installed: `npm install method-override`
- The underscore in `_method` is important: `_` not `-`
- Route order matters! Middleware position matters!
- Test with simple form first, then integrate with JavaScript

