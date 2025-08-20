// LandingPage.jsx
// Purpose: Public welcome screen.
// - Soft gradient background
// - Gentle copy to set the tone
// - Minimal features row
// - Primary CTA triggers parent to show the Auth screen

import React from 'react';

export default function LandingPage({ onEnter }) {
  return (
    <div className="min-h-[70vh] bg-gradient-to-b from-orange-50 via-amber-50 to-rose-50">
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        {/* Logo mark */}
        <div className="mx-auto mb-6 h-16 w-16 rounded-full bg-gradient-to-br from-peach-300 to-rose-300 p-[2px]" style={{ backgroundImage: 'linear-gradient(135deg,#fecdd3,#fdba74)' }}>
          <div className="flex h-full w-full items-center justify-center rounded-full bg-white/90">
            <span aria-hidden className="text-rose-400 text-2xl">❤</span>
            <span className="sr-only">Homi logo</span>
          </div>
        </div>

        {/* Title */}
        <h1 className="mb-2 text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-amber-500">
          Homi
        </h1>
        <p className="mx-auto max-w-2xl text-base text-slate-700">
          “Your gentle companion for journaling and self-reflection.
          A warm, safe space where your thoughts can breathe freely.”
        </p>

        {/* Welcome card */}
        <div className="mx-auto mt-10 max-w-2xl rounded-xl border border-white/60 bg-white/60 p-6 backdrop-blur-md">
          <h2 className="text-lg font-semibold">Welcome home, gentle soul</h2>
          <p className="mt-2 text-slate-700">
            Here, you can write without judgment, reflect without pressure, and grow at your own pace.
            Your AI friend is here to listen, understand, and gently guide you through your thoughts.
          </p>

          {/* Tiny feature row */}
          <div className="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-3">
            <div className="rounded-md border border-white/70 bg-white/50 p-3">
              <div className="mb-1">📖</div>
              <div className="font-medium">Safe Journaling</div>
            </div>
            <div className="rounded-md border border-white/70 bg-white/50 p-3">
              <div className="mb-1">❤</div>
              <div className="font-medium">AI Companion</div>
            </div>
            <div className="rounded-md border border-white/70 bg-white/50 p-3">
              <div className="mb-1">📈</div>
              <div className="font-medium">Growth Tracking</div>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-6">
            <button
              onClick={onEnter}
              className="mx-auto inline-flex items-center rounded-full bg-gradient-to-r from-rose-500 to-amber-500 px-6 py-3 text-white shadow-sm"
            >
              Enter Your Safe Space
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


