# Homi — Your Gentle Journaling Companion

Homi is a calm, privacy-minded journaling web app. You write freely; Homi replies with warm, empathetic reflections and a few gentle questions to help you go deeper.

- Frontend: React + Tailwind (Landing, Auth, Journal, Dashboard)
- Auth: Firebase Authentication (Email/Password + Google)
- AI: Mistral via OpenRouter (server-side)
- Data: MongoDB Atlas
- Backend: Vercel Serverless Functions (`/api/*`) with optional Upstash Redis rate limits

## Demo Flow
1) Visitor sees a welcoming Landing page with a soft gradient and clear CTA.
2) Click “Enter Your Safe Space” → Auth page (signup or login).
3) Journal page offers a textarea and an “AI button” (Get Supportive Feedback).
4) Homi responds with empathy + 2–3 reflective questions. Entries are saved.
5) Dashboard lists recent entries with edit/delete.

## Repository Structure

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

## Local Development
1) Install dependencies:
   - Frontend: `npm install`
   - (Optional) Vercel CLI: `npm i -g vercel`
2) Create `.env.local` at the repo root for Vite:
   - Include the `VITE_*` Firebase values
   - Optionally, `VITE_API_BASE_URL=http://localhost:3000` if using `vercel dev`
3) Run serverless locally: `vercel dev`
4) Run frontend: `npm run dev`
5) Open the local URL shown by Vite; the frontend will call `/api/*` via the Vercel dev server.

## Deployment (Vercel)
1) Push repo to GitHub.
2) Import project into Vercel. Select React/Vite framework preset if prompted.
3) Add all environment variables in Vercel (see above).
4) Deploy.
5) In Firebase Auth → Settings → Authorized domains, add `your-app.vercel.app`.

## API Reference (Serverless)

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
