// Vercel Serverless Function - Update/Announcement Email via Gmail SMTP (FREE - no EmailJS needed)
import nodemailer from 'nodemailer';

export const config = { maxDuration: 30 };

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
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Max-Age', '86400');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const adminSecret = process.env.ADMIN_SECRET;
    const authHeader = req.headers.authorization;
    if (!adminSecret || authHeader !== `Bearer ${adminSecret}`) {
      return res.status(403).json({ error: 'Unauthorized. Admin secret required.' });
    }

    const { recipients, subject, body, ctaText, ctaUrl } = req.body;
    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return res.status(400).json({ error: 'Recipients array is required.' });
    }
    if (!subject || typeof subject !== 'string') {
      return res.status(400).json({ error: 'Subject is required.' });
    }
    if (!body || typeof body !== 'string') {
      return res.status(400).json({ error: 'Body content is required.' });
    }
    if (recipients.length > 100) {
      return res.status(400).json({ error: 'Maximum 100 recipients per batch.' });
    }

    const smtp = createTransporter();
    if (!smtp) {
      return res.status(500).json({ error: 'Gmail SMTP not configured. Set GMAIL_USER and GMAIL_APP_PASSWORD env vars.' });
    }

    const buttonText = ctaText || 'Open MODUS';
    const buttonUrl = ctaUrl || 'https://modus-trading.vercel.app';
    const messageText = `${body}\n\n${buttonText}: ${buttonUrl}`;

    const results = [];
    for (const email of recipients) {
      try {
        await smtp.transporter.sendMail({
          from: `"MODUS Trading" <${smtp.user}>`,
          to: email, subject: subject, text: messageText,
        });
        results.push({ email, sent: true });
      } catch (err) {
        console.error(`[Update] Failed to send to ${email}:`, err.message);
        results.push({ email, sent: false });
      }
      if (recipients.length > 1) await new Promise(resolve => setTimeout(resolve, 200));
    }

    const sent = results.filter(r => r.sent).length;
    const failed = results.filter(r => !r.sent).length;
    return res.status(200).json({ success: true, sent, failed, total: recipients.length });
  } catch (error) {
    console.error('Update email error:', error);
    return res.status(500).json({ error: 'Failed to send update emails.' });
  }
}
