// Authentication Context for MODUS Trading
// Self-contained Firebase auth - all in one file to avoid bundling issues
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
      signup: async () => {},
      login: async () => {},
      loginWithGoogle: async () => {},
      logout: async () => {},
      resetPassword: async () => {}
    };
  }
  return context;
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sign up
  async function signup(email, password, displayName) {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    if (displayName) {
      await updateProfile(result.user, { displayName });
    }
    return result;
  }

  // Login
  async function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  // Google login
  async function loginWithGoogle() {
    return signInWithPopup(auth, googleProvider);
  }

  // Logout
  async function logout() {
    setUserProfile(null);
    return signOut(auth);
  }

  // Password reset
  async function resetPassword(email) {
    return sendPasswordResetEmail(auth, email);
  }

  // Listen for auth changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user) {
        setUserProfile({
          displayName: user.displayName || user.email?.split('@')[0],
          email: user.email,
          photoURL: user.photoURL
        });
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userProfile,
    loading,
    signup,
    login,
    loginWithGoogle,
    logout,
    resetPassword
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
