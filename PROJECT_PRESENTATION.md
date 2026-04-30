# Wonderlust - Hotel Booking System

## Project Presentation

---

# 1. Introduction

## What is Wonderlust?

**Wonderlust** is a full-stack hotel booking and listing management web application built with modern web technologies.

### Key Highlights:
- 🏨 **Listing Management** - Browse and manage hotel/accommodation listings
- 📅 **Booking System** - Date-based reservation with real-time pricing
- 💳 **Payment Integration** - Secure Razorpay payment gateway
- 👤 **User Authentication** - Secure login/signup with Passport.js
- 🖼️ **Image Management** - Cloudinary cloud storage integration
- 🗺️ **Map Integration** - Mapbox location services

### Technology Stack:
| Layer | Technology |
|-------|------------|
| Frontend | EJS Templates, Bootstrap, CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB (Mongoose ODM) |
| Authentication | Passport.js |
| Payments | Razorpay API |
| Cloud Storage | Cloudinary |
| Maps | Mapbox SDK |

---

# 2. Problem Statement

## Current Challenges in Hospitality Booking

### Problems Identified:

1. **Manual Booking Processes**
   - Traditional paper-based or phone bookings
   - High error rates in date/price calculations
   - No real-time availability tracking

2. **Payment Processing Issues**
   - Lack of secure online payment options
   - No automated payment verification
   - Complex refund processes

3. **User Management Challenges**
   - Difficulty in tracking booking history
   - No user authentication for personalized experience
   - Limited access control

4. **Listing Management Inefficiencies**
   - No centralized platform for property listings
   - Manual image uploads and management
   - No geographic visualization

5. **Review and Rating System**
   - No systematic review collection
   - Lack of trust indicators for new users

---

# 3. Objective

## Project Goals and Targets

### Primary Objectives:

✅ **Develop a Comprehensive Booking Platform**
- Create a full-featured hotel listing and booking system
- Enable users to search, view, and book accommodations

✅ **Implement Secure Payment Processing**
- Integrate Razorpay payment gateway
- Ensure secure transaction handling with signature verification

✅ **Build Robust Authentication System**
- User registration and login functionality
- Role-based access control (users vs owners)

✅ **Create Intuitive User Interface**
- Responsive design using Bootstrap
- Interactive date pickers and price calculators
- Visual map integration

### Secondary Objectives:

- 📊 Generate booking reports and analytics
- 🏷️ Implement category-based filtering
- ⭐ Build review and rating system
- 📱 Ensure mobile-friendly experience

---

# 4. Software Requirements

## Application Software Stack

### Runtime Environment:
```
Node.js: v22.17.0
npm: Latest stable version
```

### Backend Dependencies:
| Package | Version | Purpose |
|---------|---------|---------|
| express | ^5.2.1 | Web framework |
| mongoose | ^9.1.5 | MongoDB ODM |
| ejs | ^3.0.2 | Template engine |
| passport | ^0.7.0 | Authentication |
| razorpay | ^2.9.6 | Payment gateway |
| cloudinary | ^1.41.3 | Image storage |
| dotenv | ^17.3.1 | Environment config |
| joi | ^18.0.2 | Input validation |
| connect-mongo | ^6.0.0 | Session storage |
| multer | ^2.1.0 | File upload |

### Frontend Dependencies:
- Bootstrap 5.x (CSS Framework)
- Mapbox GL JS (Maps)
- Custom CSS (styling)

### Database:
- MongoDB (Local or Atlas Cloud)
- Connection via Mongoose ODM

---

# 5. Hardware Requirements

## System Requirements

### Server Requirements:
| Component | Minimum | Recommended |
|-----------|---------|--------------|
| Processor | Intel Core i3 | Intel Core i5+ |
| RAM | 4 GB | 8 GB |
| Storage | 20 GB SSD | 50 GB SSD |
| Network | 10 Mbps | 100 Mbps |

### Client Requirements:
| Component | Specification |
|-----------|---------------|
| Browser | Chrome 90+, Firefox 88+, Safari 14+, Edge 90+ |
| Display | 1024x768 minimum |
| Internet | 5 Mbps+ bandwidth |

