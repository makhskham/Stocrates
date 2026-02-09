# Stocrates

![Stocrates Logo](logo.jpg)

> **Proven Past, Prepared Future**

An educational AI-powered financial literacy platform that teaches beginners how markets react to real-world events using historical examples. Built with Next.js, Groq AI, and real-time market data.

[![YouTube Demo](https://img.shields.io/badge/YouTube-Demo-red)](https://youtu.be/glbGpOEm5vM?si=X20v-alTEbBfH9sx)

![Next.js](https://img.shields.io/badge/Next.js-16.1.6-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5.2-blue)
![License](https://img.shields.io/badge/license-MIT-green)

---

## Documentation

- **[Socratic Method Guide](./SOCRATIC_METHOD.md)** - Learn how Stocrates uses the Socratic method for financial education
- **[Educational Approach](./EDUCATIONAL_APPROACH.md)** - Our philosophy on teaching financial literacy
- **[Design System](./DESIGN_SYSTEM.md)** - UI/UX guidelines and component documentation
- **[API Fallback System](./API_FALLBACK_SYSTEM.md)** - How we ensure uninterrupted service

---

## Demo

### Homepage
![Homepage](imgs/homepage.png)
*The main interface featuring AI chat, live market data, and educational resources*

### Investment Game
![Investment Game](imgs/portfolio.png)
*Time-travel to the past and practice investing with risk-free Stocrates Points*

### Transparency & Confidence Levels
![Transparency Dashboard](imgs/transparency.png)
*Visual confidence indicators showing source credibility and social sentiment analysis*

### Event Impact Analyzer
![Event Impact](imgs/eventimpact.png)
*Analyze how historical events affected stock prices with pattern matching*

### Portfolio View
![Portfolio](imgs/investmentgame.png)
*Track your investments and see real-time performance with detailed analytics*

---

## Features

### AI Chat Interface with Socratic Method
- **Conversational AI** powered by Groq (llama-3.3-70b-versatile)
- **Socratic questioning** to guide learning and critical thinking
- Ask questions about stocks, markets, and financial concepts
- Get educational responses with historical context and pattern matching
- **Source credibility weighting** (credible sources 60-80%, social 10-30%)

### Visual Confidence Indicators
- **Color-coded progress bars** showing confidence levels
  - 🟢 Green (≥70%) - High confidence
  - 🟡 Yellow (≥50%) - Medium confidence
  - 🔴 Red (<50%) - Low confidence
- **Dual confidence metrics**:
  - Credible sources (Bloomberg, Reuters, WSJ, Yahoo Finance)
  - Social sentiment (social media platforms)
- **Automatic parsing** from AI responses with visual rendering

### Interactive Terminology Legend
- **Collapsible sidebar** with 15+ financial term definitions
- **Hover tooltips** for instant learning
- Terms include: Pattern Reliability, Volatility, Confidence Level, Market Cap, and more
- **Always accessible** during chat sessions
- **Educational focus** - learn terminology as you explore

### Live Stock Data & TradingView Integration
- **Real-time stock prices** and interactive charts
- **TradingView widgets** for professional-grade visualizations
- **Company financials** and key metrics
- **Stock screeners** for discovery
- **Market overview** and heatmaps
- **ETF analysis** and trending stocks

### Multi-Source News Integration
- **NewsAPI** - 100+ news sources (Bloomberg, Reuters, WSJ, etc.)
- **Finnhub** - Financial news and earnings reports
- **Reddit Sentiment** - r/wallstreetbets and r/investing analysis
- **Automatic fallback** system for uninterrupted service
- **30-day news filtering** to ensure recent, relevant context
- **Source credibility scoring** with transparent weighting

### Educational Game Mode
- **Paper trading** with virtual "Stocrates Points" (10,000 max)
- **Historical time travel** - Learn from past market events
- **Portfolio tracking** and performance analysis
- **Risk-free learning** environment
- **Investment feedback** with educational insights

### Reddit Sentiment Analysis
- **Automated scraping** from multiple subreddits
- **AI-powered analysis** using GPT-4 via Groq
- **Batch processing** for large datasets
- **Stock mention tracking** and sentiment scoring
- **Trend detection** and theme analysis
- **Fear & Greed Index** calculation

### Event Impact Analyzer
- **Historical pattern matching** for market events
- **CSV export** for analysis data
- **Pattern confidence meter** visualization
- **Source credibility breakdown**
- **Learning objectives** for each analysis

---

## Quick Start

### Prerequisites

- **Node.js** 18+ and **pnpm** 8+
- **Python** 3.8+ (for Reddit scraping with comments)
- **API Keys** (all free):
  - **Groq API Key** - Get it at [console.groq.com](https://console.groq.com)
  - **NewsAPI Key** - Get it at [newsapi.org](https://newsapi.org)
  - **Finnhub API Key** - Get it at [finnhub.io](https://finnhub.io)
  - **Polygon API Key** - Get it at [polygon.io](https://massive.com/)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/makhskham/Stocrates.git
   cd Stocrates
   ```

2. **Install dependencies**
   ```bash
   # Install Node dependencies
   pnpm install
   
   # If you encounter peer dependency issues, use:
   npm install @ai-sdk/groq@^1.0.4 --legacy-peer-deps
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   # Required - AI Chat (Get from: https://console.groq.com)
   GROQ_API_KEY=your_groq_api_key_here
   
   # Required - News Sources
   NEWS_API_KEY=your_newsapi_key_here      # Get from: https://newsapi.org
   FINNHUB_API_KEY=your_finnhub_api_key_here  # Get from: https://finnhub.io
   ```
   
   **Where to get API keys:**
   - **Groq**: Sign up at [console.groq.com](https://console.groq.com) → Create API Key
   - **NewsAPI**: Sign up at [newsapi.org](https://newsapi.org) → Get API Key (100 requests/day free)
   - **Finnhub**: Sign up at [finnhub.io](https://finnhub.io) → Dashboard → API Key (60 requests/minute free)
   - **Polygon**: Sign up at [polygon.io](https://massive.com/) → Dashboard → API Key (5 requests/minute free)

4. **Clean build (if needed)**
   ```bash
   # On Windows PowerShell
   Remove-Item -Recurse -Force .next
   
   # On Mac/Linux
   rm -rf .next
   ```

5. **Run the development server**
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

6. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

---

## Usage Guide

### Basic Chat Interaction

Simply type questions like:
- "What is the price of AAPL?"
- "Show me NVIDIA's stock chart"
- "Tell me about Tesla's recent news"
- "What are the top tech stocks?"

### Reddit Sentiment Analysis

#### Step 1: Scrape Reddit Data
```bash
# Option 1: Python scraper (RECOMMENDED - includes comments)
python scripts/scrape-reddit-with-comments.py

# Option 2: TypeScript scraper (faster, posts only)
pnpm run scrape:reddit
```

#### Step 2: Analyze with AI
```bash
pnpm run analyze:reddit
```

#### Step 3: View Results
```bash
pnpm run view:analysis
```

The analysis results are saved to `data/reddit-analysis.json` and automatically integrate with stock queries in the chat.

---

## Available Scripts

### Development
- `pnpm dev` - Start development server with Turbopack
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm type-check` - Run TypeScript type checking

### Reddit Analysis
- `pnpm run scrape:reddit` - Scrape Reddit posts (TypeScript)
- `pnpm run scrape:reddit:comments` - Scrape with comments (Python)
- `pnpm run analyze:reddit` - Analyze scraped data with AI
- `pnpm run view:analysis` - View analysis results

### Testing
- `pnpm run test:reddit` - Test Reddit scraper
- `pnpm run test:news` - Test news APIs
- `pnpm run test:integration` - Test full integration
- `pnpm run test:fallback` - Test API fallback system

---

## Project Structure

```
stocrates-nextjs/
├── app/                      # Next.js app directory
│   ├── (chat)/              # Chat interface pages
│   │   └── layout.tsx       # Chat layout with terminology legend
│   ├── (game)/              # Game mode pages
│   ├── event/               # Event analysis pages
│   ├── actions.ts           # Server actions
│   └── layout.tsx           # Root layout
├── components/              # React components
│   ├── stocks/             # Stock-related components
│   ├── tradingview/        # TradingView widget components
│   │   ├── stock-chart.tsx
│   │   ├── stock-screener.tsx
│   │   ├── market-overview.tsx
│   │   ├── market-heatmap.tsx
│   │   └── etf-heatmap.tsx
│   ├── event/              # Event analysis components
│   │   ├── event-analysis-page.tsx
│   │   └── impact-panel.tsx
│   ├── game/               # Game mode components
│   │   └── time-machine.tsx
│   ├── ui/                 # UI components (shadcn/ui + custom)
│   │   ├── confidence-display.tsx    # Visual confidence progress bars
│   │   ├── confidence-meter.tsx      # Pattern confidence gauge
│   │   ├── financial-term.tsx        # Financial term tooltips
│   │   ├── terminology-legend.tsx    # Collapsible sidebar with terms
│   │   └── ...                       # Other shadcn/ui components
│   ├── header.tsx          # Main navigation header
│   ├── empty-screen.tsx    # Chat welcome screen
│   └── chat.tsx            # Main chat component
├── lib/                     # Core library code
│   ├── chat/               # Chat AI logic
│   │   └── actions.tsx     # AI tool definitions & confidence parsing
│   ├── game/               # Game mode logic
│   ├── news/               # News fetching & Reddit scraping
│   ├── reddit/             # Reddit analysis tools
│   ├── utils/              # Utility functions
│   │   └── csv-export.ts   # CSV export for event analysis
│   └── educational-guidelines.ts  # Socratic method prompts
├── scripts/                 # Utility scripts
│   ├── scrape-reddit-multi.ts
│   ├── analyze-reddit-batches.ts
│   └── scrape-reddit-with-comments.py
├── data/                    # Data storage
│   ├── reddit-raw.json     # Scraped Reddit data
│   └── reddit-analysis.json # AI analysis results
├── docs/                    # Documentation
│   ├── SOCRATIC_METHOD.md  # Socratic teaching approach
│   ├── EDUCATIONAL_APPROACH.md  # Educational philosophy
│   ├── DESIGN_SYSTEM.md    # UI/UX guidelines
│   └── API_FALLBACK_SYSTEM.md  # API reliability system
└── public/                  # Static assets
```

---

## Core Principles

### Educational First
- **Goal**: Teach concepts, not provide trading advice
- **Approach**: Every interaction is a learning opportunity
- **Outcome**: Users develop their own analytical skills

### Historical Pattern Analysis
- Analyze similar past events to show how markets reacted
- Transparent similarity scoring
- Learn from history without making predictions

### No Predictions or Recommendations
- ❌ Never make buy/sell recommendations
- ❌ Never predict future prices
- ✅ Show historical patterns and multiple outcomes
- ✅ Include disclaimers and encourage independent research

---

## Configuration

### News API Fallback System

The app includes an intelligent fallback system:
1. **Primary**: NewsAPI (100 requests/day free tier)
2. **Secondary**: Finnhub (60 requests/minute free tier)
3. **Tertiary**: Reddit sentiment data
4. **Fallback**: Mock data (never fails completely)

### Reddit Scraping Options

**Option 1: TypeScript Scraper** (Fast, no auth)
```bash
pnpm run scrape:reddit
```
- Uses Reddit's public JSON API
- No authentication required
- Scrapes posts only (no comments)

**Option 2: Python Scraper** (Comprehensive, recommended)
```bash
python scripts/scrape-reddit-with-comments.py
```
- Scrapes posts AND all comments
- Better stock mention detection
- More accurate sentiment analysis

---

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## License

This project is licensed under the MIT License.

---

## Acknowledgments

- **Groq** - Lightning-fast AI inference
- **NewsAPI** - Comprehensive news aggregation
- **Finnhub** - Financial data and news
- **shadcn/ui** - Beautiful UI components
- **Vercel** - Deployment platform

---

## Support

For issues, questions, or suggestions:
- Open an issue on [GitHub](https://github.com/makhskham/Stocrates/issues)
- Check the documentation files in the repository

---

## ⚠️ Disclaimer

**Stocrates is an educational tool only.** It does not provide financial advice, investment recommendations, or trading signals. All information is for educational purposes. Always do your own research and consult with a qualified financial advisor before making investment decisions.

---

Made by Team Code of Duty
