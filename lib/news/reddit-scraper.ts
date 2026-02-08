/**
 * Reddit r/wallstreetbets Scraper
 * Scrapes top posts and comments for stock sentiment analysis
 */

export interface RedditPost {
  id: string
  title: string
  author: string
  score: number
  upvoteRatio: number
  numComments: number
  created: number
  url: string
  selftext: string
  flair?: string
  stockMentions: string[]
  sentiment?: 'bullish' | 'bearish' | 'neutral'
}

export interface RedditComment {
  id: string
  author: string
  body: string
  score: number
  created: number
  stockMentions: string[]
}

export interface RedditAnalysis {
  posts: RedditPost[]
  totalPosts: number
  stockMentions: Map<string, {
    count: number
    bullishCount: number
    bearishCount: number
    sentiment: 'bullish' | 'bearish' | 'neutral'
    avgScore: number
  }>
  summary: string
}

/**
 * Scrape top posts from r/wallstreetbets
 * @param limit - Number of posts to fetch (default: 1000)
 * @param timeframe - Time period: 'hour', 'day', 'week', 'month', 'year', 'all'
 */
export async function scrapeWallStreetBets(
  limit: number = 1000,
  timeframe: 'hour' | 'day' | 'week' | 'month' | 'year' | 'all' = 'week'
): Promise<RedditAnalysis> {
  try {
    const posts: RedditPost[] = []
    const batchSize = 100 // Reddit API limit
    let after: string | null = null

    // Fetch posts in batches
    for (let i = 0; i < Math.ceil(limit / batchSize); i++) {
      const batch = await fetchRedditBatch(batchSize, timeframe, after)
      posts.push(...batch.posts)
      after = batch.after

      if (!after || posts.length >= limit) break

      // Rate limiting - wait 2 seconds between requests
      await new Promise(resolve => setTimeout(resolve, 2000))
    }

    // Analyze stock mentions and sentiment
    const analysis = analyzeRedditPosts(posts.slice(0, limit))

    return analysis
  } catch (error) {
    console.error('Error scraping r/wallstreetbets:', error)
    throw error
  }
}

/**
 * Fetch a batch of posts from Reddit
 */
async function fetchRedditBatch(
  limit: number,
  timeframe: string,
  after: string | null
): Promise<{ posts: RedditPost[], after: string | null }> {
  const url = `https://www.reddit.com/r/wallstreetbets/top.json?t=${timeframe}&limit=${limit}${after ? `&after=${after}` : ''}`

  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Stocrates/1.0 (Educational Stock Analysis Tool)'
    }
  })

  if (!response.ok) {
    throw new Error(`Reddit API error: ${response.status}`)
  }

  const data = await response.json()
  const posts: RedditPost[] = data.data.children.map((child: any) => {
    const post = child.data
    return {
      id: post.id,
      title: post.title,
      author: post.author,
      score: post.score,
      upvoteRatio: post.upvote_ratio,
      numComments: post.num_comments,
      created: post.created_utc,
      url: `https://reddit.com${post.permalink}`,
      selftext: post.selftext || '',
      flair: post.link_flair_text,
      stockMentions: extractStockMentions(post.title + ' ' + post.selftext)
    }
  })

  return {
    posts,
    after: data.data.after
  }
}

/**
 * Extract stock ticker mentions from text
 */
function extractStockMentions(text: string): string[] {
  // Match $TICKER or common stock patterns
  const tickerPattern = /\$([A-Z]{1,5})\b|(?:^|\s)([A-Z]{2,5})(?:\s|$)/g
  const matches = text.matchAll(tickerPattern)
  const tickers = new Set<string>()

  for (const match of matches) {
    const ticker = match[1] || match[2]
    if (ticker && ticker.length >= 2 && ticker.length <= 5) {
      // Filter out common words that aren't tickers
      const excludeWords = ['THE', 'AND', 'FOR', 'ARE', 'BUT', 'NOT', 'YOU', 'ALL', 'CAN', 'HER', 'WAS', 'ONE', 'OUR', 'OUT', 'DAY', 'GET', 'HAS', 'HIM', 'HIS', 'HOW', 'ITS', 'MAY', 'NEW', 'NOW', 'OLD', 'SEE', 'TWO', 'WHO', 'BOY', 'DID', 'ITS', 'LET', 'PUT', 'SAY', 'SHE', 'TOO', 'USE']
      if (!excludeWords.includes(ticker)) {
        tickers.add(ticker)
      }
    }
  }

  return Array.from(tickers)
}


