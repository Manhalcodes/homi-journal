// AuthPage.jsx
// Purpose: Authentication screen for login and signup using Firebase Auth.
// Provides email/password auth and Google sign-in. After auth, parent can route to the app.

import React, { useState } from 'react';
import { auth, googleProvider } from '../firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup } from 'firebase/auth';

export default function AuthPage({ onAuthenticated }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      onAuthenticated?.();
    } catch (err) {
      setError(err?.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setError('');
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      onAuthenticated?.();
    } catch (err) {
      setError(err?.message || 'Google sign-in failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md space-y-6 rounded-lg border border-slate-200 bg-white p-6">
      <div>
        <h2 className="text-xl font-semibold">{mode === 'login' ? 'Log in to Homi' : 'Create your Homi account'}</h2>
        <p className="text-sm text-slate-600">Your journaling companion is here for you.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="email"
          required
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-md border border-slate-300 p-2"
        />
        <input
          type="password"
          required
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-md border border-slate-300 p-2"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-slate-800 p-2 text-white disabled:opacity-50"
        >
          {loading ? 'Please wait…' : mode === 'login' ? 'Log In' : 'Sign Up'}
        </button>
      </form>

      <button
        onClick={handleGoogle}
        disabled={loading}
        className="w-full rounded-md border border-slate-300 p-2"
      >
        Continue with Google
      </button>

      {error && (
        <div className="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}

      <div className="text-center text-sm">
        {mode === 'login' ? (
          <button className="text-slate-700 underline" onClick={() => setMode('signup')}>No account? Sign up</button>
        ) : (
          <button className="text-slate-700 underline" onClick={() => setMode('login')}>Have an account? Log in</button>
        )}
      </div>
    </div>
  );
}

