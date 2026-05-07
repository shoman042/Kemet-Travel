# Kemet Luxury Travel - Project Documentation

**Version**: 1.0.0  
**Date**: May 2026  
**Project Root**: `D:\Pages`  
**Author**: Lead Developer  

---

## Table of Contents
1. [Executive Summary](#executive-summary)
2. [Design Language](#design-language)
3. [Technical Stack](#technical-stack)
4. [Core Feature Specifications](#core-feature-specifications)
5. [Deployment](#deployment)
6. [Project Structure](#project-structure)

---

## Executive Summary

Kemet Luxury Travel is a premier digital platform designed for discerning travelers seeking curated Egyptian luxury experiences. The platform seamlessly integrates high-end travel planning, premium accommodation discovery, and intelligent AI-powered concierge services into a unified, sophisticated web application.

### Core Value Proposition
- **Curated Luxury Experiences**: Handpicked Egyptian destinations and itineraries tailored for the luxury travel segment
- **Intelligent Travel Planning**: AI-powered concierge providing personalized recommendations and real-time travel assistance
- **Seamless Booking Infrastructure**: End-to-end booking system with loyalty rewards and secure authentication
- **Cross-Device Accessibility**: Responsive design architecture ensuring premium experience across desktop, tablet, and mobile devices
- **Premium User Experience**: Luxury minimalist design language delivering an uncluttered, sophisticated interface

### Target Audience
High-net-worth individuals and luxury travel enthusiasts seeking authentic Egyptian experiences with premium service standards.

---

## Design Language

### Luxury Minimalist Aesthetic

The platform employs a **Luxury Minimalist** design philosophy, balancing opulent brand presence with clean, uncluttered interfaces. This approach reinforces the premium positioning while ensuring optimal usability.

#### Typography System

The typography hierarchy is built on a sophisticated dual-font system:

| Level | Font Family | Weight | Line Height | Letter Spacing | Purpose |
|-------|-------------|--------|--------------|----------------|---------|
| **H1** | Noto Serif | 700 | 1.2 | -0.02em | Hero sections, primary impact |
| **H2** | Noto Serif | 600 | 1.3 | -0.01em | Section headers |
| **H3** | Noto Serif | 600 | 1.4 | normal | Card titles, subsections |
| **Body MD** | Plus Jakarta Sans | 400 | 1.6 | normal | Primary body text |
| **Body LG** | Plus Jakarta Sans | 400 | 1.6 | normal | Enhanced readability blocks |
| **Label Caps** | Plus Jakarta Sans | 700 | 1.0 | 0.1em | Uppercase labels, badges |

**Design Rationale**: Noto Serif conveys timeless elegance and authority, aligning with Egypt's historical grandeur. Plus Jakarta Sans provides modern, highly legible body text optimized for digital interfaces.

#### Custom Brand Color Palette

The platform utilizes a Material Design 3-inspired color system with 30+ semantic colors, carefully curated for luxury branding:

##### Primary Palette
| Role | Hex Code | Usage |
|------|----------|-------|
| **Primary** | `#775a19` | Key CTAs, active states, brand accents |
| **Primary Container** | `#c5a059` | Buttons, highlighted cards, premium badges |
| **Primary Fixed** | `#ffdea5` | Hover states, secondary accents |
| **Primary Fixed Dim** | `#e9c176` | Subtle background tints |
| **On Primary** | `#ffffff` | Text on primary backgrounds |
| **On Primary Container** | `#4e3700` | Text on primary containers |

##### Surface & Background
| Role | Hex Code | Usage |
|------|----------|-------|
| **Background** | `#faf9f6` | Page backgrounds, content areas |
| **Surface** | `#faf9f6` | Card surfaces, elevated content |
| **Surface Container** | `#efeeeb` | Section backgrounds |
| **Surface Container Low** | `#f4f3f1` | Subtle section differentiation |
| **Surface Container High** | `#e9e8e5` | Elevated containers |
| **Surface Container Highest** | `#e3e2e0` | Maximum elevation surfaces |
| **Surface Variant** | `#e3e2e0` | Alternative surface option |
| **Surface Dim** | `#dbdad7` | Tinted background variant |
| **Surface Bright** | `#faf9f6` | Light surface variant |
| **On Surface** | `#1a1c1a` | Primary text on surfaces |
| **On Surface Variant** | `#4e4639` | Secondary text on surfaces |
| **On Background** | `#1a1c1a` | Text on background |

##### Secondary & Tertiary
| Role | Hex Code | Usage |
|------|----------|-------|
| **Secondary** | `#6a480e` | Secondary actions, links |
| **Secondary Container** | `#f1f1f1` | Secondary backgrounds |
| **Tertiary** | `#9b4500` | Accent highlights |
| **Tertiary Container** | `#632902` | Tertiary backgrounds |

##### Semantic Colors
| Role | Hex Code | Usage |
|------|----------|-------|
| **Error** | `#ba1a1a` | Error states, destructive actions |
| **Error Container** | `#ffdad6` | Error background messages |
| **Outline** | `#7f7667` | Borders, dividers |
| **Outline Variant** | `#d1c5b4` | Subtle borders |

#### Spacing & Layout System

Custom spacing variables ensure consistent whitespace and premium feel:

| Token | Value | Application |
|-------|-------|--------------|
| `stack-sm` | `16px` | Tight vertical spacing |
| `stack-md` | `32px` | Medium vertical spacing |
| `stack-lg` | `64px` | Section padding, major vertical gaps |
| `gutter` | `24px` | Card gaps, horizontal spacing |
| `margin-mobile` | `20px` | Mobile edge padding |
| `margin-desktop` | `80px` | Desktop edge padding |
| `container-max` | `1280px` | Maximum content width |

#### Border Radius
- **Default**: `0.25rem` (4px) - Subtle rounding
- **Large**: `0.5rem` (8px) - Card corners
- **Extra Large**: `0.75rem` (12px) - Modal corners
- **Full**: `9999px` - Pill-shaped elements

---

## Technical Stack

### Frontend Architecture

#### Tailwind CSS Implementation
The platform leverages **Tailwind CSS via CDN** with a custom configuration system:

**Loading Strategy**:
```html
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<script src="tw-config.js"></script>
```

- **CDN Approach**: Enables rapid development without build tooling overhead
- **Forms Plugin**: Provides styled form elements out-of-the-box
- **Container Queries Plugin**: Enables responsive component-level breakpoints
- **Custom Configuration**: `tw-config.js` extends Tailwind's default theme with 30+ brand colors, custom spacing, typography scale, and border radius variants

**Key Configuration Elements** (`tw-config.js`):
- Extended color palette with semantic naming convention
- Custom font family definitions mapping to Noto Serif and Plus Jakarta Sans
- Font size scale with precise line heights and letter spacing
- Spacing tokens for consistent layout system

#### Mobile Responsiveness System (`mobile-fix.css`)

A comprehensive, multi-breakpoint responsiveness layer ensures premium experience across all devices:

**Breakpoints**:
| Breakpoint | Width | Target Devices |
|------------|-------|----------------|
| Mobile | `max-width: 768px` | Smartphones, small tablets |
| Small Phones | `max-width: 375px` | iPhone SE, compact devices |
| Tablet | `769px - 1024px` | iPads, Android tablets |

**Implementation Highlights**:
- **Fluid Grid System**: Forces single-column layouts on mobile (`grid-template-columns: 1fr`), two-column on tablet
- **Typography Scaling**: H1 scales from 48px → 32px → 26px across breakpoints
- **Hero Adaptation**: Fixed heights (`870px`) transition to `100vh` auto on mobile
- **Hamburger Navigation**: Slide-in panel (280px width) with backdrop overlay, replacing desktop nav on mobile
- **iOS Optimization**: Prevents auto-zoom on inputs by enforcing `font-size: 16px`
- **Touch Optimization**: Proper tap targets, touch-action handling, and `-webkit-tap-highlight-color: transparent`

**Mobile Navigation Architecture**:
- Hidden desktop nav (`display: none !important` on mobile)
- Hamburger button (`.mobile-menu-btn`) with Material Symbols icon
- Overlay (`.mobile-menu-overlay`) with fade transition
- Slide-in panel (`.mobile-menu-panel`) with user area, navigation links, and auth buttons
- Dynamic active state highlighting for current page

---

### Backend Architecture

#### Express.js Server (`Backend/server.js`)

A robust Node.js backend built on **Express.js 5.2.1** with the following architecture:

**Core Middleware Stack**:
- **CORS**: Configurable via `CORS_ORIGIN` environment variable, supporting multiple origins with credentials
- **JSON Parsing**: `express.json()` for API request handling
- **Static File Serving**: Express static middleware for frontend assets with aggressive no-cache headers
- **Cache Control**: Force revalidation headers (`no-store, no-cache, must-revalidate`) ensuring fresh content delivery

**Database Connection Management**:
```javascript
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected successfully to MongoDB Atlas'))
  .catch((err) => console.error('MongoDB connection error:', err.message));

// Middleware: Wait for MongoDB before processing requests
app.use((req, res, next) => {
  if (mongoose.connection.readyState === 1) return next();
  mongoose.connection.asPromise().then(() => next());
});
```

- **Connection Ready State Checking**: Middleware ensures MongoDB is connected before processing requests
- **503 Fallback**: Returns service unavailable if database is unreachable
- **Graceful Timeout**: Server timeout set to 90 seconds for long-running AI requests

**Asset Versioning System**:
- **Cache Busting**: Appends `?v=timestamp` to all CSS/JS asset references
- **Implementation**: `injectAssetVersion()` function processes HTML to version static assets
- **Benefit**: Ensures users always receive the latest frontend without cache conflicts

---

### Database Architecture

#### MongoDB Atlas Integration

The platform uses **MongoDB Atlas** as a fully managed cloud database solution, providing:
- Automated backups and point-in-time recovery
- Global availability with low-latency access
- Automatic scaling based on demand
- Built-in security with encryption at rest and in transit

**ODM**: **Mongoose 9.5.0** provides schema validation, middleware, and clean abstractions over MongoDB operations.

#### Mongoose Schemas

##### User Model (`Backend/models/User.js`)
```javascript
{
  name: String (required),
  email: String (required, unique),
  password: String (required),
  phone: String,
  loyaltyPoints: Number (default: 0)
}
```
Manages user accounts with integrated loyalty program tracking.

##### Trips Model (`Backend/models/Trips.js`)
```javascript
{
  title: String,
  price: Number,
  duration: String,
  location: String,
  currency: { type: String, default: 'EGP' },
  isReady: Boolean (filter for published trips)
}
```
Curated trip packages with readiness flag for publication control.

##### Hotel Model (`Backend/models/Hotel.js`)
```javascript
{
  name: String,
  location: Mongoose.Mixed (flexible: city name or GeoJSON),
  description: String (required),
  pricePerNight: Number,
  price: Number (fallback),
  images: [String],
  amenities: [String],
  rating: Number (0-5)
}
```
Flexible schema accommodates both simple city-based and complex geolocated hotel data.

##### Place Model (`Backend/models/Place.js`)
```javascript
{
  name: String,
  entryFee: Number,
  location: String,
  category: String,
  rating: Number,
  isPopular: Boolean,
  isTopExperience: Boolean,
  images: [String],
  openingHours: String,
  highlights: [String]
}
```
Destination data with popularity and experience tier flags for filtering.

##### Booking Model (`Backend/models/Booking.js`)
```javascript
{
  user: ObjectId (ref: User),
  trip: ObjectId (ref: Trip),
  travelerDetails: {
    fullName: String,
    email: String,
    phone: String,
    nationality: String
  },
  totalPrice: Number,
  paymentMethod: String ('card' or 'paypal'),
  status: String (default: 'Confirmed'),
  bookingDate: Date
}
```
Links users to trips with comprehensive traveler information and payment tracking.

##### ChatHistory Model (`Backend/models/ChatHistory.js`)
```javascript
{
  userId: String,
  messages: [{
    role: String ('user' or 'assistant'),
    content: String,
    timestamp: Date
  }] (bounded to 100 messages)
}
```
Stores conversational context for AI chat continuity, with automatic pruning to maintain performance.

##### UserPlan Model (`Backend/models/UserPlan.js`)
```javascript
{
  userId: String (required, unique),
  data: Object (flexible JSON blob for trip plans and preferences)
}
```
Prepares infrastructure for cloud-based trip plan synchronization across devices.

---

## Core Feature Specifications

### AI Concierge

#### OpenRouter Integration with Google Gemini 2.0

The platform features an intelligent travel concierge powered by **Google Gemini 2.0 Flash Lite** accessed via **OpenRouter API**:

**Configuration** (`server.js:14-21, 61-69`):
```javascript
const OPENROUTER_MODEL = 'google/gemini-2.0-flash-lite-preview-02-05:free';
const openai = new OpenAI({
  apiKey: OPENROUTER_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1',
  defaultHeaders: {
    'HTTP-Referer': APP_REFERER,
    'X-Title': APP_TITLE
  }
});
```

**Context Injection System** (`server.js:407-418`):
The AI receives carefully curated context before each interaction:
- **Trip Context**: Up to 12 recent ready trips with title, price, duration, and location
- **Place Context**: Up to 20 destinations with entry fees, ratings, categories, and popularity flags
- **Chat History**: Last 5 messages from the user's conversation history

```javascript
const [tripsContext, placesContext] = await Promise.all([
  Trips.find({ isReady: true }).select('title price duration location currency').limit(12).lean(),
  Place.find({}).select('name entryFee location category rating').limit(20).lean()
]);
```

**System Prompt Engineering**:
- Arabic language detection for localized responses (detects `[؀-ۿ]` Unicode range)
- Professional travel-consultant tone with Markdown formatting support
- Context-aware responses based on user's budget, duration, and preferences

**Intelligent Rule-Based Fallback** (`server.js:232-315`):
When the AI API is unavailable, the system gracefully degrades to a rule-based offline reply engine:
- **Budget Detection**: Regex-based extraction of numerical values from user messages
- **Trip Filtering**: Matches user budget against available trips, returning top 3 suggestions
- **Greeting Handler**: Differentiated responses for Arabic and English greetings
- **Contextual Quick Picks**: Surfaces top 3 trips and 4 places as default recommendations
- **Bilingual Support**: Full Arabic and English response generation

**Chat History Management**:
- Persistent storage in `ChatHistory` model
- Bounded to 100 messages per user (automatic pruning)
- Last 10 messages available via `GET /api/chat/history/:userId`
- Clear history functionality via `DELETE /api/chat/history/:userId`

---

### Global Search Engine

#### Cross-Collection Filtering Logic

The platform implements a sophisticated real-time discovery system across trips, hotels, and places:

**Trips Search** (`GET /api/trips`):
- **Ready Filter**: `?ready=true` returns only published, bookable trips
- **Sorting**: Results sorted by `createdAt: -1` (newest first)
- **Lean Queries**: Uses Mongoose `.lean()` for optimal performance

**Hotels Search** (`GET /api/hotels`):
- Returns all hotels with ratings, amenities, and pricing
- Sorted by creation date for consistent ordering

**Places Search** (`GET /api/places`):
- **Popularity Filter**: `?popular=true` returns places where `isPopular: true`
- **Experience Filter**: `?top=true` returns places where `isTopExperience: true`
- **Combined Filtering**: Both parameters can be applied simultaneously
- **Image Enrichment**: `enrichPlaceForResponse()` injects default Unsplash images for places missing photography, with fallback logic for Karnak, Ras Mohammed, and generic Egypt imagery

**Query Logic Example**:
```javascript
let query = {};
if (req.query.popular === 'true') query.isPopular = true;
if (req.query.top === 'true') query.isTopExperience = true;
const places = await Place.find(query).lean();
```

**Frontend Integration**:
- Implemented across `trips.html`, `hotels.html`, `explore.html`, and `search.html`
- Query parameter passing for category filtering (e.g., `trips.html?city=Cairo`)
- Real-time result rendering with responsive card layouts

---

### Secure Booking & Authentication

#### User Authentication System

**Signup Flow** (`POST /api/auth/signup`):
- Validates required fields: `name`, `email`, `password`
- Checks for existing email to prevent duplicate registrations
- Creates user with initialized `loyaltyPoints: 0`
- Returns user object with ID, name, email, phone, and token (user ID as token for simplified auth)

**Login Flow** (`POST /api/auth/login`):
- Email and password validation
- Returns complete user profile on success
- Consistent token-based session management

**Password Reset via OTP** (`POST /api/auth/forgot-password` & `POST /api/auth/reset-password`):
- **OTP Generation**: 6-digit one-time password using `Math.floor(100000 + Math.random() * 900000)`
- **Expiration**: 10-minute TTL stored in `resetOtpExpiresAt`
- **Email Delivery**: Styled HTML email via Nodemailer with bilingual content (English/Arabic)
- **Security**: Single-use OTP (cleared after successful reset), expiration validation, mismatch rejection
- **SMTP Configuration**: Supports both service-based (`SMTP_SERVICE`) and host-based (`SMTP_HOST`, `SMTP_PORT`) email delivery

**Email Template Highlights**:
- Premium styled HTML with Kemet Travel branding
- Bilingual OTP display (English and Arabic)
- Clear expiration warning (10 minutes)
- Professional typography and color scheme matching the platform

#### Booking System (`POST /api/bookings`)

**Validation Layer**:
- Required fields: `userId`, `tripId`, `travelerDetails` (fullName, email, phone)
- ObjectId format validation for `userId` and `tripId`
- Minimum 6-character password policy for new registrations
- Positive totalPrice validation

**Loyalty Points Automation**:
```javascript
const loyaltyEarned = Math.max(1, Math.floor(parsedTotalPrice / 100));
await User.findByIdAndUpdate(userId, { $inc: { loyaltyPoints: loyaltyEarned } });
```
- Earns 1 point per 100 currency units spent (minimum 1 point)
- Automatically increments user's loyalty balance on successful booking

**Booking Confirmation**:
- Status automatically set to `'Confirmed'`
- Supports both card and PayPal payment methods
- Returns populated trip data for immediate display
- Provides `bookingId` and `loyaltyEarned` in response

**Booking Retrieval** (`GET /api/bookings/:userId`):
- Returns all user bookings sorted by date (newest first)
- Populates trip details for each booking
- Normalizes status (treats 'pending' as 'Confirmed' for consistency)

**Booking Audit** (`GET /api/bookings/:userId/audit`):
- Structured audit trail with bookingId, trip title, total price, status, payment method, and traveler name
- Enables administrative oversight and user history review

#### User Profile Management

**Profile Retrieval** (`GET /api/users/:userId`):
- Returns sanitized user data (name, email, phone, loyaltyPoints)
- Excludes sensitive fields like password

**Profile Update** (`PATCH /api/users/:userId`):
- Allows updating name, email, and phone
- Runs validators on update to ensure data integrity

**Password Change** (`PATCH /api/users/:userId/password`):
- Current password verification before allowing change
- Minimum 6-character requirement for new password
- Direct password update (ready for bcrypt hashing in security upgrade)

---

## Deployment

### Vercel Serverless Environment

The platform is deployed on **Vercel** with a hybrid architecture combining serverless functions and static hosting:

**Configuration** (`vercel.json`):
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

**Architecture**:
- **API Layer**: `Backend/server.js` deployed as serverless function via `@vercel/node`
- **Frontend**: Static HTML, CSS, and JS files served from `Fronted/` directory
- **Routing**: API requests route to serverless function; all other requests serve static frontend assets

**Note**: The serverless entry point (`api/index.js`) re-exports `Backend/server.js` for Vercel compatibility.

### Environment Variable Management

Security-sensitive configuration is managed exclusively through environment variables, never committed to source control:

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGO_URI` | MongoDB Atlas connection string | `mongodb+srv://user:pass@cluster.mongodb.net/db` |
| `OPENROUTER_API_KEY` | OpenRouter API key (or `OPENAI_API_KEY`) | `sk-or-v1-...` |
| `OPENROUTER_MODEL` | AI model identifier | `google/gemini-2.0-flash-lite-preview-02-05:free` |
| `OPENROUTER_BASE_URL` | API base URL | `https://openrouter.ai/api/v1` |
| `CORS_ORIGIN` | Allowed CORS origins (comma-separated) | `http://localhost:5000,https://kemet-luxury-travel.vercel.app` |
| `SMTP_*` | Email service credentials | `SMTP_USER`, `SMTP_PASS`, `SMTP_HOST`, `SMTP_PORT` |
| `APP_REFERER` | Application URL for API headers | `https://kemet-luxury-travel.vercel.app` |
| `APP_TITLE` | Application name for API headers | `Kemet Luxury Travel` |
| `NODE_ENV` | Environment mode | `production` or `development` |

**Security Practices**:
- `.env` file is included in `.gitignore` to prevent credential leakage
- `.env.example` provides template without sensitive values
- Vercel environment variables configured securely in project dashboard
- No hardcoded secrets in source code

### Deployment Workflow
1. **Source Control**: Push to `main` branch triggers automatic Vercel deployment
2. **Build Process**: Vercel detects Node.js backend and static frontend automatically
3. **Environment**: Production variables injected at runtime from Vercel dashboard
4. **DNS**: Custom domain mapping via Vercel's DNS management

---

## Project Structure

```
D:\Pages\
├── .gitignore                          # Excludes node_modules, .env, .claude/
├── package.json                        # Root package.json (kemet-travel)
├── vercel.json                         # Vercel deployment configuration
├── PROJECT_DOCUMENTATION.md            # This file
│
├── .claude\                            # Claude Code settings (local, gitignored)
│   └── settings.local.json            # Permissions configuration
│
├── Fronted\                            # Frontend static files
│   ├── index.html                     # Home page (hero, destinations, experiences)
│   ├── app.js                         # Main frontend JavaScript (257KB)
│   ├── tw-config.js                   # Tailwind custom configuration
│   ├── mobile-fix.css                 # Mobile responsiveness fixes
│   ├── booking.html                   # Trip booking page
│   ├── confirmation.html              # Booking confirmation
│   ├── dashboard.html                 # User dashboard
│   ├── explore.html                   # Places exploration
│   ├── hotel-details.html            # Individual hotel view
│   ├── hotels.html                    # Hotel listings
│   ├── login.html                     # User login
│   ├── my-trip.html                  # Trip planner
│   ├── place.html                     # Individual place view
│   ├── profile-settings.html         # User profile management
│   ├── signup.html                    # User registration
│   ├── success.html                   # General success page
│   ├── support.html                   # Customer support
│   ├── trips.html                     # Trip catalog
│   ├── search.html                    # Global search
│   └── trip-details.html             # Individual trip view
│
└── Backend\
    ├── server.js                       # Main Express server (1009 lines)
    ├── package.json                   # Backend dependencies
    ├── .env                           # Environment variables (gitignored)
    ├── .env.example                   # Environment template
    │
    └── models\
        ├── Booking.js                # Booking schema
        ├── ChatHistory.js            # Chat message storage
        ├── ChatMessage.js            # Individual message schema
        ├── Hotel.js                  # Hotel schema
        ├── Place.js                  # Place/destination schema
        ├── Trip.js                   # Legacy trip schema
        ├── Trips.js                  # Primary trips schema
        ├── User.js                   # User account schema
        └── UserPlan.js               # Cloud sync preparation
```

---

**Document Version**: 1.0.0  
**Last Updated**: May 2026  
**Author**: Yusuf Shoman, Kemet Luxury Travel  
**Status**: Production Ready
