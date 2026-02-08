'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface ImpactPanelProps {
  data: {
    count: number
    averageMovePercent: number
    averageRange: number
    patternReliability: {
      overall: number
      byPattern: Record<string, { count: number; reliability: number }>
    }
    eventsCountByPattern: Record<string, number>
  } | null
}

export function ImpactPanel({ data }: ImpactPanelProps) {
  if (!data) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>📈 Historical Impact Analysis</CardTitle>
          <CardDescription>Select an event type to see historical data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-40 text-muted-foreground">
            <p>No analysis data yet. Select an event and click "Analyze Pattern"</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Determine sentiment color based on average move
  const getSentimentColor = (move: number) => {
    if (move > 2) return 'text-green-600 dark:text-green-400'
    if (move < -2) return 'text-red-600 dark:text-red-400'
    return 'text-yellow-600 dark:text-yellow-400'
  }

  const getReliabilityColor = (reliability: number) => {
    if (reliability >= 70) return 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200'
    if (reliability >= 50) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-200'
    return 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200'
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>📈 Historical Impact Analysis</CardTitle>
        <CardDescription>
          Based on {data.count} similar historical events
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 rounded-lg">
            <p className="text-sm font-medium text-blue-900 dark:text-blue-100">Average Move</p>
            <p className={`text-3xl font-bold ${getSentimentColor(data.averageMovePercent)}`}>
              {data.averageMovePercent > 0 ? '+' : ''}
              {data.averageMovePercent.toFixed(2)}%
            </p>
            <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
              {data.averageMovePercent > 0 ? '📈 Historically bullish' : '📉 Historically bearish'}
            </p>
          </div>

          <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 rounded-lg">
            <p className="text-sm font-medium text-purple-900 dark:text-purple-100">Average Range</p>
            <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
              {data.averageRange.toFixed(2)}
            </p>
            <p className="text-xs text-purple-700 dark:text-purple-300 mt-1">
              Price volatility indicator
            </p>
          </div>

          <div className="p-4 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900 rounded-lg">
            <p className="text-sm font-medium text-amber-900 dark:text-amber-100">Pattern Reliability</p>
            <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">
              {data.patternReliability.overall.toFixed(0)}%
            </p>
            <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
              How often pattern held true
            </p>
          </div>
        </div>

        {/* Pattern Breakdown */}
        <div className="space-y-2">
          <h3 className="font-semibold text-sm">Pattern Reliability by Type</h3>
          <div className="space-y-2">
            {Object.entries(data.patternReliability.byPattern).map(([pattern, stats]) => (
              <div key={pattern} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium capitalize">
                    {pattern.replace(/_/g, ' ')}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    ({stats.count} events)
                  </span>
                </div>
                <Badge className={getReliabilityColor(stats.reliability)}>
                  {stats.reliability.toFixed(0)}% reliable
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Educational Note */}
        <div className="p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <p className="text-sm text-yellow-900 dark:text-yellow-100">
            <strong>🎓 What This Means:</strong> These statistics show{' '}
            <em>past behavior</em>, not future predictions. Markets can behave differently{' '}
            each time. Use this as a learning tool to understand historical patterns.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
