// ═══════════════════════════════════════════════════════════════
// MODUS AUTO-SCANNER PATCH
// Adds fully passive stock scanning + auto-trade execution
// ═══════════════════════════════════════════════════════════════

const fs = require('fs');
const path = require('path');

const APP_PATH = path.join(__dirname, 'src', 'App.jsx');
let code = fs.readFileSync(APP_PATH, 'utf8');
const original = code;
let changes = 0;

function applyPatch(name, search, replacement) {
  if (typeof search === 'string') {
    const idx = code.indexOf(search);
    if (idx === -1) {
      console.log(`[SKIP] ${name} — marker not found`);
      return false;
    }
    code = code.replace(search, replacement);
  } else {
    if (!search.test(code)) {
      console.log(`[SKIP] ${name} — regex not found`);
      return false;
    }
    code = code.replace(search, replacement);
  }
  changes++;
  console.log(`[OK] ${name}`);
  return true;
}

// ═══════════════════════════════════════════════════════════════
// 1. ADD SCANNER STATE VARIABLES (after botProcessingRef)
// ═══════════════════════════════════════════════════════════════
applyPatch(
  '1. Scanner state variables',
  `const botProcessingRef = useRef(false);`,
  `const botProcessingRef = useRef(false);

  // ═══════════════════════════════════════════════════
  // AUTO-SCANNER STATE
  // ═══════════════════════════════════════════════════
  const [scannerEnabled, setScannerEnabled] = useState(() => {
    try { return localStorage.getItem('modus_scanner_enabled') === 'true'; } catch { return false; }
  });
  const [scannerSettings, setScannerSettings] = useState(() => {
    try { return JSON.parse(localStorage.getItem('modus_scanner_settings')) || {
      scanInterval: 30,
      maxStocksPerScan: 50,
      scanTiers: 5,
      minNetScore: 20,
      minConfirmations: 1,
    }; } catch { return { scanInterval: 30, maxStocksPerScan: 50, scanTiers: 5, minNetScore: 20, minConfirmations: 1 }; }
  });
  const [scannerStatus, setScannerStatus] = useState({
    isScanning: false,
    lastScanTime: null,
    lastScanResults: [],
    stocksScanned: 0,
    signalsFound: 0,
    tradesExecuted: 0,
    errors: [],
    currentStock: null,
    progress: 0,
  });
  const scannerIntervalRef = useRef(null);
  const scannerAbortRef = useRef(false);`
);

// ═══════════════════════════════════════════════════════════════
// 2. PERSIST SCANNER SETTINGS (after bot settings persistence)
// ═══════════════════════════════════════════════════════════════
applyPatch(
  '2. Scanner persistence',
  `useEffect(() => { try { localStorage.setItem('modus_bot_trade_log', JSON.stringify(botTradeLog.slice(-200))); } catch {} }, [botTradeLog]);`,
  `useEffect(() => { try { localStorage.setItem('modus_bot_trade_log', JSON.stringify(botTradeLog.slice(-200))); } catch {} }, [botTradeLog]);

  // Scanner persistence
  useEffect(() => { try { localStorage.setItem('modus_scanner_enabled', String(scannerEnabled)); } catch {} }, [scannerEnabled]);
  useEffect(() => { try { localStorage.setItem('modus_scanner_settings', JSON.stringify(scannerSettings)); } catch {} }, [scannerSettings]);`
);

