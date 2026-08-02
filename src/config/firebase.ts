import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAQKrakKKef3UCKJC8hFSniokxtRTzXXAE",
  authDomain: "coinly-945ae.firebaseapp.com",
  projectId: "coinly-945ae",
  storageBucket: "coinly-945ae.firebasestorage.app",
  messagingSenderId: "57014660423",
  appId: "1:57014660423:web:4a293931b269b67f54f062"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
