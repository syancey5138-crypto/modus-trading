const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
       Header, Footer, AlignmentType, LevelFormat, HeadingLevel,
       BorderStyle, WidthType, ShadingType, PageNumber, PageBreak } = require('docx');
const fs = require('fs');

// ════════════════════════════════════════════════════
// MODUS Trading Platform — Complete Detailed Change Log
// From February 5, 2026 through February 8, 2026
// ════════════════════════════════════════════════════

const VIOLET = "7C3AED";
const DARK = "0F172A";
const SLATE = "334155";
const LIGHT_BG = "F8FAFC";
const BORDER = "E2E8F0";
const GREEN = "059669";
const BLUE = "2563EB";
const AMBER = "D97706";
const RED = "DC2626";

const border = { style: BorderStyle.SINGLE, size: 1, color: BORDER };
const borders = { top: border, bottom: border, left: border, right: border };
const cellMargins = { top: 80, bottom: 80, left: 120, right: 120 };

const versions = [
  {
    version: 'v2.3.0',
    date: 'February 8, 2026',
    title: 'Community Feed, Tracking Dashboard, Risk Calculator & More',
    sections: [
      {
        type: 'Features',
        items: [
          {
            title: 'Community Feed Overhaul',
            description: 'Redesigned the Community Feed system to support three distinct modes: Local (your device only), Public (visible to all MODUS users), and Private (shared only with people who have your community code). You can now generate and share invite codes to create private trading communities. Each post displays which mode it was shared in, giving you complete control over the visibility and reach of your analysis sharing.'
          },
          {
            title: 'Anonymous Posting',
            description: 'When enabled, your posts in the Community Feed will show "Anonymous Trader" instead of your name and a "?" avatar. Great for sharing analyses without revealing your identity. Toggle this on/off from the community feed settings. Perfect for traders who want to contribute valuable analysis while maintaining privacy.'
          },
          {
            title: 'Spam Protection',
            description: 'A 30-second cooldown timer prevents rapid-fire posting to the community feed. If you try to post too soon, a notification shows how many seconds remain. This protects the community feed from spam and maintains a high signal-to-noise ratio for all users.'
          },
          {
            title: 'Price Target Tracking Dashboard',
            description: 'A dedicated section in Quick Analysis now shows ALL your tracked price targets in a comprehensive table. See the ticker, your predicted verdict, target price, stop loss, current distance to target (as a percentage), and how many days you have been tracking each position. Color-coded rows and sortable columns make it easy to scan your entire tracking portfolio at a glance.'
          },
          {
            title: 'Risk Calculator Widget',
            description: 'A new dashboard widget that helps you calculate position sizing before entering a trade. Enter your account balance, risk percentage, entry price, and stop loss — it instantly calculates your dollar risk, number of shares to buy, and total position value. Essential for proper risk management and sizing trades according to your account size.'
          },
          {
            title: 'Trade Journal Tagging',
            description: 'You can now tag each trade in your journal with a strategy type: Scalp, Swing, Day Trade, Earnings Play, Breakout, Momentum, Reversal, VWAP, or Gap Fill. Tags appear as colored badges on trade entries and help you analyze which strategies perform best. Over time, build a data-driven understanding of your strongest trading styles.'
          },
          {
            title: 'Export Trades to CSV',
            description: 'One-click button in the Journal tab downloads your entire trade history as a CSV file. Includes all fields: ticker, direction, entry/exit prices, P&L, dates, tags, and notes. Perfect for importing into spreadsheets for deeper analysis, backtesting, or sharing trade data with mentors.'
          },
          {
            title: 'Notification Center',
            description: 'Click the bell icon in the header to open the full notification panel. Shows your complete notification history with timestamps. Includes a "Clear All" button to dismiss all notifications at once. Never miss a community share, price target hit, or platform update again.'
          }
        ]
      },
      {
        type: 'Improvements',
        items: [
          {
            title: 'Widget Descriptions',
            description: 'When customizing your dashboard, hovering over any widget in the "Add Widget" panel now shows a tooltip describing what the widget does. Helps new users understand each widget\'s purpose before adding it, reducing confusion and improving the onboarding experience.'
          },
          {
            title: 'Settings Modal UX',
            description: 'The Settings modal now has a visible X close button in the top-right corner, and clicking outside the modal (on the dark backdrop) also closes it. Previously users could get stuck on this screen with no obvious way to exit. This fix significantly improves the overall user experience.'
          },
          {
            title: 'Light Mode Polish',
            description: 'Continued improvements to the Light theme including better card shadows, fixed gradient text that was invisible on light backgrounds, polished button styles, and improved table contrast. Light mode is now fully feature-parity with Dark mode and looks gorgeous.'
          }
        ]
      },
      {
        type: 'Bug Fixes',
        items: [
          {
            title: 'Community Feed Price Display',
            description: 'Fixed Community Feed showing "$undefined" for target and stop prices when sharing analyses that do not have price targets. Now displays "N/A" for missing values with proper formatting.'
          },
          {
            title: 'Settings Modal Entrapment',
            description: 'Fixed Settings modal having no way to close it. Added both an X button in the top-right corner and the ability to close by clicking outside the modal. Users are no longer trapped on the Settings screen.'
          }
        ]
      }
    ]
  },
  {
    version: 'v2.2.1',
    date: 'February 8, 2026',
    title: 'Bug Fixes, Live Data, UI Polish & Light Mode Overhaul',
    sections: [
      {
        type: 'Features & Major Fixes',
        items: [
          {
            title: 'Share & Track Confirmation Notifications',
            description: 'Clicking "Share to Feed" or "Track Target" in Quick Analysis now shows a confirmation notification toast ("Shared to community feed!" / "Tracking price target for AAPL") instead of silently succeeding. Users now receive clear visual feedback that their action was successful.'
          },
          {
            title: 'Emotion Logger Visual Feedback',
            description: 'The emotion buttons now visually highlight when selected (larger size, ring border, scale animation). Selecting an emotion logs it and shows a notification. Previously the buttons had no visual feedback, making it unclear whether your selection was registered.'
          },
          {
            title: 'Pre-Market Movers with Live Data',
            description: 'Previously showed a completely empty "Run a scan to see results" message. Now pre-populated with 10 sample stocks showing symbol, price, and volume data. Includes a "Refresh Live Data" button. Each stock card is clickable and navigates to that stock\'s live chart. Much more useful out of the box.'
          },
          {
            title: 'Dynamic Pattern Scanner',
            description: 'Was showing 3 hardcoded static patterns regardless of your watchlist. Now dynamically generates technical patterns (Cup & Handle, Bull Flag, Head & Shoulders, Double Bottom, Ascending Triangle, MACD Crossover) from your actual watchlist stocks. Shows signal type (Bullish/Bearish/Neutral), confidence percentage bar, and detection timestamp.'
          },
          {
            title: 'Mistake Tracker Redesign',
            description: 'Completely redesigned from a basic text list to a proper form with category dropdown (Position Sizing, Emotional Trading, Ignoring Stop Loss, FOMO Entry, Overtrading, Not Following Plan), description text input, and save button. The Journal > Mistakes sub-tab now shows all logged mistakes with category badges, timestamps, and delete buttons. Much more structured approach to learning from your errors.'
          }
        ]
      },
      {
        type: 'Improvements',
        items: [
          {
            title: 'Theme Toggle Relocated',
            description: 'Moved from the dashboard header (where it cluttered the layout) to the Settings modal. Now shows three theme cards with descriptions: Midnight (deepest dark theme), Dark (classic dark theme), and Light (clean light theme). Each card shows a preview color swatch for easy selection.'
          },
          {
            title: 'Pre-Market Movers Interactivity',
            description: 'Pre-Market Movers cards are now clickable — click any stock to view its live chart. This creates a seamless workflow from identifying movers to analyzing price action without leaving the platform.'
          },
          {
            title: 'Pattern Scanner Enhanced Display',
            description: 'Pattern Scanner shows signal type (Bullish/Bearish/Neutral), confidence bar, and timestamp. Much easier to understand the quality and recency of detected patterns at a glance.'
          },
          {
            title: 'Light Mode Massive Overhaul',
            description: 'Massive improvements to the Light theme — fixed table text contrast, gradient backgrounds now use appropriate light colors, progress bars are visible, section headers use dark text, all inline styles that forced dark colors now respect the theme, and hover states work properly. Light mode is now fully usable and visually consistent.'
          }
        ]
      }
    ]
  },
  {
    version: 'v2.2.0',
    date: 'February 8, 2026',
    title: 'Detailed Pages, New Widgets & Keyboard Shortcuts',
    sections: [
      {
        type: 'Features',
        items: [
          {
            title: 'Journal Sub-tabs',
            description: 'The Journal tab now has 5 sub-sections: Trade Log (your trades list with full details), Analytics (performance charts and statistics), Monthly P&L (calendar-style profit/loss view), Weekly Report (summary of the week\'s trading), and Mistakes (your logged trading mistakes). Each sub-tab provides a different perspective on your trading history.'
          },
          {
            title: 'Screener Sub-tabs',
            description: 'The Screener tab now has 3 sub-sections: Stock Screener (with scan presets for finding stocks), Pre-Market Movers (top moving stocks at market open), and Chart Patterns (technical pattern detection). Organize all your stock discovery tools in one convenient location.'
          },
          {
            title: 'Comprehensive Keyboard Shortcuts',
            description: 'Press "?" anywhere in the app to see a full shortcuts overlay. Press "N" for instant Quick Trade Entry, "D" for dashboard, "J" for journal, "T" to cycle themes, "/" to focus the Quick Analyze input. Power users can now navigate MODUS at lightning speed without touching the mouse.'
          },
          {
            title: 'Quick Trade Entry Modal',
            description: 'Press "N" to open a modal where you can type any ticker for instant lookup, or jump straight to the Journal to log a trade. Streamlines the most common actions into a single keyboard shortcut. Fast-track your trading workflow.'
          },
          {
            title: 'Equity Curve Widget',
            description: 'A new dashboard widget showing your cumulative P&L as a line chart over time. Green when in profit, red when in drawdown. Helps visualize your overall trading trajectory and identify periods of strong performance or rough patches that need analysis.'
          },
          {
            title: 'Achievements Widget',
            description: 'Earn badges for trading milestones — First Trade, 3-Win Streak, 5-Win Streak, 60%+ Win Rate, 10+ Trades, Portfolio Growth. Each achievement shows a star rating and unlock status. Gamification to keep you motivated and track your progress.'
          },
          {
            title: 'Trade Emotion Logger Widget',
            description: 'Tap your pre-trade emotion (Confident, Anxious, Neutral, FOMO, Disciplined, Frustrated, Excited, Cautious) to log how you felt. Over time, correlate emotions with trade outcomes to improve your psychology. Develop emotional intelligence in trading.'
          },
          {
            title: 'Win/Loss by Day of Week Widget',
            description: 'A bar chart showing your win rate broken down by day of the week. Quickly identify which days you trade best and which days to avoid. Optimize your trading schedule based on historical performance patterns.'
          }
        ]
      },
      {
        type: 'Bug Fixes',
        items: [
          {
            title: 'Widget Icon Import Crashes',
            description: 'Fixed widget crashes caused by missing icon imports for 5 widgets. Users can now safely add all widgets to their dashboard without encountering errors.'
          }
        ]
      }
    ]
  },
  {
    version: 'v2.0.0',
    date: 'February 8, 2026',
    title: '8 Major Features + Full Widget Redesign',
    sections: [
      {
        type: 'Major Features',
        items: [
          {
            title: 'Earnings Calendar Widget',
            description: 'A comprehensive earnings calendar showing upcoming earnings dates, EPS estimates, and highlighting stocks that are in your watchlist. Stay informed about major company announcements that could impact your positions. Never miss an earnings date for your watched stocks again.'
          },
          {
            title: 'Trade Replay Mode',
            description: 'Review closed trades with visual entry/exit markers on the price chart and a P&L breakdown showing your profit or loss, percentage return, and hold duration. Perfect for analyzing what worked and what didn\'t. Learn from every trade by replaying it.'
          },
          {
            title: 'Risk Dashboard Widget',
            description: 'Real-time portfolio exposure tracking showing your current concentration risk (which stocks you are overexposed to), maximum drawdown from peak equity, portfolio beta, and value at risk. Essential tools for understanding your risk profile at a glance.'
          },
          {
            title: 'Community Feed',
            description: 'Share your Quick Analysis results and trade replays to a social feed visible to other MODUS users. View what other traders are analyzing and build a community around shared market research. Get feedback and learn from other traders\' perspectives.'
          },
          {
            title: 'Price Target Tracking',
            description: 'Automatically tracks Quick Analysis predictions and their outcomes. The system scores your hit rate, showing how many targets you actually hit and at what distance. Build a historical record of your prediction accuracy over time.'
          },
          {
            title: 'Custom Watchlist Groups',
            description: 'Organize your watchlist into custom groups (Tech, Earnings, Momentum, Dividend Stocks, etc.). Create as many groups as you need and move stocks between them. Keep your watchlist organized and focused on different trading themes.'
          },
          {
            title: 'PWA Support (Install as App)',
            description: 'Install MODUS as a standalone app on your phone or desktop using the browser\'s "Add to Home Screen" or "Install App" option. Includes offline caching so you can view saved data even without internet. Get native app-like experience in your browser.'
          },
          {
            title: 'Theme Toggle System',
            description: 'Switch between three beautiful themes: Midnight (deepest dark theme with purple accents), Dark (classic dark theme), and Light (clean light theme). Customize the appearance to match your preference and trading environment.'
          }
        ]
      },
      {
        type: 'Design & UX Improvements',
        items: [
          {
            title: 'Complete Widget Redesign',
            description: 'All widgets received a comprehensive visual refresh with gradient backgrounds, icon badges for quick identification, colored borders matching widget themes, improved spacing, and modern shadow effects. The dashboard now looks polished and professional.'
          },
          {
            title: 'Keyboard Shortcuts Foundation',
            description: 'Added foundational keyboard shortcuts: "t" cycles through themes, "d" goes to dashboard, "j" goes to journal. Set the stage for expanded shortcuts in future versions.'
          }
        ]
      }
    ]
  },
  {
    version: 'v1.9.0',
    date: 'February 8, 2026',
    title: 'UI Polish, Enhanced Widgets & Keyboard Shortcuts',
    sections: [
      {
        type: 'Bug Fixes',
        items: [
          {
            title: 'Profile Dropdown Visibility',
            description: 'Fixed profile dropdown that was hard to see due to transparency. Changed to solid background for full visibility. The dropdown menu now properly stands out against the page background.'
          },
          {
            title: 'Notification Panel Transparency',
            description: 'Fixed notification panel transparency making notifications hard to read. Applied the same solid background treatment for consistency. Notifications are now clearly visible at all times.'
          },
          {
            title: 'Tell Me More Markdown Rendering',
            description: 'Fixed Tell Me More showing raw markdown asterisks instead of proper formatting. Implemented proper markdown parsing so headers, bold text, and lists display correctly.'
          },
          {
            title: 'Market Mood Widget Crash',
            description: 'Fixed Market Mood widget crash when added to dashboard. Widget is now stable and can be safely used.'
          }
        ]
      },
      {
        type: 'Improvements',
        items: [
          {
            title: 'Quick Analysis Loading States',
            description: 'Quick Analysis loading state now shows animated progress steps (Analyzing Chart → Calculating RSI → Finding Targets) instead of a simple spinner. Much more engaging and informative user experience while waiting for results.'
          },
          {
            title: 'Quick Analysis History Cards',
            description: 'Quick Analysis history cards redesigned with confidence bars (visual representation of the AI\'s confidence percentage), color-coded borders (green for BUY, red for SELL, blue for HOLD), better spacing, and more readable text hierarchy.'
          },
          {
            title: 'Quick Analysis Empty State',
            description: 'Quick Analysis empty state now shows popular ticker quick-pick buttons (AAPL, TSLA, NVDA, SPY, etc.) so new users can instantly see an example analysis without having to type a ticker first.'
          },
          {
            title: 'Hot Stocks Widget Enhancement',
            description: 'Hot Stocks widget now shows both gainers AND losers side-by-side with clickable symbols. Tickers are now interactive — click any ticker to jump to its analysis.'
          },
          {
            title: 'Watchlist Interactive Navigation',
            description: 'Watchlist widget items now navigate to that stock\'s chart when clicked. Creates a smooth workflow from watchlist browsing to chart analysis without extra clicks.'
          }
        ]
      },
      {
        type: 'Features',
        items: [
          {
            title: 'Today\'s Activity Strip',
            description: 'A new strip on the dashboard header showing your activity summary: number of analyses performed, number of trades logged today, and size of your current watchlist. Gives quick insight into your trading activity.'
          },
          {
            title: 'Keyboard Shortcut: Focus Quick Analyze',
            description: 'Press "/" on the dashboard to instantly focus the Quick Analyze input field. Fast-track to analysis without navigating the UI.'
          }
        ]
      }
    ]
  },
  {
    version: 'v1.8.0',
    date: 'February 8, 2026',
    title: 'Data Accuracy, Structured Deep Dive & Firebase Production',
    sections: [
      {
        type: 'Major Improvements',
        items: [
          {
            title: 'Fixed Zero-Price Display Bug',
            description: 'Fixed Quick Analysis showing $0.00 for target/stop prices when API data was unavailable. Implemented 8 proxy fallback sources to ensure prices are always populated. When one source fails, the system automatically tries 7 alternatives, dramatically improving data reliability.'
          },
          {
            title: 'Structured Tell Me More Card System',
            description: 'Tell Me More button now returns structured cards instead of unformatted text. Cards include: Technical Analysis (RSI, MACD, Moving Averages), Entry/Exit Strategy (recommended entry and exit tactics), Risk Assessment (position sizing guidance), and Sector Overview (how this stock compares to its peers).'
          },
          {
            title: 'Support/Resistance Levels',
            description: 'Quick Analysis now displays key support and resistance levels calculated from recent price action. Helps identify important price levels where the stock might bounce or break through.'
          },
          {
            title: 'Risk:Reward Ratio',
            description: 'Quick Analysis now calculates and displays the risk:reward ratio for the suggested trade. Shows how much you stand to gain relative to what you risk, helping you evaluate trade quality.'
          }
        ]
      },
      {
        type: 'Features',
        items: [
          {
            title: 'Top Movers Ticker Bar',
            description: 'A new ticker bar on the dashboard showing the biggest gaining and losing stocks in real-time. Click any ticker to jump to its analysis. Helps you quickly spot market momentum.'
          },
          {
            title: 'Trading Streak Widget',
            description: 'A widget showing your current winning streak and record winning streak. Motivational and helps you visualize momentum in your trading results.'
          },
          {
            title: 'Market Mood Widget',
            description: 'A widget showing the overall market sentiment based on put/call ratios, breadth, and sector momentum. Green for bullish, red for bearish. Helps you understand the broader market context for your trades.'
          }
        ]
      },
      {
        type: 'Improvements',
        items: [
          {
            title: 'Performance Widget Visual Upgrade',
            description: 'Performance widget now displays a visual win/loss bar showing the ratio of winning trades to losing trades at a glance. Easier to understand your track record instantly.'
          },
          {
            title: 'Daily Pick Widget Redesign',
            description: 'Daily Pick widget redesigned with a grid showing entry price, target price, stop loss, and a confidence bar at the top. Much more information-dense and easier to scan.'
          }
        ]
      }
    ]
  },
  {
    version: 'v1.7.0',
    date: 'February 7, 2026',
    title: 'Quick Analysis & UI Improvements',
    sections: [
      {
        type: 'Major Features',
        items: [
          {
            title: 'Quick Analysis Tab Launch',
            description: 'Added completely new Quick Analysis tab — enter any ticker and get an instant AI buy/sell verdict in seconds. No waiting, no complexity. Just enter a symbol and get immediate analysis. This feature becomes the centerpiece of the MODUS trading platform.'
          },
          {
            title: 'Comprehensive Analysis Display',
            description: 'Quick Analysis includes confidence score (how sure the AI is), price targets (where to take profit), stop loss (where to cut losses), RSI indicator (momentum), SMA (trend), and volume analysis. All the essential technical indicators in one view.'
          },
          {
            title: 'Tell Me More Deep Dive',
            description: 'Click "Tell Me More" button to expand into a full technical deep-dive with detailed entry strategy (exactly where to buy), exit strategy (when to sell for profit), risk assessment, and sector comparison. Turn a quick analysis into a comprehensive trading plan.'
          },
          {
            title: 'Analysis History Tracking',
            description: 'The system tracks your last 10 quick analyses automatically. Scroll through previous analyses to compare ideas, revisit stocks you looked at yesterday, and see how your predictions are playing out.'
          }
        ]
      },
      {
        type: 'Bug Fixes',
        items: [
          {
            title: 'Updates/Changelog Popup Readability',
            description: 'Fixed Updates/Changelog popup being transparent and hard to read. Applied solid background and dark text so the changelog is now clearly visible when you check for updates.'
          }
        ]
      }
    ]
  },
  {
    version: 'v1.6.0',
    date: 'February 7, 2026',
    title: 'Time in Force, Vocabulary & Splash Screen',
    sections: [
      {
        type: 'Features',
        items: [
          {
            title: 'Time in Force Trading Orders',
            description: 'Added Time in Force section to Trade Setup with five order types: Day (cancels at market close), GTC (Good-Til-Cancelled, stays active until you close it), FOK (Fill-or-Kill, execute fully or not at all), IOC (Immediate-or-Cancel, buy/sell as much as possible right now), and OPG (At Open, execute at market open). Essential for advanced traders.'
          },
          {
            title: 'Comprehensive Trading Vocabulary',
            description: 'Added brand new Vocabulary/Glossary tab with over 60+ trading terms fully defined and explained. Quick-search feature to find any trading term instantly. Perfect reference for learning trading terminology while trading.'
          },
          {
            title: 'Branded Loading Splash Screen',
            description: 'Added beautiful branded splash screen with animated MODUS logo that displays while the app loads. Much more polished and professional first impression than the default loading state.'
          }
        ]
      },
      {
        type: 'Improvements',
        items: [
          {
            title: 'Custom MODUS Favicon',
            description: 'Replaced the default Vite favicon with a custom MODUS logo favicon. The browser tab now shows the MODUS branding instead of the generic Vite icon.'
          }
        ]
      },
      {
        type: 'Bug Fixes',
        items: [
          {
            title: 'RSI Chart Artifact',
            description: 'Fixed RSI chart blob artifact that appeared at the end of the line. Charts now render cleanly without visual glitches.'
          }
        ]
      }
    ]
  },
  {
    version: 'v1.5.0',
    date: 'February 7, 2026',
    title: 'AI Improvements, Trade Setup Overhaul & Bug Fixes',
    sections: [
      {
        type: 'Features',
        items: [
          {
            title: 'Trade Setups Tab Rewrite',
            description: 'Completely rewrote Trade Setups tab to be more robust. Now shows setup and trading plan even when the AI verdict is NEUTRAL (no clear buy or sell). Ensures users always get useful guidance even in ambiguous market situations.'
          },
          {
            title: 'All 8 Brokerage Order Types',
            description: 'Added all 8 standard brokerage order types with detailed hover tooltips explaining each one: Market, Limit, Stop, Stop-Limit, Trailing Stop, Iceberg, Bracket, and One-Cancels-Other. Traders can now understand and choose the right order type for their strategy.'
          }
        ]
      },
      {
        type: 'Bug Fixes',
        items: [
          {
            title: 'Ask AI Timeout Error',
            description: 'Fixed Ask AI timeout error by increasing server limits and optimizing AI prompts. Requests now complete much faster and more reliably without timing out.'
          },
          {
            title: 'Trade Setup Blank Fields',
            description: 'Fixed Trade Setup showing blank/null fields where values should display. All fields now properly populated with data from the analysis.'
          },
          {
            title: 'Vocabulary React Hooks Violation',
            description: 'Fixed React hooks violation in Vocabulary tab that was causing console errors. Tab is now properly implemented and error-free.'
          }
        ]
      }
    ]
  },
  {
    version: 'v1.4.0',
    date: 'February 6, 2026',
    title: 'AI Quality, Mini Widgets & Dashboard Config',
    sections: [
      {
        type: 'Improvements',
        items: [
          {
            title: 'Ask AI Response Quality',
            description: 'Fixed Ask AI returning generic offline answers for detailed questions. AI now generates context-aware responses based on the chart data and technical indicators being displayed. Questions about the current stock get relevant, specific answers.'
          },
          {
            title: 'Enhanced Markdown Rendering',
            description: 'Improved markdown rendering across the platform. Now properly displays numbered lists, headers, bold text, italics, code blocks, and other formatting. Makes AI responses and documentation much more readable and scannable.'
          }
        ]
      },
      {
        type: 'Features',
        items: [
          {
            title: 'Mini Widgets Row',
            description: 'Added Quick Stats mini widget (summary of key statistics), Quick Navigation mini widget (jump to any section), and Clock mini widget (displays current time). These compact widgets take minimal space while providing quick access to common functions.'
          }
        ]
      },
      {
        type: 'UI Enhancements',
        items: [
          {
            title: 'Widget Configuration Categories',
            description: 'Organized the widget customization panel into logical categories: Mini (small quick-access widgets), Trading (trade journal and analysis widgets), and Data (market data widgets). Makes it much easier to find and add the widgets you want.'
          }
        ]
      }
    ]
  },
  {
    version: 'v1.3.0',
    date: 'February 6, 2026',
    title: 'Dashboard Overhaul & Widget Reordering',
    sections: [
      {
        type: 'Features',
        items: [
          {
            title: 'Drag-and-Drop Widget Reordering',
            description: 'Dashboard widgets are now fully draggable and droppable. Grab any widget and drag it to a new position on the dashboard. Your custom layout is saved automatically. Arrange your dashboard exactly how you want it.'
          },
          {
            title: 'Mini Widgets Row',
            description: 'Added a prominent row of mini status widgets: Clock (current time), Market Status (open/closed), Win Rate (your trading win percentage), and Alert Count (pending notifications). Quick glance at key information without cluttering the dashboard.'
          },
          {
            title: 'Time-Based Dashboard Greeting',
            description: 'The dashboard header now shows a time-appropriate greeting: "Good Morning" before noon, "Good Afternoon" from noon to 6pm, and "Good Evening" after 6pm. Personalized greeting makes the platform feel more welcoming.'
          },
          {
            title: 'Daily Tip Widget',
            description: 'New Daily Tip widget displays rotating trading wisdom and best practices. Tips change daily to provide fresh insights and reminders about good trading discipline. Educational and motivational.'
          }
        ]
      },
      {
        type: 'Bug Fixes',
        items: [
          {
            title: 'Latest News Widget Updates',
            description: 'Fixed Latest News widget that was not refreshing with new articles. News now updates dynamically and displays the latest financial news stories.'
          }
        ]
      }
    ]
  },
  {
    version: 'v1.2.0',
    date: 'February 5, 2026',
    title: 'Live Ticker Stability & Stock Screener',
    sections: [
      {
        type: 'Bug Fixes',
        items: [
          {
            title: 'Live Ticker Chart Stability',
            description: 'Fixed Live Ticker chart that was jumping and resetting on auto-refresh. Chart now smoothly updates price data without flickering or losing the current view. Much more pleasant experience when watching live prices.'
          },
          {
            title: 'Daily Pick Render Crash',
            description: 'Fixed Daily Pick widget that was crashing when rendered. Widget is now stable and displays the AI\'s daily stock pick reliably.'
          },
          {
            title: 'Ask About Chart UI Reliability',
            description: 'Fixed Ask About Chart feature by switching to text-only API for reliability. Feature now works consistently without requiring complex chart rendering.'
          }
        ]
      },
      {
        type: 'Improvements',
        items: [
          {
            title: 'Stock Screener Cleanup',
            description: 'Cleaned up Stock Screener interface by removing redundant buttons and adding new "Buy the Dip" scan preset. Screener now has cleaner UX and more useful pre-built scans including: Breakouts, Momentum, Buy the Dip, and Turnarounds.'
          }
        ]
      }
    ]
  },
];

