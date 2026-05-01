# Owner Dashboard API Documentation

## Overview
The Owner Dashboard feature provides a complete solution for listing owners to manage their bookings and track earnings. It includes both a REST API endpoint and a beautiful frontend dashboard.

---

## API Endpoints

### 1. GET /owner/bookings
**Description:** Fetch all successful bookings for the logged-in owner

**Authentication:** ✅ Required (Must be logged in)

**Request Headers:**
```
Content-Type: application/json
```

**Response Status Codes:**
- `200` - Success
- `401` - Unauthorized (not logged in)
- `500` - Server error

**Response Format (Success):**
```json
{
  "success": true,
  "bookings": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "listing": {
        "_id": "507f1f77bcf86cd799439012",
        "title": "Beautiful Beachfront Villa",
        "price": 5000,
        "owner": "507f1f77bcf86cd799439010"
      },
      "user": {
        "_id": "507f1f77bcf86cd799439013",
        "username": "john_traveler",
        "email": "john@example.com"
      },
      "checkIn": "2024-06-15T00:00:00.000Z",
      "checkOut": "2024-06-20T00:00:00.000Z",
      "totalPrice": 25000,
      "paymentStatus": "success",
      "createdAt": "2024-06-01T10:30:00.000Z"
    }
  ],
  "totalBookings": 5,
  "totalEarnings": 125000,
  "message": "Owner bookings fetched successfully"
}
```

**Response Format (Error):**
```json
{
  "success": false,
  "message": "Error fetching owner bookings",
  "error": "Internal server error details"
}
```

---

### 2. GET /owner/dashboard
**Description:** Render the owner dashboard page with modern UI

**Authentication:** ✅ Required (Must be logged in)

**Response:** Returns HTML page with embedded CSS and JavaScript

---

## Frontend Features

### Dashboard Components

#### 1. **Statistics Section**
- Total Bookings Count
- Total Earnings (₹)
- Completed Bookings Count

#### 2. **Booking Cards**
Each booking displays:
- Listing title
- Guest name and email
- Check-in date
- Check-out date
- Number of nights
- Total price
- Payment status badge

#### 3. **Responsive Design**
- Adapts to mobile, tablet, and desktop screens
- Card-based layout (Airbnb style)
- Smooth animations and transitions
- Modern gradient background

---

## Implementation Details

### Controller Logic (`controllers/owner.js`)

#### getOwnerBookings()
```javascript
// 1. Gets the logged-in user's ID from req.user._id
// 2. Queries bookings collection with population
// 3. Filters for listings where owner matches logged-in user
// 4. Filters for only successful payments
// 5. Calculates total earnings
// 6. Returns JSON response
```

**Filter Logic:**
- Only includes bookings where `paymentStatus === "success"`
- Uses Mongoose `match` in populate to filter by owner
- Removes null listings (non-owner bookings)

#### renderDashboard()
```javascript
// Renders the dashboard view
// Frontend loads data dynamically via /owner/bookings API
```

---

### Route Structure (`routes/owner.js`)

```
GET /owner/bookings        - API endpoint (JSON response)
GET /owner/dashboard       - Dashboard page (HTML response)
```

---

## Usage Examples

### 1. Access the Dashboard
```
Navigate to: http://localhost:8080/owner/dashboard
```

### 2. Fetch Bookings via API
```javascript
// Using fetch in frontend
fetch("/owner/bookings")
  .then(res => res.json())
  .then(data => {
    console.log("Total Earnings:", data.totalEarnings);
    console.log("Bookings:", data.bookings);
  });
```

### 3. cURL Request
```bash
curl -X GET http://localhost:8080/owner/bookings \
  -H "Content-Type: application/json" \
  -b "connect.sid=YOUR_SESSION_ID"
```

---

## Data Flow

### Frontend Workflow:
1. User navigates to `/owner/dashboard`
2. Dashboard page loads with loading spinner
3. JavaScript fetches `/owner/bookings` API
4. API returns bookings data
5. Frontend renders booking cards
6. Statistics are updated dynamically

