// Vercel Serverless Function - SMS Alerts via Email-to-SMS Gateway
// Uses EmailJS - 200 FREE emails/month, works immediately

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
  'mint': 'tmomail.net', // Mint uses T-Mobile network
  'visible': 'vtext.com', // Visible uses Verizon network
};

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { phone, carrier, message, alertType = 'price' } = req.body;

    if (!phone || !carrier || !message) {
      return res.status(400).json({
        error: 'Missing required fields: phone, carrier, message'
      });
    }

    // Clean phone number (remove non-digits)
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length !== 10 && cleanPhone.length !== 11) {
      return res.status(400).json({ error: 'Invalid phone number' });
    }

    // Get carrier gateway
    const gateway = CARRIER_GATEWAYS[carrier.toLowerCase()];
    if (!gateway) {
      return res.status(400).json({
        error: `Unknown carrier: ${carrier}. Supported: ${Object.keys(CARRIER_GATEWAYS).join(', ')}`
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
        message: 'EmailJS not configured. Send email manually to: ' + smsEmail
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
    const formattedMessage = `${emoji} MODUS Alert\n${message}`;

    // Send via EmailJS REST API (200 free/month)
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
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`EmailJS API error: ${error}`);
    }

    return res.status(200).json({
      success: true,
      sentTo: smsEmail,
      alertType,
    });

  } catch (error) {
    console.error('SMS error:', error);
    return res.status(500).json({
      error: error.message || 'Failed to send SMS'
    });
  }
}
