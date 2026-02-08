'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

interface TransparencyPanelProps {
  data: {
    weights: {
      avgMove: number
      avgRange: number
      patternReliability: number
      explanation: string
    }
    count: number
    rawMetrics?: {
      moves: Array<{ id: string; movePercent: number | string; direction: string }>
      ranges: Array<{ id: string; range: number | string }>
    }
  } | null
}

export function TransparencyPanel({ data }: TransparencyPanelProps) {
  if (!data) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Transparency Dashboard</CardTitle>
          <CardDescription>See how the analysis was calculated</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-40 text-muted-foreground">
            <p>No transparency data yet. Run an analysis first.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const weightData = [
    {
      name: 'Average Move Impact',
      weight: data.weights.avgMove,
      description: 'How much price moved on average',
      color: 'bg-blue-500',
    },
    {
      name: 'Volatility Range',
      weight: data.weights.avgRange,
      description: 'How volatile the price was',
      color: 'bg-purple-500',
    },
    {
      name: 'Pattern Consistency',
      weight: data.weights.patternReliability,
      description: 'How reliably the pattern predicted direction',
      color: 'bg-amber-500',
    },
  ]

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Transparency Dashboard</CardTitle>
        <CardDescription>
          How we calculated this analysis • {data.count} historical data points
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Data Sources */}
        <div className="space-y-3">
          <h3 className="font-semibold text-sm flex items-center gap-2">
            <span></span> Data Sources Used
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-3 bg-muted rounded-lg">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium">Historical Events</span>
                <span className="text-xs text-muted-foreground">{data.count} events</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Real market patterns from our database
              </p>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium">Price Data</span>
                <span className="text-xs text-muted-foreground">OHLC values</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Open, High, Low, Close prices
              </p>
            </div>
          </div>
        </div>

        {/* Weight Distribution */}
        <div className="space-y-3">
          <h3 className="font-semibold text-sm flex items-center gap-2">
            <span></span> How Metrics Were Weighted
          </h3>
          <div className="space-y-4">
            {weightData.map((item) => (
              <div key={item.name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  </div>
                  <span className="text-sm font-bold">{(item.weight * 100).toFixed(0)}%</span>
                </div>
                <Progress value={item.weight * 100} className={`h-2 ${item.color}`} />
              </div>
            ))}
          </div>
        </div>

        {/* Methodology Explanation */}
        <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 rounded-lg border border-blue-200 dark:border-blue-800">
          <h4 className="text-sm font-semibold mb-2 text-blue-900 dark:text-blue-100">
            Our Calculation Method
          </h4>
          <p className="text-xs text-blue-800 dark:text-blue-200 leading-relaxed">
            {data.weights.explanation}
          </p>
        </div>

        {/* Limitations Notice */}
        <div className="p-4 bg-orange-50 dark:bg-orange-950 rounded-lg border border-orange-200 dark:border-orange-800">
          <h4 className="text-sm font-semibold mb-2 text-orange-900 dark:text-orange-100">
            ⚠️ What We're NOT Doing
          </h4>
          <ul className="text-xs text-orange-800 dark:text-orange-200 space-y-1">
            <li>❌ We're NOT predicting future price movements</li>
            <li>❌ We're NOT recommending you buy or sell anything</li>
            <li>❌ We're NOT accounting for current market conditions</li>
            <li>✅ We ARE showing you transparent historical analysis</li>
            <li>✅ We ARE helping you learn pattern recognition</li>
          </ul>
        </div>

        {/* Sample Data Preview */}
        {data.rawMetrics?.moves?.length ? (
          <div className="space-y-2">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <span></span> Sample Raw Data (First 5 Events)
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-muted">
                  <tr>
                    <th className="p-2 text-left">Event ID</th>
                    <th className="p-2 text-left">Move %</th>
                    <th className="p-2 text-left">Direction</th>
                    <th className="p-2 text-left">Range</th>
                  </tr>
                </thead>
                <tbody>
                  {data.rawMetrics.moves.slice(0, 5).map((move, idx) => {
                    const movePercent = Number(move.movePercent)
                    const rangeValue = data.rawMetrics?.ranges?.[idx]?.range
                    return (
                      <tr key={move.id} className="border-b">
                        <td className="p-2 font-mono">{move.id}</td>
                        <td
                          className={`p-2 ${
                            movePercent > 0 ? 'text-green-600' : 'text-red-600'
                          }`}
                        >
                          {movePercent > 0 ? '+' : ''}
                          {movePercent.toFixed(2)}%
                        </td>
                        <td className="p-2">
                          {move.direction.toLowerCase() === 'up' ? '📈' : '📉'}{' '}
                          {move.direction}
                        </td>
                        <td className="p-2">
                          {rangeValue != null ? Number(rangeValue).toFixed(2) : '—'}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-muted-foreground italic">
              Showing 5 of {data.rawMetrics.moves.length} total events
            </p>
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