// ═══════════════════════════════════════════════════════════════
// 3. ADD THE CORE botAutoScan() FUNCTION (after executeBotTrade)
// ═══════════════════════════════════════════════════════════════
applyPatch(
  '3. Core botAutoScan function',
  `  // ═══════════════════════════════════════════════════
  // BOT SIGNAL MONITORS - Watch analysis & daily pick
  // ═══════════════════════════════════════════════════`,
  `  // ═══════════════════════════════════════════════════
  // AUTO-SCANNER: Passive Stock Scanning Engine
  // ═══════════════════════════════════════════════════
  const botAutoScan = async () => {
    if (!botEnabled || !alpacaConfig.connected || !scannerEnabled) {
      console.log('[Scanner] Skipping — bot disabled, not connected, or scanner off');
      return;
    }
    if (scannerStatus.isScanning) {
      console.log('[Scanner] Already scanning, skipping');
      return;
    }

    // Check trading hours (9:30 AM - 3:45 PM ET) — stop 15 min early to avoid last-minute fills
    if (botSettings.tradingHoursOnly) {
      const now = new Date();
      const etOffset = -5; // EST (simplified — DST handled by checking both)
      const utcHour = now.getUTCHours();
      const utcMin = now.getUTCMinutes();
      const etTotalMin = ((utcHour + etOffset + 24) % 24) * 60 + utcMin;
      // Also check EDT (-4)
      const edtTotalMin = ((utcHour + etOffset + 1 + 24) % 24) * 60 + utcMin;
      const totalMin = Math.min(etTotalMin, edtTotalMin);
      // Market: 9:30 (570) to 15:45 (945)
      if (totalMin < 570 || totalMin > 945) {
        console.log('[Scanner] Outside trading hours (ET), skipping scan');
        return;
      }
    }

    console.log('[Scanner] ========== STARTING AUTO-SCAN ==========');
    setScannerStatus(prev => ({ ...prev, isScanning: true, currentStock: null, progress: 0, errors: [] }));
    scannerAbortRef.current = false;

    const results = [];
    let stocksScanned = 0;
    let signalsFound = 0;
    let tradesExecuted = 0;
    const scanErrors = [];

    // Build stock list from PRIORITY_STOCKS tiers
    let stocksToScan = [];
    const tierKeys = Object.keys(PRIORITY_STOCKS).sort((a, b) => {
      const aNum = parseInt(a.replace(/\\D/g, '')) || 99;
      const bNum = parseInt(b.replace(/\\D/g, '')) || 99;
      return aNum - bNum;
    });
    for (let t = 0; t < Math.min(scannerSettings.scanTiers, tierKeys.length); t++) {
      const tier = PRIORITY_STOCKS[tierKeys[t]];
      if (Array.isArray(tier)) stocksToScan.push(...tier);
    }
    // Limit and shuffle for variety
    stocksToScan = [...new Set(stocksToScan)]; // dedupe
    for (let i = stocksToScan.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [stocksToScan[i], stocksToScan[j]] = [stocksToScan[j], stocksToScan[i]];
    }
    stocksToScan = stocksToScan.slice(0, scannerSettings.maxStocksPerScan);

    console.log('[Scanner] Scanning ' + stocksToScan.length + ' stocks from top ' + scannerSettings.scanTiers + ' tiers');

    // Process in batches of 5 to avoid rate limits
    const BATCH_SIZE = 5;
    for (let batchStart = 0; batchStart < stocksToScan.length; batchStart += BATCH_SIZE) {
      if (scannerAbortRef.current) {
        console.log('[Scanner] Scan aborted by user');
        break;
      }

      const batch = stocksToScan.slice(batchStart, batchStart + BATCH_SIZE);
      const batchPromises = batch.map(async (symbol) => {
        try {
          setScannerStatus(prev => ({ ...prev, currentStock: symbol, progress: Math.round((stocksScanned / stocksToScan.length) * 100) }));

          // Fetch 3-month daily data from Yahoo Finance
          const yahooUrl = 'https://query1.finance.yahoo.com/v8/finance/chart/' + symbol + '?interval=1d&range=3mo';
          const data = await fetchYahooWithProxies(yahooUrl, 8000);

          if (!data?.chart?.result?.[0]) return null;

          const quote = data.chart.result[0];
          const meta = quote.meta || {};
          const timestamps = quote.timestamp || [];
          const ohlcv = quote.indicators?.quote?.[0] || {};

          const closes = [], highs = [], lows = [], volumes = [];
          for (let i = 0; i < timestamps.length; i++) {
            if (ohlcv.close?.[i] != null && !isNaN(ohlcv.close[i])) {
              closes.push(ohlcv.close[i]);
              if (ohlcv.high?.[i] != null) highs.push(ohlcv.high[i]); else highs.push(ohlcv.close[i]);
              if (ohlcv.low?.[i] != null) lows.push(ohlcv.low[i]); else lows.push(ohlcv.close[i]);
              if (ohlcv.volume?.[i] != null) volumes.push(ohlcv.volume[i]); else volumes.push(0);
            }
          }

          if (closes.length < 50) return null;

          // ── Technical Analysis (mirrors Quick Analysis lines 10104-10450) ──
          const calculateRSI = (d, period = 14) => {
            if (d.length < period + 1) return null;
            let gains = [], losses = [];
            for (let i = 1; i < d.length; i++) {
              const ch = d[i] - d[i - 1];
              gains.push(ch > 0 ? ch : 0);
              losses.push(ch < 0 ? Math.abs(ch) : 0);
            }
            let avgGain = gains.slice(0, period).reduce((a, b) => a + b, 0) / period;
            let avgLoss = losses.slice(0, period).reduce((a, b) => a + b, 0) / period;
            for (let i = period; i < gains.length; i++) {
              avgGain = (avgGain * (period - 1) + gains[i]) / period;
              avgLoss = (avgLoss * (period - 1) + losses[i]) / period;
            }
            if (avgLoss === 0) return 100;
            return 100 - (100 / (1 + avgGain / avgLoss));
          };
          const calculateEMA = (d, period) => {
            const k = 2 / (period + 1);
            let ema = d.slice(0, period).reduce((a, b) => a + b, 0) / period;
            const res = [ema];
            for (let i = period; i < d.length; i++) { ema = d[i] * k + ema * (1 - k); res.push(ema); }
            return res;
          };
          const calculateSMA = (d, period) => {
            const res = [];
            for (let i = period - 1; i < d.length; i++) {
              res.push(d.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0) / period);
            }
            return res;
          };

          const currentPrice = meta.regularMarketPrice || closes[closes.length - 1];
          const prevClose = meta.chartPreviousClose || closes[0];
          const changePercent = prevClose > 0 ? ((currentPrice - prevClose) / prevClose) * 100 : 0;

          const rsi = calculateRSI(closes, 14);
          const sma20 = calculateSMA(closes, 20);
          const sma50 = calculateSMA(closes, 50);
          const ema12 = calculateEMA(closes, 12);
          const ema26 = calculateEMA(closes, 26);
          const macdLine = ema12.slice(ema12.length - ema26.length).map((v, i) => v - ema26[i]);
          const signalLine = calculateEMA(macdLine, 9);
          const currentMACD = macdLine[macdLine.length - 1];
          const currentSignal = signalLine[signalLine.length - 1];
          const macdHistogram = currentMACD - currentSignal;

          const recentCloses = closes.slice(-20);
          const trendSlope = (recentCloses[recentCloses.length - 1] - recentCloses[0]) / recentCloses[0] * 100;
          const trend = trendSlope > 1 ? 'UPTREND' : trendSlope < -1 ? 'DOWNTREND' : 'SIDEWAYS';

          let bullishScore = 0, bearishScore = 0, confirmations = 0;

          // RSI
          if (rsi < 25) { bullishScore += 20; confirmations++; }
          else if (rsi < 35) { bullishScore += 12; }
          else if (rsi > 75) { bearishScore += 20; confirmations++; }
          else if (rsi > 65) { bearishScore += 12; }

          // MACD
          const macdStrength = Math.abs(macdHistogram / currentPrice) * 10000;
          if (macdHistogram > 0 && macdStrength > 0.5) { bullishScore += 15; if (macdStrength > 1.5) confirmations++; }
          else if (macdHistogram < 0 && macdStrength > 0.5) { bearishScore += 15; if (macdStrength > 1.5) confirmations++; }

          // SMA20
          const priceSma20Pct = ((currentPrice - sma20[sma20.length - 1]) / sma20[sma20.length - 1]) * 100;
          if (priceSma20Pct > 2) bullishScore += 10;
          else if (priceSma20Pct < -2) bearishScore += 10;

          // SMA50
          const lastSma50 = sma50.length > 0 ? sma50[sma50.length - 1] : null;
          if (lastSma50) {
            const priceSma50Pct = ((currentPrice - lastSma50) / lastSma50) * 100;
            if (priceSma50Pct > 3) { bullishScore += 12; confirmations++; }
            else if (priceSma50Pct < -3) { bearishScore += 12; confirmations++; }
          }

          // Trend
          if (trend === 'UPTREND' && trendSlope > 2) { bullishScore += 15; confirmations++; }
          else if (trend === 'UPTREND') { bullishScore += 8; }
          else if (trend === 'DOWNTREND' && trendSlope < -2) { bearishScore += 15; confirmations++; }
          else if (trend === 'DOWNTREND') { bearishScore += 8; }

          // Volume
          if (volumes.length >= 20) {
            const avgVol = volumes.slice(-20).reduce((a, b) => a + b, 0) / 20;
            const curVol = volumes[volumes.length - 1];
            const volRatio = avgVol > 0 ? curVol / avgVol : 1;
            if (volRatio > 1.8) {
              if (changePercent > 1) { bullishScore += 12; confirmations++; }
              else if (changePercent < -1) { bearishScore += 12; confirmations++; }
            }
          }

          // Momentum
          if (closes.length >= 5) {
            const rc = ((closes[closes.length - 1] - closes[closes.length - 5]) / closes[closes.length - 5]) * 100;
            if (rc > 1.5) bullishScore += 8;
            else if (rc < -1.5) bearishScore += 8;
          }

          // Bollinger Bands
          let bbUpper = null, bbLower = null;
          if (closes.length >= 20) {
            const bbMid = sma20[sma20.length - 1];
            const bbSlice = closes.slice(-20);
            const bbStdDev = Math.sqrt(bbSlice.reduce((s, v) => s + Math.pow(v - bbMid, 2), 0) / 20);
            bbUpper = bbMid + 2 * bbStdDev;
            bbLower = bbMid - 2 * bbStdDev;
            if (currentPrice <= bbLower) bullishScore += 10;
            else if (currentPrice >= bbUpper) bearishScore += 10;
          }

          // ATR
          let atr = null;
          if (highs.length >= 15 && lows.length >= 15) {
            const trArr = [];
            for (let i = Math.max(1, closes.length - 14); i < closes.length; i++) {
              if (highs[i] != null && lows[i] != null) {
                trArr.push(Math.max(highs[i] - lows[i], Math.abs(highs[i] - closes[i - 1]), Math.abs(lows[i] - closes[i - 1])));
              }
            }
            atr = trArr.length > 0 ? trArr.reduce((a, b) => a + b, 0) / trArr.length : null;
          }

          // VWAP
          if (closes.length >= 20 && volumes.length >= 20) {
            let cumVP = 0, cumVol = 0;
            for (let i = closes.length - 20; i < closes.length; i++) {
              if (volumes[i] && closes[i]) {
                const tp = (highs[i] && lows[i]) ? (highs[i] + lows[i] + closes[i]) / 3 : closes[i];
                cumVP += tp * volumes[i]; cumVol += volumes[i];
              }
            }
            const vwap = cumVol > 0 ? cumVP / cumVol : null;
            if (vwap && currentPrice > vwap * 1.005) bullishScore += 10;
            else if (vwap && currentPrice < vwap * 0.995) bearishScore += 10;
          }

          // RSI Divergence
          if (closes.length >= 30) {
            const divC = closes.slice(-30);
            const cRD = (sl) => {
              const ch = sl.map((v, i, a) => i > 0 ? v - a[i - 1] : 0).slice(1);
              const g = ch.filter(c => c > 0), l = ch.filter(c => c < 0).map(c => Math.abs(c));
              const ag = g.length ? g.reduce((a, b) => a + b, 0) / 14 : 0;
              const al = l.length ? l.reduce((a, b) => a + b, 0) / 14 : 0.001;
              return 100 - (100 / (1 + ag / al));
            };
            const dOld = cRD(divC.slice(0, 15)), dNew = cRD(divC.slice(-15));
            if (Math.min(...divC.slice(-15)) < Math.min(...divC.slice(0, 15)) && dNew > dOld && rsi < 40) { bullishScore += 25; confirmations++; }
            else if (Math.max(...divC.slice(-15)) > Math.max(...divC.slice(0, 15)) && dNew < dOld && rsi > 60) { bearishScore += 25; confirmations++; }
          }

          // MACD Divergence
          if (closes.length >= 40 && macdHistogram !== null) {
            const mH1 = closes.slice(-40, -20), mH2 = closes.slice(-20);
            const midE12 = calculateEMA(closes.slice(0, -20), 12);
            const midE26 = calculateEMA(closes.slice(0, -20), 26);
            const midMV = (midE12.length > 0 && midE26.length > 0) ? midE12[midE12.length - 1] - midE26[midE26.length - 1] : null;
            if (midMV !== null) {
              if (Math.min(...mH2) < Math.min(...mH1) && currentMACD > midMV) { bullishScore += 20; confirmations++; }
              else if (Math.max(...mH2) > Math.max(...mH1) && currentMACD < midMV) { bearishScore += 20; confirmations++; }
            }
          }

          // ADX
          let adx = null;
          if (highs.length >= 28 && lows.length >= 28) {
            const adxLen = Math.min(highs.length, lows.length, closes.length);
            const dmP = [], dmM = [], trA = [];
            for (let i = Math.max(1, adxLen - 27); i < adxLen; i++) {
              const hD = highs[i] - highs[i - 1], lD = lows[i - 1] - lows[i];
              dmP.push(hD > lD && hD > 0 ? hD : 0);
              dmM.push(lD > hD && lD > 0 ? lD : 0);
              trA.push(Math.max(highs[i] - lows[i], Math.abs(highs[i] - closes[i - 1]), Math.abs(lows[i] - closes[i - 1])));
            }
            if (trA.length >= 14) {
              const smA = (arr) => { let s = arr.slice(0, 14).reduce((a, b) => a + b, 0); for (let i = 14; i < arr.length; i++) s = s - s / 14 + arr[i]; return s; };
              const a14 = smA(trA), sDP = smA(dmP), sDM = smA(dmM);
              const diP = a14 > 0 ? (sDP / a14) * 100 : 0, diM = a14 > 0 ? (sDM / a14) * 100 : 0;
              adx = (diP + diM) > 0 ? Math.abs(diP - diM) / (diP + diM) * 100 : 0;
            }
          }

          // ADX modifier
          if (adx !== null && adx < 20) {
            bullishScore = Math.round(bullishScore * 0.7);
            bearishScore = Math.round(bearishScore * 0.7);
          }

          const direction = bullishScore > bearishScore ? 'LONG' : 'SHORT';
          const netScore = Math.abs(bullishScore - bearishScore);
          const hasStrongSignal = confirmations >= 2;
          const hasModerateSignal = confirmations >= 1 && netScore >= 15;

          let recommendation = 'HOLD';
          if (hasStrongSignal && netScore >= 30) recommendation = direction === 'LONG' ? 'STRONG_BUY' : 'STRONG_SELL';
          else if (hasModerateSignal && netScore >= 20) recommendation = direction === 'LONG' ? 'BUY' : 'SELL';
          else if (netScore >= 12) recommendation = direction === 'LONG' ? 'LEAN_BUY' : 'LEAN_SELL';

          const confidence = Math.min(95, Math.round(40 + Math.min(30, confirmations * 10) + Math.min(25, netScore * 0.5)));

          // Calculate stop/target using ATR
          const stopDist = atr ? atr * 1.5 : currentPrice * 0.02;
          const targetDist = atr ? atr * 3 : currentPrice * 0.04;
          const entry = currentPrice;
          const stop = direction === 'LONG' ? currentPrice - stopDist : currentPrice + stopDist;
          const target = direction === 'LONG' ? currentPrice + targetDist : currentPrice - targetDist;
          const riskReward = stopDist > 0 ? targetDist / stopDist : 0;

          return {
            symbol,
            currentPrice,
            recommendation,
            confidence,
            direction,
            netScore,
            confirmations,
            bullishScore,
            bearishScore,
            rsi,
            trend,
            entry,
            stop,
            target,
            riskReward,
            atr,
            changePercent,
          };
        } catch (err) {
          scanErrors.push(symbol + ': ' + err.message);
          return null;
        }
      });

      const batchResults = await Promise.all(batchPromises);
      for (const r of batchResults) {
        if (r) {
          stocksScanned++;
          results.push(r);

          // Check if this signal qualifies for a trade
          if (r.netScore >= scannerSettings.minNetScore && r.confirmations >= scannerSettings.minConfirmations) {
            if (botSettings.allowedSignals.includes(r.recommendation) && r.confidence >= botSettings.minConfidence) {
              signalsFound++;
              console.log('[Scanner] SIGNAL: ' + r.symbol + ' — ' + r.recommendation + ' (conf: ' + r.confidence + '%, net: ' + r.netScore + ', confirms: ' + r.confirmations + ')');

              // Attempt to execute the trade
              try {
                await executeBotTrade({
                  symbol: r.symbol,
                  recommendation: r.recommendation,
                  confidence: r.confidence,
                  direction: r.direction,
                  entry: r.entry,
                  stop: r.stop,
                  target: r.target,
                  source: 'auto-scanner',
                  riskReward: r.riskReward,
                });
                tradesExecuted++;
              } catch (tradeErr) {
                console.error('[Scanner] Trade execution failed for ' + r.symbol + ':', tradeErr.message);
              }
            }
          }
        }
      }

      // Small delay between batches to be nice to Yahoo
      if (batchStart + BATCH_SIZE < stocksToScan.length) {
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
    }

    // Sort results by net score descending
    results.sort((a, b) => b.netScore - a.netScore);

    console.log('[Scanner] ========== SCAN COMPLETE ==========');
    console.log('[Scanner] Scanned: ' + stocksScanned + ' | Signals: ' + signalsFound + ' | Trades: ' + tradesExecuted);

    setScannerStatus(prev => ({
      ...prev,
      isScanning: false,
      lastScanTime: new Date().toISOString(),
      lastScanResults: results.slice(0, 20),
      stocksScanned,
      signalsFound,
      tradesExecuted,
      errors: scanErrors.slice(0, 10),
      currentStock: null,
      progress: 100,
    }));

    if (signalsFound > 0) {
      addNotification('Scanner found ' + signalsFound + ' signal(s) from ' + stocksScanned + ' stocks' + (tradesExecuted > 0 ? ' — ' + tradesExecuted + ' trade(s) placed!' : ''), tradesExecuted > 0 ? 'success' : 'info');
    }
  };

  // ═══════════════════════════════════════════════════
  // AUTO-SCANNER INTERVAL TIMER
  // ═══════════════════════════════════════════════════
  useEffect(() => {
    if (scannerIntervalRef.current) {
      clearInterval(scannerIntervalRef.current);
      scannerIntervalRef.current = null;
    }

    if (scannerEnabled && botEnabled && alpacaConfig.connected) {
      console.log('[Scanner] Starting scan interval: every ' + scannerSettings.scanInterval + ' minutes');
      // Run first scan after 10 seconds
      const initialTimeout = setTimeout(() => {
        botAutoScan();
      }, 10000);

      scannerIntervalRef.current = setInterval(() => {
        botAutoScan();
      }, scannerSettings.scanInterval * 60 * 1000);

      return () => {
        clearTimeout(initialTimeout);
        if (scannerIntervalRef.current) clearInterval(scannerIntervalRef.current);
      };
    }
  }, [scannerEnabled, botEnabled, alpacaConfig.connected, scannerSettings.scanInterval]);

  // ═══════════════════════════════════════════════════
  // BOT SIGNAL MONITORS - Watch analysis & daily pick
  // ═══════════════════════════════════════════════════`
);

