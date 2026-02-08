/**
 * News Fetcher for Stocrates
 * Fetches and analyzes news from multiple credible sources
 */

import { getCompanyName } from './newsapi-fetcher'
import { getStockSentimentFromReddit } from './reddit-scraper'
import { newsAPIManager } from './api-manager'

export interface NewsArticle {
  title: string
  source: string
  url: string
  publishedAt: string
  snippet: string
  sentiment?: 'positive' | 'negative' | 'neutral'
}

export interface NewsAnalysis {
  articles: NewsArticle[]
  overallSentiment: 'positive' | 'negative' | 'neutral'
  positiveCount: number
  negativeCount: number
  neutralCount: number
  sources: string[]
  redditSentiment?: {
    sentiment: 'bullish' | 'bearish' | 'neutral'
    mentionCount: number
    avgScore: number
    weight: number
  }
}

/**
 * Fetch news for a given stock symbol from multiple sources
 * @param symbol - Stock symbol (e.g., "NVDA", "AAPL")
 * @param daysBack - Number of days to look back (default: 30)
 */
export async function fetchStockNews(
  symbol: string,
  daysBack: number = 30
): Promise<NewsAnalysis> {
  try {
    // Fetch news articles from multiple sources
    const articles: NewsArticle[] = await fetchFromMultipleSources(symbol, daysBack)

    // Analyze sentiment using keyword matching
    const articlesWithSentiment = await analyzeSentimentForArticles(articles)

    // Get Reddit sentiment (async, don't block on it)
    let redditSentiment: NewsAnalysis['redditSentiment'] | undefined
    try {
      const redditData = await getStockSentimentFromReddit(symbol, 100)
      if (redditData.mentionCount > 0) {
        redditSentiment = {
          sentiment: redditData.sentiment,
          mentionCount: redditData.mentionCount,
          avgScore: redditData.avgScore,
          weight: 25 // Reddit gets 25% weight
        }
      }
    } catch (error) {
      console.error('Error fetching Reddit sentiment:', error)
    }

    // Analyze overall sentiment
    const analysis = analyzeSentiment(articlesWithSentiment)
    analysis.redditSentiment = redditSentiment

    return analysis
  } catch (error) {
    console.error('Error fetching news:', error)
    // Return mock data as fallback
    return getMockNewsData(symbol)
  }
}

/**
 * Fetch news from multiple sources with automatic fallback
 */
async function fetchFromMultipleSources(
  symbol: string,
  daysBack: number
): Promise<NewsArticle[]> {
  try {
    // Use API manager for automatic fallback between NewsAPI and Finnhub
    const companyName = getCompanyName(symbol)
    const result = await newsAPIManager.fetchNewsWithFallback(symbol, companyName, daysBack)

    if (result.fallbackUsed) {
      console.log(`⚠️  Fallback was used. Source: ${result.source}`)
    }

    // If no articles found from any API, use mock data as fallback
    if (result.articles.length === 0) {
      console.log('⚠️  No real news found from any API, using mock data')
      return getMockNewsData(symbol).articles
    }

    console.log(`✅ Fetched ${result.articles.length} articles from ${result.source}`)
    return result.articles

  } catch (error) {
    console.error('❌ Error fetching from multiple sources:', error)
    return getMockNewsData(symbol).articles
  }
}

/**
 * Analyze sentiment for articles using keyword matching
 */
async function analyzeSentimentForArticles(
  articles: NewsArticle[]
): Promise<NewsArticle[]> {
  const positiveKeywords = ['surge', 'gain', 'upgrade', 'growth', 'expansion', 'profit', 'beat', 'strong', 'bullish', 'rally', 'soar', 'jump', 'rise', 'boost', 'outperform', 'record', 'breakthrough', 'innovation', 'partnership', 'acquisition', 'revenue growth', 'earnings beat', 'positive outlook', 'analyst upgrade', 'price target increase', 'new product launch', 'market share gain', 'strong guidance', 'institutional buying', 'insider buying', 'high demand', 'supply chain improvement', 'cost reduction', 'margin expansion', 'cash flow improvement', 'debt reduction', 'share buyback', 'dividend increase', 'positive sentiment', 'bullish sentiment', 'upward momentum', 'technical breakout', 'favorable analyst report', 'strong earnings report', 'positive news flow', 'increased trading volume', 'short squeeze', 'positive social media sentiment', 'influencer endorsement', 'celebrity endorsement', 'favorable industry trends']
  const negativeKeywords = ['fall', 'drop', 'downgrade', 'loss', 'decline', 'weak', 'miss', 'bearish', 'crash', 'plunge', 'layoffs', 'fired', 'terminated', 'lawsuit', 'investigation', 'regulatory scrutiny', 'bankruptcy', 'delisting', 'scandal', 'fraud', 'penalty', 'fine', 'warning', 'concern', 'risk', 'threat', 'uncertainty', 'volatility', 'headwind', 'challenge', 'downturn', 'recession', 'slowdown', 'missed expectations', 'bankruptcy risk', 'delisting risk', 'scandal risk', 'fraud risk', 'penalty risk', 'fine risk', 'warning risk', 'concern risk', 'risk of decline', 'risk of loss', 'risk of drop', 'risk of fall', 'risk of bankruptcy', 'risk of delisting', 'scandal risk', 'fraud risk', 'penalty risk', 'fine risk', 'warning risk', 'concern risk']

  return articles.map(article => {
    const text = (article.title + ' ' + article.snippet).toLowerCase()

    const positiveScore = positiveKeywords.filter(kw => text.includes(kw)).length
    const negativeScore = negativeKeywords.filter(kw => text.includes(kw)).length

    let sentiment: 'positive' | 'negative' | 'neutral' = 'neutral'
    if (positiveScore > negativeScore) {
      sentiment = 'positive'
    } else if (negativeScore > positiveScore) {
      sentiment = 'negative'
    }

    return { ...article, sentiment }
  })
}

