// Vercel Serverless Function - Batch Alert Processing
// Handles high-volume alerts efficiently with rate limiting and queuing

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

// In-memory rate limiter (resets on cold start, but good enough for free tier)
const rateLimiter = {
  lastReset: Date.now(),
  count: 0,
  dailyLimit: 100, // Resend free tier limit
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

function incrementRateLimit() {
  rateLimiter.count++;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // GET - Check rate limit status
  if (req.method === 'GET') {
    return res.status(200).json({
      remaining: rateLimiter.dailyLimit - rateLimiter.count,
      limit: rateLimiter.dailyLimit,
      resetsAt: new Date(rateLimiter.lastReset + 24 * 60 * 60 * 1000).toISOString(),
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { alerts, phone, carrier } = req.body;

    if (!Array.isArray(alerts) || alerts.length === 0) {
      return res.status(400).json({ error: 'alerts array is required' });
    }

    if (!phone || !carrier) {
      return res.status(400).json({ error: 'phone and carrier are required' });
    }

    // Check rate limit
    if (!checkRateLimit()) {
      return res.status(429).json({
        error: 'Daily SMS limit reached (100/day on free tier)',
        remaining: 0,
        resetsAt: new Date(rateLimiter.lastReset + 24 * 60 * 60 * 1000).toISOString(),
      });
    }

    const cleanPhone = phone.replace(/\D/g, '');
    const gateway = CARRIER_GATEWAYS[carrier.toLowerCase()];

    if (!gateway) {
      return res.status(400).json({ error: `Unknown carrier: ${carrier}` });
    }

    const phoneNumber = cleanPhone.length === 11 ? cleanPhone.slice(1) : cleanPhone;
    const smsEmail = `${phoneNumber}@${gateway}`;

    const resendApiKey = process.env.RESEND_API_KEY;

    if (!resendApiKey) {
      return res.status(500).json({
        error: 'RESEND_API_KEY not configured'
      });
    }

    // Consolidate alerts into batched messages (to stay under SMS character limits)
    const alertEmojis = {
      'price': '📊', 'entry': '🎯', 'stop': '🛑', 'target': '💰',
      'news': '📰', 'volume': '📈', 'pattern': '📐', 'default': '🔔'
    };

    // Group similar alerts and batch them
    const batches = [];
    let currentBatch = [];
    let currentLength = 0;
    const maxSmsLength = 140; // Keep under SMS limit

    for (const alert of alerts) {
      const emoji = alertEmojis[alert.type] || alertEmojis.default;
      const line = `${emoji} ${alert.symbol}: ${alert.message}`;

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
    if (rateLimiter.count + batches.length > rateLimiter.dailyLimit) {
      return res.status(429).json({
        error: `Not enough quota. Need ${batches.length}, have ${rateLimiter.dailyLimit - rateLimiter.count} remaining`,
        partial: true,
        canSend: rateLimiter.dailyLimit - rateLimiter.count,
      });
    }

    // Send batched messages
    const results = [];
    for (const batch of batches) {
      try {
        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${resendApiKey}`,
          },
          body: JSON.stringify({
            from: 'MODUS Alerts <alerts@resend.dev>',
            to: smsEmail,
            subject: 'MODUS',
            text: batch,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          results.push({ success: true, id: data.id });
          incrementRateLimit();
        } else {
          const error = await response.text();
          results.push({ success: false, error });
        }

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (err) {
        results.push({ success: false, error: err.message });
      }
    }

    const successCount = results.filter(r => r.success).length;

    return res.status(200).json({
      success: true,
      totalAlerts: alerts.length,
      messagesSent: successCount,
      remaining: rateLimiter.dailyLimit - rateLimiter.count,
      results,
    });

  } catch (error) {
    console.error('Batch alert error:', error);
    return res.status(500).json({ error: error.message });
  }
}