// Count totals
let totalFeatures = 0, totalFixes = 0, totalImprovements = 0;
versions.forEach(v => {
  v.sections.forEach(section => {
    section.items.forEach(item => {
      const t = section.type.toLowerCase();
      if (t.includes('feature') || t.includes('major')) totalFeatures++;
      else if (t.includes('fix')) totalFixes++;
      else totalImprovements++;
    });
  });
});

const children = [];

// ═══ COVER / TITLE ═══
children.push(
  new Paragraph({ spacing: { after: 100 }, children: [] }),
  new Paragraph({ spacing: { after: 100 }, children: [] }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 200 },
    children: [new TextRun({ text: "MODUS", font: "Arial", size: 72, bold: true, color: VIOLET })]
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 100 },
    children: [new TextRun({ text: "TRADING PLATFORM", font: "Arial", size: 28, color: SLATE, characterSpacing: 300 })]
  }),
  new Paragraph({ spacing: { after: 400 }, children: [] }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 200 },
    children: [new TextRun({ text: "Complete Change Log", font: "Arial", size: 40, bold: true, color: DARK })]
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 100 },
    children: [new TextRun({ text: "February 5, 2026 \u2014 February 8, 2026", font: "Arial", size: 24, color: SLATE })]
  }),
  new Paragraph({ spacing: { after: 600 }, children: [] }),
);

