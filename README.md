# Kemet Travel (Kemet Luxury Travel) - Project Documentation

**Version**: 1.0.0  
**Date**: May 7, 2026  
**Project Root**: `D:\Pages`  
**Brand Note**: Initially conceptualized as "Kemet Luxury Travel", the implementation uses "Kemet Travel" as the public-facing brand.

---

## Table of Contents
1. [Introduction](#introduction)
2. [Phase 1: Project Initialization & UI/UX Strategy](#phase-1-project-initialization--uiux-strategy)
3. [Phase 2: Database & Backend Architecture](#phase-2-database--backend-architecture)
4. [Phase 3: Core Features Development](#phase-3-core-features-development)
5. [Phase 4: Cross-Device Synchronization](#phase-4-cross-device-synchronization)
6. [Phase 5: Final Polish & Fixes](#phase-5-final-polish--fixes)
7. [Current Project Structure](#current-project-structure)
8. [Deployment Guide](#deployment-guide)
9. [Future Roadmap](#future-roadmap)
10. [Appendix](#appendix)

---

## Introduction

### Project Overview
Kemet Travel is a luxury Egyptian travel platform that provides curated trip packages, hotel bookings, place exploration, and AI-powered travel assistance. The platform serves both desktop and mobile users with a premium minimalist design aesthetic.

### Core Goals
- Provide seamless luxury travel booking experience for Egyptian destinations
- Offer AI-powered travel recommendations and chat support
- Enable cross-device trip planning and management
- Deliver responsive, premium UI across all devices

### Technology Stack
| Layer | Technology |
|-------|------------|
| **Frontend** | Static HTML5, Tailwind CSS (CDN), Vanilla JavaScript |
| **Backend** | Node.js, Express.js, Mongoose ODM |
| **Database** | MongoDB Atlas (Cloud-hosted) |
| **AI Integration** | OpenRouter API (Google Gemini 2.0 Flash Lite) |
| **Email** | Nodemailer (SMTP) |
| **Deployment** | Vercel (Serverless Functions + Static Hosting) |
| **Typography** | Noto Serif (headings), Plus Jakarta Sans (body) |
| **Icons** | Material Symbols Outlined |

---

## Phase 1: Project Initialization & UI/UX Strategy

### 1.1 Luxury Minimalist Aesthetic Choice
The design system was built around a **Luxury Minimalist** philosophy to align with premium travel branding:

#### Typography System (`tw-config.js:70-77`)
- **Noto Serif**: Used for headings (h1-h3) to convey timeless elegance and authority
- **Plus Jakarta Sans**: Used for body text (body-md, body-lg) for modern readability
- **Label Caps**: Plus Jakarta Sans with `tracking-widest` for uppercase labels

#### Color Palette (`tw-config.js:6-52`)
Custom Material Design 3-inspired palette with 30+ semantic colors:
- **Primary Gold**: `#775a19` (primary), `#c5a059` (primary-container) - Luxury accent
- **Surface Neutrals**: `#faf9f6` (background), `#f4f3f1` (surface-container-low)
- **Text Colors**: `#1a1c1a` (on-surface), `#4e4639` (on-surface-variant)
- **Semantic Colors**: Error (`#ba1a1a`), Secondary (`#6a480e`)

#### Spacing & Layout
- Generous whitespace using custom spacing variables:
  - `stack-lg: 64px` (section padding)
  - `gutter: 24px` (card gaps)
  - `container-max: 1280px` (max content width)
- Rounded corners: `lg: 0.5rem`, `xl: 0.75rem`
- Subtle shadows and hover transitions for premium feel

### 1.2 Tailwind CSS Integration
#### CDN Setup (`index.html:10`)
```html
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
```
- Used Tailwind CSS Play CDN for rapid development without build tools
- Included `forms` plugin for styled form elements
- Included `container-queries` plugin for responsive component queries

#### Custom Configuration (`tw-config.js`)
Extended default Tailwind theme with:
- 30+ custom brand colors with semantic naming
- Custom spacing variables matching design tokens
- Typography scale with precise line heights and letter spacing
- Border radius variants for consistent rounding

### 1.3 Migration from External Config to Inline Scripts
#### Problem
Initial setup loaded custom Tailwind config before the Tailwind CDN initialized, causing custom theme classes to not generate.

#### Solution (`index.html:10-13`)
Correct loading order:
1. Load Tailwind CDN with plugins first
2. Load custom config as inline script *after* Tailwind runtime initializes

```html
<!-- Step 1: Load Tailwind CDN -->
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<!-- Step 2: Apply custom config after Tailwind is available -->
<script src="tw-config.js"></script>
```

This ensures `tailwind.config` is set after the Tailwind runtime is available, correctly applying all custom theme classes.

---

## Phase 2: Database & Backend Architecture

### 2.1 MongoDB Atlas Setup
#### Choice Rationale
- **Managed Service**: No self-hosting overhead, automatic backups
- **Global Availability**: Low-latency access from Vercel's edge network
- **Scalability**: Automatic scaling with usage
- **Security**: Built-in encryption, network isolation

#### Connection Strategy (`server.js:150-168`)
```javascript
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected successfully to MongoDB Atlas'))
  .catch((err) => console.error('MongoDB connection error:', err.message));

// Middleware: Wait for DB connection before processing requests
app.use((req, res, next) => {
  if (mongoose.connection.readyState === 1) return next();
  mongoose.connection.asPromise()
    .then(() => next())
    .catch((err) => {
      res.status(503).json({ message: 'Database unavailable. Please try again.' });
    });
});
```

### 2.2 Model Structure

#### UserPlan Model (`Backend/models/UserPlan.js`)
Lightweight key-value store for user-specific data:
```javascript
const userPlanSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    data: { type: Object, default: {} },
}, { timestamps: true });
```
**Purpose**: Replace localStorage with cloud-backed storage for trip plans, drafts, and preferences.

#### Hotel Model (`Backend/models/Hotel.js`)
Flexible schema for hotel listings:
```javascript
const hotelSchema = new mongoose.Schema({
    name: { type: String, trim: true },
    location: { type: mongoose.Schema.Types.Mixed, required: true }, // Supports city names or GeoJSON
    pricePerNight: { type: Number, min: 0 },
    price: { type: Number, min: 0 }, // Fallback pricing
    images: { type: [String], default: [] },
    amenities: { type: [String], default: [] },
    rating: { type: Number, default: 0, min: 0, max: 5 }
}, { timestamps: true });
```

#### Other Models
- **User**: `name`, `email`, `password` (plain text - see Security Note), `phone`, `loyaltyPoints`
- **Trip/Trips**: Trip packages with `title`, `price`, `duration`, `location`, `isReady` flag
- **Place**: Destinations with `name`, `entryFee`, `category`, `rating`, `isPopular`, `isTopExperience`
- **Booking**: Links `user` and `trip` with `travelerDetails`, `totalPrice`, `paymentMethod`, `status`
- **ChatHistory**: Stores `messages` array bounded to 100 per `userId`

### 2.3 Centralized Backend Synchronization Model
#### Rationale for Moving from localStorage to Cloud Sync
| Concern | localStorage | Cloud Sync (MongoDB) |
|---------|--------------|----------------------|
| **Cross-Device** | Device/browser-specific | Access from any device |
| **Persistence** | Lost on device reset/cache clear | Permanent cloud storage |
| **Storage Limit** | 5MB per origin | Unlimited |
| **Data Safety** | No backup | Automated Atlas backups |
| **Scalability** | Client-side only | Server-side processing |

#### Implementation Status
- **Ready**: UserPlan model created
- **Pending**: API endpoints (`GET/PUT /api/userplan/:userId`) and frontend integration

---

## Phase 3: Core Features Development

### 3.1 Features Referenced vs. Implemented
| Feature | Status | Notes |
|---------|--------|-------|
| Global Search API | ✅ Implemented | `/api/trips`, `/api/hotels`, `/api/places` endpoints |
| AI Chatbot | ✅ Implemented | OpenRouter API integration |
| Booking System | ✅ Implemented | Full trip booking with loyalty points |
| OTP Password Reset | ✅ Implemented | Email-based OTP with 10-minute expiration |

### 3.2 Global Search API Logic
#### Endpoints (`server.js:519-616`)
- **`GET /api/trips`**: Accepts `?ready=true` filter, returns all trips sorted by `createdAt: -1`
- **`GET /api/hotels`**: Returns all hotels with ratings and amenities
- **`GET /api/places`**: Accepts `?popular=true` and `?top=true` filters using `isPopular` and `isTopExperience` flags

#### Query Logic
```javascript
// Places with filters
let query = {};
if (req.query.popular === 'true') query.isPopular = true;
if (req.query.top === 'true') query.isTopExperience = true;
const places = await Place.find(query).lean();
```

### 3.3 AI Chatbot (`/api/chat`)
#### Provider Configuration (`server.js:14-21, 61-69`)
- **API**: OpenRouter with Google Gemini 2.0 Flash Lite model
- **Fallback**: Offline rule-based responses via `buildOfflineReply()`

#### Context Injection (`server.js:407-418`)
```javascript
const [tripsContext, placesContext] = await Promise.all([
  Trips.find({ isReady: true }).select('title price duration location currency').limit(12).lean(),
  Place.find({}).select('name entryFee location category rating').limit(20).lean()
]);
```

#### Chat History Management
- Stored in `ChatHistory` model
- Bounded to 100 messages per user
- Last 10 messages returned on `GET /api/chat/history/:userId`

---

## Phase 4: Cross-Device Synchronization

### 4.1 Current State (localStorage)
The frontend (`Fronted/app.js`) currently uses localStorage for:
- **Session Management**: `userId` persistence (`app.js:1493, 1525`)
- **Chat History**: `CHAT_STORAGE_KEY`
- **Trip Drafts**: `kemet-day-draft`, `TRIP_PLAN_SELECTED_KEY`
- **Booking Mode**: `B00KING_MODE_KEY`, `PAYMENT_TRIP_NAMES_KEY`

### 4.2 Cloud Sync System Design
#### UserPlan Model Purpose (`Backend/models/UserPlan.js`)
Stores arbitrary user data as a JSON blob keyed by `userId`:
```javascript
{
  userId: "507f1f77bcf86cd799439011",
  data: {
    tripDrafts: { /* ... */ },
    chatHistory: [ /* ... */ ],
    preferences: { /* ... */ }
  }
}
```

#### Transition Strategy
1. **Backend**: Add endpoints `GET/PUT /api/userplan/:userId`
2. **Frontend**: On login, fetch UserPlan from backend
3. **Sync**: Debounce-save changes to backend instead of localStorage
4. **Cleanup**: Remove localStorage fallbacks for authenticated users

#### Benefits
- Access trips from phone, laptop, tablet with single login
- Automatic data backup and recovery
- Shared trip planning between devices
- Server-side analytics potential

---

## Phase 5: Final Polish & Fixes

### 5.1 Mobile-Fix Strategy (`Fronted/mobile-fix.css`)
Comprehensive mobile responsiveness with 3 breakpoints:

#### Breakpoints
- **Mobile**: `max-width: 768px`
- **Small Phones**: `max-width: 375px` (iPhone SE, etc.)
- **Tablet**: `min-width: 769px and max-width: 1024px`

#### Key Fixes
| Issue | Solution |
|-------|-----------|
| Horizontal overflow | `body { overflow-x: hidden !important; }` |
| Fixed hero heights | `height: auto !important; min-height: 100vh !important;` |
| Typography scaling | h1: 48px → 32px, h2: 36px → 28px on mobile |
| Grid layouts | Force single column: `grid-template-columns: 1fr !important;` |
| Hamburger menu | Slide-in panel with overlay (lines 284-433) |
| iOS zoom prevention | Force `font-size: 16px` on all inputs |
| Navigation | Hide desktop nav, show mobile menu button |

#### Hamburger Menu Implementation
- **Button**: `.mobile-menu-btn` (hidden on desktop, flex on mobile)
- **Overlay**: `.mobile-menu-overlay` with backdrop blur
- **Panel**: `.mobile-menu-panel` slides in from right (280px width)
- **Navigation**: Dynamic links with active state highlighting

### 5.2 Tailwind CDN Loading Order Fix
**Problem**: Custom theme classes not generating because `tw-config.js` loaded before Tailwind CDN.

**Fix** (`index.html:10-13`):
1. Load Tailwind CDN first with plugins
2. Load custom config script after Tailwind initializes

### 5.3 Security Permissions
#### settings.local.json Status
- **Not Found**: No `settings.local.json` in project (`.gitignore` ignores `.claude/` directory)
- **Backend Security Measures**:
  - **CORS**: Configurable via `CORS_ORIGIN` env variable (`server.js:49-52, 86-92`)
  - **Authentication**: Simple email/password 
  - **OTP Security**: 6-digit OTP with 10-minute expiration, single-use after password reset
  - **Environment Variables**: `.env` file ignored by git, contains sensitive credentials

#### Security Recommendations
1. Hash passwords using `bcrypt` before storing
2. Implement JWT or session-based authentication
3. Add rate limiting on auth endpoints
4. Create `settings.local.json` for Claude Code permissions if needed

---

## Current Project Structure

```
D:\Pages\
├── .gitignore
├── package.json                 # Root package.json (kemet-travel)
├── vercel.json                  # Vercel deployment config
├── PROJECT_DOCUMENTATION.md     # This file
├── Fronted\                     # Frontend static files
│   ├── index.html               # Home page
│   ├── app.js                   # Main frontend JavaScript (257KB)
│   ├── tw-config.js             # Tailwind custom configuration
│   ├── mobile-fix.css           # Mobile responsiveness fixes
│   ├── booking.html
│   ├── confirmation.html
│   ├── dashboard.html
│   ├── explore.html
│   ├── hotel-details.html
│   ├── hotels.html
│   ├── login.html
│   ├── my-trip.html
│   ├── place.html
│   ├── profile-settings.html
│   ├── signup.html
│   ├── success.html
│   ├── support.html
│   ├── trips.html
│   ├── search.html
│   └── trip-details.html
└── Backend\
    ├── server.js                 # Main Express server (1009 lines)
    ├── package.json              # Backend dependencies
    ├── .env                      # Environment variables (ignored)
    ├── .env.example              # Environment template
    └── models\
        ├── Booking.js
        ├── ChatHistory.js
        ├── ChatMessage.js
        ├── Hotel.js
        ├── Place.js
        ├── Trip.js
        ├── Trips.js
        ├── User.js
        └── UserPlan.js           # Prepared for cloud sync
```

---

## Deployment Guide

### Vercel Configuration (`vercel.json`)
```json
{
  "version": 2,
  "builds": [
    { "src": "api/index.js", "use": "@vercel/node" },
    { "src": "Fronted/**", "use": "@vercel/static" }
  ],
  "routes": [
    { "src": "/api/(.*)", "dest": "/api/index.js" },
    { "src": "/(.*)", "dest": "/Fronted/$1" }
  ]
}
```

### Environment Variables Required
| Variable | Description | Example |
|----------|-------------|---------|
| `MONGO_URI` | MongoDB Atlas connection string | `mongodb+srv://...` |
| `OPENROUTER_API_KEY` | OpenRouter API key (or `OPENAI_API_KEY`) | `sk-or-v1-...` |
| `OPENROUTER_MODEL` | AI model to use | `google/gemini-2.0-flash-lite-preview-02-05:free` |
| `CORS_ORIGIN` | Allowed CORS origins (comma-separated) | `http://localhost:5000,https://kemet-travel.vercel.app` |
| `SMTP_*` | Email service credentials | `SMTP_USER`, `SMTP_PASS`, etc. |
| `NODE_ENV` | Environment mode | `production` or `development` |

### Deployment Steps
1. Connect GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy (auto-deploys on git push to main)

---

## Future Roadmap

### Features Referenced but Not Implemented
1. **A* Search Algorithm (Zombie Game)**: Pathfinding algorithm for game feature
2. **CLIP/ChromaDB Landmark Recognition**: AI-powered landmark identification from images
3. **Complete Cloud Sync**: Integrate UserPlan model with frontend, remove localStorage

### Planned Improvements
1. **Security**: Hash passwords with bcrypt, implement JWT authentication
2. **Testing**: Add unit and integration tests
3. **Performance**: Add image optimization, lazy loading, CDN for static assets
4. **Features**: User reviews, interactive maps, multi-language support (Arabic/English)
5. **Mobile App**: React Native or Flutter companion app

---

## Appendix

### Git History
```
f4ed4dc update
5f5c914 update
e990302 update
5389e3b Update app.js
d45ea01 first commit
b69e9b2 first commit
```
Total: 6 commits, mostly updates with one app.js modification.

### Key Dependencies
#### Backend (`Backend/package.json`)
- `express: ^5.2.1` - Web framework
- `mongoose: ^9.5.0` - MongoDB ODM
- `openai: ^4.68.4` - OpenRouter/OpenAI SDK
- `nodemailer: ^8.0.7` - Email sending
- `cors: ^2.8.6` - CORS middleware
- `dotenv: ^17.4.2` - Environment variables

### Known Issues
1. **Password Storage**: Passwords stored in plain text (security risk)
2. **Error Handling**: Some endpoints lack comprehensive validation
3. **No Tests**: No automated test suite
4. **settings.local.json**: Missing for Claude Code permissions
5. **Duplicate Structure**: `Backend/Backend/` duplicate directory with copies of models/server

---

**Document Generated**: May 7, 2026  
**Generated By**: yusuf
**Based On**: Codebase exploration of `D:\Pages` (commit f4ed4dc)
