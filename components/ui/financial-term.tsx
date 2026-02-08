'use client'

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

interface FinancialTermProps {
  term: string
  definition: string
  children?: React.ReactNode
  className?: string
  underlineStyle?: 'dotted' | 'solid' | 'none'
}

/**
 * FinancialTerm Component
 * Wraps financial terminology with a tooltip explanation
 * Helps users learn financial concepts while using the app
 */
export function FinancialTerm({
  term,
  definition,
  children,
  className,
  underlineStyle = 'dotted'
}: FinancialTermProps) {
  const underlineClass = {
    dotted: 'underline decoration-dotted',
    solid: 'underline',
    none: ''
  }[underlineStyle]

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={cn(
            'cursor-help',
            underlineClass,
            'decoration-muted-foreground/50',
            className
          )}>
            {children || term}
          </span>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <p className="font-semibold mb-1">{term}</p>
          <p>{definition}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

/**
 * Pre-defined financial terms with standard definitions
 * Use these for consistency across the app
 */
export const FINANCIAL_TERMS = {
  averageMove: {
    term: 'Average Move',
    definition: 'The average percentage change in price following similar historical events. Positive values indicate price increases, negative values indicate decreases.'
  },
  averageRange: {
    term: 'Average Range',
    definition: 'A measure of price volatility calculated as the difference between the highest and lowest prices during the event period. Higher values indicate more volatile price movements.'
  },
  patternReliability: {
    term: 'Pattern Reliability',
    definition: 'The percentage of times a historical pattern accurately predicted the actual market outcome. Higher percentages indicate more consistent patterns.'
  },
  volatility: {
    term: 'Volatility',
    definition: 'A measure of how much and how quickly prices change. High volatility means larger price swings, while low volatility means more stable prices.'
  },
  confidenceLevel: {
    term: 'Confidence Level',
    definition: 'A statistical measure of certainty in the analysis. Higher confidence levels indicate more reliable data based on larger sample sizes and consistent patterns.'
  },
  historicalPattern: {
    term: 'Historical Pattern',
    definition: 'A recurring market behavior observed in past events. Patterns help identify potential trends but do not guarantee future outcomes.'
  },
  eventType: {
    term: 'Event Type',
    definition: 'The category of market-moving event (e.g., earnings report, product launch, regulatory change). Different event types often produce different market reactions.'
  },
  sentiment: {
    term: 'Sentiment',
    definition: 'The overall attitude or mood of market participants toward a stock or event. Can be bullish (positive), bearish (negative), or neutral.'
  },
  bullish: {
    term: 'Bullish',
    definition: 'A positive or optimistic outlook on a stock or market, expecting prices to rise. Often associated with buying activity.'
  },
  bearish: {
    term: 'Bearish',
    definition: 'A negative or pessimistic outlook on a stock or market, expecting prices to fall. Often associated with selling activity.'
  },
  priceTarget: {
    term: 'Price Target',
    definition: 'An estimated future price level based on analysis. Price targets are educational projections, not guarantees of future performance.'
  },
  marketCap: {
    term: 'Market Capitalization',
    definition: 'The total value of a company calculated by multiplying the stock price by the number of outstanding shares. Indicates company size.'
  },
  volume: {
    term: 'Trading Volume',
    definition: 'The number of shares traded during a specific period. High volume often indicates strong interest and can confirm price trends.'
  },
  support: {
    term: 'Support Level',
    definition: 'A price level where buying interest is historically strong enough to prevent further price declines. Acts as a "floor" for the stock price.'
  },
  resistance: {
    term: 'Resistance Level',
    definition: 'A price level where selling pressure is historically strong enough to prevent further price increases. Acts as a "ceiling" for the stock price.'
  }
} as const

/**
 * Helper component for common financial terms
 * Usage: <Term.AverageMove />
 */
export const Term = {
  AverageMove: ({ children }: { children?: React.ReactNode }) => (
    <FinancialTerm {...FINANCIAL_TERMS.averageMove}>{children}</FinancialTerm>
  ),
  AverageRange: ({ children }: { children?: React.ReactNode }) => (
    <FinancialTerm {...FINANCIAL_TERMS.averageRange}>{children}</FinancialTerm>
  ),
  PatternReliability: ({ children }: { children?: React.ReactNode }) => (
    <FinancialTerm {...FINANCIAL_TERMS.patternReliability}>{children}</FinancialTerm>
  ),
  Volatility: ({ children }: { children?: React.ReactNode }) => (
    <FinancialTerm {...FINANCIAL_TERMS.volatility}>{children}</FinancialTerm>
  ),
  ConfidenceLevel: ({ children }: { children?: React.ReactNode }) => (
    <FinancialTerm {...FINANCIAL_TERMS.confidenceLevel}>{children}</FinancialTerm>
  ),
  HistoricalPattern: ({ children }: { children?: React.ReactNode }) => (
    <FinancialTerm {...FINANCIAL_TERMS.historicalPattern}>{children}</FinancialTerm>
  ),
  EventType: ({ children }: { children?: React.ReactNode }) => (
    <FinancialTerm {...FINANCIAL_TERMS.eventType}>{children}</FinancialTerm>
  ),
  Sentiment: ({ children }: { children?: React.ReactNode }) => (
    <FinancialTerm {...FINANCIAL_TERMS.sentiment}>{children}</FinancialTerm>
  ),
  Bullish: ({ children }: { children?: React.ReactNode }) => (
    <FinancialTerm {...FINANCIAL_TERMS.bullish}>{children}</FinancialTerm>
  ),
  Bearish: ({ children }: { children?: React.ReactNode }) => (
    <FinancialTerm {...FINANCIAL_TERMS.bearish}>{children}</FinancialTerm>
  )
}

