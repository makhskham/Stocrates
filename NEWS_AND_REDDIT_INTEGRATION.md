# News & Reddit Integration Guide

## 🎯 Overview

Stocrates now integrates **real news data** from multiple sources and **Reddit sentiment analysis** from r/wallstreetbets to provide comprehensive stock analysis.

## 📊 Data Sources

### 1. **NewsAPI.org** (Credible Sources: 75-85% weight)
- Bloomberg
- Reuters
- Wall Street Journal
- Financial Times
- CNBC
- Business Insider
- Fortune

### 2. **Reddit r/wallstreetbets** (Social Sentiment: 20-30% weight)
- Scrapes top 1000 posts
- Analyzes stock mentions
- Detects bullish/bearish sentiment
- Tracks community engagement (upvotes, comments)

## 🔧 Setup

### Environment Variables
Your `.env.local` file now includes:
```
GROQ_API_KEY=your_groq_api_key_here
NEWS_API_KEY=your_newsapi_key_here
FINNHUB_API_KEY=your_finnhub_api_key_here
```

## 📁 New Files Created

### 1. `lib/news/newsapi-fetcher.ts`
- Fetches real news from NewsAPI.org
- Supports 100+ news sources
- Filters by date range (past 30 days)
- Maps company names to stock symbols

**Key Functions:**
```typescript
fetchNewsFromNewsAPI(symbol, companyName, daysBack)
fetchTopBusinessNews(country, pageSize)
getCompanyName(symbol) // Maps AAPL -> "Apple"
```

### 2. `lib/news/reddit-scraper.ts`
- Scrapes r/wallstreetbets using Reddit's JSON API
- Extracts stock ticker mentions ($TSLA, NVDA, etc.)
- Analyzes sentiment using WSB-specific keywords
- Handles rate limiting (2 seconds between requests)

**Key Functions:**
```typescript
scrapeWallStreetBets(limit, timeframe) // Scrape top posts
getStockSentimentFromReddit(symbol, limit) // Get sentiment for specific stock
```

**Sentiment Keywords:**
- **Bullish**: moon, rocket, calls, buy, yolo, tendies, diamond hands, squeeze
- **Bearish**: puts, short, crash, dump, loss, paper hands, rug pull

### 3. `lib/news/news-fetcher.ts` (Updated)
- Integrates both NewsAPI and Reddit
- Combines sentiment analysis
- Provides unified NewsAnalysis interface

## 🚀 How It Works

### When a user asks about a stock (e.g., "Tell me about NVIDIA"):

1. **Fetch Real News** (NewsAPI.org)
   - Searches for "NVIDIA OR NVDA" in past 30 days
   - Gets articles from Bloomberg, Reuters, WSJ, etc.
   - Returns up to 100 articles

2. **Scrape Reddit** (r/wallstreetbets)
   - Scrapes top 100 posts from past week
   - Finds posts mentioning NVDA
   - Analyzes sentiment (bullish/bearish/neutral)
   - Counts mentions and average upvotes

3. **Sentiment Analysis**
   - News articles analyzed with keywords:
     - Positive: surge, gain, upgrade, growth, profit, rally
     - Negative: fall, drop, loss, decline, crash, lawsuit
   - Reddit analyzed with WSB slang:
     - Bullish: moon, rocket, calls, yolo, tendies
     - Bearish: puts, short, crash, dump, paper hands

4. **Combine & Weight**
   - NewsAPI sources: 75-85% credibility weight
   - Reddit: 25% credibility weight
   - Generate comprehensive analysis

5. **Feed to AI**
   - All data sent to LLM as context
   - AI generates educational explanation
   - Cites sources with weights
   - Makes predictions based on historical patterns

## 📝 Example Output

