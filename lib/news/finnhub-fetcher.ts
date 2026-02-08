/**
 * Finnhub API Integration
 * Fetches real-time stock news and market data
 */

import { NewsArticle } from './news-fetcher'

const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY
const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1'

/**
 * Fetch company news from Finnhub
 * @param symbol - Stock symbol (e.g., "NVDA", "AAPL")
 * @param daysBack - Number of days to look back (default: 30)
 */
export async function fetchNewsFromFinnhub(
  symbol: string,
  daysBack: number = 30
): Promise<NewsArticle[]> {
  if (!FINNHUB_API_KEY) {
    console.warn('FINNHUB_API_KEY not found in environment variables')
    return []
  }

  try {
    // Calculate date range
    const toDate = new Date()
    const fromDate = new Date()
    fromDate.setDate(fromDate.getDate() - daysBack)

    // Format dates as YYYY-MM-DD
    const from = fromDate.toISOString().split('T')[0]
    const to = toDate.toISOString().split('T')[0]

    const url = `${FINNHUB_BASE_URL}/company-news?symbol=${symbol}&from=${from}&to=${to}&token=${FINNHUB_API_KEY}`

    const response = await fetch(url)

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('RATE_LIMIT_EXCEEDED')
      }
      throw new Error(`Finnhub API error: ${response.status}`)
    }

    const data = await response.json()

    // Convert to our NewsArticle format
    const articles: NewsArticle[] = data.map((article: any) => ({
      title: article.headline,
      source: article.source || 'Finnhub',
      url: article.url,
      publishedAt: new Date(article.datetime * 1000).toISOString(),
      snippet: article.summary || '',
      sentiment: undefined // Will be analyzed later
    }))

    return articles
  } catch (error) {
    if (error instanceof Error && error.message === 'RATE_LIMIT_EXCEEDED') {
      throw error // Re-throw to trigger fallback
    }
    console.error('Error fetching from Finnhub:', error)
    return []
  }
}

/**
 * Fetch market news from Finnhub
 * @param category - News category: 'general', 'forex', 'crypto', 'merger'
 */
export async function fetchMarketNewsFromFinnhub(
  category: string = 'general'
): Promise<NewsArticle[]> {
  if (!FINNHUB_API_KEY) {
    console.warn('FINNHUB_API_KEY not found in environment variables')
    return []
  }

  try {
    const url = `${FINNHUB_BASE_URL}/news?category=${category}&token=${FINNHUB_API_KEY}`

    const response = await fetch(url)

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('RATE_LIMIT_EXCEEDED')
      }
      throw new Error(`Finnhub API error: ${response.status}`)
    }

    const data = await response.json()

    const articles: NewsArticle[] = data.slice(0, 20).map((article: any) => ({
      title: article.headline,
      source: article.source || 'Finnhub',
      url: article.url,
      publishedAt: new Date(article.datetime * 1000).toISOString(),
      snippet: article.summary || '',
      sentiment: undefined
    }))

    return articles
  } catch (error) {
    if (error instanceof Error && error.message === 'RATE_LIMIT_EXCEEDED') {
      throw error
    }
    console.error('Error fetching market news from Finnhub:', error)
    return []
  }
}

/**
 * Get company profile from Finnhub
 */
export async function getCompanyProfile(symbol: string): Promise<{
  name: string
  ticker: string
  industry: string
  marketCap: number
} | null> {
  if (!FINNHUB_API_KEY) {
    return null
  }

  try {
    const url = `${FINNHUB_BASE_URL}/stock/profile2?symbol=${symbol}&token=${FINNHUB_API_KEY}`

    const response = await fetch(url)

    if (!response.ok) {
      return null
    }

    const data = await response.json()

    return {
      name: data.name,
      ticker: data.ticker,
      industry: data.finnhubIndustry,
      marketCap: data.marketCapitalization
    }
  } catch (error) {
    console.error('Error fetching company profile:', error)
    return null
  }
}

