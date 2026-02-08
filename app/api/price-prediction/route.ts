import { NextRequest, NextResponse } from 'next/server'
import { generatePricePrediction } from '@/lib/stocks/price-predictor'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const symbol = typeof body.symbol === 'string' ? body.symbol.trim().toUpperCase() : ''
    const currentPrice = typeof body.currentPrice === 'number' ? body.currentPrice : NaN
    const timeframe = body.timeframe === '1day' || body.timeframe === '1week' || body.timeframe === '1month'
      ? body.timeframe
      : '1week'

    if (!symbol) {
      return NextResponse.json({ error: 'Missing or invalid symbol' }, { status: 400 })
    }

    if (!Number.isFinite(currentPrice) || currentPrice <= 0) {
      return NextResponse.json({ error: 'Missing or invalid currentPrice' }, { status: 400 })
    }

    const prediction = await generatePricePrediction(symbol, currentPrice, timeframe)

    return NextResponse.json(prediction)
  } catch (error) {
    console.error('Error in price-prediction API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
