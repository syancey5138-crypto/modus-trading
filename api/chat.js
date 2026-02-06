// Vercel Serverless Function - Text-only AI Chat (for Q&A)
// Faster endpoint for text-only questions without image processing

export const config = {
  maxDuration: 30,
};

// Allowed origins
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

// Fetch with timeout
async function fetchWithTimeout(url, options, timeoutMs = 25000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timeout);
  }
}

export default async function handler(req, res) {
  // CORS
  const corsOrigin = getCorsOrigin(req);
  res.setHeader('Access-Control-Allow-Origin', corsOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Max-Age', '86400');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt, maxTokens = 1000 } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Prompt is required and must be a string' });
    }

    if (prompt.length > 10000) {
      return res.status(400).json({ error: 'Prompt exceeds 10000 character limit' });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: 'API key not configured. Please check server environment variables.'
      });
    }

    // Cap tokens between reasonable bounds
    const tokenLimit = Math.min(Math.max(maxTokens, 200), 2000);

    const response = await fetchWithTimeout('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: tokenLimit,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    }, 25000);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Chat API error:', response.status, errorText);

      if (response.status === 429) {
        return res.status(429).json({ error: 'Rate limited. Please wait a moment and try again.' });
      }
      if (response.status === 401) {
        return res.status(500).json({ error: 'API authentication failed. Please check server configuration.' });
      }

      throw new Error('Chat service temporarily unavailable');
    }

    const data = await response.json();
    return res.status(200).json({
      success: true,
      content: data.content[0].text,
    });

  } catch (error) {
    console.error('Chat error:', error);

    const isTimeout = error.name === 'AbortError';
    const clientMessage = isTimeout
      ? 'Request timed out. Please try a shorter question.'
      : 'Failed to get response. Please try again.';

    return res.status(isTimeout ? 504 : 500).json({
      error: clientMessage
    });
  }
}
