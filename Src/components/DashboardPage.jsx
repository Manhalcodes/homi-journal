// DashboardPage.jsx
// Purpose: List past journal entries with edit and delete actions.
// - Fetches entries for the current user from /api/journal-entries
// - Allows inline edit (prompt) and delete per entry
// - Keeps UI simple; real apps should use proper modals/forms

import React, { useEffect, useState } from 'react';

export default function DashboardPage() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function fetchEntries() {
    setError('');
    setLoading(true);
    try {
      const { auth } = await import('../firebase.js');
      const user = auth.currentUser;
      const token = user ? await user.getIdToken() : undefined;
      const base = (import.meta.env?.VITE_API_BASE_URL) || '';
      const res = await fetch(`${base}/api/journal-entries?limit=50`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setEntries(Array.isArray(data.entries) ? data.entries : []);
    } catch (e) {
      setError('Failed to load entries');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchEntries();
  }, []);

  async function handleDelete(id) {
    if (!confirm('Delete this entry?')) return;
    try {
      const { auth } = await import('../firebase.js');
      const token = await auth.currentUser?.getIdToken();
      const base = (import.meta.env?.VITE_API_BASE_URL) || '';
      const res = await fetch(`${base}/api/journal-entries/${id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error(await res.text());
      setEntries((prev) => prev.filter((e) => e.id !== id));
    } catch (_) {
      alert('Delete failed');
    }
  }

  async function handleEdit(id) {
    const current = entries.find((e) => e.id === id);
    const next = prompt('Edit your entry:', current?.entry ?? '');
    if (next == null) return;
    try {
      const { auth } = await import('../firebase.js');
      const token = await auth.currentUser?.getIdToken();
      const base = (import.meta.env?.VITE_API_BASE_URL) || '';
      const res = await fetch(`${base}/api/journal-entries/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ entry: next }),
      });
      if (!res.ok) throw new Error(await res.text());
      setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, entry: next } : e)));
    } catch (_) {
      alert('Update failed');
    }
  }

  if (loading) return <div className="text-slate-600">Loading…</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Your past entries</h2>
      {entries.length === 0 && <div className="text-slate-600">No entries yet.</div>}
      <ul className="space-y-3">
        {entries.map((e) => (
          <li key={e.id} className="rounded-md border border-slate-200 bg-white p-4">
            <div className="mb-2 text-sm text-slate-500">
              {e.createdAt ? new Date(e.createdAt).toLocaleString() : ''}
            </div>
            <div className="whitespace-pre-wrap">{e.entry}</div>
            {e?.ai?.content && (
              <div className="mt-3 rounded bg-slate-50 p-3 text-sm">{e.ai.content}</div>
            )}
            <div className="mt-3 flex gap-2">
              <button className="rounded-md border px-3 py-1" onClick={() => handleEdit(e.id)}>Edit</button>
              <button className="rounded-md border px-3 py-1" onClick={() => handleDelete(e.id)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}


