const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  AlignmentType,
  LevelFormat,
  HeadingLevel,
  BorderStyle,
  WidthType,
  ShadingType,
  PageNumber,
  PageBreak,
  UnorderedList,
  ListLevel
} = require('docx');
const fs = require('fs');
const path = require('path');

// Color scheme
const COLORS = {
  primary: '7C3AED',     // Violet
  navy: '0F172A',        // Dark navy
  accent: '334155',      // Slate
  success: '059669',     // Emerald
  lightBg: 'EFF6FF',     // Light blue
  border: 'E2E8F0',      // Light border
  white: 'FFFFFF',
  darkText: '0F172A',
  lightText: 'F8FAFC'
};

// Create header function
function createHeader() {
  return new Paragraph({
    text: 'MODUS Trading Platform Guide — Version 3.1.0',
    alignment: AlignmentType.CENTER,
    style: 'header',
    border: {
      bottom: {
        color: COLORS.primary,
        space: 1,
        style: BorderStyle.SINGLE,
        size: 6
      }
    },
    spacing: { after: 200 }
  });
}

// Create footer function
function createFooter(pageNum) {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [
      new TextRun({
        text: `Page ${pageNum}`,
        size: 18,
        color: COLORS.accent
      })
    ]
  });
}

// Section heading with navy background
function createSectionHeading(text) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.NONE },
      bottom: { style: BorderStyle.SINGLE, size: 6, color: COLORS.primary },
      left: { style: BorderStyle.NONE },
      right: { style: BorderStyle.NONE },
      insideHorizontal: { style: BorderStyle.NONE },
      insideVertical: { style: BorderStyle.NONE }
    },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            shading: { fill: COLORS.navy, type: ShadingType.CLEAR },
            margins: { top: 120, bottom: 120, left: 120, right: 120 },
            children: [
              new Paragraph({
                text: text,
                bold: true,
                size: 32,
                color: COLORS.white,
                alignment: AlignmentType.LEFT
              })
            ]
          })
        ]
      })
    ]
  });
}

// Sub heading with light blue background
function createSubHeading(text) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.NONE },
      bottom: { style: BorderStyle.SINGLE, size: 3, color: COLORS.accent },
      left: { style: BorderStyle.NONE },
      right: { style: BorderStyle.NONE },
      insideHorizontal: { style: BorderStyle.NONE },
      insideVertical: { style: BorderStyle.NONE }
    },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            shading: { fill: COLORS.lightBg, type: ShadingType.CLEAR },
            margins: { top: 100, bottom: 100, left: 120, right: 120 },
            children: [
              new Paragraph({
                text: text,
                bold: true,
                size: 26,
                color: COLORS.darkText,
                alignment: AlignmentType.LEFT
              })
            ]
          })
        ]
      })
    ]
  });
}

// Content paragraph
function createContentPara(text, isBold = false) {
  return new Paragraph({
    text: text,
    size: 22,
    color: COLORS.darkText,
    alignment: AlignmentType.LEFT,
    spacing: { after: 200, line: 360 },
    bold: isBold
  });
}

// Cover page
function createCoverPage() {
  return [
    new Paragraph({ text: '' }),
    new Paragraph({ text: '' }),
    new Paragraph({ text: '' }),
    new Paragraph({
      text: 'MODUS',
      size: 80,
      bold: true,
      color: COLORS.primary,
      alignment: AlignmentType.CENTER,
      spacing: { after: 300 }
    }),
    new Paragraph({
      text: 'Complete Trading Platform Guide',
      size: 40,
      color: COLORS.navy,
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 }
    }),
    new Paragraph({
      text: 'Version 3.1.0 — February 2026',
      size: 24,
      color: COLORS.accent,
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 }
    }),
    new Paragraph({
      text: 'Your AI-Powered Trading Command Center',
      size: 28,
      bold: true,
      color: COLORS.darkText,
      alignment: AlignmentType.CENTER,
      spacing: { after: 600 }
    }),
    new Paragraph({ text: '' }),
    new Paragraph({ text: '' }),
    new Paragraph({ text: '' }),
    new Paragraph({
      text: '© 2026 MODUS Trading Platform. All rights reserved.',
      size: 18,
      color: COLORS.accent,
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 }
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: 'Page break',
          break: 1
        })
      ]
    })
  ];
}

// Chapter 1: Getting Started
function createChapter1() {
  return [
    createSectionHeading('Chapter 1: Getting Started'),
    new Paragraph({ text: '' }),
    createSubHeading('What is MODUS?'),
    createContentPara('MODUS is a revolutionary AI-powered trading platform designed to empower traders and investors with intelligent insights, real-time market data, and advanced trading tools. Built with cutting-edge artificial intelligence technology, MODUS combines professional-grade trading capabilities with an intuitive user interface, making sophisticated trading strategies accessible to both beginner and experienced traders.'),
    createContentPara('The platform integrates real-time stock market data, advanced technical analysis, AI-powered trade recommendations, and a comprehensive trading journal system. Whether you\'re analyzing market trends, managing your portfolio, or learning trading strategies, MODUS provides the tools and insights needed to make informed trading decisions in today\'s dynamic financial markets.'),

    new Paragraph({ text: '' }),
    createSubHeading('System Requirements'),
    createContentPara('To access MODUS, you\'ll need:'),
    new Paragraph({
      text: 'Modern web browser (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)',
      spacing: { before: 100, after: 150, line: 320 },
      size: 22
    }),
    new Paragraph({
      text: 'Stable internet connection (minimum 5 Mbps recommended)',
      spacing: { before: 0, after: 150, line: 320 },
      size: 22
    }),
    new Paragraph({
      text: 'Desktop, tablet, or mobile device (responsive design supports all screen sizes)',
      spacing: { before: 0, after: 150, line: 320 },
      size: 22
    }),
    new Paragraph({
      text: 'Valid email address for account creation and authentication',
      spacing: { before: 0, after: 300, line: 320 },
      size: 22
    }),

    new Paragraph({ text: '' }),
    createSubHeading('Creating an Account'),
    createContentPara('Getting started with MODUS is simple and secure. The platform uses Firebase authentication to ensure your account is protected with enterprise-grade security:'),
    new Paragraph({
      text: '1. Visit the MODUS login page and click "Create New Account"',
      spacing: { before: 100, after: 150, line: 320 },
      size: 22
    }),
    new Paragraph({
      text: '2. Enter your email address and create a strong password (minimum 8 characters, mix of upper/lowercase, numbers, and symbols)',
      spacing: { before: 0, after: 150, line: 320 },
      size: 22
    }),
    new Paragraph({
      text: '3. Verify your email address by clicking the confirmation link sent to your inbox',
      spacing: { before: 0, after: 150, line: 320 },
      size: 22
    }),
    new Paragraph({
      text: '4. Complete your profile with basic information (full name, trading experience level, investment goals)',
      spacing: { before: 0, after: 150, line: 320 },
      size: 22
    }),
    new Paragraph({
      text: '5. Accept the terms of service and privacy policy, then start trading',
      spacing: { before: 0, after: 300, line: 320 },
      size: 22
    }),

    new Paragraph({ text: '' }),
    createSubHeading('First-Time Setup'),
    createContentPara('After creating your account, complete these essential setup steps:'),
    createContentPara('API Key Configuration: If you plan to use real-time data feeds or integrate with external brokers, configure your API keys in the Settings > Integrations section. MODUS supports connections with leading brokers and market data providers.'),
    createContentPara('Notification Preferences: Customize how you receive alerts and notifications. Choose between push notifications, email alerts, SMS alerts (premium feature), and in-app notifications. Configure notification frequency and alert types based on your trading style.'),
    createContentPara('Dashboard Layout: Choose your preferred dashboard layout or create a custom layout. MODUS offers pre-configured layouts for day traders, swing traders, position traders, and long-term investors. You can modify any layout at any time.'),

    new Paragraph({ text: '' }),
    createSubHeading('Installing as a PWA'),
    createContentPara('MODUS is available as a Progressive Web App (PWA), allowing you to install it on your device for quick access and offline functionality:'),
    new Paragraph({
      text: 'Desktop: Click the install icon in your browser address bar, then select "Install MODUS"',
      spacing: { before: 100, after: 150, line: 320 },
      size: 22
    }),
    new Paragraph({
      text: 'Mobile: Tap the menu button, select "Add to Home Screen" or "Install App"',
      spacing: { before: 0, after: 150, line: 320 },
      size: 22
    }),
    new Paragraph({
      text: 'Once installed, MODUS will appear in your applications and can be launched like any native app',
      spacing: { before: 0, after: 300, line: 320 },
      size: 22
    }),
    new Paragraph({
      children: [new TextRun({ text: '', break: 1 })]
    })
  ];
}

