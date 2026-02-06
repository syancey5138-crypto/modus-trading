// Vercel Serverless Function - SMS Alerts via Email-to-SMS Gateway
// Uses EmailJS - 200 FREE emails/month

// Carrier email-to-SMS gateways (US carriers)
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

// Sanitize SMS message content
function sanitizeMessage(msg) {
  if (typeof msg !== 'string') return '';
  // Remove potential injection, limit length for SMS
  return msg.replace(/[<>]/g, '').trim().slice(0, 300);
}

export default async function handler(req, res) {
  // CORS
  const corsOrigin = getCorsOrigin(req);
  res.setHeader('Access-Control-Allow-Origin', corsOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Max-Age', '86400');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { phone, carrier, message, alertType = 'price' } = req.body;

    // Input validation
    if (!phone || !carrier || !message) {
      return res.status(400).json({
        error: 'Missing required fields: phone, carrier, message'
      });
    }

    // Clean and validate phone number
    const cleanPhone = String(phone).replace(/\D/g, '');
    if (cleanPhone.length < 10 || cleanPhone.length > 11) {
      return res.status(400).json({ error: 'Invalid phone number format' });
    }

    // Validate carrier
    const carrierKey = String(carrier).toLowerCase();
    const gateway = CARRIER_GATEWAYS[carrierKey];
    if (!gateway) {
      return res.status(400).json({
        error: `Unsupported carrier. Supported: ${Object.keys(CARRIER_GATEWAYS).join(', ')}`
      });
    }

    // Construct email address for SMS gateway
    const phoneNumber = cleanPhone.length === 11 ? cleanPhone.slice(1) : cleanPhone;
    const smsEmail = `${phoneNumber}@${gateway}`;

    // Get EmailJS credentials from environment
    const serviceId = process.env.EMAILJS_SERVICE_ID;
    const templateId = process.env.EMAILJS_TEMPLATE_ID;
    const publicKey = process.env.EMAILJS_PUBLIC_KEY;

    if (!serviceId || !templateId || !publicKey) {
      return res.status(200).json({
        success: false,
        fallback: true,
        smsEmail: smsEmail,
        message: 'SMS service not configured. Please set up EmailJS credentials.'
      });
    }

    // Format message with alert type emoji
    const alertEmojis = {
      'price': '📊',
      'entry': '🎯',
      'stop': '🛑',
      'target': '💰',
      'news': '📰',
      'volume': '📈',
      'pattern': '📐',
    };

    const emoji = alertEmojis[alertType] || '🔔';
    const sanitizedMessage = sanitizeMessage(message);
    const formattedMessage = `${emoji} MODUS Alert\n${sanitizedMessage}`;

    // Send via EmailJS REST API with timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    try {
      const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          service_id: serviceId,
          template_id: templateId,
          user_id: publicKey,
          template_params: {
            to_email: smsEmail,
            subject: 'MODUS',
            message: formattedMessage,
          },
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('EmailJS error:', response.status, errorText);
        throw new Error('SMS delivery service error');
      }
    } catch (fetchError) {
      clearTimeout(timeout);
      if (fetchError.name === 'AbortError') {
        return res.status(504).json({ error: 'SMS delivery timed out. Please try again.' });
      }
      throw fetchError;
    }

    return res.status(200).json({
      success: true,
      alertType,
    });

  } catch (error) {
    console.error('SMS error:', error);
    return res.status(500).json({
      error: 'Failed to send alert. Please try again.'
    });
  }
}
