'use client'

import React from 'react'
import { useGame } from '@/lib/game/game-context'
import { Button } from '@/components/ui/button'
import { Trash2, TrendingUp, TrendingDown, Briefcase } from 'lucide-react'
import { format } from 'date-fns'

export function PortfolioView() {
  const { gameState, removeInvestment } = useGame()
  const { portfolio } = gameState

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

  return (
    <div className="space-y-4">
      {/* Portfolio Summary */}
      <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/30 dark:to-blue-950/30 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <Briefcase className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          <h3 className="font-semibold text-purple-900 dark:text-purple-100">Portfolio Summary</h3>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-muted-foreground text-xs">Total Invested</p>
            <p className="font-semibold text-lg">{portfolio.totalInvested.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Investments</p>
            <p className="font-semibold text-lg">{portfolio.investments.length}</p>
          </div>
        </div>
      </div>

      {/* Investment List */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-muted-foreground">Your Investments</h4>
        {portfolio.investments.map((investment) => {
          const profitLoss = investment.currentPrice 
            ? (investment.currentPrice - investment.purchasePrice) * investment.shares
            : 0
          const profitLossPercentage = investment.currentPrice
            ? ((investment.currentPrice - investment.purchasePrice) / investment.purchasePrice) * 100
            : 0
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
                📅 Purchased: {format(new Date(investment.purchaseDate), 'MMM d, yyyy')}
              </div>

              {investment.currentPrice && (
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
                    {isProfit ? '+' : ''}{profitLoss.toFixed(2)} points
                    ({isProfit ? '+' : ''}{profitLossPercentage.toFixed(2)}%)
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

