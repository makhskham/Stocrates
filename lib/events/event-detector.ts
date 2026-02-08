/**
 * Event Detection and Categorization Service
 * Uses AI to detect and categorize market events
 */

import { createGroq } from '@ai-sdk/groq'
import { generateText } from 'ai'

const GROQ_API_KEY = process.env.GROQ_API_KEY

export type EventType =
  | 'earnings'
  | 'war'
  | 'contract'
  | 'fda_approval'
  | 'merger'
  | 'lawsuit'
  | 'product_launch'
  | 'executive_change'
  | 'economic_data'
  | 'other'

export interface DetectedEvent {
  type: EventType
  confidence: number // 0-100
  reasoning: string
}

/**
 * Detect event type from news headline and content
 * @param headline - News headline
 * @param content - News article content/snippet
 * @returns Detected event with type, confidence, and reasoning
 */
export async function detectEventType(
  headline: string,
  content: string = ''
): Promise<DetectedEvent> {
  if (!GROQ_API_KEY) {
    console.warn('GROQ_API_KEY not found, returning default event type')
    return {
      type: 'other',
      confidence: 0,
      reasoning: 'API key not configured'
    }
  }

  try {
    const groq = createGroq({ apiKey: GROQ_API_KEY })

    const prompt = `Analyze this news headline and categorize the event type.

Headline: ${headline}
${content ? `Content: ${content.substring(0, 500)}` : ''}

Event Categories:
- earnings: Quarterly/annual earnings reports, revenue announcements, profit/loss statements
- war: Military conflicts, geopolitical tensions, sanctions, international disputes
- contract: Major business contracts, deals, partnerships, government contracts
- fda_approval: FDA approvals, drug trials, medical device approvals, clinical trial results
- merger: Mergers, acquisitions, buyouts, takeovers
- lawsuit: Legal issues, lawsuits, regulatory investigations, settlements
- product_launch: New product announcements, product releases, service launches
- executive_change: CEO changes, leadership transitions, board appointments
- economic_data: Economic indicators, Fed decisions, interest rates, inflation data, GDP
- other: Events that don't fit the above categories

Respond in this exact format:
TYPE: [category name]
CONFIDENCE: [0-100]
REASONING: [brief explanation]`

    const result = await generateText({
      model: groq('llama-3.3-70b-versatile'),
      prompt,
      maxTokens: 200
    })

    // Parse the response
    const text = result.text.trim()
    const typeMatch = text.match(/TYPE:\s*(\w+)/i)
    const confidenceMatch = text.match(/CONFIDENCE:\s*(\d+)/i)
    const reasoningMatch = text.match(/REASONING:\s*(.+)/is)

    const type = (typeMatch?.[1]?.toLowerCase() || 'other') as EventType
    const confidence = parseInt(confidenceMatch?.[1] || '50', 10)
    const reasoning = reasoningMatch?.[1]?.trim() || 'Unable to determine reasoning'

    return {
      type,
      confidence,
      reasoning
    }
  } catch (error) {
    console.error('Error detecting event type:', error)
    return {
      type: 'other',
      confidence: 0,
      reasoning: 'Error during detection'
    }
  }
}

/**
 * Batch detect event types for multiple news articles
 * @param articles - Array of {headline, content} objects
 * @returns Array of detected events
 */
export async function detectEventTypes(
  articles: Array<{ headline: string; content?: string }>
): Promise<DetectedEvent[]> {
  const results: DetectedEvent[] = []

  for (const article of articles) {
    const detected = await detectEventType(article.headline, article.content || '')
    results.push(detected)
    
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100))
  }

  return results
}

/**
 * Get event type display name
 */
export function getEventTypeDisplayName(type: EventType): string {
  const displayNames: Record<EventType, string> = {
    earnings: 'Earnings Report',
    war: 'Geopolitical Event',
    contract: 'Business Contract',
    fda_approval: 'FDA Approval',
    merger: 'Merger & Acquisition',
    lawsuit: 'Legal Issue',
    product_launch: 'Product Launch',
    executive_change: 'Executive Change',
    economic_data: 'Economic Data',
    other: 'Other Event'
  }
  return displayNames[type] || 'Unknown'
}

/**
 * Get event type icon/emoji
 */
export function getEventTypeIcon(type: EventType): string {
  const icons: Record<EventType, string> = {
    earnings: '📊',
    war: '⚔️',
    contract: '🤝',
    fda_approval: '💊',
    merger: '🔗',
    lawsuit: '⚖️',
    product_launch: '🚀',
    executive_change: '👔',
    economic_data: '📈',
    other: '📰'
  }
  return icons[type] || '📰'
}

