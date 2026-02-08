import { NextRequest, NextResponse } from 'next/server'
import { fetchHistoricalPrice } from '@/lib/stocks/historical-price-fetcher'

/**
 * GET /api/historical-price?symbol=AAPL&date=2024-01-15
 * Fetch historical stock price for a specific date
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const symbol = searchParams.get('symbol')
    const dateStr = searchParams.get('date')

    if (!symbol) {
      return NextResponse.json(
        { error: 'Missing required parameter: symbol' },
        { status: 400 }
      )
    }

    if (!dateStr) {
      return NextResponse.json(
        { error: 'Missing required parameter: date' },
        { status: 400 }
      )
    }

    // Parse the date
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) {
      return NextResponse.json(
        { error: 'Invalid date format. Use YYYY-MM-DD' },
        { status: 400 }
      )
    }

    // Fetch historical price
    const price = await fetchHistoricalPrice(symbol, date)

    if (price === null) {
      return NextResponse.json(
        { 
          error: `No historical price data available for ${symbol} on ${dateStr}`,
          symbol,
          date: dateStr,
          price: null
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      symbol,
      date: dateStr,
      price,
      source: 'finnhub',
      cached: false
    })

  } catch (error) {
    console.error('Error in historical-price API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

