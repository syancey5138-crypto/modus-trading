// Vercel Serverless Function - SMS Alerts via Email-to-SMS Gateway
// 100% FREE - Uses carrier email gateways to send SMS

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

    // Get Resend API key from environment
    const resendApiKey = process.env.RESEND_API_KEY;

    if (!resendApiKey) {
      // Fallback: Return the email address so user can use their own email client
      return res.status(200).json({
        success: false,
        fallback: true,
        smsEmail: smsEmail,
        message: 'RESEND_API_KEY not configured. Send email manually to: ' + smsEmail
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

    // Send via Resend (free tier: 100 emails/day, 3000/month)
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: 'MODUS Alerts <alerts@resend.dev>', // Use Resend's default domain (free)
        to: smsEmail,
        subject: 'MODUS', // Subject becomes part of SMS
        text: formattedMessage,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Resend API error: ${error}`);
    }

    const data = await response.json();

    return res.status(200).json({
      success: true,
      messageId: data.id,
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
