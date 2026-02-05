// Authentication Context for MODUS Trading
import { createContext, useContext, useState, useEffect } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, googleProvider } from '../firebase';

// Default values for when context isn't ready
const defaultContextValue = {
  currentUser: null,
  userProfile: null,
  loading: true,
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
  return context || defaultContextValue;
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Create/update user profile in Firestore
  async function createUserProfile(user, additionalData = {}) {
    if (!user) return;

    try {
      const userRef = doc(db, 'users', user.uid);
      const snapshot = await getDoc(userRef);

      if (!snapshot.exists()) {
        const { email, displayName, photoURL } = user;
        await setDoc(userRef, {
          email,
          displayName: displayName || additionalData.displayName || email?.split('@')[0] || 'User',
          photoURL: photoURL || null,
          createdAt: serverTimestamp(),
          lastLogin: serverTimestamp(),
          settings: {
            theme: 'dark',
            notifications: true
          },
          subscription: {
            plan: 'free',
            startDate: serverTimestamp()
          },
          ...additionalData
        });
      } else {
        await updateDoc(userRef, { lastLogin: serverTimestamp() });
      }

      const updatedSnapshot = await getDoc(userRef);
      setUserProfile({ id: updatedSnapshot.id, ...updatedSnapshot.data() });
    } catch (error) {
      console.error('Error with user profile:', error);
    }
  }

  // Sign up with email/password
  async function signup(email, password, displayName) {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    if (displayName) {
      await updateProfile(result.user, { displayName });
    }
    await createUserProfile(result.user, { displayName });
    return result;
  }

  // Login with email/password
  async function login(email, password) {
    const result = await signInWithEmailAndPassword(auth, email, password);
    await createUserProfile(result.user);
    return result;
  }

  // Login with Google
  async function loginWithGoogle() {
    const result = await signInWithPopup(auth, googleProvider);
    await createUserProfile(result.user);
    return result;
  }

  // Logout
  function logout() {
    setUserProfile(null);
    return signOut(auth);
  }

  // Password reset
  function resetPassword(email) {
    return sendPasswordResetEmail(auth, email);
  }

  // Update user profile
  async function updateUserProfile(data) {
    if (!currentUser) return;
    const userRef = doc(db, 'users', currentUser.uid);
    await updateDoc(userRef, data);
    const snapshot = await getDoc(userRef);
    setUserProfile({ id: snapshot.id, ...snapshot.data() });
  }

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);

      if (user) {
        try {
          const userRef = doc(db, 'users', user.uid);
          const snapshot = await getDoc(userRef);

          if (snapshot.exists()) {
            setUserProfile({ id: snapshot.id, ...snapshot.data() });
          } else {
            await createUserProfile(user);
          }
        } catch (error) {
          console.error('Error loading user profile:', error);
        }
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
    resetPassword,
    updateUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
