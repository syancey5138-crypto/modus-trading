// Firebase Configuration for MODUS Trading
// Lazy initialization to prevent module loading issues

let app = null;
let auth = null;
let db = null;
let googleProvider = null;
let initialized = false;

const firebaseConfig = {
  apiKey: "AIzaSyA4ksU15ugGpW0QmW8aYsZkN5__0u0NT_8",
  authDomain: "modus-trading.firebaseapp.com",
  projectId: "modus-trading",
  storageBucket: "modus-trading.firebasestorage.app",
  messagingSenderId: "463668228895",
  appId: "1:463668228895:web:861081df478f57cb30762a"
};

// Initialize Firebase lazily
async function initFirebase() {
  if (initialized) return { app, auth, db, googleProvider };

  try {
    const { initializeApp } = await import('firebase/app');
    const { getAuth, GoogleAuthProvider } = await import('firebase/auth');
    const { getFirestore } = await import('firebase/firestore');

    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    googleProvider = new GoogleAuthProvider();
    initialized = true;

    return { app, auth, db, googleProvider };
  } catch (error) {
    console.error('Firebase initialization error:', error);
    throw error;
  }
}

// Export getters that ensure Firebase is initialized
export function getFirebaseAuth() {
  if (!auth) {
    throw new Error('Firebase not initialized. Call initFirebase() first.');
  }
  return auth;
}

export function getFirebaseDb() {
  if (!db) {
    throw new Error('Firebase not initialized. Call initFirebase() first.');
  }
  return db;
}

export function getGoogleProvider() {
  if (!googleProvider) {
    throw new Error('Firebase not initialized. Call initFirebase() first.');
  }
  return googleProvider;
}

export { initFirebase, firebaseConfig };
export { app, auth, db, googleProvider };
