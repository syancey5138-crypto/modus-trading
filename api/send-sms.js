// Vercel Serverless Function - SMS Alerts via Gmail SMTP (FREE - no EmailJS needed)
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
  return msg.replace(/[<>]/g, '').trim().slice(0, 300);
}

function createTransporter() {
  const user = process.env.GMAIL_USER;
  const pass = (process.env.GMAIL_APP_PASSWORD || '').replace(/\s/g, '');
  if (!user || !pass) return null;
  return nodemailer.createTransport({
    host: 'smtp.gmail.com', port: 465, secure: true,
    auth: { user, pass },
  });
}

export default async function handler(req, res) {
  const corsOrigin = getCorsOrigin(req);
  res.setHeader('Access-Control-Allow-Origin', corsOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Max-Age', '86400');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { phone, carrier, message, alertType = 'price' } = req.body;
    if (!phone || !carrier || !message) {
      return res.status(400).json({ error: 'Missing required fields: phone, carrier, message' });
    }
    const cleanPhone = String(phone).replace(/\D/g, '');
    if (cleanPhone.length < 10 || cleanPhone.length > 11) {
      return res.status(400).json({ error: 'Invalid phone number format' });
    }
    const carrierKey = String(carrier).toLowerCase();
    const gateway = CARRIER_GATEWAYS[carrierKey];
    if (!gateway) {
      return res.status(400).json({ error: `Unsupported carrier. Supported: ${Object.keys(CARRIER_GATEWAYS).join(', ')}` });
    }
    const phoneNumber = cleanPhone.length === 11 ? cleanPhone.slice(1) : cleanPhone;
    const smsEmail = `${phoneNumber}@${gateway}`;

    const alertEmojis = { 'price': '📊', 'entry': '🎯', 'stop': '🛑', 'target': '💰', 'news': '📰', 'volume': '📈', 'pattern': '📐' };
    const emoji = alertEmojis[alertType] || '🔔';
    const formattedMessage = `${emoji} MODUS Alert\n${sanitizeMessage(message)}`;

    const transporter = createTransporter();
    if (!transporter) {
      return res.status(200).json({ success: false, fallback: true, smsEmail, message: 'Gmail SMTP not configured. Set GMAIL_USER and GMAIL_APP_PASSWORD env vars.' });
    }

    await transporter.sendMail({ from: process.env.GMAIL_USER, to: smsEmail, subject: 'MODUS', text: formattedMessage });
    console.log(`[SMS] Sent to ${smsEmail} via Gmail SMTP`);
    return res.status(200).json({ success: true, alertType });
  } catch (error) {
    console.error('SMS error:', error);
    return res.status(500).json({ error: 'Failed to send alert. Please try again.' });
  }
}
