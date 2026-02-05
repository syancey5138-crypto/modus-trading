// Firestore Service for MODUS Trading - Cloud Data Sync
// NO top-level Firebase imports - everything is lazy loaded

const firebaseConfig = {
  apiKey: "AIzaSyA4ksU15ugGpW0QmW8aYsZkN5__0u0NT_8",
  authDomain: "modus-trading.firebaseapp.com",
  projectId: "modus-trading",
  storageBucket: "modus-trading.firebasestorage.app",
  messagingSenderId: "463668228895",
  appId: "1:463668228895:web:861081df478f57cb30762a"
};

let cachedDb = null;

// Get Firestore instance lazily
async function getFirestoreDb() {
  if (cachedDb) return cachedDb;

  const { initializeApp, getApps } = await import('firebase/app');
  const { getFirestore } = await import('firebase/firestore');

  // Check if app already exists
  const apps = getApps();
  const app = apps.length > 0 ? apps[0] : initializeApp(firebaseConfig);
  cachedDb = getFirestore(app);

  return cachedDb;
}

// =====================
// USER DATA SYNC
// =====================

export async function saveWatchlist(userId, watchlist) {
  const db = await getFirestoreDb();
  const { doc, setDoc, serverTimestamp } = await import('firebase/firestore');
  const userDataRef = doc(db, 'userData', userId);
  await setDoc(userDataRef, { watchlist, updatedAt: serverTimestamp() }, { merge: true });
}

export async function getWatchlist(userId) {
  const db = await getFirestoreDb();
  const { doc, getDoc } = await import('firebase/firestore');
  const userDataRef = doc(db, 'userData', userId);
  const snapshot = await getDoc(userDataRef);
  return snapshot.exists() ? snapshot.data().watchlist || [] : [];
}

export async function saveAlerts(userId, alerts) {
  const db = await getFirestoreDb();
  const { doc, setDoc, serverTimestamp } = await import('firebase/firestore');
  const userDataRef = doc(db, 'userData', userId);
  await setDoc(userDataRef, { alerts, updatedAt: serverTimestamp() }, { merge: true });
}

export async function getAlerts(userId) {
  const db = await getFirestoreDb();
  const { doc, getDoc } = await import('firebase/firestore');
  const userDataRef = doc(db, 'userData', userId);
  const snapshot = await getDoc(userDataRef);
  return snapshot.exists() ? snapshot.data().alerts || [] : [];
}

export async function saveSettings(userId, settings) {
  const db = await getFirestoreDb();
  const { doc, setDoc, serverTimestamp } = await import('firebase/firestore');
  const userDataRef = doc(db, 'userData', userId);
  await setDoc(userDataRef, { settings, updatedAt: serverTimestamp() }, { merge: true });
}

export async function getSettings(userId) {
  const db = await getFirestoreDb();
  const { doc, getDoc } = await import('firebase/firestore');
  const userDataRef = doc(db, 'userData', userId);
  const snapshot = await getDoc(userDataRef);
  return snapshot.exists() ? snapshot.data().settings || {} : {};
}

// =====================
// TRADE JOURNAL SYNC
// =====================

export async function saveTrades(userId, trades) {
  const db = await getFirestoreDb();
  const { doc, setDoc, serverTimestamp } = await import('firebase/firestore');
  const userDataRef = doc(db, 'userData', userId);
  await setDoc(userDataRef, { trades, tradesUpdatedAt: serverTimestamp() }, { merge: true });
}

export async function getTrades(userId) {
  const db = await getFirestoreDb();
  const { doc, getDoc } = await import('firebase/firestore');
  const userDataRef = doc(db, 'userData', userId);
  const snapshot = await getDoc(userDataRef);
  return snapshot.exists() ? snapshot.data().trades || [] : [];
}

export async function addTrade(userId, trade) {
  const trades = await getTrades(userId);
  trades.unshift({ ...trade, syncedAt: new Date().toISOString() });
  await saveTrades(userId, trades);
  return trades;
}

export async function updateTrade(userId, tradeId, updates) {
  const trades = await getTrades(userId);
  const index = trades.findIndex(t => t.id === tradeId);
  if (index !== -1) {
    trades[index] = { ...trades[index], ...updates, syncedAt: new Date().toISOString() };
    await saveTrades(userId, trades);
  }
  return trades;
}

export async function deleteTrade(userId, tradeId) {
  const trades = await getTrades(userId);
  const filtered = trades.filter(t => t.id !== tradeId);
  await saveTrades(userId, filtered);
  return filtered;
}

// =====================
// PAPER TRADING SYNC
// =====================

export async function savePaperTradingAccount(userId, account) {
  const db = await getFirestoreDb();
  const { doc, setDoc, serverTimestamp } = await import('firebase/firestore');
  const userDataRef = doc(db, 'userData', userId);
  await setDoc(userDataRef, { paperTradingAccount: account, updatedAt: serverTimestamp() }, { merge: true });
}

export async function getPaperTradingAccount(userId) {
  const db = await getFirestoreDb();
  const { doc, getDoc } = await import('firebase/firestore');
  const userDataRef = doc(db, 'userData', userId);
  const snapshot = await getDoc(userDataRef);
  return snapshot.exists() ? snapshot.data().paperTradingAccount || null : null;
}

// =====================
// ANALYSIS HISTORY SYNC
// =====================

export async function saveAnalysisHistory(userId, history) {
  const db = await getFirestoreDb();
  const { doc, setDoc, serverTimestamp } = await import('firebase/firestore');
  const limitedHistory = history.slice(0, 50);
  const userDataRef = doc(db, 'userData', userId);
  await setDoc(userDataRef, { analysisHistory: limitedHistory, updatedAt: serverTimestamp() }, { merge: true });
}

export async function getAnalysisHistory(userId) {
  const db = await getFirestoreDb();
  const { doc, getDoc } = await import('firebase/firestore');
  const userDataRef = doc(db, 'userData', userId);
  const snapshot = await getDoc(userDataRef);
  return snapshot.exists() ? snapshot.data().analysisHistory || [] : [];
}

// =====================
// FULL SYNC FUNCTIONS
// =====================

export async function loadAllUserData(userId) {
  const db = await getFirestoreDb();
  const { doc, getDoc } = await import('firebase/firestore');
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

export async function saveAllUserData(userId, data) {
  const db = await getFirestoreDb();
  const { doc, setDoc, serverTimestamp } = await import('firebase/firestore');
  const userDataRef = doc(db, 'userData', userId);
  await setDoc(userDataRef, {
    ...data,
    updatedAt: serverTimestamp()
  }, { merge: true });
}

// Merge local and cloud data (sync helper - no Firebase needed)
export function mergeData(localData, cloudData) {
  const merged = {};

  ['watchlist', 'alerts', 'trades'].forEach(key => {
    const localArr = localData[key] || [];
    const cloudArr = cloudData[key] || [];

    if (key === 'watchlist') {
      merged[key] = [...new Set([...cloudArr, ...localArr])];
    } else {
      const cloudIds = new Set(cloudArr.map(item => item.id));
      const localOnly = localArr.filter(item => !cloudIds.has(item.id));
      merged[key] = [...cloudArr, ...localOnly];
    }
  });

  merged.settings = { ...localData.settings, ...cloudData.settings };
  merged.paperTradingAccount = cloudData.paperTradingAccount || localData.paperTradingAccount;
  merged.analysisHistory = cloudData.analysisHistory?.length > localData.analysisHistory?.length
    ? cloudData.analysisHistory
    : localData.analysisHistory;

  return merged;
}
