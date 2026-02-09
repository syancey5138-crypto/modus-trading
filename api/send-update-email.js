// Vercel Serverless Function - Update/Announcement Email via Brevo
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

    const brevoKey = process.env.BREVO_API_KEY;
    if (!brevoKey) {
      return res.status(500).json({ error: 'Brevo API key not configured.' });
    }

    const { recipients, subject, heading, body, ctaText, ctaUrl } = req.body;

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

    const senderEmail = process.env.SENDER_EMAIL || 'modus.ai.noreply@gmail.com';
    const senderName = process.env.SENDER_NAME || 'MODUS Trading';
    const emailHeading = heading || subject;
    const buttonText = ctaText || 'Open MODUS';
    const buttonUrl = ctaUrl || 'https://modus-trading.vercel.app';

    // Send individually for deliverability
    const results = [];
    for (const email of recipients) {
      try {
        const response = await fetch('https://api.brevo.com/v3/smtp/email', {
          method: 'POST',
          headers: {
            'api-key': brevoKey,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({
            sender: { name: senderName, email: senderEmail },
            to: [{ email: email, name: email.split('@')[0] }],
            subject: subject,
            htmlContent: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#0f172a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
    <div style="text-align:center;margin-bottom:32px;">
      <div style="display:inline-block;background:linear-gradient(135deg,#8b5cf6,#6d28d9);padding:12px 24px;border-radius:12px;">
        <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:800;">MODUS</h1>
      </div>
    </div>
    <div style="background-color:#1e293b;border:1px solid #334155;border-radius:16px;padding:32px;margin-bottom:24px;">
      <h2 style="color:#ffffff;font-size:20px;margin:0 0 16px 0;">${emailHeading}</h2>
      <div style="color:#94a3b8;font-size:15px;line-height:1.7;">${body}</div>
      <div style="text-align:center;margin-top:28px;">
        <a href="${buttonUrl}" style="display:inline-block;background:linear-gradient(135deg,#8b5cf6,#7c3aed);color:#ffffff;text-decoration:none;padding:14px 36px;border-radius:12px;font-weight:600;font-size:15px;">
          ${buttonText}
        </a>
      </div>
    </div>
    <div style="text-align:center;padding-top:16px;border-top:1px solid #1e293b;">
      <p style="color:#475569;font-size:12px;margin:0;">
        You're receiving this because you subscribed to MODUS updates.
      </p>
    </div>
  </div>
</body>
</html>
            `.trim(),
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
