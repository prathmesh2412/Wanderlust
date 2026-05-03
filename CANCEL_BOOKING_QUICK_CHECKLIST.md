# ✅ Cancel Booking - Quick Reference Checklist

## 🎯 The Problem
Clicking "Cancel Booking" button returns **404 error** instead of canceling the booking.

## 🔧 The Solution Checklist

### 1. METHOD-OVERRIDE MIDDLEWARE ⚙️
```javascript
// app.js - Line order matters!
app.use(express.urlencoded({ extended: true }));        // 1️⃣ FIRST
app.use(methodOverride("_method"));                     // 2️⃣ SECOND
app.use("/bookings", bookingRouter);                    // 3️⃣ THIRD (after middleware)
```
- [ ] Installed? `npm list method-override`
- [ ] Position correct? AFTER urlencoded, BEFORE routes
- [ ] Spelling correct? `methodOverride` (camelCase)

### 2. ROUTE DEFINITION ✅
```javascript
// routes/booking.js
router.put("/:id/cancel", isLoggedIn, wrapAsync(bookingController.cancelBooking));
```
- [ ] Method is `PUT` (not POST or DELETE)
- [ ] Path is `/:id/cancel` (matches form action)
- [ ] Has `isLoggedIn` middleware
- [ ] Has `wrapAsync` wrapper
- [ ] Function exported: `module.exports.cancelBooking`

### 3. CONTROLLER LOGIC 🎮
```javascript
// controllers/bookings.js
module.exports.cancelBooking = async (req, res) => {
  const { id } = req.params;
  const booking = await Booking.findById(id);
  
  // Edge cases
  if (!booking) return res.redirect("/bookings/history");
  if (!booking.user.equals(req.user._id)) return res.redirect("/bookings/history");
  if (booking.status === "Cancelled") return res.redirect("/bookings/history");
  
  // Cancel
  booking.status = "Cancelled";
  booking.cancelledAt = new Date();
  await booking.save();
  
  res.redirect("/bookings/history");
};
```
- [ ] Function handles not found
- [ ] Function checks authorization
- [ ] Function checks already cancelled
- [ ] Function checks 24-hour rule
- [ ] Updates status to "Cancelled"
- [ ] Sets cancelledAt timestamp

### 4. EJS FORM ✏️
```html
<form 
  action="/bookings/<%= booking._id %>/cancel" 
  method="POST"
  onsubmit="return confirm('Sure?');">
  
  <input type="hidden" name="_method" value="PUT">
  <button type="submit" class="btn btn-danger">Cancel Booking</button>
</form>
```
- [ ] Form method is `POST` (not PUT)
- [ ] Hidden input `_method=PUT` present
- [ ] Action path matches route: `/bookings/<%= booking._id %>/cancel`
- [ ] Confirmation popup with `onsubmit`
- [ ] Button only shows if not already cancelled
- [ ] Button only shows if payment successful

### 5. VERIFY WITH BROWSER 🌐

**Step 1:** Open Developer Tools (F12)

**Step 2:** Go to Network tab

**Step 3:** Click "Cancel Booking"

**Step 4:** Look at the request:
- [ ] URL: `/bookings/[bookingId]/cancel`
- [ ] Method: `PUT` (not POST)
- [ ] Status: 200 or 302 (not 404)

**Step 5:** Check server console:
```
✅ PUT /cancel route HIT!
```

---

## 🚨 IF STILL 404

Run this checklist:

1. **Kill and restart server:**
   ```bash
   # Ctrl+C to stop
   npm start
   ```

2. **Hard refresh browser:**
   ```
   Ctrl+Shift+R (Windows/Linux)
   Cmd+Shift+R (Mac)
   ```

3. **Check middleware order in app.js:**
   ```bash
   grep -n "methodOverride\|urlencoded\|bookingRouter" app.js
   ```
   Should show: urlencoded first, then methodOverride, then bookingRouter

4. **Check route in routes/booking.js:**
   ```bash
   grep -n "router.put.*cancel" routes/booking.js
   ```
   Should show: `router.put("/:id/cancel", ...)`

