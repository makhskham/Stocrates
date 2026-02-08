/**
 * API Manager with Automatic Fallback
 * Handles rate limiting and switches between multiple news APIs
 */

import { NewsArticle } from './news-fetcher'
import { fetchNewsFromNewsAPI } from './newsapi-fetcher'
import { fetchNewsFromFinnhub } from './finnhub-fetcher'

interface APIStatus {
  name: string
  available: boolean
  rateLimitResetTime?: number
  lastError?: string
  requestCount: number
  lastRequestTime: number
}

class NewsAPIManager {
  private apiStatus: Map<string, APIStatus> = new Map()
  private readonly RATE_LIMIT_COOLDOWN = 60 * 60 * 1000 // 1 hour in milliseconds
  private readonly MIN_REQUEST_INTERVAL = 1000 // 1 second between requests

  constructor() {
    // Initialize API status
    this.apiStatus.set('newsapi', {
      name: 'NewsAPI.org',
      available: true,
      requestCount: 0,
      lastRequestTime: 0
    })

    this.apiStatus.set('finnhub', {
      name: 'Finnhub',
      available: true,
      requestCount: 0,
      lastRequestTime: 0
    })
  }

  /**
   * Fetch news with automatic fallback
   */
  async fetchNewsWithFallback(
    symbol: string,
    companyName?: string,
    daysBack: number = 30
  ): Promise<{
    articles: NewsArticle[]
    source: string
    fallbackUsed: boolean
  }> {
    const apis = [
      {
        name: 'newsapi',
        fetch: () => fetchNewsFromNewsAPI(symbol, companyName, daysBack)
      },
      {
        name: 'finnhub',
        fetch: () => fetchNewsFromFinnhub(symbol, daysBack)
      }
    ]

    let lastError: Error | null = null
    let fallbackUsed = false

    for (const api of apis) {
      const status = this.apiStatus.get(api.name)!

      // Check if API is available
      if (!this.isAPIAvailable(api.name)) {
        console.log(`⏭️  Skipping ${status.name} - Rate limited or unavailable`)
        fallbackUsed = true
        continue
      }

      // Rate limiting - wait if needed
      await this.waitForRateLimit(api.name)

      try {
        console.log(`🔄 Attempting to fetch from ${status.name}...`)
        
        const articles = await api.fetch()
        
        // Update status on success
        this.markSuccess(api.name)
        
        if (articles.length > 0) {
          console.log(`✅ Successfully fetched ${articles.length} articles from ${status.name}`)
          return {
            articles,
            source: status.name,
            fallbackUsed
          }
        } else {
          console.log(`⚠️  ${status.name} returned 0 articles, trying next API...`)
          fallbackUsed = true
        }
      } catch (error) {
        lastError = error as Error
        
        // Check if it's a rate limit error
        if (error instanceof Error && error.message.includes('RATE_LIMIT')) {
          console.log(`⏸️  ${status.name} rate limit exceeded, marking as unavailable`)
          this.markRateLimited(api.name)
          fallbackUsed = true
        } else {
          console.error(`❌ Error fetching from ${status.name}:`, error)
          this.markError(api.name, error instanceof Error ? error.message : 'Unknown error')
          fallbackUsed = true
        }
      }
    }

    // All APIs failed
    console.error('❌ All news APIs failed or rate limited')
    return {
      articles: [],
      source: 'none',
      fallbackUsed: true
    }
  }

  /**
   * Check if API is available
   */
  private isAPIAvailable(apiName: string): boolean {
    const status = this.apiStatus.get(apiName)
    if (!status) return false

    // Check if rate limit has expired
    if (status.rateLimitResetTime && Date.now() < status.rateLimitResetTime) {
      return false
    }

    // Reset if cooldown period has passed
    if (status.rateLimitResetTime && Date.now() >= status.rateLimitResetTime) {
      status.available = true
      status.rateLimitResetTime = undefined
      console.log(`✅ ${status.name} rate limit reset, marking as available`)
    }

    return status.available
  }

  /**
   * Wait for rate limit if needed
   */
  private async waitForRateLimit(apiName: string): Promise<void> {
    const status = this.apiStatus.get(apiName)
    if (!status) return

    const timeSinceLastRequest = Date.now() - status.lastRequestTime
    
    if (timeSinceLastRequest < this.MIN_REQUEST_INTERVAL) {
      const waitTime = this.MIN_REQUEST_INTERVAL - timeSinceLastRequest
      console.log(`⏳ Waiting ${waitTime}ms before next request to ${status.name}`)
      await new Promise(resolve => setTimeout(resolve, waitTime))
    }

    status.lastRequestTime = Date.now()
  }

  /**
   * Mark API as successful
   */
  private markSuccess(apiName: string): void {
    const status = this.apiStatus.get(apiName)
    if (status) {
      status.available = true
      status.requestCount++
      status.lastError = undefined
    }
  }

  /**
   * Mark API as rate limited
   */
  private markRateLimited(apiName: string): void {
    const status = this.apiStatus.get(apiName)
    if (status) {
      status.available = false
      status.rateLimitResetTime = Date.now() + this.RATE_LIMIT_COOLDOWN
      status.lastError = 'Rate limit exceeded'
      console.log(`🚫 ${status.name} will be unavailable until ${new Date(status.rateLimitResetTime).toLocaleTimeString()}`)
    }
  }

  /**
   * Mark API as errored
   */
  private markError(apiName: string, error: string): void {
    const status = this.apiStatus.get(apiName)
    if (status) {
      status.lastError = error
      // Don't mark as unavailable for regular errors, only rate limits
    }
  }

  /**
   * Get status of all APIs
   */
  getStatus(): Record<string, APIStatus> {
    const status: Record<string, APIStatus> = {}
    this.apiStatus.forEach((value, key) => {
      status[key] = { ...value }
    })
    return status
  }

  /**
   * Reset all API statuses
   */
  reset(): void {
    this.apiStatus.forEach(status => {
      status.available = true
      status.rateLimitResetTime = undefined
      status.lastError = undefined
    })
    console.log('🔄 All API statuses reset')
  }
}

// Singleton instance
export const newsAPIManager = new NewsAPIManager()