// Chapter 2: Dashboard Overview
function createChapter2() {
  return [
    createSectionHeading('Chapter 2: Dashboard Overview'),
    new Paragraph({ text: '' }),
    createSubHeading('Dashboard Layout'),
    createContentPara('The MODUS dashboard is your command center for all trading activities. It provides a comprehensive view of your positions, watchlists, market data, and AI-powered insights. The dashboard is fully customizable, allowing you to arrange widgets according to your trading preferences and workflow.'),
    createContentPara('The default dashboard includes multiple sections: a top navigation bar with quick access buttons, a left sidebar with menu options, and the main content area displaying your customizable widget grid. Each widget can be moved, resized, added, or removed to create your ideal trading environment.'),

    new Paragraph({ text: '' }),
    createSubHeading('Customizing Widgets'),
    createContentPara('MODUS widgets are highly customizable drag-and-drop components:'),
    new Paragraph({
      text: 'Drag widgets: Click and drag any widget by its header to reposition it on your dashboard',
      spacing: { before: 100, after: 150, line: 320 },
      size: 22
    }),
    new Paragraph({
      text: 'Resize widgets: Use the resize handle in the widget corner to adjust width and height',
      spacing: { before: 0, after: 150, line: 320 },
      size: 22
    }),
    new Paragraph({
      text: 'Add widgets: Click the "+" button in the top-right corner to add new widgets from the widget library',
      spacing: { before: 0, after: 150, line: 320 },
      size: 22
    }),
    new Paragraph({
      text: 'Remove widgets: Click the "x" button on any widget to remove it from your dashboard',
      spacing: { before: 0, after: 150, line: 320 },
      size: 22
    }),
    new Paragraph({
      text: 'Save layouts: Save your custom dashboard configuration as a preset for quick restoration',
      spacing: { before: 0, after: 300, line: 320 },
      size: 22
    }),

    new Paragraph({ text: '' }),
    createSubHeading('Mini Widgets'),
    createContentPara('Mini widgets provide quick access to essential trading information without taking up much space:'),
    createContentPara('Clock Widget: Displays current time with market open/close status. Helps you stay aware of market hours and trading session timing.'),
    createContentPara('Quick Stats Widget: Shows your portfolio summary including total value, daily P&L, percentage return, and number of open positions. Click to expand for detailed metrics.'),
    createContentPara('Quick Navigation Widget: Provides one-click access to frequently used features like Watchlist, Trading Journal, Screener, and AI Analysis tools.'),

    new Paragraph({ text: '' }),
    createSubHeading('Market Status Indicator'),
    createContentPara('The Market Status indicator displays whether markets are currently open, closed, or in pre-market/after-hours trading. It shows the time until market open/close and highlights important market events and holidays. This widget helps you plan your trading activities within the appropriate market sessions.'),

    new Paragraph({ text: '' }),
    createSubHeading('Theme System'),
    createContentPara('MODUS offers multiple theme options to suit your preferences and trading environment:'),
    createContentPara('Midnight Theme: Dark background with purple accents, designed for low-light trading environments and reducing eye strain during long trading sessions.'),
    createContentPara('Dark Theme: Traditional dark theme with high contrast, ideal for professional traders who spend extended hours analyzing markets.'),
    createContentPara('Light Theme: Bright background with dark text, suitable for daytime trading or well-lit environments.'),
    createContentPara('Access theme settings through Settings > Appearance, and your preference will be saved across all your devices.'),
    new Paragraph({
      children: [new TextRun({ text: '', break: 1 })]
    })
  ];
}

// Chapter 3: AI-Powered Analysis
function createChapter3() {
  return [
    createSectionHeading('Chapter 3: AI-Powered Analysis'),
    new Paragraph({ text: '' }),
    createSubHeading('Quick Analysis'),
    createContentPara('The Quick Analysis tool provides rapid AI-powered assessment of stocks, ETFs, and market conditions. Access it from the main navigation or by searching for any symbol:'),
    createContentPara('Simply enter a ticker symbol (e.g., AAPL, SPY, QQQ) and the AI analysis engine will generate a comprehensive report within seconds. Quick Analysis provides an instant verdict (BUY, SELL, HOLD), confidence score, key technical levels, and an AI-generated trading rationale.'),
    createContentPara('The analysis considers multiple factors: current price relative to technical levels, volume patterns, momentum indicators, trend strength, and broader market context. This gives you a quick but thorough understanding of the asset\'s current trading setup.'),

    new Paragraph({ text: '' }),
    createSubHeading('Chart Upload Analysis'),
    createContentPara('Upload a chart image and let MODUS AI analyze it for you. This feature is perfect for analyzing assets not in the default database or comparing your personal chart annotations:'),
    createContentPara('Click the Camera icon in the Quick Analysis section, select an image file from your computer, and submit. The AI will analyze the chart looking for patterns, support/resistance levels, trend lines, and candlestick formations to generate actionable insights.'),

    new Paragraph({ text: '' }),
    createSubHeading('Multi-Image Analysis'),
    createContentPara('Upload multiple charts simultaneously for comparative analysis. Perfect for comparing different timeframes of the same asset or comparing similar assets across different market conditions.'),

    new Paragraph({ text: '' }),
    createSubHeading('Detailed Analysis Mode'),
    createContentPara('For deeper research, access Detailed Analysis Mode which provides comprehensive technical and fundamental analysis:'),
    new Paragraph({
      text: 'Technical Analysis: Support/resistance levels, trend analysis, pattern recognition, indicator readings',
      spacing: { before: 100, after: 150, line: 320 },
      size: 22
    }),
    new Paragraph({
      text: 'Fundamental Analysis: Earnings history, revenue trends, profitability metrics, valuation ratios',
      spacing: { before: 0, after: 150, line: 320 },
      size: 22
    }),
    new Paragraph({
      text: 'Sentiment Analysis: News sentiment, social media mentions, institutional activity',
      spacing: { before: 0, after: 300, line: 320 },
      size: 22
    }),

    new Paragraph({ text: '' }),
    createSubHeading('Understanding Verdicts'),
    createContentPara('MODUS AI provides three primary verdicts:'),
    new Paragraph({
      text: 'BUY: Strong technical setup with favorable risk/reward ratio. Momentum is positive and key levels suggest upside potential.',
      spacing: { before: 100, after: 150, line: 320 },
      size: 22
    }),
    new Paragraph({
      text: 'HOLD: Asset is fairly valued or showing mixed signals. Good for position maintenance but uncertain for new entries.',
      spacing: { before: 0, after: 150, line: 320 },
      size: 22
    }),
    new Paragraph({
      text: 'SELL: Weakness evident with poor risk/reward setup. Technical deterioration or excessive valuation suggests caution.',
      spacing: { before: 0, after: 300, line: 320 },
      size: 22
    }),

    new Paragraph({ text: '' }),
    createSubHeading('Confidence Scores'),
    createContentPara('Each verdict includes a confidence score (0-100%) indicating the AI\'s certainty in the recommendation. Higher scores (80%+) indicate strong consensus across multiple analysis factors. Lower scores suggest conflicting signals and recommend caution. Always cross-reference confidence scores with your own analysis and risk tolerance.'),

    new Paragraph({ text: '' }),
    createSubHeading('Scenario Analysis'),
    createContentPara('Access Bull/Base/Bear case scenarios for any security:'),
    createContentPara('Bull Case: Optimistic scenario outlining conditions for maximum upside, price target, and catalysts that could drive this outcome.'),
    createContentPara('Base Case: Most likely scenario based on current fundamentals and technical setup, representing the most probable outcome.'),
    createContentPara('Bear Case: Risk scenario outlining downside potential, support levels, and warning signs that would invalidate the bullish thesis.'),

    new Paragraph({ text: '' }),
    createSubHeading('Technical Indicators Explained'),
    createContentPara('MODUS includes interpretations of key technical indicators:'),
    createContentPara('Moving Averages: Track trend direction and identify support/resistance. Short-term (20, 50-day) vs long-term (100, 200-day) moving averages.'),
    createContentPara('MACD: Momentum indicator showing trend changes and strength. Histogram expansion indicates increasing momentum.'),
    createContentPara('RSI: Momentum oscillator measuring overbought (>70) and oversold (<30) conditions. Useful for mean reversion trades.'),
    createContentPara('Bollinger Bands: Volatility bands showing price extremes. Price touching upper/lower bands may indicate reversal opportunity.'),
    new Paragraph({
      children: [new TextRun({ text: '', break: 1 })]
    })
  ];
}

