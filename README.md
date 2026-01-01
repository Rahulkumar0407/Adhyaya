# 🎓 Babua LMS: Pattern-Centric Engineering Platform

**Learn Patterns. Build Systems. Get Hired.**

Babua LMS is a modern, full-stack learning management system designed with a "pattern-first" philosophy. Inspired by the street-smart engineering mindset, it focuses on teaching reusable mental models rather than isolated topics.

---

## 🚀 Key Features

- **Pattern-Centric DSA**: Learning paths focused on Sliding Window, Two Pointers, DP patterns, etc.
- **Realistic Mock Interviews**: AI-powered and Premium 1:1 interview sessions with industry experts.
- **Revision Protocol**: A scientific approach to learning (Day 1-3-7-30 rule).
- **System Design (HLD/LLD)**: Deep dives into scalable architectures and design patterns.
- **Interactive Dashboard**: Modern, glassmorphic UI with real-time analytics.
- **Google OAuth Integration**: One-click secure login/signup.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 (Vite)
- **Styling**: Tailwind CSS, Vanilla CSS
- **Animations**: Framer Motion, GSAP
- **3D Visuals**: Three.js
- **Icons**: Lucide React

### Backend
- **Runtime**: Node.js & Express.js
- **Database**: MongoDB (Mongoose), Redis (Caching/Rate Limiting)
- **Authentication**: JWT (Access + Refresh Tokens), Passport.js (Google OAuth)
- **Payments**: Razorpay, Stripe (Integrations ready)
- **Real-time**: Socket.io

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v16 or higher)
- [MongoDB](https://www.mongodb.com/try/download/community) (Local or Atlas)
- [Redis](https://redis.io/download/) (Required for rate limiting and session management)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

---

## ⚙️ Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/rahulbornking-ship-it/BRUPL.git
cd BRUPL
```

### 2. Install Dependencies
Install dependencies for the root, client, and server workspaces:
```bash
npm install
```

### 3. Environment Configuration

#### Server Setup (`server/.env`)
Create a `.env` file in the `server` directory and populate it with:

```env
# Server Config
PORT=5000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/babua-lms

# JWT Secrets
JWT_SECRET=your_32_char_long_random_jwt_secret
JWT_REFRESH_SECRET=your_32_char_long_random_refresh_secret
JWT_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d

# Session & OAuth
SESSION_SECRET=your_session_secret
CLIENT_URL=http://localhost:5173
FRONTEND_URL=http://localhost:5173

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

# Redis (Optional if using defaults)
REDIS_URL=redis://localhost:6379
```

#### Client Setup (`client/.env`)
Create a `.env` file in the `client` directory:

```env
VITE_API_URL=http://localhost:5000
```

---

## 🔑 Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project.
3. Enable **Google+ API** or **Google Identity API**.
4. Navigate to **APIs & Services > Credentials**.
5. Create **OAuth client ID** (Web application).
6. Add **Authorized redirect URIs**: `http://localhost:5000/api/auth/google/callback`.
7. Copy the **Client ID** and **Client Secret** to your server `.env`.

---

## 🏃 Running the Project

You can run both client and server simultaneously using the root command:

```bash
# Run both in development mode
npm run dev

# Run individually
npm run dev:client
npm run dev:server
```

The application will be available at:
- **Frontend**: `http://localhost:5173`
- **Backend API**: `http://localhost:5000`

---

## 📁 Project Structure

```text
babua-lms/
├── client/              # React (Vite) Frontend
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Page-level components
│   │   └── context/     # Auth and Theme contexts
├── server/              # Express Backend
│   ├── models/          # Mongoose Schemas
│   ├── routes/          # API Endpoints
│   ├── middleware/      # Auth & Security
│   └── index.js         # Entry point
└── package.json         # Root workspace configuration
```

---

## 🛡️ License

Distributed under the MIT License. See `LICENSE` for more information.

---

**Built with the Babua mindset: Pattern-first, Street-smart, Community-driven.**
