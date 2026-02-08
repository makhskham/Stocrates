import { IconAlertTriangle } from '@/components/ui/icons'

interface EducationalDisclaimerProps {
  variant?: 'inline' | 'card' | 'minimal'
  className?: string
}

export function EducationalDisclaimer({ 
  variant = 'inline',
  className = '' 
}: EducationalDisclaimerProps) {
  
  if (variant === 'minimal') {
    return (
      <div className={`text-xs text-muted-foreground italic mt-2 ${className}`}>
        📚 Educational purposes only. Not financial advice.
      </div>
    )
  }

  if (variant === 'card') {
    return (
      <div className={`mt-3 p-3 bg-yellow-50 dark:bg-yellow-950/30 rounded-lg border border-yellow-200 dark:border-yellow-800 ${className}`}>
        <div className="flex items-start gap-2">
          <IconAlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-500 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-yellow-900 dark:text-yellow-100">
            <strong>Educational Disclaimer:</strong> This information is for learning purposes only 
            and is not financial advice. Past performance does not guarantee future results. 
            Always conduct your own research before making financial decisions.
          </div>
        </div>
      </div>
    )
  }

  // Default: inline variant
  return (
    <div className={`mt-2 text-xs text-muted-foreground border-l-2 border-yellow-500 pl-2 ${className}`}>
      <strong>📚 Educational Note:</strong> This is for learning purposes only, not financial advice. 
      Past performance doesn't guarantee future results.
    </div>
  )
}

// Specific disclaimer for historical pattern analysis
export function HistoricalPatternDisclaimer({ className = '' }: { className?: string }) {
  return (
    <div className={`mt-3 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800 ${className}`}>
      <div className="text-xs text-blue-900 dark:text-blue-100">
        <strong>🔍 About Historical Patterns:</strong> Historical patterns help us learn how markets 
        have reacted in the past, but they don't predict the future. Every situation is unique, 
        and many factors influence market movements. Use this as a learning tool to develop your 
        own analytical skills.
      </div>
    </div>
  )
}