// Chapter 4: Voice Commands & Theme Builder
function createChapter4() {
  return [
    createSectionHeading('Chapter 4: Voice Commands & Custom Themes'),
    new Paragraph({ text: '' }),
    createSubHeading('Voice Commands'),
    createContentPara('Control MODUS entirely by voice using the browser\'s built-in Web Speech API. No special setup required — just press "V" or click the microphone button on the dashboard to activate voice mode.'),
    createContentPara('Once activated, speak naturally to navigate, analyze stocks, or control your dashboard. The system continuously listens and processes your commands in real-time. Try commands like:'),
    new Paragraph({
      text: '"Analyze AAPL" — Get instant AI analysis for Apple stock',
      spacing: { before: 100, after: 150, line: 320 },
      size: 22
    }),
    new Paragraph({
      text: '"Go to journal" — Navigate to your trading journal',
      spacing: { before: 0, after: 150, line: 320 },
      size: 22
    }),
    new Paragraph({
      text: '"Switch to dark theme" — Change your color theme',
      spacing: { before: 0, after: 150, line: 320 },
      size: 22
    }),
    new Paragraph({
      text: '"Open watchlist" — View your tracked stocks',
      spacing: { before: 0, after: 150, line: 320 },
      size: 22
    }),
    new Paragraph({
      text: '"Show dashboard" — Return to the main dashboard',
      spacing: { before: 0, after: 300, line: 320 },
      size: 22
    }),
    createContentPara('Voice commands are perfect for hands-free operation while monitoring charts or for accessibility. The system provides audio feedback confirming that it understood your command.'),

    new Paragraph({ text: '' }),
    createSubHeading('Custom Theme Builder'),
    createContentPara('Create unlimited custom color themes to personalize MODUS to your exact preferences. Access the Theme Builder from Settings > Appearance > Create Custom Theme.'),
    createContentPara('The Theme Builder provides 7 color pickers to customize:'),
    new Paragraph({
      text: 'Background — Overall page background color',
      spacing: { before: 100, after: 150, line: 320 },
      size: 22
    }),
    new Paragraph({
      text: 'Text Color — Default text and content color',
      spacing: { before: 0, after: 150, line: 320 },
      size: 22
    }),
    new Paragraph({
      text: 'Accent — Primary accent color for highlights and buttons',
      spacing: { before: 0, after: 150, line: 320 },
      size: 22
    }),
    new Paragraph({
      text: 'Cards — Widget and card background color',
      spacing: { before: 0, after: 150, line: 320 },
      size: 22
    }),
    new Paragraph({
      text: 'Borders — Card and element border color',
      spacing: { before: 0, after: 300, line: 320 },
      size: 22
    }),
    createContentPara('As you adjust colors, a live preview panel shows exactly how your theme will look. MODUS includes 5 pre-built presets to get you started: Ocean Blue (calm blues), Sunset (warm oranges), Forest (greens), Cyberpunk (neon accent colors), and Warm Gray (neutral tones). All themes are saved to localStorage and persist across sessions.'),
    createContentPara('You can edit, apply, or delete custom themes at any time from Settings. Share theme codes with other traders to spread your favorite color schemes.'),
    new Paragraph({
      children: [new TextRun({ text: '', break: 1 })]
    })
  ];
}

// Chapter 5: Crypto & Drawing Tools
function createChapter5New() {
  return [
    createSectionHeading('Chapter 5: Crypto Prices & Chart Drawing Tools'),
    new Paragraph({ text: '' }),
    createSubHeading('Crypto Prices Widget'),
    createContentPara('Monitor live cryptocurrency prices directly from your MODUS dashboard. The Crypto Prices widget pulls real-time data from CoinGecko\'s free API, requiring no API key.'),
    createContentPara('The widget tracks 8 major cryptocurrencies:'),
    new Paragraph({
      text: 'Bitcoin (BTC), Ethereum (ETH), Solana (SOL), Binance Coin (BNB)',
      spacing: { before: 100, after: 150, line: 320 },
      size: 22
    }),
    new Paragraph({
      text: 'XRP, Cardano (ADA), Dogecoin (DOGE), and Polygon (MATIC)',
      spacing: { before: 0, after: 300, line: 320 },
      size: 22
    }),
    createContentPara('For each cryptocurrency, you see the current price, 24-hour percentage change (color-coded green for gains, red for losses), and market capitalization. The widget automatically refreshes every 30 seconds to keep prices current. You can also manually refresh the data by clicking the refresh button.'),
    createContentPara('This is perfect for traders monitoring crypto alongside traditional stock positions, or for understanding cryptocurrency market sentiment alongside equity markets.'),

    new Paragraph({ text: '' }),
    createSubHeading('Chart Drawing Tools'),
    createContentPara('Add professional-grade annotations to price charts to mark key levels, identify patterns, and share analysis with clarity. Access drawing tools in the Chart view when analyzing any ticker.'),
    createContentPara('Available drawing tools include:'),
    new Paragraph({
      text: 'Trendlines — Click two points on the chart to draw a trend line connecting support or resistance levels',
      spacing: { before: 100, after: 150, line: 320 },
      size: 22
    }),
    new Paragraph({
      text: 'Horizontal Lines — Draw horizontal support/resistance levels at key price points',
      spacing: { before: 0, after: 150, line: 320 },
      size: 22
    }),
    new Paragraph({
      text: 'Fibonacci Retracement — Apply Fibonacci ratios to identify potential bounce levels',
      spacing: { before: 0, after: 150, line: 320 },
      size: 22
    }),
    new Paragraph({
      text: 'Text Annotations — Add labels and notes to mark important observations on the chart',
      spacing: { before: 0, after: 300, line: 320 },
      size: 22
    }),
    createContentPara('Customize each drawing with color selection. The undo button lets you remove the last drawing, and the clear-all option removes all drawings from the current chart. Importantly, all drawings are saved to localStorage and persist per ticker, so your annotations remain when you return to that stock.'),
    new Paragraph({
      children: [new TextRun({ text: '', break: 1 })]
    })
  ];
}

// Original Chapter 5 becomes Chapter 6: Trading Tools
function createChapter6Old() {
  return [
    createSectionHeading('Chapter 6: Trading Tools'),
    new Paragraph({ text: '' }),
    createSubHeading('Watchlist Management'),
    createContentPara('MODUS watchlists help you organize and monitor securities of interest. Create multiple watchlists for different strategies or themes:'),
    createContentPara('To create a watchlist, navigate to Watchlists, click "Create New," give it a name and description, then add symbols. You can add symbols by typing the ticker, searching by company name, or scanning QR codes. Watchlists can be marked public to share with the MODUS community or kept private for personal use.'),

    new Paragraph({ text: '' }),
    createSubHeading('Price Alerts System'),
    createContentPara('Set up automated price alerts for symbols you\'re monitoring. Alerts can be configured based on:'),
    new Paragraph({
      text: 'Price breaks above/below specific levels',
      spacing: { before: 100, after: 150, line: 320 },
      size: 22
    }),
    new Paragraph({
      text: 'Percentage gains or losses from entry price',
      spacing: { before: 0, after: 150, line: 320 },
      size: 22
    }),
    new Paragraph({
      text: 'Volume spikes above average volume',
      spacing: { before: 0, after: 150, line: 320 },
      size: 22
    }),
    new Paragraph({
      text: 'Technical indicator crossovers (e.g., MACD bullish cross)',
      spacing: { before: 0, after: 300, line: 320 },
      size: 22
    }),
    createContentPara('Receive alerts via push notification, email, SMS (premium), or in-app notifications depending on your preferences.'),

    new Paragraph({ text: '' }),
    createSubHeading('Position Sizing Calculator'),
    createContentPara('The Position Sizing Calculator helps you determine appropriate position sizes based on your account size, risk tolerance, and entry/stop price:'),
    createContentPara('Enter your account size, desired risk percentage (typically 1-2%), entry price, and stop loss price. The calculator automatically computes the number of shares to trade, ensuring you never risk more than your predetermined amount per trade. This tool is crucial for professional risk management.'),

    new Paragraph({ text: '' }),
    createSubHeading('Risk Calculator'),
    createContentPara('Calculate risk/reward ratios and expected value before entering trades:'),
    createContentPara('Input entry price, stop loss, and profit target. The Risk Calculator computes your risk amount, potential reward, risk/reward ratio, and suggests whether the setup meets minimum risk/reward standards (typically 1:2 or better).'),

    new Paragraph({ text: '' }),
    createSubHeading('Price Target Tracking'),
    createContentPara('Set and track price targets for your positions. Define multiple targets at different price levels with associated position size (e.g., sell 25% at $100, 25% at $110, hold remainder). Track how many targets have been hit and current progress toward remaining targets.'),

    new Paragraph({ text: '' }),
    createSubHeading('Paper Trading Simulator'),
    createContentPara('Practice trading with virtual money without risking real capital. The Paper Trading Simulator provides:'),
    createContentPara('Real-time market prices: Execute virtual trades at actual market rates to experience true trading dynamics. Your simulated portfolio performance closely reflects what would happen in real trading.'),
    createContentPara('Performance tracking: Monitor your simulated P&L, win rate, and trading metrics. Compare paper trading performance to identify patterns before trading with real money.'),
    createContentPara('Zero pressure: Practice new strategies, test ideas, and build confidence without financial risk.'),

    new Paragraph({ text: '' }),
    createSubHeading('Trade Plan Enforcement'),
    createContentPara('MODUS includes tools to help you stick to your trading plans and rules:'),
    createContentPara('Create trade plans with specific entry criteria, exit strategies, position size rules, and risk parameters. Review the plan before entering a trade to ensure alignment. MODUS can block trades that violate your predetermined rules (optional feature).'),
    new Paragraph({
      children: [new TextRun({ text: '', break: 1 })]
    })
  ];
}