/**
 * Get mock news data (fallback)
 */
function getMockNewsData(symbol: string): NewsAnalysis {
  const mockArticles: NewsArticle[] = [
    {
      title: `${symbol} announces major expansion plans`,
      source: 'Bloomberg',
      url: 'https://bloomberg.com/example',
      publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      snippet: 'Company announces significant investment in new facilities...',
      sentiment: 'positive'
    },
    {
      title: `Analysts upgrade ${symbol} price target`,
      source: 'Reuters',
      url: 'https://reuters.com/example',
      publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      snippet: 'Multiple analysts raise price targets following strong earnings...',
      sentiment: 'positive'
    },
    {
      title: `${symbol} faces regulatory scrutiny`,
      source: 'WSJ',
      url: 'https://wsj.com/example',
      publishedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      snippet: 'Regulatory bodies announce investigation into company practices...',
      sentiment: 'negative'
    },
    {
      title: `${symbol} quarterly earnings report`,
      source: 'Yahoo Finance',
      url: 'https://finance.yahoo.com/example',
      publishedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      snippet: 'Company reports mixed results in latest quarterly earnings...',
      sentiment: 'neutral'
    }
  ]

  return analyzeSentiment(mockArticles)
}

/**
 * Analyze sentiment of news articles
 */
export function analyzeSentiment(articles: NewsArticle[]): NewsAnalysis {
  const positiveCount = articles.filter(a => a.sentiment === 'positive').length
  const negativeCount = articles.filter(a => a.sentiment === 'negative').length
  const neutralCount = articles.filter(a => a.sentiment === 'neutral').length

  let overallSentiment: 'positive' | 'negative' | 'neutral' = 'neutral'
  if (positiveCount > negativeCount && positiveCount > neutralCount) {
    overallSentiment = 'positive'
  } else if (negativeCount > positiveCount && negativeCount > neutralCount) {
    overallSentiment = 'negative'
  }

  return {
    articles,
    overallSentiment,
    positiveCount,
    negativeCount,
    neutralCount,
    sources: [...new Set(articles.map(a => a.source))]
  }
}

/**
 * Get source credibility weight
 */
export function getSourceWeight(source: string): number {
  const weights: Record<string, number> = {
    'Bloomberg': 85,
    'Reuters': 85,
    'WSJ': 80,
    'Wall Street Journal': 80,
    'Yahoo Finance': 75,
    'DeepStock': 75,
    'EquityPandit': 75,
    'Tickertape': 70,
    'Trending Neurons': 70,
    'Reddit': 25,
    'Twitter': 20,
    'X': 20
  }

  return weights[source] || 50
}

/**
 * Format news analysis for display
 */
export function formatNewsAnalysis(analysis: NewsAnalysis, symbol: string): string {
  const sentimentEmoji = {
    positive: '📈',
    negative: '📉',
    neutral: '➡️'
  }

  let output = `**Recent News Analysis (Past 30 Days):**
${sentimentEmoji[analysis.overallSentiment]} Overall sentiment: ${analysis.overallSentiment.toUpperCase()} (${analysis.positiveCount} positive, ${analysis.negativeCount} negative, ${analysis.neutralCount} neutral)

**Key Headlines:**
${analysis.articles.slice(0, 3).map(article =>
  `• ${article.title} - ${article.source} (${article.sentiment})`
).join('\n')}`

  // Add Reddit sentiment if available
  if (analysis.redditSentiment && analysis.redditSentiment.mentionCount > 0) {
    const redditEmoji = {
      bullish: '🚀',
      bearish: '📉',
      neutral: '➡️'
    }
    output += `\n\n**r/WallStreetBets Sentiment:**
${redditEmoji[analysis.redditSentiment.sentiment]} ${analysis.redditSentiment.sentiment.toUpperCase()} - ${analysis.redditSentiment.mentionCount} mentions (avg score: ${Math.round(analysis.redditSentiment.avgScore)})
Weight: ${analysis.redditSentiment.weight}% (Social media sentiment)`
  }

  return output
}