/**
 * Analyze sentiment of Reddit posts
 */
function analyzeSentiment(text: string): 'bullish' | 'bearish' | 'neutral' {
  const bullishKeywords = [
    'moon', 'rocket', 'calls', 'buy', 'bullish', 'long', 'yolo', 'tendies',
    'diamond hands', 'hold', 'hodl', 'to the moon', 'squeeze', 'rally',
    'breakout', 'pump', 'gains', 'profit', 'win', 'up', 'green', 'bull'
  ]

  const bearishKeywords = [
    'puts', 'short', 'bearish', 'sell', 'crash', 'dump', 'loss', 'red',
    'bear', 'down', 'fall', 'drop', 'tank', 'plunge', 'collapse', 'dead',
    'rip', 'bagholding', 'paper hands', 'rug pull', 'scam'
  ]

  const lowerText = text.toLowerCase()

  const bullishScore = bullishKeywords.filter(kw => lowerText.includes(kw)).length
  const bearishScore = bearishKeywords.filter(kw => lowerText.includes(kw)).length

  if (bullishScore > bearishScore) return 'bullish'
  if (bearishScore > bullishScore) return 'bearish'
  return 'neutral'
}

/**
 * Analyze Reddit posts for stock mentions and sentiment
 */
function analyzeRedditPosts(posts: RedditPost[]): RedditAnalysis {
  const stockMentions = new Map<string, {
    count: number
    bullishCount: number
    bearishCount: number
    sentiment: 'bullish' | 'bearish' | 'neutral'
    avgScore: number
  }>()

  // Analyze each post
  posts.forEach(post => {
    const sentiment = analyzeSentiment(post.title + ' ' + post.selftext)
    post.sentiment = sentiment

    // Track stock mentions
    post.stockMentions.forEach(ticker => {
      if (!stockMentions.has(ticker)) {
        stockMentions.set(ticker, {
          count: 0,
          bullishCount: 0,
          bearishCount: 0,
          sentiment: 'neutral',
          avgScore: 0
        })
      }

      const stats = stockMentions.get(ticker)!
      stats.count++
      stats.avgScore = (stats.avgScore * (stats.count - 1) + post.score) / stats.count

      if (sentiment === 'bullish') stats.bullishCount++
      if (sentiment === 'bearish') stats.bearishCount++
    })
  })

  // Determine overall sentiment for each stock
  stockMentions.forEach((stats, ticker) => {
    if (stats.bullishCount > stats.bearishCount) {
      stats.sentiment = 'bullish'
    } else if (stats.bearishCount > stats.bullishCount) {
      stats.sentiment = 'bearish'
    } else {
      stats.sentiment = 'neutral'
    }
  })

  // Generate summary
  const topStocks = Array.from(stockMentions.entries())
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 10)

  const summary = generateSummary(topStocks, posts.length)

  return {
    posts,
    totalPosts: posts.length,
    stockMentions,
    summary
  }
}

/**
 * Generate a summary of Reddit sentiment
 */
function generateSummary(
  topStocks: [string, any][],
  totalPosts: number
): string {
  const lines = [
    `📊 r/WallStreetBets Analysis (${totalPosts} posts)`,
    '',
    '🔥 Top Mentioned Stocks:'
  ]

  topStocks.forEach(([ticker, stats], index) => {
    const emoji = stats.sentiment === 'bullish' ? '🚀' : stats.sentiment === 'bearish' ? '📉' : '➡️'
    lines.push(
      `${index + 1}. ${emoji} $${ticker} - ${stats.count} mentions (${stats.sentiment.toUpperCase()}, avg score: ${Math.round(stats.avgScore)})`
    )
  })

  return lines.join('\n')
}

/**
 * Get Reddit sentiment for a specific stock
 */
export async function getStockSentimentFromReddit(
  symbol: string,
  limit: number = 100
): Promise<{
  sentiment: 'bullish' | 'bearish' | 'neutral'
  mentionCount: number
  avgScore: number
  topPosts: RedditPost[]
}> {
  const analysis = await scrapeWallStreetBets(limit, 'week')
  const stats = analysis.stockMentions.get(symbol)

  if (!stats) {
    return {
      sentiment: 'neutral',
      mentionCount: 0,
      avgScore: 0,
      topPosts: []
    }
  }

  const topPosts = analysis.posts
    .filter(post => post.stockMentions.includes(symbol))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)

  return {
    sentiment: stats.sentiment,
    mentionCount: stats.count,
    avgScore: stats.avgScore,
    topPosts
  }
}