// Chapter 5: Trading Journal
function createChapter5() {
  return [
    createSectionHeading('Chapter 5: Trading Journal'),
    new Paragraph({ text: '' }),
    createSubHeading('Logging Trades'),
    createContentPara('Your trading journal is the foundation of becoming a professional trader. MODUS makes logging trades simple:'),
    createContentPara('After closing a position, navigate to Trading Journal and click "Log Trade." Enter the symbol, entry price, exit price, position size, entry date/time, and exit date/time. Add notes about your trade setup, why you entered, what happened, and what you learned.'),
    createContentPara('The journal automatically calculates P&L, percentage return, win/loss status, and duration. Attach charts, screenshots, or analysis that was relevant to the trade. Rate your execution quality and emotion management during the trade.'),

    new Paragraph({ text: '' }),
    createSubHeading('Performance Metrics'),
    createContentPara('MODUS calculates key performance metrics from your trading data:'),
    new Paragraph({
      text: 'Win Rate: Percentage of trades that were profitable. Industry standard is 50%+ for experienced traders.',
      spacing: { before: 100, after: 150, line: 320 },
      size: 22
    }),
    new Paragraph({
      text: 'Profit Factor: Ratio of gross profit to gross loss. Values above 1.5 are considered good.',
      spacing: { before: 0, after: 150, line: 320 },
      size: 22
    }),
    new Paragraph({
      text: 'Average Win/Loss: Mean size of winning trades vs losing trades. Winners should exceed losers.',
      spacing: { before: 0, after: 150, line: 320 },
      size: 22
    }),
    new Paragraph({
      text: 'Sharpe Ratio: Risk-adjusted return metric. Higher values indicate better risk-adjusted performance.',
      spacing: { before: 0, after: 150, line: 320 },
      size: 22
    }),
    new Paragraph({
      text: 'Max Drawdown: Largest peak-to-trough decline in your account. Critical for risk assessment.',
      spacing: { before: 0, after: 300, line: 320 },
      size: 22
    }),

    new Paragraph({ text: '' }),
    createSubHeading('Monthly P&L Calendar'),
    createContentPara('Visualize your trading performance by month and day. The P&L calendar shows daily profit/loss as color-coded cells, making it easy to spot your best and worst trading days. Identify patterns in performance and determine which market conditions or times of month are most favorable for your trading style.'),

    new Paragraph({ text: '' }),
    createSubHeading('Equity Curve'),
    createContentPara('The Equity Curve graph shows your account value over time. This is the ultimate measure of trading success. An upward trending equity curve indicates profitable trading. Analyze the curve to identify periods of drawdown and recovery, and correlate them with changes in your trading approach.'),

    new Paragraph({ text: '' }),
    createSubHeading('Trade Replay'),
    createContentPara('Review past trades in detail with the Trade Replay feature. Hover over each trade on your equity curve or P&L calendar to see the price action during your holding period. Review the chart setup that existed when you entered, analyze how price evolved during your position, and understand why you exited.'),

    new Paragraph({ text: '' }),
    createSubHeading('Mistake Tracker'),
    createContentPara('Log trading mistakes and errors to identify patterns and avoid repeating them. Categories include: entry too early/late, exit too early/late, wrong position size, violation of trading rules, poor risk management, and emotional decisions. Review your mistake log monthly to track improvement.'),

    new Paragraph({ text: '' }),
    createSubHeading('Emotion Logger'),
    createContentPara('Rate your emotional state during trades: confidence level, fear/greed intensity, discipline in following rules, and overall composure. Analyze correlations between emotions and trading outcomes. High-performing traders recognize their emotional patterns and manage them effectively.'),

    new Paragraph({ text: '' }),
    createSubHeading('Export to CSV'),
    createContentPara('Export your entire trading journal to CSV format for analysis in spreadsheets or import into third-party analysis tools. This preserves your data and enables advanced analysis beyond MODUS\'s built-in metrics.'),
    new Paragraph({
      children: [new TextRun({ text: '', break: 1 })]
    })
  ];
}

// Chapter 6: Market Data & Widgets
function createChapter6() {
  return [
    createSectionHeading('Chapter 6: Market Data & Widgets'),
    new Paragraph({ text: '' }),
    createSubHeading('Market Summary'),
    createContentPara('Get a quick overview of major indices and market breadth. The Market Summary widget shows the current values, daily changes, and percentage moves for key indices including S&P 500 (SPY), Nasdaq (QQQ), Russell 2000 (IWM), and major international indices. Color coding (green for up, red for down) provides instant visual feedback.'),

    new Paragraph({ text: '' }),
    createSubHeading('Sector Heatmap'),
    createContentPara('Visualize which market sectors are performing best and worst today. The Heatmap displays all major sectors with color intensity representing strength or weakness. Hover over any sector to see detailed statistics including top movers within that sector. This helps identify sector rotation and hot markets.'),

    new Paragraph({ text: '' }),
    createSubHeading('Fear & Greed Index'),
    createContentPara('Monitor the Fear & Greed Index, a composite measure of market sentiment ranging from Extreme Fear (0) to Extreme Greed (100). The index considers multiple factors: market momentum, stock price momentum, junk bond demand, safe haven demand, market volatility, and put/call ratios. Extreme readings often precede market reversals.'),

    new Paragraph({ text: '' }),
    createSubHeading('Economic Calendar'),
    createContentPara('Stay informed about upcoming economic events that impact markets. The Economic Calendar displays scheduled releases like Federal Reserve decisions, employment reports, inflation data, and GDP reports. Each event shows the expected result, previous result, and time to release. Filter by impact level (High/Medium/Low) to focus on important events.'),

    new Paragraph({ text: '' }),
    createSubHeading('Earnings Calendar'),
    createContentPara('Track upcoming earnings reports for stocks in your watchlist. Know when companies will report results, and prepare your analysis in advance. MODUS highlights stocks with upcoming earnings, allowing you to adjust positions ahead of the volatility or prepare for trading opportunities.'),

    new Paragraph({ text: '' }),
    createSubHeading('Hot Stocks & Pre-Market Movers'),
    createContentPara('Identify actively traded stocks and significant pre-market movers. This widget shows stocks with exceptional volume and large price movements before regular market hours. Perfect for identifying setups early and preparing trading plans before market open.'),

    new Paragraph({ text: '' }),
    createSubHeading('News & Sentiment Feed'),
    createContentPara('Stay updated with market news and AI-analyzed sentiment. The feed aggregates financial news from major sources and applies natural language processing to determine if sentiment is positive, negative, or neutral. Filter news by stock, sector, or sentiment type. Important news can drive significant price movements.'),

    new Paragraph({ text: '' }),
    createSubHeading('Correlation Matrix'),
    createContentPara('Understand how different assets move relative to each other. The Correlation Matrix shows whether assets are positively correlated (move together), negatively correlated (move opposite), or uncorrelated. This is critical for portfolio diversification and understanding hedging strategies.'),

    new Paragraph({ text: '' }),
    createSubHeading('Dark Pool Activity'),
    createContentPara('Monitor unusual institutional activity through dark pool data. Large block trades executed away from public exchanges are shown here, revealing what big money is doing behind the scenes. Unusual dark pool activity can precede significant price moves.'),

    new Paragraph({ text: '' }),
    createSubHeading('Market Breadth'),
    createContentPara('Analyze the health of the overall market through breadth indicators. The widget shows advancing vs declining stocks, percentage of stocks above their 50 and 200-day moving averages, and the number of stocks near 52-week highs vs lows. Strong breadth suggests a healthy market, while deteriorating breadth can warn of weakness ahead.'),
    new Paragraph({
      children: [new TextRun({ text: '', break: 1 })]
    })
  ];
}

