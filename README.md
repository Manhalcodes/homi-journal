# Homi — Your Gentle Journaling Companion

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=YOUR_REPO_URL&env=YOUR_ENV_VARS)

Homi is a calm, privacy-minded journaling web app. You write freely; Homi replies with warm, empathetic reflections and a few gentle questions to help you go deeper.

## 🚀 Features

- **Modern Stack**: Built with React 18, Vite, and Tailwind CSS
- **AI-Powered**: Integrated with Mistral AI via OpenRouter for thoughtful responses
- **Secure Authentication**: Firebase Authentication with Email/Password and Google Sign-In
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Serverless Backend**: Deployed on Vercel Serverless Functions
- **Database**: MongoDB Atlas for secure data storage

## ✨ User Journey

1. **Landing Page**
   - Welcoming interface with clear call-to-action
   - Soft gradient background and intuitive design

2. **Authentication**
   - Secure signup/login with Email/Password or Google
   - Smooth transition to journal interface

3. **Journal Interface**
   - Clean, distraction-free writing space
   - AI assistance button for supportive feedback

4. **AI Responses**
   - Empathetic and thoughtful reflections
   - 2-3 reflective questions to encourage deeper thinking

5. **Dashboard**
   - Timeline of journal entries
   - Easy edit/delete functionality
   - Visual progress tracking

## 🏗️ Project Structure

```
HOMI-A-journal-friend/
├── Public/               # Static assets (images, icons, etc.)
│   └── index.html        # Main HTML entry point
│
├── src/                  # Frontend source code
│   ├── components/       # Reusable React components
│   │   ├── AuthPage.jsx  # Authentication UI
│   │   ├── JournalPage.jsx # Main journal interface
│   │   ├── DashboardPage.jsx # User entries overview
│   │   └── ...
│   ├── firebase.js      # Firebase configuration
│   └── App.jsx          # Main application component
│
├── api/                 # Serverless API routes (Vercel)
│   ├── ai-journal.js    # AI response generation
│   └── journal-entries/ # Entry management endpoints
│
├── server/              # Backend server (for Render deployment)
│   ├── index.js         # Express server setup
│   └── package.json     # Backend dependencies
│
├── .gitignore          # Git ignore rules
├── package.json        # Frontend dependencies and scripts
├── tailwind.config.js  # Tailwind CSS theming
└── vite.config.js      # Vite build configuration
```

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI Library
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **React Router** - Client-side routing
- **Firebase** - Authentication

### Backend (Serverless)
- **Vercel Serverless Functions** - API endpoints
- **MongoDB Atlas** - Database
- **OpenRouter** - AI integration
- **Firebase Admin** - Authentication verification

frontend (React)
- `Src/App.jsx` — App shell: Landing → Auth → Journal/Dashboard. Shows streak + Write button.
- `Src/components/LandingPage.jsx` — Public welcome screen + CTA.
- `Src/components/AuthPage.jsx` — Email/Password + Google sign-in.
- `Src/components/JournalPage.jsx` — Entry input, calls AI, shows response/questions.
- `Src/components/DashboardPage.jsx` — Lists entries, allows edit/delete.
- `Src/components/AIResponse.jsx` — Presentation of AI output.
- `Src/Utils/aiResponseGenerator.js` — Calls `/api/ai-journal` with ID token.
- `Src/firebase.js` — Firebase client init (Auth).

serverless (Vercel API)
- `api/ai-journal.js` — POST: generate AI reflection and save to MongoDB.
- `api/journal-entries/index.js` — GET: list entries.
- `api/journal-entries/[id].js` — PATCH/DELETE: edit/remove entry.
- `api/_lib/db.js` — Mongo connection (cached).
- `api/_lib/auth.js` — Verify Firebase ID token via Admin SDK.
- `api/_lib/rateLimit.js` — Upstash REST-based limiter (optional).

Legacy (optional)
- `server/` — Original Express server (not needed on Vercel). Safe to remove if not using Render.

## Environment Variables
Set these in Vercel (Project → Settings → Environment Variables). Add to both Preview and Production.

AI / OpenRouter
- `OPENROUTER_API_KEY` — from OpenRouter keys
- `OPENROUTER_MODEL` — optional, default `mistralai/mistral-7b-instruct`

MongoDB
- `MONGODB_URI` — Atlas connection string
- `MONGODB_DB_NAME` — e.g., `homi`

Firebase (Server — Admin)
- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY` — paste with literal `\n` in Vercel; code will convert to newlines

Firebase (Client — Frontend)
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

Rate Limiting (optional)
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`

