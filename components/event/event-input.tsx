'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface EventInputProps {
  onAnalyze: () => void
  isLoading: boolean
}

export function EventInput({ onAnalyze, isLoading }: EventInputProps) {
  const [selectedEvent, setSelectedEvent] = useState<string>('')

  const eventTypes = [
    { value: 'breakout', label: '📈 Breakout Pattern', description: 'Stock breaks through resistance level' },
    { value: 'head_and_shoulders', label: '📉 Head & Shoulders', description: 'Reversal pattern formation' },
    { value: 'continuation', label: '➡️ Continuation Pattern', description: 'Trend continues after pause' },
    { value: 'retest', label: '🔄 Retest Pattern', description: 'Price returns to test support/resistance' },
    { value: 'fakeout', label: '⚠️ Fakeout Pattern', description: 'False breakout signal' },
  ]

  const handleAnalyze = () => {
    if (selectedEvent) {
      onAnalyze()
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl">📊 Event Analysis</CardTitle>
        <CardDescription>
          Select a market pattern to analyze how similar events played out historically
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Select Event Type</label>
          <Select value={selectedEvent} onValueChange={setSelectedEvent}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Choose a market pattern..." />
            </SelectTrigger>
            <SelectContent>
              {eventTypes.map((event) => (
                <SelectItem key={event.value} value={event.value}>
                  <div className="flex flex-col items-start">
                    <span className="font-medium">{event.label}</span>
                    <span className="text-xs text-muted-foreground">{event.description}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-900 dark:text-blue-100">
            <strong>💡 Learning Note:</strong> This analysis shows you how markets{' '}
            <em>historically reacted</em> to similar patterns. It's about understanding{' '}
            <strong>past trends</strong>, not predicting the future.
          </p>
        </div>

        <Button
          onClick={handleAnalyze}
          disabled={!selectedEvent || isLoading}
          className="w-full"
          size="lg"
        >
          {isLoading ? (
            <>
              <span className="mr-2">⏳</span>
              Analyzing Historical Data...
            </>
          ) : (
            <>
              <span className="mr-2">🔍</span>
              Analyze Pattern
            </>
          )}
        </Button>

        <div className="text-xs text-muted-foreground text-center">
          ⚠️ Educational purposes only • Not financial advice
        </div>
      </CardContent>
    </Card>
  )
}
