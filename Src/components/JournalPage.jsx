// JournalPage.jsx
// Purpose: Main journaling UI.
// - Lets the user write an entry
// - Calls the AI endpoint to get an empathetic reflection + reflective questions
// - Shows the result and stores to MongoDB via the API (persistence handled server-side)
// Note: The submit button is the "AI button" (label: Get Supportive Feedback)

import React, { useState } from 'react';
import { generateAIResponse } from '../Utils/aiResponseGenerator.js';
import AIResponse from './AIResponse.jsx';

export default function JournalPage() {
  const [entry, setEntry] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [aiQuestions, setAiQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setAiResponse('');

    // Block fast re-submits and empty input
    if (!entry.trim() || isLoading) return;

    setIsLoading(true);
    try {
      const ai = await generateAIResponse(entry, { tone: 'gentle' });
      setAiResponse(ai.content);
      setAiQuestions(ai.questions || []);
    } catch (e) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="space-y-2">
        <h2 className="text-xl font-semibold">Today&apos;s Journal</h2>
        <p className="text-sm text-slate-600">Write freely. Your words matter.</p>
      </section>

      <form onSubmit={handleSubmit} className="space-y-3">
        <textarea
          className="w-full min-h-[160px] rounded-md border border-slate-300 bg-white p-3 outline-none ring-0 focus:border-slate-400"
          placeholder="How are you feeling today? What’s on your mind?"
          value={entry}
          onChange={(e) => setEntry(e.target.value)}
        />

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={isLoading || !entry.trim()}
            className="inline-flex items-center rounded-md bg-slate-800 px-4 py-2 text-white disabled:opacity-50"
          >
            {isLoading ? 'Thinking…' : 'Get Supportive Feedback'}
          </button>
          <button
            type="button"
            onClick={() => { setEntry(''); setAiResponse(''); setError(''); }}
            className="rounded-md border border-slate-300 px-3 py-2 text-slate-700"
          >
            Clear
          </button>
        </div>
      </form>

      {error && (
        <div className="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <AIResponse content={aiResponse} />

      {aiQuestions?.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-slate-700">Reflective questions</h4>
          <ul className="list-disc space-y-1 pl-6 text-slate-800">
            {aiQuestions.map((q, idx) => (
              <li key={idx}>{q}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}


