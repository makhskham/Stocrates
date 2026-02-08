'use client'

import React from 'react'
import Image from 'next/image'
import { useGame } from '@/lib/game/game-context'
import { cn } from '@/lib/utils'
import { StocratesButton } from '@/components/ui/stocrates-button'
import { X } from 'lucide-react'
import { TimeMachine } from './time-machine'
import { InvestmentPanel } from './investment-panel'
import { PortfolioView } from './portfolio-view'
import { FuturePredictionView } from './future-prediction-view'
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
          'fixed left-0 top-0 h-full w-full bg-stocrates-cream shadow-2xl z-50 transition-transform duration-300 ease-in-out overflow-y-auto',
          isGameOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="sticky top-0 bg-stocrates-blue border-b-3 border-stocrates-dark p-6 flex items-center justify-between z-10 shadow-lg">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full overflow-hidden border-3 border-stocrates-dark shadow-xl bg-white flex items-center justify-center">
              <Image
                src="/gamelogo.jpg"
                alt="Investment Game Logo"
                width={56}
                height={56}
                className="object-cover w-full h-full"
                priority
              />
            </div>
            <div>
              <h2 className="font-title text-3xl font-bold text-stocrates-dark">Investment Game</h2>
              <p className="font-body text-sm text-stocrates-dark-blue">Learn by practicing!</p>
            </div>
          </div>
          <button
            onClick={closeGame}
            className="w-12 h-12 rounded-full bg-stocrates-dark text-stocrates-cream hover:bg-stocrates-dark-blue transition-all hover:scale-110 active:scale-95 flex items-center justify-center border-2 border-stocrates-dark"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Stocrates Points Display - Game-y Design with Decorative Outline */}
        <div className="p-6">
          <div className="relative border-[3px] border-[#22271e] bg-white p-8 shadow-lg rounded-lg">
            {/* Decorative corner circles */}
            <div className="absolute w-4 h-4 rounded-full border-[3px] border-[#22271e] bg-stocrates-blue -top-2 -left-2 shadow-md z-10" />
            <div className="absolute w-4 h-4 rounded-full border-[3px] border-[#22271e] bg-stocrates-blue -top-2 -right-2 shadow-md z-10" />
            <div className="absolute w-4 h-4 rounded-full border-[3px] border-[#22271e] bg-stocrates-blue -bottom-2 -left-2 shadow-md z-10" />
            <div className="absolute w-4 h-4 rounded-full border-[3px] border-[#22271e] bg-stocrates-blue -bottom-2 -right-2 shadow-md z-10" />
            {/* Mid-point circles */}
            <div className="absolute w-3 h-3 rounded-full border-2 border-[#22271e] bg-stocrates-cream -top-1.5 left-1/2 -translate-x-1/2 z-10" />
            <div className="absolute w-3 h-3 rounded-full border-2 border-[#22271e] bg-stocrates-cream -bottom-1.5 left-1/2 -translate-x-1/2 z-10" />
            <div className="absolute w-3 h-3 rounded-full border-2 border-[#22271e] bg-stocrates-cream -left-1.5 top-1/2 -translate-y-1/2 z-10" />
            <div className="absolute w-3 h-3 rounded-full border-2 border-[#22271e] bg-stocrates-cream -right-1.5 top-1/2 -translate-y-1/2 z-10" />

            <div className="flex items-center justify-between">
              <div>
                <p className="font-game text-xs text-stocrates-dark-blue uppercase tracking-widest">Available Points</p>
                <p className="font-game text-5xl font-bold text-stocrates-dark mt-2">
                  {gameState.stockratesPoints.toLocaleString()}
                </p>
              </div>
              <div className="text-6xl">💰</div>
            </div>
            <div className="mt-6 h-4 bg-stocrates-gray border-3 border-stocrates-dark rounded-full overflow-hidden shadow-inner">
              <div
                className="h-full bg-stocrates-dark-blue transition-all duration-500 ease-out"
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

          {/* Tabs for Investment and Portfolio (or Future Predictions if future date) */}
          {gameState.selectedDate > new Date() ? (
            // Future Date: Show Predictions
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg p-4 text-center">
                <h3 className="font-title text-xl font-bold mb-1">🔮 Future Prediction Mode</h3>
                <p className="text-sm opacity-90">
                  Generate AI-powered price predictions based on historical patterns and news
                </p>
              </div>
              <FuturePredictionView />
            </div>
          ) : (
            // Current or Past Date: Show Normal Tabs
            <Tabs defaultValue="invest" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-white p-1 border-3 border-stocrates-dark shadow-lg">
                <TabsTrigger
                  value="invest"
                  className="font-title text-sm data-[state=active]:bg-stocrates-dark data-[state=active]:text-stocrates-cream"
                >
                  📈 Invest
                </TabsTrigger>
                <TabsTrigger
                  value="portfolio"
                  className="font-title text-sm data-[state=active]:bg-stocrates-dark data-[state=active]:text-stocrates-cream"
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
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-stocrates-blue border-t-3 border-stocrates-dark p-4 shadow-lg">
          <div className="bg-white/80 rounded-lg p-4">
            <p className="font-body text-xs text-stocrates-dark">
              <strong className="font-title">📚 Educational Game:</strong> This is a learning tool using fake money.
              Practice investing strategies risk-free!
            </p>
          </div>
        </div>
        </div>
      </div>
    </>
  )
}

