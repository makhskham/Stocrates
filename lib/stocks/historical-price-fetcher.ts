/**
 * Historical Stock Price Fetcher
 * Fetches real historical stock prices from Finnhub API
 */

const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY
const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1'

interface StockCandle {
  c: number[]  // Close prices
  h: number[]  // High prices
  l: number[]  // Low prices
  o: number[]  // Open prices
  t: number[]  // Timestamps
  v: number[]  // Volume
  s: string    // Status
}

// Cache to avoid excessive API calls
const priceCache = new Map<string, { price: number; timestamp: number }>()
const CACHE_DURATION = 60 * 60 * 1000 // 1 hour

/**
 * Fetch historical stock price for a specific date
 * @param symbol - Stock symbol (e.g., "AAPL", "TSLA")
 * @param date - The date to fetch the price for
 * @returns The closing price on that date, or null if unavailable
 */
export async function fetchHistoricalPrice(
  symbol: string,
  date: Date
): Promise<number | null> {
  if (!FINNHUB_API_KEY) {
    console.warn('FINNHUB_API_KEY not found in environment variables')
    return null
  }

  // Create cache key
  const dateStr = date.toISOString().split('T')[0]
  const cacheKey = `${symbol}_${dateStr}`

  // Check cache
  const cached = priceCache.get(cacheKey)
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log(`Using cached price for ${symbol} on ${dateStr}: $${cached.price}`)
    return cached.price
  }

  try {
    // Convert date to Unix timestamp (seconds)
    const targetDate = new Date(date)
    targetDate.setHours(0, 0, 0, 0)
    
    // Get the day before and after to ensure we capture the date
    const fromDate = new Date(targetDate)
    fromDate.setDate(fromDate.getDate() - 1)
    
    const toDate = new Date(targetDate)
    toDate.setDate(toDate.getDate() + 1)

    const from = Math.floor(fromDate.getTime() / 1000)
    const to = Math.floor(toDate.getTime() / 1000)

    // Finnhub stock candles endpoint
    // Resolution: D = Daily
    const url = `${FINNHUB_BASE_URL}/stock/candle?symbol=${symbol}&resolution=D&from=${from}&to=${to}&token=${FINNHUB_API_KEY}`

    const response = await fetch(url)

    if (!response.ok) {
      if (response.status === 429) {
        console.warn('⏸️ Finnhub rate limit exceeded')
        return null
      }
      throw new Error(`Finnhub API error: ${response.status}`)
    }

    const data: StockCandle = await response.json()

    // Check if we got valid data
    if (data.s !== 'ok' || !data.c || data.c.length === 0) {
      console.warn(`No historical data available for ${symbol} on ${dateStr}`)
      return null
    }

    // Get the closing price (most recent in the range)
    const closingPrice = data.c[data.c.length - 1]

    // Cache the result
    priceCache.set(cacheKey, {
      price: closingPrice,
      timestamp: Date.now()
    })

    console.log(`✅ Fetched historical price for ${symbol} on ${dateStr}: $${closingPrice}`)
    return closingPrice

  } catch (error) {
    console.error(`❌ Error fetching historical price for ${symbol}:`, error)
    return null
  }
}

/**
 * Fetch historical prices for multiple dates
 * @param symbol - Stock symbol
 * @param dates - Array of dates to fetch prices for
 * @returns Map of date strings to prices
 */
export async function fetchHistoricalPrices(
  symbol: string,
  dates: Date[]
): Promise<Map<string, number>> {
  const results = new Map<string, number>()

  for (const date of dates) {
    const price = await fetchHistoricalPrice(symbol, date)
    if (price !== null) {
      const dateStr = date.toISOString().split('T')[0]
      results.set(dateStr, price)
    }
    
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100))
  }

  return results
}

/**
 * Clear the price cache (useful for testing)
 */
export function clearPriceCache(): void {
  priceCache.clear()
  console.log('Price cache cleared')
}

