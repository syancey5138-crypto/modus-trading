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
      syncData: async () => {}
    };
  }
  return context;
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cloudSyncEnabled, setCloudSyncEnabled] = useState(false);

  // Save any user data to Firestore (generic)
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

  // Load all user data from Firestore
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

  // Sync specific data type to cloud
  async function syncData(dataType, data) {
    if (!currentUser) return false;
    try {
      const userRef = doc(db, 'users', currentUser.uid);

      // For analysis history, limit size to prevent large writes
      let dataToSync = data;
      if (dataType === 'analysisHistory' && Array.isArray(data)) {
        // Keep only last 50 entries and remove large image data
        dataToSync = data.slice(-50).map(entry => ({
          ...entry,
          imageData: entry.imageData ? { mediaType: entry.imageData.mediaType, hasImage: true } : null
        }));
      }

      await setDoc(userRef, {
        [dataType]: dataToSync,
        updatedAt: serverTimestamp()
      }, { merge: true });

      console.log(`${dataType} synced to cloud`);
      return true;
    } catch (error) {
      console.error(`Error syncing ${dataType}:`, error);
      return false;
    }
  }

  // Initialize user document on first login
  async function initializeUserDoc(user, options = {}) {
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
          mailingList: options.subscribe !== false, // Default true unless explicitly false
          watchlist: ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA'],
          paperTrading: {
            balance: 100000,
            positions: [],
            history: [],
            startingBalance: 100000
          },
          portfolio: [],
          trades: [],
          tradePlans: [],
          analysisHistory: [],
          portfolioSettings: {
            initialCapital: 10000,
            riskPerTrade: 2,
            maxPositions: 5
          },
          settings: {
            theme: 'dark',
            notifications: true
          }
        });
        console.log('Created new user document with all data fields');
      }
      setCloudSyncEnabled(true);
    } catch (error) {
      console.error('Error initializing user doc:', error);
      setCloudSyncEnabled(false);
    }
  }

  // Sign up
  async function signup(email, password, displayName, options = {}) {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    if (displayName) {
      await updateProfile(result.user, { displayName });
    }
    await initializeUserDoc(result.user, options);
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
    syncData
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
