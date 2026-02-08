'use client'

import { cn } from '@/lib/utils'

interface ConfidenceMeterProps {
  value: number // 0-100
  label?: string
  size?: 'sm' | 'md' | 'lg'
  showPercentage?: boolean
  className?: string
}

export function ConfidenceMeter({
  value,
  label,
  size = 'md',
  showPercentage = true,
  className
}: ConfidenceMeterProps) {
  // Clamp value between 0 and 100
  const clampedValue = Math.min(100, Math.max(0, value))
  
  // Determine color based on value
  const getColor = (val: number) => {
    if (val >= 70) return 'text-green-600 dark:text-green-400'
    if (val >= 50) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-red-600 dark:text-red-400'
  }
  
  const getBarColor = (val: number) => {
    if (val >= 70) return 'bg-green-500'
    if (val >= 50) return 'bg-yellow-500'
    return 'bg-red-500'
  }
  
  const getGradientColor = (val: number) => {
    if (val >= 70) return 'from-green-50 to-green-100 dark:from-green-950 dark:to-green-900'
    if (val >= 50) return 'from-yellow-50 to-yellow-100 dark:from-yellow-950 dark:to-yellow-900'
    return 'from-red-50 to-red-100 dark:from-red-950 dark:to-red-900'
  }
  
  // Size configurations
  const sizeConfig = {
    sm: {
      container: 'h-16 w-16',
      text: 'text-lg',
      label: 'text-xs',
      barHeight: 'h-2'
    },
    md: {
      container: 'h-24 w-24',
      text: 'text-2xl',
      label: 'text-sm',
      barHeight: 'h-3'
    },
    lg: {
      container: 'h-32 w-32',
      text: 'text-4xl',
      label: 'text-base',
      barHeight: 'h-4'
    }
  }
  
  const config = sizeConfig[size]
  
  // Calculate rotation for the needle (0-180 degrees)
  const rotation = (clampedValue / 100) * 180
  
  return (
    <div className={cn('flex flex-col items-center gap-3', className)}>
      {/* Circular Gauge */}
      <div className="relative">
        {/* Background Arc */}
        <svg className={config.container} viewBox="0 0 100 100">
          {/* Background semicircle */}
          <path
            d="M 10 90 A 40 40 0 0 1 90 90"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-gray-200 dark:text-gray-700"
          />
          
          {/* Colored segments */}
          {/* Red segment (0-50%) */}
          <path
            d="M 10 90 A 40 40 0 0 1 50 50"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-red-300 dark:text-red-800"
            opacity="0.5"
          />
          
          {/* Yellow segment (50-70%) */}
          <path
            d="M 50 50 A 40 40 0 0 1 70 60"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-yellow-300 dark:text-yellow-800"
            opacity="0.5"
          />
          
          {/* Green segment (70-100%) */}
          <path
            d="M 70 60 A 40 40 0 0 1 90 90"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-green-300 dark:text-green-800"
            opacity="0.5"
          />
          
          {/* Needle */}
          <line
            x1="50"
            y1="90"
            x2="50"
            y2="55"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            className={getColor(clampedValue)}
            style={{
              transformOrigin: '50px 90px',
              transform: `rotate(${rotation - 90}deg)`
            }}
          />
          
          {/* Center dot */}
          <circle
            cx="50"
            cy="90"
            r="3"
            fill="currentColor"
            className={getColor(clampedValue)}
          />
        </svg>
        
        {/* Percentage in center */}
        {showPercentage && (
          <div className="absolute inset-0 flex items-end justify-center pb-2">
            <span className={cn('font-bold', config.text, getColor(clampedValue))}>
              {Math.round(clampedValue)}%
            </span>
          </div>
        )}
      </div>
      
      {/* Label */}
      {label && (
        <span className={cn('font-medium text-center text-muted-foreground', config.label)}>
          {label}
        </span>
      )}
    </div>
  )
}

