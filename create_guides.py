#!/usr/bin/env python3
"""
MODUS Trading Dashboard - User Guides Generator
Creates professional PDF guides for Beginner, Amateur, and Advanced users
"""

from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.colors import HexColor, white, black
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, ListFlowable, ListItem
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY
from reportlab.pdfgen import canvas

# Custom Colors (matching MODUS theme)
VIOLET = HexColor('#8B5CF6')
PURPLE = HexColor('#A855F7')
DARK_BG = HexColor('#1E1B4B')
SLATE = HexColor('#64748B')
EMERALD = HexColor('#10B981')
AMBER = HexColor('#F59E0B')

def create_styles():
    """Create custom paragraph styles"""
    styles = getSampleStyleSheet()

    # Title style
    styles.add(ParagraphStyle(
        name='CustomTitle',
        parent=styles['Title'],
        fontSize=28,
        textColor=VIOLET,
        spaceAfter=30,
        alignment=TA_CENTER,
        fontName='Helvetica-Bold'
    ))

    # Subtitle
    styles.add(ParagraphStyle(
        name='Subtitle',
        parent=styles['Normal'],
        fontSize=14,
        textColor=SLATE,
        spaceAfter=20,
        alignment=TA_CENTER
    ))

    # Section Header
    styles.add(ParagraphStyle(
        name='SectionHeader',
        parent=styles['Heading1'],
        fontSize=18,
        textColor=VIOLET,
        spaceBefore=20,
        spaceAfter=12,
        fontName='Helvetica-Bold'
    ))

    # Subsection Header
    styles.add(ParagraphStyle(
        name='SubsectionHeader',
        parent=styles['Heading2'],
        fontSize=14,
        textColor=PURPLE,
        spaceBefore=15,
        spaceAfter=8,
        fontName='Helvetica-Bold'
    ))

    # Body text
    styles.add(ParagraphStyle(
        name='CustomBody',
        parent=styles['Normal'],
        fontSize=11,
        textColor=black,
        spaceAfter=8,
        alignment=TA_JUSTIFY,
        leading=14
    ))

    # Tip box text
    styles.add(ParagraphStyle(
        name='TipText',
        parent=styles['Normal'],
        fontSize=10,
        textColor=EMERALD,
        spaceAfter=6,
        leftIndent=10
    ))

    # Warning text
    styles.add(ParagraphStyle(
        name='WarningText',
        parent=styles['Normal'],
        fontSize=10,
        textColor=AMBER,
        spaceAfter=6,
        leftIndent=10
    ))

    # Bullet point
    styles.add(ParagraphStyle(
        name='BulletText',
        parent=styles['Normal'],
        fontSize=11,
        textColor=black,
        leftIndent=20,
        spaceAfter=4
    ))

    return styles

def add_cover_page(story, styles, title, subtitle, level_color):
    """Add a cover page to the guide"""
    story.append(Spacer(1, 2*inch))

    # Main title
    story.append(Paragraph("MODUS", styles['CustomTitle']))
    story.append(Paragraph("Trading Dashboard", styles['Subtitle']))
    story.append(Spacer(1, 0.5*inch))

    # Guide level
    level_style = ParagraphStyle(
        name='LevelTitle',
        parent=styles['Title'],
        fontSize=24,
        textColor=level_color,
        alignment=TA_CENTER
    )
    story.append(Paragraph(title, level_style))
    story.append(Spacer(1, 0.3*inch))
    story.append(Paragraph(subtitle, styles['Subtitle']))

    story.append(Spacer(1, 2*inch))

    # Version info
    story.append(Paragraph("Version 35 - Complete Edition", styles['Subtitle']))
    story.append(Paragraph("https://modus-trading.vercel.app", styles['Subtitle']))

    story.append(PageBreak())

def add_toc(story, styles, sections):
    """Add table of contents"""
    story.append(Paragraph("Table of Contents", styles['SectionHeader']))
    story.append(Spacer(1, 0.2*inch))

    for i, section in enumerate(sections, 1):
        story.append(Paragraph(f"{i}. {section}", styles['CustomBody']))

    story.append(PageBreak())

