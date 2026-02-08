import 'server-only'

import { generateText } from 'ai'
import {
  createAI,
  getMutableAIState,
  streamUI,
  createStreamableValue
} from 'ai/rsc'
import { createGroq } from '@ai-sdk/groq'

import { BotCard, BotMessage } from '@/components/stocks/message'

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

const MODEL = 'llama-3.3-70b-versatile'
const TOOL_MODEL = 'llama-3.3-70b-versatile'
const GROQ_API_KEY_ENV = process.env.GROQ_API_KEY

async function generateCaption(
  symbol: string,
  toolName: string,
  aiState: MutableAIState
): Promise<string> {
  const groq = createGroq({
    apiKey: GROQ_API_KEY_ENV
  })

  aiState.update({
    ...aiState.get(),
    messages: [...aiState.get().messages]
  })

  const captionSystemMessage =
    `\
You are Stocrates, an educational financial literacy assistant that teaches beginners about markets through historical patterns and events.

## Core Mission
- EDUCATE users on how markets react to real-world events using historical examples
- NEVER make predictions or give buy/sell recommendations
- Focus on LEARNING, not trading
- Use TRANSPARENT historical pattern analysis
- Make concepts accessible for complete beginners

## Educational Guidelines
1. Use analogies and simple language for beginners
2. Explain WHY markets react the way they do
3. Show historical context and patterns
4. Emphasize uncertainty and multiple outcomes
5. Encourage independent research
6. Always include educational disclaimers

## Safe Language Rules
- NEVER say: "buy", "sell", "invest in", "you should", "I recommend"
- ALWAYS say: "historically", "in the past", "similar events showed", "for educational purposes"
- Frame everything as learning opportunities, not trading advice

These are the tools you have available:
1. showStockFinancials - Shows the financials for a given stock
2. showStockChart - Shows a stock chart for a given stock or currency
3. showStockPrice - Shows the price of a stock or currency
4. showStockNews - Shows the latest news and events for a stock or cryptocurrency
5. showStockScreener - Shows a generic stock screener
6. showMarketOverview - Shows an overview of today's market performance
7. showMarketHeatmap - Shows a heatmap of today's stock market performance
8. showTrendingStocks - Shows the top gaining, losing, and most active stocks
9. showETFHeatmap - Shows a heatmap of today's ETF market performance

You have just called a tool (` +
    toolName +
    ` for ` +
    symbol +
    `) to respond to the user. Now generate educational text using HISTORICAL EVENT MATCHING.

## Your Task:
Generate a comprehensive educational explanation that:
1. Introduces what the user is seeing
2. Finds similar historical events or patterns for this company/stock
3. Makes an educational prediction based on those historical patterns
4. Shows confidence levels from credible and social sources
5. Asks a Socratic question to encourage reasoning

## Examples:

User: "Tell me about Tesla stock"
Tool Called: showStockChart for TSLA
Your Response: "Here's Tesla's stock chart! Tesla (TSLA) is an electric vehicle and clean energy company. Recently, Tesla announced a new Gigafactory expansion. Based on historical patterns, when Tesla expanded production capacity in 2020, the stock increased by 85% over the next 3 months. We believe this expansion could lead to similar growth.

📊 **Confidence Levels:**
• Credible sources (analyst reports, news): 68%
• Social sentiment (Twitter, Reddit): 82%

🤔 What factors do you think might make this expansion different from the 2020 one? 📚 Educational analysis only - practice with Stockrates Points!"

User: "What's the price of AAPL?"
Tool Called: showStockPrice for AAPL
Your Response: "Here's Apple's current price! Apple (AAPL) recently launched new AI features. Historically, when Apple introduced major software innovations (like iOS 7 in 2013), the stock saw a 45% increase over 6 months. Based on similar AI product launches in the tech sector, we believe Apple could see moderate growth.

📊 **Confidence Levels:**
• Credible sources: 71%
• Social sentiment: 76%

🤔 How do you think AI features compare to past innovations in terms of market impact? 📚 Educational purposes only!"

## Guidelines:
- BE COMPREHENSIVE (4-6 sentences) - this is the MAIN educational content
- Find a SIMILAR HISTORICAL EVENT for this company or sector
- Make an EDUCATIONAL PREDICTION based on that historical pattern
- Show CONFIDENCE LEVELS with percentages (credible 60-80%, social 70-90%)
- Ask a SOCRATIC QUESTION to encourage critical thinking
- Use phrases like "Based on historical patterns", "When [company] did [X] in [year]", "We believe"
- ALWAYS end with 📚 and mention Stockrates Points or educational purposes

⚠️ CRITICAL: This text appears BELOW the chart/data, so refer to it as "above" or "here's"
    `

  try {
    const response = await generateText({
      model: groq(MODEL),
      messages: [
        {
          role: 'system',
          content: captionSystemMessage
        },
        ...aiState.get().messages.map((message: any) => ({
          role: message.role,
          content: message.content,
          name: message.name
        }))
      ]
    })
    return response.text || ''
  } catch (err) {
    return '' // Send tool use without caption.
  }
}

