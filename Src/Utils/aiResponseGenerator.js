// aiResponseGenerator.js
// Purpose: Call the secure serverless API to generate an empathetic AI response
// for a given journal entry.
// Why serverless? API keys stay on the server, requests can be validated and rate-limited.

// Resolve API base URL from environment variables in both Vite and CRA setups.
// - Vite: VITE_API_BASE_URL
// - CRA:  REACT_APP_API_BASE_URL
let apiBase =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE_URL)
    ? import.meta.env.VITE_API_BASE_URL
    : (typeof process !== 'undefined' && process.env && process.env.REACT_APP_API_BASE_URL)
      ? process.env.REACT_APP_API_BASE_URL
      : '';

// Sensible dev fallback: if no explicit API base is provided and we're on localhost,
// assume the backend runs at http://localhost:8080
try {
  // Accessing window may throw in SSR environments; wrap in try/catch
  if (!apiBase && typeof window !== 'undefined' && window.location && window.location.hostname === 'localhost') {
    apiBase = 'http://localhost:8080';
  }
} catch (_) {
  // no-op
}

/**
 * generateAIResponse
 * Sends the user's journal entry to our API (`/api/ai-journal`).
 * The API forwards to OpenRouter and returns reflection + optional questions.
 *
 * @param {string} userEntry - The user's journal text input
 * @param {object} [options]
 * @param {string} [options.tone] - Optional tone hint like "gentle", "encouraging"
 * @returns {Promise<string>} - The AI response content
 */
export async function generateAIResponse(userEntry, options = {}) {
  const { tone } = options;

  // Guard against empty entries early to improve UX
  if (!userEntry || !userEntry.trim()) {
    return 'Please write something to journal about.';
  }

  try {
    // Include Firebase ID token for backend verification
    let idToken = undefined;
    try {
      const { auth } = await import('../firebase.js');
      const currentUser = auth.currentUser;
      idToken = currentUser ? await currentUser.getIdToken() : undefined;
    } catch (_) { /* non-fatal in case auth not ready */ }

    const response = await fetch(`${apiBase}/api/ai-journal`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
      },
      body: JSON.stringify({ entry: userEntry, tone }),
    });

    // If the backend failed, surface a friendly message
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`AI request failed: ${response.status} ${text}`);
    }

    // Expect shape: { content: string }
    const data = await response.json();
    // Return both content and questions if available
    return {
      content: data.content ?? 'Sorry, I could not generate a response right now.',
      questions: Array.isArray(data.questions) ? data.questions : [],
    };
  } catch (error) {
    // Log for debugging while returning a user-friendly message
    // eslint-disable-next-line no-console
    console.error('generateAIResponse error:', error);
    return { content: 'Sorry, something went wrong. Please try again later.', questions: [] };
  }
}