def create_beginner_guide():
    """Create the Beginner's Guide PDF"""
    doc = SimpleDocTemplate(
        "/sessions/gifted-charming-curie/mnt/Tradevision_MODUS/MODUS_Beginners_Guide.pdf",
        pagesize=letter,
        rightMargin=0.75*inch,
        leftMargin=0.75*inch,
        topMargin=0.75*inch,
        bottomMargin=0.75*inch
    )

    styles = create_styles()
    story = []

    # Cover Page
    add_cover_page(story, styles, "Beginner's Guide", "Your First Steps to Smarter Trading", EMERALD)

    # Table of Contents
    sections = [
        "What is MODUS?",
        "Getting Started",
        "Understanding the Dashboard",
        "Your First Chart Analysis",
        "Setting Up Price Alerts",
        "Using Ask AI",
        "Essential Tips for Beginners"
    ]
    add_toc(story, styles, sections)

    # Section 1: What is MODUS?
    story.append(Paragraph("1. What is MODUS?", styles['SectionHeader']))
    story.append(Paragraph(
        "MODUS is an AI-powered trading dashboard designed to help traders make informed decisions. "
        "It combines real-time market data with artificial intelligence to provide chart analysis, "
        "price alerts, and trading insights - all in one intuitive interface.",
        styles['CustomBody']
    ))
    story.append(Spacer(1, 0.1*inch))

    story.append(Paragraph("Key Features:", styles['SubsectionHeader']))
    features = [
        "Live stock charts with real-time price updates",
        "AI-powered chart analysis that identifies patterns and trends",
        "Price alerts with SMS and browser notifications",
        "Daily Pick - AI selects the best trading opportunity each day",
        "Ask AI - Get answers to any trading question",
        "Position sizing calculator for risk management",
        "Trading journal to track your trades"
    ]
    for feature in features:
        story.append(Paragraph(f"• {feature}", styles['BulletText']))

    story.append(PageBreak())

    # Section 2: Getting Started
    story.append(Paragraph("2. Getting Started", styles['SectionHeader']))

    story.append(Paragraph("Step 1: Access the App", styles['SubsectionHeader']))
    story.append(Paragraph(
        "Open your web browser and navigate to modus-trading.vercel.app. The app works on any device - "
        "desktop, tablet, or mobile phone. No download or installation required!",
        styles['CustomBody']
    ))

    story.append(Paragraph("Step 2: Enable Notifications", styles['SubsectionHeader']))
    story.append(Paragraph(
        "When prompted, click 'Allow' to enable browser notifications. This lets MODUS alert you "
        "when your price alerts trigger, even if you're in another tab.",
        styles['CustomBody']
    ))

    story.append(Paragraph("Step 3: Add Your API Key (Optional)", styles['SubsectionHeader']))
    story.append(Paragraph(
        "For AI features, click the Settings gear icon and enter your Anthropic API key. "
        "You can also enable 'Backend API' mode if available, which stores your key securely on the server.",
        styles['CustomBody']
    ))

    story.append(Paragraph("TIP: Keep the browser tab open for alerts to work!", styles['TipText']))

    story.append(PageBreak())

    # Section 3: Understanding the Dashboard
    story.append(Paragraph("3. Understanding the Dashboard", styles['SectionHeader']))

    story.append(Paragraph("The Sidebar (Left Side)", styles['SubsectionHeader']))
    story.append(Paragraph(
        "The sidebar contains all navigation options organized into categories:",
        styles['CustomBody']
    ))

    nav_items = [
        ("Live Ticker", "View real-time charts for any stock"),
        ("Market Overview", "See overall market conditions and indices"),
        ("Chart Analysis", "Get AI-powered analysis of any chart"),
        ("Alerts", "Set and manage price alerts"),
        ("Daily Pick", "AI's top trading pick for the day"),
        ("Ask AI", "Ask any trading question"),
        ("Journal", "Track and analyze your trades"),
        ("Portfolio", "Monitor your holdings")
    ]

    for item, desc in nav_items:
        story.append(Paragraph(f"<b>{item}</b> - {desc}", styles['BulletText']))

    story.append(Paragraph("The Header (Top)", styles['SubsectionHeader']))
    story.append(Paragraph(
        "The header shows the current time, a status indicator showing background activity, "
        "and quick access buttons for Position Sizer, History, and Settings.",
        styles['CustomBody']
    ))

    story.append(PageBreak())

    # Section 4: Your First Chart Analysis
    story.append(Paragraph("4. Your First Chart Analysis", styles['SectionHeader']))

    steps = [
        ("Click 'Live Ticker'", "Select it from the sidebar to open the chart view."),
        ("Enter a Stock Symbol", "Type a ticker symbol like AAPL, TSLA, or SPY in the search box."),
        ("Click 'Get Live Data'", "This loads the real-time chart for your selected stock."),
        ("Choose a Timeframe", "Select from 1 minute to 1 month views. Start with '1 Day' for beginners."),
        ("Click 'Chart Analysis'", "Navigate to the Chart Analysis section in the sidebar."),
        ("Run the Analysis", "Click 'Analyze Chart' and wait 5-10 seconds for the AI to process."),
        ("Read the Results", "The AI provides trend direction, support/resistance levels, and trade suggestions.")
    ]

    for i, (step, desc) in enumerate(steps, 1):
        story.append(Paragraph(f"<b>Step {i}: {step}</b>", styles['CustomBody']))
        story.append(Paragraph(desc, styles['BulletText']))

    story.append(Spacer(1, 0.2*inch))
    story.append(Paragraph("TIP: The AI works best with 1-hour or 1-day timeframes for clearer patterns.", styles['TipText']))

    story.append(PageBreak())

    # Section 5: Setting Up Price Alerts
    story.append(Paragraph("5. Setting Up Price Alerts", styles['SectionHeader']))

    story.append(Paragraph(
        "Price alerts notify you when a stock reaches your target price. You'll hear 3 rapid beeps "
        "and can optionally receive SMS notifications.",
        styles['CustomBody']
    ))

    story.append(Paragraph("Creating an Alert:", styles['SubsectionHeader']))
    alert_steps = [
        "Go to 'Alerts' in the sidebar",
        "Click 'Create Alert'",
        "Enter the stock symbol (e.g., AAPL)",
        "Choose condition: Above, Below, or Equals",
        "Enter your target price",
        "Click 'Create Alert'"
    ]
    for step in alert_steps:
        story.append(Paragraph(f"• {step}", styles['BulletText']))

    story.append(Paragraph("Setting Up SMS Alerts:", styles['SubsectionHeader']))
    story.append(Paragraph(
        "In Settings, enable SMS Alerts, enter your phone number, and select your carrier. "
        "When an alert triggers, you'll receive a text message!",
        styles['CustomBody']
    ))

    story.append(Paragraph("WARNING: Keep the browser tab open - alerts only work when the app is running.", styles['WarningText']))

    story.append(PageBreak())

    # Section 6: Using Ask AI
    story.append(Paragraph("6. Using Ask AI", styles['SectionHeader']))

    story.append(Paragraph(
        "Ask AI is your personal trading mentor. You can ask any question about trading, "
        "technical analysis, chart patterns, risk management, and more.",
        styles['CustomBody']
    ))

    story.append(Paragraph("Example Questions to Ask:", styles['SubsectionHeader']))
    questions = [
        "What is a head and shoulders pattern?",
        "How do I calculate position size?",
        "What does RSI mean and how do I use it?",
        "Explain support and resistance levels",
        "What's the difference between a limit and market order?",
        "How much should I risk per trade?"
    ]
    for q in questions:
        story.append(Paragraph(f"• \"{q}\"", styles['BulletText']))

    story.append(Spacer(1, 0.2*inch))
    story.append(Paragraph("TIP: Be specific in your questions for more detailed answers.", styles['TipText']))

    story.append(PageBreak())

    # Section 7: Essential Tips
    story.append(Paragraph("7. Essential Tips for Beginners", styles['SectionHeader']))

    tips = [
        ("Start with Paper Trading", "Practice with simulated money before risking real capital."),
        ("Use Longer Timeframes", "1-hour and daily charts are easier to read than 1-minute charts."),
        ("Set Stop Losses", "Always know your exit point before entering a trade."),
        ("Don't Overtrade", "Quality over quantity - wait for good setups."),
        ("Keep a Trading Journal", "Use the Journal feature to track and learn from your trades."),
        ("Trust the Process", "Consistent small gains beat occasional big wins."),
        ("Keep Learning", "Use Ask AI to continuously expand your trading knowledge.")
    ]

    for title, desc in tips:
        story.append(Paragraph(f"<b>{title}</b>", styles['CustomBody']))
        story.append(Paragraph(desc, styles['BulletText']))
        story.append(Spacer(1, 0.1*inch))

    # Build PDF
    doc.build(story)
    print("Created: MODUS_Beginners_Guide.pdf")

