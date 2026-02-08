'use client'

import React from 'react'
import { useGame } from '@/lib/game/game-context'
import { cn } from '@/lib/utils'
import { StocratesButton } from '@/components/ui/stocrates-button'
import { X } from 'lucide-react'
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
          'fixed left-0 top-0 h-full w-full bg-gradient-to-br from-stocrates-game-gradient-start via-stocrates-purple to-stocrates-game-gradient-end shadow-2xl z-50 transition-transform duration-300 ease-in-out overflow-y-auto',
          isGameOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-stocrates-purple/95 to-stocrates-pink/95 backdrop-blur-sm border-b-4 border-white/30 p-6 flex items-center justify-between z-10 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="text-4xl animate-pulse">🎮</div>
            <div>
              <h2 className="font-title text-3xl font-bold text-white drop-shadow-lg">Investment Game</h2>
              <p className="font-body text-sm text-white/90">Learn by practicing!</p>
            </div>
          </div>
          <button
            onClick={closeGame}
            className="w-12 h-12 rounded-full bg-white/20 text-white hover:bg-white/30 transition-all hover:scale-110 active:scale-95 flex items-center justify-center backdrop-blur-sm border-2 border-white/40"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Stocrates Points Display - Game-y Design with Decorative Outline */}
        <div className="p-6">
          <div className="relative border-4 border-white bg-stocrates-cream p-8 shadow-2xl">
            {/* Decorative corner circles - larger and more prominent */}
            <div className="absolute w-5 h-5 rounded-full border-4 border-white bg-stocrates-pink -top-2.5 -left-2.5 shadow-lg" />
            <div className="absolute w-5 h-5 rounded-full border-4 border-white bg-stocrates-pink -top-2.5 -right-2.5 shadow-lg" />
            <div className="absolute w-5 h-5 rounded-full border-4 border-white bg-stocrates-pink -bottom-2.5 -left-2.5 shadow-lg" />
            <div className="absolute w-5 h-5 rounded-full border-4 border-white bg-stocrates-pink -bottom-2.5 -right-2.5 shadow-lg" />

            <div className="flex items-center justify-between">
              <div>
                <p className="font-game text-xs text-stocrates-dark-blue uppercase tracking-widest">Available Points</p>
                <p className="font-game text-5xl font-bold text-stocrates-dark mt-2 drop-shadow-sm">
                  {gameState.stockratesPoints.toLocaleString()}
                </p>
              </div>
              <div className="text-6xl animate-bounce">💰</div>
            </div>
            <div className="mt-6 h-4 bg-stocrates-gray border-3 border-stocrates-dark rounded-full overflow-hidden shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-stocrates-purple to-stocrates-pink transition-all duration-500 ease-out"
                style={{ width: `${Math.min((gameState.stockratesPoints / 10000) * 100, 100)}%` }}
              />
            </div>
            <p className="font-game text-xs text-stocrates-dark mt-3 text-center uppercase tracking-wide">
              {gameState.stockratesPoints} / 10,000 Stocrates Points
            </p>
          </div>
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
            <TabsList className="grid w-full grid-cols-2 bg-white/90 p-1 border-3 border-white shadow-lg">
              <TabsTrigger
                value="invest"
                className="font-title text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-stocrates-purple data-[state=active]:to-stocrates-pink data-[state=active]:text-white data-[state=active]:border-2 data-[state=active]:border-stocrates-dark"
              >
                📈 Invest
              </TabsTrigger>
              <TabsTrigger
                value="portfolio"
                className="font-title text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-stocrates-purple data-[state=active]:to-stocrates-pink data-[state=active]:text-white data-[state=active]:border-2 data-[state=active]:border-stocrates-dark"
              >
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
        <div className="sticky bottom-0 bg-gradient-to-r from-stocrates-purple/95 to-stocrates-pink/95 backdrop-blur-sm border-t-4 border-white/30 p-4 shadow-lg">
          <div className="relative border-3 border-white bg-white/90 rounded-lg p-4">
            {/* Small decorative corners */}
            <div className="absolute w-3 h-3 rounded-full border-3 border-white bg-stocrates-purple -top-1.5 -left-1.5" />
            <div className="absolute w-3 h-3 rounded-full border-3 border-white bg-stocrates-purple -top-1.5 -right-1.5" />
            <div className="absolute w-3 h-3 rounded-full border-3 border-white bg-stocrates-purple -bottom-1.5 -left-1.5" />
            <div className="absolute w-3 h-3 rounded-full border-3 border-white bg-stocrates-purple -bottom-1.5 -right-1.5" />

            <p className="font-body text-xs text-stocrates-dark">
              <strong className="font-title">📚 Educational Game:</strong> This is a learning tool using fake money.
              Practice investing strategies risk-free!
            </p>
          </div>
        </div>
      </div>
    </>
  )
}

