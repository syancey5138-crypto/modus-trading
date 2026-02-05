// Firebase Configuration for MODUS Trading
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyA4ksU15ugGpW0QmW8aYsZkN5__0u0NT_8",
  authDomain: "modus-trading.firebaseapp.com",
  projectId: "modus-trading",
  storageBucket: "modus-trading.firebasestorage.app",
  messagingSenderId: "463668228895",
  appId: "1:463668228895:web:861081df478f57cb30762a"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

export default app;