// Chapter 7: Community Features
function createChapter7() {
  return [
    createSectionHeading('Chapter 7: Community Features'),
    new Paragraph({ text: '' }),
    createSubHeading('Community Feed'),
    createContentPara('MODUS features a vibrant trading community where members share ideas, strategies, and insights. Access the Community Feed to see posts from traders you follow, read discussions about stocks and strategies, and participate in conversations about market conditions.'),
    createContentPara('The feed has three visibility levels: Local (shared only with members in your region), Public (visible to all MODUS users), and Private (shared only with your community group). This flexibility lets you choose the appropriate audience for each post.'),

    new Paragraph({ text: '' }),
    createSubHeading('Anonymous Posting'),
    createContentPara('Post ideas and questions anonymously to maintain privacy while participating in discussions. Anonymous posts are useful when testing new strategies, asking basic questions, or discussing sensitive positions without revealing your identity. Usernames are generated automatically for anonymous posts.'),

    new Paragraph({ text: '' }),
    createSubHeading('Private Community Codes'),
    createContentPara('Create or join private trading communities using exclusive codes. Private communities are perfect for study groups, professional trading groups, or team collaboration. Members within private communities can share strategies, discuss setups, and provide feedback in a secure, closed environment.'),

    new Paragraph({ text: '' }),
    createSubHeading('Cross-Device Sync'),
    createContentPara('Your community activity, follows, and preferences sync seamlessly across all your devices. Start a discussion on desktop, continue from mobile, and everything stays synchronized. Your reading history and notifications remain consistent across platforms.'),

    new Paragraph({ text: '' }),
    createSubHeading('Social Following'),
    createContentPara('Follow traders whose analysis and insights you respect. Customize your feed by following specific traders, communities, or hashtags. Get notified when followed traders post analysis, log significant trades, or share market insights. Build your network of trusted trading voices.'),
    new Paragraph({
      children: [new TextRun({ text: '', break: 1 })]
    })
  ];
}

// Chapter 8: AI Features
function createChapter8() {
  return [
    createSectionHeading('Chapter 8: AI Features'),
    new Paragraph({ text: '' }),
    createSubHeading('AI Trade Coach'),
    createContentPara('Your personal AI-powered trading coach provides guidance and feedback on your trading. The coach analyzes your trading journal, identifies patterns in your wins and losses, and offers personalized suggestions for improvement. Receive daily coaching messages that help you focus on your trading edge.'),
    createContentPara('The AI Trade Coach learns your trading style over time and provides increasingly personalized advice. It might suggest you trade fewer setups if your win rate drops, or highlight that your best trades occur in specific market conditions.'),

    new Paragraph({ text: '' }),
    createSubHeading('AI Strategy Builder'),
    createContentPara('Create and test trading strategies with the AI Strategy Builder. Define entry criteria, exit rules, position sizing, and risk management parameters. The builder backtests your strategy against historical data to estimate potential performance. This allows you to validate strategies before risking real capital.'),

    new Paragraph({ text: '' }),
    createSubHeading('Morning Market Briefing'),
    createContentPara('Start each trading day informed. The Morning Market Briefing uses AI to summarize overnight news, pre-market movers, economic events scheduled for the day, sector rotation, and relevant technical levels for stocks in your watchlist. Receive this customized briefing via email each morning or view it in the dashboard.'),

    new Paragraph({ text: '' }),
    createSubHeading('Smart Watchlist'),
    createContentPara('The AI-powered Smart Watchlist learns your trading preferences and automatically suggests new stocks that match your criteria. As you interact with watchlists and execute trades, the AI identifies patterns in what you trade and recommends similar opportunities.'),

    new Paragraph({ text: '' }),
    createSubHeading('Pattern Scanner'),
    createContentPara('Automatically scan your watchlist for specific technical patterns like double bottoms, head-and-shoulders, breakouts, and trend reversals. Set up pattern alerts and receive notifications when charts match the patterns you\'re searching for. This tool helps identify setups without manually reviewing hundreds of charts.'),

    new Paragraph({ text: '' }),
    createSubHeading('Sentiment Analysis'),
    createContentPara('Beyond price and volume, MODUS analyzes sentiment from news, social media, and market positioning to provide additional context for trading decisions. Extremely positive sentiment can indicate buying exhaustion, while extreme pessimism may present value opportunities. Use sentiment as a confirmation indicator alongside technical analysis.'),
    new Paragraph({
      children: [new TextRun({ text: '', break: 1 })]
    })
  ];
}

// Chapter 9: Screener & Research
function createChapter9() {
  return [
    createSectionHeading('Chapter 9: Screener & Research'),
    new Paragraph({ text: '' }),
    createSubHeading('Stock Screener'),
    createContentPara('The MODUS Stock Screener helps identify trading opportunities matching your criteria. Filter stocks by:'),
    new Paragraph({
      text: 'Price and volume metrics: Price range, average volume, volume changes',
      spacing: { before: 100, after: 150, line: 320 },
      size: 22
    }),
    new Paragraph({
      text: 'Technical indicators: Moving average positions, RSI readings, MACD signals',
      spacing: { before: 0, after: 150, line: 320 },
      size: 22
    }),
    new Paragraph({
      text: 'Fundamental metrics: P/E ratios, earnings growth, revenue trends',
      spacing: { before: 0, after: 150, line: 320 },
      size: 22
    }),
    new Paragraph({
      text: 'Market cap and sector: Filter by company size and industry sector',
      spacing: { before: 0, after: 300, line: 320 },
      size: 22
    }),
    createContentPara('Save your favorite screening criteria as templates for quick reuse. Run screens daily to identify stocks meeting your entry conditions and add promising results to your watchlist.'),

    new Paragraph({ text: '' }),
    createSubHeading('Sector Analysis'),
    createContentPara('Analyze entire market sectors to identify which are showing strength and which are struggling. Sector analysis helps you understand macro trends and position your portfolio in the most favorable areas. See top performers within each sector and compare sector performance across different time periods.'),

    new Paragraph({ text: '' }),
    createSubHeading('Comparison Mode'),
    createContentPara('Compare multiple stocks side-by-side to evaluate relative strength, valuations, and technical setups. This is useful when considering multiple entry candidates and trying to select the best setup. See fundamentals, technicals, and sentiment for multiple stocks simultaneously.'),

    new Paragraph({ text: '' }),
    createSubHeading('Trade Ideas'),
    createContentPara('Access curated trade ideas generated by the MODUS AI. Each idea includes the symbol, entry point, stop loss, profit targets, and detailed rationale. Ideas are categorized by strategy type (momentum, value, mean reversion, etc.) and can be filtered by risk level. Use these ideas for inspiration or directly import them into your trading plan.'),
    new Paragraph({
      children: [new TextRun({ text: '', break: 1 })]
    })
  ];
}

