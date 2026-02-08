# 🚀 Reddit r/wallstreetbets Scraping Guide

## 📋 Quick Start

### 1. Install Dependencies
```bash
pnpm install
```

This will install `tsx` which is needed to run the test scripts.

### 2. Run Tests

#### Test Reddit Scraper
```bash
pnpm test:reddit
```
This will:
- Scrape top 100 posts from r/wallstreetbets
- Extract stock ticker mentions
- Analyze sentiment (bullish/bearish/neutral)
- Show top mentioned stocks
- Display sample posts

#### Test NewsAPI Integration
```bash
pnpm test:news
```
This will:
- Fetch real news from Bloomberg, Reuters, WSJ, etc.
- Test with NVIDIA (NVDA)
- Show top business headlines
- Display source distribution

#### Test Full Integration
```bash
pnpm test:integration
```
This will:
- Combine NewsAPI + Reddit + Sentiment Analysis
- Test with NVDA, TSLA, AAPL
- Show formatted output (as sent to AI)
- Calculate confidence levels

## 🎯 How Reddit Scraping Works

### Data Source
Reddit provides public JSON endpoints:
```
https://www.reddit.com/r/wallstreetbets/top.json?t=week&limit=100
```

No API key needed! Just add a User-Agent header.

### What We Extract

#### From Each Post:
- **Title** - Post headline
- **Author** - Reddit username
- **Score** - Upvotes (net score)
- **Upvote Ratio** - % of upvotes vs downvotes
- **Comments** - Number of comments
- **Created** - Timestamp
- **URL** - Link to post
- **Text** - Post body (selftext)
- **Flair** - Post category (DD, YOLO, Gain, Loss, etc.)

#### Stock Mentions:
We extract tickers using regex patterns:
- `$TSLA` - Dollar sign format
- `NVDA` - All caps (2-5 letters)
- Filters out common words (THE, AND, FOR, etc.)

#### Sentiment Analysis:
**Bullish Keywords:**
- moon, rocket, calls, buy, yolo, tendies
- diamond hands, hold, hodl, squeeze
- rally, breakout, pump, gains

**Bearish Keywords:**
- puts, short, crash, dump, loss
- paper hands, rug pull, scam
- tank, plunge, collapse, dead

### Rate Limiting
- Built-in 2-second delay between requests
- Fetches in batches of 100 posts
- Can scrape up to 1000 posts safely

## 📊 Data Structure

### RedditPost Interface
```typescript
{
  id: string
  title: string
  author: string
  score: number
  upvoteRatio: number
  numComments: number
  created: number
  url: string
  selftext: string
  flair?: string
  stockMentions: string[]
  sentiment?: 'bullish' | 'bearish' | 'neutral'
}
```

### RedditAnalysis Interface
```typescript
{
  posts: RedditPost[]
  totalPosts: number
  stockMentions: Map<string, {
    count: number
    bullishCount: number
    bearishCount: number
    sentiment: 'bullish' | 'bearish' | 'neutral'
    avgScore: number
  }>
  summary: string
}
```

## 🔧 Usage in Code

### Get Overall WSB Sentiment
```typescript
import { scrapeWallStreetBets } from '@/lib/news/reddit-scraper'

const analysis = await scrapeWallStreetBets(1000, 'week')

console.log(analysis.summary)
// 📊 r/WallStreetBets Analysis (1000 posts)
// 
// 🔥 Top Mentioned Stocks:
// 1. 🚀 $NVDA - 47 mentions (BULLISH, avg score: 1234)
// 2. 🚀 $TSLA - 38 mentions (BULLISH, avg score: 892)
// ...
```

### Get Sentiment for Specific Stock
```typescript
import { getStockSentimentFromReddit } from '@/lib/news/reddit-scraper'

const nvda = await getStockSentimentFromReddit('NVDA', 100)

console.log(nvda)
// {
//   sentiment: 'bullish',
//   mentionCount: 47,
//   avgScore: 1234,
//   topPosts: [...]
// }
```

## 📈 Integration with Stocrates

The Reddit data is automatically integrated into stock analysis:

1. User asks: "Tell me about NVIDIA"
2. System fetches:
   - News from NewsAPI (Bloomberg, Reuters, WSJ)
   - Reddit sentiment from r/wallstreetbets
3. Combines data with weights:
   - News sources: 75-85% weight
   - Reddit: 25% weight
4. AI generates educational response with:
   - Real news headlines
   - Reddit community sentiment
   - Source credibility explanations
   - Historical pattern matching
   - Educational predictions

## 🎓 Example Output

```
Here's NVIDIA's stock chart!

**Recent News Analysis (Past 30 Days):**
📈 Overall sentiment: POSITIVE (12 positive, 3 negative, 2 neutral)

**Key Headlines:**
• NVIDIA announces new AI chip - Bloomberg (positive)
• NVIDIA stock surges on earnings - Reuters (positive)

**r/WallStreetBets Sentiment:**
🚀 BULLISH - 47 mentions (avg score: 1,234)
Weight: 25% (Social media sentiment)

📊 **Confidence Levels:**
• Credible sources: 78%
• Social sentiment: 85%
```

## 🚨 Important Notes

### Legal & Ethical
- ✅ Uses public Reddit JSON API
- ✅ No authentication required
- ✅ Respects rate limits
- ✅ Educational use only

### Limitations
- Free tier: No API key needed
- Rate limit: ~60 requests/minute
- Max posts per request: 100
- Historical data: Limited to Reddit's API

### Best Practices
1. Cache results for 1 hour to reduce requests
2. Use timeframe='week' for recent sentiment
3. Filter by score (>100) for quality posts
4. Combine with credible news sources
5. Always explain source weights to users

## 📝 Next Steps

1. **Test the scrapers**: Run `pnpm test:reddit`
2. **Check the output**: Review JSON data structure
3. **Test in app**: Ask about a stock like NVIDIA
4. **Monitor usage**: Check console logs
5. **Optimize**: Add caching if needed

