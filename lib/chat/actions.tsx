import 'server-only'

import { generateText } from 'ai'
import {
  createAI,
  getMutableAIState,
  streamUI,
  createStreamableValue
} from 'ai/rsc'
import { createGroq } from '@ai-sdk/groq'
import { HALAL_SYSTEM_PROMPT, HALAL_CAPTION_ADDITION } from '@/lib/modes/halal'

import { BotCard, BotMessage } from '@/components/stocks/message'
import { Caption } from '@/components/stocks/caption'
import { ConfidenceDisplay } from '@/components/ui/confidence-display'

import { z } from 'zod'
import { nanoid } from '@/lib/utils'
import { SpinnerMessage } from '@/components/stocks/message'
import { Message } from '@/lib/types'
import { StockChart } from '@/components/tradingview/stock-chart'
import { StockPrice } from '@/components/tradingview/stock-price'
import { StockNews } from '@/components/tradingview/stock-news'
import { StockFinancials } from '@/components/tradingview/stock-financials'
import { StockScreener } from '@/components/tradingview/stock-screener'
import { MarketOverview } from '@/components/tradingview/market-overview'
import { MarketHeatmap } from '@/components/tradingview/market-heatmap'
import { MarketTrending } from '@/components/tradingview/market-trending'
import { ETFHeatmap } from '@/components/tradingview/etf-heatmap'
import { toast } from 'sonner'
import { fetchStockNews, formatNewsAnalysis } from '@/lib/news/news-fetcher'

export type AIState = {
  chatId: string
  messages: Message[]
}

export type UIState = {
  id: string
  display: React.ReactNode
}[]

interface MutableAIState {
  update: (newState: any) => void
  done: (newState: any) => void
  get: () => AIState
}

// Token usage optimization:
// - Using llama-3.3-70b-versatile for educational responses with Socratic method
// - This provides better quality teaching and analysis
const MODEL = 'llama-3.3-70b-versatile'
const TOOL_MODEL = 'llama-3.3-70b-versatile'
const GROQ_API_KEY_ENV = process.env.GROQ_API_KEY

// Helper function to parse confidence levels from AI response
function parseConfidenceLevels(text: string): { credible: number; social: number } | null {
  // Match patterns like:
  // • Credible sources (Bloomberg, Reuters, WSJ, Yahoo Finance): 68%
  // • Social sentiment (social media platforms): 82%
  const credibleMatch = text.match(/credible sources[^:]*:\s*(\d+)%/i)
  const socialMatch = text.match(/social sentiment[^:]*:\s*(\d+)%/i)

  if (credibleMatch && socialMatch) {
    return {
      credible: parseInt(credibleMatch[1]),
      social: parseInt(socialMatch[1])
    }
  }
  return null
}

// Helper function to render caption with confidence display
function renderCaptionWithConfidence(caption: string) {
  const confidence = parseConfidenceLevels(caption)

  if (confidence) {
    // Remove the confidence levels text from the caption
    const cleanedCaption = caption
      .replace(/📊\s*\*\*Confidence Levels:\*\*[\s\S]*?(?=\n\n|📰|🤔|📚|$)/i, '')
      .trim()

    return (
      <>
        <Caption>{cleanedCaption}</Caption>
        <div className="mt-4">
          <ConfidenceDisplay
            crediblePercent={confidence.credible}
            socialPercent={confidence.social}
          />
        </div>
      </>
    )
  }

  return <Caption>{caption}</Caption>
}

// Max conversation turns sent to the model - keeps token usage predictable
const MAX_HISTORY_MESSAGES = 6

