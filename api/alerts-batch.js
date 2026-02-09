// Vercel Serverless Function - Batch Alert Processing via EmailJS
// Handles high-volume alerts with rate limiting and queuing

// Carrier email-to-SMS gateways
const CARRIER_GATEWAYS = {
  'att': 'txt.att.net',
  'verizon': 'vtext.com',
  'tmobile': 'tmomail.net',
  'sprint': 'messaging.sprintpcs.com',
  'uscellular': 'email.uscc.net',
  'metropcs': 'mymetropcs.net',
  'cricket': 'sms.cricketwireless.net',
  'boost': 'sms.myboostmobile.com',
  'virgin': 'vmobl.com',
  'republic': 'text.republicwireless.com',
  'googlefi': 'msg.fi.google.com',
  'mint': 'tmomail.net',
  'visible': 'vtext.com',
};

// In-memory rate limiter (note: resets on cold start for serverless)
// For production, consider using Vercel KV or Upstash Redis
const rateLimiter = {
  lastReset: Date.now(),
  count: 0,
  dailyLimit: 100,
};

function checkRateLimit() {
  const now = Date.now();
  const oneDayMs = 24 * 60 * 60 * 1000;

  if (now - rateLimiter.lastReset > oneDayMs) {
    rateLimiter.count = 0;
    rateLimiter.lastReset = now;
  }

  return rateLimiter.count < rateLimiter.dailyLimit;
}

function incrementRateLimit(count = 1) {
  rateLimiter.count += count;
}

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

// Sanitize alert message
function sanitizeMessage(msg) {
  if (typeof msg !== 'string') return '';
  return msg.replace(/[<>]/g, '').trim().slice(0, 200);
}

export default async function handler(req, res) {
  const corsOrigin = getCorsOrigin(req);
  res.setHeader('Access-Control-Allow-Origin', corsOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Max-Age', '86400');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // GET - Check rate limit status
  if (req.method === 'GET') {
    return res.status(200).json({
      remaining: Math.max(0, rateLimiter.dailyLimit - rateLimiter.count),
      limit: rateLimiter.dailyLimit,
      resetsAt: new Date(rateLimiter.lastReset + 24 * 60 * 60 * 1000).toISOString(),
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { alerts, phone, carrier } = req.body;

    // Input validation
    if (!Array.isArray(alerts) || alerts.length === 0) {
      return res.status(400).json({ error: 'alerts array is required and must not be empty' });
    }

    if (alerts.length > 50) {
      return res.status(400).json({ error: 'Maximum 50 alerts per batch' });
    }

    if (!phone || !carrier) {
      return res.status(400).json({ error: 'phone and carrier are required' });
    }

    // Check rate limit
    if (!checkRateLimit()) {
      return res.status(429).json({
        error: 'Daily alert limit reached. Resets in 24 hours.',
        remaining: 0,
        resetsAt: new Date(rateLimiter.lastReset + 24 * 60 * 60 * 1000).toISOString(),
      });
    }

    // Validate phone and carrier
    const cleanPhone = String(phone).replace(/\D/g, '');
    const carrierKey = String(carrier).toLowerCase();
    const gateway = CARRIER_GATEWAYS[carrierKey];

    if (!gateway) {
      return res.status(400).json({ error: `Unsupported carrier: ${carrier}` });
    }

    if (cleanPhone.length < 10 || cleanPhone.length > 11) {
      return res.status(400).json({ error: 'Invalid phone number format' });
    }

    const phoneNumber = cleanPhone.length === 11 ? cleanPhone.slice(1) : cleanPhone;
    const smsEmail = `${phoneNumber}@${gateway}`;

    // EmailJS credentials
    const serviceId = process.env.EMAILJS_SERVICE_ID || 'service_wka2oph';
    const templateId = process.env.EMAILJS_TEMPLATE_ID || 'template_1bn2e5y';
    const publicKey = process.env.EMAILJS_PUBLIC_KEY || 'P3MjxM_aqWY9csXhF';

    // Alert type emojis
    const alertEmojis = {
      'price': '📊', 'entry': '🎯', 'stop': '🛑', 'target': '💰',
      'news': '📰', 'volume': '📈', 'pattern': '📐', 'default': '🔔'
    };

    // Batch alerts into SMS-sized messages
    const maxSmsLength = 140;
    const batches = [];
    let currentBatch = [];
    let currentLength = 0;

    for (const alert of alerts) {
      const emoji = alertEmojis[alert.type] || alertEmojis.default;
      const msg = sanitizeMessage(alert.message || '');
      const symbol = String(alert.symbol || '').slice(0, 10);
      const line = `${emoji} ${symbol}: ${msg}`;

      if (currentLength + line.length + 1 > maxSmsLength && currentBatch.length > 0) {
        batches.push(currentBatch.join('\n'));
        currentBatch = [line];
        currentLength = line.length;
      } else {
        currentBatch.push(line);
        currentLength += line.length + 1;
      }
    }

    if (currentBatch.length > 0) {
      batches.push(currentBatch.join('\n'));
    }

    // Check if we have enough quota
    const remainingQuota = rateLimiter.dailyLimit - rateLimiter.count;
    if (batches.length > remainingQuota) {
      return res.status(429).json({
        error: `Not enough quota. Need ${batches.length}, have ${remainingQuota} remaining.`,
        partial: true,
        canSend: remainingQuota,
      });
    }

    // Send batched messages via EmailJS
    const results = [];
    for (const batch of batches) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000);

        const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            service_id: serviceId,
            template_id: templateId,
            user_id: publicKey,
            template_params: {
              to_email: smsEmail,
              subject: 'MODUS',
              message: batch,
            },
          }),
          signal: controller.signal,
        });

        clearTimeout(timeout);

        if (response.ok) {
          results.push({ success: true });
          incrementRateLimit();
        } else {
          const errorText = await response.text();
          console.error('Batch send error:', response.status, errorText);
          results.push({ success: false, error: 'Delivery failed' });
        }

        // Small delay between sends
        if (batches.length > 1) {
          await new Promise(resolve => setTimeout(resolve, 150));
        }
      } catch (err) {
        const isTimeout = err.name === 'AbortError';
        results.push({
          success: false,
          error: isTimeout ? 'Send timed out' : 'Delivery failed'
        });
      }
    }

    const successCount = results.filter(r => r.success).length;

    return res.status(200).json({
      success: successCount > 0,
      totalAlerts: alerts.length,
      messagesSent: successCount,
      messagesFailed: results.length - successCount,
      remaining: Math.max(0, rateLimiter.dailyLimit - rateLimiter.count),
    });

  } catch (error) {
    console.error('Batch alert error:', error);
    return res.status(500).json({
      error: 'Failed to process batch alerts. Please try again.'
    });
  }
}
