// Vercel Serverless Function - Update/Announcement Email via EmailJS
// Sends announcement emails to opted-in mailing list subscribers
// Requires admin secret to prevent unauthorized use

export const config = {
  maxDuration: 30,
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
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Max-Age', '86400');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    // Require admin secret to send bulk emails
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

    // Cap recipients per batch to avoid abuse
    if (recipients.length > 100) {
      return res.status(400).json({ error: 'Maximum 100 recipients per batch.' });
    }

    // EmailJS credentials
    const serviceId = process.env.EMAILJS_SERVICE_ID || 'service_wka2oph';
    const templateId = process.env.EMAILJS_TEMPLATE_ID || 'template_1bn2e5y';
    const publicKey = process.env.EMAILJS_PUBLIC_KEY || 'P3MjxM_aqWY9csXhF';

    const buttonText = ctaText || 'Open MODUS';
    const buttonUrl = ctaUrl || 'https://modus-trading.vercel.app';

    // Build the message body
    const messageText = `${body}\n\n${buttonText}: ${buttonUrl}`;

    // Send individually for deliverability
    const results = [];
    for (const email of recipients) {
      try {
        const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            service_id: serviceId,
            template_id: templateId,
            user_id: publicKey,
            template_params: {
              to_email: email,
              subject: subject,
              message: messageText,
            },
          }),
        });

        if (response.ok) {
          results.push({ email, sent: true });
        } else {
          results.push({ email, sent: false });
        }
      } catch {
        results.push({ email, sent: false });
      }

      // Small delay between sends to avoid rate limiting
      if (recipients.length > 1) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }

    const sent = results.filter(r => r.sent).length;
    const failed = results.filter(r => !r.sent).length;

    return res.status(200).json({
      success: true,
      sent,
      failed,
      total: recipients.length,
    });

  } catch (error) {
    console.error('Update email error:', error);
    return res.status(500).json({ error: 'Failed to send update emails.' });
  }
}
