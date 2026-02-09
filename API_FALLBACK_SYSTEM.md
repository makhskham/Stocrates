# API Fallback System - Rate Limit Protection

## Overview

Stocrates now has an **intelligent API fallback system** that automatically switches between multiple news APIs when rate limits are hit. This ensures uninterrupted service even when one API reaches its limit.

## Supported APIs

### 1. **NewsAPI.org** (Primary)
- **API Key**: Set in `.env.local` as `NEWS_API_KEY`
- **Rate Limit**: 100 requests/day (free tier)
- **Sources**: Bloomberg, Reuters, WSJ, Financial Times, CNBC, etc.
- **Credibility Weight**: 75-85%

### 2. **Finnhub** (Fallback)
- **API Key**: Set in `.env.local` as `FINNHUB_API_KEY`
- **Rate Limit**: 60 calls/minute (free tier)
- **Sources**: Company news, market news, earnings
- **Credibility Weight**: 70-80%

### 3. **Reddit r/wallstreetbets** (Social Sentiment)
- **API Key**: None needed (public JSON endpoint)
- **Rate Limit**: ~60 requests/minute
- **Credibility Weight**: 20-30%

## How It Works

### Automatic Fallback Flow

```
User asks about NVIDIA
    ↓
1. Try NewsAPI.org
    ├─ Success? → Return articles ✅
    ├─ Rate Limited? → Try next API ⏭️
    └─ Error? → Try next API ⏭️
    ↓
2. Try Finnhub
    ├─ Success? → Return articles ✅
    ├─ Rate Limited? → Try next API ⏭️
    └─ Error? → Try next API ⏭️
    ↓
3. All APIs failed?
    └─ Use mock data as fallback 
```

### Rate Limit Detection

The system automatically detects rate limits:
- **HTTP 429** status code
- **Error messages** containing "rate limit"
- **Empty responses** from APIs

When detected:
1. Mark API as unavailable
2. Set cooldown period (1 hour)
3. Switch to next available API
4. Auto-reset after cooldown

### Request Throttling

Built-in throttling prevents hitting rate limits:
- **Minimum 1 second** between requests to same API
- **Automatic waiting** if requests are too frequent
- **Request counting** to track usage

## File Structure

### `lib/news/api-manager.ts`
The core fallback system that manages all APIs:

```typescript
class NewsAPIManager {
  // Tracks status of each API
  private apiStatus: Map<string, APIStatus>
  
  // Main method - tries APIs in order
  async fetchNewsWithFallback(symbol, companyName, daysBack)
  
  // Checks if API is available
  private isAPIAvailable(apiName)
  
  // Marks API as rate limited
  private markRateLimited(apiName)
  
  // Auto-resets after cooldown
  private waitForRateLimit(apiName)
}
```

### `lib/news/finnhub-fetcher.ts`
Finnhub API integration:

```typescript
// Fetch company news
fetchNewsFromFinnhub(symbol, daysBack)

// Fetch market news
fetchMarketNewsFromFinnhub(category)

// Get company profile
getCompanyProfile(symbol)
```

### `lib/news/news-fetcher.ts` (Updated)
Now uses API manager:

```typescript
async function fetchFromMultipleSources(symbol, daysBack) {
  // Uses newsAPIManager for automatic fallback
  const result = await newsAPIManager.fetchNewsWithFallback(...)
  
  if (result.fallbackUsed) {
    console.log('Fallback was used')
  }
  
  return result.articles
}
```

## Usage Examples

### Basic Usage (Automatic)
```typescript
import { fetchStockNews } from '@/lib/news/news-fetcher'

// Automatically handles fallbacks
const analysis = await fetchStockNews('NVDA', 30)

// Check which API was used
console.log(analysis.articles[0].source)
```

### Check API Status
```typescript
import { newsAPIManager } from '@/lib/news/api-manager'

// Get status of all APIs
const status = newsAPIManager.getStatus()

console.log(status)
// {
//   newsapi: {
//     name: 'NewsAPI.org',
//     available: true,
//     requestCount: 45,
//     lastRequestTime: 1234567890
//   },
//   finnhub: {
//     name: 'Finnhub',
//     available: true,
//     requestCount: 12,
//     lastRequestTime: 1234567890
//   }
// }
```

