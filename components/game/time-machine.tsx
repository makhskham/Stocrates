'use client'

import React, { useState } from 'react'
import { Calendar } from '@/components/ui/calendar'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'

interface TimeMachineProps {
  selectedDate: Date
  onDateChange: (date: Date) => void
  className?: string
}

export function TimeMachine({ selectedDate, onDateChange, className }: TimeMachineProps) {
  const [isOpen, setIsOpen] = useState(false)
  const isToday = format(selectedDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
  const isPast = selectedDate < new Date()

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      onDateChange(date)
      setIsOpen(false)
    }
  }

  const goToToday = () => {
    onDateChange(new Date())
    setIsOpen(false)
  }

  const goBackOneYear = () => {
    const newDate = new Date(selectedDate)
    newDate.setFullYear(newDate.getFullYear() - 1)
    onDateChange(newDate)
  }

  const goForwardOneYear = () => {
    const newDate = new Date(selectedDate)
    newDate.setFullYear(newDate.getFullYear() + 1)
    if (newDate <= new Date()) {
      onDateChange(newDate)
    }
  }

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          🕰️ Time Machine
        </h3>
        {!isToday && (
          <Button variant="outline" size="sm" onClick={goToToday}>
            Return to Today
          </Button>
        )}
      </div>

      <div className="p-4 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/30 dark:to-blue-950/30 rounded-lg border-2 border-purple-200 dark:border-purple-800">
        <div className="flex items-center justify-between mb-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={goBackOneYear}
            className="text-purple-700 dark:text-purple-300"
          >
            ⏪ -1 Year
          </Button>
          
          <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-[240px] justify-center text-center font-semibold',
                  isPast && 'bg-purple-100 dark:bg-purple-900/50 border-purple-300 dark:border-purple-700'
                )}
              >
                {isPast && '🕰️ '}
                {format(selectedDate, 'PPP')}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="center">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                disabled={(date) => date > new Date()}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          <Button
            variant="ghost"
            size="sm"
            onClick={goForwardOneYear}
            disabled={!isPast}
            className="text-purple-700 dark:text-purple-300 disabled:opacity-30"
          >
            +1 Year ⏩
          </Button>
        </div>

        {isPast && (
          <div className="text-xs text-center text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-900/30 rounded p-2">
            ⚡ Time traveling to {format(selectedDate, 'MMMM d, yyyy')}
          </div>
        )}
        
        {isToday && (
          <div className="text-xs text-center text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/30 rounded p-2">
            📅 You are in the present
          </div>
        )}
      </div>

      <div className="text-xs text-muted-foreground bg-muted/50 rounded p-3">
        <strong>💡 How it works:</strong> Select a date in the past to see historical stock prices 
        and events. "Invest" your Stockrates Points and see how your portfolio would have grown to today!
      </div>
    </div>
  )
}

