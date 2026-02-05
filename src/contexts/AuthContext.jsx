// Authentication Context for MODUS Trading
// Self-contained Firebase auth + Firestore for cloud sync
import { createContext, useContext, useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp
} from 'firebase/firestore';

// Firebase config
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
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

// Context
const AuthContext = createContext(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    return {
      currentUser: null,
      userProfile: null,
      loading: false,
      cloudSyncEnabled: false,
      signup: async () => {},
      login: async () => {},
      loginWithGoogle: async () => {},
      logout: async () => {},
      resetPassword: async () => {},
      saveUserData: async () => {},
      loadUserData: async () => null,
      syncWatchlist: async () => {},
      syncSettings: async () => {}
    };
  }
  return context;
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cloudSyncEnabled, setCloudSyncEnabled] = useState(false);

  // Save user data to Firestore
  async function saveUserData(data) {
    if (!currentUser) return false;
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      await setDoc(userRef, {
        ...data,
        updatedAt: serverTimestamp(),
        email: currentUser.email
      }, { merge: true });
      return true;
    } catch (error) {
      console.error('Error saving user data:', error);
      return false;
    }
  }

  // Load user data from Firestore
  async function loadUserData() {
    if (!currentUser) return null;
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      const docSnap = await getDoc(userRef);
      if (docSnap.exists()) {
        return docSnap.data();
      }
      return null;
    } catch (error) {
      console.error('Error loading user data:', error);
      return null;
    }
  }

  // Sync watchlist to cloud
  async function syncWatchlist(watchlist) {
    if (!currentUser) return false;
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      await setDoc(userRef, {
        watchlist: watchlist,
        updatedAt: serverTimestamp()
      }, { merge: true });
      console.log('Watchlist synced to cloud');
      return true;
    } catch (error) {
      console.error('Error syncing watchlist:', error);
      return false;
    }
  }

  // Sync settings to cloud
  async function syncSettings(settings) {
    if (!currentUser) return false;
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      await setDoc(userRef, {
        settings: settings,
        updatedAt: serverTimestamp()
      }, { merge: true });
      console.log('Settings synced to cloud');
      return true;
    } catch (error) {
      console.error('Error syncing settings:', error);
      return false;
    }
  }

  // Initialize user document on first login
  async function initializeUserDoc(user) {
    try {
      const userRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(userRef);

      if (!docSnap.exists()) {
        // Create new user document with default data
        await setDoc(userRef, {
          email: user.email,
          displayName: user.displayName || user.email?.split('@')[0],
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          watchlist: ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA'],
          settings: {
            theme: 'dark',
            notifications: true
          }
        });
        console.log('Created new user document');
      }
      setCloudSyncEnabled(true);
    } catch (error) {
      console.error('Error initializing user doc:', error);
      setCloudSyncEnabled(false);
    }
  }

  // Sign up
  async function signup(email, password, displayName) {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    if (displayName) {
      await updateProfile(result.user, { displayName });
    }
    await initializeUserDoc(result.user);
    return result;
  }

  // Login
  async function login(email, password) {
    const result = await signInWithEmailAndPassword(auth, email, password);
    await initializeUserDoc(result.user);
    return result;
  }

  // Google login
  async function loginWithGoogle() {
    const result = await signInWithPopup(auth, googleProvider);
    await initializeUserDoc(result.user);
    return result;
  }

  // Logout
  async function logout() {
    setUserProfile(null);
    setCloudSyncEnabled(false);
    return signOut(auth);
  }

  // Password reset
  async function resetPassword(email) {
    return sendPasswordResetEmail(auth, email);
  }

  // Listen for auth changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        setUserProfile({
          displayName: user.displayName || user.email?.split('@')[0],
          email: user.email,
          photoURL: user.photoURL
        });
        // Initialize user doc and enable cloud sync
        await initializeUserDoc(user);
      } else {
        setUserProfile(null);
        setCloudSyncEnabled(false);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userProfile,
    loading,
    cloudSyncEnabled,
    signup,
    login,
    loginWithGoogle,
    logout,
    resetPassword,
    saveUserData,
    loadUserData,
    syncWatchlist,
    syncSettings
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