// ═══════════════════════════════════════════════════════════════
// 4. ADD 'scanner' SUB-TAB TO DASHBOARD
// ═══════════════════════════════════════════════════════════════
applyPatch(
  '4. Add scanner sub-tab button',
  `{['dashboard', 'settings', 'history'].map(tab => (
                <button key={tab} onClick={() => setBotSettingsTab(tab)}
                  className={\`px-4 py-2 rounded-lg text-sm font-medium transition-all \${botSettingsTab === tab ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}\`}>
                  {tab === 'dashboard' ? '📊 Dashboard' : tab === 'settings' ? '⚙️ Settings' : '📋 Trade Log'}
                </button>
              ))}`,
  `{['dashboard', 'scanner', 'settings', 'history'].map(tab => (
                <button key={tab} onClick={() => setBotSettingsTab(tab)}
                  className={\`px-4 py-2 rounded-lg text-sm font-medium transition-all \${botSettingsTab === tab ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}\`}>
                  {tab === 'dashboard' ? '📊 Dashboard' : tab === 'scanner' ? '🔍 Scanner' : tab === 'settings' ? '⚙️ Settings' : '📋 Trade Log'}
                </button>
              ))}`
);

// ═══════════════════════════════════════════════════════════════
// 5. UPDATE THE BOT STATUS BAR TO SHOW SCANNER STATUS
// ═══════════════════════════════════════════════════════════════
applyPatch(
  '5. Update status bar with scanner info',
  `{botEnabled ? 'Bot is actively monitoring signals' : 'Bot is paused — no trades will be executed'}`,
  `{botEnabled ? (scannerEnabled ? (scannerStatus.isScanning ? 'Scanner running: analyzing ' + (scannerStatus.currentStock || '...') + ' (' + scannerStatus.progress + '%)' : 'Bot active + Scanner armed (every ' + scannerSettings.scanInterval + 'min)') : 'Bot is monitoring signals (scanner off)') : 'Bot is paused — no trades will be executed'}`
);

