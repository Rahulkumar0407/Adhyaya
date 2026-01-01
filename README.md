# Adhyaya

> **Pitch Title:** Adhyaya – Real Growth, No Nonsense

## 🚀 Problem Statement
**"Selling courses is not allowed."**
The challenge was to identify a sustainable business model for an Ed-Tech platform that generates revenue *without* putting educational content behind a paywall.

Most tech education today has become a "Certificate Selling Business". Students buy expensive masterclasses for the credential, not the skill, leading to a workforce with certificates but without fundamental knowledge (like understanding a 'Linked List' pattern).

---

## 💡 The Solution: Adhyaya
We operate on the **"Babua" Mindset**: *Where knowledge is free, but discipline is premium.*

**Core Philosophy:**
- **Free Content:** Core engineering topics (DSA, DBMS, System Design) are always free.
- **Earned Access:** Advanced lectures are locked not by money, but by *effort*. You unlock them by maintaining a daily login streak.
- **Revenue Model:** We don't sell content; we sell *outcomes* and *convenience*.

### Key Revenue Drivers (Innovation)
1.  **Adaptive Revision (₹60/month):**
    - An algorithm based on human psychology (spaced repetition).
    - Re-surfaces topics you are "confused" about at intervals of 1, 3, and 7  and 14 days.
    - Cost: Less than a plate of samosas for real value.

2.  **AI Mock Interviews (Babua Points):**
    - Practice with an AI interviewer (Code Editor + Live Analysis).
    - Uses "Babua Points" (earned via consistency) to run.

3.  **Expert Mocks (₹400/session):**
    - Optional premium service.
    - 45-minute mock interview with an industry expert (Google/Amazon engineers).
    - Students pay for the *feedback*, not the fear.

4.  **Mentor Circle (₹60/month):**
    - Small group mentorship (20-25 students) for a personal touch.
    - **Community Heart:** The most consistent and helpful student each month gets *free* access.

---

## ✨ Features
*   **Gamified Learning:** Earn "Babua Points" and maintain streaks to unlock content.
*   **AI Interviewer:** Real-time speech-to-text and code analysis for mock interviews.
*   **Mentor Marketplace:** Connect with industry experts for 1:1 guidance (Voice/Video calls) and doubts through chat.
*   **Adaptive Revision System:** Smart scheduling for topic review.
*   **Wallet System:** Integrated payments and point tracking.

---

## 🛠️ Tech Stack
*   **Frontend:** React, Vite, TailwindCSS, Framer Motion
*   **Backend:** Node.js, Express.js
*   **Database:** MongoDB
*   **Authentication:** Passport.js (Google OAuth), JWT
*   **Real-time:** Socket.io (for doubts/chat)
*   **AI:** Gemini API (for Mock Interviewer)
*   **Payments:** Razorpay (Integration ready)

---

## ⚙️ Local Setup Guide

Follow these steps to run **Adhyaya** locally on your machine.

### Prerequisites
*   Node.js (v16+)
*   MongoDB (Local or Atlas URL)
*   Git

### 1. Clone the Repository
```bash
git clone https://github.com/rahulbornking-ship-it/Adhyaya.git
cd Adhyaya
```

### 2. Setup Backend (Server)
Navigate to the `server` directory and install dependencies.
```bash
cd server
npm install
```

Create a `.env` file in the `server` directory with the following variables:
```env
# Server Configuration
PORT=5000
CLIENT_URL=http://localhost:5173

# Database
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/adhyaya?retryWrites=true&w=majority

# JWT Authentication
JWT_SECRET=your_jwt_secret_key_here
JWT_REFRESH_SECRET=your_jwt_refresh_secret_here
JWT_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d
SESSION_SECRET=your_session_secret

# Google OAuth (Get these from Google Cloud Console)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

# Gemini AI (For Mock Interview)
GEMINI_API_KEY=your_gemini_api_key

# Payment Gateway (Optional/Test Mode)
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Cloudinary (Image Uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Start the server:
```bash
npm run dev
# Server should be running on http://localhost:5000
```

### 3. Setup Frontend (Client)
Open a new terminal, navigate to the `client` directory, and install dependencies.
```bash
cd client
npm install
```

Create a `.env` file in the `client` directory:
```env
# Backend API URL
VITE_API_URL=http://localhost:5000/api

# Gemini AI Keys (Frontend fallback/alternative)
VITE_GEMINI_API_KEY_1=your_gemini_api_key_1
VITE_GEMINI_API_KEY_2=your_gemini_api_key_2
```

Start the frontend:
```bash
npm run dev
# Client should be running on http://localhost:5173
```

### 4. Verification
1.  Open `http://localhost:5173` in your browser.
2.  Try logging in with Google.
3.  Navigate to the "Mentor Connect" or "Mock Interview" pages to see the features in action.

---

> **Note to Judges:** Adhyaya is not just an LMS; it's an ethos. We prove that education can remain free while building a sustainable, scalable business model.
