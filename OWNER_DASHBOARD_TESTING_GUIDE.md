# Owner Dashboard - Testing Guide

## 🧪 Complete Testing Procedures

---

## ✅ Pre-Testing Checklist

- [ ] MongoDB is running
- [ ] Express server is running (`npm start`)
- [ ] Both users created in database
- [ ] Test data verified
- [ ] Browser console open (for debugging)
- [ ] Network tab open (for API calls)

---

## 📋 Test Case 1: Basic Dashboard Access

### Setup:
```
1. Create Listing A (owned by User 1)
2. Create Booking with:
   - Listing: A
   - Guest: User 2
   - Payment Status: "success"
   - Total Price: ₹25,000
```

### Test Steps:
```
1. Login as User 1 (listing owner)
2. Navigate to: http://localhost:8080/owner/dashboard
3. Wait for page to load (should show loading spinner)
4. Verify dashboard appears with:
   ✓ Header: "Owner Dashboard"
   ✓ Stat cards with numbers
   ✓ Booking card with correct details
```

### Expected Results:
```
✅ Dashboard loads successfully
✅ Loading spinner appears then disappears
✅ Stat cards show:
   - Total Bookings: 1
   - Total Earnings: ₹25,000
   - Completed Bookings: 1
✅ Booking card displays:
   - Listing title
   - Guest name
   - Guest email
   - Check-in date
   - Check-out date
   - Total price
   - "✓ Success" badge
```

### Pass/Fail:
- **PASS** if all verifications succeed
- **FAIL** if any verification fails → check console for errors

---

## 📋 Test Case 2: API Response Validation

### Setup:
```
Same as Test Case 1
```

### Test Steps (Using Browser DevTools):
```
1. Open Browser DevTools (F12)
2. Go to Network tab
3. Login as User 1
4. Navigate to /owner/dashboard
5. Look for request to "bookings" endpoint
6. Click on it to view response
```

### Expected Response:
```json
{
  "success": true,
  "bookings": [
    {
      "_id": "...",
      "listing": {
        "title": "Your Listing Title",
        "price": 5000
      },
      "user": {
        "username": "guest_username",
        "email": "guest@example.com"
      },
      "checkIn": "2024-06-15T00:00:00.000Z",
      "checkOut": "2024-06-20T00:00:00.000Z",
      "totalPrice": 25000,
      "paymentStatus": "success"
    }
  ],
  "totalBookings": 1,
  "totalEarnings": 25000,
  "message": "Owner bookings fetched successfully"
}
```

### Validation:
```
✅ Status code: 200
✅ success: true
✅ bookings array contains data
✅ Each booking has required fields
✅ totalBookings matches array length
✅ totalEarnings is a number
```

### Pass/Fail:
- **PASS** if all validations match
- **FAIL** if response structure differs

---

## 📋 Test Case 3: Multiple Bookings

### Setup:
```
1. Create Listing B (owned by User 1)
2. Create Listing C (owned by User 1)
3. Create 5 Bookings:
   - Booking 1: Listing A, Guest User 2, Success, ₹25,000
   - Booking 2: Listing B, Guest User 3, Success, ₹14,000
   - Booking 3: Listing C, Guest User 4, Success, ₹12,600
   - Booking 4: Listing A, Guest User 5, Success, ₹19,600
   - Booking 5: Listing B, Guest User 6, Success, ₹42,000
```

### Test Steps:
```
1. Login as User 1
2. Navigate to /owner/dashboard
3. Wait for full load
4. Count booking cards
5. Verify statistics
6. Scroll through all cards
```

### Expected Results:
```
✅ Dashboard shows:
   - Total Bookings: 5
   - Total Earnings: ₹1,13,200
   - Completed Bookings: 5
✅ All 5 booking cards visible
✅ Cards are responsive (grid layout)
✅ All card data correct
✅ No duplicate cards
```

### Calculations to Verify:
```
Total Earnings = 25000 + 14000 + 12600 + 19600 + 42000 = 113,200 ✓
```

### Pass/Fail:
- **PASS** if all bookings visible and stats correct
- **FAIL** if missing bookings or wrong totals

---

## 📋 Test Case 4: Filter - Successful Bookings Only

### Setup:
```
Create 4 Bookings:
- Booking 1: Success, ₹25,000 ✓
- Booking 2: Pending, ₹14,000 ✗ (should not show)
- Booking 3: Failed, ₹12,600 ✗ (should not show)
- Booking 4: Success, ₹19,600 ✓
```

### Test Steps:
```
1. Login as User 1
2. Navigate to /owner/dashboard
3. Verify visible bookings
4. Check stats
```

### Expected Results:
```
✅ Dashboard shows ONLY 2 bookings (success only)
✅ Pending and failed bookings hidden
✅ Total Bookings: 2
✅ Total Earnings: ₹44,600 (25000 + 19600)
```

### Verify:
```
✓ Booking 1 (Success) → VISIBLE
✓ Booking 2 (Pending) → HIDDEN
✓ Booking 3 (Failed) → HIDDEN
✓ Booking 4 (Success) → VISIBLE
```

