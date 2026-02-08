'use client'

import React from 'react'
import { useGame } from '@/lib/game/game-context'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import { TimeMachine } from './time-machine'
import { InvestmentPanel } from './investment-panel'
import { PortfolioView } from './portfolio-view'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export function GameSidebar() {
  const { isGameOpen, closeGame, gameState, setSelectedDate } = useGame()

  return (
    <>
      {/* Overlay */}
      <div
        className={cn(
          'fixed inset-0 bg-black/50 z-40 transition-opacity duration-300',
          isGameOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={closeGame}
      />

      {/* Sidebar */}
      <div
        className={cn(
          'fixed left-0 top-0 h-full w-[480px] bg-background border-r shadow-2xl z-50 transition-transform duration-300 ease-in-out overflow-y-auto',
          isGameOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Header */}
        <div className="sticky top-0 bg-background border-b p-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <div className="text-2xl">🎮</div>
            <div>
              <h2 className="text-xl font-bold">Investment Game</h2>
              <p className="text-xs text-muted-foreground">Learn by practicing!</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={closeGame}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Stockrates Points Display */}
        <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-b">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Available Points</p>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                {gameState.stockratesPoints.toLocaleString()}
              </p>
            </div>
            <div className="text-5xl">💰</div>
          </div>
          <div className="mt-2 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-300"
              style={{ width: `${(gameState.stockratesPoints / 10000) * 100}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {gameState.stockratesPoints} / 10,000 Stockrates Points
          </p>
        </div>

        {/* Main Content */}
        <div className="p-4 space-y-4">
          {/* Time Machine */}
          <TimeMachine
            selectedDate={gameState.selectedDate}
            onDateChange={setSelectedDate}
          />

          {/* Tabs for Investment and Portfolio */}
          <Tabs defaultValue="invest" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="invest">📈 Invest</TabsTrigger>
              <TabsTrigger value="portfolio">
                💼 Portfolio ({gameState.portfolio.investments.length})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="invest" className="mt-4">
              <InvestmentPanel />
            </TabsContent>
            
            <TabsContent value="portfolio" className="mt-4">
              <PortfolioView />
            </TabsContent>
          </Tabs>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-background border-t p-4">
          <div className="text-xs text-muted-foreground bg-muted/50 rounded p-3">
            <strong>📚 Educational Game:</strong> This is a learning tool using fake money. 
            Practice investing strategies risk-free!
          </div>
        </div>
      </div>
    </>
  )
}