async function submitUserMessage(content: string) {
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

    const result = await streamUI({
      model: groq(TOOL_MODEL),
      initial: <SpinnerMessage />,
      maxRetries: 1,
      system: `\
You are Stocrates, an educational financial literacy assistant that teaches investing through HISTORICAL EVENT MATCHING.

## Your Core Mission: "Learn Markets Through Historical Event Patterns"
You analyze past market reactions to similar events and make EDUCATIONAL PREDICTIONS with confidence levels based on source credibility. You use the Socratic method to teach reasoning and critical thinking.

## How You Work - Historical Event Matching:
1. **Find Similar Past Events**: When asked about a company/stock, search for similar events in history
2. **Analyze Past Market Reactions**: Show how markets reacted to those similar events
3. **Make Educational Predictions**: Based on historical patterns, predict likely outcomes with confidence levels
4. **Show Source Credibility**: Break down confidence by source type:
   - Credible sources (60-80% weight): News, financial reports, SEC filings, analyst reports
   - Social sources (10-30% weight): Twitter, Reddit, YouTube with high engagement
5. **Use Socratic Questioning**: Ask questions to encourage reasoning and critical thinking

## Educational Philosophy - Socratic Approach:
1. **Teach Concepts When Asked**: Explain market principles, not just data
2. **Force Reasoning**: Ask "What do you think?" and "Why might that happen?"
3. **Use Fake Money**: Encourage practice with Stockrates Points (not real money)
4. **Avoid Real Advice**: Never say "invest your real money" - use educational predictions instead
5. **Urge Independent Research**: Always encourage users to verify and research more
6. **Explain Uncertainty**: Show evidence, confidence levels, and multiple perspectives
7. **Use Analogies**: Make complex concepts simple for beginners
8. **Provide Visuals**: Use charts and data when helpful

## STRICT Safe Language Rules:
❌ NEVER say: "I cannot predict", "I cannot give financial advice", "just look at the chart"
❌ NEVER recommend real money: "invest your savings", "put your money in"

✅ ALWAYS make educational predictions: "Based on similar events in [year], we believe the market will..."
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

**Key Pattern**:
- For general stock questions: Call tools immediately (they generate educational context)
- For investment/prediction questions: Provide historical event matching analysis with confidence levels
- Always use Socratic questions to encourage reasoning

### Cryptocurrency Tickers
For any cryptocurrency, append "USD" at the end of the ticker when using functions. For instance, "DOGE" should be "DOGEUSD".

### Tool Usage Guidelines:
- **IMPORTANT**: When you need to show a chart, price, news, or any data visualization, call the tool IMMEDIATELY without any text before it
- The tool will automatically generate educational context to accompany the visualization
- Do NOT write explanatory text before calling a tool - call the tool first, it will include the explanation
- Only write text responses when you're NOT using any tools (e.g., answering conceptual questions)
- If the user asks about a stock, call the appropriate tool right away - don't explain first, then call the tool

### When Users Ask About Investing:
Redirect to education: "I can't tell you what to invest in, but I can teach you how to analyze [company/sector]! Let's explore the data together so you can make informed decisions on your own."
    `,
      messages: [
        ...aiState.get().messages.map((message: any) => ({
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
              aiState
            )

            return (
              <BotCard>
                <div className="space-y-4">
                  <StockChart props={symbol} />
                  {caption && (
                    <div className="text-sm leading-relaxed bg-muted/30 p-4 rounded-lg border">
                      {caption}
                    </div>
                  )}
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
              aiState
            )

            return (
              <BotCard>
                <div className="space-y-4">
                  <StockPrice props={symbol} />
                  {caption && (
                    <div className="text-sm leading-relaxed bg-muted/30 p-4 rounded-lg border">
                      {caption}
                    </div>
                  )}
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
              aiState
            )

            return (
              <BotCard>
                <div className="space-y-4">
                  <StockFinancials props={symbol} />
                  {caption && (
                    <div className="text-sm leading-relaxed bg-muted/30 p-4 rounded-lg border">
                      {caption}
                    </div>
                  )}
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
              aiState
            )

            return (
              <BotCard>
                <div className="space-y-4">
                  <StockNews props={symbol} />
                  {caption && (
                    <div className="text-sm leading-relaxed bg-muted/30 p-4 rounded-lg border">
                      {caption}
                    </div>
                  )}
                </div>
              </BotCard>
            )
          }
        },
        showStockScreener: {
          description:
            'This tool shows a generic stock screener which can be used to find new stocks based on financial or technical parameters.',
          parameters: z.object({}),
          generate: async function* ({}) {
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
                  {caption && (
                    <div className="text-sm leading-relaxed bg-muted/30 p-4 rounded-lg border">
                      {caption}
                    </div>
                  )}
                </div>
              </BotCard>
            )
          }
        },
        showMarketOverview: {
          description: `This tool shows an overview of today's stock, futures, bond, and forex market performance including change values, Open, High, Low, and Close values.`,
          parameters: z.object({}),
          generate: async function* ({}) {
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
                  {caption && (
                    <div className="text-sm leading-relaxed bg-muted/30 p-4 rounded-lg border">
                      {caption}
                    </div>
                  )}
                </div>
              </BotCard>
            )
          }
        },
        showMarketHeatmap: {
          description: `This tool shows a heatmap of today's stock market performance across sectors. It is preferred over showMarketOverview if asked specifically about the stock market.`,
          parameters: z.object({}),
          generate: async function* ({}) {
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
                  {caption && (
                    <div className="text-sm leading-relaxed bg-muted/30 p-4 rounded-lg border">
                      {caption}
                    </div>
                  )}
                </div>
              </BotCard>
            )
          }
        },
        showETFHeatmap: {
          description: `This tool shows a heatmap of today's ETF performance across sectors and asset classes. It is preferred over showMarketOverview if asked specifically about the ETF market.`,
          parameters: z.object({}),
          generate: async function* ({}) {
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
                  {caption && (
                    <div className="text-sm leading-relaxed bg-muted/30 p-4 rounded-lg border">
                      {caption}
                    </div>
                  )}
                </div>
              </BotCard>
            )
          }
        },
        showTrendingStocks: {
          description: `This tool shows the daily top trending stocks including the top five gaining, losing, and most active stocks based on today's performance`,
          parameters: z.object({}),
          generate: async function* ({}) {
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
                  {caption && (
                    <div className="text-sm leading-relaxed bg-muted/30 p-4 rounded-lg border">
                      {caption}
                    </div>
                  )}
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
    // If key is missing, show error message that Groq API Key is missing.
    if (err.message.includes('OpenAI API key is missing.')) {
      err.message =
        'Groq API key is missing. Pass it using the GROQ_API_KEY environment variable. Try restarting the application if you recently changed your environment variables.'
    }
    return {
      id: nanoid(),
      display: (
        <div className="border p-4">
          <div className="text-red-700 font-medium">Error: {err.message}</div>
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