def create_amateur_guide():
    """Create the Amateur Guide PDF"""
    doc = SimpleDocTemplate(
        "/sessions/gifted-charming-curie/mnt/Tradevision_MODUS/MODUS_Amateur_Guide.pdf",
        pagesize=letter,
        rightMargin=0.75*inch,
        leftMargin=0.75*inch,
        topMargin=0.75*inch,
        bottomMargin=0.75*inch
    )

    styles = create_styles()
    story = []

    # Cover Page
    add_cover_page(story, styles, "Amateur Guide", "Level Up Your Trading Game", AMBER)

    # Table of Contents
    sections = [
        "Multi-Timeframe Analysis",
        "Advanced Chart Analysis Features",
        "Optimizing Daily Pick",
        "Position Sizing Mastery",
        "Options Trading Module",
        "Portfolio Management",
        "Backtesting Strategies",
        "Market Overview Deep Dive"
    ]
    add_toc(story, styles, sections)

    # Section 1: Multi-Timeframe Analysis
    story.append(Paragraph("1. Multi-Timeframe Analysis", styles['SectionHeader']))
    story.append(Paragraph(
        "Multi-timeframe analysis involves looking at the same asset across different time periods "
        "to gain a complete picture. This technique helps identify the overall trend while finding "
        "precise entry points.",
        styles['CustomBody']
    ))

    story.append(Paragraph("How to Use It in MODUS:", styles['SubsectionHeader']))
    steps = [
        "Go to 'Multi-Timeframe' in the sidebar",
        "Enter your stock symbol",
        "Click 'Analyze All Timeframes'",
        "Review the analysis for each timeframe (5m, 15m, 1h, 4h, Daily)",
        "Look for alignment - when all timeframes agree on direction"
    ]
    for step in steps:
        story.append(Paragraph(f"• {step}", styles['BulletText']))

    story.append(Paragraph("The Golden Rule:", styles['SubsectionHeader']))
    story.append(Paragraph(
        "Trade in the direction of the higher timeframe. If the daily chart shows an uptrend, "
        "look for buy signals on the 1-hour chart. Going against the larger trend is risky.",
        styles['CustomBody']
    ))

    story.append(PageBreak())

    # Section 2: Advanced Chart Analysis
    story.append(Paragraph("2. Advanced Chart Analysis Features", styles['SectionHeader']))

    story.append(Paragraph("Understanding the Analysis Output:", styles['SubsectionHeader']))
    story.append(Paragraph(
        "The AI chart analysis provides several key pieces of information:",
        styles['CustomBody']
    ))

    analysis_parts = [
        ("Trend Direction", "Whether the stock is in an uptrend, downtrend, or ranging"),
        ("Support Levels", "Price levels where buying pressure may increase"),
        ("Resistance Levels", "Price levels where selling pressure may increase"),
        ("Key Patterns", "Chart patterns like triangles, flags, or head & shoulders"),
        ("Volume Analysis", "Whether volume confirms the price action"),
        ("Trade Setup", "Specific entry, stop loss, and target prices"),
        ("Confidence Score", "How confident the AI is in its analysis")
    ]

    for term, definition in analysis_parts:
        story.append(Paragraph(f"<b>{term}:</b> {definition}", styles['BulletText']))

    story.append(Paragraph("Consistent Mode:", styles['SubsectionHeader']))
    story.append(Paragraph(
        "MODUS uses a 5-pass analysis system for maximum consistency. The AI analyzes the chart "
        "multiple times and reconciles any differences, giving you more reliable results.",
        styles['CustomBody']
    ))

    story.append(PageBreak())

    # Section 3: Optimizing Daily Pick
    story.append(Paragraph("3. Optimizing Daily Pick", styles['SectionHeader']))

    story.append(Paragraph(
        "Daily Pick scans hundreds of stocks to find the best trading opportunity. You can customize "
        "it to match your trading style.",
        styles['CustomBody']
    ))

    story.append(Paragraph("Filter Options:", styles['SubsectionHeader']))
    filters = [
        ("Sector", "Focus on specific sectors like Technology, Healthcare, or Energy"),
        ("Strategy", "Choose between momentum, mean reversion, or breakout strategies"),
        ("Volatility", "Select low, medium, or high volatility stocks"),
        ("Market Cap", "Filter by company size (small, mid, or large cap)")
    ]
    for name, desc in filters:
        story.append(Paragraph(f"<b>{name}:</b> {desc}", styles['BulletText']))

    story.append(Paragraph("Best Practices:", styles['SubsectionHeader']))
    practices = [
        "Run Daily Pick before market open (9:30 AM EST)",
        "Cross-reference with Chart Analysis for confirmation",
        "Check the stock's earnings date to avoid surprises",
        "Start with medium volatility if you're new to Daily Pick"
    ]
    for p in practices:
        story.append(Paragraph(f"• {p}", styles['BulletText']))

    story.append(PageBreak())

    # Section 4: Position Sizing
    story.append(Paragraph("4. Position Sizing Mastery", styles['SectionHeader']))

    story.append(Paragraph(
        "Proper position sizing is the difference between surviving and thriving in trading. "
        "The Position Sizer tool helps you calculate exactly how many shares to buy.",
        styles['CustomBody']
    ))

    story.append(Paragraph("The Formula:", styles['SubsectionHeader']))
    story.append(Paragraph(
        "Position Size = (Account Risk) / (Entry Price - Stop Loss)",
        styles['CustomBody']
    ))

    story.append(Paragraph("Example:", styles['SubsectionHeader']))
    example = [
        "Account Size: $10,000",
        "Risk per Trade: 2% = $200",
        "Entry Price: $50.00",
        "Stop Loss: $48.00",
        "Risk per Share: $2.00",
        "Position Size: $200 / $2 = 100 shares"
    ]
    for line in example:
        story.append(Paragraph(f"• {line}", styles['BulletText']))

    story.append(Paragraph("TIP: Never risk more than 2% of your account on a single trade.", styles['TipText']))

    story.append(PageBreak())

    # Section 5: Options Trading
    story.append(Paragraph("5. Options Trading Module", styles['SectionHeader']))

    story.append(Paragraph(
        "MODUS includes a powerful options trading module for those looking to trade derivatives. "
        "Access it through 'Options Trading' in the sidebar.",
        styles['CustomBody']
    ))

    story.append(Paragraph("Features:", styles['SubsectionHeader']))
    features = [
        "Options chain visualization",
        "Greeks calculation (Delta, Gamma, Theta, Vega)",
        "Probability of profit analysis",
        "Options strategy builder",
        "P/L visualization at different prices"
    ]
    for f in features:
        story.append(Paragraph(f"• {f}", styles['BulletText']))

    story.append(Paragraph("WARNING: Options are complex instruments. Make sure you understand them before trading.", styles['WarningText']))

    story.append(PageBreak())

    # Section 6: Portfolio Management
    story.append(Paragraph("6. Portfolio Management", styles['SectionHeader']))

    story.append(Paragraph(
        "Track all your holdings in one place with the Portfolio feature. Add positions manually "
        "and watch them update in real-time.",
        styles['CustomBody']
    ))

    story.append(Paragraph("Adding a Position:", styles['SubsectionHeader']))
    steps = [
        "Go to 'Portfolio' in the sidebar",
        "Click 'Add Position'",
        "Enter symbol, quantity, and entry price",
        "Click 'Save'"
    ]
    for step in steps:
        story.append(Paragraph(f"• {step}", styles['BulletText']))

    story.append(Paragraph("Portfolio Metrics:", styles['SubsectionHeader']))
    story.append(Paragraph(
        "View total value, daily P/L, overall return percentage, and individual position performance. "
        "The portfolio automatically updates prices every 10 seconds during market hours.",
        styles['CustomBody']
    ))

    story.append(PageBreak())

    # Section 7: Backtesting
    story.append(Paragraph("7. Backtesting Strategies", styles['SectionHeader']))

    story.append(Paragraph(
        "The Backtest feature lets you test trading strategies against historical data to see how "
        "they would have performed.",
        styles['CustomBody']
    ))

    story.append(Paragraph("How to Backtest:", styles['SubsectionHeader']))
    steps = [
        "Go to 'Backtest' in the sidebar",
        "Select a stock symbol",
        "Choose your strategy parameters",
        "Set the time period to test",
        "Click 'Run Backtest'",
        "Review the results and performance metrics"
    ]
    for step in steps:
        story.append(Paragraph(f"• {step}", styles['BulletText']))

    story.append(Paragraph("Key Metrics to Watch:", styles['SubsectionHeader']))
    metrics = [
        ("Win Rate", "Percentage of profitable trades"),
        ("Profit Factor", "Gross profit / Gross loss (above 1.5 is good)"),
        ("Max Drawdown", "Largest peak-to-trough decline"),
        ("Sharpe Ratio", "Risk-adjusted returns")
    ]
    for name, desc in metrics:
        story.append(Paragraph(f"<b>{name}:</b> {desc}", styles['BulletText']))

    story.append(PageBreak())

    # Section 8: Market Overview
    story.append(Paragraph("8. Market Overview Deep Dive", styles['SectionHeader']))

    story.append(Paragraph(
        "The Market Overview provides a bird's-eye view of overall market conditions. "
        "Check it before trading to understand the market environment.",
        styles['CustomBody']
    ))

    story.append(Paragraph("What You'll See:", styles['SubsectionHeader']))
    overview_items = [
        ("Market Status", "Pre-market, Open, After-hours, or Closed"),
        ("Major Indices", "S&P 500, NASDAQ, DOW performance"),
        ("Sector Performance", "Which sectors are leading or lagging"),
        ("VIX (Fear Index)", "Market volatility indicator"),
        ("Market Breadth", "Advance/decline ratio"),
        ("Economic Calendar", "Upcoming events that may impact markets")
    ]
    for name, desc in overview_items:
        story.append(Paragraph(f"<b>{name}:</b> {desc}", styles['BulletText']))

    story.append(Paragraph("TIP: High VIX (above 20) indicates fear - be cautious with position sizes.", styles['TipText']))

    # Build PDF
    doc.build(story)
    print("Created: MODUS_Amateur_Guide.pdf")

