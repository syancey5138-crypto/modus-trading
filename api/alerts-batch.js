// Vercel Serverless Function - Batch Alert Processing via Gmail SMTP (FREE - no EmailJS needed)
import nodemailer from 'nodemailer';

const CARRIER_GATEWAYS = {
  'att': 'txt.att.net', 'verizon': 'vtext.com', 'tmobile': 'tmomail.net',
  'sprint': 'messaging.sprintpcs.com', 'uscellular': 'email.uscc.net',
  'metropcs': 'mymetropcs.com', 'metro': 'mymetropcs.com',
  'cricket': 'sms.cricketwireless.net', 'boost': 'sms.myboostmobile.com',
  'virgin': 'vmobl.com', 'republic': 'text.republicwireless.com',
  'googlefi': 'msg.fi.google.com', 'mint': 'tmomail.net',
  'visible': 'vtext.com', 'xfinity': 'vtext.com', 'consumer': 'mailmymobile.net',
};

const rateLimiter = { lastReset: Date.now(), count: 0, dailyLimit: 100 };

function checkRateLimit() {
  const now = Date.now();
  if (now - rateLimiter.lastReset > 86400000) { rateLimiter.count = 0; rateLimiter.lastReset = now; }
  return rateLimiter.count < rateLimiter.dailyLimit;
}

function incrementRateLimit(count = 1) { rateLimiter.count += count; }

const ALLOWED_ORIGINS = [
  'https://modus-trading.vercel.app', 'https://tradevision-modus.vercel.app',
  'http://localhost:3000', 'http://localhost:5173',
];

function getCorsOrigin(req) {
  const origin = req.headers?.origin || req.headers?.referer || '';
  if (process.env.NODE_ENV === 'production') {
    const matched = ALLOWED_ORIGINS.find(o => origin.startsWith(o));
    return matched || ALLOWED_ORIGINS[0];
  }
  return origin || '*';
}

function sanitizeMessage(msg) {
  if (typeof msg !== 'string') return '';
  return msg.replace(/[<>]/g, '').trim().slice(0, 200);
}

function createTransporter() {
  const user = process.env.GMAIL_USER;
  const pass = (process.env.GMAIL_APP_PASSWORD || '').replace(/\s/g, '');
  if (!user || !pass) return null;
  return {
    transporter: nodemailer.createTransport({
      host: 'smtp.gmail.com', port: 465, secure: true,
      auth: { user, pass },
    }),
    user,
  };
}

export default async function handler(req, res) {
  const corsOrigin = getCorsOrigin(req);
  res.setHeader('Access-Control-Allow-Origin', corsOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Max-Age', '86400');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method === 'GET') {
    return res.status(200).json({
      remaining: Math.max(0, rateLimiter.dailyLimit - rateLimiter.count),
      limit: rateLimiter.dailyLimit,
      resetsAt: new Date(rateLimiter.lastReset + 86400000).toISOString(),
    });
  }
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { alerts, phone, carrier } = req.body;
    if (!Array.isArray(alerts) || alerts.length === 0) return res.status(400).json({ error: 'alerts array is required' });
    if (alerts.length > 50) return res.status(400).json({ error: 'Maximum 50 alerts per batch' });
    if (!phone || !carrier) return res.status(400).json({ error: 'phone and carrier are required' });
    if (!checkRateLimit()) {
      return res.status(429).json({ error: 'Daily alert limit reached.', remaining: 0, resetsAt: new Date(rateLimiter.lastReset + 86400000).toISOString() });
    }

    const cleanPhone = String(phone).replace(/\D/g, '');
    const gateway = CARRIER_GATEWAYS[String(carrier).toLowerCase()];
    if (!gateway) return res.status(400).json({ error: `Unsupported carrier: ${carrier}` });
    if (cleanPhone.length < 10 || cleanPhone.length > 11) return res.status(400).json({ error: 'Invalid phone number' });

    const phoneNumber = cleanPhone.length === 11 ? cleanPhone.slice(1) : cleanPhone;
    const smsEmail = `${phoneNumber}@${gateway}`;

    const smtp = createTransporter();
    if (!smtp) return res.status(500).json({ error: 'Gmail SMTP not configured.' });

    const alertEmojis = { 'price': '📊', 'entry': '🎯', 'stop': '🛑', 'target': '💰', 'news': '📰', 'volume': '📈', 'pattern': '📐', 'default': '🔔' };
    const batches = []; let currentBatch = []; let currentLength = 0;

    for (const alert of alerts) {
      const emoji = alertEmojis[alert.type] || alertEmojis.default;
      const line = `${emoji} ${String(alert.symbol || '').slice(0, 10)}: ${sanitizeMessage(alert.message || '')}`;
      if (currentLength + line.length + 1 > 140 && currentBatch.length > 0) {
        batches.push(currentBatch.join('\n')); currentBatch = [line]; currentLength = line.length;
      } else { currentBatch.push(line); currentLength += line.length + 1; }
    }
    if (currentBatch.length > 0) batches.push(currentBatch.join('\n'));

    const remainingQuota = rateLimiter.dailyLimit - rateLimiter.count;
    if (batches.length > remainingQuota) {
      return res.status(429).json({ error: `Not enough quota. Need ${batches.length}, have ${remainingQuota}.`, partial: true, canSend: remainingQuota });
    }

    const results = [];
    for (const batch of batches) {
      try {
        await smtp.transporter.sendMail({ from: smtp.user, to: smsEmail, subject: 'MODUS', text: batch });
        results.push({ success: true }); incrementRateLimit();
      } catch (err) {
        console.error('Batch send error:', err.message);
        results.push({ success: false, error: 'Delivery failed' });
      }
      if (batches.length > 1) await new Promise(resolve => setTimeout(resolve, 150));
    }

    const successCount = results.filter(r => r.success).length;
    return res.status(200).json({
      success: successCount > 0, totalAlerts: alerts.length,
      messagesSent: successCount, messagesFailed: results.length - successCount,
      remaining: Math.max(0, rateLimiter.dailyLimit - rateLimiter.count),
    });
  } catch (error) {
    console.error('Batch alert error:', error);
    return res.status(500).json({ error: 'Failed to process batch alerts.' });
  }
}