### Backend Workflow:
1. Request arrives at `/owner/bookings`
2. Middleware checks authentication
3. Controller queries database:
   - Finds all bookings
   - Populates listing (filtered by owner)
   - Populates user details
   - Filters null listings
   - Filters successful payments only
4. Controller calculates totals
5. Returns JSON response

---

## Data Relationships

```
User (Logged-in Owner)
  └── Listings (owner field)
        └── Bookings (listing field)
              ├── User (guest)
              ├── Listing (property)
              └── Payment Status
```

---

## Security Features

✅ **Authentication Check:** `isLoggedIn` middleware ensures only logged-in users can access

✅ **Owner Verification:** Only shows bookings for listings owned by logged-in user

✅ **XSS Protection:** Frontend escapes HTML to prevent injection attacks

✅ **Error Handling:** Try-catch blocks prevent crashes and information leakage

✅ **Lean Queries:** Uses `.lean()` for better performance on read-only operations

---

## Performance Optimizations

1. **Mongoose Populate:** Uses efficient population for related data
2. **Field Selection:** Only selects required fields (`select()`)
3. **Lean Queries:** Converts documents to plain objects for faster processing
4. **Filtering at Query Level:** Uses `match` in populate to reduce data transfer
5. **Client-side Caching:** Frontend data remains in memory until refresh

---

## Styling & UI Features

### Color Scheme
- **Primary Gradient:** Purple (#667eea) to Violet (#764ba2)
- **Accent Color:** Purple (#667eea) for earnings
- **Background:** Gradient background for modern look
- **Cards:** White cards with subtle shadows

### Animations
- Hover effects on cards (lift and shadow)
- Loading spinner animation
- Smooth transitions (300ms)
- Transform on hover (translateY)

### Responsive Breakpoints
- **Desktop:** Full grid layout (3+ columns)
- **Tablet:** 2 columns
- **Mobile:** Single column

---

## Testing the Feature

### Test Scenarios:

1. **Test as Owner:**
   - Create a listing
   - Have another user book it and pay
   - Login as owner and check dashboard
   - Should see 1 booking with correct earnings

2. **Test Authentication:**
   - Try accessing `/owner/bookings` without login
   - Should get 401 error
   - Should redirect when accessing dashboard

3. **Test Filter:**
   - Create bookings with different payment statuses
   - Only "success" bookings should appear

4. **Test Empty State:**
   - Login as owner with no bookings
   - Should see "No Bookings Yet" message

---

## File Structure

```
routes/
  └── owner.js              # Route definitions
controllers/
  └── owner.js              # Controller functions
views/
  └── owner/
      └── dashboard.ejs     # Dashboard page
```

---

## Example cURL Commands

### Get Owner Bookings:
```bash
curl -X GET http://localhost:8080/owner/bookings \
  -H "Content-Type: application/json"
```

### Open Dashboard:
```bash
curl -X GET http://localhost:8080/owner/dashboard
```

---

## Error Handling

### Common Errors:

| Error | Cause | Solution |
|-------|-------|----------|
| `401 Unauthorized` | Not logged in | Login first |
| `500 Server Error` | Database issue | Check MongoDB connection |
| `Null listing in response` | User is not owner | Only shows owned listings |

---

## Future Enhancements

- 📊 Revenue charts and graphs
- 📅 Calendar view for bookings
- 💬 Message guests feature
- ⭐ Review management
- 📈 Analytics dashboard
- 🔔 Real-time notifications
- 📄 Invoice/receipt generation
- 📱 Mobile app integration

---

## Code Quality Standards

✅ Clean, readable code with comments
✅ Proper error handling with try-catch
✅ Follows project's existing code style
✅ Uses async/await pattern
✅ Production-ready structure
✅ Secure authentication checks
✅ XSS protection implemented
✅ Responsive and accessible UI

---

## Support

For issues or questions:
1. Check that user is logged in
2. Verify user is the listing owner
3. Ensure booking payment status is "success"
4. Check browser console for errors
5. Verify MongoDB connection

---

Generated: May 2024
Version: 1.0.0
