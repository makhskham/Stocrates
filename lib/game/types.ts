/**
 * Game Types for Stocrates Investment Game
 */

export interface Investment {
  id: string
  symbol: string
  companyName: string
  amount: number // Stockrates Points invested
  shares: number
  purchasePrice: number
  purchaseDate: Date
  currentPrice?: number
  currentValue?: number
  profitLoss?: number
  profitLossPercentage?: number
}

export interface Portfolio {
  investments: Investment[]
  totalValue: number
  totalInvested: number
  totalProfitLoss: number
  totalProfitLossPercentage: number
}

export interface GameState {
  stockratesPoints: number // Available points (max 10,000)
  totalPoints: number // Total points ever earned (starts at 10,000)
  portfolio: Portfolio
  selectedDate: Date
  isTimeTraveling: boolean
  gameMode: 'historical' | 'current'
}

export interface HistoricalEvent {
  id: string
  date: Date
  symbol: string
  title: string
  description: string
  eventType: 'partnership' | 'earnings' | 'product_launch' | 'acquisition' | 'regulatory' | 'other'
  sourceCredibility: number // 0-100
  sources: EventSource[]
  marketImpact?: {
    priceChange1Day?: number
    priceChange1Week?: number
    priceChange1Month?: number
    priceChange3Month?: number
  }
}

export interface EventSource {
  name: string
  url: string
  credibilityScore: number // 0-100
  type: 'news' | 'social' | 'financial'
  publishDate: Date
}

export const AVAILABLE_STOCKS = [
  { symbol: 'AAPL', name: 'Apple Inc.' },
  { symbol: 'TSLA', name: 'Tesla, Inc.' },
  { symbol: 'NVDA', name: 'NVIDIA Corporation' },
  { symbol: 'MSFT', name: 'Microsoft Corporation' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.' },
  { symbol: 'AMZN', name: 'Amazon.com, Inc.' },
  { symbol: 'META', name: 'Meta Platforms, Inc.' },
  { symbol: 'NFLX', name: 'Netflix, Inc.' }
] as const

export const MAX_STOCKRATES_POINTS = 10000
export const INITIAL_STOCKRATES_POINTS = 10000