```
Here's NVIDIA's stock chart! NVIDIA (NVDA) is a technology company that makes graphics cards and AI chips.

**Recent News Analysis (Past 30 Days):**
📈 Overall sentiment: POSITIVE (12 positive, 3 negative, 2 neutral)

**Key Headlines:**
• NVIDIA announces new AI chip breakthrough - Bloomberg (positive)
• NVIDIA stock surges on earnings beat - Reuters (positive)
• Analysts upgrade NVIDIA price target - WSJ (positive)

**r/WallStreetBets Sentiment:**
🚀 BULLISH - 47 mentions (avg score: 1,234)
Weight: 25% (Social media sentiment)

**Historical Pattern Matching:**
When NVIDIA launched similar AI chips in 2020, the stock increased by 120% over 6 months...

📊 **Confidence Levels:**
• Credible sources (Bloomberg, Reuters, WSJ): 78%
• Social sentiment (Reddit): 85%

📰 **Sources Analyzed:**
• Bloomberg: "NVIDIA AI chip breakthrough" (Weight: 85% - Professional journalism)
• Reuters: "NVIDIA earnings beat" (Weight: 85% - Fact-checked reporting)
• r/WallStreetBets: 47 mentions (Weight: 25% - Community sentiment)

**Why These Weights?**
Bloomberg and Reuters have professional fact-checkers and editorial standards (85% weight).
Reddit shows community excitement but can be unreliable for facts (25% weight).
```

## 🔍 How to Scrape Reddit Data

### Method 1: Using the Built-in Scraper (Recommended)
```typescript
import { scrapeWallStreetBets } from '@/lib/news/reddit-scraper'

// Scrape top 1000 posts from past week
const analysis = await scrapeWallStreetBets(1000, 'week')

console.log(analysis.summary)
// Output: Top 10 stocks with sentiment

console.log(analysis.stockMentions)
// Map of stock -> {count, sentiment, avgScore}
```

### Method 2: Get Sentiment for Specific Stock
```typescript
import { getStockSentimentFromReddit } from '@/lib/news/reddit-scraper'

const nvdaSentiment = await getStockSentimentFromReddit('NVDA', 100)

console.log(nvdaSentiment)
// {
//   sentiment: 'bullish',
//   mentionCount: 47,
//   avgScore: 1234,
//   topPosts: [...]
// }
```

### Method 3: Direct Reddit API (Manual)
Reddit provides JSON endpoints:
```
https://www.reddit.com/r/wallstreetbets/top.json?t=week&limit=100
```

## 📦 Data Compression Strategy

For 500k lines → 100k lines compression:

1. **Filter by relevance**: Only keep posts with stock mentions
2. **Remove duplicates**: Same stock mentioned multiple times
3. **Aggregate sentiment**: Group by stock ticker
4. **Keep top posts**: Sort by score, keep top 10% 
5. **Summarize with LLM**: Use AI to compress text

## 🎓 Training the AI

The AI is already trained! Here's how it uses the data:

1. **Real-time Context Injection**
   - News data fetched on every query
   - Injected into AI system prompt
   - AI analyzes and explains in real-time

2. **No Fine-tuning Needed**
   - Uses RAG (Retrieval Augmented Generation)
   - Fresh data every time
   - Always up-to-date

## ⚠️ Rate Limits & Considerations

### NewsAPI.org
- Free tier: 100 requests/day
- 100 articles per request
- Consider upgrading for production

### Reddit
- No API key needed (JSON endpoint)
- Rate limit: ~60 requests/minute
- Built-in 2-second delay between requests

## 🚀 Next Steps

1. **Test the integration**: Ask about a stock like NVIDIA or Tesla
2. **Monitor API usage**: Check NewsAPI dashboard
3. **Add more sources**: Integrate DeepStock, EquityPandit, etc.
4. **Optimize caching**: Cache Reddit data for 1 hour to reduce requests
5. **Add error handling**: Graceful fallbacks if APIs fail

## 📊 How to View Scraped Data

Create a test script to see the data:

```typescript
// test-scraper.ts
import { scrapeWallStreetBets } from './lib/news/reddit-scraper'

async function test() {
  const analysis = await scrapeWallStreetBets(100, 'week')
  console.log(JSON.stringify(analysis, null, 2))
}

test()
```

Run with: `npx tsx test-scraper.ts`