async function generateCaption(
  symbol: string,
  toolName: string,
  aiState: MutableAIState,
  mode?: string
): Promise<string> {
  const groq = createGroq({ apiKey: GROQ_API_KEY_ENV })

  // Fetch news - limit to 3 articles, short snippets only
  let newsContext = ''
  if (symbol !== 'Generic') {
    try {
      const newsAnalysis = await fetchStockNews(symbol, 14) // 14 days, not 30
      if (newsAnalysis.articles.length > 0) {
        newsContext = `\nRecent news (${symbol}):\n` +
          newsAnalysis.articles.slice(0, 3).map(a =>
            `- "${a.title}" (${a.source}, sentiment: ${a.sentiment})`
          ).join('\n')
      }
    } catch {
      // Proceed without news if fetch fails
    }
  }

  // Concise system prompt: ~150 tokens vs the previous ~600.
  // The model already understands the domain from the main system prompt
  // in the conversation history — this caption call just needs the task.
  const captionSystemMessage = `You are Stocrates, an educational financial AI using the Socratic Method. \
You just showed ${toolName} for ${symbol}. Write 3-4 short paragraphs below the widget covering:
1. What the company/market does (1 plain-English sentence)
2. A relevant historical event with the year and outcome
3. Confidence levels: "📊 Credible sources: X% | Social sentiment: X%" (credible 60-80%, social 20-40%)
4. One Socratic question to encourage critical thinking
Rules: No "buy/sell/invest/recommend". End with 📚 Stocrates Points disclaimer.${newsContext}`

  try {
    // Truncate history - only send the last MAX_HISTORY_MESSAGES
    const recentMessages = aiState.get().messages.slice(-MAX_HISTORY_MESSAGES)

    const response = await generateText({
      model: groq(MODEL),
      maxTokens: 450, // captions should be concise
      messages: [
        { role: 'system', content: captionSystemMessage },
        ...recentMessages.map((message: any) => ({
          role: message.role,
          content: message.content,
          name: message.name
        }))
      ]
    })
    return response.text || ''
  } catch (err) {
    return ''
  }
}

