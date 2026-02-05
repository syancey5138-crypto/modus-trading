// Authentication Context for MODUS Trading
// Firebase loads ONLY when user attempts to authenticate
import { createContext, useContext, useState, useEffect, useRef } from 'react';

// Default context value - app works without Firebase
const defaultContextValue = {
  currentUser: null,
  userProfile: null,
  loading: false,
  authReady: true,
  signup: async () => { throw new Error('Auth not initialized'); },
  login: async () => { throw new Error('Auth not initialized'); },
  loginWithGoogle: async () => { throw new Error('Auth not initialized'); },
  logout: async () => {},
  resetPassword: async () => { throw new Error('Auth not initialized'); },
  updateUserProfile: async () => {}
};

const AuthContext = createContext(defaultContextValue);

export function useAuth() {
  const context = useContext(AuthContext);
  return context || defaultContextValue;
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [authReady, setAuthReady] = useState(true);
  const firebaseRef = useRef(null);
  const unsubscribeRef = useRef(null);

  // Initialize Firebase lazily - only called when needed
  async function ensureFirebase() {
    if (firebaseRef.current) return firebaseRef.current;

    try {
      // Dynamic import everything
      const [
        { initializeApp },
        { getAuth, GoogleAuthProvider, onAuthStateChanged },
        { getFirestore }
      ] = await Promise.all([
        import('firebase/app'),
        import('firebase/auth'),
        import('firebase/firestore')
      ]);

      const firebaseConfig = {
        apiKey: "AIzaSyA4ksU15ugGpW0QmW8aYsZkN5__0u0NT_8",
        authDomain: "modus-trading.firebaseapp.com",
        projectId: "modus-trading",
        storageBucket: "modus-trading.firebasestorage.app",
        messagingSenderId: "463668228895",
        appId: "1:463668228895:web:861081df478f57cb30762a"
      };

      const app = initializeApp(firebaseConfig);
      const auth = getAuth(app);
      const db = getFirestore(app);
      const googleProvider = new GoogleAuthProvider();

      firebaseRef.current = { app, auth, db, googleProvider };

      // Set up auth listener once Firebase is initialized
      if (!unsubscribeRef.current) {
        unsubscribeRef.current = onAuthStateChanged(auth, async (user) => {
          setCurrentUser(user);
          if (user) {
            try {
              const { doc, getDoc, setDoc, serverTimestamp } = await import('firebase/firestore');
              const userRef = doc(db, 'users', user.uid);
              const snapshot = await getDoc(userRef);

              if (snapshot.exists()) {
                setUserProfile({ id: snapshot.id, ...snapshot.data() });
              } else {
                const { email, displayName, photoURL } = user;
                await setDoc(userRef, {
                  email,
                  displayName: displayName || email?.split('@')[0] || 'User',
                  photoURL: photoURL || null,
                  createdAt: serverTimestamp(),
                  lastLogin: serverTimestamp(),
                  settings: { theme: 'dark', notifications: true },
                  subscription: { plan: 'free', startDate: serverTimestamp() }
                });
                const newSnapshot = await getDoc(userRef);
                setUserProfile({ id: newSnapshot.id, ...newSnapshot.data() });
              }
            } catch (err) {
              console.error('Error loading profile:', err);
            }
          } else {
            setUserProfile(null);
          }
          setLoading(false);
        });
      }

      return firebaseRef.current;
    } catch (error) {
      console.error('Firebase init error:', error);
      throw error;
    }
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, []);

  // Sign up
  async function signup(email, password, displayName) {
    setLoading(true);
    try {
      const { auth } = await ensureFirebase();
      const { createUserWithEmailAndPassword, updateProfile } = await import('firebase/auth');
      const result = await createUserWithEmailAndPassword(auth, email, password);
      if (displayName) {
        await updateProfile(result.user, { displayName });
      }
      return result;
    } catch (error) {
      setLoading(false);
      throw error;
    }
  }

  // Login
  async function login(email, password) {
    setLoading(true);
    try {
      const { auth } = await ensureFirebase();
      const { signInWithEmailAndPassword } = await import('firebase/auth');
      return await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      setLoading(false);
      throw error;
    }
  }

  // Google login
  async function loginWithGoogle() {
    setLoading(true);
    try {
      const { auth, googleProvider } = await ensureFirebase();
      const { signInWithPopup } = await import('firebase/auth');
      return await signInWithPopup(auth, googleProvider);
    } catch (error) {
      setLoading(false);
      throw error;
    }
  }

  // Logout
  async function logout() {
    if (!firebaseRef.current) return;
    try {
      const { signOut } = await import('firebase/auth');
      setUserProfile(null);
      await signOut(firebaseRef.current.auth);
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  // Password reset
  async function resetPassword(email) {
    const { auth } = await ensureFirebase();
    const { sendPasswordResetEmail } = await import('firebase/auth');
    return sendPasswordResetEmail(auth, email);
  }

  // Update profile
  async function updateUserProfile(data) {
    if (!firebaseRef.current || !currentUser) return;
    const { doc, getDoc, updateDoc } = await import('firebase/firestore');
    const userRef = doc(firebaseRef.current.db, 'users', currentUser.uid);
    await updateDoc(userRef, data);
    const snapshot = await getDoc(userRef);
    setUserProfile({ id: snapshot.id, ...snapshot.data() });
  }

  const value = {
    currentUser,
    userProfile,
    loading,
    authReady,
    signup,
    login,
    loginWithGoogle,
    logout,
    resetPassword,
    updateUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
