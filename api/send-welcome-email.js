// Vercel Serverless Function - Welcome Email via EmailJS
// Sends a welcome email when new users sign up

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

    // EmailJS credentials (same as client-side — public keys, safe to include)
    const serviceId = process.env.EMAILJS_SERVICE_ID || 'service_wka2oph';
    const templateId = process.env.EMAILJS_TEMPLATE_ID || 'template_1bn2e5y';
    const publicKey = process.env.EMAILJS_PUBLIC_KEY || 'P3MjxM_aqWY9csXhF';

    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service_id: serviceId,
        template_id: templateId,
        user_id: publicKey,
        template_params: {
          to_email: email,
          subject: `Welcome to MODUS, ${name}!`,
          message: getWelcomeText(name),
        },
      }),
    });

    // EmailJS returns 'OK' as text on success (status 200)
    if (response.ok) {
      return res.status(200).json({ success: true });
    }

    const errText = await response.text();
    console.error('EmailJS error:', response.status, errText);
    return res.status(200).json({ success: false, debug: `EmailJS ${response.status}: ${errText}` });

  } catch (error) {
    console.error('Welcome email error:', error);
    return res.status(200).json({ success: false, debug: error.message });
  }
}
