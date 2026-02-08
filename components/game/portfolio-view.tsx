'use client'

import React, { useState, useEffect } from 'react'
import { useGame } from '@/lib/game/game-context'
import { Button } from '@/components/ui/button'
import { Trash2, TrendingUp, TrendingDown, Briefcase, Lightbulb, AlertTriangle, Shield, Clock, Sparkles, Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import { trackPortfolio, getPortfolioSummary, formatCurrency, formatPercentage, type PortfolioPerformance } from '@/lib/stocks/portfolio-tracker'
import { generatePricePrediction, type PricePrediction } from '@/lib/stocks/price-predictor'

export function PortfolioView() {
  const { gameState, removeInvestment } = useGame()
  const { portfolio } = gameState
  const [performances, setPerformances] = useState<PortfolioPerformance[]>([])
  const [predictions, setPredictions] = useState<Map<string, PricePrediction>>(new Map())
  const [isLoadingPerformance, setIsLoadingPerformance] = useState(false)
  const [isLoadingPredictions, setIsLoadingPredictions] = useState(false)

  // Track portfolio performance over time
  useEffect(() => {
    const updatePortfolio = async () => {
      if (portfolio.investments.length === 0) return

      setIsLoadingPerformance(true)
      try {
        const tracked = await trackPortfolio(portfolio.investments, gameState.selectedDate)
        setPerformances(tracked)
      } catch (error) {
        console.error('Error tracking portfolio:', error)
      } finally {
        setIsLoadingPerformance(false)
      }
    }
    updatePortfolio()
  }, [portfolio.investments, gameState.selectedDate])

  // Generate predictions for current investments
  useEffect(() => {
    const generatePredictions = async () => {
      if (portfolio.investments.length === 0) return

      setIsLoadingPredictions(true)
      try {
        const newPredictions = new Map<string, PricePrediction>()
        for (const inv of portfolio.investments) {
          const prediction = await generatePricePrediction(
            inv.symbol,
            inv.currentPrice || inv.purchasePrice,
            '1week'
          )
          newPredictions.set(inv.id, prediction)
        }
        setPredictions(newPredictions)
      } catch (error) {
        console.error('Error generating predictions:', error)
      } finally {
        setIsLoadingPredictions(false)
      }
    }
    generatePredictions()
  }, [portfolio.investments])

  if (portfolio.investments.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📊</div>
        <h3 className="text-lg font-semibold mb-2">No Investments Yet</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Start investing to build your portfolio and track your learning progress!
        </p>
        <div className="text-xs text-muted-foreground bg-muted/50 rounded p-3 max-w-sm mx-auto">
          💡 Switch to the <strong>Invest</strong> tab to make your first investment
        </div>
      </div>
    )
  }

  const summary = getPortfolioSummary(performances)
  const today = new Date()
  const isPastDate = gameState.selectedDate < today

  return (
    <div className="space-y-4">
      {/* Prediction Disclaimer */}
      <div className="bg-red-50 dark:bg-red-950/30 border-2 border-red-500 rounded-lg p-3">
        <div className="flex items-center gap-2 text-red-900 dark:text-red-100 font-bold text-sm mb-1">
          <AlertTriangle className="h-5 w-5" />
          <span>⚠️ NOT FINANCIAL ADVICE</span>
        </div>
        <p className="text-xs text-red-800 dark:text-red-200">
          Predictions are for educational and entertainment purposes only. This is a fun learning game based on news analysis and AI predictions. Do NOT use these predictions for actual investment decisions.
        </p>
      </div>

      {/* Portfolio Summary */}
      <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/30 dark:to-blue-950/30 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <Briefcase className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          <h3 className="font-semibold text-purple-900 dark:text-purple-100">Portfolio Summary</h3>
        </div>
        {isLoadingPerformance ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-muted-foreground text-xs">Total Invested</p>
              <p className="font-semibold text-lg">{formatCurrency(summary.totalInvested)}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Current Value</p>
              <p className="font-semibold text-lg">{formatCurrency(summary.totalCurrentValue)}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Profit/Loss</p>
              <p className={`font-semibold text-lg ${summary.totalProfitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(summary.totalProfitLoss)} ({formatPercentage(summary.totalProfitLossPercentage)})
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Win Rate</p>
              <p className="font-semibold text-lg">
                {summary.winners}/{summary.investmentCount}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Investment List */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-muted-foreground">Your Investments</h4>
        {portfolio.investments.map((investment, index) => {
          const performance = performances[index]
          const prediction = predictions.get(investment.id)
          const purchaseDate = new Date(investment.purchaseDate)
          const isPastInvestment = purchaseDate < today

          const profitLoss = performance?.profitLoss || 0
          const profitLossPercentage = performance?.profitLossPercentage || 0
          const isProfit = profitLoss >= 0

          return (
            <div
              key={investment.id}
              className="border rounded-lg p-4 bg-card hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-semibold text-lg">{investment.symbol}</h4>
                  <p className="text-xs text-muted-foreground">{investment.companyName}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeInvestment(investment.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                <div>
                  <p className="text-xs text-muted-foreground">Shares</p>
                  <p className="font-medium">{investment.shares.toFixed(4)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Invested</p>
                  <p className="font-medium">{investment.amount.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Purchase Price</p>
                  <p className="font-medium">${investment.purchasePrice.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Current Price</p>
                  <p className="font-medium">${investment.currentPrice?.toFixed(2) || 'N/A'}</p>
                </div>
              </div>

              <div className="text-xs text-muted-foreground mb-2">
                📅 Purchased: {format(purchaseDate, 'MMM d, yyyy')}
                {performance && performance.daysHeld > 0 && (
                  <span className="ml-2">• Held for {performance.daysHeld} days</span>
                )}
              </div>

              {/* Historical Performance (for past investments) */}
              {isPastInvestment && performance && (
                <div className="mb-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-xs font-semibold text-blue-900 dark:text-blue-100">
                      Historical Performance
                    </span>
                  </div>
                  <div className={`flex items-center gap-2 p-2 rounded ${
                    isProfit
                      ? 'bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400'
                      : 'bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400'
                  }`}>
                    {isProfit ? (
                      <TrendingUp className="h-4 w-4" />
                    ) : (
                      <TrendingDown className="h-4 w-4" />
                    )}
                    <div className="flex-1 text-sm font-semibold">
                      {formatCurrency(profitLoss)} ({formatPercentage(profitLossPercentage)})
                    </div>
                  </div>
                  {performance.annualizedReturn !== 0 && (
                    <div className="mt-2 text-xs text-blue-800 dark:text-blue-200">
                      📊 Annualized Return: {formatPercentage(performance.annualizedReturn)}
                    </div>
                  )}
                </div>
              )}

              {/* Future Prediction (for current investments) */}
              {!isPastInvestment && prediction && !isLoadingPredictions && (
                <div className="mb-3 bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    <span className="text-xs font-semibold text-purple-900 dark:text-purple-100">
                      1-Week Prediction (Fun Game!)
                    </span>
                  </div>

                  {/* Confidence Level */}
                  <div className="mb-2">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-purple-800 dark:text-purple-200">Confidence Level</span>
                      <span className={`font-bold ${
                        prediction.confidence >= 70 ? 'text-green-600' :
                        prediction.confidence >= 40 ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {prediction.confidence}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          prediction.confidence >= 70 ? 'bg-green-500' :
                          prediction.confidence >= 40 ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`}
                        style={{ width: `${prediction.confidence}%` }}
                      />
                    </div>
                  </div>

                  {/* Predicted Price */}
                  <div className={`flex items-center gap-2 p-2 rounded ${
                    prediction.predictedChange >= 0
                      ? 'bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400'
                      : 'bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400'
                  }`}>
                    {prediction.predictedChange >= 0 ? (
                      <TrendingUp className="h-4 w-4" />
                    ) : (
                      <TrendingDown className="h-4 w-4" />
                    )}
                    <div className="flex-1 text-sm">
                      <div className="font-semibold">
                        {formatCurrency(prediction.predictedPrice)} ({formatPercentage(prediction.predictedChange)})
                      </div>
                    </div>
                  </div>

                  {/* Reasoning */}
                  <div className="mt-2 text-xs text-purple-800 dark:text-purple-200">
                    <strong>💭 Reasoning:</strong> {prediction.reasoning}
                  </div>

                  {/* News Factors */}
                  <div className="mt-2 text-xs text-purple-800 dark:text-purple-200">
                    <strong>📰 Key Factors:</strong>
                    <ul className="ml-3 mt-1 space-y-0.5">
                      {prediction.newsFactors.map((factor, idx) => (
                        <li key={idx}>• {factor}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {isLoadingPredictions && !isPastInvestment && (
                <div className="mb-3 flex items-center justify-center py-4 bg-purple-50 dark:bg-purple-950/30 rounded-lg">
                  <Loader2 className="h-5 w-5 animate-spin text-purple-600" />
                  <span className="ml-2 text-sm text-purple-600">Generating prediction...</span>
                </div>
              )}

              {/* Educational Feedback */}
              {investment.feedback && (
                <div className="mt-3 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-stocrates-dark">
                    <Lightbulb className="h-4 w-4" />
                    <span>Educational Insights</span>
                  </div>

                  {/* Risk Level Badge */}
                  <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${
                    investment.feedback.riskLevel === 'high'
                      ? 'bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-400'
                      : investment.feedback.riskLevel === 'medium'
                      ? 'bg-yellow-100 dark:bg-yellow-950/30 text-yellow-700 dark:text-yellow-400'
                      : 'bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-400'
                  }`}>
                    {investment.feedback.riskLevel === 'high' ? (
                      <AlertTriangle className="h-3 w-3" />
                    ) : (
                      <Shield className="h-3 w-3" />
                    )}
                    {investment.feedback.riskLevel.toUpperCase()} RISK
                  </div>

                  {/* Reasoning */}
                  <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded p-2 text-xs">
                    <p className="text-blue-900 dark:text-blue-100">
                      <strong>💭 Your Decision:</strong> {investment.feedback.reasoning}
                    </p>
                  </div>

                  {/* Historical Context */}
                  <div className="bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 rounded p-2 text-xs">
                    <p className="text-purple-900 dark:text-purple-100">
                      <strong>📚 Historical Context:</strong> {investment.feedback.historicalContext}
                    </p>
                  </div>

                  {/* Learning Points */}
                  <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded p-2 text-xs space-y-1">
                    <p className="font-semibold text-amber-900 dark:text-amber-100">🎓 Key Learning Points:</p>
                    {investment.feedback.learningPoints.map((point, idx) => (
                      <p key={idx} className="text-amber-900 dark:text-amber-100 pl-2">
                        • {point}
                      </p>
                    ))}
                  </div>

                  {/* Market Condition */}
                  <div className="text-xs text-muted-foreground italic">
                    📊 {investment.feedback.marketCondition}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Educational Note */}
      <div className="text-xs text-muted-foreground bg-muted/50 rounded p-3">
        <strong>📚 Learning Tip:</strong> Watch how your investments perform over time. 
        Notice patterns in how different events affect stock prices. This is how you learn!
      </div>
    </div>
  )
}

