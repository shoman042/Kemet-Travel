# Kemet Luxury Travel ✨

<div align="center">

**Premier digital platform for discerning travelers seeking curated Egyptian luxury experiences.**

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=flat-square)](https://vercel.com)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green?style=flat-square)](https://nodejs.org)
[![MongoDB Atlas](https://img.shields.io/badge/MongoDB%20Atlas-Cloud-brightgreen?style=flat-square)](https://mongodb.com/atlas)

</div>

---

## Overview

Kemet Luxury Travel seamlessly integrates high-end travel planning, premium accommodation discovery, and intelligent AI-powered concierge services into a unified web application. Experience the timeless wonders of Egypt with sophisticated interfaces designed for the modern luxury traveler.

---

## Key Features

### 🤖 AI Concierge
Smart trip assistance powered by **Google Gemini 2.0** via OpenRouter, featuring context-aware recommendations and intelligent bilingual support (English/Arabic).

### 🌍 Global Discovery
Unified real-time search engine across trips, places, and hotels with advanced filtering by popularity, experience tiers, and location.

### 💎 Seamless Booking
Secure checkout system with **OTP email verification**, automated loyalty points rewards, and support for multiple payment methods.

### 📱 Mobile-First Design
Premium responsive experience crafted with **Luxury Minimalist** aesthetics—optimized for desktop, tablet, and mobile with sophisticated typography (Noto Serif & Plus Jakarta Sans).

---

## Tech Stack

| Layer | Technologies |
|-------|--------------|
| **Frontend** | HTML5, Tailwind CSS (CDN), JavaScript (ES6+) |
| **Backend** | Node.js, Express.js 5.2.1 |
| **Database** | MongoDB Atlas via Mongoose 9.5.0 |
| **AI Integration** | OpenRouter API (Google Gemini 2.0 Flash Lite) |
| **Email Service** | Nodemailer 8.0.7 (SMTP) |
| **Deployment** | Vercel (Serverless Functions + Static Hosting) |
| **Typography** | Noto Serif, Plus Jakarta Sans |
| **Icons** | Material Symbols Outlined |

---

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB Atlas account
- OpenRouter API key

### 1. Clone & Install
```bash
git clone <repository-url>
cd Pages
npm install
cd Backend && npm install
```

### 2. Environment Configuration

Create `Backend/.env` with the following variables:

```env
# Required
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/kemet-travel
OPENROUTER_API_KEY=sk-or-v1-<your-key>
OPENROUTER_MODEL=google/gemini-2.0-flash-lite-preview-02-05:free

# Optional (with defaults)
CORS_ORIGIN=http://localhost:5000
PORT=5000
NODE_ENV=development

# Email (for OTP password reset)
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=your-email@gmail.com
```

### 3. Run the Server

```bash
npm start
```

Server runs at `http://localhost:5000`

---

## Project Structure

```
Pages/
├── Fronted/              # Static frontend (HTML, CSS, JS)
│   ├── index.html       # Home page
│   ├── app.js           # Main JavaScript
│   ├── tw-config.js     # Tailwind configuration
│   └── mobile-fix.css  # Responsive design
├── Backend/             # Express.js API server
│   ├── server.js        # Main server file
│   ├── models/          # Mongoose schemas
│   └── package.json
├── vercel.json          # Vercel deployment config
└── README.md            # This file
```

---

## Deployment

Deployed on **Vercel** with automatic deployments from the `main` branch.

```bash
# Deploy to Vercel
vercel --prod
```

Environment variables must be configured in the Vercel dashboard.

---

<div align="center">

**Kemet Luxury Travel** · Crafting Premium Egyptian Experiences  
*Whispers of the Eternal Nile*

</div>
