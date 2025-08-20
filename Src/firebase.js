// firebase.js
// Purpose: Initialize Firebase for authentication (and optionally Firestore).
// Environment variables should be provided via .env (Vite: VITE_*, CRA: REACT_APP_*).

import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const configFromEnv = {
  apiKey:
    (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_FIREBASE_API_KEY)
      ? import.meta.env.VITE_FIREBASE_API_KEY
      : (typeof process !== 'undefined' && process.env && process.env.REACT_APP_FIREBASE_API_KEY)
        ? process.env.REACT_APP_FIREBASE_API_KEY
        : undefined,
  authDomain:
    (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_FIREBASE_AUTH_DOMAIN)
      ? import.meta.env.VITE_FIREBASE_AUTH_DOMAIN
      : (typeof process !== 'undefined' && process.env && process.env.REACT_APP_FIREBASE_AUTH_DOMAIN)
        ? process.env.REACT_APP_FIREBASE_AUTH_DOMAIN
        : undefined,
  projectId:
    (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_FIREBASE_PROJECT_ID)
      ? import.meta.env.VITE_FIREBASE_PROJECT_ID
      : (typeof process !== 'undefined' && process.env && process.env.REACT_APP_FIREBASE_PROJECT_ID)
        ? process.env.REACT_APP_FIREBASE_PROJECT_ID
        : undefined,
  storageBucket:
    (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_FIREBASE_STORAGE_BUCKET)
      ? import.meta.env.VITE_FIREBASE_STORAGE_BUCKET
      : (typeof process !== 'undefined' && process.env && process.env.REACT_APP_FIREBASE_STORAGE_BUCKET)
        ? process.env.REACT_APP_FIREBASE_STORAGE_BUCKET
        : undefined,
  messagingSenderId:
    (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID)
      ? import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID
      : (typeof process !== 'undefined' && process.env && process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID)
        ? process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID
        : undefined,
  appId:
    (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_FIREBASE_APP_ID)
      ? import.meta.env.VITE_FIREBASE_APP_ID
      : (typeof process !== 'undefined' && process.env && process.env.REACT_APP_FIREBASE_APP_ID)
        ? process.env.REACT_APP_FIREBASE_APP_ID
        : undefined,
};

const app = initializeApp(configFromEnv);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();