### External Services:
- 🗄️ **MongoDB Atlas** - Cloud database OR local MongoDB
- ☁️ **Cloudinary** - Image and media storage
- 💳 **Razorpay** - Payment processing
- 🗺️ **Mapbox** - Map and geolocation services

---

# 6. Methodology

## Development Approach

### Software Development Lifecycle:

```
┌─────────────────────────────────────────────────────────────┐
│                    SDLC PHASES                              │
├──────────────┬──────────────┬──────────────┬────────────────┤
│   PLANNING   │   DESIGN    │  IMPLEMENT   │    TESTING    │
│              │              │              │                │
│  - Require.  │  - System    │  - Code      │  - Unit       │
│    Analysis  │    Arch.     │    Development│    Testing    │
│  - Feasibility│  - Database  │  - Integration│  - Integration│
│    Study    │    Design    │  - Deployment│    Testing    │
│  - Project   │  - UI/UX     │  - Documentation│ - UAT       │
│    Planning  │    Design   │              │                │
└──────────────┴──────────────┴──────────────┴────────────────┘
```

### Development Methodology: **Agile**

1. **Requirement Gathering**
   - Analyze existing booking systems
   - Identify core features needed

2. **Design Phase**
   - Create database schemas
   - Design system architecture
   - Wireframe UI components

3. **Implementation Phase**
   - Build MVC architecture
   - Implement authentication
   - Integrate payment gateway

4. **Testing Phase**
   - Unit testing for models
   - Integration testing for APIs
   - User acceptance testing

5. **Deployment**
   - Configure production environment
   - Set up environment variables
   - Deploy to server

---

# 7. System Architecture

## Application Architecture

### MVC Architecture:

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │   HTML/EJS  │  │  Bootstrap  │  │  JavaScript │             │
│  │  Templates  │  │     CSS     │  │   Scripts   │             │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘             │
└─────────┼────────────────┼────────────────┼─────────────────────┘
          │                │                │
          ▼                ▼                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      EXPRESS SERVER                            │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    ROUTES (API Endpoints)                │   │
│  │  /listings    /reviews    /users    /bookings    /auth  │   │
│  └─────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                 CONTROLLERS (Business Logic)             │   │
│  │  listings.js   reviews.js   users.js   bookings.js      │   │
│  └─────────────────────────────────────────────────────────┘   │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                        MODELS (Data Layer)                      │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐            │
│  │ Listing │  │  User   │  │ Booking │  │ Review  │            │
│  │  Model  │  │  Model  │  │  Model  │  │  Model  │            │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘            │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      EXTERNAL SERVICES                          │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐  │
│  │  MongoDB  │  │Cloudinary │  │ Razorpay  │  │ Mapbox    │  │
│  │ Database  │  │  Storage  │  │ Payments  │  │   Maps    │  │
│  └────────────┘  └────────────┘  └────────────┘  └────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### Request-Response Flow:

```
User Action
    │
    ▼
Route Matching (Express Router)
    │
    ▼
Controller Processing
    │
    ├──► Model Interaction (Mongoose)
    │
    ├──► External API (Razorpay/Cloudinary)
    │
    └──► Session/Flash Messages
    │
    ▼
View Rendering (EJS Template)
    │
    ▼
HTML Response to Client
```

---

# 8. System Design

## All System Diagrams

### 8.1 Use Case Diagram:

```
┌─────────────────────────────────────────────────────────────────┐
│                        ACTORS                                   │
│                                                                 │
│    ┌─────────────┐          ┌─────────────┐                    │
│    │    Guest    │          │   Admin     │                    │
│    │  (Visitor) │          │  (Owner)    │                    │
│    └──────┬──────┘          └──────┬──────┘                    │
│           │                        │                            │
│           │    ┌─────────────┐     │                            │
│           └───►│  Wonderlust │◄────┘                            │
│                │   System    │                                  │
│                └──────┬──────┘                                  │
│                       │                                         │
│           ┌───────────┴───────────┐                            │
│           │                       │                            │
│    ┌──────▼──────┐        ┌──────▼──────┐                     │
│    │  Registered │        │  Listing    │                     │
│    │    User     │        │   Owner     │                     │
│    └─────────────┘        └─────────────┘                     │
└─────────────────────────────────────────────────────────────────┘
```

