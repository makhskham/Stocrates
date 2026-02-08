'use client'

import React, { createContext, useContext, useState, useCallback } from 'react'
import { GameState, Investment, INITIAL_STOCKRATES_POINTS } from './types'

interface GameContextType {
  gameState: GameState
  isGameOpen: boolean
  toggleGame: () => void
  openGame: () => void
  closeGame: () => void
  addInvestment: (investment: Omit<Investment, 'id'>) => void
  removeInvestment: (id: string) => void
  setSelectedDate: (date: Date) => void
  setGameMode: (mode: 'historical' | 'current') => void
  resetGame: () => void
}

const GameContext = createContext<GameContextType | undefined>(undefined)

const initialGameState: GameState = {
  stockratesPoints: INITIAL_STOCKRATES_POINTS,
  totalPoints: INITIAL_STOCKRATES_POINTS,
  portfolio: {
    investments: [],
    totalValue: 0,
    totalInvested: 0,
    totalProfitLoss: 0,
    totalProfitLossPercentage: 0
  },
  selectedDate: new Date(),
  isTimeTraveling: false,
  gameMode: 'current'
}

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [gameState, setGameState] = useState<GameState>(initialGameState)
  const [isGameOpen, setIsGameOpen] = useState(false)

  const toggleGame = useCallback(() => {
    setIsGameOpen(prev => !prev)
  }, [])

  const openGame = useCallback(() => {
    setIsGameOpen(true)
  }, [])

  const closeGame = useCallback(() => {
    setIsGameOpen(false)
  }, [])

  const addInvestment = useCallback((investment: Omit<Investment, 'id'>) => {
    setGameState(prev => {
      const newInvestment: Investment = {
        ...investment,
        id: `inv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      }

      const newStockratesPoints = prev.stockratesPoints - investment.amount
      const newTotalInvested = prev.portfolio.totalInvested + investment.amount

      return {
        ...prev,
        stockratesPoints: newStockratesPoints,
        portfolio: {
          ...prev.portfolio,
          investments: [...prev.portfolio.investments, newInvestment],
          totalInvested: newTotalInvested
        }
      }
    })
  }, [])

  const removeInvestment = useCallback((id: string) => {
    setGameState(prev => {
      const investment = prev.portfolio.investments.find(inv => inv.id === id)
      if (!investment) return prev

      const refundAmount = investment.amount

      return {
        ...prev,
        stockratesPoints: prev.stockratesPoints + refundAmount,
        portfolio: {
          ...prev.portfolio,
          investments: prev.portfolio.investments.filter(inv => inv.id !== id),
          totalInvested: prev.portfolio.totalInvested - investment.amount
        }
      }
    })
  }, [])

  const setSelectedDate = useCallback((date: Date) => {
    setGameState(prev => ({
      ...prev,
      selectedDate: date,
      isTimeTraveling: date < new Date()
    }))
  }, [])

  const setGameMode = useCallback((mode: 'historical' | 'current') => {
    setGameState(prev => ({
      ...prev,
      gameMode: mode
    }))
  }, [])

  const resetGame = useCallback(() => {
    setGameState(initialGameState)
  }, [])

  return (
    <GameContext.Provider
      value={{
        gameState,
        isGameOpen,
        toggleGame,
        openGame,
        closeGame,
        addInvestment,
        removeInvestment,
        setSelectedDate,
        setGameMode,
        resetGame
      }}
    >
      {children}
    </GameContext.Provider>
  )
}

export function useGame() {
  const context = useContext(GameContext)
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider')
  }
  return context
}