def create_advanced_guide():
    """Create the Advanced Guide PDF"""
    doc = SimpleDocTemplate(
        "/sessions/gifted-charming-curie/mnt/Tradevision_MODUS/MODUS_Advanced_Guide.pdf",
        pagesize=letter,
        rightMargin=0.75*inch,
        leftMargin=0.75*inch,
        topMargin=0.75*inch,
        bottomMargin=0.75*inch
    )

    styles = create_styles()
    story = []

    # Cover Page
    add_cover_page(story, styles, "Advanced Guide", "Master the Markets with MODUS", VIOLET)

    # Table of Contents
    sections = [
        "API Configuration & Backend Mode",
        "SMS Alert System Architecture",
        "Advanced AI Analysis Techniques",
        "Custom Scanning Strategies",
        "Risk Management Framework",
        "Correlation & Sector Analysis",
        "Deployment & Customization",
        "Performance Optimization"
    ]
    add_toc(story, styles, sections)

    # Section 1: API Configuration
    story.append(Paragraph("1. API Configuration & Backend Mode", styles['SectionHeader']))

    story.append(Paragraph("Direct API Mode:", styles['SubsectionHeader']))
    story.append(Paragraph(
        "In Direct mode, your API key is stored locally in your browser. Each AI request sends "
        "the key directly to Anthropic's servers. This is simple but means you need to enter "
        "your key on each device.",
        styles['CustomBody']
    ))

    story.append(Paragraph("Backend API Mode:", styles['SubsectionHeader']))
    story.append(Paragraph(
        "Backend mode stores your API key securely on Vercel's servers as an environment variable. "
        "Benefits include: no key exposure in browser, works across all devices, centralized management.",
        styles['CustomBody']
    ))

    story.append(Paragraph("Setting Up Backend Mode:", styles['SubsectionHeader']))
    steps = [
        "Fork the MODUS repository on GitHub",
        "Deploy to Vercel",
        "Add ANTHROPIC_API_KEY to Vercel Environment Variables",
        "Enable 'Use Backend API' in MODUS settings"
    ]
    for step in steps:
        story.append(Paragraph(f"• {step}", styles['BulletText']))

    story.append(PageBreak())

    # Section 2: SMS Architecture
    story.append(Paragraph("2. SMS Alert System Architecture", styles['SectionHeader']))

    story.append(Paragraph("How It Works:", styles['SubsectionHeader']))
    story.append(Paragraph(
        "MODUS uses email-to-SMS gateways to send free text messages. When an alert triggers, "
        "the app sends an email to your carrier's gateway (e.g., 5551234567@tmomail.net), "
        "which converts it to an SMS.",
        styles['CustomBody']
    ))

    story.append(Paragraph("Supported Carriers:", styles['SubsectionHeader']))
    carriers = [
        "AT&T (txt.att.net)",
        "Verizon (vtext.com)",
        "T-Mobile (tmomail.net)",
        "Sprint (messaging.sprintpcs.com)",
        "US Cellular (email.uscc.net)",
        "Metro PCS (mymetropcs.net)",
        "Cricket (sms.cricketwireless.net)",
        "Google Fi (msg.fi.google.com)"
    ]
    for c in carriers:
        story.append(Paragraph(f"• {c}", styles['BulletText']))

    story.append(Paragraph("EmailJS Configuration:", styles['SubsectionHeader']))
    story.append(Paragraph(
        "MODUS uses EmailJS to send emails from the browser. The service ID, template ID, and "
        "public key are configured in the app. Free tier allows 200 emails/month.",
        styles['CustomBody']
    ))

    story.append(PageBreak())

    # Section 3: Advanced AI Techniques
    story.append(Paragraph("3. Advanced AI Analysis Techniques", styles['SectionHeader']))

    story.append(Paragraph("5-Pass Consistency System:", styles['SubsectionHeader']))
    story.append(Paragraph(
        "MODUS runs the AI analysis 5 times and reconciles the results. This eliminates random "
        "variations in AI output, giving you consistent and reliable analysis every time.",
        styles['CustomBody']
    ))

    story.append(Paragraph("Maximizing AI Accuracy:", styles['SubsectionHeader']))
    tips = [
        "Use clean, trending charts - AI performs better with clear patterns",
        "Avoid very short timeframes (1m) - more noise, less signal",
        "Check during high-volume periods for better price action",
        "Cross-reference with multi-timeframe analysis",
        "Use the confidence score to gauge reliability"
    ]
    for tip in tips:
        story.append(Paragraph(f"• {tip}", styles['BulletText']))

    story.append(Paragraph("Prompt Engineering:", styles['SubsectionHeader']))
    story.append(Paragraph(
        "When using Ask AI, frame your questions with context for better answers. Instead of "
        "'Is AAPL good?', try 'Given the current tech sector rotation and AAPL's recent earnings, "
        "what technical levels should I watch for a swing trade entry?'",
        styles['CustomBody']
    ))

    story.append(PageBreak())

    # Section 4: Custom Scanning
    story.append(Paragraph("4. Custom Scanning Strategies", styles['SectionHeader']))

    story.append(Paragraph("Daily Pick Optimization:", styles['SubsectionHeader']))
    story.append(Paragraph(
        "The Daily Pick scanner analyzes 220+ stocks across multiple sectors. You can customize "
        "the scan by adjusting filters to match your strategy.",
        styles['CustomBody']
    ))

    story.append(Paragraph("Strategy Combinations:", styles['SubsectionHeader']))
    strategies = [
        ("Momentum + High Volatility", "Aggressive day trading setups"),
        ("Mean Reversion + Low Volatility", "Conservative swing trades"),
        ("Breakout + Technology Sector", "Tech momentum plays"),
        ("Any Strategy + Small Cap", "Higher risk/reward opportunities")
    ]
    for name, desc in strategies:
        story.append(Paragraph(f"<b>{name}:</b> {desc}", styles['BulletText']))

    story.append(Paragraph("Scan Timing:", styles['SubsectionHeader']))
    story.append(Paragraph(
        "Run scans at different times for different opportunities: pre-market (gap plays), "
        "market open (momentum), midday (mean reversion), end of day (swing setups).",
        styles['CustomBody']
    ))

    story.append(PageBreak())

    # Section 5: Risk Management
    story.append(Paragraph("5. Risk Management Framework", styles['SectionHeader']))

    story.append(Paragraph("The 2% Rule:", styles['SubsectionHeader']))
    story.append(Paragraph(
        "Never risk more than 2% of your total account on any single trade. This ensures that "
        "even a series of losses won't significantly damage your capital.",
        styles['CustomBody']
    ))

    story.append(Paragraph("Portfolio Heat:", styles['SubsectionHeader']))
    story.append(Paragraph(
        "Total portfolio heat is the sum of all open position risks. Keep total heat under 6% "
        "to maintain adequate diversification and survive correlated moves.",
        styles['CustomBody']
    ))

    story.append(Paragraph("Risk Metrics Table:", styles['SubsectionHeader']))

    risk_data = [
        ["Risk Level", "Per Trade", "Total Heat", "Max Positions"],
        ["Conservative", "1%", "3%", "3"],
        ["Moderate", "2%", "6%", "4-5"],
        ["Aggressive", "3%", "9%", "5-6"]
    ]

    t = Table(risk_data, colWidths=[1.5*inch, 1.2*inch, 1.2*inch, 1.2*inch])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), VIOLET),
        ('TEXTCOLOR', (0, 0), (-1, 0), white),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), HexColor('#F8FAFC')),
        ('GRID', (0, 0), (-1, -1), 1, SLATE)
    ]))
    story.append(t)

    story.append(PageBreak())

    # Section 6: Correlation Analysis
    story.append(Paragraph("6. Correlation & Sector Analysis", styles['SectionHeader']))

    story.append(Paragraph("Understanding Correlation:", styles['SubsectionHeader']))
    story.append(Paragraph(
        "Correlation measures how two assets move in relation to each other. A correlation of "
        "+1 means they move identically, -1 means opposite, and 0 means no relationship.",
        styles['CustomBody']
    ))

    story.append(Paragraph("Using MODUS Correlation Tool:", styles['SubsectionHeader']))
    steps = [
        "Access via Market Overview or dedicated Correlation section",
        "Enter two or more symbols to compare",
        "View the correlation matrix",
        "Use for diversification - avoid highly correlated positions"
    ]
    for step in steps:
        story.append(Paragraph(f"• {step}", styles['BulletText']))

    story.append(Paragraph("Sector Rotation:", styles['SubsectionHeader']))
    story.append(Paragraph(
        "The Sector Performance view shows which sectors are leading. In early bull markets, "
        "cyclicals lead. In late bull markets, defensives outperform. Use this to time entries.",
        styles['CustomBody']
    ))

    story.append(PageBreak())

    # Section 7: Deployment
    story.append(Paragraph("7. Deployment & Customization", styles['SectionHeader']))

    story.append(Paragraph("Self-Hosting MODUS:", styles['SubsectionHeader']))
    story.append(Paragraph(
        "MODUS is open for deployment on your own infrastructure. This gives you full control "
        "over the application and your data.",
        styles['CustomBody']
    ))

    story.append(Paragraph("Deployment Steps:", styles['SubsectionHeader']))
    deploy_steps = [
        "Clone the repository from GitHub",
        "Run 'npm install' to install dependencies",
        "Create .env.local with your API keys",
        "Run 'npm run build' to create production build",
        "Deploy to Vercel, Netlify, or your own server"
    ]
    for step in deploy_steps:
        story.append(Paragraph(f"• {step}", styles['BulletText']))

    story.append(Paragraph("Environment Variables:", styles['SubsectionHeader']))
    env_vars = [
        ("ANTHROPIC_API_KEY", "Required for AI features"),
        ("EMAILJS_SERVICE_ID", "For SMS alerts"),
        ("EMAILJS_TEMPLATE_ID", "For SMS alerts"),
        ("EMAILJS_PUBLIC_KEY", "For SMS alerts")
    ]
    for var, desc in env_vars:
        story.append(Paragraph(f"<b>{var}:</b> {desc}", styles['BulletText']))

    story.append(PageBreak())

    # Section 8: Performance
    story.append(Paragraph("8. Performance Optimization", styles['SectionHeader']))

    story.append(Paragraph("Browser Performance:", styles['SubsectionHeader']))
    tips = [
        "Use Chrome or Edge for best performance",
        "Close unused tabs to free memory",
        "Disable browser extensions while trading",
        "Use a wired internet connection for stability"
    ]
    for tip in tips:
        story.append(Paragraph(f"• {tip}", styles['BulletText']))

    story.append(Paragraph("App Settings:", styles['SubsectionHeader']))
    story.append(Paragraph(
        "MODUS checks prices every 10 seconds and the clock updates every second. This is "
        "optimized for real-time trading while maintaining smooth performance.",
        styles['CustomBody']
    ))

    story.append(Paragraph("Understanding Loading States:", styles['SubsectionHeader']))
    story.append(Paragraph(
        "The status indicator in the header shows what's currently running. AI operations "
        "(Chart Analysis, Daily Pick, Ask AI) take 3-10 seconds due to API response times. "
        "This is normal and expected.",
        styles['CustomBody']
    ))

    story.append(Spacer(1, 0.3*inch))
    story.append(Paragraph("TIP: For fastest AI responses, use during off-peak hours (early morning or late evening).", styles['TipText']))

    # Build PDF
    doc.build(story)
    print("Created: MODUS_Advanced_Guide.pdf")

if __name__ == "__main__":
    print("Creating MODUS User Guides...")
    create_beginner_guide()
    create_amateur_guide()
    create_advanced_guide()
    print("\nAll guides created successfully!")
