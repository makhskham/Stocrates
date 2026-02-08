'use client'

import { cn } from '@/lib/utils'
import { Progress } from '@/components/ui/progress'

interface ConfidenceDisplayProps {
  crediblePercent: number
  socialPercent: number
  className?: string
}

export function ConfidenceDisplay({
  crediblePercent,
  socialPercent,
  className
}: ConfidenceDisplayProps) {
  const getColor = (val: number) => {
    if (val >= 70) return 'bg-green-500'
    if (val >= 50) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  const getTextColor = (val: number) => {
    if (val >= 70) return 'text-green-600 dark:text-green-400'
    if (val >= 50) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-red-600 dark:text-red-400'
  }

  return (
    <div className={cn('space-y-4 p-4 bg-muted/50 rounded-lg border', className)}>
      <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
        📊 Confidence Levels
      </h3>
      
      {/* Credible Sources */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">
            Credible sources
            <span className="text-xs text-muted-foreground ml-1">
              (Bloomberg, Reuters, WSJ, Yahoo Finance)
            </span>
          </span>
          <span className={cn('font-bold text-lg', getTextColor(crediblePercent))}>
            {crediblePercent}%
          </span>
        </div>
        <div className="relative h-3 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={cn(
              'h-full transition-all duration-500 ease-out rounded-full',
              getColor(crediblePercent)
            )}
            style={{ width: `${crediblePercent}%` }}
          />
        </div>
      </div>

      {/* Social Sentiment */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">
            Social sentiment
            <span className="text-xs text-muted-foreground ml-1">
              (social media platforms)
            </span>
          </span>
          <span className={cn('font-bold text-lg', getTextColor(socialPercent))}>
            {socialPercent}%
          </span>
        </div>
        <div className="relative h-3 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={cn(
              'h-full transition-all duration-500 ease-out rounded-full',
              getColor(socialPercent)
            )}
            style={{ width: `${socialPercent}%` }}
          />
        </div>
      </div>
    </div>
  )
}

