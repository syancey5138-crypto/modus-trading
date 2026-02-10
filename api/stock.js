// Vercel Serverless Function - Yahoo Finance Stock Data Proxy
// Bypasses CORS by fetching server-side, then returning data to the client

export const config = {
  maxDuration: 15,
};

const ALLOWED_ORIGINS = [
  'https://modus-trading.vercel.app',
  'https://tradevision-modus.vercel.app',
  'http://localhost:3000',
  'http://localhost:5173',
];

function getCorsOrigin(req) {
  const origin = req.headers?.origin || req.headers?.referer || '';
  if (process.env.NODE_ENV === 'production') {
    const matched = ALLOWED_ORIGINS.find(o => origin.startsWith(o));
    return matched || ALLOWED_ORIGINS[0];
  }
  return origin || '*';
}

export default async function handler(req, res) {
  const corsOrigin = getCorsOrigin(req);
  res.setHeader('Access-Control-Allow-Origin', corsOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { symbol, interval, range } = req.query;

  if (!symbol || !/^\^?[A-Z]{1,5}$/i.test(symbol.trim())) {
    return res.status(400).json({ error: 'Invalid symbol. Must be 1-5 letters, optionally prefixed with ^.' });
  }

  const sym = symbol.trim().toUpperCase();
  const int = interval || '1d';
  const rng = range || '3mo';

  // Try multiple Yahoo Finance endpoints server-side (no CORS issues)
  const urls = [
    `https://query1.finance.yahoo.com/v8/finance/chart/${sym}?interval=${int}&range=${rng}`,
    `https://query2.finance.yahoo.com/v8/finance/chart/${sym}?interval=${int}&range=${rng}`,
  ];

  let lastError = null;

  for (const url of urls) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);

      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'application/json',
        },
      });

      clearTimeout(timeout);

      if (!response.ok) {
        lastError = `Yahoo HTTP ${response.status}`;
        continue;
      }

      const data = await response.json();

      if (!data?.chart?.result?.[0]) {
        lastError = 'No chart data in response';
        continue;
      }

      // Return the raw Yahoo Finance data
      return res.status(200).json(data);
    } catch (err) {
      lastError = err.message || 'Fetch failed';
      continue;
    }
  }

  // All endpoints failed
  return res.status(502).json({
    error: `Could not fetch data for ${sym}`,
    detail: lastError,
  });
}
