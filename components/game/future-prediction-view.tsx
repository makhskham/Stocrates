'use client'

import React, { useState, useEffect } from 'react'
import { useGame } from '@/lib/game/game-context'
import { Button } from '@/components/ui/button'
import { type PricePrediction } from '@/lib/stocks/price-predictor'
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  Loader2,
  AlertTriangle,
  Calendar,
  Target,
  Brain,
  Newspaper
} from 'lucide-react'
import { format, differenceInDays } from 'date-fns'

export function FuturePredictionView() {
  const { gameState } = useGame()
  const { investments } = gameState.portfolio
  const [predictions, setPredictions] = useState<Map<string, PricePrediction>>(new Map())
  const [currentPrices, setCurrentPrices] = useState<Map<string, number>>(new Map())
  const [isLoadingPrices, setIsLoadingPrices] = useState(false)
  const [isLoadingPredictions, setIsLoadingPredictions] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const futureDate = gameState.selectedDate
  const today = new Date()
  const daysInFuture = differenceInDays(futureDate, today)

  // Determine timeframe based on days in future
  const getTimeframe = (): '1day' | '1week' | '1month' => {
    if (daysInFuture <= 2) return '1day'
    if (daysInFuture <= 14) return '1week'
    return '1month'
  }

  const fetchCurrentPrice = async (symbol: string, fallbackPrice: number) => {
    try {
      const todayStr = new Date().toISOString().split('T')[0]
      const response = await fetch(`/api/historical-price?symbol=${symbol}&date=${todayStr}`)
      if (!response.ok) {
        return fallbackPrice
      }
      const data = await response.json()
      return typeof data.price === 'number' ? data.price : fallbackPrice
    } catch (err) {
      return fallbackPrice
    }
  }

  const loadCurrentPrices = async () => {
    if (investments.length === 0) return
    setIsLoadingPrices(true)
    setError(null)
    try {
      const priceMap = new Map<string, number>()
      for (const investment of investments) {
        const fallbackPrice = investment.currentPrice || investment.purchasePrice
        const price = await fetchCurrentPrice(investment.symbol, fallbackPrice)
        priceMap.set(investment.id, price)
      }
      setCurrentPrices(priceMap)
    } catch (err) {
      setError('Failed to load current prices. Please try again.')
    } finally {
      setIsLoadingPrices(false)
    }
  }

  const handleGeneratePredictions = async () => {
    if (investments.length === 0) return

    setIsLoadingPredictions(true)
    setError(null)

    try {
      if (currentPrices.size === 0) {
        await loadCurrentPrices()
      }

      const timeframe = getTimeframe()
      const newPredictions = new Map<string, PricePrediction>()

      for (const investment of investments) {
        const price = currentPrices.get(investment.id) || investment.currentPrice || investment.purchasePrice
        const response = await fetch('/api/price-prediction', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            symbol: investment.symbol,
            currentPrice: price,
            timeframe
          })
        })

        if (!response.ok) {
          throw new Error('Prediction request failed')
        }

        const prediction = await response.json()
        newPredictions.set(investment.id, prediction)
      }

      setPredictions(newPredictions)
    } catch (err) {
      setError('Failed to generate predictions. Please try again.')
      console.error('Prediction error:', err)
    } finally {
      setIsLoadingPredictions(false)
    }
  }

  useEffect(() => {
    if (investments.length > 0) {
      loadCurrentPrices()
    }
  }, [investments])

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/30 dark:to-indigo-950/30 border-2 border-purple-200 dark:border-purple-800 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          <h3 className="font-semibold text-purple-900 dark:text-purple-100">
            🔮 Future Price Prediction
          </h3>
        </div>
        <p className="text-xs text-purple-800 dark:text-purple-200">
          AI-powered predictions based on historical patterns and recent news analysis
        </p>
      </div>

      {/* Disclaimer */}
      <div className="bg-red-50 dark:bg-red-950/30 border-2 border-red-500 rounded-lg p-3">
        <div className="flex items-center gap-2 text-red-900 dark:text-red-100 font-bold text-sm mb-1">
          <AlertTriangle className="h-5 w-5" />
          <span>⚠️ NOT FINANCIAL ADVICE</span>
        </div>
        <p className="text-xs text-red-800 dark:text-red-200">
          This is a fun educational tool for learning about market analysis. Predictions are based on AI analysis of news and historical patterns. <strong>DO NOT</strong> use these predictions for actual investment decisions!
        </p>
      </div>

      {/* Future Date Info */}
      <div className="bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 rounded-lg p-3">
        <div className="flex items-center gap-2 text-indigo-900 dark:text-indigo-100">
          <Calendar className="h-4 w-4" />
          <span className="text-sm font-semibold">
            Predicting for: {format(futureDate, 'MMMM d, yyyy')}
          </span>
        </div>
        <p className="text-xs text-indigo-700 dark:text-indigo-300 mt-1">
          {daysInFuture} days from today ({getTimeframe()} prediction window)
        </p>
      </div>

      {/* Portfolio Summary */}
      <div className="space-y-3 p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg">
        {investments.length === 0 ? (
          <div className="text-center text-sm text-gray-600 dark:text-gray-300">
            Add investments in the Invest tab to generate future predictions.
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                Portfolio Symbols
              </p>
              <span className="text-xs text-gray-500">
                {investments.length} holdings
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {investments.map((investment) => (
                <span
                  key={investment.id}
                  className="text-xs font-semibold bg-stocrates-blue/20 text-stocrates-dark border border-stocrates-dark/30 px-2 py-1 rounded-full"
                >
                  {investment.symbol}
                </span>
              ))}
            </div>

            {isLoadingPrices ? (
              <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading current prices...
              </div>
            ) : (
              <div className="text-xs text-gray-600 dark:text-gray-300">
                Current prices loaded for prediction inputs.
              </div>
            )}

            {error && (
              <div className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 p-2 rounded">
                {error}
              </div>
            )}

            <div className="flex gap-2">
              <Button
                onClick={loadCurrentPrices}
                disabled={isLoadingPrices || isLoadingPredictions}
                className="flex-1 bg-stocrates-dark hover:bg-stocrates-dark-blue text-stocrates-cream"
              >
                {isLoadingPrices ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Refreshing Prices...
                  </>
                ) : (
                  <>Refresh Prices</>
                )}
              </Button>
              <Button
                onClick={handleGeneratePredictions}
                disabled={isLoadingPredictions || isLoadingPrices}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
              >
                {isLoadingPredictions ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Predictions
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Prediction Result */}
      {predictions.size > 0 && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {investments.map((investment) => {
            const prediction = predictions.get(investment.id)
            if (!prediction) return null

            return (
              <div key={investment.id} className="space-y-3">
                <div className={`border-2 rounded-lg p-4 ${
                  prediction.predictedChange >= 0
                    ? 'bg-green-50 dark:bg-green-950/30 border-green-500'
                    : 'bg-red-50 dark:bg-red-950/30 border-red-500'
                }`}>
                  <div className="flex items-center gap-2 mb-3">
                    {prediction.predictedChange >= 0 ? (
                      <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
                    ) : (
                      <TrendingDown className="h-6 w-6 text-red-600 dark:text-red-400" />
                    )}
                    <h4 className="font-bold text-lg">
                      {prediction.symbol} Prediction
                    </h4>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Current Price</p>
                      <p className="text-2xl font-bold">${prediction.currentPrice.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Predicted Price</p>
                      <p className={`text-2xl font-bold ${
                        prediction.predictedChange >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        ${prediction.predictedPrice.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <div className={`p-3 rounded-lg ${
                    prediction.predictedChange >= 0
                      ? 'bg-green-100 dark:bg-green-900/30'
                      : 'bg-red-100 dark:bg-red-900/30'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold">Expected Change</span>
                      <span className={`text-xl font-bold ${
                        prediction.predictedChange >= 0 ? 'text-green-700' : 'text-red-700'
                      }`}>
                        {prediction.predictedChange >= 0 ? '+' : ''}
                        {prediction.predictedChange.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="border rounded-lg p-4 bg-white dark:bg-gray-900">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-sm font-semibold">Confidence Level</span>
                  </div>
                  <div className="relative h-6 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        prediction.confidence >= 70
                          ? 'bg-green-500'
                          : prediction.confidence >= 40
                          ? 'bg-yellow-500'
                          : 'bg-red-500'
                      }`}
                      style={{ width: `${prediction.confidence}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 text-right">
                    {prediction.confidence}% confidence
                  </p>
                </div>

                <div className="border rounded-lg p-4 bg-white dark:bg-gray-900">
                  <div className="flex items-center gap-2 mb-2">
                    <Brain className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    <span className="text-sm font-semibold">AI Analysis</span>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {prediction.reasoning}
                  </p>
                </div>

                <div className="border rounded-lg p-4 bg-white dark:bg-gray-900">
                  <div className="flex items-center gap-2 mb-3">
                    <Newspaper className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                    <span className="text-sm font-semibold">Key Factors</span>
                  </div>
                  <ul className="space-y-2">
                    {prediction.newsFactors.map((factor, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <span className="text-orange-600 dark:text-orange-400 mt-0.5">•</span>
                        <span className="text-gray-700 dark:text-gray-300">{factor}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )
          })}

          <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
            <p className="text-xs text-blue-800 dark:text-blue-200">
              <strong>💡 Learning Tip:</strong> Predictions combine historical pattern analysis with recent news sentiment. Real investors use similar methods but also consider company fundamentals, market conditions, and economic indicators.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