### Pass/Fail:
- **PASS** if only successful bookings shown
- **FAIL** if pending/failed bookings appear

---

## 📋 Test Case 5: Authentication - Not Logged In

### Setup:
```
User is logged out
```

### Test Steps:
```
1. Open browser
2. Navigate to: http://localhost:8080/owner/dashboard
```

### Expected Results:
```
✅ Redirected to /login page
OR
✅ Shows login form
OR
✅ Shows "You must be logged in" message
```

### Alternative Test (API Direct):
```
1. Open DevTools Console
2. Run: fetch("/owner/bookings").then(r => r.json()).then(console.log)
3. Check response
```

### Expected Response:
```
Status: 401 or redirect to /login
```

### Pass/Fail:
- **PASS** if redirected or denied access
- **FAIL** if can access without login

---

## 📋 Test Case 6: Authorization - Not the Owner

### Setup:
```
1. User A creates Listing X
2. User B books Listing X with payment "success"
3. User B also creates Listing Y
4. User A books Listing Y with payment "success"
```

### Test Steps:
```
1. Login as User A
2. Navigate to /owner/dashboard
3. Note visible bookings
4. Logout
5. Login as User B
6. Navigate to /owner/dashboard
7. Note visible bookings
```

### Expected Results:
```
User A Dashboard:
✅ Shows only Booking 1 (A is owner of Listing X)
✅ Does NOT show Booking 2 (A didn't create Listing Y)
✅ Total Bookings: 1

User B Dashboard:
✅ Shows only Booking 2 (B is owner of Listing Y)
✅ Does NOT show Booking 1 (B didn't create Listing X)
✅ Total Bookings: 1
```

### Verify:
```
✓ User A sees only their listings' bookings
✓ User B sees only their listings' bookings
✓ No cross-user data leakage
✓ Owner verification works
```

### Pass/Fail:
- **PASS** if each user sees only own bookings
- **FAIL** if user can see other user's bookings

---

## 📋 Test Case 7: Empty State

### Setup:
```
User 1 has created no bookings (or no successful bookings)
```

### Test Steps:
```
1. Login as User 1
2. Navigate to /owner/dashboard
3. Wait for load
```

### Expected Results:
```
✅ Shows "No Bookings Yet" message
✅ Shows icon (📭)
✅ Shows "View Listings" button
✅ Stats show: 0 bookings, ₹0 earnings
✅ No booking cards displayed
✅ Empty state centered and styled nicely
```

### Pass/Fail:
- **PASS** if empty state displays correctly
- **FAIL** if shows error or empty grid

---

## 📋 Test Case 8: Date Formatting

### Setup:
```
Create booking with:
- checkIn: "2024-06-15T10:30:00.000Z"
- checkOut: "2024-06-20T14:45:00.000Z"
```

### Test Steps:
```
1. Login as owner
2. Navigate to dashboard
3. Check booking card
```

### Expected Results:
```
✅ Check-in shows: "Jun 15, 2024" (not full timestamp)
✅ Check-out shows: "Jun 20, 2024"
✅ Dates are human-readable
✅ Format consistent across all cards
```

### Verify:
```
✓ Not showing: "2024-06-15T10:30:00.000Z"
✓ Showing: "Jun 15, 2024"
✓ Readable and formatted
```

### Pass/Fail:
- **PASS** if dates formatted properly
- **FAIL** if showing raw ISO format

---

## 📋 Test Case 9: Currency Formatting

### Setup:
```
Create bookings with prices:
- ₹1000
- ₹100000
- ₹1213200
```

### Test Steps:
```
1. Navigate to dashboard
2. Check price display
```

### Expected Results:
```
✅ ₹1,000 (with comma)
✅ ₹1,00,000 (with Indian numbering)
✅ ₹12,13,200 (proper formatting)
```

### Verify:
```
✓ Large numbers have commas
✓ Indian numbering system used
✓ All prices show ₹ symbol
✓ Readable format
```

### Pass/Fail:
- **PASS** if currency formatted correctly
- **FAIL** if showing without formatting

---

## 📋 Test Case 10: Responsive Design

### Desktop Test (1920x1080):
```
1. Open dashboard
2. Verify layout:
   ✓ 3 stat cards in one row
   ✓ Multiple booking cards per row
   ✓ Full use of width
   ✓ Spacing looks good
```

### Tablet Test (768x1024):
```
1. Open DevTools → Toggle Device Toolbar
2. Set to iPad size
3. Verify:
   ✓ 2 stat cards per row (or responsive)
   ✓ Booking cards adjust width
   ✓ Text readable
   ✓ No horizontal scroll
```

### Mobile Test (375x667):
```
1. Set to iPhone size
2. Verify:
   ✓ 1 stat card per row (stack)
   ✓ Full width booking cards
   ✓ All content visible
   ✓ No overflow
   ✓ Touch-friendly spacing
```

### Pass/Fail:
- **PASS** if responsive on all breakpoints
- **FAIL** if layout breaks on any device

