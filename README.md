# Treco — Green Commutes. Real Rewards.

> A gamified eco-commute tracker for college students. Log your green trips, earn carbon points, and compete on your campus leaderboard.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, Vite, Tailwind CSS v4, Framer Motion, Recharts |
| **Backend** | Node.js, Express, MongoDB Atlas (Mongoose) |
| **AI Engine** | Llama 3.1 & Mixtral (via **Groq API** with multi-model fallback) |
| **Auth** | JWT (7-day expiry), bcryptjs |
| **PWA** | Service Worker + Web App Manifest |

---

## Features

- **Smart Commute Engine** — AI-powered route suggestions (Fastest / Greenest / Economical) with CO₂ and points calculation.
- **Dynamic Leveling System** — Progress through ranks from **Eco-Seedling** to **Forest Guardian** based on your cumulative impact.
- **Achievement Vault** — Unlock sleek, themed badges (Metro Master, Streak Stalker, etc.) as you hit major milestones.
- **Campus Analytics** — Real-time insights into your specific **contribution percentage** to your university's total green efforts.
- **Carbon Points System** — Earn points for eco-friendly transport modes (Walk > Cycle > Metro > Bus > Cab).
- **Campus Leaderboard** — Compete with fellow students from the same college.
- **Streak System** — Daily commute streaks with milestone celebrations and **Streak Shield** protection.
- **Rewards Vault** — Redeem points for real perks (coffee, pizza, bus passes, gadgets) via dynamic QR codes.
- **Sleek, Minimalist UI** — A modern, professional design optimized for both **Dark and Light modes** with custom theme-aware components.

---

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (free tier is fine)
- Groq Cloud API key → [console.groq.com](https://console.groq.com)

### 1. Clone & Install

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Configure Environment

```bash
cd backend
cp .env.example .env
# Edit .env with your real values
```

Required variables in `backend/.env`:

```env
MONGO_URI="mongodb+srv://<user>:<password>@<cluster>.mongodb.net/<dbname>"
GROQ_API_KEY="gsk_..."
JWT_SECRET="a-long-random-secret-at-least-32-chars"
PORT=5000
```

### 3. Run

```bash
# Terminal 1 — Backend (port 5000)
cd backend && npm run dev

# Terminal 2 — Frontend (port 5173)
cd frontend && npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## Project Structure

```
Treco/
├── backend/
│   ├── controllers/       # Route logic (auth, commute, AI, leaderboard, rewards)
│   ├── middlewares/       # JWT validation, Zod schema validator
│   ├── models/            # Mongoose schemas (User, Activity, Reward)
│   ├── routes/            # Express routers
│   └── index.js           # Entry point
└── frontend/
    └── src/
        ├── components/    # BadgeVault, ImpactCard, OnboardingModal, Skeletons, UI
        ├── pages/         # Dashboard, SmartEngine, Leaderboard, RewardsVault, History, Profile
        ├── store/         # Zustand auth store
        ├── lib/           # Axios instance with interceptors
        └── App.jsx        # Router, theme, page titles
```

---

## API Endpoints (v1)

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/v1/auth/register` | No | Register with college email |
| POST | `/api/v1/auth/login` | No | Login |
| GET | `/api/v1/auth/me` | Yes | Get current user |
| GET | `/api/v1/auth/stats` | Yes | Get user statistics & campus totals |
| PATCH | `/api/v1/auth/profile` | Yes | Update name / password |
| DELETE | `/api/v1/auth/profile` | Yes | Permanently delete account |
| POST | `/api/v1/auth/shield` | Yes | Activate Streak Shield |
| POST | `/api/v1/commutes/ai-calculate` | Yes | AI route suggestions |
| POST | `/api/v1/commutes/log` | Yes | Log a commute |
| GET | `/api/v1/commutes/history` | Yes | Activity history |
| GET | `/api/v1/leaderboard/campus` | Yes | Campus leaderboard |
| GET | `/api/v1/rewards` | Yes | List rewards |
| POST | `/api/v1/rewards/redeem` | Yes | Redeem a reward |

---

## Environment Notes

- **Campus Lock**: Registration is restricted to `.edu.in` email domains.
- **AI Fallback**: Uses a 4-model chain; if quota is hit, it provides realistic demo routes.
- **Persistence**: Theme selection and weekly goals are stored in `localStorage`.
- **Security**: All destructive actions (deletion, password changes) require active JWT sessions.

---