### 8.2 Activity Diagram - Booking Flow:

```
┌──────────────┐
│  Start       │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  Browse      │──── No ───► End
│  Listings    │
└──────┬───────┘
       │ Yes
       ▼
┌──────────────┐
│  Select      │
│  Dates       │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  Calculate   │
│  Price       │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  Click Book  │
│   Now        │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  Login       │──── No ───► Prompt Login
│  Required?   │
└──────┬───────┘
       │ Yes
       ▼
┌──────────────┐
│  Create      │
│  Razorpay    │
│  Order       │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  Process     │
│  Payment     │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  Verify      │
│  Signature   │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  Save Booking │
│  to Database │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  Show        │
│  Success     │
└──────┬───────┘
       │
       ▼
    ┌───────┐
    │  End  │
    └───────┘
```

### 8.3 Sequence Diagram - Payment:

```
┌────────┐    ┌────────┐    ┌────────┐    ┌────────┐    ┌────────┐
│  User  │    │Frontend│    │ Express│    │ Razorpay│   │MongoDB │
│        │    │   UI   │    │ Server │    │   API  │    │   DB   │
└───┬────┘    └───┬────┘    └───┬────┘    └───┬────┘    └───┬────┘
    │             │             │             │             │
    │ 1.Select    │             │             │             │
    │   Dates     │             │             │             │
    │────────────►│             │             │             │
    │             │             │             │             │
    │ 2.Click     │             │             │             │
    │   Book      │────────────►│             │             │
    │             │             │             │             │
    │             │ 3.POST      │             │             │
    │             │  /bookings  │────────────►│             │
    │             │             │             │             │
    │             │             │ 4.Create   │             │
    │             │             │   Order    │────────────►│
    │             │             │             │             │
    │             │             │ 5.Order    │             │
    │             │             │   ID       │◄────────────│
    │             │             │◄───────────│             │
    │             │             │             │             │
    │             │ 6.Order    │             │             │
    │             │   ID       │◄────────────│             │


    │             │             │             │             │
    │ 7.Payment   │             │             │             │
    │   Modal     │◄────────────│             │             │
    │             │             │             │             │
    │ 8.Enter    │             │             │             │
    │   Card     │             │             │             │
    │────────────►│             │             │             │
    │             │             │             │             │
    │             │ 9.Payment   │             │             │
    │             │   Details   │────────────►│             │
    │             │             │             │             │
    │             │             │ 10.Verify  │             │
    │             │             │   Payment  │────────────►│
    │             │             │             │             │
    │             │             │ 11.Success │             │
    │             │             │   Status   │◄────────────│
    │             │             │◄───────────│             │
    │             │             │             │             │
    │             │ 12.Save     │             │             │
    │             │   Booking   │────────────►│             │
    │             │             │             │             │
    │             │             │ 13.Confirm │             │
    │             │             │◄────────────│             │
    │             │             │             │             │
    │ 14.Success │             │             │             │
    │   Message  │◄────────────│             │             │
    │             │             │             │             │
```

### 8.4 Component Diagram:

