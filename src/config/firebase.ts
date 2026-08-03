import { initializeApp, getApps, getApp } from 'firebase/app';
// @ts-ignore
import { initializeAuth, getReactNativePersistence, getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyAQKrakKKef3UCKJC8hFSniokxtRTzXXAE",
  authDomain: "coinly-945ae.firebaseapp.com",
  projectId: "coinly-945ae",
  storageBucket: "coinly-945ae.firebasestorage.app",
  messagingSenderId: "57014660423",
  appId: "1:57014660423:web:4a293931b269b67f54f062"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

let auth: ReturnType<typeof getAuth>;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch {
  auth = getAuth(app);
}

export { auth };
export const db = getFirestore(app);
export default app;