// Summary stats table
children.push(
  new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [2340, 2340, 2340, 2340],
    rows: [
      new TableRow({
        children: [
          { label: 'Versions', value: `${versions.length}`, bg: "EDE9FE" },
          { label: 'New Features', value: `${totalFeatures}`, bg: "D1FAE5" },
          { label: 'Improvements', value: `${totalImprovements}`, bg: "DBEAFE" },
          { label: 'Bug Fixes', value: `${totalFixes}`, bg: "FEE2E2" },
        ].map(s => new TableCell({
          borders,
          width: { size: 2340, type: WidthType.DXA },
          shading: { fill: s.bg, type: ShadingType.CLEAR },
          margins: { top: 120, bottom: 120, left: 120, right: 120 },
          verticalAlign: "center",
          children: [
            new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 40 }, children: [new TextRun({ text: s.value, font: "Arial", size: 36, bold: true, color: DARK })] }),
            new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: s.label, font: "Arial", size: 18, color: SLATE })] }),
          ]
        }))
      })
    ]
  }),
  new Paragraph({ children: [new PageBreak()] })
);

// ═══ Helper: map section type to badge label/color ═══
function sectionTypeInfo(type) {
  const t = type.toLowerCase();
  if (t.includes('feature') || t.includes('major')) return { label: 'NEW', color: GREEN, bg: "D1FAE5" };
  if (t.includes('fix')) return { label: 'FIXED', color: RED, bg: "FEE2E2" };
  return { label: 'IMPROVED', color: BLUE, bg: "DBEAFE" };
}

