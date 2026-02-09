// Vercel Serverless Function - Welcome Email via Resend
// Sends a branded welcome email when new users sign up

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

export default async function handler(req, res) {
  const corsOrigin = getCorsOrigin(req);
  res.setHeader('Access-Control-Allow-Origin', corsOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Max-Age', '86400');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const resendKey = process.env.RESEND_API_KEY;
    if (!resendKey) {
      return res.status(500).json({ error: 'Resend API key not configured.' });
    }

    const { email, displayName } = req.body;

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return res.status(400).json({ error: 'Valid email is required.' });
    }

    const name = displayName || email.split('@')[0];
    const fromAddress = process.env.RESEND_FROM_EMAIL || 'MODUS <onboarding@resend.dev>';

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromAddress,
        to: [email],
        subject: 'Welcome to MODUS — Your AI Trading Dashboard',
        html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#0f172a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
    <!-- Header -->
    <div style="text-align:center;margin-bottom:32px;">
      <div style="display:inline-block;background:linear-gradient(135deg,#8b5cf6,#6d28d9);padding:16px 32px;border-radius:16px;margin-bottom:16px;">
        <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:800;letter-spacing:-0.5px;">MODUS</h1>
      </div>
      <p style="color:#94a3b8;font-size:14px;margin:0;">AI-Powered Trading Analysis</p>
    </div>

    <!-- Main Card -->
    <div style="background-color:#1e293b;border:1px solid #334155;border-radius:16px;padding:32px;margin-bottom:24px;">
      <h2 style="color:#ffffff;font-size:22px;margin:0 0 8px 0;">Welcome aboard, ${name}!</h2>
      <p style="color:#94a3b8;font-size:15px;line-height:1.6;margin:0 0 24px 0;">
        Your MODUS account is live. Here's what you can do right away:
      </p>

      <!-- Feature List -->
      <div style="margin-bottom:24px;">
        <div style="display:flex;align-items:flex-start;margin-bottom:16px;">
          <span style="color:#8b5cf6;font-size:18px;margin-right:12px;line-height:1.4;">&#9672;</span>
          <div>
            <div style="color:#ffffff;font-size:14px;font-weight:600;">Upload a chart for AI analysis</div>
            <div style="color:#64748b;font-size:13px;">Get instant pattern recognition and trade signals</div>
          </div>
        </div>
        <div style="display:flex;align-items:flex-start;margin-bottom:16px;">
          <span style="color:#8b5cf6;font-size:18px;margin-right:12px;line-height:1.4;">&#9672;</span>
          <div>
            <div style="color:#ffffff;font-size:14px;font-weight:600;">Practice with Paper Trading</div>
            <div style="color:#64748b;font-size:13px;">$100K virtual balance to test strategies risk-free</div>
          </div>
        </div>
        <div style="display:flex;align-items:flex-start;margin-bottom:16px;">
          <span style="color:#8b5cf6;font-size:18px;margin-right:12px;line-height:1.4;">&#9672;</span>
          <div>
            <div style="color:#ffffff;font-size:14px;font-weight:600;">Track your trades in the Journal</div>
            <div style="color:#64748b;font-size:13px;">Log entries, tag strategies, and review your performance</div>
          </div>
        </div>
        <div style="display:flex;align-items:flex-start;">
          <span style="color:#8b5cf6;font-size:18px;margin-right:12px;line-height:1.4;">&#9672;</span>
          <div>
            <div style="color:#ffffff;font-size:14px;font-weight:600;">Set up SMS & voice alerts</div>
            <div style="color:#64748b;font-size:13px;">Never miss a price target or market move</div>
          </div>
        </div>
      </div>

      <!-- CTA Button -->
      <div style="text-align:center;margin-top:28px;">
        <a href="https://modus-trading.vercel.app" style="display:inline-block;background:linear-gradient(135deg,#8b5cf6,#7c3aed);color:#ffffff;text-decoration:none;padding:14px 36px;border-radius:12px;font-weight:600;font-size:15px;">
          Open MODUS Dashboard
        </a>
      </div>
    </div>

    <!-- Tip -->
    <div style="background-color:#1e293b;border:1px solid #334155;border-radius:12px;padding:20px;margin-bottom:24px;">
      <p style="color:#8b5cf6;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;margin:0 0 8px 0;">Quick Tip</p>
      <p style="color:#94a3b8;font-size:14px;line-height:1.5;margin:0;">
        Press <strong style="color:#e2e8f0;">V</strong> anytime to activate voice commands.
        Try saying "check Tesla" or "show features" for hands-free navigation.
      </p>
    </div>

    <!-- Footer -->
    <div style="text-align:center;padding-top:16px;border-top:1px solid #1e293b;">
      <p style="color:#475569;font-size:12px;margin:0;">
        MODUS Trading Platform &mdash; AI-powered analysis for smarter trades
      </p>
    </div>
  </div>
</body>
</html>
        `.trim(),
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Resend API error:', response.status, errText);
      return res.status(200).json({ success: false, debug: `Resend ${response.status}: ${errText}` });
    }

    const data = await response.json();
    return res.status(200).json({ success: true, id: data.id });

  } catch (error) {
    console.error('Welcome email error:', error);
    return res.status(200).json({ success: false, debug: error.message });
  }
}