```
┌─────────────────────────────────────────────────────────────────┐
│                    WONDERLUST APPLICATION                       │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    WEB SERVER                            │   │
│  │  ┌─────────────────────────────────────────────────────┐ │   │
│  │  │                  ROUTER LAYER                       │ │   │
│  │  │  listing.js  │ review.js │ user.js │ booking.js   │ │   │
│  │  └─────────────────────────────────────────────────────┘ │   │
│  │  ┌─────────────────────────────────────────────────────┐ │   │
│  │  │               CONTROLLER LAYER                       │ │   │
│  │  │  listings.js │ reviews.js │ users.js │ bookings.js│ │   │
│  │  └─────────────────────────────────────────────────────┘ │   │
│  │  ┌─────────────────────────────────────────────────────┐ │   │
│  │  │                 MODEL LAYER                          │ │   │
│  │  │  Listing    │   User    │  Booking  │   Review     │ │   │
│  │  └─────────────────────────────────────────────────────┘ │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                  │
│         ┌────────────────────┼────────────────────┐           │
│         │                    │                    │            │
│         ▼                    ▼                    ▼            │
│  ┌────────────┐      ┌────────────┐      ┌────────────┐      │
│  │  MongoDB   │      │ Cloudinary │      │  Razorpay   │      │
│  │  Cluster   │      │    API     │      │    API      │      │
│  └────────────┘      └────────────┘      └────────────┘      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 8.5 Class Diagram:

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│    Listing     │       │      User       │       │     Booking     │
├─────────────────┤       ├─────────────────┤       ├─────────────────┤
│ - title        │       │ - username      │       │ - checkIn       │
│ - description  │       │ - email         │       │ - checkOut      │
│ - image        │       │ - password      │       │ - numberOfDays  │
│ - price        │       │ - image         │       │ - pricePerNight │
│ - location     │       └────────┬────────┘       │ - subtotal       │
│ - country      │                │                │ - gstAmount      │
│ - category     │                │                │ - totalPrice     │
│ - geometry     │       1    *   │   1    *       │ - paymentStatus  │
│ - owner        │◄──────────────┼───────────────►│ - razorpayOrderId│
│ - reviews      │       0..1     │    0..*        │ - razorpayPaymentId│
└────────┬────────┘       └─────────────────┘       │ - user           │
         │                                            │ - listing        │
         │ 1                                          └────────┬────────┘
         │ *                                                │
┌────────▼────────┐       ┌─────────────────┐                │
│     Review      │       │      Blog      │                │
├─────────────────┤       ├─────────────────┤                │
│ - rating        │       │ - title        │                │
│ - comment       │       │ - content      │                │
│ - author        │       │ - image        │                │
│ - listing       │       │ - author       │                │
└─────────────────┘       └─────────────────┘                │
```

---

# 9. Database Design

## MongoDB Schema Design

### 9.1 Collection Schemas:

#### User Collection:
```javascript
{
  _id: ObjectId,
  username: String (unique, required),
  email: String (unique, required),
  password: String (hashed),
  image: {
    url: String,
    filename: String
  },
  createdAt: Date,
  updatedAt: Date
}
```

#### Listing Collection:
```javascript
{
  _id: ObjectId,
  title: String (required),
  description: String,
  image: {
    url: String,
    filename: String
  },
  price: Number,
  location: String,
  country: String,
  category: String (enum),
  geometry: {
    type: String ("Point"),
    coordinates: [Number] // [longitude, latitude]
  },
  owner: ObjectId (ref: User),
  reviews: [ObjectId] (ref: Review),
  createdAt: Date,
  updatedAt: Date
}
```

#### Booking Collection:
```javascript
{
  _id: ObjectId,
  user: ObjectId (ref: User, required),
  listing: ObjectId (ref: Listing, required),
  checkIn: Date (required),
  checkOut: Date (required),
  numberOfDays: Number (required),
  pricePerNight: Number (required),
  subtotal: Number (required),
  gstAmount: Number (required),
  totalPrice: Number (required),
  paymentStatus: String (enum: pending/completed/failed),
  razorpayOrderId: String,
  razorpayPaymentId: String,
  razorpaySignature: String,
  createdAt: Date,
  updatedAt: Date
}
```

#### Review Collection:
```javascript
{
  _id: ObjectId,
  rating: Number (min: 1, max: 5),
  comment: String,
  author: ObjectId (ref: User),
  listing: ObjectId (ref: Listing),
  createdAt: Date,
  updatedAt: Date
}
```

### 9.2 Database Relationships:

```
┌─────────┐         ┌─────────┐         ┌─────────┐
│  User   │◄──────►│ Listing │◄──────►│  User   │
│         │  1   * │         │  *   1  │         │
└─────────┘         └─────────┘         └─────────┘
       │                   │                   │
       │                   │                   │
       ▼                   ▼                   ▼
┌─────────┐         ┌─────────┐         ┌─────────┐
│ Booking │         │ Review  │         │  Blog  │
│    *    │         │    *    │         │   *    │
└─────────┘         └─────────┘         └─────────┘
```

