// Vercel Serverless Function - AI Analysis Proxy
// Securely proxies requests to OpenAI/Anthropic with proper validation

export const config = {
  maxDuration: 45,
};

// Allowed origins (update with your actual domain)
const ALLOWED_ORIGINS = [
  'https://modus-trading.vercel.app',
  'https://tradevision-modus.vercel.app',
  'http://localhost:3000',
  'http://localhost:5173',
];

function getCorsOrigin(req) {
  const origin = req.headers?.origin || req.headers?.referer || '';
  // In production, restrict to known origins
  if (process.env.NODE_ENV === 'production') {
    const matched = ALLOWED_ORIGINS.find(o => origin.startsWith(o));
    return matched || ALLOWED_ORIGINS[0];
  }
  return origin || '*';
}

// Input validation
function validateRequest(body) {
  const errors = [];

  if (!body.image) {
    errors.push('Image is required');
  } else if (typeof body.image !== 'string') {
    errors.push('Image must be a base64 string');
  } else if (body.image.length > 10 * 1024 * 1024) {
    errors.push('Image exceeds 10MB limit');
  }

  if (body.prompt && typeof body.prompt !== 'string') {
    errors.push('Prompt must be a string');
  }

  if (body.prompt && body.prompt.length > 10000) {
    errors.push('Prompt exceeds 10000 character limit');
  }

  const validProviders = ['openai', 'anthropic'];
  if (body.provider && !validProviders.includes(body.provider)) {
    errors.push(`Invalid provider. Must be one of: ${validProviders.join(', ')}`);
  }

  return errors;
}

// Fetch with timeout
async function fetchWithTimeout(url, options, timeoutMs = 40000) {
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
  // Prevent caching of AI analysis responses
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
  res.setHeader('Pragma', 'no-cache');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { image, prompt, provider = 'anthropic', maxTokens = 4000 } = req.body;

    // Validate input
    const validationErrors = validateRequest(req.body);
    if (validationErrors.length > 0) {
      return res.status(400).json({ error: validationErrors.join('; ') });
    }

    // Cap tokens for faster responses
    const tokenLimit = Math.min(Math.max(maxTokens, 500), 4000);

    // Get API key from environment variables
    const apiKey = provider === 'anthropic'
      ? process.env.ANTHROPIC_API_KEY
      : process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: `API key not configured. Please check server environment variables.`
      });
    }

    let response;

    if (provider === 'anthropic') {
      // Detect media type properly
      let mediaType = 'image/jpeg';
      if (image.includes('data:image/png')) mediaType = 'image/png';
      else if (image.includes('data:image/webp')) mediaType = 'image/webp';
      else if (image.includes('data:image/gif')) mediaType = 'image/gif';

      response = await fetchWithTimeout('https://api.anthropic.com/v1/messages', {
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
              content: [
                {
                  type: 'image',
                  source: {
                    type: 'base64',
                    media_type: mediaType,
                    data: image.replace(/^data:image\/\w+;base64,/, ''),
                  },
                },
                {
                  type: 'text',
                  text: prompt,
                },
              ],
            },
          ],
        }),
      }, 40000);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Anthropic API error:', response.status, errorText);

        if (response.status === 429) {
          return res.status(429).json({ error: 'Rate limited. Please wait a moment and try again.' });
        }
        if (response.status === 401) {
          return res.status(500).json({ error: 'API authentication failed. Please check server configuration.' });
        }

        throw new Error('Analysis service temporarily unavailable. Please try again.');
      }

      const data = await response.json();
      return res.status(200).json({
        success: true,
        content: data.content[0].text,
        provider: 'anthropic',
      });

    } else {
      // OpenAI GPT-4 Vision API
      response = await fetchWithTimeout('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          max_tokens: tokenLimit,
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'image_url',
                  image_url: {
                    url: image,
                    detail: 'high',
                  },
                },
                {
                  type: 'text',
                  text: prompt,
                },
              ],
            },
          ],
        }),
      }, 40000);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('OpenAI API error:', response.status, errorText);

        if (response.status === 429) {
          return res.status(429).json({ error: 'Rate limited. Please wait a moment and try again.' });
        }
        if (response.status === 401) {
          return res.status(500).json({ error: 'API authentication failed. Please check server configuration.' });
        }

        throw new Error('Analysis service temporarily unavailable. Please try again.');
      }

      const data = await response.json();
      return res.status(200).json({
        success: true,
        content: data.choices[0].message.content,
        provider: 'openai',
      });
    }

  } catch (error) {
    console.error('Analysis error:', error);

    // Don't leak internal error details to client
    const isTimeout = error.name === 'AbortError';
    const clientMessage = isTimeout
      ? 'Analysis timed out. Please try a smaller image or simpler chart.'
      : (error.message?.includes('temporarily unavailable')
        ? error.message
        : 'Failed to analyze image. Please try again.');

    return res.status(isTimeout ? 504 : 500).json({
      error: clientMessage
    });
  }
}
