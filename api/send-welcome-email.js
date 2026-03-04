// Vercel Serverless Function - Welcome Email via Gmail SMTP (FREE - no EmailJS needed)
import nodemailer from 'nodemailer';

export const config = { maxDuration: 15 };

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

function getWelcomeText(name) {
  return `Welcome aboard, ${name}!

Your MODUS account is live. Here's what you can do right away:

- Upload a chart for AI analysis — get instant pattern recognition and trade signals
- Practice with Paper Trading — $100K virtual balance to test strategies risk-free
- Track your trades in the Journal — log entries, tag strategies, review performance
- Set up SMS & voice alerts — never miss a price target or market move

Pro tip: Press V anytime to activate voice commands. Try "check Tesla" or "show features".

Open MODUS: https://modus-trading.vercel.app

Happy trading!
— The MODUS Team`;
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
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Max-Age', '86400');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { email, displayName } = req.body;
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return res.status(400).json({ error: 'Valid email is required.' });
    }
    const name = displayName || email.split('@')[0];

    const transporter = createTransporter();
    if (!transporter) {
      return res.status(200).json({ success: false, debug: 'Gmail SMTP not configured. Set GMAIL_USER and GMAIL_APP_PASSWORD env vars.' });
    }

    await transporter.sendMail({
      from: `"MODUS Trading" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: `Welcome to MODUS, ${name}!`,
      text: getWelcomeText(name),
    });

    console.log(`[Welcome] Email sent to ${email} via Gmail SMTP`);
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Welcome email error:', error);
    return res.status(200).json({ success: false, debug: error.message });
  }
}
