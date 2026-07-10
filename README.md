<p align="center">
  <img src="frontend/public/trecoLogo.png" alt="Treco Logo" width="100" />
</p>

<h1 align="center">Treco</h1>

<p align="center">
  A gamified green commute PWA for college campuses — log eco-friendly trips, earn carbon points, verify tickets with Vision AI, climb your campus leaderboard, and redeem real rewards.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white" alt="Express" />
  <img src="https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Groq_Vision_AI-Llama_4-FF6600?logo=meta&logoColor=white" alt="Groq AI" />
  <img src="https://img.shields.io/badge/PWA-Installable-5A0FC8?logo=pwa&logoColor=white" alt="PWA" />
</p>

---

## Table of Contents

- [About](#-about)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Project Structure](#-project-structure)
- [API Reference](#-api-reference)
- [Security & Anti-Cheat](#-security--anti-cheat)

---

## About

**Treco** (Track + Eco) is a full-stack Progressive Web App that transforms daily college commutes into measurable climate action. Students plan routes via an AI-powered engine backed by the **Google Maps Directions API**, log green trips (bus, metro, walk, cycle), and earn carbon points — all verified by a **zero-trust Vision AI auditor** (Groq Llama 4 Scout) that performs OCR on physical transit tickets before awarding any rewards.

The platform is built around a deep gamification layer — daily streaks with shield protection, a dynamic leveling system, achievement badges, carbon debt accountability, campus-scoped leaderboards, and a rewards vault where points are exchangeable for real-world perks via QR codes.

---

## Features

| Feature | Description |
|---|---|
| **Smart Commute Engine** | AI-powered route cards (Fastest / Greenest / Economical) with live data from Google Maps Directions API — shows time, cost (INR), CO₂ saved, and per-step transit breakdowns with station names |
| **Vision AI Ticket Verification** | Zero-trust Groq Llama 4 Scout auditor performs OCR on uploaded ticket photos — validates mode, extracts date/source/destination/vehicle number, cross-checks against declared trip |
| **Dynamic Leveling System** | Progress through 5 ranks (Eco-Seedling → Carbon Crusader → Green Warrior → Nature Protector → Forest Guardian) with XP-style progress bars |
| **Achievement Badges** | 6 unlockable badges: Eco-Seedling, Metro Master, Streak Stalker, Campus Legend, Carbon Crusader, University Hero — each with progress tracking |
| **Campus Leaderboard** | College-scoped rankings filtered by `.edu.in` email domain. Carbon debt > 50 freezes your rank |
| **Streak System** | Daily green commute streaks with milestone celebrations (7/14/30/60/100 days) and **Streak Shield** protection (purchasable for 2,000 points) |
| **Carbon Debt Tracker** | Cab/auto trips increase your carbon debt; green trips reduce it. High debt locks luxury reward redemptions and freezes leaderboard rank |
| **Rewards Vault** | Redeem points for campus perks — coffee, pizza, movie tickets, Amazon vouchers, earbuds — via secure, time-limited QR codes with server-generated redemption codes |
| **Living Forest Visualization** | Animated SVG forest on your dashboard that grows from a seedling to a thriving forest as your CO₂ savings increase |
| **Shareable Impact Card** | Generate a branded impact card with your stats — shareable via Web Share API or clipboard |
| **Deep Link Booking** | Start a journey and get redirected to the booking app (Namma Yatri, Tummoc, BMRCL, Google Maps) |
| **Push Notifications** | Browser notifications remind you to verify your trip after the estimated arrival time |
| **Session Recovery** | Active commute sessions persist across page refreshes and browser closes |
| **Dark / Light Theme** | System-aware theme toggle with full UI adaptation |
| **PWA** | Installable on mobile with standalone display, maskable icons, and service worker caching |

---

## Tech Stack

### Frontend

| Technology | Purpose |
|---|---|
| [React 19](https://react.dev/) | Component-based UI with hooks and portals |
| [Vite 8](https://vite.dev/) | Lightning-fast HMR and optimized builds |
| [Tailwind CSS 4](https://tailwindcss.com/) | Utility-first styling with dark mode support |
| [Framer Motion 12](https://www.framer.com/motion/) | Page transitions, staggered animations, spring physics |
| [Zustand 5](https://zustand.docs.pmnd.rs/) | Lightweight auth state management with localStorage persistence |
| [React Router 7](https://reactrouter.com/) | Client-side routing with protected routes |
| [Recharts 3](https://recharts.org/) | 7-day activity charts and CO₂ visualizations |
| [Leaflet + React Leaflet](https://react-leaflet.js.org/) | Interactive map picker with reverse geocoding |
| [Radix UI](https://www.radix-ui.com/) | Accessible Dialog, Tabs, Progress, and HoverCard primitives |
| [Lucide React](https://lucide.dev/) | Consistent icon set across the app |
| [canvas-confetti](https://www.npmjs.com/package/canvas-confetti) | Celebration bursts on streaks and green trip completion |
| [qrcode.react](https://www.npmjs.com/package/qrcode.react) | QR code generation for reward redemptions |

### Backend

| Technology | Purpose |
|---|---|
| [Express 5](https://expressjs.com/) | REST API server |
| [MongoDB Atlas + Mongoose 9](https://mongoosejs.com/) | Document database with GeoJSON indexes |
| [Groq API — Llama 4 Scout](https://console.groq.com/) | Vision AI for ticket OCR verification |
| [Google Maps Directions API](https://developers.google.com/maps/documentation/directions) | Real-time route planning (driving, transit, walking) |
| [Cloudinary](https://cloudinary.com/) | Proof image upload, storage, and auto-resize |
| [JSON Web Tokens](https://jwt.io/) | Stateless auth with 7-day expiry |
| [bcryptjs](https://www.npmjs.com/package/bcryptjs) | Password hashing (10 salt rounds) |
| [Zod 4](https://zod.dev/) | Runtime schema validation on all API inputs |
| [Multer](https://www.npmjs.com/package/multer) | Multipart form-data parsing for file uploads |

---

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                     Client (React PWA)                       │
│                                                              │
│  ┌───────────┐  ┌────────────┐  ┌────────────┐               │
│  │   Pages   │  │ Components │  │  Zustand   │               │
│  │           │  │            │  │  Store     │               │
│  └─────┬─────┘  └──────┬─────┘  └──────┬─────┘               │
│        │               │               │                     │
│  ┌─────┴───────────────┴───────────────┴──────────────────┐  │
│  │              Axios Instance (JWT Interceptor)          │  │
│  └──────────────────────────┬─────────────────────────────┘  │
└─────────────────────────────┼────────────────────────────────┘
                              │ HTTPS
┌─────────────────────────────┴────────────────────────────────┐
│                    Express 5 API Server                      │
│                                                              │
│  ┌──────────┐  ┌───────────┐  ┌──────────────────────────┐   │
│  │  Auth    │  │  Commute  │  │   AI Controller          │   │
│  │  Routes  │  │  Routes   │  │                          │   │
│  └────┬─────┘  └─────┬─────┘  │  ┌────────────────────┐  │   │
│       │              │        │  │ Google Maps API    │  │   │
│       │              │        │  │ (3 parallel calls) │  │   │
│       │              │        │  ├────────────────────┤  │   │
│       │              │        │  │ Groq Vision AI     │  │   │
│       │              │        │  │ (Ticket OCR)       │  │   │
│       │              │        │  └────────────────────┘  │   │
│       │              │        └──────────────────────────┘   │
│  ┌────┴──────────────┴──────────────────────────────────┐    │
│  │   Middleware: JWT Auth │ Zod Validator │ Multer      │    │
│  └──────────────────────────┬───────────────────────────┘    │
└─────────────────────────────┼────────────────────────────────┘
                              │
          ┌───────────────────┼───────────────────┐
          │                   │                   │
  ┌───────┴───────┐  ┌────────┴──────┐  ┌─────────┴─────┐
  │  MongoDB      │  │  Cloudinary   │  │  Google Maps  │
  │  Atlas        │  │  (Images)     │  │  Platform     │
  │               │  │               │  │               │
  │  • Users      │  │  • Ticket     │  │  • Directions │
  │  • Activities │  │    proofs     │  │  • Geocoding  │
  │  • Rewards    │  │  • Auto-      │  │  • Transit    │
  │  • Redemptions│  │    resize     │  │    analysis   │
  └───────────────┘  └───────────────┘  └───────────────┘
```

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- [npm](https://www.npmjs.com/) v9 or higher
- A [MongoDB Atlas](https://www.mongodb.com/atlas) account (free tier works)
- A [Groq Cloud](https://console.groq.com/) API key (free tier available)
- A [Google Maps Platform](https://console.cloud.google.com/) API key with Directions API enabled
- A [Cloudinary](https://cloudinary.com/) account (free tier works)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/shub11-gh/Treco.git
   cd Treco
   ```

2. **Install dependencies**
   ```bash
   # Backend
   cd backend
   npm install

   # Frontend
   cd ../frontend
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cd backend
   cp .env.example .env
   ```
   Fill in the values — see [Environment Variables](#-environment-variables) below.

4. **Start the development servers**
   ```bash
   # Terminal 1 — Backend (port 5000)
   cd backend && npm run dev

   # Terminal 2 — Frontend (port 5173)
   cd frontend && npm run dev
   ```

5. **Open in browser**
   ```
   http://localhost:5173
   ```

---

 Environment Variables

Create a `.env` file inside the `backend/` directory with the following:

```env
# Database
MONGO_URI="mongodb+srv://<user>:<password>@<cluster>.mongodb.net/<dbname>"

# Authentication
JWT_SECRET="a-long-random-secret-at-least-32-chars"

# AI Services
GROQ_API_KEY="gsk_..."
GOOGLE_MAPS_API_KEY="AIzaSy..."

# Image Storage
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# Server
PORT=5000
```

---

 Project Structure

```
Treco/
├── backend/
│   ├── controllers/
│   │   ├── aiController.js          # Google Maps routing + Groq Vision AI verification
│   │   ├── authController.js        # Registration, login, profile, streak shield, rewards
│   │   ├── commuteController.js     # Trip logging, proof upload, anti-cheat, streaks
│   │   ├── leaderboardController.js # Campus-scoped rankings
│   │   └── rewardsController.js     # Reward listing and seeding
│   ├── middlewares/
│   │   ├── auth.js                  # JWT Bearer token validation
│   │   ├── upload.js                # Multer + Cloudinary storage (5MB, auto-resize)
│   │   └── validate.js              # Generic Zod schema validator
│   ├── models/
│   │   ├── User.js                  # User schema with points, streaks, carbon debt
│   │   ├── Activity.js              # Trip schema with GeoJSON, proof, OCR data
│   │   ├── Reward.js                # Reward catalog schema
│   │   └── Redemption.js            # Redemption records with server-generated codes
│   ├── routes/                      # Express routers (auth, commute, leaderboard, rewards)
│   └── index.js                     # Entry point — Express 5, MongoDB, CORS
│
└── frontend/
    ├── public/                      # PWA manifest, favicons, service worker
    └── src/
        ├── components/
        │   ├── BadgeVault.jsx       # 6 achievement badges with progress tracking
        │   ├── ImpactCard.jsx       # Shareable branded impact card (Web Share API)
        │   ├── LocationInput.jsx    # Geocoding autocomplete with LRU cache
        │   ├── MapModal.jsx         # Leaflet map picker with reverse geocoding
        │   ├── OnboardingModal.jsx  # 3-step welcome flow for new users
        │   ├── Skeletons.jsx        # Loading skeleton components
        │   ├── ErrorBoundary.jsx    # React error boundary wrapper
        │   └── ui/                  # Radix-based primitives (Button, Card, Dialog, Tabs)
        ├── pages/
        │   ├── Dashboard.jsx        # Living forest, weekly ring, stats, streaks, charts
        │   ├── SmartEngine.jsx      # AI route planning, journey tracking, proof upload
        │   ├── Leaderboard.jsx      # Campus podium + ranked list
        │   ├── RewardsVault.jsx     # Categorized rewards + QR code redemption
        │   ├── History.jsx          # Timeline + Recharts analytics + mode breakdown
        │   ├── Profile.jsx          # Stats, badges, carbon debt, settings, account mgmt
        │   ├── Landing.jsx          # Hero, feature grid, testimonials, campus marquee
        │   └── Auth.jsx             # Login / Register forms
        ├── store/
        │   └── authStore.js         # Zustand store with JWT persistence
        ├── lib/
        │   └── axios.js             # Axios instance with auth interceptor
        └── App.jsx                  # Router, theme system, animated transitions, nav
```

---

 API Reference

### Authentication — `/api/v1/auth`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/register` | No | Register with `.edu.in` email |
| `POST` | `/login` | No | Login and receive JWT |
| `GET` | `/me` | Yes | Get current user profile |
| `GET` | `/stats` | Yes | Profile stats + campus aggregates |
| `PATCH` | `/profile` | Yes | Update name or password |
| `DELETE` | `/profile` | Yes | Permanently delete account + all data |
| `POST` | `/shield` | Yes | Activate Streak Shield (2,000 pts) |
| `POST` | `/redeem` | Yes | Redeem a reward for QR code |

### Commutes — `/api/v1/commutes`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/ai-calculate` | Yes | AI route suggestions via Google Maps |
| `POST` | `/calculate` | Yes | Distance / CO₂ preview from coordinates |
| `POST` | `/log` | Yes | Start or log a commute |
| `POST` | `/complete` | Yes | Verify and complete active commute |
| `POST` | `/upload-proof` | Yes | Upload ticket photo → AI verification |
| `GET` | `/active` | Yes | Get current in-progress commute |
| `GET` | `/history` | Yes | Last 50 activities |

### Leaderboard — `/api/v1/leaderboard`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/campus` | Yes | Campus-scoped rankings (debt > 50 excluded) |

### Rewards — `/api/v1/rewards`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/` | Yes | List all available rewards |

---

 Security & Anti-Cheat

| Layer | Mechanism |
|---|---|
| **Server-Side Point Calculation** | Points and CO₂ are re-calculated on the backend — client values are never trusted. Sanity caps: max 150 pts, 50 km, 15 kg CO₂ per trip |
| **Velocity Validation** | Average speed is checked against mode limits (Walk ≤ 10, Cycle ≤ 35, Bus ≤ 85, Metro ≤ 100, Cab ≤ 120 km/h). Violations invalidate the trip |
| **Vision AI Verification** | Zero-trust Groq auditor rejects selfies, screenshots, stock photos, blurry images. Mode-specific rules (Bus = BMTC ticket, Metro = QR/smart card, Cab = Ola/Uber receipt) |
| **Ticket Cross-Validation** | Fuzzy locality matching, date validation (rejects pre-2024 tickets), time validation (rejects future timestamps > 2h ahead), route mismatch detection |
| **Session Integrity** | Only one active commute at a time. 24-hour session expiry. Active sessions survive page refresh |
| **Atomic Redemptions** | Reward purchases use `findOneAndUpdate` with point-check filter to prevent race conditions |
| **Carbon Debt Enforcement** | Debt > 30 blocks luxury redemptions (Tech/Lifestyle). Debt > 50 freezes leaderboard rank |
| **College Email Lock** | Registration restricted to `.edu.in` domains. Leaderboard scoped by college |
| **API Failure = Rejection** | If the AI verification service is unavailable, the ticket is auto-rejected — never auto-approved |

---


