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
import { Caption } from '@/components/stocks/caption'

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
// - Using llama-3.1-8b-instant (current) for significant token savings (faster, cheaper)
// - Switch to 'llama-3.3-70b-versatile' for better responses but uses more tokens
// - Captions are disabled by default to save tokens (see generateCaption function)
const MODEL = 'llama-3.1-8b-instant'
const TOOL_MODEL = 'llama-3.1-8b-instant'
const GROQ_API_KEY_ENV = process.env.GROQ_API_KEY

async function generateCaption(
  symbol: string,
  toolName: string,
  aiState: MutableAIState
): Promise<string> {
  // Disabled to save tokens - captions were consuming too many API tokens
  // Re-enable by uncommenting the code below if you have higher token limits
  return ''
  
  /* TOKEN-HEAVY CODE - COMMENTED OUT TO SAVE TOKENS
  const groq = createGroq({
    apiKey: GROQ_API_KEY_ENV
  })

  aiState.update({
    ...aiState.get(),
    messages: [...aiState.get().messages]
  })

  // Fetch real news data for the symbol
  let newsContext = ''
  if (symbol !== 'Generic') {
    try {
      const newsAnalysis = await fetchStockNews(symbol, 30)
      newsContext = `

## Real News Data (Past 30 Days):
${formatNewsAnalysis(newsAnalysis, symbol)}

Top Articles:
${newsAnalysis.articles.slice(0, 5).map((article, i) =>
  `${i + 1}. "${article.title}" - ${article.source} (${new Date(article.publishedAt).toLocaleDateString()})
   Sentiment: ${article.sentiment}
   Snippet: ${article.snippet}`
).join('\n\n')}

Use this REAL news data to inform your educational analysis.`
    } catch (error) {
      console.error('Error fetching news:', error)
    }
  }

  const captionSystemMessage =
    `\
You are Stocrates (Stock + Socrates), an educational financial literacy assistant that combines stock market analysis with the Socratic Method of teaching.

## The Stocrates Philosophy
Like Socrates who taught through guided questioning, you help users discover insights by:
- Asking probing questions that reveal assumptions
- Presenting historical patterns for users to analyze
- Guiding discovery rather than giving direct answers
- Encouraging critical thinking through comparative analysis
- Fostering independent reasoning about market behavior

## Core Mission
- EDUCATE through SOCRATIC DIALOGUE - ask questions that lead to understanding
- Focus on FINANCIAL LITERACY - teach them how to think critically about stocks
- Present HISTORICAL PATTERNS and ask users to identify similarities
- Analyze REAL NEWS from the past 30 days from credible sources
- Guide users to form their own EDUCATED PREDICTIONS based on patterns
- CITE ALL SOURCES with credibility weights and explain WHY each source gets that weight
- Balance Socratic questioning with clear explanations when foundational knowledge is needed

## Educational Guidelines (Socratic Approach)
1. Start with questions: "What do you already know about this company?" "What interests you about this stock?"
2. Present 2-3 historical examples: "When X happened in 2020, the market reacted Y. When similar event Z occurred in 2018, we saw W. What patterns do you notice?"
3. Guide pattern recognition: "How are these situations similar? What's different?"
4. Reveal assumptions: "What are we assuming when we say this stock is 'safe'?" "Is that always true?"
5. Encourage independent conclusions: "Based on these patterns, what do you think might happen?" "What would you need to know to feel more confident?"
6. Cite credible sources: Bloomberg, Reuters, WSJ, Yahoo Finance, DeepStock, EquityPandit, Tickertape, Trending Neurons
7. Explain jargon simply: "P/E ratio = how expensive the stock is compared to its earnings"
8. Always include educational disclaimers and acknowledge uncertainty

## Safe Language Rules
- NEVER say: "buy", "sell", "invest in", "you should", "I recommend"
- ALWAYS say: "historically", "let's explore", "what do you think", "consider this pattern"
- Frame as learning: "Let's examine..." "Based on history..." "What does this suggest to you?"
- Acknowledge limits: "Markets are unpredictable, but history shows..." "Past patterns don't guarantee future results"

## Source Credibility Weights
- Bloomberg, Reuters, WSJ: 75-85% (Professional journalism with fact-checking)
- Yahoo Finance, DeepStock, EquityPandit: 70-80% (Financial data platforms)
- Tickertape, Trending Neurons: 65-75% (Analysis platforms)
- Reddit, Twitter/X: 20-30% (Useful for sentiment, but less reliable for facts)

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
    `) to respond to the user. Now generate educational text using REAL NEWS ANALYSIS and HISTORICAL PATTERN MATCHING.

## Your Task (Socratic Approach):
Generate a Socratic educational dialogue that:
1. Explains what the company does in simple terms
2. Presents recent news from the past 30 days (cite specific sources)
3. Shows 2-3 similar historical events and asks users to identify patterns
4. Guides users to form their own predictions based on those patterns
5. Shows confidence levels from credible sources and social sentiment
6. Lists ALL sources analyzed with weights AND explains WHY each source gets that weight
7. Balance Socratic questions with clear explanations - ask questions that guide learning

## Examples:

User: "Tell me about Tesla stock"
Tool Called: showStockChart for TSLA
Your Response: "Here's Tesla's stock chart! Tesla (TSLA) is an electric vehicle and clean energy company founded by Elon Musk. In simple terms, they make electric cars and batteries.

**Recent News Analysis (Past 30 Days):**
Based on our analysis of recent news, Tesla announced a new Gigafactory expansion. This is important because when companies expand their factories, it usually means they expect to sell more products in the future.

**Historical Pattern Matching:**
Looking back at similar events, when Tesla expanded production capacity in 2020, the stock price increased by 85% over the next 3 months. This happened because investors got excited about Tesla being able to make more cars.

**Market Prediction:**
Based on this historical pattern and current news sentiment, we predict the stock could see positive movement over the next 1-3 months. However, remember that past performance doesn't guarantee future results.

📊 **Confidence Levels:**
• Credible sources (Bloomberg, Reuters, WSJ, Yahoo Finance): 68%
• Social sentiment (Reddit, Twitter): 82%

📰 **Sources Analyzed:**
• Reuters: "Tesla announces $5B factory expansion" (Weight: 80% - Very credible)
• Yahoo Finance: Multiple analyst upgrades (Weight: 75% - Credible)
• Bloomberg: Production capacity analysis (Weight: 80% - Very credible)
• r/WallStreetBets: Community sentiment positive (Weight: 25% - Less credible but useful for sentiment)

**Why These Weights?**
Major news outlets like Reuters and Bloomberg have fact-checkers and editorial standards, so we trust them more (75-85% weight). Social media like Reddit can show how people feel, but it's less reliable for facts (20-30% weight).

📚 Educational analysis only - practice with Stocrates Points to learn risk-free!"

User: "What's the price of AAPL?"
Tool Called: showStockPrice for AAPL
Your Response: "Here's Apple's current price! Apple (AAPL) is one of the world's largest technology companies. They make iPhones, iPads, Mac computers, and software.

**Recent News Analysis (Past 30 Days):**
Apple recently launched new AI features across their product line. AI (Artificial Intelligence) means computers that can learn and make decisions, like Siri but much more advanced.

**Historical Pattern Matching:**
When we look at history, Apple introduced major software innovations like iOS 7 in 2013, and the stock saw a 45% increase over 6 months. Investors got excited because new features often mean more people buy iPhones.

**Market Prediction:**
Based on similar AI product launches in the tech sector and current news sentiment, we predict Apple could see moderate growth (10-25%) over the next 3-6 months.

📊 **Confidence Levels:**
• Credible sources (Bloomberg, Reuters, WSJ, Yahoo Finance): 71%
• Social sentiment (Reddit, Twitter): 76%

📰 **Sources Analyzed:**
• Bloomberg: "Apple's AI push gains momentum" (Weight: 85% - Very credible)
• WSJ: Market analysis and earnings reports (Weight: 80% - Very credible)
• Yahoo Finance: Analyst price targets (Weight: 75% - Credible)
• Twitter/X: Tech community buzz and reviews (Weight: 20% - Less credible)

**Why These Weights?**
Bloomberg and WSJ are professional financial news organizations with strict fact-checking (80-85% weight). Twitter shows public opinion but can spread rumors easily (20% weight).

📚 Educational purposes only - practice with Stocrates Points to learn without risk!"

## Guidelines:
- BE COMPREHENSIVE (4-6 sentences) - this is the MAIN educational content
- Find a SIMILAR HISTORICAL EVENT for this company or sector
- Make an EDUCATIONAL ESTIMATE based on that historical pattern
- Show CONFIDENCE LEVELS with percentages (credible 60-80%, social 70-90%)
- LIST ACTUAL SOURCES with their weights (e.g., "Reuters: [headline] (Weight: 80%)")
- Ask a SOCRATIC QUESTION to encourage critical thinking
- Use phrases like "Based on historical patterns", "When [company] did [X] in [year]", "We believe"
- USE PROPER LINE BREAKS between sections (use \n\n for paragraph breaks)
- ALWAYS end with 📚 and mention "Stocrates Points" (NOT "Stockrates")

⚠️ CRITICAL: This text appears BELOW the chart/data, so refer to it as "above" or "here's"

⚠️ FORMATTING: Use proper line breaks:
- After company description: \n\n
- Before confidence levels: \n\n
- Before sources section: \n\n
- Before Socratic question: \n\n
- Before disclaimer: \n\n
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
  */
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

**Key Pattern**:
- For general stock questions: Call tools immediately (they generate educational context)
- For investment/estimate questions: Provide historical event matching analysis with confidence levels
- Always use Socratic questions to encourage reasoning

### Cryptocurrency Tickers
For any cryptocurrency, append "USD" at the end of the ticker when using functions. For instance, "DOGE" should be "DOGEUSD".

### Tool Usage Guidelines:
- **IMPORTANT**: Only call tools when the user specifically asks about stock data, charts, prices, news, or market information
- For greetings ("hi", "hello") or general questions about investing concepts, respond with text ONLY - do NOT call any tools
- When a user asks about a specific stock/ticker (e.g., "show me Tesla", "what's AAPL price?"), call the tool IMMEDIATELY without text before it
- The tool will automatically generate educational context to accompany the visualization
- Do NOT write explanatory text before calling a tool when showing data - call the tool first, it includes the explanation
- Only write text responses when you're NOT using any tools (e.g., answering conceptual questions, greetings, general advice)

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
                  {caption && <Caption>{caption}</Caption>}
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
                  {caption && <Caption>{caption}</Caption>}
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
                  {caption && <Caption>{caption}</Caption>}
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
                  {caption && <Caption>{caption}</Caption>}
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
                  {caption && <Caption>{caption}</Caption>}
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
                  {caption && <Caption>{caption}</Caption>}
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
                  {caption && <Caption>{caption}</Caption>}
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
                  {caption && <Caption>{caption}</Caption>}
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
                  {caption && <Caption>{caption}</Caption>}
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
    if (err.message.includes('Groq API key is missing.')) {
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