### Manual Reset
```typescript
import { newsAPIManager } from '@/lib/news/api-manager'

// Reset all API statuses (useful for testing)
newsAPIManager.reset()
```

## Console Output Examples

### Successful Request
```
🔄 Attempting to fetch from NewsAPI.org...
✅ Successfully fetched 15 articles from NewsAPI.org
```

### Rate Limit Hit - Automatic Fallback
```
🔄 Attempting to fetch from NewsAPI.org...
⏸️  NewsAPI.org rate limit exceeded, marking as unavailable
🚫 NewsAPI.org will be unavailable until 3:45:00 PM
⏭️  Skipping NewsAPI.org - Rate limited or unavailable
🔄 Attempting to fetch from Finnhub...
✅ Successfully fetched 12 articles from Finnhub
⚠️  Fallback was used. Source: Finnhub
```

### All APIs Rate Limited
```
🔄 Attempting to fetch from NewsAPI.org...
⏭️  Skipping NewsAPI.org - Rate limited or unavailable
🔄 Attempting to fetch from Finnhub...
⏸️  Finnhub rate limit exceeded, marking as unavailable
❌ All news APIs failed or rate limited
⚠️  No real news found from any API, using mock data
```

## Configuration

### Cooldown Period
Default: 1 hour (3600000 ms)

To change:
```typescript
// In api-manager.ts
private readonly RATE_LIMIT_COOLDOWN = 60 * 60 * 1000 // 1 hour
```

### Request Interval
Default: 1 second (1000 ms)

To change:
```typescript
// In api-manager.ts
private readonly MIN_REQUEST_INTERVAL = 1000 // 1 second
```

## Best Practices

### 1. Monitor API Usage
```typescript
const status = newsAPIManager.getStatus()
console.log(`NewsAPI requests today: ${status.newsapi.requestCount}`)
```

### 2. Cache Results
Cache news data for 1 hour to reduce API calls:
```typescript
// TODO: Implement caching layer
const cacheKey = `news_${symbol}_${daysBack}`
const cached = cache.get(cacheKey)
if (cached) return cached
```

### 3. Use Appropriate Timeframes
- **Real-time data**: Use Finnhub (60 calls/min)
- **Historical analysis**: Use NewsAPI (100 calls/day)
- **Social sentiment**: Use Reddit (unlimited)

### 4. Upgrade APIs for Production
- **NewsAPI**: $449/month for unlimited requests
- **Finnhub**: $59/month for 300 calls/min

## Testing

### Test the Fallback System
```bash
# Test with all APIs
pnpm test:integration

# Test NewsAPI only
pnpm test:news

# Test Reddit only
pnpm test:reddit
```

### Simulate Rate Limit
```typescript
// Manually mark API as rate limited
newsAPIManager['markRateLimited']('newsapi')

// Now test - should use Finnhub
const result = await fetchStockNews('NVDA', 30)
console.log(result.articles[0].source) // Should be 'Finnhub'
```

## Rate Limit Tracking

The system tracks:
- **Request count** per API
- **Last request time**
- **Rate limit status**
- **Reset time**
- **Last error message**

## Future Enhancements

1. **Add more APIs**:
   - Alpha Vantage
   - Polygon.io
   - IEX Cloud
   - Yahoo Finance (unofficial)

2. **Smart routing**:
   - Route based on API strengths
   - NewsAPI for general news
   - Finnhub for earnings/financials

3. **Caching layer**:
   - Redis/Memcached
   - 1-hour cache for news
   - Reduce API calls by 90%

4. **Usage analytics**:
   - Track which APIs are used most
   - Optimize API selection
   - Cost analysis

## Summary

Your Stocrates app now has:
- ✅ **3 news sources**: NewsAPI, Finnhub, Reddit
- ✅ **Automatic fallback**: Switches when rate limited
- ✅ **Smart throttling**: Prevents hitting limits
- ✅ **Auto-recovery**: Resets after cooldown
- ✅ **Detailed logging**: See what's happening
- ✅ **Mock data fallback**: Never fails completely

**Result**: Uninterrupted news service even with free API tiers! 