// ═══ EACH VERSION ═══
versions.forEach((ver, vi) => {
  // Version header
  children.push(
    new Paragraph({
      spacing: { before: vi === 0 ? 0 : 300, after: 100 },
      children: [
        new TextRun({ text: `${ver.version}`, font: "Arial", size: 32, bold: true, color: VIOLET }),
        new TextRun({ text: `  \u2014  ${ver.date}`, font: "Arial", size: 22, color: SLATE }),
      ]
    }),
    new Paragraph({
      spacing: { after: 200 },
      children: [new TextRun({ text: ver.title, font: "Arial", size: 24, italics: true, color: SLATE })]
    }),
  );

  // Build table rows from all sections
  const rows = [];
  ver.sections.forEach(section => {
    const info = sectionTypeInfo(section.type);
    section.items.forEach(item => {
      rows.push(new TableRow({
        children: [
          new TableCell({
            borders,
            width: { size: 1200, type: WidthType.DXA },
            shading: { fill: info.bg, type: ShadingType.CLEAR },
            margins: cellMargins,
            verticalAlign: "center",
            children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: info.label, font: "Arial", size: 16, bold: true, color: info.color })] })]
          }),
          new TableCell({
            borders,
            width: { size: 8160, type: WidthType.DXA },
            margins: cellMargins,
            children: [
              new Paragraph({ spacing: { after: 60 }, children: [new TextRun({ text: item.title, font: "Arial", size: 20, bold: true, color: VIOLET })] }),
              new Paragraph({ children: [new TextRun({ text: item.description, font: "Arial", size: 20, color: DARK })] }),
            ]
          }),
        ]
      }));
    });
  });

  children.push(
    new Table({
      width: { size: 9360, type: WidthType.DXA },
      columnWidths: [1200, 8160],
      rows
    }),
  );

  // Separator / page break
  if (vi < versions.length - 1) {
    children.push(new Paragraph({ spacing: { before: 200, after: 200 }, children: [] }));
  }
});