// Chapter 10: Settings & Customization
function createChapter10() {
  return [
    createSectionHeading('Chapter 10: Settings & Customization'),
    new Paragraph({ text: '' }),
    createSubHeading('API Key Configuration'),
    createContentPara('Configure integrations with brokers and data providers through the API section. Enter your API keys securely (MODUS never stores plain text credentials). Once configured, MODUS can retrieve real-time account data, execute trades, and provide enhanced market data.'),
    createContentPara('Supported integrations include major brokers like Interactive Brokers, TD Ameritrade, Alpaca, and others. Each integration can be enabled/disabled independently. Always use read-only API keys when possible for security.'),

    new Paragraph({ text: '' }),
    createSubHeading('Notification Preferences'),
    createContentPara('Customize how you receive alerts and notifications:'),
    new Paragraph({
      text: 'Push Notifications: Real-time alerts delivered to your browser or mobile device',
      spacing: { before: 100, after: 150, line: 320 },
      size: 22
    }),
    new Paragraph({
      text: 'Email Alerts: Daily or weekly digests of important market events and price alerts',
      spacing: { before: 0, after: 150, line: 320 },
      size: 22
    }),
    new Paragraph({
      text: 'SMS Alerts: Text message notifications for critical trades or price targets (premium feature)',
      spacing: { before: 0, after: 150, line: 320 },
      size: 22
    }),
    new Paragraph({
      text: 'In-App Notifications: View notifications within the MODUS interface',
      spacing: { before: 0, after: 300, line: 320 },
      size: 22
    }),
    createContentPara('Set quiet hours during which notifications are muted (e.g., after market hours or during your sleep time).'),

    new Paragraph({ text: '' }),
    createSubHeading('Theme Selection'),
    createContentPara('Choose between Midnight, Dark, or Light themes. Your selection is saved and applied across all devices. Some traders prefer different themes for different times of day or trading sessions.'),

    new Paragraph({ text: '' }),
    createSubHeading('Dashboard Layouts'),
    createContentPara('Save and manage multiple dashboard configurations. Create layouts optimized for different trading scenarios:'),
    new Paragraph({
      text: 'Premarket Layout: Focused on news, pre-market movers, and economic calendar',
      spacing: { before: 100, after: 150, line: 320 },
      size: 22
    }),
    new Paragraph({
      text: 'Active Trading Layout: Multiple charts, alerts, and order execution windows',
      spacing: { before: 0, after: 150, line: 320 },
      size: 22
    }),
    new Paragraph({
      text: 'Analysis Layout: Research tools, screener, and fundamental data prominently displayed',
      spacing: { before: 0, after: 300, line: 320 },
      size: 22
    }),

    new Paragraph({ text: '' }),
    createSubHeading('Keyboard Shortcuts'),
    createContentPara('Master keyboard shortcuts for faster navigation and trading. Common shortcuts include:'),
    new Paragraph({
      text: 'Ctrl+K (Cmd+K): Quick search across all features and symbols',
      spacing: { before: 100, after: 150, line: 320 },
      size: 22
    }),
    new Paragraph({
      text: 'Ctrl+J (Cmd+J): Open trading journal',
      spacing: { before: 0, after: 150, line: 320 },
      size: 22
    }),
    new Paragraph({
      text: 'Ctrl+D (Cmd+D): Add symbol to watchlist',
      spacing: { before: 0, after: 150, line: 320 },
      size: 22
    }),
    new Paragraph({
      text: 'Ctrl+A (Cmd+A): Open AI analysis',
      spacing: { before: 0, after: 300, line: 320 },
      size: 22
    }),

    new Paragraph({ text: '' }),
    createSubHeading('SMS Alerts'),
    createContentPara('Enable SMS alerts for critical trading scenarios (premium feature requires verification of phone number). Configure SMS to alert you for major market moves, price targets reached, or important economic events. SMS ensures you never miss critical trading opportunities even when away from your computer.'),
    new Paragraph({
      children: [new TextRun({ text: '', break: 1 })]
    })
  ];
}

// Chapter 11: Tips & Best Practices
function createChapter11() {
  return [
    createSectionHeading('Chapter 11: Tips & Best Practices'),
    new Paragraph({ text: '' }),
    createSubHeading('Risk Management Rules'),
    createContentPara('The foundation of successful trading is proper risk management. Never risk more than 1-2% of your account on a single trade. This ensures a single bad trade cannot significantly harm your account. For example, if you have a $10,000 account, never risk more than $100-200 per trade.'),
    createContentPara('Always use stop losses to define your maximum risk per trade. Before entering any position, know exactly where you will exit if you\'re wrong. This removes emotion from trading and protects your capital.'),
    createContentPara('Use the Position Sizing Calculator to ensure each trade respects your risk parameters. Size your position such that the distance to your stop loss times your share count equals your maximum risk. This ensures consistency and discipline.'),
    createContentPara('Diversify your trades across multiple setups and symbols. Avoid putting all your capital into a single position or overconcentrating in a single sector. Proper diversification smooths returns and reduces catastrophic loss risk.'),

    new Paragraph({ text: '' }),
    createSubHeading('Trading Psychology'),
    createContentPara('Psychology is often the difference between profitable and unprofitable traders. Successful traders manage emotions effectively and follow their trading plans consistently.'),
    createContentPara('Combat fear and greed by having clear rules for entries and exits before you trade. Emotional decisions usually result in poor trades. Use the Emotion Logger in your trading journal to become aware of patterns in your emotional trading.'),
    createContentPara('Accept losses as part of trading. Even the best traders win only 50-60% of their trades. Losses are tuition in the market. Review losses to extract lessons, not to beat yourself up. Use the Mistake Tracker to learn from errors.'),
    createContentPara('Maintain discipline during winning streaks. Don\'t increase risk or abandon your rules just because you\'ve had a few winners. Overconfidence often precedes large losses. Stick to your plan consistently.'),

    new Paragraph({ text: '' }),
    createSubHeading('Using MODUS Effectively'),
    createContentPara('Start with the AI Quick Analysis tool to get rapid market insights. Use it to identify which symbols are showing the best technical setups currently.'),
    createContentPara('Build a focused watchlist of 10-20 symbols you understand well and trade regularly. Avoid the urge to trade every symbol or follow too many watchlists. Quality over quantity.'),
    createContentPara('Review your trading journal weekly to identify patterns. Celebrate wins and learn from losses. Continuous improvement is key to long-term success.'),
    createContentPara('Use the Community Feed to learn from other traders. Follow successful traders and study their ideas. The MODUS community is a valuable resource for education and growth.'),

    new Paragraph({ text: '' }),
    createSubHeading('Building a Trading Routine'),
    createContentPara('Consistency builds success. Create a daily trading routine:'),
    new Paragraph({
      text: 'Before Market Open: Review the Morning Briefing, check pre-market movers, review your watchlist, and plan your day',
      spacing: { before: 100, after: 150, line: 320 },
      size: 22
    }),
    new Paragraph({
      text: 'During Trading Hours: Execute your planned trades, monitor open positions, and log trades in your journal',
      spacing: { before: 0, after: 150, line: 320 },
      size: 22
    }),
    new Paragraph({
      text: 'After Market Close: Log any new trades, review the day\'s performance, note lessons learned',
      spacing: { before: 0, after: 150, line: 320 },
      size: 22
    }),
    new Paragraph({
      text: 'Weekly: Analyze your wins and losses, identify patterns, adjust your approach if needed',
      spacing: { before: 0, after: 150, line: 320 },
      size: 22
    }),
    new Paragraph({
      text: 'Monthly: Deep dive into your monthly P&L, evaluate overall performance, set goals for next month',
      spacing: { before: 0, after: 300, line: 320 },
      size: 22
    }),
    createContentPara('Treat trading like a business. Show up consistently, follow your processes, and continually improve. Over months and years, these habits compound into significant expertise and profitability.'),
    new Paragraph({
      children: [new TextRun({ text: '', break: 1 })]
    })
  ];
}