---

## 📋 Test Case 11: Error Handling

### Network Error Test:
```
1. Open DevTools Network tab
2. Set throttling to "Offline"
3. Navigate to /owner/dashboard
4. Check for error message
```

### Expected:
```
✅ Error message displays: "Failed to load bookings"
✅ Helpful error shown (not technical)
✅ Page doesn't crash
✅ Can retry
```

### Server Error Test:
```
1. Stop MongoDB temporarily
2. Try to load dashboard
3. Check response
```

### Expected:
```
✅ API returns 500 error
✅ Frontend displays error message
✅ No page crash
✅ User sees what happened
```

### Pass/Fail:
- **PASS** if error handled gracefully
- **FAIL** if page crashes or shows technical errors

---

## 📋 Test Case 12: Calculations

### Earnings Calculation Test:
```
Create 3 bookings:
- Booking 1: ₹10,000
- Booking 2: ₹25,000
- Booking 3: ₹8,500
```

### Expected:
```
Total Earnings = 10,000 + 25,000 + 8,500 = 43,500
Dashboard shows: ₹43,500
```

### Nights Calculation:
```
Booking: 2024-06-15 to 2024-06-20
Expected: 5 nights
```

### Pass/Fail:
- **PASS** if all calculations correct
- **FAIL** if totals wrong

---

## 📋 Test Case 13: XSS Protection

### Test Malicious Input:
```
1. Create listing with title: "<img src=x onerror=alert('XSS')>"
2. Create booking with guest username: "'; DROP TABLE bookings; --"
3. View dashboard
```

### Expected:
```
✅ No alerts triggered
✅ HTML rendered as text, not executed
✅ Malicious code is escaped
✅ Page loads normally
✅ No SQL injection possible
```

### Verify:
```
✓ Title shows as text, not executed
✓ Username shows as text
✓ No JavaScript execution
✓ HTML special characters escaped
```

### Pass/Fail:
- **PASS** if XSS prevented
- **FAIL** if code executes

---

## 📋 Test Case 14: Loading State

### Test Steps:
```
1. Open DevTools Network tab
2. Set throttling to "Slow 3G"
3. Navigate to /owner/dashboard
4. Watch loading process
```

### Expected:
```
✅ Loading spinner appears
✅ Spinner animates smoothly
✅ After data loads: spinner disappears
✅ Content appears
✅ No stuck loading state
```

### Verify:
```
✓ Spinner visible initially
✓ Spinner rotates/animates
✓ Disappears when done
✓ Content appears after
```

### Pass/Fail:
- **PASS** if loading state works correctly
- **FAIL** if stuck or not visible

---

## 📋 Test Case 15: Browser Compatibility

### Chrome Test:
```
1. Open in Chrome
2. Navigate to dashboard
3. Verify functionality
✓ All features work
```

### Firefox Test:
```
1. Open in Firefox
2. Navigate to dashboard
✓ All features work
```

### Safari Test:
```
1. Open in Safari
2. Navigate to dashboard
✓ All features work
```

### Edge Test:
```
1. Open in Edge
2. Navigate to dashboard
✓ All features work
```

### Pass/Fail:
- **PASS** if works in all browsers
- **FAIL** if incompatible with any browser

---

## 🧪 Automated Testing Checklist

```
✅ Basic access works
✅ API returns correct data
✅ Multiple bookings display
✅ Filters work (success only)
✅ Authentication required
✅ Authorization works (owner only)
✅ Empty state shows
✅ Dates formatted
✅ Currency formatted
✅ Responsive layout
✅ Errors handled
✅ Calculations correct
✅ XSS protected
✅ Loading state works
✅ Browser compatible
```

---

## 🐛 Debugging Tips

### Console Errors?
```
1. Open DevTools (F12)
2. Go to Console tab
3. Check for red errors
4. Read error message
5. Fix issue
```

### API Not Responding?
```
1. Check Network tab
2. Look for API request
3. Check status code
4. View response
5. Check server logs
```

### Wrong Data?
```
1. Check MongoDB data
2. Verify booking status = "success"
3. Check listing owner
4. Verify dates
5. Check calculations
```

### Styling Issues?
```
1. Right-click → Inspect
2. Check CSS styles
3. Look for conflicts
4. Verify responsive breakpoints
5. Check viewport size
```

---

## ✅ Sign-Off Checklist

After all tests pass:

- [ ] All 15 test cases passed
- [ ] No console errors
- [ ] No network errors
- [ ] Responsive on mobile/tablet/desktop
- [ ] Performance acceptable
- [ ] Security measures verified
- [ ] Documentation complete
- [ ] Ready for production

---

## 📝 Test Report Template

```
Test Date: ___________
Tester: ___________
Browser: ___________
OS: ___________

Test Cases Passed: ___ / 15
Failed: ___ 
Blocked: ___

Issues Found:
1. ___________
2. ___________

Status: [ ] PASS [ ] FAIL [ ] BLOCKED

Signed: ___________ Date: ___________
```

---

Generated: May 2024 | Version 1.0.0
