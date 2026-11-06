# KISAN CONNECT — Farm Equipment Booking Platform

A production-quality, mobile-first web app connecting farmers with agricultural equipment owners with live availability, GPS search, price comparison, instant booking with Razorpay checkout, and an AI machinery assistant powered by Gemini.

---

## Features

1. **User Roles**: Seamless switching and tailored portals for **Farmer** (rent equipment) and **Equipment Owner** (list machinery, manage booking requests, track earnings).
2. **Authentication**: Phone number + OTP sign-in with Firebase Auth (with auto-fallback mock OTP `123456` mode so the app works instantly without configuration).
3. **Equipment Catalog**: 18+ realistic pre-seeded agricultural equipment listings across Andhra Pradesh (Vijayawada, Guntur, Mylavaram, Eluru) across Tractors, Combine Harvesters, Cultivators, Seed Drills, Sprayers, Drone Sprayers, Water Tankers, Rotavators, and Ploughs.
4. **Search, Filter & Comparison**:
   - Live search bar + interactive category tabs.
   - Filters: Distance (5, 10, 25, 50 km), price range, ratings (3+ / 4+), operator included, fuel included, availability date.
   - Sort by: Nearest (Haversine formula), Lowest Price, Highest Rated.
   - Side-by-side comparison modal for up to 3 pieces of machinery.
5. **Interactive GPS & OpenStreetMap**:
   - Geolocation auto-detection + manual village/pincode fallback.
   - Interactive OpenStreetMap (Leaflet) with custom markers and quick-booking popup cards.
6. **Live Availability & Calendar Booking**:
   - Interactive date/time picker, automatic calculation (hourly/daily), overlap validation to prevent double-booking.
   - Status flow: Pending → Approved → Confirmed (paid) → Completed → Reviewed (or Cancelled).
7. **Owner Dashboard**:
   - Add/edit/delete equipment with specs, pricing, and map location pin.
   - Quick availability toggling and manual date blackout.
   - Approve / Reject booking requests.
   - Earnings analytics with revenue charts.
8. **Payments (Razorpay Test Mode)**:
   - Razorpay Standard Checkout in TEST mode (Cards, UPI, NetBanking).
   - Instant payment simulation fallback when API keys are not provided.
9. **Ratings & Reviews**:
   - Post-completion 5-star ratings and farmer reviews with average score updates.
10. **In-App Notifications**:
    - Real-time notification center for requests, approvals, payments, and reminders.
11. **Multi-Language Support**:
    - English, Telugu (తెలుగు), and Hindi (हिंदी) with real-time language switcher.
12. **AI Assistant ("Ask KisanRent")**:
    - Floating chat button with Gemini 3.8 Flash intelligence and Web Speech API voice input.
    - Resolves farmer queries like "I need a tractor for 2 days next week near Vijayawada".

---

## Environment Variables Setup

Create a `.env` file in the project root:

```bash
# Gemini AI API Key (Proxy through server)
GEMINI_API_KEY="YOUR_GEMINI_API_KEY"

# Firebase Client Config (Optional - local simulated store activates if absent)
VITE_FIREBASE_API_KEY="AIzaSy..."
VITE_FIREBASE_AUTH_DOMAIN="kisan-connect.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="kisan-connect"
VITE_FIREBASE_STORAGE_BUCKET="kisan-connect.appspot.com"
VITE_FIREBASE_MESSAGING_SENDER_ID="123456789"
VITE_FIREBASE_APP_ID="1:123456789:web:abcdef"

# Razorpay Test Key (Optional - test simulator activates if absent)
VITE_RAZORPAY_KEY_ID="rzp_test_YOUR_KEY_ID"
```

---

## Quick Start

```bash
# Install dependencies
npm install

# Start development full-stack server
npm run dev

# Open browser at http://localhost:3000
```

---

## Firebase Setup & Hosting Deployment

1. Create a Firebase project at [https://console.firebase.google.com](https://console.firebase.google.com).
2. Enable **Authentication** with Phone / Anonymous sign-in.
3. Enable **Cloud Firestore** and deploy `firestore.rules`:
   ```bash
   firebase deploy --only firestore:rules
   ```
4. Build the production app:
   ```bash
   npm run build
   ```
5. Deploy to Firebase Hosting:
   ```bash
   firebase deploy --only hosting
   ```
