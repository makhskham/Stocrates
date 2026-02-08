'use client'

import { useState } from 'react'
import { EventInput } from '@/components/event/event-input'
import { ImpactPanel } from '@/components/event/impact-panel'
import { TransparencyPanel } from '@/components/event/transparency-panel'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import { toast } from 'sonner'
import { exportEventAnalysisToCSV } from '@/lib/utils/csv-export'

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
  const [currentFilters, setCurrentFilters] = useState<{ pattern?: string; eventType?: string }>({})

  const handleAnalyze = async (pattern?: string, eventType?: string) => {
    setIsLoading(true)
    setError(null)
    setCurrentFilters({ pattern, eventType })

    try {
      // Build query parameters
      const params = new URLSearchParams()
      if (pattern) params.append('pattern', pattern)
      if (eventType) params.append('eventType', eventType)

      const queryString = params.toString()
      const url = queryString ? `/api/analyze-event?${queryString}` : '/api/analyze-event'
      
      console.log('Fetching:', url) // Debug log
      
      const response = await fetch(url)

      if (!response.ok) {
        // Try to get error message from response
        const errorData = await response.json().catch(() => null)
        if (errorData?.error) {
          throw new Error(errorData.error)
        }
        throw new Error(`Failed to fetch data: ${response.statusText}`)
      }

      const data = await response.json()
      
      // Check if we got any events
      if (data.count === 0) {
        const filters = []
        if (pattern) filters.push(`pattern: ${pattern}`)
        if (eventType) filters.push(`event type: ${eventType}`)
        const filterText = filters.length > 0 ? ` for ${filters.join(' and ')}` : ''
        toast.error(`❌ No events found${filterText}. Try different filters or "Show All".`)
        setAnalysisData(null)
        setError(`No events found${filterText}`)
        return
      }

      setAnalysisData(data)

      // Build success message
      const filters = []
      if (pattern) filters.push(`${pattern} pattern`)
      if (eventType) filters.push(`${eventType} events`)
      const filterText = filters.length > 0 ? ` for ${filters.join(' + ')}` : ''

      toast.success(`✅ Found ${data.count} events${filterText}! Review the results below.`)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      setError(errorMessage)
      toast.error('❌ Failed to analyze events. Please try again.')
      console.error('Error fetching event analysis:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleExportCSV = () => {
    if (!analysisData) {
      toast.error('No data to export. Please run an analysis first.')
      return
    }

    try {
      exportEventAnalysisToCSV(analysisData, currentFilters)
      toast.success('✅ CSV file downloaded successfully!')
    } catch (err) {
      toast.error('❌ Failed to export CSV. Please try again.')
      console.error('Error exporting CSV:', err)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="text-center mb-4">
          <h1 className="text-4xl font-bold mb-2">Event Impact Analyzer</h1>
          <p className="text-lg text-muted-foreground">
            Learn how markets historically reacted to real-world events
          </p>
        </div>

        {/* Export Button */}
        {analysisData && (
          <div className="flex justify-center">
            <Button
              onClick={handleExportCSV}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Export to CSV
            </Button>
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-900 dark:text-red-100">
            <strong>Error:</strong> {error}
          </p>
          <p className="text-xs text-red-800 dark:text-red-200 mt-2">
            Try clicking "Show All" to see all available events, or select different filters.
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
        <h3 className="text-lg font-semibold mb-3 text-center">Learning Objectives</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <div className="text-2xl mb-2"></div>
            <strong>Understand Patterns</strong>
            <p className="text-muted-foreground mt-1">
              Learn to recognize common market behaviors
            </p>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-2"></div>
            <strong>Think Critically</strong>
            <p className="text-muted-foreground mt-1">
              Question assumptions and verify sources
            </p>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-2"></div>
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
