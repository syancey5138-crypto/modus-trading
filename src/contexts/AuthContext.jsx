// Authentication Context for MODUS Trading
import { createContext, useContext, useState, useEffect } from 'react';
import { initFirebase } from '../firebase';

// Default context value to prevent undefined errors
const defaultContextValue = {
  currentUser: null,
  userProfile: null,
  loading: true,
  authReady: false,
  signup: async () => {},
  login: async () => {},
  loginWithGoogle: async () => {},
  logout: async () => {},
  resetPassword: async () => {},
  updateUserProfile: async () => {}
};

const AuthContext = createContext(defaultContextValue);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    console.warn('useAuth must be used within an AuthProvider');
    return defaultContextValue;
  }
  return context;
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authReady, setAuthReady] = useState(false);
  const [firebaseServices, setFirebaseServices] = useState(null);

  // Initialize Firebase on mount
  useEffect(() => {
    let unsubscribe = () => {};

    async function initialize() {
      try {
        const services = await initFirebase();
        setFirebaseServices(services);

        // Dynamic imports for Firebase auth functions
        const { onAuthStateChanged } = await import('firebase/auth');
        const { doc, getDoc, setDoc, updateDoc, serverTimestamp } = await import('firebase/firestore');

        unsubscribe = onAuthStateChanged(services.auth, async (user) => {
          setCurrentUser(user);

          if (user) {
            try {
              const userRef = doc(services.db, 'users', user.uid);
              const snapshot = await getDoc(userRef);

              if (snapshot.exists()) {
                setUserProfile({ id: snapshot.id, ...snapshot.data() });
              } else {
                // Create new user profile
                const { email, displayName, photoURL } = user;
                await setDoc(userRef, {
                  email,
                  displayName: displayName || email?.split('@')[0] || 'User',
                  photoURL: photoURL || null,
                  createdAt: serverTimestamp(),
                  lastLogin: serverTimestamp(),
                  settings: {
                    theme: 'dark',
                    notifications: true,
                    defaultTradeType: 'swing'
                  },
                  subscription: {
                    plan: 'free',
                    startDate: serverTimestamp(),
                    endDate: null
                  }
                });
                const newSnapshot = await getDoc(userRef);
                setUserProfile({ id: newSnapshot.id, ...newSnapshot.data() });
              }
            } catch (error) {
              console.error('Error loading user profile:', error);
            }
          } else {
            setUserProfile(null);
          }

          setLoading(false);
          setAuthReady(true);
        });
      } catch (error) {
        console.error('Firebase initialization error:', error);
        setLoading(false);
        setAuthReady(true);
      }
    }

    initialize();

    return () => unsubscribe();
  }, []);

  // Sign up with email/password
  async function signup(email, password, displayName) {
    if (!firebaseServices) throw new Error('Firebase not ready');

    const { createUserWithEmailAndPassword, updateProfile } = await import('firebase/auth');
    const result = await createUserWithEmailAndPassword(firebaseServices.auth, email, password);

    if (displayName) {
      await updateProfile(result.user, { displayName });
    }

    return result;
  }

  // Login with email/password
  async function login(email, password) {
    if (!firebaseServices) throw new Error('Firebase not ready');

    const { signInWithEmailAndPassword } = await import('firebase/auth');
    return signInWithEmailAndPassword(firebaseServices.auth, email, password);
  }

  // Login with Google
  async function loginWithGoogle() {
    if (!firebaseServices) throw new Error('Firebase not ready');

    const { signInWithPopup } = await import('firebase/auth');
    return signInWithPopup(firebaseServices.auth, firebaseServices.googleProvider);
  }

  // Logout
  async function logout() {
    if (!firebaseServices) throw new Error('Firebase not ready');

    const { signOut } = await import('firebase/auth');
    setUserProfile(null);
    return signOut(firebaseServices.auth);
  }

  // Password reset
  async function resetPassword(email) {
    if (!firebaseServices) throw new Error('Firebase not ready');

    const { sendPasswordResetEmail } = await import('firebase/auth');
    return sendPasswordResetEmail(firebaseServices.auth, email);
  }

  // Update user profile
  async function updateUserProfile(data) {
    if (!firebaseServices || !currentUser) return;

    const { doc, getDoc, updateDoc } = await import('firebase/firestore');
    const userRef = doc(firebaseServices.db, 'users', currentUser.uid);
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
