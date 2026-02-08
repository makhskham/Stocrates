'use client'

import React, { useState, useMemo, useEffect } from 'react'
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
import { TrendingUp, AlertCircle, Lightbulb, Clock } from 'lucide-react'
import { generateInvestmentFeedback } from '@/lib/game/investment-feedback'

export function InvestmentPanel() {
  const { gameState, addInvestment } = useGame()
  const [selectedStock, setSelectedStock] = useState<string>('')
  const [amount, setAmount] = useState<string>('')
  const [error, setError] = useState<string>('')
  const [currentPrice, setCurrentPrice] = useState<number>(0)
  const [loadingPrice, setLoadingPrice] = useState<boolean>(false)
  const [priceSource, setPriceSource] = useState<'historical' | 'mock'>('mock')

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

  // Fetch price based on whether we're time traveling
  useEffect(() => {
    if (!selectedStock) {
      setCurrentPrice(0)
      return
    }

    const fetchPrice = async () => {
      setLoadingPrice(true)

      // Check if we're time traveling (date is in the past)
      const isTimeTraveling = gameState.isTimeTraveling && gameState.selectedDate < new Date()

      if (isTimeTraveling) {
        try {
          // Fetch historical price from API
          const dateStr = gameState.selectedDate.toISOString().split('T')[0]
          const response = await fetch(`/api/historical-price?symbol=${selectedStock}&date=${dateStr}`)
          const data = await response.json()

          if (response.ok && data.price) {
            setCurrentPrice(data.price)
            setPriceSource('historical')
            console.log(`📅 Using historical price for ${selectedStock} on ${dateStr}: $${data.price}`)
          } else {
            // Fallback to mock price
            setCurrentPrice(getMockPrice(selectedStock))
            setPriceSource('mock')
            console.warn(`⚠️ No historical data, using mock price for ${selectedStock}`)
          }
        } catch (error) {
          console.error('Error fetching historical price:', error)
          setCurrentPrice(getMockPrice(selectedStock))
          setPriceSource('mock')
        }
      } else {
        // Use mock prices for current/future dates
        setCurrentPrice(getMockPrice(selectedStock))
        setPriceSource('mock')
      }

      setLoadingPrice(false)
    }

    fetchPrice()
  }, [selectedStock, gameState.selectedDate, gameState.isTimeTraveling])

  // Mock price data (fallback)
  const getMockPrice = (symbol: string): number => {
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

    if (currentPrice <= 0) {
      setError('Price data not available. Please try again.')
      return
    }

    const shares = investAmount / currentPrice
    const stockInfo = AVAILABLE_STOCKS.find(s => s.symbol === selectedStock)

    addInvestment({
      symbol: selectedStock,
      companyName: stockInfo?.name || selectedStock,
      amount: investAmount,
      shares: shares,
      purchasePrice: currentPrice,
      purchaseDate: gameState.selectedDate,
      currentPrice: currentPrice
    })

    // Reset form
    setAmount('')
    setSelectedStock('')
  }

  const selectedStockInfo = AVAILABLE_STOCKS.find(s => s.symbol === selectedStock)
  const estimatedShares = amount && selectedStock && currentPrice > 0 ? parseFloat(amount) / currentPrice : 0

  // Generate preview feedback
  const previewFeedback = useMemo(() => {
    if (!selectedStock || !amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      return null
    }

    const investAmount = parseFloat(amount)
    if (investAmount > gameState.stockratesPoints) {
      return null
    }

    return generateInvestmentFeedback({
      symbol: selectedStock,
      companyName: selectedStockInfo?.name || selectedStock,
      amount: investAmount,
      purchasePrice: currentPrice,
      availablePoints: gameState.stockratesPoints,
      portfolioSize: gameState.portfolio.investments.length
    })
  }, [selectedStock, amount, gameState.stockratesPoints, gameState.portfolio.investments.length, selectedStockInfo, currentPrice])

  return (
    <div className="space-y-4">
      <div className="bg-stocrates-blue/30 rounded-lg p-5">
        <div className="flex items-start gap-3">
          <TrendingUp className="h-6 w-6 text-stocrates-dark-blue mt-0.5" />
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
          <div className="bg-muted/50 rounded p-3 text-sm space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Current Price:</span>
              <div className="flex items-center gap-2">
                {loadingPrice ? (
                  <span className="text-xs text-muted-foreground">Loading...</span>
                ) : (
                  <>
                    <span className="font-semibold">${currentPrice.toFixed(2)}</span>
                    {priceSource === 'historical' && (
                      <Clock className="h-3 w-3 text-blue-600" title="Historical Price" />
                    )}
                  </>
                )}
              </div>
            </div>
            {priceSource === 'historical' && !loadingPrice && (
              <div className="text-xs text-blue-600 flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>Using real historical price data</span>
              </div>
            )}
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

        {/* Preview Feedback */}
        {previewFeedback && (
          <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3 space-y-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-blue-900 dark:text-blue-100">
              <Lightbulb className="h-4 w-4" />
              <span>Investment Preview</span>
            </div>

            <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${
              previewFeedback.riskLevel === 'high'
                ? 'bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-400'
                : previewFeedback.riskLevel === 'medium'
                ? 'bg-yellow-100 dark:bg-yellow-950/30 text-yellow-700 dark:text-yellow-400'
                : 'bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-400'
            }`}>
              {previewFeedback.riskLevel.toUpperCase()} RISK
            </div>

            <p className="text-xs text-blue-900 dark:text-blue-100">
              {previewFeedback.reasoning}
            </p>

            <div className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
              {previewFeedback.learningPoints.slice(0, 2).map((point, idx) => (
                <p key={idx}>• {point}</p>
              ))}
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
          className="w-full font-game text-sm uppercase tracking-wide py-3 px-6 bg-stocrates-dark text-stocrates-cream border-3 border-stocrates-dark rounded-lg hover:bg-stocrates-dark-blue hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg"
        >
          🚀 Invest Now
        </button>
      </div>
    </div>
  )
}

