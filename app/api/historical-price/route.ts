import { NextRequest, NextResponse } from 'next/server'
import { fetchHistoricalPrice } from '@/lib/stocks/historical-price-fetcher'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const symbol = searchParams.get('symbol')
    const dateParam = searchParams.get('date')
    
    if (!symbol) {
      return NextResponse.json({ error: 'Missing symbol parameter' }, { status: 400 })
    }
    
    if (!dateParam) {
      return NextResponse.json({ error: 'Missing date parameter' }, { status: 400 })
    }
    
    // Parse the date
    const date = new Date(dateParam)
    
    if (isNaN(date.getTime())) {
      return NextResponse.json({ error: 'Invalid date format' }, { status: 400 })
    }
    
    // Fetch historical price
    const price = await fetchHistoricalPrice(symbol, date)
    
    if (price === null) {
      return NextResponse.json({ 
        error: 'No historical data available for this symbol and date',
        symbol,
        date: dateParam
      }, { status: 404 })
    }
    
    return NextResponse.json({ 
      price,
      symbol,
      date: dateParam
    })
  } catch (error) {
    console.error('Error in historical-price API:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