---

# 10. Working Overview

## System Operation Flow

### 10.1 User Registration & Login:

```
1. User visits /signup
2. Fills registration form (username, email, password)
3. Passport.js hashes password with salt
4. User saved to MongoDB
5. Redirect to /login
6. User enters credentials
7. Passport validates and creates session
8. Flash message confirms login
```

### 10.2 Listing Management:

```
1. Owner visits /listings/new
2. Fills listing details (title, description, price, location)
3. Uploads image via Multer + Cloudinary
4. Selects category and adds map coordinates
5. Listing saved to database
6. Other users can view and review
```

### 10.3 Booking Process:

```
Step 1: Browse Listings
   - View all listings on homepage
   - Filter by category
   - View individual listing details

Step 2: Select Dates
   - Choose check-in date
   - Choose check-out date
   - System calculates number of days

Step 3: Price Calculation
   - subtotal = pricePerNight × numberOfDays
   - gstAmount = subtotal × 0.18 (18% GST)
   - totalPrice = subtotal + gstAmount

Step 4: Payment
   - Click "Book Now"
   - Backend creates Razorpay order
   - Frontend shows Razorpay checkout
   - User completes payment

Step 5: Verification
   - Razorpay returns payment details
   - Backend verifies signature (HMAC-SHA256)
   - Booking status updated to "completed"
```

### 10.4 Review System:

```
1. User visits a listing
2. Clicks "Write a Review"
3. Rates (1-5 stars) and comments
4. Review saved to database
5. Listing average rating updated
```

---

# 11. Key Features & Applications

## Application Screenshots & Features

### 11.1 Home Page - Listing Index:
- Grid display of all property listings
- Category filter buttons (Beach, Mountain, City, etc.)
- Search functionality
- Featured listings showcase

### 11.2 Listing Show Page:
- Large hero image
- Complete property details
- Location with interactive map (Mapbox)
- Owner information
- Review section with ratings
- **Booking form** with date picker
- Price calculation display

### 11.3 Booking Form Features:
```
┌────────────────────────────────────────┐
│         BOOK THIS PLACE                │
├────────────────────────────────────────┤
│  Check-in Date:  [Date Picker]         │
│  Check-out Date: [Date Picker]         │
│                                        │
│  Price: $XXX per night                 │
│  Nights: X                             │
│  Subtotal: $XXXX                       │
│  GST (18%): $XXX                       │
│  Total: $XXXX                         │
│                                        │
│  [  BOOK NOW  ] ──────────────────►   │
└────────────────────────────────────────┘
```

### 11.4 Razorpay Payment Modal:
- Secure card entry
- Multiple payment options (Card, UPI, Netbanking)
- Test card: 4111 1111 1111 1111
- Instant payment confirmation

### 11.5 User Dashboard:
- Profile information
- Edit profile functionality
- Profile image upload

### 11.6 Authentication Pages:
- Login form with Passport local strategy
- Registration form with validation
- Secure password hashing

---

# 12. Challenges & Solutions

## Problems Encountered & Resolutions

### Challenge 1: Payment Integration
| Issue | Solution |
|-------|----------|
| Razorpay signature verification | Implemented HMAC-SHA256 verification using crypto module |
| Order creation timing | Create order on server before payment form display |
| Payment failure handling | Added status tracking (pending/completed/failed) |

### Challenge 2: Date Validation
| Issue | Solution |
|-------|----------|
| Past date selection | Added validation to prevent check-in before today |
| Check-out before check-in | Implemented date order validation |
| Same day booking | Set minimum stay to 1 day |

### Challenge 3: Authentication
| Issue | Solution |
|-------|----------|
| Session management | Used connect-mongo for persistent sessions |
| Password security | Implemented passport-local-mongoose with salt hashing |
| Route protection | Created middleware for isLoggedIn verification |

### Challenge 4: Image Upload
| Issue | Solution |
|-------|----------|
| File size limits | Configured Multer with size limits |
| Cloud storage | Integrated Cloudinary for persistent image hosting |
| Image format validation | Added file type checking |

