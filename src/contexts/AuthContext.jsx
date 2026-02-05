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

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Create user profile in Firestore
  async function createUserProfile(user, additionalData = {}) {
    if (!user) return;

    const userRef = doc(db, 'users', user.uid);
    const snapshot = await getDoc(userRef);

    if (!snapshot.exists()) {
      const { email, displayName, photoURL } = user;
      try {
        await setDoc(userRef, {
          email,
          displayName: displayName || additionalData.displayName || email.split('@')[0],
          photoURL: photoURL || null,
          createdAt: serverTimestamp(),
          lastLogin: serverTimestamp(),
          // Default user data
          settings: {
            theme: 'dark',
            notifications: true,
            defaultTradeType: 'swing'
          },
          subscription: {
            plan: 'free',
            startDate: serverTimestamp(),
            endDate: null
          },
          ...additionalData
        });
      } catch (error) {
        console.error('Error creating user profile:', error);
      }
    } else {
      // Update last login
      await updateDoc(userRef, { lastLogin: serverTimestamp() });
    }

    // Fetch and set user profile
    const updatedSnapshot = await getDoc(userRef);
    setUserProfile({ id: updatedSnapshot.id, ...updatedSnapshot.data() });
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

    // Refresh profile
    const snapshot = await getDoc(userRef);
    setUserProfile({ id: snapshot.id, ...snapshot.data() });
  }

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);

      if (user) {
        // Fetch user profile from Firestore
        const userRef = doc(db, 'users', user.uid);
        const snapshot = await getDoc(userRef);

        if (snapshot.exists()) {
          setUserProfile({ id: snapshot.id, ...snapshot.data() });
        } else {
          // Create profile if it doesn't exist
          await createUserProfile(user);
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
      {!loading && children}
    </AuthContext.Provider>
  );
}