5. **Test form submission in browser console:**
   ```javascript
   document.querySelector('form').submit();
   ```

6. **Check server logs for errors:**
   Look for red/error messages in terminal

7. **Verify Booking model has correct fields:**
   ```bash
   grep -A2 "status:\|cancelledAt:" models/booking.js
   ```

---

## 📊 Quick Troubleshooting Map

| Symptom | Cause | Fix |
|---------|-------|-----|
| 404 error | methodOverride after routes | Move methodOverride BEFORE routes in app.js |
| Form submits but nothing happens | Form method is PUT (should be POST) | Change form method to POST, add _method=PUT |
| Form action wrong | _id variable not rendering | Check EJS syntax: `<%= booking._id %>` |
| Page refreshes, no change | Controller not updating database | Add `await booking.save()` in controller |
| Can't click button | Button hidden by condition | Check `if (booking.status !== 'Cancelled')` |
| Confirmation popup doesn't show | onsubmit return value wrong | Use `return confirm(...)` |

---

## 🧪 Test Scenarios

✅ **Test 1: Cancel a confirmed booking**
- Status should change to "Cancelled"
- Button should disappear
- Success message should show

✅ **Test 2: Try to cancel same booking again**
- Error message: "This booking is already cancelled"
- Should redirect to history

✅ **Test 3: Cancel within 24 hours**
- Error message: "Can only cancel 24 hours before check-in"
- Booking should NOT be cancelled

✅ **Test 4: Network request inspection**
- Network tab shows PUT method (not POST)
- Status code 302 (redirect)
- Response header Location: /bookings/history

---

## 🔗 Mapping to Your Existing Code

Your code already has most of it! You just need to verify:

✅ **app.js** (line ~56):
```javascript
app.use(methodOverride("_method"));  // Should be here
```

✅ **routes/booking.js** (line ~21):
```javascript
router.put("/:id/cancel", isLoggedIn, wrapAsync(bookingController.cancelBooking));
```

✅ **controllers/bookings.js** (line ~277):
```javascript
module.exports.cancelBooking = async (req, res) => { ... }
```

✅ **views/bookings/history.ejs** (line ~98):
```html
<form ... method="POST" ...>
  <input type="hidden" name="_method" value="PUT">
```

---

## 💡 Common Code Issues

### ❌ Wrong: Form method is PUT
```html
<form method="PUT">  <!-- HTML forms don't support PUT -->
```

### ✅ Right: Form uses POST with _method hidden input
```html
<form method="POST">
  <input type="hidden" name="_method" value="PUT">
</form>
```

### ❌ Wrong: methodOverride after routes
```javascript
app.use("/bookings", bookingRouter);
app.use(methodOverride("_method"));
```

### ✅ Right: methodOverride before routes
```javascript
app.use(methodOverride("_method"));
app.use("/bookings", bookingRouter);
```

### ❌ Wrong: Route uses POST
```javascript
router.post("/:id/cancel", ...);
```

### ✅ Right: Route uses PUT
```javascript
router.put("/:id/cancel", ...);
```

---

## 🎓 What You'll Learn

- How REST methods work (GET, POST, PUT, DELETE)
- How method-override enables PUT/DELETE in HTML forms
- Why middleware order matters in Express
- How to debug routing issues with DevTools
- How to implement proper CRUD operations

---

## 📝 Final Verification

Before submitting to production:

```
✅ npm start works without errors
✅ No 404 errors in browser console
✅ Can cancel a confirmed booking
✅ Booking status updates to "Cancelled"
✅ Cannot cancel already cancelled booking
✅ Cannot cancel within 24 hours
✅ Server logs show PUT request hit
✅ Flash message shows success/error
✅ Redirects to /bookings/history
✅ All edge cases handled
```

---

## 🆘 Emergency Reset

If nothing works:

```bash
# 1. Clear cache
rm -r node_modules package-lock.json

# 2. Reinstall
npm install

# 3. Restart server
npm start

# 4. Hard refresh browser
Ctrl+Shift+R
```

---

**Status:** ✅ Ready to implement!  
**Time to implement:** 15 minutes  
**Difficulty:** Beginner-friendly  

