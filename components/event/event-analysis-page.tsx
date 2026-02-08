'use client'

import { useState } from 'react'
import { EventInput } from '@/components/event/event-input'
import { ImpactPanel } from '@/components/event/impact-panel'
import { TransparencyPanel } from '@/components/event/transparency-panel'
import { toast } from 'sonner'

interface AnalysisData {
  count: number
  averageMovePercent: number
  averageRange: number
  patternReliability: {
    overall: number
    byPattern: Record<string, { count: number; reliability: number }>
  }
  eventsCountByPattern: Record<string, number>
  weights: {
    avgMove: number
    avgRange: number
    patternReliability: number
    explanation: string
  }
  rawMetrics?: {
    moves: Array<{ id: string; movePercent: number; direction: string }>
    ranges: Array<{ id: string; range: number }>
  }
}

export function EventAnalysisPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleAnalyze = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/analyze-event')
      
      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.statusText}`)
      }

      const data = await response.json()
      setAnalysisData(data)
      toast.success('✅ Analysis complete! Review the results below.')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      setError(errorMessage)
      toast.error('❌ Failed to analyze events. Please try again.')
      console.error('Error fetching event analysis:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-2">📊 Event Impact Analyzer</h1>
        <p className="text-lg text-muted-foreground">
          Learn how markets historically reacted to real-world events
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-900 dark:text-red-100">
            <strong>Error:</strong> {error}
          </p>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Event Input */}
        <div className="lg:col-span-1">
          <EventInput onAnalyze={handleAnalyze} isLoading={isLoading} />
        </div>

        {/* Right Column: Results */}
        <div className="lg:col-span-2 space-y-6">
          {/* Impact Panel */}
          <ImpactPanel data={analysisData} />

          {/* Transparency Panel */}
          <TransparencyPanel data={analysisData} />
        </div>
      </div>

      {/* Educational Footer */}
      <div className="mt-12 p-6 bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 dark:from-blue-950 dark:via-purple-950 dark:to-pink-950 rounded-lg border-2 border-blue-200 dark:border-blue-800">
        <h3 className="text-lg font-semibold mb-3 text-center">🎓 Learning Objectives</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <div className="text-2xl mb-2">📚</div>
            <strong>Understand Patterns</strong>
            <p className="text-muted-foreground mt-1">
              Learn to recognize common market behaviors
            </p>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-2">🔍</div>
            <strong>Think Critically</strong>
            <p className="text-muted-foreground mt-1">
              Question assumptions and verify sources
            </p>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-2">⚖️</div>
            <strong>Assess Risk</strong>
            <p className="text-muted-foreground mt-1">
              Understand uncertainty in financial markets
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}