/**
 * NewsAPI.org Integration
 * Fetches real news from Bloomberg, Reuters, WSJ, Yahoo Finance, etc.
 */

import { NewsArticle } from './news-fetcher'

const NEWS_API_KEY = process.env.NEWS_API_KEY
const NEWS_API_BASE_URL = 'https://newsapi.org/v2'

/**
 * Fetch news for a stock from NewsAPI.org
 * @param symbol - Stock symbol (e.g., "NVDA", "AAPL")
 * @param companyName - Company name for better search results
 * @param daysBack - Number of days to look back (default: 30)
 */
export async function fetchNewsFromNewsAPI(
  symbol: string,
  companyName?: string,
  daysBack: number = 30
): Promise<NewsArticle[]> {
  if (!NEWS_API_KEY) {
    console.warn('NEWS_API_KEY not found in environment variables')
    return []
  }

  try {
    // Calculate date range
    const toDate = new Date()
    const fromDate = new Date()
    fromDate.setDate(fromDate.getDate() - daysBack)

    // Build search query - use company name if available, otherwise symbol
    const searchQuery = companyName 
      ? `"${companyName}" OR ${symbol}` 
      : symbol

    // Fetch from top business sources
    const sources = [
      'bloomberg',
      'reuters',
      'the-wall-street-journal',
      'financial-times',
      'business-insider',
      'cnbc',
      'fortune'
    ].join(',')

    const url = `${NEWS_API_BASE_URL}/everything?` + new URLSearchParams({
      q: searchQuery,
      sources: sources,
      from: fromDate.toISOString().split('T')[0],
      to: toDate.toISOString().split('T')[0],
      language: 'en',
      sortBy: 'relevancy',
      pageSize: '100',
      apiKey: NEWS_API_KEY
    })

    const response = await fetch(url)
    
    if (!response.ok) {
      throw new Error(`NewsAPI error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()

    if (data.status !== 'ok') {
      throw new Error(`NewsAPI error: ${data.message || 'Unknown error'}`)
    }

    // Convert to our NewsArticle format
    const articles: NewsArticle[] = data.articles.map((article: any) => ({
      title: article.title,
      source: mapSourceName(article.source.name),
      url: article.url,
      publishedAt: article.publishedAt,
      snippet: article.description || article.content?.substring(0, 200) || '',
      sentiment: undefined // Will be analyzed later
    }))

    return articles
  } catch (error) {
    console.error('Error fetching from NewsAPI:', error)
    return []
  }
}

/**
 * Map NewsAPI source names to our standard source names
 */
function mapSourceName(sourceName: string): string {
  const mapping: Record<string, string> = {
    'Bloomberg': 'Bloomberg',
    'Reuters': 'Reuters',
    'The Wall Street Journal': 'WSJ',
    'Financial Times': 'Financial Times',
    'Business Insider': 'Business Insider',
    'CNBC': 'CNBC',
    'Fortune': 'Fortune',
    'Yahoo Finance': 'Yahoo Finance'
  }

  return mapping[sourceName] || sourceName
}

/**
 * Fetch top business headlines
 */
export async function fetchTopBusinessNews(
  country: string = 'us',
  pageSize: number = 20
): Promise<NewsArticle[]> {
  if (!NEWS_API_KEY) {
    console.warn('NEWS_API_KEY not found in environment variables')
    return []
  }

  try {
    const url = `${NEWS_API_BASE_URL}/top-headlines?` + new URLSearchParams({
      category: 'business',
      country: country,
      pageSize: pageSize.toString(),
      apiKey: NEWS_API_KEY
    })

    const response = await fetch(url)
    
    if (!response.ok) {
      throw new Error(`NewsAPI error: ${response.status}`)
    }

    const data = await response.json()

    const articles: NewsArticle[] = data.articles.map((article: any) => ({
      title: article.title,
      source: mapSourceName(article.source.name),
      url: article.url,
      publishedAt: article.publishedAt,
      snippet: article.description || '',
      sentiment: undefined
    }))

    return articles
  } catch (error) {
    console.error('Error fetching top business news:', error)
    return []
  }
}

/**
 * Get company name from stock symbol (basic mapping)
 * In production, you'd use a proper stock symbol API
 */
export function getCompanyName(symbol: string): string | undefined {
  const companies: Record<string, string> = {
    'AAPL': 'Apple',
    'MSFT': 'Microsoft',
    'GOOGL': 'Google',
    'GOOG': 'Google',
    'AMZN': 'Amazon',
    'NVDA': 'NVIDIA',
    'TSLA': 'Tesla',
    'META': 'Meta',
    'BRK.B': 'Berkshire Hathaway',
    'V': 'Visa',
    'JPM': 'JPMorgan Chase',
    'WMT': 'Walmart',
    'MA': 'Mastercard',
    'PG': 'Procter & Gamble',
    'UNH': 'UnitedHealth',
    'HD': 'Home Depot',
    'DIS': 'Disney',
    'BAC': 'Bank of America',
    'NFLX': 'Netflix',
    'AMD': 'AMD'
  }

  return companies[symbol.toUpperCase()]
}

