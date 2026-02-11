// Vercel Serverless Function - Yahoo Finance News Proxy
// Bypasses CORS by fetching server-side for news/search data

export const config = {
  maxDuration: 10,
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
  // Prevent Vercel CDN from caching - always serve fresh news
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { symbol, count } = req.query;

  if (!symbol || !/^[A-Z]{1,5}$/i.test(symbol.trim())) {
    return res.status(400).json({ error: 'Invalid symbol.' });
  }

  const sym = symbol.trim().toUpperCase();
  const newsCount = Math.min(parseInt(count) || 10, 20);

  const url = `https://query1.finance.yahoo.com/v1/finance/search?q=${sym}&newsCount=${newsCount}&quotesCount=0&enableFuzzyQuery=false&enableNavLinks=false`;

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
      return res.status(502).json({ error: `Yahoo HTTP ${response.status}` });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (err) {
    return res.status(502).json({
      error: `Could not fetch news for ${sym}`,
      detail: err.message || 'Fetch failed',
    });
  }
}