// Appendix A: Keyboard Shortcuts
function createAppendixA() {
  const shortcuts = [
    { command: 'Ctrl+K (Cmd+K)', action: 'Quick search for symbols and features' },
    { command: 'Ctrl+J (Cmd+J)', action: 'Open Trading Journal' },
    { command: 'Ctrl+D (Cmd+D)', action: 'Add symbol to watchlist' },
    { command: 'Ctrl+A (Cmd+A)', action: 'Open AI Quick Analysis' },
    { command: 'Ctrl+W (Cmd+W)', action: 'Toggle watchlist sidebar' },
    { command: 'Ctrl+T (Cmd+T)', action: 'Open screener tool' },
    { command: 'Ctrl+S (Cmd+S)', action: 'Save current layout' },
    { command: 'Ctrl+L (Cmd+L)', action: 'Load saved layout' },
    { command: 'Ctrl+, (Cmd+,)', action: 'Open settings' },
    { command: 'Ctrl+/ (Cmd+/)', action: 'Show all keyboard shortcuts' }
  ];

  return [
    createSectionHeading('Appendix A: Keyboard Shortcuts'),
    new Paragraph({ text: '' }),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      columnWidths: [3000, 7000],
      borders: {
        top: { style: BorderStyle.SINGLE, size: 3, color: COLORS.primary },
        bottom: { style: BorderStyle.SINGLE, size: 3, color: COLORS.primary },
        left: { style: BorderStyle.SINGLE, size: 3, color: COLORS.primary },
        right: { style: BorderStyle.SINGLE, size: 3, color: COLORS.primary },
        insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: COLORS.border },
        insideVertical: { style: BorderStyle.SINGLE, size: 1, color: COLORS.border }
      },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              shading: { fill: COLORS.navy, type: ShadingType.CLEAR },
              margins: { top: 80, bottom: 80, left: 120, right: 120 },
              children: [
                new Paragraph({
                  text: 'Keyboard Shortcut',
                  bold: true,
                  color: COLORS.white,
                  size: 22
                })
              ]
            }),
            new TableCell({
              shading: { fill: COLORS.navy, type: ShadingType.CLEAR },
              margins: { top: 80, bottom: 80, left: 120, right: 120 },
              children: [
                new Paragraph({
                  text: 'Action',
                  bold: true,
                  color: COLORS.white,
                  size: 22
                })
              ]
            })
          ]
        }),
        ...shortcuts.map(
          shortcut =>
            new TableRow({
              children: [
                new TableCell({
                  shading: { fill: COLORS.lightBg, type: ShadingType.CLEAR },
                  margins: { top: 80, bottom: 80, left: 120, right: 120 },
                  children: [
                    new Paragraph({
                      text: shortcut.command,
                      bold: true,
                      size: 20,
                      color: COLORS.darkText
                    })
                  ]
                }),
                new TableCell({
                  shading: { fill: COLORS.lightText, type: ShadingType.CLEAR },
                  margins: { top: 80, bottom: 80, left: 120, right: 120 },
                  children: [
                    new Paragraph({
                      text: shortcut.action,
                      size: 20,
                      color: COLORS.darkText
                    })
                  ]
                })
              ]
            })
        )
      ]
    }),
    new Paragraph({ text: '' }),
    new Paragraph({
      children: [new TextRun({ text: '', break: 1 })]
    })
  ];
}

// Appendix B: Glossary
function createAppendixB() {
  const terms = [
    { term: 'BID', def: 'The highest price a buyer is willing to pay for a security.' },
    { term: 'ASK', def: 'The lowest price a seller is willing to accept for a security.' },
    { term: 'BOLLINGER BANDS', def: 'Volatility indicator consisting of moving average and standard deviation bands.' },
    { term: 'BREAKOUT', def: 'Price movement above or below a previously established resistance or support level.' },
    { term: 'BUY SIGNAL', def: 'Technical indicator suggesting a favorable time to enter a long position.' },
    { term: 'CANDLESTICK', def: 'Chart element showing open, high, low, and close prices for a time period.' },
    { term: 'CONSOLIDATION', def: 'Price movement in a sideways range, neither trending up nor down.' },
    { term: 'DAY TRADE', def: 'Opening and closing a position within the same trading day.' },
    { term: 'DIVERGENCE', def: 'When price and technical indicator move in opposite directions; often precedes reversal.' },
    { term: 'DIVIDEND', def: 'Portion of company earnings distributed to shareholders periodically.' },
    { term: 'DRAWDOWN', def: 'Peak-to-trough decline in account value during a period.' },
    { term: 'EMA', def: 'Exponential Moving Average: moving average that weights recent prices more heavily.' },
    { term: 'ENTRY', def: 'Point at which a trader initiates a new position or trade.' },
    { term: 'EQUITY CURVE', def: 'Graph showing account value over time; reflects cumulative trading results.' },
    { term: 'EXIT', def: 'Point at which a trader closes a position, either for profit or loss.' },
    { term: 'GAP', def: 'Jump in price between close and next open, often due to overnight news.' },
    { term: 'HEDGE', def: 'Offsetting position taken to reduce risk of an existing position.' },
    { term: 'INSTITUTIONAL', def: 'Trading by large institutions like mutual funds and pension funds.' },
    { term: 'LIQUIDITY', def: 'Ease of buying or selling a security without significantly affecting its price.' },
    { term: 'LONG POSITION', def: 'Position established by buying a security, profits if price increases.' },
    { term: 'MACD', def: 'Moving Average Convergence Divergence: momentum indicator tracking trend changes.' },
    { term: 'MEAN REVERSION', def: 'Trading strategy expecting prices to revert toward average after extremes.' },
    { term: 'MOMENTUM', def: 'Rate of price change; trending stocks show strong upside or downside momentum.' },
    { term: 'MOVING AVERAGE', def: 'Average of historical prices over a specific number of periods.' },
    { term: 'OVERBOUGHT', def: 'Situation when price has increased excessively, often signaling pullback risk.' },
    { term: 'OVERSOLD', def: 'Situation when price has decreased excessively, often signaling bounce potential.' },
    { term: 'P&L', def: 'Profit and Loss: net gain or loss from a position or trading activity.' },
    { term: 'POSITION SIZE', def: 'Number of shares held in a position; should be sized based on risk.' },
    { term: 'PROFIT TAKING', def: 'Selling a winning position to lock in gains.' },
    { term: 'PULLBACK', def: 'Temporary price decline within an overall uptrend.' },
    { term: 'RALLY', def: 'Sharp recovery or upward movement in price over a short period.' },
    { term: 'RESISTANCE', def: 'Price level where selling pressure historically prevents further upside.' },
    { term: 'RSI', def: 'Relative Strength Index: momentum oscillator measuring overbought/oversold levels.' },
    { term: 'SCALPING', def: 'Trading strategy making small profits on many quick trades.' },
    { term: 'SECTOR', def: 'Industry group within the stock market (tech, healthcare, energy, etc.).' },
    { term: 'SHORT POSITION', def: 'Position established by selling a security not owned, profits if price falls.' },
    { term: 'SLIPPAGE', def: 'Difference between expected execution price and actual execution price.' },
    { term: 'SUPPORT', def: 'Price level where buying pressure historically prevents further downside.' },
    { term: 'SWING TRADE', def: 'Trade held for multiple days to weeks, capturing larger price swings.' },
    { term: 'TECHNICAL ANALYSIS', def: 'Study of price and volume patterns to forecast future price movements.' },
    { term: 'TREND', def: 'Sustained directional movement in price over time (uptrend or downtrend).' },
    { term: 'VOLATILITY', def: 'Measure of price fluctuation; high volatility means larger price swings.' },
    { term: 'VOLUME', def: 'Number of shares traded during a period; indicates participation level.' },
    { term: 'VOLUME PROFILE', def: 'Distribution showing how much trading occurred at each price level.' },
    { term: 'WIN RATE', def: 'Percentage of trades that are profitable; professional traders target 50%+.' }
  ];

  return [
    createSectionHeading('Appendix B: Vocabulary & Glossary'),
    new Paragraph({ text: '' }),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      columnWidths: [2000, 8000],
      borders: {
        top: { style: BorderStyle.SINGLE, size: 3, color: COLORS.primary },
        bottom: { style: BorderStyle.SINGLE, size: 3, color: COLORS.primary },
        left: { style: BorderStyle.SINGLE, size: 3, color: COLORS.primary },
        right: { style: BorderStyle.SINGLE, size: 3, color: COLORS.primary },
        insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: COLORS.border },
        insideVertical: { style: BorderStyle.SINGLE, size: 1, color: COLORS.border }
      },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              shading: { fill: COLORS.navy, type: ShadingType.CLEAR },
              margins: { top: 80, bottom: 80, left: 120, right: 120 },
              children: [
                new Paragraph({
                  text: 'Term',
                  bold: true,
                  color: COLORS.white,
                  size: 22
                })
              ]
            }),
            new TableCell({
              shading: { fill: COLORS.navy, type: ShadingType.CLEAR },
              margins: { top: 80, bottom: 80, left: 120, right: 120 },
              children: [
                new Paragraph({
                  text: 'Definition',
                  bold: true,
                  color: COLORS.white,
                  size: 22
                })
              ]
            })
          ]
        }),
        ...terms.map(
          item =>
            new TableRow({
              children: [
                new TableCell({
                  shading: { fill: COLORS.lightBg, type: ShadingType.CLEAR },
                  margins: { top: 80, bottom: 80, left: 120, right: 120 },
                  children: [
                    new Paragraph({
                      text: item.term,
                      bold: true,
                      size: 20,
                      color: COLORS.darkText
                    })
                  ]
                }),
                new TableCell({
                  shading: { fill: COLORS.lightText, type: ShadingType.CLEAR },
                  margins: { top: 80, bottom: 80, left: 120, right: 120 },
                  children: [
                    new Paragraph({
                      text: item.def,
                      size: 20,
                      color: COLORS.darkText,
                      alignment: AlignmentType.LEFT
                    })
                  ]
                })
              ]
            })
        )
      ]
    }),
    new Paragraph({ text: '' }),
    new Paragraph({
      children: [new TextRun({ text: '', break: 1 })]
    })
  ];
}

