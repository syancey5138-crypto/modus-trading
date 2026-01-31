# MODUS - AI Trading Dashboard

AI-Powered Trading Analysis Dashboard with Chart Pattern Recognition and SMS Alerts.

## Features

- **AI Chart Analysis**: Upload trading charts for instant AI analysis
- **Real-Time Data**: Live stock quotes and market data
- **SMS Alerts**: Free SMS notifications via email-to-SMS gateways
- **Price Alerts**: Set alerts for price levels, RSI, MACD, and more
- **Portfolio Tracking**: Track your trades and performance
- **Market Overview**: Live indices, sectors, and market breadth

## Quick Start (Free Deployment)

### Step 1: Get Your API Keys (Free Tiers Available)

1. **Anthropic API Key** (Required for AI analysis)
   - Go to [console.anthropic.com](https://console.anthropic.com)
   - Create an account and get your API key
   - Cost: Pay-per-use (~$0.003 per analysis)

2. **Resend API Key** (Required for SMS alerts)
   - Go to [resend.com](https://resend.com)
   - Create a free account
   - Get your API key from the dashboard
   - Free tier: 100 emails/day (enough for 100 SMS/day)

### Step 2: Deploy to Vercel (Free)

1. **Create a Vercel account** at [vercel.com](https://vercel.com) (free)

2. **Push this code to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/modus-trading.git
   git push -u origin main
   ```

3. **Connect to Vercel**:
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your GitHub repository
   - Click "Deploy"

4. **Add Environment Variables** in Vercel Dashboard:
   - Go to your project → Settings → Environment Variables
   - Add the following:

   | Name | Value |
   |------|-------|
   | `ANTHROPIC_API_KEY` | `sk-ant-your-key-here` |
   | `RESEND_API_KEY` | `re_your-key-here` |
   | `OPENAI_API_KEY` | (Optional) `sk-your-key-here` |

5. **Redeploy** after adding environment variables:
   - Go to Deployments → Click "..." → Redeploy

### Step 3: Configure SMS Alerts

1. Open your deployed app
2. Click the ⚙️ Settings icon
3. Enable "SMS Alerts"
4. Enter your phone number (10 digits, no dashes)
5. Select your carrier (AT&T, Verizon, T-Mobile, etc.)
6. Choose which alert types to receive

## Cost Breakdown

| Service | Free Tier | Paid Usage |
|---------|-----------|------------|
| Vercel Hosting | 100k function calls/month | $0 for most users |
| Anthropic API | $5 free credits | ~$0.003/analysis |
| Resend SMS | 100 SMS/day | 3,000/month free |
| **Total** | **~$0/month** | **< $5/month typical** |

## Project Structure

```
modus-trading/
├── api/
│   ├── analyze.js       # AI analysis endpoint
│   ├── send-sms.js      # SMS alert endpoint
│   └── alerts-batch.js  # Batch alerts endpoint
├── src/
│   ├── App.jsx          # Main application
│   ├── main.jsx         # Entry point
│   └── index.css        # Styles
├── index.html
├── package.json
├── vercel.json
├── vite.config.js
└── tailwind.config.js
```

## API Endpoints

### POST /api/analyze
Analyzes a trading chart image using AI.

```json
{
  "image": "data:image/png;base64,...",
  "prompt": "Analyze this chart...",
  "provider": "anthropic"
}
```

### POST /api/send-sms
Sends an SMS alert via email-to-SMS gateway.

```json
{
  "phone": "5551234567",
  "carrier": "att",
  "message": "AAPL above $150!",
  "alertType": "price"
}
```

### GET /api/alerts-batch
Check SMS quota remaining.

### POST /api/alerts-batch
Send batch alerts efficiently.

## Supported Carriers

| Carrier | Code |
|---------|------|
| AT&T | `att` |
| Verizon | `verizon` |
| T-Mobile | `tmobile` |
| Sprint | `sprint` |
| US Cellular | `uscellular` |
| Metro PCS | `metropcs` |
| Cricket | `cricket` |
| Boost Mobile | `boost` |
| Virgin Mobile | `virgin` |
| Mint Mobile | `mint` |
| Visible | `visible` |
| Google Fi | `googlefi` |

## Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## Troubleshooting

### "API key not configured" error
- Make sure you added `ANTHROPIC_API_KEY` to Vercel environment variables
- Redeploy after adding the variable

### SMS not sending
- Verify your phone number is 10 digits (no country code for US)
- Check that your carrier is supported
- Check your Resend dashboard for email delivery status

### Analysis taking too long
- Charts with complex patterns take longer to analyze
- Typical analysis time: 10-30 seconds

## Support

For issues or feature requests, please open an issue on GitHub.

## License

MIT License - feel free to modify and use as you wish.