Dev-only (optional)
- `VITE_API_BASE_URL` — Only set for local dev to hit a remote backend. Leave unset on Vercel.

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ and npm
- MongoDB Atlas account
- Firebase project
- OpenRouter API key

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/homi-journal.git
   cd homi-journal
   ```

2. **Install dependencies**
   ```bash
   # Install frontend dependencies
   npm install
   
   # Install backend dependencies
   cd server
   npm install
   cd ..
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory with the required variables:
   ```env
   # Firebase (Client)
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   
   # For local development
   VITE_API_BASE_URL=http://localhost:3000
   ```

4. **Start the development servers**
   ```bash
   # Start frontend
   npm run dev
   
   # In a new terminal, start the backend
   npm run server
   ```

   The app should now be running at `http://localhost:5173`
1) Install dependencies:
   - Frontend: `npm install`
   - (Optional) Vercel CLI: `npm i -g vercel`
2) Create `.env.local` at the repo root for Vite:
   - Include the `VITE_*` Firebase values
   - Optionally, `VITE_API_BASE_URL=http://localhost:3000` if using `vercel dev`
3) Run serverless locally: `vercel dev`
4) Run frontend: `npm run dev`
5) Open the local URL shown by Vite; the frontend will call `/api/*` via the Vercel dev server.

## 🚀 Deployment

### Frontend (Vercel)
1. Push your code to a GitHub repository
2. Import the project into Vercel
3. Configure environment variables in Vercel dashboard
4. Deploy your application

### Backend (Render)
1. Push your code to GitHub
2. Create a new Web Service on Render
3. Connect your GitHub repository
4. Configure build and start commands:
   - Build: `cd server && npm install`
   - Start: `npm start`
5. Add all required environment variables
6. Deploy

### Environment Variables
Make sure to set these in your deployment platform:

**Frontend (Vercel)**
- `VITE_FIREBASE_*` - Firebase configuration
- `VITE_API_BASE_URL` - Your Render backend URL (e.g., `https://your-backend.onrender.com`)

**Backend (Render)**
- `MONGODB_URI` - MongoDB connection string
- `OPENROUTER_API_KEY` - Your OpenRouter API key
- `FIREBASE_*` - Firebase Admin credentials
1) Push repo to GitHub.
2) Import project into Vercel. Select React/Vite framework preset if prompted.
3) Add all environment variables in Vercel (see above).
4) Deploy.
5) In Firebase Auth → Settings → Authorized domains, add `your-app.vercel.app`.

## 📚 API Reference

### Authentication
All API endpoints (except public routes) require a valid Firebase ID token in the `Authorization` header:
```
Authorization: Bearer <firebase_id_token>
```

### Endpoints

#### POST `/api/ai-journal`
Generate AI reflection for a journal entry

**Request**
```json
{
  "entry": "Your journal entry text here",
  "tone": "supportive" // Optional
}
```

**Response**
```json
{
  "content": "AI response here...",
  "questions": ["Question 1", "Question 2"]
}
```

#### GET `/api/journal-entries`
Get paginated list of journal entries

**Query Parameters**
- `limit`: Number of entries to return (default: 20)
- `page`: Page number (default: 1)

**Response**
```json
{
  "entries": [
    {
      "id": "entry_id",
      "userId": "user_id",
      "entry": "Entry content",
      "ai": {
        "content": "AI response",
        "questions": ["Question 1", "Question 2"]
      },
      "createdAt": "ISO_DATE"
    }
  ],
  "total": 42
}
```

#### PATCH `/api/journal-entries/:id`
Update a journal entry

**Request**
```json
{
  "entry": "Updated entry content"
}
```

#### DELETE `/api/journal-entries/:id`
Delete a journal entry

POST `/api/ai-journal`
- Auth: Firebase ID token (Authorization: Bearer <token>)
- Body: `{ entry: string, tone?: string }`
- Response: `{ content: string, questions?: string[] }`

GET `/api/journal-entries?limit=20`
- Auth: Firebase ID token
- Response: `{ entries: Array<{ id: string, userId: string, entry: string, ai?: { content: string, questions?: string[] }, createdAt: string }> }`

PATCH `/api/journal-entries/:id`
- Auth: Firebase ID token
- Body: `{ entry: string }`
- Response: `{ ok: true }`

DELETE `/api/journal-entries/:id`
- Auth: Firebase ID token
- Response: `{ ok: true }`

Rate limiting: If Upstash variables are set, requests are rate limited per user + IP.

## Design Notes
- Tone: warm, non-judgmental, supportive. Avoid medical advice.
- Privacy: AI keys and logic are server-side; entries tied to authenticated user.
- Accessibility: good contrast, keyboard focusable buttons, large hit targets.

## Roadmap Ideas
- Password reset and email verification in Auth.
- Streaks calendar view, mood tagging, and search.
- Guided prompts and “themes” of reflection.
- Export entries to PDF/Markdown.
- i18n for multiple languages.

---

Made with empathy. Homi is not a medical tool; it’s a supportive space for reflection.
