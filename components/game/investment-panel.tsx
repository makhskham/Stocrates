'use client'

import React, { useState } from 'react'
import { useGame } from '@/lib/game/game-context'
import { AVAILABLE_STOCKS } from '@/lib/game/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { TrendingUp, AlertCircle } from 'lucide-react'

export function InvestmentPanel() {
  const { gameState, addInvestment } = useGame()
  const [selectedStock, setSelectedStock] = useState<string>('')
  const [amount, setAmount] = useState<string>('')
  const [error, setError] = useState<string>('')

  // Validate amount as user types
  const handleAmountChange = (value: string) => {
    setAmount(value)
    const investAmount = parseFloat(value)
    
    if (value && !isNaN(investAmount) && investAmount > gameState.stockratesPoints) {
      setError(`Insufficient points. You have ${gameState.stockratesPoints.toLocaleString()} points available.`)
    } else {
      setError('')
    }
  }

  // Mock price - in real implementation, fetch from API based on selectedDate
  const getCurrentPrice = (symbol: string): number => {
    const mockPrices: Record<string, number> = {
      AAPL: 178.50,
      TSLA: 242.80,
      NVDA: 495.20,
      MSFT: 378.90,
      GOOGL: 140.30,
      AMZN: 151.20,
      META: 312.40,
      NFLX: 445.60
    }
    return mockPrices[symbol] || 100
  }

  const handleInvest = () => {
    setError('')

    if (!selectedStock) {
      setError('Please select a stock')
      return
    }

    const investAmount = parseFloat(amount)
    if (isNaN(investAmount) || investAmount <= 0) {
      setError('Please enter a valid amount')
      return
    }

    if (investAmount > gameState.stockratesPoints) {
      setError(`Insufficient points. You have ${gameState.stockratesPoints} points available.`)
      return
    }

    const price = getCurrentPrice(selectedStock)
    const shares = investAmount / price
    const stockInfo = AVAILABLE_STOCKS.find(s => s.symbol === selectedStock)

    addInvestment({
      symbol: selectedStock,
      companyName: stockInfo?.name || selectedStock,
      amount: investAmount,
      shares: shares,
      purchasePrice: price,
      purchaseDate: gameState.selectedDate,
      currentPrice: price
    })

    // Reset form
    setAmount('')
    setSelectedStock('')
  }

  const selectedStockInfo = AVAILABLE_STOCKS.find(s => s.symbol === selectedStock)
  const currentPrice = selectedStock ? getCurrentPrice(selectedStock) : 0
  const estimatedShares = amount && selectedStock ? parseFloat(amount) / currentPrice : 0

  return (
    <div className="space-y-4">
      <div className="relative bg-white/95 border-3 border-white rounded-lg p-5 shadow-lg backdrop-blur-sm">
        {/* Decorative corners */}
        <div className="absolute w-3 h-3 rounded-full border-2 border-white bg-stocrates-blue -top-1.5 -left-1.5" />
        <div className="absolute w-3 h-3 rounded-full border-2 border-white bg-stocrates-blue -top-1.5 -right-1.5" />
        <div className="absolute w-3 h-3 rounded-full border-2 border-white bg-stocrates-blue -bottom-1.5 -left-1.5" />
        <div className="absolute w-3 h-3 rounded-full border-2 border-white bg-stocrates-blue -bottom-1.5 -right-1.5" />

        <div className="flex items-start gap-3">
          <TrendingUp className="h-6 w-6 text-stocrates-purple mt-0.5" />
          <div className="text-sm">
            <p className="font-title font-bold text-stocrates-dark">Practice Investing</p>
            <p className="font-body text-stocrates-dark-blue text-xs mt-1">
              Select a stock and amount to invest. Your portfolio will track performance over time.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <Label htmlFor="stock-select">Select Stock</Label>
          <Select value={selectedStock} onValueChange={setSelectedStock}>
            <SelectTrigger id="stock-select" className="mt-1">
              <SelectValue placeholder="Choose a stock..." />
            </SelectTrigger>
            <SelectContent>
              {AVAILABLE_STOCKS.map((stock) => (
                <SelectItem key={stock.symbol} value={stock.symbol}>
                  {stock.symbol} - {stock.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedStock && (
          <div className="bg-muted/50 rounded p-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Current Price:</span>
              <span className="font-semibold">${currentPrice.toFixed(2)}</span>
            </div>
          </div>
        )}

        <div>
          <Label htmlFor="amount-input">Investment Amount (Stockrates Points)</Label>
          <Input
            id="amount-input"
            type="number"
            placeholder="Enter amount..."
            value={amount}
            onChange={(e) => handleAmountChange(e.target.value)}
            min="0"
            className="mt-1"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Available: {gameState.stockratesPoints.toLocaleString()} points
          </p>
        </div>

        {estimatedShares > 0 && (
          <div className="bg-green-50 dark:bg-green-950/30 rounded p-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Estimated Shares:</span>
              <span className="font-semibold text-green-700 dark:text-green-400">
                {estimatedShares.toFixed(4)}
              </span>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded p-3 text-sm flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 mt-0.5" />
            <span className="text-red-700 dark:text-red-300">{error}</span>
          </div>
        )}

        <button
          onClick={handleInvest}
          disabled={!selectedStock || !amount || parseFloat(amount) <= 0 || !!error}
          className="w-full font-game text-sm uppercase tracking-wide py-3 px-6 bg-gradient-to-r from-stocrates-purple to-stocrates-pink text-white border-3 border-stocrates-dark rounded-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg"
        >
          🚀 Invest Now
        </button>
      </div>
    </div>
  )
}

