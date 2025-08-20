// AIResponse.jsx
// Purpose: Presentational component to show the AI response neatly.

import React from 'react';

export default function AIResponse({ content }) {
  if (!content) return null;
  return (
    <section className="rounded-md border border-slate-200 bg-white p-4">
      <h3 className="mb-2 text-base font-semibold">Homi&apos;s Reflection</h3>
      <p className="whitespace-pre-wrap leading-7">{content}</p>
    </section>
  );
}


