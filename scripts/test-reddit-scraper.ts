/**
 * Test script for Reddit scraper
 * Run with: npx tsx scripts/test-reddit-scraper.ts
 */

import { scrapeWallStreetBets, getStockSentimentFromReddit } from '../lib/news/reddit-scraper'

async function testRedditScraper() {
  console.log('🚀 Testing Reddit r/wallstreetbets Scraper\n')
  console.log('=' .repeat(60))
  
  try {
    // Test 1: Scrape top 100 posts
    console.log('\n📊 Test 1: Scraping top 100 posts from past week...\n')
    const analysis = await scrapeWallStreetBets(100, 'week')
    
    console.log(`✅ Successfully scraped ${analysis.totalPosts} posts`)
    console.log(`📈 Found ${analysis.stockMentions.size} unique stock mentions\n`)
    
    // Display summary
    console.log(analysis.summary)
    console.log('\n' + '=' .repeat(60))
    
    // Test 2: Get sentiment for specific stocks
    console.log('\n📊 Test 2: Getting sentiment for specific stocks...\n')
    
    const testStocks = ['NVDA', 'TSLA', 'AAPL', 'GME', 'AMC']
    
    for (const symbol of testStocks) {
      try {
        const sentiment = await getStockSentimentFromReddit(symbol, 100)
        
        if (sentiment.mentionCount > 0) {
          const emoji = sentiment.sentiment === 'bullish' ? '🚀' : 
                       sentiment.sentiment === 'bearish' ? '📉' : '➡️'
          
          console.log(`${emoji} $${symbol}:`)
          console.log(`   Sentiment: ${sentiment.sentiment.toUpperCase()}`)
          console.log(`   Mentions: ${sentiment.mentionCount}`)
          console.log(`   Avg Score: ${Math.round(sentiment.avgScore)}`)
          
          if (sentiment.topPosts.length > 0) {
            console.log(`   Top Post: "${sentiment.topPosts[0].title.substring(0, 60)}..."`)
          }
          console.log('')
        } else {
          console.log(`❌ $${symbol}: No mentions found\n`)
        }
      } catch (error) {
        console.error(`Error fetching ${symbol}:`, error)
      }
    }
    
    console.log('=' .repeat(60))
    
    // Test 3: Display detailed stock mention data
    console.log('\n📊 Test 3: Detailed Stock Mention Analysis\n')
    
    const topStocks = Array.from(analysis.stockMentions.entries())
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 5)
    
    topStocks.forEach(([ticker, stats]) => {
      console.log(`\n$${ticker}:`)
      console.log(`  Total Mentions: ${stats.count}`)
      console.log(`  Bullish Posts: ${stats.bullishCount}`)
      console.log(`  Bearish Posts: ${stats.bearishCount}`)
      console.log(`  Overall Sentiment: ${stats.sentiment.toUpperCase()}`)
      console.log(`  Average Score: ${Math.round(stats.avgScore)}`)
    })
    
    console.log('\n' + '=' .repeat(60))
    
    // Test 4: Sample posts
    console.log('\n📊 Test 4: Sample Posts\n')
    
    const samplePosts = analysis.posts.slice(0, 3)
    samplePosts.forEach((post, index) => {
      console.log(`\nPost ${index + 1}:`)
      console.log(`  Title: ${post.title}`)
      console.log(`  Author: u/${post.author}`)
      console.log(`  Score: ${post.score} (${Math.round(post.upvoteRatio * 100)}% upvoted)`)
      console.log(`  Comments: ${post.numComments}`)
      console.log(`  Sentiment: ${post.sentiment}`)
      console.log(`  Stock Mentions: ${post.stockMentions.join(', ') || 'None'}`)
      console.log(`  URL: ${post.url}`)
    })
    
    console.log('\n' + '=' .repeat(60))
    console.log('\n✅ All tests completed successfully!\n')
    
    // Export data to JSON
    const exportData = {
      totalPosts: analysis.totalPosts,
      uniqueStocks: analysis.stockMentions.size,
      topStocks: Array.from(analysis.stockMentions.entries())
        .sort((a, b) => b[1].count - a[1].count)
        .slice(0, 20)
        .map(([ticker, stats]) => ({
          ticker,
          ...stats
        })),
      summary: analysis.summary
    }
    
    console.log('\n📄 Export Data (JSON):')
    console.log(JSON.stringify(exportData, null, 2))
    
  } catch (error) {
    console.error('❌ Error during testing:', error)
    if (error instanceof Error) {
      console.error('Error message:', error.message)
      console.error('Stack trace:', error.stack)
    }
  }
}

// Run the test
console.log('Starting Reddit scraper test...\n')
testRedditScraper()
  .then(() => {
    console.log('\n✅ Test script completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Test script failed:', error)
    process.exit(1)
  })