### Challenge 5: Database Connections
| Issue | Solution |
|-------|----------|
| MongoDB connection | Used async/await with proper error handling |
| Environment configuration | Implemented dotenv for sensitive data |
| Production vs Development | Different DB URLs for dev/prod environments |

### Challenge 6: Map Integration
| Issue | Solution |
|-------|----------|
| Geocoding addresses | Used Mapbox SDK for coordinate conversion |
| Map display | Integrated Mapbox GL JS for interactive maps |
| Marker placement | Stored coordinates in MongoDB geometry field |

---

# 13. Future Scope

## Enhancement Opportunities

### 13.1 Advanced Features:

| Feature | Description | Priority |
|---------|-------------|----------|
| **Admin Dashboard** | Superuser can manage all listings, users, and bookings | High |
| **Calendar Sync** | Export bookings to Google/Outlook Calendar | Medium |
| **Multi-language** | Support for Hindi, Spanish, French, etc. | Medium |
| **AI Recommendations** | ML-based listing suggestions | Low |
| **Chatbot** | 24/7 customer support via AI | Low |

### 13.2 Payment Enhancements:

- 💰 **Multiple Payment Gateways** - Add Stripe, PayPal options
- 📱 **UPI Integration** - Popular in India
- 💳 **EMI Options** - No-cost EMI for high-value bookings
- 🔄 **Refund Automation** - Automated partial/full refunds

### 13.3 Social Features:

- 👥 **User Profiles** - Detailed profiles with verification
- 📸 **Photo Gallery** - User-uploaded property photos
- ⭐ **Wishlist** - Save favorite listings
- 📤 **Share Listings** - Social media integration

### 13.4 Analytics & Reporting:

- 📊 **Booking Analytics** - Revenue, occupancy rates
- 📈 **User Behavior** - Page views, conversion funnels
- 📉 **Revenue Reports** - Daily, weekly, monthly summaries
- 🎯 **Marketing Insights** - Popular categories, locations

### 13.5 Mobile Application:

- 📱 **React Native App** - iOS and Android
- 🔔 **Push Notifications** - Booking confirmations, reminders
- 📍 **Location Services** - Nearby listings finder
- 📴 **Offline Mode** - View saved bookings

### 13.6 Security Enhancements:

- 🔒 **Two-Factor Authentication** - Extra security layer
- 🛡️ **Rate Limiting** - Prevent brute force attacks
- ✅ **Input Sanitization** - Prevent XSS/SQL injection
- 📝 **Audit Logs** - Track all admin actions

---

# 14. Conclusion

## Project Summary

### 14.1 Achievements:

✅ **Fully Functional Booking System**
- Complete end-to-end booking flow
- Real-time price calculation with GST
- Secure Razorpay payment integration

✅ **Robust Authentication**
- User registration and login
- Session management with MongoDB store
- Role-based access control

✅ **Modern Architecture**
- MVC pattern implementation
- RESTful API design
- Modular code structure

✅ **User-Friendly Interface**
- Responsive Bootstrap design
- Interactive date pickers
- Map integration for locations

✅ **Secure Transactions**
- Payment signature verification
- Environment variable protection
- Input validation and sanitization

### 14.2 Technical Highlights:

| Aspect | Implementation |
|--------|----------------|
| Database | MongoDB with Mongoose ODM |
| Backend | Express.js 5.x with Node.js 22 |
| Authentication | Passport.js with local strategy |
| Payments | Razorpay API with signature verification |
| Images | Cloudinary with Multer upload |
| Maps | Mapbox GL JS integration |
| Templating | EJS with ejs-mate layouts |

### 14.3 Project Impact:

- 🏆 Demonstrates full-stack development skills
- 💼 Ready for production deployment
- 📚 Comprehensive documentation provided
- 🔧 Easy to maintain and extend

### 14.4 Final Remarks:

> **Wonderlust** successfully implements a modern hotel booking system with all essential features including listing management, user authentication, booking workflow, and secure payment processing. The project follows industry best practices and is ready for real-world deployment.

---

## Thank You!

### Questions?

📧 Contact: developer@wonderlust.com  
🌐 Demo: www.wonderlust-demo.com  
📚 Docs: /BOOKING_README.md