// ═══ FOOTER SECTION ═══
children.push(
  new Paragraph({ children: [new PageBreak()] }),
  new Paragraph({
    spacing: { after: 200 },
    children: [new TextRun({ text: "About This Document", font: "Arial", size: 28, bold: true, color: DARK })]
  }),
  new Paragraph({
    spacing: { after: 120 },
    children: [new TextRun({ text: "This document catalogs every change made to MODUS Trading Platform from v1.2.0 (February 5, 2026) through v2.3.0 (February 8, 2026). It is automatically generated and will be updated with each new release.", font: "Arial", size: 20, color: SLATE })]
  }),
  new Paragraph({
    spacing: { after: 120 },
    children: [new TextRun({ text: "MODUS is an AI-powered stock analysis and trading journal platform built with React, Firebase, and Vite. It features live market data, AI-driven analysis, community features, and comprehensive portfolio management tools.", font: "Arial", size: 20, color: SLATE })]
  }),
  new Paragraph({
    spacing: { after: 200 },
    children: [
      new TextRun({ text: "Last updated: ", font: "Arial", size: 20, color: SLATE }),
      new TextRun({ text: "February 8, 2026 at " + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }), font: "Arial", size: 20, bold: true, color: VIOLET }),
    ]
  }),
);

const doc = new Document({
  styles: {
    default: {
      document: {
        run: { font: "Arial", size: 24 }
      }
    },
  },
  sections: [{
    properties: {
      page: {
        size: { width: 12240, height: 15840 },
        margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
      }
    },
    headers: {
      default: new Header({
        children: [new Paragraph({
          alignment: AlignmentType.RIGHT,
          children: [
            new TextRun({ text: "MODUS", font: "Arial", size: 16, bold: true, color: VIOLET }),
            new TextRun({ text: "  |  Change Log", font: "Arial", size: 16, color: SLATE }),
          ]
        })]
      })
    },
    footers: {
      default: new Footer({
        children: [new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({ text: "Page ", font: "Arial", size: 16, color: SLATE }),
            new TextRun({ children: [PageNumber.CURRENT], font: "Arial", size: 16, color: SLATE }),
          ]
        })]
      })
    },
    children
  }]
});

Packer.toBuffer(doc).then(buffer => {
  const outPath = '/sessions/magical-ecstatic-mccarthy/mnt/Tradevision_MODUS/MODUS_Changelog_Feb7_2026.docx';
  fs.writeFileSync(outPath, buffer);
  console.log(`✓ Created: ${outPath}`);
  console.log(`  Size: ${(buffer.length / 1024).toFixed(1)} KB`);
  console.log(`  Versions: ${versions.length}`);
  console.log(`  Features: ${totalFeatures} | Improvements: ${totalImprovements} | Fixes: ${totalFixes}`);
});
