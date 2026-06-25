# 🏰 BookMyVenue

BookMyVenue is a premium, luxury-themed venue booking and management platform. The application is built using a modern **React + Vite** frontend with **Tailwind CSS** and **Framer Motion** for a sleek, glassmorphic visual interface, backed by an **Express.js + PostgreSQL** server. 

Whether you are a customer looking for an exquisite event space, a venue owner looking to list and manage bookings, or an administrator supervising the platform, BookMyVenue provides an end-to-end dashboard and scheduling gateway.

---

## 📖 Table of Contents
1. [Core Features](#-core-features)
2. [System Architecture & Design](#-system-architecture--design)
3. [Database Schema](#-database-schema)
4. [API Endpoints Reference](#-api-endpoints-reference)
5. [Getting Started & Installation](#-getting-started--installation)
   - [Prerequisites](#prerequisites)
   - [Database Setup](#1-database-setup)
   - [Backend Setup](#2-backend-setup)
   - [Frontend Setup](#3-frontend-setup)
6. [Booking Rules & Conflict Validation](#-booking-rules--conflict-validation)

---

## ✨ Core Features

The system is designed around three distinct user roles, each with a specialized dashboard and set of workflows:

### 1. 👤 Customers (Renters)
* **Venue Discovery**: Browse handpicked luxury venues with dynamic filters for location, guest capacity, and search queries (title, description, location).
* **Interactive Booking Calendar**: View real-time availability on a monthly calendar grid.
* **Flexible Bookings**: Book venues either **daily** or **hourly** (depending on the venue's setup).
* **Booking Panel**: Check upcoming and past reservations, cancel bookings, view secure check-in codes, and access custom instructions.

### 2. 🏡 Venue Owners (Hosts)
* **Owner Dashboard**: Track hosted listings, check active reservations, and view customer contact info.
* **Interactive Calendar Visualization**: View all bookings layered chronologically in a visual calendar.
* **Detailed Listing Form**: List new venues with customizable specifications (size, guest capacity, image gallery, hourly operating hours, and preset/custom amenities or event categories).
* **Offline Lock / Maintenance Mode**: Prevent double bookings by locking out dates or hours for offline/maintenance blocks.
* **Local Upload Integration**: Upload venue preview photos locally via the media manager.

### 3. 🛡️ Platform Administrators
* **Admin Dashboard Stats**: Monitor total renters, active hosts, approved vs. pending venues, total transaction volume, platform commission earnings (10%), and host earnings (90%).
* **Verification Workflow**: Review newly submitted venue listings in a pending status. Approve or decline listings (with specific rejection reasons shown to the host).
* **Global Booking Log**: Audit all reservations, payments, and booking types across the entire marketplace.
* **User Management**: View and search all registered platform accounts.

---

## 🏗️ System Architecture & Design

BookMyVenue utilizes a decoupled client-server architecture:

```
┌──────────────────────────────────────┐
│       Frontend Client (Vite)         │
│  React + Tailwind CSS + Framer Motion│
└──────────────────┬───────────────────┘
                   │
           REST API (JSON / JWT)
                   │
┌──────────────────▼───────────────────┐
│       Backend Server (Express)       │
│    Node.js Gateway & JWT Middleware  │
└──────┬────────────────────────┬──────┘
       │                        │
  Local Files                Queries
       │                        │
┌──────▼──────────────┐  ┌──────▼──────┐
│  Uploads Directory  │  │  Database   │
│   (Local Storage)   │  │(PostgreSQL) │
└─────────────────────┘  └─────────────┘
```

### ⚡ Hybrid Data Fallback Mechanism
The React frontend is built to be resilient. When communicating with the backend:
1. It attempts to fetch and mutate data via the backend REST endpoints.
2. If the backend server is unreachable or offline, the client **gracefully falls back to a Mock LocalStorage database** (utilizing seed data defined in [venuesData.ts](file:///d:/1/BookMyVenue%20test2/src/data/venuesData.ts)). This enables seamless demoing, testing, and offline presentation.

---

## 🗄️ Database Schema

Run the following SQL DDL statements on your PostgreSQL database to initialize the tables:

```sql
-- 1. Create Users Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('user', 'venue_owner', 'admin')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create Venues Table
CREATE TABLE venues (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    location VARCHAR(255) NOT NULL,
    full_address VARCHAR(255) NOT NULL,
    capacity INTEGER NOT NULL,
    square_feet INTEGER NOT NULL,
    price_per_night NUMERIC(10, 2) NOT NULL,
    host_email VARCHAR(255) REFERENCES users(email) ON DELETE CASCADE,
    host_type VARCHAR(100) DEFAULT 'Superhost',
    rating NUMERIC(3, 2) DEFAULT 5.0,
    is_top_rated BOOLEAN DEFAULT FALSE,
    date_range VARCHAR(100) DEFAULT 'Available',
    parking TEXT,
    catering TEXT,
    images TEXT[] DEFAULT '{}',
    amenities TEXT[] DEFAULT '{}',
    rules TEXT[] DEFAULT '{}',
    event_types TEXT[] DEFAULT '{}',
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'declined')),
    rejection_reason TEXT,
    booking_type VARCHAR(50) DEFAULT 'days' CHECK (booking_type IN ('days', 'hours')),
    cleaning_gap INTEGER DEFAULT 0,
    opening_time VARCHAR(5) DEFAULT '08:00',
    closing_time VARCHAR(5) DEFAULT '22:00',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Create Bookings Table
CREATE TABLE bookings (
    id VARCHAR(50) PRIMARY KEY, -- Generates BKG-XXXX, OFF-XXXX, etc.
    venue_id INTEGER REFERENCES venues(id) ON DELETE CASCADE,
    user_email VARCHAR(255) REFERENCES users(email) ON DELETE SET NULL, -- Null for offline locks
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    guests INTEGER DEFAULT 0,
    total_price NUMERIC(10, 2) DEFAULT 0.00,
    status VARCHAR(50) DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'cancelled', 'offline')),
    payment_status VARCHAR(50) DEFAULT 'paid' CHECK (payment_status IN ('paid', 'refunded', 'offline')),
    check_in_instructions TEXT,
    renter_name VARCHAR(255),
    renter_phone VARCHAR(50),
    renter_email VARCHAR(255),
    booking_type VARCHAR(50) DEFAULT 'days',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🔌 API Endpoints Reference

### Authentication (`/api/auth`)
* `POST /signup` - Register a new user (`user` or `venue_owner`).
* `POST /login` - Log in and obtain a Bearer JWT token.

### Venue Operations (`/api/venues`)
* `GET /` - Fetch all approved venues.
* `GET /:id` - Retrieve details of a specific venue.
* `POST /` *(Host only)* - Submit a new venue for admin verification.
* `PUT /:id` *(Host only)* - Update venue details (resets status to `pending`).
* `DELETE /:id` *(Host only)* - Delete a venue listing.
* `GET /my-venues` *(Host only)* - Retrieve all listings owned by the logged-in host.

### Booking Operations (`/api/bookings`)
* `GET /` - Fetch bookings (returns renter reservations for users; host listings reservations for owners).
* `POST /` - Request a new online venue booking (applies conflict checking).
* `POST /lock` *(Host only)* - Schedule an offline block or maintenance period.
* `PUT /cancel/:id` - Cancel an active booking and flag payment as refunded.
* `GET /venue/:id` - Get non-cancelled reservation date-ranges for a particular venue calendar.

### Media Upload (`/api/upload`)
* `POST /` - Single image uploader. Saves images locally to `backend/uploads/` and returns the file access URL.

### Admin Operations (`/api/admin` - Admin Only)
* `GET /stats` - Access core platform business statistics and profit percentages.
* `GET /venues` - List all venues regardless of approval status.
* `PUT /venues/:id/status` - Approve or decline a pending venue listing.
* `GET /bookings` - Get all bookings made on the platform.
* `GET /users` - Get all registered users.

---

## 🚀 Getting Started & Installation

### Prerequisites
* **Node.js** (v18 or higher recommended)
* **PostgreSQL** database instance
* **NPM** or **Yarn**

### 1. Database Setup
1. Create a new database in PostgreSQL (e.g. `bookmyvenue`).
2. Run the SQL statements provided in the [Database Schema](#-database-schema) section to configure the tables.

### 2. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install backend dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend/` folder based on `.env.example`:
   ```env
   PORT=5000
   DATABASE_URL=postgresql://your_db_username:your_db_password@localhost:5432/bookmyvenue
   JWT_SECRET=your_super_secret_key_here
   NODE_ENV=development
   ```
4. Start the server in development mode (using Nodemon):
   ```bash
   npm run dev
   ```

### 3. Frontend Setup
1. Open a new terminal in the project root directory.
2. Install frontend dependencies:
   ```bash
   npm install
   ```
3. Start the Vite React client:
   ```bash
   npm run dev
   ```
4. Open the browser and visit `http://localhost:5173`.

---

## 🔒 Booking Rules & Conflict Validation

To ensure absolute operational accuracy and protect both hosts and guests, the system enforces the following safety filters during booking attempts:

### 1. Booking Horizon Restraints
* **30-Day Window Limit**: Web bookings are restricted to date ranges within 30 days of the current calendar date. If a user tries to book past the 30-day window, the system blocks the request and prompts them to coordinate offline with the host.

### 2. Double-Booking Prevention
* **Schedule Overlap Verification**: Before a booking or offline lock is created, the server runs checks comparing the proposed range `[start_date, end_date]` against all non-cancelled bookings.
* **Cleaning Gaps**: For **hourly bookings**, hosts can configure a buffer (e.g., 2 hours). When calculating conflicts, the backend dynamically pads bookings with this cleaning buffer to prevent subsequent guests from checking in before clean-up.

### 3. Operating Hour Enforcement
* For **hourly bookings**, checkout and check-in times must fall strictly between the venue's designated `opening_time` and `closing_time`.
