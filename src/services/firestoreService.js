// Firestore Service for MODUS Trading - Cloud Data Sync
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

// Save user's watchlist
export async function saveWatchlist(userId, watchlist) {
  const userDataRef = doc(db, 'userData', userId);
  await setDoc(userDataRef, { watchlist, updatedAt: serverTimestamp() }, { merge: true });
}

// Get user's watchlist
export async function getWatchlist(userId) {
  const userDataRef = doc(db, 'userData', userId);
  const snapshot = await getDoc(userDataRef);
  return snapshot.exists() ? snapshot.data().watchlist || [] : [];
}

// Save user's alerts
export async function saveAlerts(userId, alerts) {
  const userDataRef = doc(db, 'userData', userId);
  await setDoc(userDataRef, { alerts, updatedAt: serverTimestamp() }, { merge: true });
}

// Get user's alerts
export async function getAlerts(userId) {
  const userDataRef = doc(db, 'userData', userId);
  const snapshot = await getDoc(userDataRef);
  return snapshot.exists() ? snapshot.data().alerts || [] : [];
}

// Save all trades
export async function saveTrades(userId, trades) {
  const userDataRef = doc(db, 'userData', userId);
  await setDoc(userDataRef, { trades, tradesUpdatedAt: serverTimestamp() }, { merge: true });
}

// Get all trades
export async function getTrades(userId) {
  const userDataRef = doc(db, 'userData', userId);
  const snapshot = await getDoc(userDataRef);
  return snapshot.exists() ? snapshot.data().trades || [] : [];
}

// Save paper trading account
export async function savePaperTradingAccount(userId, account) {
  const userDataRef = doc(db, 'userData', userId);
  await setDoc(userDataRef, { paperTradingAccount: account, updatedAt: serverTimestamp() }, { merge: true });
}

// Get paper trading account
export async function getPaperTradingAccount(userId) {
  const userDataRef = doc(db, 'userData', userId);
  const snapshot = await getDoc(userDataRef);
  return snapshot.exists() ? snapshot.data().paperTradingAccount || null : null;
}

// Save analysis history (limited to 50)
export async function saveAnalysisHistory(userId, history) {
  const limitedHistory = history.slice(0, 50);
  const userDataRef = doc(db, 'userData', userId);
  await setDoc(userDataRef, { analysisHistory: limitedHistory, updatedAt: serverTimestamp() }, { merge: true });
}

// Get analysis history
export async function getAnalysisHistory(userId) {
  const userDataRef = doc(db, 'userData', userId);
  const snapshot = await getDoc(userDataRef);
  return snapshot.exists() ? snapshot.data().analysisHistory || [] : [];
}

// Load all user data at once
export async function loadAllUserData(userId) {
  const userDataRef = doc(db, 'userData', userId);
  const snapshot = await getDoc(userDataRef);

  if (!snapshot.exists()) {
    return {
      watchlist: [],
      alerts: [],
      trades: [],
      paperTradingAccount: null,
      analysisHistory: [],
      settings: {}
    };
  }

  const data = snapshot.data();
  return {
    watchlist: data.watchlist || [],
    alerts: data.alerts || [],
    trades: data.trades || [],
    paperTradingAccount: data.paperTradingAccount || null,
    analysisHistory: data.analysisHistory || [],
    settings: data.settings || {}
  };
}

// Save all user data at once
export async function saveAllUserData(userId, data) {
  const userDataRef = doc(db, 'userData', userId);
  await setDoc(userDataRef, {
    ...data,
    updatedAt: serverTimestamp()
  }, { merge: true });
}
