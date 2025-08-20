// EntryCard.jsx
// Purpose: Presentational card for a journal entry (kept simple; DashboardPage handles actions).

import React from 'react';

export default function EntryCard({ entry }) {
  if (!entry) return null;
  return (
    <div className="rounded-md border border-slate-200 bg-white p-4">
      <div className="mb-2 text-sm text-slate-500">
        {entry.createdAt ? new Date(entry.createdAt).toLocaleString() : ''}
      </div>
      <div className="whitespace-pre-wrap">{entry.entry}</div>
      {entry?.ai?.content && (
        <div className="mt-3 rounded bg-slate-50 p-3 text-sm">{entry.ai.content}</div>
      )}
    </div>
  );
}


