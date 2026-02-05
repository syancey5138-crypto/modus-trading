// Firestore Service for MODUS Trading - Cloud Data Sync
// Uses lazy initialization to prevent module loading issues
import { initFirebase } from '../firebase';

// Get Firestore instance lazily
async function getDb() {
  const { db } = await initFirebase();
  return db;
}

// Get Firestore utilities
async function getFirestoreUtils() {
  const [{ db }, firestore] = await Promise.all([
    initFirebase(),
    import('firebase/firestore')
  ]);
  return { db, ...firestore };
}

// =====================
// USER DATA SYNC
// =====================

// Save user's watchlist
export async function saveWatchlist(userId, watchlist) {
  const { db, doc, setDoc, serverTimestamp } = await getFirestoreUtils();
  const userDataRef = doc(db, 'userData', userId);
  await setDoc(userDataRef, { watchlist, updatedAt: serverTimestamp() }, { merge: true });
}

// Get user's watchlist
export async function getWatchlist(userId) {
  const { db, doc, getDoc } = await getFirestoreUtils();
  const userDataRef = doc(db, 'userData', userId);
  const snapshot = await getDoc(userDataRef);
  return snapshot.exists() ? snapshot.data().watchlist || [] : [];
}

// Save user's alerts
export async function saveAlerts(userId, alerts) {
  const { db, doc, setDoc, serverTimestamp } = await getFirestoreUtils();
  const userDataRef = doc(db, 'userData', userId);
  await setDoc(userDataRef, { alerts, updatedAt: serverTimestamp() }, { merge: true });
}

// Get user's alerts
export async function getAlerts(userId) {
  const { db, doc, getDoc } = await getFirestoreUtils();
  const userDataRef = doc(db, 'userData', userId);
  const snapshot = await getDoc(userDataRef);
  return snapshot.exists() ? snapshot.data().alerts || [] : [];
}

// Save user settings
export async function saveSettings(userId, settings) {
  const { db, doc, setDoc, serverTimestamp } = await getFirestoreUtils();
  const userDataRef = doc(db, 'userData', userId);
  await setDoc(userDataRef, { settings, updatedAt: serverTimestamp() }, { merge: true });
}

// Get user settings
export async function getSettings(userId) {
  const { db, doc, getDoc } = await getFirestoreUtils();
  const userDataRef = doc(db, 'userData', userId);
  const snapshot = await getDoc(userDataRef);
  return snapshot.exists() ? snapshot.data().settings || {} : {};
}

// =====================
// TRADE JOURNAL SYNC
// =====================

// Save all trades (batch update)
export async function saveTrades(userId, trades) {
  const { db, doc, setDoc, serverTimestamp } = await getFirestoreUtils();
  const userDataRef = doc(db, 'userData', userId);
  await setDoc(userDataRef, { trades, tradesUpdatedAt: serverTimestamp() }, { merge: true });
}

// Get all trades
export async function getTrades(userId) {
  const { db, doc, getDoc } = await getFirestoreUtils();
  const userDataRef = doc(db, 'userData', userId);
  const snapshot = await getDoc(userDataRef);
  return snapshot.exists() ? snapshot.data().trades || [] : [];
}

// Add single trade
export async function addTrade(userId, trade) {
  const trades = await getTrades(userId);
  trades.unshift({ ...trade, syncedAt: new Date().toISOString() });
  await saveTrades(userId, trades);
  return trades;
}

// Update single trade
export async function updateTrade(userId, tradeId, updates) {
  const trades = await getTrades(userId);
  const index = trades.findIndex(t => t.id === tradeId);
  if (index !== -1) {
    trades[index] = { ...trades[index], ...updates, syncedAt: new Date().toISOString() };
    await saveTrades(userId, trades);
  }
  return trades;
}

// Delete trade
export async function deleteTrade(userId, tradeId) {
  const trades = await getTrades(userId);
  const filtered = trades.filter(t => t.id !== tradeId);
  await saveTrades(userId, filtered);
  return filtered;
}

// =====================
// PAPER TRADING SYNC
// =====================

// Save paper trading account
export async function savePaperTradingAccount(userId, account) {
  const { db, doc, setDoc, serverTimestamp } = await getFirestoreUtils();
  const userDataRef = doc(db, 'userData', userId);
  await setDoc(userDataRef, { paperTradingAccount: account, updatedAt: serverTimestamp() }, { merge: true });
}

// Get paper trading account
export async function getPaperTradingAccount(userId) {
  const { db, doc, getDoc } = await getFirestoreUtils();
  const userDataRef = doc(db, 'userData', userId);
  const snapshot = await getDoc(userDataRef);
  return snapshot.exists() ? snapshot.data().paperTradingAccount || null : null;
}

// =====================
// ANALYSIS HISTORY SYNC
// =====================

// Save analysis history (limited to last 50 for performance)
export async function saveAnalysisHistory(userId, history) {
  const { db, doc, setDoc, serverTimestamp } = await getFirestoreUtils();
  const limitedHistory = history.slice(0, 50); // Keep only last 50
  const userDataRef = doc(db, 'userData', userId);
  await setDoc(userDataRef, { analysisHistory: limitedHistory, updatedAt: serverTimestamp() }, { merge: true });
}

// Get analysis history
export async function getAnalysisHistory(userId) {
  const { db, doc, getDoc } = await getFirestoreUtils();
  const userDataRef = doc(db, 'userData', userId);
  const snapshot = await getDoc(userDataRef);
  return snapshot.exists() ? snapshot.data().analysisHistory || [] : [];
}

// =====================
// FULL SYNC FUNCTIONS
// =====================

// Load all user data at once (for initial load)
export async function loadAllUserData(userId) {
  const { db, doc, getDoc } = await getFirestoreUtils();
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

// Save all user data at once (for logout/close sync)
export async function saveAllUserData(userId, data) {
  const { db, doc, setDoc, serverTimestamp } = await getFirestoreUtils();
  const userDataRef = doc(db, 'userData', userId);
  await setDoc(userDataRef, {
    ...data,
    updatedAt: serverTimestamp()
  }, { merge: true });
}

// Merge local and cloud data (for conflict resolution)
export function mergeData(localData, cloudData) {
  // Simple merge strategy: prefer newer timestamps, combine unique items
  const merged = {};

  // For arrays, combine and dedupe by id
  ['watchlist', 'alerts', 'trades'].forEach(key => {
    const localArr = localData[key] || [];
    const cloudArr = cloudData[key] || [];

    if (key === 'watchlist') {
      // Watchlist is just strings, merge unique
      merged[key] = [...new Set([...cloudArr, ...localArr])];
    } else {
      // Trades and alerts have ids, prefer cloud version but add local-only items
      const cloudIds = new Set(cloudArr.map(item => item.id));
      const localOnly = localArr.filter(item => !cloudIds.has(item.id));
      merged[key] = [...cloudArr, ...localOnly];
    }
  });

  // For objects, prefer cloud (more likely to be latest)
  merged.settings = { ...localData.settings, ...cloudData.settings };
  merged.paperTradingAccount = cloudData.paperTradingAccount || localData.paperTradingAccount;
  merged.analysisHistory = cloudData.analysisHistory?.length > localData.analysisHistory?.length
    ? cloudData.analysisHistory
    : localData.analysisHistory;

  return merged;
}
