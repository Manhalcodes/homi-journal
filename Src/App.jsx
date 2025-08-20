// App.jsx
// Purpose: Top-level shell for Homi.
// - Shows a public Landing page to visitors
// - Shows Auth (login/signup) when CTA clicked
// - After login, provides simple tabs: Journal and Dashboard
// - Header also renders a streak indicator and a quick "Write" action
// Data flow:
// - Auth state is observed via Firebase Auth
// - Journal & Dashboard components call serverless API routes (same domain /api/*)
// - A lightweight streak is computed by fetching recent entries and counting consecutive days

import React, { useEffect, useState } from 'react';
import JournalPage from './components/JournalPage.jsx';
import AuthPage from './components/AuthPage.jsx';
import { auth } from './firebase';
import DashboardPage from './components/DashboardPage.jsx';
import LandingPage from './components/LandingPage.jsx';

export default function App() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);
  const [streakDays, setStreakDays] = useState(0);

  // Observe auth state and show AuthPage if not logged in
  useEffect(() => {
    const unsub = auth.onAuthStateChanged((u) => {
      setUser(u);
      setChecking(false);
    });
    return () => unsub();
  }, []);

  const [tab, setTab] = useState('journal'); // 'journal' | 'dashboard'
  const [showAuth, setShowAuth] = useState(false);

  // Compute a simple day streak from recent entries
  useEffect(() => {
    async function computeStreak() {
      try {
        if (!auth.currentUser) { setStreakDays(0); return; }
        const token = await auth.currentUser.getIdToken();
        const base = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE_URL) ? import.meta.env.VITE_API_BASE_URL : '';
        const res = await fetch(`${base}/api/journal-entries?limit=200`, { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) { setStreakDays(0); return; }
        const data = await res.json();
        const entries = Array.isArray(data.entries) ? data.entries : [];
        const days = new Set(entries.map((e) => {
          const d = e.createdAt ? new Date(e.createdAt) : null;
          if (!d) return null;
          return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
        }).filter(Boolean));
        let streak = 0;
        const today = new Date();
        let cursor = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        while (days.has(cursor.getTime())) {
          streak += 1;
          cursor.setDate(cursor.getDate() - 1);
        }
        if (streak === 0) {
          const yesterday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
          let c = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());
          while (days.has(c.getTime())) { streak += 1; c.setDate(c.getDate() - 1); }
        }
        setStreakDays(streak);
      } catch (_) { setStreakDays(0); }
    }
    if (user) computeStreak();
  }, [user, tab]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 text-slate-800">
      <header className="border-b border-slate-200">
        <div className="mx-auto max-w-3xl px-4 py-4">
          <div className="flex items-end justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold">Homi</h1>
              <p className="text-sm text-slate-600">A gentle journaling companion</p>
            </div>
            {user && (
              <div className="flex items-center gap-2">
                <div className="rounded-full border border-slate-200 bg-white/70 px-3 py-1 text-sm text-slate-700 backdrop-blur supports-[backdrop-filter]:backdrop-blur">
                  🏆 {streakDays} day streak
                </div>
                <button
                  onClick={() => setTab('journal')}
                  className="rounded-full bg-gradient-to-r from-rose-500 to-amber-500 px-4 py-1.5 text-sm text-white shadow-sm"
                >
                  ➕ Write
                </button>
                <button
                  onClick={() => setTab('dashboard')}
                  className={`rounded-md border border-slate-300 px-3 py-1 text-sm ${tab==='dashboard'?'bg-slate-100':''}`}
                >
                  Dashboard
                </button>
                <button
                  onClick={() => auth.signOut()}
                  className="rounded-md border border-slate-300 px-3 py-1 text-sm text-slate-700"
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-6">
        {checking ? (
          <div className="text-slate-600">Loading…</div>
        ) : user ? (
          tab === 'journal' ? <JournalPage /> : <DashboardPage />
        ) : (
          showAuth ? (
            <AuthPage onAuthenticated={() => { /* state observer will switch UI */ }} />
          ) : (
            <LandingPage onEnter={() => setShowAuth(true)} />
          )
        )}
      </main>

      <footer className="mt-8 border-t border-slate-200">
        <div className="mx-auto max-w-3xl px-4 py-4 text-xs text-slate-500">
          Homi encourages reflection and self-care. It does not provide medical advice.
        </div>
      </footer>
    </div>
  );
}


