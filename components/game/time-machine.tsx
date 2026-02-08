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
  const today = new Date()
  const isToday = format(selectedDate, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')
  const isPast = selectedDate < today
  const isFuture = selectedDate > today

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

  const goBackOneDay = () => {
    const newDate = new Date(selectedDate)
    newDate.setDate(newDate.getDate() - 1)
    onDateChange(newDate)
  }

  const goForwardOneDay = () => {
    const newDate = new Date(selectedDate)
    newDate.setDate(newDate.getDate() + 1)
    onDateChange(newDate)
  }

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      <div className="flex items-center justify-between">
        <h3 className="font-title text-xl font-bold text-stocrates-dark flex items-center gap-2">
          Time Machine
        </h3>
        {!isToday && (
          <button
            onClick={goToToday}
            className="font-game text-xs px-3 py-1.5 bg-stocrates-dark text-stocrates-cream border-2 border-stocrates-dark rounded-full hover:bg-stocrates-dark-blue transition-all uppercase tracking-wide"
          >
            Return to Today
          </button>
        )}
      </div>

      <div className="relative p-6 bg-white rounded-lg border-[3px] border-[#22271e] shadow-lg">
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
        <div className="flex items-center justify-between mb-4 gap-2">
          <button
            onClick={goBackOneDay}
            className="font-game text-xs px-3 py-2 bg-stocrates-dark text-stocrates-cream border-2 border-stocrates-dark rounded-lg hover:bg-stocrates-dark-blue transition-all uppercase tracking-wide"
          >
            ⏪ -1 Day
          </button>

          <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
              <button
                className={cn(
                  'font-body px-4 py-2 border-3 border-stocrates-dark rounded-lg font-semibold transition-all hover:scale-105',
                  isPast && 'bg-stocrates-dark-blue text-white',
                  !isPast && 'bg-stocrates-cream text-stocrates-dark'
                )}
              >
                {isPast && ''}
                {format(selectedDate, 'PPP')}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="center">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          <button
            onClick={goForwardOneDay}
            className="font-game text-xs px-3 py-2 bg-stocrates-dark text-stocrates-cream border-2 border-stocrates-dark rounded-lg hover:bg-stocrates-dark-blue transition-all uppercase tracking-wide"
          >
            +1 Day ⏩
          </button>
        </div>

        {isPast && (
          <div className="font-body text-xs text-center text-white bg-stocrates-dark-blue rounded-lg p-3 border-2 border-stocrates-dark">
            Time traveling to {format(selectedDate, 'MMMM d, yyyy')}
          </div>
        )}

        {isToday && (
          <div className="font-body text-xs text-center text-stocrates-dark bg-stocrates-blue rounded-lg p-3 border-2 border-stocrates-dark">
            You are in the present
          </div>
        )}

        {isFuture && (
          <div className="font-body text-xs text-center text-white bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg p-3 border-2 border-stocrates-dark">
            Future view active: estimates use historical patterns and recent news
          </div>
        )}
      </div>

      <div className="bg-stocrates-blue/30 rounded-lg p-4">
        <p className="font-body text-xs text-stocrates-dark">
          <strong className="font-title">How it works:</strong> Select a date in the past to see historical stock prices
          and events. "Invest" your Stockrates Points and see how your portfolio would have grown to today!
        </p>
      </div>
    </div>
  )
}