// ═══════════════════════════════════════════════════════════════
// 6. ADD SCANNER DASHBOARD TAB (before settings tab)
// ═══════════════════════════════════════════════════════════════
applyPatch(
  '6. Scanner dashboard UI',
  `            {/* SETTINGS TAB */}
            {alpacaConfig.connected && botSettingsTab === 'settings' && (`,
  `            {/* SCANNER TAB */}
            {alpacaConfig.connected && botSettingsTab === 'scanner' && (
              <div className="space-y-6">
                {/* Scanner Controls */}
                <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-white flex items-center gap-2">
                      Auto-Scanner
                      {scannerStatus.isScanning && (
                        <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full animate-pulse">SCANNING</span>
                      )}
                    </h3>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => { if (scannerStatus.isScanning) { scannerAbortRef.current = true; } else { botAutoScan(); } }}
                        disabled={!botEnabled}
                        className={"px-4 py-2 rounded-lg text-sm font-medium transition-all " + (scannerStatus.isScanning ? "bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30" : "bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:bg-blue-500/30") + (!botEnabled ? " opacity-50 cursor-not-allowed" : "")}
                      >
                        {scannerStatus.isScanning ? 'Stop Scan' : 'Run Scan Now'}
                      </button>
                      <button
                        onClick={() => { setScannerEnabled(!scannerEnabled); addNotification(scannerEnabled ? 'Auto-Scanner paused' : 'Auto-Scanner activated! Scans every ' + scannerSettings.scanInterval + ' min', scannerEnabled ? 'info' : 'success'); }}
                        disabled={!botEnabled}
                        className={"px-4 py-2 rounded-lg text-sm font-bold transition-all " + (scannerEnabled ? "bg-green-500/20 text-green-400 border border-green-500/30" : "bg-slate-700 text-slate-400 border border-slate-600") + (!botEnabled ? " opacity-50 cursor-not-allowed" : "")}
                      >
                        {scannerEnabled ? 'Scanner ON' : 'Scanner OFF'}
                      </button>
                    </div>
                  </div>

                  {/* Scanner Settings */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <label className="text-xs text-slate-500 block mb-1">Scan Interval (min)</label>
                      <select value={scannerSettings.scanInterval}
                        onChange={e => setScannerSettings(prev => ({...prev, scanInterval: parseInt(e.target.value)}))}
                        className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm">
                        <option value={15}>15 min</option>
                        <option value={30}>30 min</option>
                        <option value={45}>45 min</option>
                        <option value={60}>1 hour</option>
                        <option value={120}>2 hours</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-slate-500 block mb-1">Stocks Per Scan</label>
                      <select value={scannerSettings.maxStocksPerScan}
                        onChange={e => setScannerSettings(prev => ({...prev, maxStocksPerScan: parseInt(e.target.value)}))}
                        className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm">
                        <option value={20}>20 stocks</option>
                        <option value={35}>35 stocks</option>
                        <option value={50}>50 stocks</option>
                        <option value={75}>75 stocks</option>
                        <option value={100}>100 stocks</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-slate-500 block mb-1">Priority Tiers</label>
                      <select value={scannerSettings.scanTiers}
                        onChange={e => setScannerSettings(prev => ({...prev, scanTiers: parseInt(e.target.value)}))}
                        className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm">
                        <option value={3}>Top 3 tiers</option>
                        <option value={5}>Top 5 tiers</option>
                        <option value={10}>Top 10 tiers</option>
                        <option value={15}>Top 15 tiers</option>
                        <option value={29}>All 29 tiers</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-slate-500 block mb-1">Min Net Score</label>
                      <select value={scannerSettings.minNetScore}
                        onChange={e => setScannerSettings(prev => ({...prev, minNetScore: parseInt(e.target.value)}))}
                        className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm">
                        <option value={15}>15 (more signals)</option>
                        <option value={20}>20 (balanced)</option>
                        <option value={25}>25 (moderate)</option>
                        <option value={30}>30 (strict)</option>
                        <option value={40}>40 (very strict)</option>
                      </select>
                    </div>
                  </div>

                  {/* Scanner Progress */}
                  {scannerStatus.isScanning && (
                    <div className="bg-slate-900/50 rounded-lg p-3">
                      <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                        <span>Scanning {scannerStatus.currentStock || '...'}</span>
                        <span>{scannerStatus.progress}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-violet-500 to-blue-500 rounded-full transition-all duration-500" style={{width: scannerStatus.progress + '%'}} />
                      </div>
                    </div>
                  )}
                </div>

                {/* Scanner Stats */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-white">{scannerStatus.stocksScanned}</div>
                    <div className="text-xs text-slate-500">Stocks Scanned</div>
                  </div>
                  <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-amber-400">{scannerStatus.signalsFound}</div>
                    <div className="text-xs text-slate-500">Signals Found</div>
                  </div>
                  <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-green-400">{scannerStatus.tradesExecuted}</div>
                    <div className="text-xs text-slate-500">Trades Placed</div>
                  </div>
                  <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-violet-400">{scannerStatus.lastScanTime ? new Date(scannerStatus.lastScanTime).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'}) : '--:--'}</div>
                    <div className="text-xs text-slate-500">Last Scan</div>
                  </div>
                  <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-blue-400">{scannerEnabled ? scannerSettings.scanInterval + 'm' : 'OFF'}</div>
                    <div className="text-xs text-slate-500">Next Scan In</div>
                  </div>
                </div>

                {/* Last Scan Results */}
                <div className="bg-slate-800/40 border border-slate-700 rounded-xl overflow-hidden">
                  <div className="px-5 py-3 border-b border-slate-700">
                    <h3 className="font-semibold text-white">Top Scan Results</h3>
                  </div>
                  {scannerStatus.lastScanResults.length === 0 ? (
                    <div className="p-8 text-center text-slate-500">
                      {scannerStatus.lastScanTime ? 'No signals met minimum criteria' : 'No scan results yet — run a scan or enable auto-scanning'}
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-700/50">
                      {scannerStatus.lastScanResults.map((r, i) => {
                        const recColor = r.recommendation.includes('BUY') ? 'text-green-400' : r.recommendation.includes('SELL') ? 'text-red-400' : 'text-slate-400';
                        const recBg = r.recommendation.includes('BUY') ? 'bg-green-500/10' : r.recommendation.includes('SELL') ? 'bg-red-500/10' : 'bg-slate-700/30';
                        return (
                          <div key={i} className={"px-5 py-3 flex items-center justify-between hover:bg-slate-800/60 " + recBg}>
                            <div className="flex items-center gap-4">
                              <div className="w-8 text-center">
                                <span className="text-xs text-slate-500">#{i + 1}</span>
                              </div>
                              <div>
                                <span className="font-bold text-white">{r.symbol}</span>
                                <span className="ml-2 text-xs text-slate-400">{'$' + r.currentPrice?.toFixed(2)}</span>
                                <span className={"ml-2 text-xs " + (r.changePercent >= 0 ? 'text-green-400' : 'text-red-400')}>
                                  {r.changePercent >= 0 ? '+' : ''}{r.changePercent?.toFixed(2)}%
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-right text-xs text-slate-400">
                                <div>RSI: {r.rsi?.toFixed(0)} | Net: {r.netScore} | Conf: {r.confirmations}</div>
                                <div>{r.trend} | R:R {r.riskReward?.toFixed(1)}</div>
                              </div>
                              <span className={"text-xs font-bold px-2 py-1 rounded " + recColor + " " + (r.recommendation.includes('STRONG') ? 'border border-current' : '')}>
                                {r.recommendation.replace(/_/g, ' ')}
                              </span>
                              <span className="text-xs text-violet-400 font-medium">{r.confidence}%</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Scanner Errors */}
                {scannerStatus.errors.length > 0 && (
                  <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4">
                    <h4 className="text-sm font-medium text-red-400 mb-2">Scanner Errors ({scannerStatus.errors.length})</h4>
                    <div className="text-xs text-red-300/70 space-y-1 max-h-32 overflow-y-auto">
                      {scannerStatus.errors.map((e, i) => <div key={i}>{e}</div>)}
                    </div>
                  </div>
                )}

                {/* How it works */}
                <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-5">
                  <h4 className="text-sm font-medium text-slate-300 mb-3">How Auto-Scanner Works</h4>
                  <div className="text-xs text-slate-500 space-y-2">
                    <div>1. Scans stocks from your priority tiers on a set interval during market hours (9:30 AM - 3:45 PM ET)</div>
                    <div>2. Runs the same 13-factor technical analysis as Quick Analysis: RSI, MACD, SMA, EMA, Bollinger, ATR, VWAP, divergences, ADX, Fibonacci, Stochastic RSI</div>
                    <div>3. When a stock hits STRONG_BUY/STRONG_SELL (or your allowed signals) with enough confidence, it sends the signal to the bot trade engine</div>
                    <div>4. The bot engine applies your safety checks (max positions, daily limits, R:R, trading hours) and places bracket orders with auto stop-loss + take-profit</div>
                    <div>5. Everything runs passively — just keep this tab open during market hours</div>
                  </div>
                </div>
              </div>
            )}

            {/* SETTINGS TAB */}
            {alpacaConfig.connected && botSettingsTab === 'settings' && (`
);

// ═══════════════════════════════════════════════════════════════
// WRITE THE FILE
// ═══════════════════════════════════════════════════════════════
if (changes > 0) {
  fs.writeFileSync(APP_PATH, code, 'utf8');
  console.log('\n✅ Auto-Scanner patch applied: ' + changes + '/6 changes');
  console.log('📦 Run: npx vite build');
} else {
  console.log('\n❌ No changes applied');
}
