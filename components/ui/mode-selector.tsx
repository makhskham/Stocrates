'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { type StocatesMode, MODES } from '@/lib/modes/types'

interface ModeSelectorProps {
  mode: StocatesMode
  onChange: (mode: StocatesMode) => void
  className?: string
}

export function ModeSelector({ mode, onChange, className }: ModeSelectorProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-1 bg-stocrates-dark/8 rounded-full p-1 border border-stocrates-dark/12',
        className
      )}
      role="radiogroup"
      aria-label="Learning mode"
    >
      {MODES.map(m => (
        <button
          key={m.id}
          role="radio"
          aria-checked={mode === m.id}
          onClick={() => onChange(m.id)}
          title={m.description}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-title font-bold uppercase tracking-wide transition-all duration-200',
            mode === m.id
              ? 'bg-stocrates-dark text-stocrates-cream shadow-sm'
              : 'text-stocrates-dark/60 hover:text-stocrates-dark hover:bg-stocrates-dark/6'
          )}
        >
          <span className="text-sm leading-none">{m.icon}</span>
          <span className="hidden sm:inline">{m.label}</span>
        </button>
      ))}
    </div>
  )
}