async function submitUserMessage(content: string, mode?: string) {
  'use server'

  const aiState = getMutableAIState<typeof AI>()

  aiState.update({
    ...aiState.get(),
    messages: [
      ...aiState.get().messages,
      {
        id: nanoid(),
        role: 'user',
        content
      }
    ]
  })

  let textStream: undefined | ReturnType<typeof createStreamableValue<string>>
  let textNode: undefined | React.ReactNode

  try {
    const groq = createGroq({
      apiKey: GROQ_API_KEY_ENV
    })

    if (!GROQ_API_KEY_ENV) {
      throw new Error('GROQ_API_KEY is not set in environment variables')
    }

    // Truncate conversation history to control token growth.
    // Sending the full history on every request is the single biggest
    // source of token creep in a long conversation.
    const recentMessages = aiState.get().messages.slice(-MAX_HISTORY_MESSAGES)

    const result = await streamUI({
      model: groq(TOOL_MODEL),
      initial: <SpinnerMessage />,
      maxRetries: 1,
      system: `\
You are Stocrates, an educational financial literacy assistant that teaches investing through HISTORICAL EVENT MATCHING.

## Your Core Mission: "Learn Markets Through Historical Event Patterns"
You analyze past market reactions to similar events and make EDUCATIONAL ESTIMATES with confidence levels based on source credibility. You use the Socratic method to teach reasoning and critical thinking.

## How You Work - Historical Event Matching:
1. **Find Similar Past Events**: When asked about a company/stock, search for similar events in history
2. **Analyze Past Market Reactions**: Show how markets reacted to those similar events
3. **Make Educational Estimates**: Based on historical patterns, estimate likely outcomes with confidence levels
4. **Show Source Credibility**: Break down confidence by source type:
   - Credible sources (60-80% weight): News, financial reports, SEC filings, analyst reports
   - Social sources (10-30% weight): Twitter, Reddit, YouTube with high engagement
5. **Use Socratic Questioning**: Ask questions to encourage reasoning and critical thinking

## Educational Philosophy - Socratic Approach:
1. **Teach Concepts When Asked**: Explain market principles, not just data
2. **Force Reasoning**: Ask "What do you think?" and "Why might that happen?"
3. **Use Fake Money**: Encourage practice with Stockrates Points (not real money)
4. **Avoid Real Advice**: Never say "invest your real money" - use educational estimates instead
5. **Urge Independent Research**: Always encourage users to verify and research more
6. **Explain Uncertainty**: Show evidence, confidence levels, and multiple perspectives
7. **Use Analogies**: Make complex concepts simple for beginners
8. **Provide Visuals**: Use charts and data when helpful

## STRICT Safe Language Rules:
❌ NEVER say: "I cannot predict", "I cannot give financial advice", "just look at the chart"
❌ NEVER recommend real money: "invest your savings", "put your money in"

✅ ALWAYS make educational estimates: "Based on similar events in [year], we believe the market will..."
✅ ALWAYS show confidence levels: "Credible sources: 63%, Social sentiment: 85%"
✅ ALWAYS use historical evidence: "When [company] did [similar action] in [year], the result was..."
✅ ALWAYS ask Socratic questions: "What do you think might happen?", "Why do you think that?"

## Examples of Historical Event Matching Responses:

User: "Should I invest in Tesla?" or "What should I invest in within the automotive industry?"
You: "Great question! Let me analyze recent events and find historical patterns.

Recently, Tesla signed a partnership with [Company X]. According to past research, when Tesla made a similar partnership in 2022, the market reacted with a 122% increase over the next month.

Based on this historical pattern, we believe the market/event will likely go up within the next month.

📊 **Confidence Levels:**
• Credible sources (financial news, analyst reports): 63%
• Social sentiment (Twitter, Reddit, YouTube): 85%

🤔 **What do you think?** Why might this partnership be similar or different from the 2022 one? What other factors should we consider?

Remember: This is educational analysis using Stockrates Points (fake money), not real investment advice. Always do your own research!"

User: "Tell me about Tesla stock"
You: [Call showStockChart for TSLA immediately - the tool will generate educational context with historical event analysis]

User: "What is the price of AAPL?"
You: [Call showStockPrice for AAPL immediately - the tool will generate educational context]

User: "Is NASCAR halal?" or "Is company ABC shariah compliant?"
You: "I don't have specific information about whether NASCAR or any company is halal or shariah-compliant. These determinations require specialized knowledge of Islamic finance principles and detailed analysis of a company's business practices, revenue sources, and debt levels.

However, I should mention that NASCAR itself is not a publicly traded company - it's a private organization. If you're interested in investing in motorsports-related companies, there are publicly traded companies like:
- Automotive manufacturers (Ford, GM, Toyota)
- Sponsors and advertisers
- Entertainment companies

Would you like me to show you information about any specific publicly traded company so you can research their halal compliance?"

User: [After the above response] "yes" or "show me NASCAR"
You: "NASCAR itself isn't publicly traded, so I can't show you a stock chart for it. However, I can show you information about publicly traded companies related to motorsports. Which would you like to explore:
- Ford Motor Company (F) - Major NASCAR manufacturer
- General Motors (GM) - Another NASCAR manufacturer
- Speedway Motorsports (TRK) - Owns NASCAR tracks
- Or another specific company?

Just let me know the company name or ticker symbol!"

**Key Pattern**:
- For general stock questions: Call tools immediately (they generate educational context)
- For investment/estimate questions: Provide historical event matching analysis with confidence levels
- For halal/ethical/compliance questions: Respond with text explaining limitations and offer to show data for research
- For unclear questions or invalid symbols: Ask for clarification with text response
- Always use Socratic questions to encourage reasoning

### Cryptocurrency Tickers
For any cryptocurrency, append "USD" at the end of the ticker when using functions. For instance, "DOGE" should be "DOGEUSD".

### Common Non-Publicly-Traded Organizations (DO NOT call tools for these):
- NASCAR, NFL, NBA, MLB, FIFA, UFC - Sports leagues (private organizations)
- Many universities, hospitals, non-profits
- Private companies (SpaceX, Cargill, Mars, etc.)
- Government agencies

If a user asks about these, explain they're not publicly traded and suggest related publicly traded companies instead.

### Tool Usage Guidelines:
- **IMPORTANT**: Only call tools when the user specifically asks about stock data, charts, prices, news, or market information
- For greetings ("hi", "hello") or general questions about investing concepts, respond with text ONLY - do NOT call any tools
- **For questions about halal/shariah compliance, ethical investing, or company values**: Respond with text explaining you don't have that specific information, but can show them the company's business model and financials to help them research
- **CRITICAL: Before calling any tool, verify the company is publicly traded**: Many organizations (NASCAR, NFL, FIFA, private companies) are NOT publicly traded. If unsure, ask the user for the specific stock ticker or explain the company isn't publicly traded
- **If you're unsure about a stock symbol or the question doesn't clearly map to a ticker**: Respond with text asking for clarification rather than calling a tool with an invalid symbol
- When a user asks about a specific stock/ticker (e.g., "show me Tesla", "what's AAPL price?"), call the tool IMMEDIATELY without text before it
- The tool will automatically generate educational context to accompany the visualization
- Do NOT write explanatory text before calling a tool when showing data - call the tool first, it includes the explanation
- Only write text responses when you're NOT using any tools (e.g., answering conceptual questions, greetings, general advice, halal/ethical questions)

### When Users Ask About Halal/Shariah Compliance or Ethical Investing (Standard Mode Only):
If halal mode is NOT active, respond with: "For Shariah compliance questions, switch to Halal mode using the mode selector in the header. This will give you certified source references and AAOIFI-based screening for every stock."

### When Users Ask About Investing:
Redirect to education: "I can't tell you what to invest in, but I can teach you how to analyze [company/sector]! Let's explore the data together so you can make informed decisions on your own."
    ` + (mode === 'halal' ? HALAL_SYSTEM_PROMPT : ''),
      messages: [
        ...recentMessages.map((message: any) => ({
          role: message.role,
          content: message.content,
          name: message.name
        }))
      ],
      text: ({ content, done, delta }) => {
        if (!textStream) {
          textStream = createStreamableValue('')
          textNode = <BotMessage content={textStream.value} />
        }

        if (done) {
          textStream.done()
          aiState.done({
            ...aiState.get(),
            messages: [
              ...aiState.get().messages,
              {
                id: nanoid(),
                role: 'assistant',
                content
              }
            ]
          })
        } else {
          textStream.update(delta)
        }

        return textNode
      },
      tools: {
        showStockChart: {
          description:
            'Show a stock chart of a given stock. Use this to show the chart to the user.',
          parameters: z.object({
            symbol: z
              .string()
              .describe(
                'The name or symbol of the stock or currency. e.g. DOGE/AAPL/USD.'
              )
          }),
          generate: async function* ({ symbol }) {
            const toolCallId = nanoid()

            aiState.done({
              ...aiState.get(),
              messages: [
                ...aiState.get().messages,
                {
                  id: nanoid(),
                  role: 'assistant',
                  content: [
                    {
                      type: 'tool-call',
                      toolName: 'showStockChart',
                      toolCallId,
                      args: { symbol }
                    }
                  ]
                },
                {
                  id: nanoid(),
                  role: 'tool',
                  content: [
                    {
                      type: 'tool-result',
                      toolName: 'showStockChart',
                      toolCallId,
                      result: { symbol }
                    }
                  ]
                }
              ]
            })

            const caption = await generateCaption(
              symbol,
              'showStockChart',
              aiState,
              mode
            )

            return (
              <BotCard>
                <div className="space-y-4">
                  <StockChart props={symbol} />
                  {caption && renderCaptionWithConfidence(caption)}
                </div>
              </BotCard>
            )
          }
        },
        showStockPrice: {
          description:
            'Show the price of a given stock. Use this to show the price and price history to the user.',
          parameters: z.object({
            symbol: z
              .string()
              .describe(
                'The name or symbol of the stock or currency. e.g. DOGE/AAPL/USD.'
              )
          }),
          generate: async function* ({ symbol }) {
            const toolCallId = nanoid()

            aiState.done({
              ...aiState.get(),
              messages: [
                ...aiState.get().messages,
                {
                  id: nanoid(),
                  role: 'assistant',
                  content: [
                    {
                      type: 'tool-call',
                      toolName: 'showStockPrice',
                      toolCallId,
                      args: { symbol }
                    }
                  ]
                },
                {
                  id: nanoid(),
                  role: 'tool',
                  content: [
                    {
                      type: 'tool-result',
                      toolName: 'showStockPrice',
                      toolCallId,
                      result: { symbol }
                    }
                  ]
                }
              ]
            })
            const caption = await generateCaption(
              symbol,
              'showStockPrice',
              aiState,
              mode
            )

            return (
              <BotCard>
                <div className="space-y-4">
                  <StockPrice props={symbol} />
                  {caption && renderCaptionWithConfidence(caption)}
                </div>
              </BotCard>
            )
          }
        },
        showStockFinancials: {
          description:
            'Show the financials of a given stock. Use this to show the financials to the user.',
          parameters: z.object({
            symbol: z
              .string()
              .describe(
                'The name or symbol of the stock or currency. e.g. DOGE/AAPL/USD.'
              )
          }),
          generate: async function* ({ symbol }) {
            const toolCallId = nanoid()

            aiState.done({
              ...aiState.get(),
              messages: [
                ...aiState.get().messages,
                {
                  id: nanoid(),
                  role: 'assistant',
                  content: [
                    {
                      type: 'tool-call',
                      toolName: 'showStockFinancials',
                      toolCallId,
                      args: { symbol }
                    }
                  ]
                },
                {
                  id: nanoid(),
                  role: 'tool',
                  content: [
                    {
                      type: 'tool-result',
                      toolName: 'showStockFinancials',
                      toolCallId,
                      result: { symbol }
                    }
                  ]
                }
              ]
            })

            const caption = await generateCaption(
              symbol,
              'StockFinancials',
              aiState,
              mode
            )

            return (
              <BotCard>
                <div className="space-y-4">
                  <StockFinancials props={symbol} />
                  {caption && renderCaptionWithConfidence(caption)}
                </div>
              </BotCard>
            )
          }
        },
        showStockNews: {
          description:
            'This tool shows the latest news and events for a stock or cryptocurrency.',
          parameters: z.object({
            symbol: z
              .string()
              .describe(
                'The name or symbol of the stock or currency. e.g. DOGE/AAPL/USD.'
              )
          }),
          generate: async function* ({ symbol }) {
            const toolCallId = nanoid()

            aiState.done({
              ...aiState.get(),
              messages: [
                ...aiState.get().messages,
                {
                  id: nanoid(),
                  role: 'assistant',
                  content: [
                    {
                      type: 'tool-call',
                      toolName: 'showStockNews',
                      toolCallId,
                      args: { symbol }
                    }
                  ]
                },
                {
                  id: nanoid(),
                  role: 'tool',
                  content: [
                    {
                      type: 'tool-result',
                      toolName: 'showStockNews',
                      toolCallId,
                      result: { symbol }
                    }
                  ]
                }
              ]
            })

            const caption = await generateCaption(
              symbol,
              'showStockNews',
              aiState,
              mode
            )

            return (
              <BotCard>
                <div className="space-y-4">
                  <StockNews props={symbol} />
                  {caption && renderCaptionWithConfidence(caption)}
                </div>
              </BotCard>
            )
          }
        },
        showStockScreener: {
          description:
            'This tool shows a generic stock screener which can be used to find new stocks based on financial or technical parameters.',
          parameters: z.object({}).nullable(),
          generate: async function* (args = {}) {
            const toolCallId = nanoid()

            aiState.done({
              ...aiState.get(),
              messages: [
                ...aiState.get().messages,
                {
                  id: nanoid(),
                  role: 'assistant',
                  content: [
                    {
                      type: 'tool-call',
                      toolName: 'showStockScreener',
                      toolCallId,
                      args: {}
                    }
                  ]
                },
                {
                  id: nanoid(),
                  role: 'tool',
                  content: [
                    {
                      type: 'tool-result',
                      toolName: 'showStockScreener',
                      toolCallId,
                      result: {}
                    }
                  ]
                }
              ]
            })
            const caption = await generateCaption(
              'Generic',
              'showStockScreener',
              aiState
            )

            return (
              <BotCard>
                <div className="space-y-4">
                  <StockScreener />
                  {caption && renderCaptionWithConfidence(caption)}
                </div>
              </BotCard>
            )
          }
        },
        showMarketOverview: {
          description: `This tool shows an overview of today's stock, futures, bond, and forex market performance including change values, Open, High, Low, and Close values.`,
          parameters: z.object({}).nullable(),
          generate: async function* (args = {}) {
            const toolCallId = nanoid()

            aiState.done({
              ...aiState.get(),
              messages: [
                ...aiState.get().messages,
                {
                  id: nanoid(),
                  role: 'assistant',
                  content: [
                    {
                      type: 'tool-call',
                      toolName: 'showMarketOverview',
                      toolCallId,
                      args: {}
                    }
                  ]
                },
                {
                  id: nanoid(),
                  role: 'tool',
                  content: [
                    {
                      type: 'tool-result',
                      toolName: 'showMarketOverview',
                      toolCallId,
                      result: {}
                    }
                  ]
                }
              ]
            })
            const caption = await generateCaption(
              'Generic',
              'showMarketOverview',
              aiState
            )

            return (
              <BotCard>
                <div className="space-y-4">
                  <MarketOverview />
                  {caption && renderCaptionWithConfidence(caption)}
                </div>
              </BotCard>
            )
          }
        },
        showMarketHeatmap: {
          description: `This tool shows a heatmap of today's stock market performance across sectors. It is preferred over showMarketOverview if asked specifically about the stock market.`,
          parameters: z.object({}).nullable(),
          generate: async function* (args = {}) {
            const toolCallId = nanoid()

            aiState.done({
              ...aiState.get(),
              messages: [
                ...aiState.get().messages,
                {
                  id: nanoid(),
                  role: 'assistant',
                  content: [
                    {
                      type: 'tool-call',
                      toolName: 'showMarketHeatmap',
                      toolCallId,
                      args: {}
                    }
                  ]
                },
                {
                  id: nanoid(),
                  role: 'tool',
                  content: [
                    {
                      type: 'tool-result',
                      toolName: 'showMarketHeatmap',
                      toolCallId,
                      result: {}
                    }
                  ]
                }
              ]
            })
            const caption = await generateCaption(
              'Generic',
              'showMarketHeatmap',
              aiState
            )

            return (
              <BotCard>
                <div className="space-y-4">
                  <MarketHeatmap />
                  {caption && renderCaptionWithConfidence(caption)}
                </div>
              </BotCard>
            )
          }
        },
        showETFHeatmap: {
          description: `This tool shows a heatmap of today's ETF performance across sectors and asset classes. It is preferred over showMarketOverview if asked specifically about the ETF market.`,
          parameters: z.object({}).nullable(),
          generate: async function* (args = {}) {
            const toolCallId = nanoid()

            aiState.done({
              ...aiState.get(),
              messages: [
                ...aiState.get().messages,
                {
                  id: nanoid(),
                  role: 'assistant',
                  content: [
                    {
                      type: 'tool-call',
                      toolName: 'showETFHeatmap',
                      toolCallId,
                      args: {}
                    }
                  ]
                },
                {
                  id: nanoid(),
                  role: 'tool',
                  content: [
                    {
                      type: 'tool-result',
                      toolName: 'showETFHeatmap',
                      toolCallId,
                      result: {}
                    }
                  ]
                }
              ]
            })
            const caption = await generateCaption(
              'Generic',
              'showETFHeatmap',
              aiState
            )

            return (
              <BotCard>
                <div className="space-y-4">
                  <ETFHeatmap />
                  {caption && renderCaptionWithConfidence(caption)}
                </div>
              </BotCard>
            )
          }
        },
        showTrendingStocks: {
          description: `This tool shows the daily top trending stocks including the top five gaining, losing, and most active stocks based on today's performance`,
          parameters: z.object({}).nullable(),
          generate: async function* (args = {}) {
            const toolCallId = nanoid()

            aiState.done({
              ...aiState.get(),
              messages: [
                ...aiState.get().messages,
                {
                  id: nanoid(),
                  role: 'assistant',
                  content: [
                    {
                      type: 'tool-call',
                      toolName: 'showTrendingStocks',
                      toolCallId,
                      args: {}
                    }
                  ]
                },
                {
                  id: nanoid(),
                  role: 'tool',
                  content: [
                    {
                      type: 'tool-result',
                      toolName: 'showTrendingStocks',
                      toolCallId,
                      result: {}
                    }
                  ]
                }
              ]
            })
            const caption = await generateCaption(
              'Generic',
              'showTrendingStocks',
              aiState
            )

            return (
              <BotCard>
                <div className="space-y-4">
                  <MarketTrending />
                  {caption && renderCaptionWithConfidence(caption)}
                </div>
              </BotCard>
            )
          }
        }
      }
    })

    return {
      id: nanoid(),
      display: result.value
    }
  } catch (err: any) {
    // Enhanced error handling for Groq
    let errorMessage = err.message || 'An unknown error occurred'

    if (err.message?.includes('Groq API key is missing') || err.message?.includes('GROQ_API_KEY') || !GROQ_API_KEY_ENV) {
      errorMessage = 'Groq API key is missing. Pass it using the GROQ_API_KEY environment variable.'
    } else if (err.message?.includes('API key')) {
      errorMessage = `API Authentication Error: ${err.message}. Please verify your GROQ_API_KEY is correct.`
    } else if (err.message?.includes('Rate limit') || err.message?.includes('quota')) {
      errorMessage = `Rate Limit Error: ${err.message}`
    }
    
    console.error('AI Error:', err)
    
    return {
      id: nanoid(),
      display: (
        <div className="border p-4 rounded-lg bg-red-50">
          <div className="text-red-700 font-medium mb-2">Error: {errorMessage}</div>
          <div className="text-sm text-red-600 mb-2">
            Full error: {JSON.stringify(err, null, 2)}
          </div>
          <div className="text-sm text-gray-600 mt-2">
            💡 Quick fixes:
            <ul className="list-disc ml-5 mt-1">
              <li>Verify your GROQ_API_KEY in .env.local is correct</li>
              <li>Restart the dev server after changing .env.local</li>
              <li>Check if your Groq account has credits: https://console.groq.com/</li>
            </ul>
          </div>
          <a
            href="https://github.com/makhskham/Stocrates-2.0"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-sm text-red-800 hover:text-red-900"
          >
            If you think something has gone wrong, create an
            <span className="ml-1" style={{ textDecoration: 'underline' }}>
              {' '}
              issue on Github.
            </span>
          </a>
        </div>
      )
    }
  }
}

export const AI = createAI<AIState, UIState>({
  actions: {
    submitUserMessage
  },
  initialUIState: [],
  initialAIState: { chatId: nanoid(), messages: [] }
})
