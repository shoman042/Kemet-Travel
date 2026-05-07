# Kemet Luxury Travel - Agile Software Engineering Documentation

**Version**: 1.0.0  
**Date**: May 2026  
**Project Root**: `D:\Pages`  
**Author**: Lead Developer (Computer Engineering Student)  
**Methodology**: Agile (Iterative Development, Sprint-Based Delivery)

---

## Table of Contents
1. [Software Requirements Specification (SRS) - Agile Edition](#1-software-requirements-specification-srs---agile-edition)
2. [System Design Document (SDD)](#2-system-design-document-sdd)
3. [Agile Process Documentation](#3-agile-process-documentation)
4. [Test Plan & Deployment](#4-test-plan--deployment)

---

## 1. Software Requirements Specification (SRS) - Agile Edition

### 1.1 User Stories

Following Agile methodology, functional requirements are expressed as User Stories in the format: *"As a [user type], I want to [action], so that [benefit]."*

#### AI Concierge Stories
| ID | User Story | Priority |
|----|-------------|----------|
| **US-01** | As a traveler, I want to chat with an AI assistant, so that I can receive personalized trip recommendations based on my budget and preferences. | High |
| **US-02** | As a bilingual user, I want the AI to respond in my preferred language (English/Arabic), so that I can communicate effectively. | High |
| **US-03** | As a user with limited connectivity, I want a rule-based fallback system, so that I still receive travel recommendations when the AI API is unavailable. | Medium |

#### Global Search Stories
| ID | User Story | Priority |
|----|-------------|----------|
| **US-04** | As a traveler, I want to search across trips, hotels, and places simultaneously, so that I can discover all relevant options in one interaction. | High |
| **US-05** | As a user, I want to filter destinations by popularity and experience tiers, so that I can quickly find top-rated locations. | Medium |

#### Booking System Stories
| ID | User Story | Priority |
|----|-------------|----------|
| **US-06** | As a registered user, I want to book trips securely, so that my travel plans are confirmed with proper validation. | High |
| **US-07** | As a traveler, I want to earn loyalty points automatically, so that I receive rewards for my bookings. | Medium |
| **US-08** | As a user who forgot my password, I want to reset it via email OTP, so that I can regain account access securely. | High |

#### Cloud Sync Stories
| ID | User Story | Priority |
|----|-------------|----------|
| **US-09** | As a multi-device user, I want my trip plans stored in the cloud, so that I can access them from any device. | High |
| **US-10** | As a traveler, I want my drafts automatically saved to the server, so that no planning progress is lost. | Medium |

---

### 1.2 Functional Requirements

#### FR-01: AI Concierge (Intelligent Travel Assistant)
- **Context Injection**: The system shall inject contextual data (top 12 ready trips, top 20 places) into the AI prompt before processing user requests (`server.js:407-418`).
- **Bilingual Processing**: The system shall detect Arabic Unicode characters (`[؀-ۿ]`) to determine response language, maintaining a professional travel-consultant tone.
- **Offline Fallback**: The system shall utilize a rule-based engine (`buildOfflineReply`) to provide budget-based trip filtering when the AI API is unavailable.
- **History Management**: The system shall persist chat history in MongoDB (ChatHistory model), bounding storage to the last 100 messages per user.

#### FR-02: Global Search Engine
- **Cross-Collection Filtering**: The system shall provide RESTful endpoints for Trips, Hotels, and Places with support for query parameters (`?popular=true`, `?top=true`).
- **Lean Queries**: The persistence layer shall utilize Mongoose `.lean()` queries for read-heavy operations to optimize serialization overhead.
- **Image Enrichment**: The system shall inject default Unsplash imagery for Places missing photography, utilizing a fallback hierarchy (Specific Landmark → Generic Egypt).

#### FR-03: Booking System
- **Secure Authentication**: The system shall support user registration and login via email/password.
- **OTP Verification**: The system shall generate a 6-digit One-Time Password (OTP) for password recovery, with a 10-minute Time-To-Live (TTL) enforced by `resetOtpExpiresAt`.
- **Loyalty Automation**: Upon successful booking confirmation, the system shall automatically calculate and credit loyalty points (`Math.floor(totalPrice / 100)`, minimum 1 point) to the user's profile.
- **Data Validation**: The system shall validate ObjectId formats for `userId` and `tripId` and ensure `travelerDetails` completeness before write operations.

#### FR-04: Cloud Sync (UserPlan)
- **Persistence Layer Abstraction**: The system shall utilize the `UserPlan` model to store arbitrary user-specific data (drafts, preferences) as a JSON blob keyed by `userId`.
- **Cross-Device Access**: The architecture is designed to transition from `localStorage` (client-side) to Cloud Sync (server-side) to allow users to access trip plans from multiple devices.

---

### 1.3 Non-Functional Requirements

#### NFR-01: Responsiveness (Quality Attribute)
- **Mobile-First Design**: The `mobile-fix.css` layer defines breakpoints at 768px (Mobile), 375px (Small Phones), and 1024px (Tablet).
- **Fluid Grids**: The UI shall force single-column layouts on mobile devices and prevent iOS auto-zoom by enforcing `font-size: 16px` on input fields.
- **Adaptive Typography**: Headings shall scale dynamically (H1: 48px → 32px → 26px) across breakpoints.

#### NFR-02: Cross-Device Persistence (Quality Attribute)
- **Cloud-Backed Storage**: User data shall be stored in MongoDB Atlas via the `UserPlan` model, enabling access from any device with authentication.
- **Data Integrity**: The system shall enforce `unique: true` on `UserPlan.userId` to prevent data collisions.
- **Offline Capability**: The system shall maintain `localStorage` fallbacks for unauthenticated users while transitioning to cloud sync for authenticated sessions.

#### NFR-03: Scalability
- **Managed Database**: The system leverages **MongoDB Atlas** as a managed cloud database, providing automatic horizontal scaling and automated backups.
- **Serverless Execution**: Backend utilizes Vercel Serverless functions with a 90-second timeout for long-running AI requests.

#### NFR-04: Performance
- **Cache Control**: The application implements aggressive `no-store, no-cache` headers and asset versioning (`?v=timestamp`) to ensure fresh content delivery.
- **Lean Operations**: Read operations use Mongoose `.lean()` for optimal performance by skipping Mongoose document instantiation.

---

### 1.4 Use Case Descriptions (High-Priority)

#### Use Case 1: Trip Reservation
- **Actor**: Registered User
- **Precondition**: User is authenticated and has a valid `userId`.
- **Flow**:
  1. User browses `GET /api/trips` with `?ready=true`.
  2. User selects a trip and submits `POST /api/bookings` with `travelerDetails` and `totalPrice`.
  3. System validates `tripId` against the Trips collection.
  4. System creates a Booking record and updates User's `loyaltyPoints` via `$inc`.
  5. System returns `bookingId` and `loyaltyEarned` confirmation.
- **Postcondition**: Booking status is 'Confirmed' and loyalty points are persisted.

#### Use Case 2: AI Itinerary Generation
- **Actor**: Traveler (Guest or Registered)
- **Precondition**: Chat interface is initialized.
- **Flow**:
  1. User sends a message (e.g., "Budget 2000 EGP for Luxor").
  2. System invokes `POST /api/chat`, resolving `userId` from headers or body.
  3. System fetches context (Trips/Places) and history (last 5 messages).
  4. System constructs a payload for OpenRouter API (Gemini 2.0 Flash Lite).
  5. AI returns a Markdown-formatted itinerary; System persists message to ChatHistory.
- **Postcondition**: Chat history updated; user receives personalized itinerary.

#### Use Case 3: Secure OTP Recovery
- **Actor**: Registered User
- **Precondition**: User has a verified email in the User collection.
- **Flow**:
  1. User requests `POST /api/auth/forgot-password` with email.
  2. System generates a 6-digit OTP and sets `resetOtpExpiresAt` to current time + 10 minutes.
  3. System sends styled HTML email via Nodemailer (bilingual English/Arabic).
  4. User submits `POST /api/auth/reset-password` with OTP and `newPassword`.
  5. System validates OTP against DB and checks expiration time (`getTime() < Date.now()`).
  6. System clears OTP fields and updates password.
- **Postcondition**: User can now login with the new password.

---

## 2. System Design Document (SDD)

### 2.1 High-Level Architecture

The system follows a **Client-Server Model** with serverless execution, designed to support Agile scalability through iterative feature additions.

#### Architectural Components

**Client Layer (Frontend)**:
- Static HTML5/CSS3/JavaScript served via Vercel's CDN.
- Tailwind CSS loaded via CDN with custom configuration (`tw-config.js`).
- Responsive design implemented through `mobile-fix.css` breakpoints.

**Server Layer (Backend)**:
- Express.js application deployed as a Serverless Function using `@vercel/node`.
- Middleware stack: CORS, JSON parsing, static file serving, cache control.
- Database connection management with readiness state checking before request processing.

**Persistence Layer**:
- MongoDB Atlas accessed via Mongoose ODM over TCP.
- Schema validation, middleware, and clean abstractions over MongoDB operations.

#### Routing Logic (`vercel.json`)
- API requests (`/api/*`) are routed to the serverless entry point (`api/index.js`).
- All other requests (`/*`) are mapped to the `Fronted/` static directory.

#### Architecture Diagram
```
[ Client Browser ]  -->  [ Vercel Edge Network ]  -->  [ Serverless Function (Express) ]
                                                          |
                                                          v
                                                  [ MongoDB Atlas ]
```

#### Agile Scalability Support
- **Modular Routes**: New features (e.g., Reviews, Maps) can be added as new route modules.
- **Serverless Scaling**: Vercel automatically scales function instances based on demand.
- **Database Flexibility**: Mongoose schemas allow incremental field additions without downtime.

---

### 2.2 Database Design

The persistence layer consists of the following Mongoose schemas:

#### Schema: User
```javascript
{
  name: String (required),
  email: String (required, unique),
  password: String (required),
  phone: String,
  loyaltyPoints: Number (default: 0)
}
```
- **Relationships**: 1:N with Booking (user field references User._id).
- **Data Integrity**: Unique constraint on email prevents duplicate registrations.

#### Schema: Trips
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
- **Relationships**: 1:N with Booking (trip field references Trips._id).
- **Indexing**: Sorted by `createdAt: -1` for consistent ordering.

#### Schema: Hotels
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
- **Relationships**: Standalone collection.
- **Flexible Field**: `location` uses Mixed type to support both simple strings and complex objects.

#### Schema: Places
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
- **Relationships**: Standalone collection.
- **Filtering Flags**: `isPopular` and `isTopExperience` enable efficient query filtering.

#### Schema: Booking
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
- **Relationships**: N:1 with User, N:1 with Trip (populated on retrieval).
- **Data Integrity**: Validates ObjectId format before database operations.

#### Schema: UserPlan (Cloud Sync)
```javascript
{
  userId: { type: String, required: true, unique: true },
  data: { type: Object, default: {} }
}
```
- **Relationships**: Key-value store keyed by userId.
- **Purpose**: Bridges client-side localStorage and server-side persistence for cross-device sync.

#### Schema: ChatHistory
```javascript
{
  userId: String,
  messages: [{
    role: String ('user' or 'assistant'),
    content: String,
    timestamp: Date
  }]
}
```
- **Relationships**: Bounded to 100 messages per user (automatic pruning).
- **Purpose**: Maintains conversational context for AI chat continuity.

#### Entity Relationship Summary
```
User (1) --------< (N) Booking >------- (1) Trip
User (1) --------< (1) UserPlan (key-value store)
Place (standalone collection)
Hotel (standalone collection)
User (1) --------< (1) ChatHistory (bounded messages)
```

---

## 3. Agile Process Documentation

### 3.1 Sprint Log

The project followed a 5-Sprint Agile lifecycle, with each sprint delivering functional increments deployed via Vercel's continuous integration.

#### Sprint 1: Project Initialization & UI/UX Strategy (Phase 1)
**Duration**: Week 1-2  
**Sprint Goal**: Establish design language and frontend foundation.

**Sprint Backlog**:
- Define Luxury Minimalist aesthetic with Noto Serif and Plus Jakarta Sans.
- Configure Tailwind CSS with custom brand color palette (30+ colors).
- Create responsive layout system with spacing tokens (`stack-lg`, `gutter`, `container-max`).
- Implement initial HTML structure for home page (`index.html`).

**Delivered Increment**: 
- Functional homepage with hero section, destination cards, and typography system.
- Custom Tailwind configuration (`tw-config.js`) with semantic color naming.

**Definition of Done**: Homepage renders correctly on desktop and mobile viewports with luxury aesthetic.

---

#### Sprint 2: Database & Backend Architecture (Phase 2)
**Duration**: Week 3-4  
**Sprint Goal**: Build robust persistence layer and API foundation.

**Sprint Backlog**:
- Configure MongoDB Atlas connection with Mongoose ODM.
- Implement User, Trips, Hotels, Places, Booking, ChatHistory, and UserPlan schemas.
- Build Express.js server with CORS, JSON parsing, and cache control middleware.
- Create RESTful API endpoints for trips, hotels, places, and authentication.

**Delivered Increment**:
- Fully functional API with MongoDB integration.
- User authentication endpoints (signup, login).
- CRUD operations for all core collections.

**Definition of Done**: All API endpoints return correct responses; database connection stable; Postman tests pass.

---

#### Sprint 3: Core Features Development (Phase 3)
**Duration**: Week 5-6  
**Sprint Goal**: Implement AI Concierge and Global Search capabilities.

**Sprint Backlog**:
- Integrate OpenRouter API with Google Gemini 2.0 Flash Lite.
- Build context injection system (trips + places context in AI prompts).
- Implement rule-based offline fallback (`buildOfflineReply`).
- Create Global Search endpoints with cross-collection filtering.
- Develop booking system with loyalty points automation.
- Implement OTP email verification via Nodemailer.

**Delivered Increment**:
- AI Chatbot with bilingual support (English/Arabic).
- Search engine with `?popular=true` and `?top=true` filters.
- Complete booking flow with OTP password reset.

**Definition of Done**: AI responds contextually; search filters work; booking creates records; OTP emails deliver.

---

#### Sprint 4: Cross-Device Synchronization (Phase 4)
**Duration**: Week 7  
**Sprint Goal**: Enable cloud-backed trip planning across devices.

**Sprint Backlog**:
- Design UserPlan model for flexible JSON blob storage.
- Plan transition strategy from localStorage to cloud sync.
- Prepare API endpoints for UserPlan (`GET/PUT /api/userplan/:userId`).
- Document sync strategy for frontend integration.

**Delivered Increment**:
- UserPlan schema ready for cloud sync.
- Architecture designed for seamless synchronization.
- LocalStorage fallbacks maintained for unauthenticated users.

**Definition of Done**: UserPlan model tested; sync architecture documented; ready for frontend integration.

---

#### Sprint 5: Final Polish & Fixes (Phase 5)
**Duration**: Week 8  
**Sprint Goal**: Optimize mobile experience and finalize deployment.

**Sprint Backlog**:
- Implement comprehensive mobile-fix.css with 3 breakpoints.
- Build hamburger navigation with slide-in panel.
- Fix Tailwind CDN loading order (config after CDN initialization).
- Optimize image loading with Unsplash CDN preconnect.
- Configure Vercel deployment with environment variable management.
- Remove duplicate `Backend/Backend/` directory structure.

**Delivered Increment**:
- Fully responsive platform across all device sizes.
- Hamburger menu with smooth transitions.
- Production-ready deployment on Vercel.

**Definition of Done**: Platform passes mobile responsiveness tests; Vercel deployment successful; no duplicate code structures.

---

### 3.2 Iterative Fixes (Agile Pivot Examples)

#### Fix 1: Tailwind Loading Order Optimization
**Sprint**: 5 (Final Polish)  
**User Feedback**: Custom theme classes (e.g., `text-on-surface`, `bg-surface`) were not generating correctly in the browser.

**Agile Response**:
Rather than treating this as a defect, the team treated it as an **iterative improvement** during Sprint 5. The loading strategy was refined:
1. **Before**: Config loaded before Tailwind CDN (causing config to be ignored).
2. **After**: Reordered `index.html` to load Tailwind CDN first, then custom config script.

**Outcome**: Custom theme classes now generate correctly; design system fully applied.

**Lesson Learned**: CDN-based Tailwind requires runtime initialization before config application—documented for future iterative improvements.

---

#### Fix 2: Transition from localStorage to UserPlan (Cloud Sync)
**Sprint**: 4 (Cross-Device Synchronization)  
**User Feedback**: Testing revealed that localStorage is device-specific, preventing users from accessing trip plans on multiple devices.

**Agile Pivot**:
The team pivoted from a client-side storage model to a server-side synchronization model:
1. **Initial Approach**: Store trip drafts and preferences in `localStorage` (simple, fast for single device).
2. **Pivot Decision**: Create `UserPlan` model in MongoDB to store user data as JSON blob (`{ userId, data: {} }`).
3. **Incremental Delivery**: Model created in Sprint 4; frontend integration planned for next release.

**Outcome**: Architecture now supports cross-device access; localStorage maintained as fallback for unauthenticated users.

**Lesson Learned**: Agile allows mid-project architectural pivots based on user testing—cloud sync is now a core differentiator.

---

## 4. Test Plan & Deployment

### 4.1 Test Plan

#### 4.1.1 Unit Testing

**Test Case 4.1.1: Loyalty Points Logic**
- **Objective**: Verify correct calculation of loyalty points upon booking.
- **Input**: `totalPrice = 450`
- **Expected Output**: `loyaltyEarned = Math.max(1, floor(450/100))` → **4 points**.
- **Input**: `totalPrice = 50` (Edge case: below threshold)
- **Expected Output**: `Math.max(1, floor(50/100))` → **1 point** (Minimum enforced).

**Test Case 4.1.2: OTP Expiration Timing**
- **Objective**: Ensure OTP is rejected after 10 minutes.
- **Setup**: Create User with `resetOtpExpiresAt = Date.now() - 60000` (1 minute ago).
- **Action**: Call `POST /api/auth/reset-password` with valid OTP.
- **Expected Output**: HTTP 400 "OTP expired. Request a new one."

**Test Case 4.1.3: Bilingual Detection**
- **Objective**: Verify language detection in `detectReplyStyle`.
- **Input**: Arabic string "مرحبا، أريد رحلة" (contains `[؀-ۿ]`).
- **Expected Output**: System prompt includes Arabic instructions.
- **Input**: English string "Hello, I want a trip".
- **Expected Output**: System prompt includes English instructions.

---

#### 4.1.2 Integration Testing

**Test Case 4.1.4: Cross-Device Synchronization (Frontend to UserPlan)**
- **Objective**: Validate that user data persists in the cloud and retrieves correctly.
- **Setup**: User logs in on Device A, creates a trip draft.
- **Action**: Frontend sends `PUT /api/userplan/:userId` with draft data.
- **Verification**: Frontend on Device B calls `GET /api/userplan/:userId`.
- **Expected Output**: Response contains the exact trip draft JSON created on Device A.

**Test Case 4.1.5: Booking with Loyalty Update**
- **Objective**: Verify booking creation triggers loyalty points increment.
- **Setup**: Create User with `loyaltyPoints: 0`.
- **Action**: Call `POST /api/bookings` with `totalPrice: 2500`.
- **Verification**: Query User collection; `loyaltyPoints` should be `25` (2500/100).
- **Expected Output**: Booking confirmed; loyalty points updated via `$inc`.

---

#### 4.1.3 System Testing

**Test Case 4.1.6: Mobile Responsiveness**
- **Objective**: Verify UI integrity on mobile breakpoints.
- **Method**: Execute automated browser tests (e.g., Playwright) setting viewport to 375px width.
- **Checks**:
  - Verify `.grid-cols-3` overrides to `1fr`.
  - Verify `[class*="text-h1"]` computes to `32px`.
  - Verify Hamburger menu (`.mobile-menu-btn`) is `display: flex`.
- **Expected Output**: All layout assertions pass; no horizontal overflow.

**Test Case 4.1.7: AI Chatbot Bilingual Support**
- **Objective**: Verify end-to-end bilingual response generation.
- **Setup**: Mock OpenRouter API to return context-aware responses.
- **Action**: Send Arabic message to `POST /api/chat`.
- **Verification**: Response contains Arabic text; `detectReplyStyle` prepended Arabic instructions to system prompt.
- **Expected Output**: AI responds in Arabic with proper cultural tone.

**Test Case 4.1.8: OTP Email Delivery**
- **Objective**: Verify email template renders correctly across clients.
- **Method**: Send test OTP email; inspect HTML structure.
- **Checks**: Bilingual OTP display (English/Arabic), 10-minute expiration warning, Kemet Travel branding.
- **Expected Output**: Email renders correctly in Gmail, Outlook, and Apple Mail.

---

### 4.2 CI/CD Pipeline (Vercel Deployment)

#### 4.2.1 Automated Deployment Workflow

**Pipeline Stages**:

1. **Source Control**: Developer pushes to `main` branch on GitHub.
2. **Vercel Trigger**: Vercel detects push event; initiates build process.
3. **Build Phase**:
   - Installs dependencies from `Backend/package.json`.
   - Bundles `Fronted/` static assets.
   - Compiles serverless function from `Backend/server.js`.
4. **Environment Injection**: Vercel injects environment variables from dashboard.
5. **Deployment**: New version goes live; cache invalidated globally.
6. **Verification**: Automated health check on `GET /api/health`.

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

#### 4.2.2 Environment Variables Management

Security-sensitive configuration is managed exclusively through environment variables, never committed to source control.

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGO_URI` | MongoDB Atlas connection string | `mongodb+srv://user:pass@cluster.mongodb.net/db` |
| `OPENROUTER_API_KEY` | OpenRouter API key | `sk-or-v1-...` |
| `OPENROUTER_MODEL` | AI model identifier | `google/gemini-2.0-flash-lite-preview-02-05:free` |
| `CORS_ORIGIN` | Allowed CORS origins | `http://localhost:5000,https://kemet-luxury-travel.vercel.app` |
| `SMTP_*` | Email service credentials | `SMTP_USER`, `SMTP_PASS`, `SMTP_HOST` |
| `NODE_ENV` | Environment mode | `production` or `development` |

**Security Practices**:
- `.env` file is included in `.gitignore` to prevent credential leakage.
- Vercel environment variables configured securely in project dashboard.
- No hardcoded secrets in source code.

#### 4.2.3 Development Workflow

**Local Development**:
```bash
# Install dependencies
npm install
cd Backend && npm install

# Configure environment
cp Backend/.env.example Backend/.env
# Edit .env with actual values

# Run server
npm start
# Server runs at http://localhost:5000
```

**Production Deployment**:
```bash
# Deploy to Vercel
vercel --prod
# Automatic deployment triggers on git push to main
```

---

## Summary

The Kemet Luxury Travel project successfully delivered a production-ready luxury travel platform using **Agile methodology**. Through 5 iterative sprints, the team delivered:

- **Functional Increments**: AI Concierge, Global Search, Booking System, Cloud Sync preparation.
- **Non-Functional Quality**: Responsive design (3 breakpoints), Cross-Device Persistence (UserPlan model), Scalable architecture (Serverless + MongoDB Atlas).
- **Continuous Integration**: Automated Vercel deployments with environment variable management.
- **Test Coverage**: Unit tests (Loyalty, OTP), Integration tests (Cloud Sync), System tests (Mobile UI, Bilingual AI).

The Agile approach enabled rapid pivots (Tailwind config loading, localStorage → Cloud Sync) based on iterative testing feedback, resulting in a sophisticated, scalable platform ready for real-world users.

---

**Document Version**: 1.0.0  
**Last Updated**: May 2026  
**Author**: Lead Developer, Kemet Luxury Travel  
**Methodology**: Agile (Sprint-Based, Iterative Delivery)  
**Status**: Production Ready