// Appendix C: FAQ
function createAppendixC() {
  return [
    createSectionHeading('Appendix C: Frequently Asked Questions'),
    new Paragraph({ text: '' }),
    createSubHeading('Getting Started'),
    new Paragraph({
      text: 'Q: Is MODUS available on mobile devices?',
      bold: true,
      spacing: { after: 150, line: 320 },
      size: 22
    }),
    new Paragraph({
      text: 'A: Yes! MODUS is fully responsive and works seamlessly on smartphones and tablets. You can also install MODUS as a PWA for a native app-like experience.',
      spacing: { after: 300, line: 320 },
      size: 22
    }),
    new Paragraph({
      text: 'Q: Do I need to connect my broker account to use MODUS?',
      bold: true,
      spacing: { after: 150, line: 320 },
      size: 22
    }),
    new Paragraph({
      text: 'A: No, MODUS functions as a standalone analysis and journaling platform. Broker integration is optional and only required if you want automatic position tracking.',
      spacing: { after: 300, line: 320 },
      size: 22
    }),

    new Paragraph({ text: '' }),
    createSubHeading('AI Features'),
    new Paragraph({
      text: 'Q: How accurate are the AI trade recommendations?',
      bold: true,
      spacing: { after: 150, line: 320 },
      size: 22
    }),
    new Paragraph({
      text: 'A: MODUS AI provides guidance based on technical analysis, not guaranteed predictions. No system is 100% accurate. Always use AI insights as one input among many in your decision-making process. Past performance does not guarantee future results.',
      spacing: { after: 300, line: 320 },
      size: 22
    }),
    new Paragraph({
      text: 'Q: Can I customize the AI analysis parameters?',
      bold: true,
      spacing: { after: 150, line: 320 },
      size: 22
    }),
    new Paragraph({
      text: 'A: Yes, in the Settings menu you can adjust which indicators the AI considers, timeframes for analysis, and risk parameters for trade recommendations.',
      spacing: { after: 300, line: 320 },
      size: 22
    }),

    new Paragraph({ text: '' }),
    createSubHeading('Trading & Security'),
    new Paragraph({
      text: 'Q: Is my trading data secure?',
      bold: true,
      spacing: { after: 150, line: 320 },
      size: 22
    }),
    new Paragraph({
      text: 'A: MODUS uses enterprise-grade encryption for all data in transit and at rest. We never store broker credentials or API keys in plain text. Your trading journal is private unless you explicitly share it.',
      spacing: { after: 300, line: 320 },
      size: 22
    }),
    new Paragraph({
      text: 'Q: Can I execute real trades directly from MODUS?',
      bold: true,
      spacing: { after: 150, line: 320 },
      size: 22
    }),
    new Paragraph({
      text: 'A: If you connect a supported broker via API, yes. Otherwise, MODUS is designed for analysis and planning. You would execute trades through your broker\'s platform.',
      spacing: { after: 300, line: 320 },
      size: 22
    }),

    new Paragraph({ text: '' }),
    createSubHeading('Trading Journal'),
    new Paragraph({
      text: 'Q: Can I manually enter historical trades?',
      bold: true,
      spacing: { after: 150, line: 320 },
      size: 22
    }),
    new Paragraph({
      text: 'A: Yes, the Trading Journal allows manual entry of past trades. Enter the symbol, entry/exit prices, dates, and any notes. Historical trades count toward your performance metrics and equity curve.',
      spacing: { after: 300, line: 320 },
      size: 22
    }),
    new Paragraph({
      text: 'Q: How do I export my trading journal?',
      bold: true,
      spacing: { after: 150, line: 320 },
      size: 22
    }),
    new Paragraph({
      text: 'A: Click the Export button in the Trading Journal. Your trades are exported to CSV format, which you can import into spreadsheets for additional analysis.',
      spacing: { after: 300, line: 320 },
      size: 22
    }),

    new Paragraph({ text: '' }),
    createSubHeading('Community & Sharing'),
    new Paragraph({
      text: 'Q: Can I keep my trades private?',
      bold: true,
      spacing: { after: 150, line: 320 },
      size: 22
    }),
    new Paragraph({
      text: 'A: Yes, your trading journal is private by default. You can share individual trades with the community or specific users if you choose.',
      spacing: { after: 300, line: 320 },
      size: 22
    }),
    new Paragraph({
      text: 'Q: How do I block or report inappropriate community posts?',
      bold: true,
      spacing: { after: 150, line: 320 },
      size: 22
    }),
    new Paragraph({
      text: 'A: Click the three-dot menu on any post and select "Report" or "Block User." Our moderation team reviews reports within 24 hours.',
      spacing: { after: 300, line: 320 },
      size: 22
    }),

    new Paragraph({ text: '' }),
    createSubHeading('Troubleshooting'),
    new Paragraph({
      text: 'Q: The app is running slowly. What can I do?',
      bold: true,
      spacing: { after: 150, line: 320 },
      size: 22
    }),
    new Paragraph({
      text: 'A: Try clearing your browser cache, disabling unnecessary widgets, reducing the number of stocks in your watchlists, or switching to a different browser.',
      spacing: { after: 300, line: 320 },
      size: 22
    }),
    new Paragraph({
      text: 'Q: I forgot my password. How do I reset it?',
      bold: true,
      spacing: { after: 150, line: 320 },
      size: 22
    }),
    new Paragraph({
      text: 'A: Click "Forgot Password" on the login page. Enter your email address and you\'ll receive a password reset link. Follow the link and set a new password.',
      spacing: { after: 300, line: 320 },
      size: 22
    }),
    new Paragraph({
      text: 'Q: Where can I get support or report bugs?',
      bold: true,
      spacing: { after: 150, line: 320 },
      size: 22
    }),
    new Paragraph({
      text: 'A: Visit our support portal at support.modus.trading, email support@modus.trading, or use the Help button within the app. We typically respond within 24 hours.',
      spacing: { after: 300, line: 320 },
      size: 22
    })
  ];
}

// Build the complete document
async function generateDocument() {
  try {
    const sections = [
      ...createCoverPage(),
      ...createChapter1(),
      ...createChapter2(),
      ...createChapter3(),
      ...createChapter4(),
      ...createChapter5New(),
      ...createChapter6Old(),
      ...createChapter5(),
      ...createChapter6(),
      ...createChapter7(),
      ...createChapter8(),
      ...createChapter9(),
      ...createChapter10(),
      ...createChapter11(),
      ...createAppendixA(),
      ...createAppendixB(),
      ...createAppendixC()
    ];

    const doc = new Document({
      sections: [
        {
          size: {
            width: 12240,
            height: 15840
          },
          margins: {
            top: 1080,
            right: 1080,
            bottom: 1080,
            left: 1080
          },
          children: sections
        }
      ]
    });

    const buffer = await Packer.toBuffer(doc);
    const outputPath = '/sessions/magical-ecstatic-mccarthy/mnt/Tradevision_MODUS/MODUS_Complete_Guide.docx';

    fs.writeFileSync(outputPath, buffer);
    console.log(`✓ Document successfully created: ${outputPath}`);
    console.log(`✓ File size: ${(buffer.length / 1024 / 1024).toFixed(2)} MB`);
    console.log(`✓ Document contains 13 chapters plus 3 appendices`);
    console.log(`✓ Ready for distribution and use!`);
  } catch (error) {
    console.error('Error generating document:', error);
    process.exit(1);
  }
}

generateDocument();
