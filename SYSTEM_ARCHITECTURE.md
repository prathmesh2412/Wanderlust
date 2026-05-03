# System Architecture Diagram

## Overview
This diagram describes the core architecture of the Major-Project web application.

- **Frontend**: Browser clients consume server-rendered EJS views and static assets.
- **Backend**: Express.js application with modular routes, controllers, middleware, and Mongoose models.
- **Database**: MongoDB Atlas for data persistence.
- **Cloud Services**: Cloudinary for media uploads, Razorpay for payments, and Resend/Nodemailer for email.

---

## Architecture Diagram

```mermaid
flowchart TB
    subgraph Client[Browser / Frontend]
        A1[User Browser]
        A2[Static Assets<br/>CSS / JS / Maps]
        A3[EJS Views]
    end

    subgraph Server[Express App]
        direction TB
        B1[app.js]
        B2[Middleware]
        B3[Routes]
        B4[Controllers]
        B5[Models]
        B6[Session Store]
    end

    subgraph Data[Datastores]
        C1[MongoDB Atlas]
        C2[Cloudinary]
        C3[Razorpay]
        C4[Resend / Nodemailer]
    end

    A1 -->|HTTP requests| B1
    A1 -->|loads static assets| A2
    B1 --> B2
    B2 -->|auth / session / file upload / validation| B3
    B3 --> B4
    B4 --> B5
    B4 --> C1
    B4 --> C2
    B4 --> C3
    B4 --> C4
    B5 --> C1
    B1 -->|renders| A3
    A3 --> A1

    subgraph RoutesModule[Route Modules]
        R1[/listings]
        R2[/listings/:id/reviews]
        R3[/bookings]
        R4[/signup, /login, /logout, /profile]
    end

    subgraph ControllerModule[Controllers]
        D1[listings.js]
        D2[reviews.js]
        D3[bookings.js]
        D4[users.js]
    end

    subgraph ModelModule[Data Models]
        E1[user.js]
        E2[listing.js]
        E3[review.js]
        E4[booking.js]
    end

    B3 --> R1
    B3 --> R2
    B3 --> R3
    B3 --> R4
    R1 --> D1
    R2 --> D2
    R3 --> D3
    R4 --> D4
    D1 --> E2
    D1 --> E3
    D2 --> E3
    D3 --> E4
    D4 --> E1

    C2 -.->|uploads and deletes images| D1
    C2 -.->|uploads profile images| D4
    C3 -.->|payment orders / verify| D3
    C4 -.->|email notifications| D4
    B6 -.-> C1
    B2 --> B6

    subgraph Services[Supporting Services]
        S1[Passport.js Local Auth]
        S2[connect-mongo Session Storage]
        S3[Multer file uploads]
        S4[Joi Validation]
        S5[Flash Messages]
    end

    B2 --> S1
    B2 --> S2
    B2 --> S3
    B2 --> S4
    B2 --> S5
```

---

## Key Components

- `app.js`: main Express application entry point.
- `routes/`: route definitions for listings, reviews, bookings, and user auth/profile.
- `controllers/`: request handling logic and business workflows.
- `models/`: Mongoose schemas for Users, Listings, Reviews, and Bookings.
- `middleware.js`: authentication, authorization, request validation, and redirect logic.
- `cloudConfig.js`: Cloudinary storage configuration for media uploads.

## Data Flow

1. Browser sends HTTP request to Express.
2. `app.js` applies middleware for parsing, session, auth, and file uploads.
3. Route module dispatches the request to the matching controller.
4. Controller performs business logic, reads or writes MongoDB data, and may interact with Cloudinary or Razorpay.
5. Response is rendered as an EJS view or JSON redirect.

## Deployment Notes

- Env variables are loaded from `.env` in non-production mode.
- MongoDB Atlas provides persistent data storage.
- Sessions persist in MongoDB via `connect-mongo`.
- Images are stored in Cloudinary and referenced in MongoDB documents.
- Payments use Razorpay order creation and verification.
