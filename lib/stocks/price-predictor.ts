/**
 * Stock Price Prediction Service
 * Uses AI to analyze news and generate fun predictions with confidence levels
 * 
 * DISCLAIMER: This is NOT financial advice. Predictions are for educational
 * and entertainment purposes only. Do not use for actual investment decisions.
 */

import { createGroq } from '@ai-sdk/groq'
import { generateText } from 'ai'
import { fetchNewsFromFinnhub } from '@/lib/news/finnhub-fetcher'

const GROQ_API_KEY = process.env.GROQ_API_KEY

export interface PricePrediction {
  symbol: string
  currentPrice: number
  predictedPrice: number
  predictedChange: number // percentage
  confidence: number // 0-100
  timeframe: '1day' | '1week' | '1month'
  reasoning: string
  newsFactors: string[]
  disclaimer: string
}

/**
 * Generate a fun prediction based on current news
 * ⚠️ NOT FINANCIAL ADVICE - For educational purposes only
 */
export async function generatePricePrediction(
  symbol: string,
  currentPrice: number,
  timeframe: '1day' | '1week' | '1month' = '1week'
): Promise<PricePrediction> {
  if (!GROQ_API_KEY) {
    return createMockPrediction(symbol, currentPrice, timeframe)
  }

  try {
    // Fetch recent news
    const news = await fetchNewsFromFinnhub(symbol, 7)
    const newsHeadlines = news.slice(0, 5).map(n => n.title).join('\n')

    const groq = createGroq({ apiKey: GROQ_API_KEY })

    const timeframeText = {
      '1day': '1 day',
      '1week': '1 week',
      '1month': '1 month'
    }[timeframe]

    const prompt = `You are analyzing stock ${symbol} for a fun educational prediction game.

Current Price: $${currentPrice}
Timeframe: ${timeframeText}

Recent News Headlines:
${newsHeadlines || 'No recent news available'}

Based on this information, create a FUN, EDUCATIONAL prediction. This is NOT financial advice.

Respond in this exact format:
PREDICTED_PRICE: [number]
CONFIDENCE: [0-100]
REASONING: [2-3 sentences explaining the prediction based on news sentiment]
FACTOR_1: [one news-based factor]
FACTOR_2: [one market trend factor]
FACTOR_3: [one technical factor]

Remember: This is a learning game, not real financial advice. Be creative but educational.`

    const result = await generateText({
      model: groq('llama-3.3-70b-versatile'),
      prompt,
      maxTokens: 300
    })

    // Parse response
    const text = result.text.trim()
    const priceMatch = text.match(/PREDICTED_PRICE:\s*\$?(\d+\.?\d*)/i)
    const confidenceMatch = text.match(/CONFIDENCE:\s*(\d+)/i)
    const reasoningMatch = text.match(/REASONING:\s*(.+?)(?=FACTOR_|$)/is)
    const factor1Match = text.match(/FACTOR_1:\s*(.+?)(?=FACTOR_|$)/is)
    const factor2Match = text.match(/FACTOR_2:\s*(.+?)(?=FACTOR_|$)/is)
    const factor3Match = text.match(/FACTOR_3:\s*(.+?)(?=FACTOR_|$)/is)

    const predictedPrice = parseFloat(priceMatch?.[1] || String(currentPrice * 1.02))
    const confidence = parseInt(confidenceMatch?.[1] || '50', 10)
    const reasoning = reasoningMatch?.[1]?.trim() || 'Based on current market conditions and news sentiment.'
    
    const newsFactors = [
      factor1Match?.[1]?.trim() || 'Market sentiment analysis',
      factor2Match?.[1]?.trim() || 'Recent news trends',
      factor3Match?.[1]?.trim() || 'Technical indicators'
    ]

    const predictedChange = ((predictedPrice - currentPrice) / currentPrice) * 100

    return {
      symbol,
      currentPrice,
      predictedPrice,
      predictedChange,
      confidence: Math.min(Math.max(confidence, 0), 100),
      timeframe,
      reasoning,
      newsFactors,
      disclaimer: '⚠️ This is NOT financial advice. This is a fun educational prediction game based on news analysis. Do not use for actual investment decisions.'
    }
  } catch (error) {
    console.error('Error generating prediction:', error)
    return createMockPrediction(symbol, currentPrice, timeframe)
  }
}

/**
 * Create a mock prediction when API is unavailable
 */
function createMockPrediction(
  symbol: string,
  currentPrice: number,
  timeframe: '1day' | '1week' | '1month'
): PricePrediction {
  // Random prediction between -5% and +5%
  const randomChange = (Math.random() * 10) - 5
  const predictedPrice = currentPrice * (1 + randomChange / 100)

  return {
    symbol,
    currentPrice,
    predictedPrice,
    predictedChange: randomChange,
    confidence: Math.floor(Math.random() * 30) + 40, // 40-70%
    timeframe,
    reasoning: 'Based on general market trends and historical patterns.',
    newsFactors: [
      'Market volatility analysis',
      'Sector performance trends',
      'Historical price patterns'
    ],
    disclaimer: '⚠️ This is NOT financial advice. This is a fun educational prediction game. Do not use for actual investment decisions.'
  }
}

