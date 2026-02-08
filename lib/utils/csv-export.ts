/**
 * CSV Export Utilities
 * Helper functions to export data to CSV format
 */

interface AnalysisData {
  count: number
  averageMovePercent: number
  averageRange: number
  patternReliability: {
    overall: number
    byPattern: Record<string, { count: number; reliability: number }>
  }
  eventsCountByPattern: Record<string, number>
  weights: {
    avgMove: number
    avgRange: number
    patternReliability: number
    explanation: string
  }
  rawMetrics?: {
    moves: Array<{ id: string; movePercent: number; direction: string }>
    ranges: Array<{ id: string; range: number }>
  }
}

/**
 * Convert analysis data to CSV format
 */
export function exportEventAnalysisToCSV(data: AnalysisData, filters?: { pattern?: string; eventType?: string }): void {
  if (!data) return

  // Create CSV content
  const lines: string[] = []
  
  // Header section
  lines.push('Event Analysis Export')
  lines.push(`Export Date,${new Date().toISOString()}`)
  if (filters?.pattern) lines.push(`Pattern Filter,${filters.pattern}`)
  if (filters?.eventType) lines.push(`Event Type Filter,${filters.eventType}`)
  lines.push('') // Empty line
  
  // Summary metrics
  lines.push('Summary Metrics')
  lines.push('Metric,Value')
  lines.push(`Total Events,${data.count}`)
  lines.push(`Average Move Percent,${data.averageMovePercent.toFixed(4)}%`)
  lines.push(`Average Range,${data.averageRange.toFixed(4)}`)
  lines.push(`Overall Pattern Reliability,${data.patternReliability.overall.toFixed(2)}%`)
  lines.push('') // Empty line
  
  // Weights
  lines.push('Calculation Weights')
  lines.push('Component,Weight')
  lines.push(`Average Move,${(data.weights.avgMove * 100).toFixed(0)}%`)
  lines.push(`Average Range,${(data.weights.avgRange * 100).toFixed(0)}%`)
  lines.push(`Pattern Reliability,${(data.weights.patternReliability * 100).toFixed(0)}%`)
  lines.push(`Explanation,"${data.weights.explanation}"`)
  lines.push('') // Empty line
  
  // Pattern reliability breakdown
  lines.push('Pattern Reliability Breakdown')
  lines.push('Pattern,Event Count,Reliability %')
  Object.entries(data.patternReliability.byPattern).forEach(([pattern, stats]) => {
    lines.push(`${pattern.replace(/_/g, ' ')},${stats.count},${stats.reliability.toFixed(2)}%`)
  })
  lines.push('') // Empty line
  
  // Events count by pattern
  lines.push('Events Count by Pattern')
  lines.push('Pattern,Count')
  Object.entries(data.eventsCountByPattern).forEach(([pattern, count]) => {
    lines.push(`${pattern.replace(/_/g, ' ')},${count}`)
  })
  lines.push('') // Empty line
  
  // Raw metrics - moves
  if (data.rawMetrics?.moves && data.rawMetrics.moves.length > 0) {
    lines.push('Raw Event Moves')
    lines.push('Event ID,Move Percent,Direction')
    data.rawMetrics.moves.forEach(move => {
      lines.push(`${move.id},${move.movePercent.toFixed(4)}%,${move.direction}`)
    })
    lines.push('') // Empty line
  }
  
  // Raw metrics - ranges
  if (data.rawMetrics?.ranges && data.rawMetrics.ranges.length > 0) {
    lines.push('Raw Event Ranges')
    lines.push('Event ID,Range')
    data.rawMetrics.ranges.forEach(range => {
      lines.push(`${range.id},${range.range.toFixed(4)}`)
    })
  }
  
  // Convert to CSV string
  const csvContent = lines.join('\n')
  
  // Create and download file
  downloadCSV(csvContent, generateFilename(filters))
}

/**
 * Generate filename for CSV export
 */
function generateFilename(filters?: { pattern?: string; eventType?: string }): string {
  const timestamp = new Date().toISOString().split('T')[0] // YYYY-MM-DD
  const parts = ['event-analysis', timestamp]
  
  if (filters?.pattern) parts.push(filters.pattern.toLowerCase().replace(/\s+/g, '-'))
  if (filters?.eventType) parts.push(filters.eventType.toLowerCase().replace(/\s+/g, '-'))
  
  return `${parts.join('_')}.csv`
}

/**
 * Download CSV file
 */
function downloadCSV(content: string, filename: string): void {
  if (typeof window === 'undefined') return
  
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  
  link.href = url
  link.download = filename
  link.style.display = 'none'
  
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  URL.revokeObjectURL(url)
}

