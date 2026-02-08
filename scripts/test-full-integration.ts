/**
 * Full integration test - NewsAPI + Reddit + Sentiment Analysis
 * Run with: npx tsx scripts/test-full-integration.ts
 */

import { fetchStockNews, formatNewsAnalysis } from '../lib/news/news-fetcher'

async function testFullIntegration() {
  console.log('🚀 Full Integration Test: NewsAPI + Reddit + Sentiment\n')
  console.log('=' .repeat(70))
  
  const testSymbols = ['NVDA', 'TSLA', 'AAPL']
  
  for (const symbol of testSymbols) {
    console.log(`\n\n📊 Analyzing ${symbol}...\n`)
    console.log('-' .repeat(70))
    
    try {
      // Fetch comprehensive news analysis
      const analysis = await fetchStockNews(symbol, 30)
      
      // Display results
      console.log(`\n✅ Analysis Complete for ${symbol}\n`)
      
      console.log('📰 News Articles:')
      console.log(`   Total: ${analysis.articles.length}`)
      console.log(`   Positive: ${analysis.positiveCount}`)
      console.log(`   Negative: ${analysis.negativeCount}`)
      console.log(`   Neutral: ${analysis.neutralCount}`)
      console.log(`   Overall Sentiment: ${analysis.overallSentiment.toUpperCase()}`)
      
      console.log('\n📊 Sources:')
      analysis.sources.forEach(source => {
        console.log(`   • ${source}`)
      })
      
      if (analysis.redditSentiment) {
        console.log('\n🚀 Reddit Sentiment:')
        console.log(`   Sentiment: ${analysis.redditSentiment.sentiment.toUpperCase()}`)
        console.log(`   Mentions: ${analysis.redditSentiment.mentionCount}`)
        console.log(`   Avg Score: ${Math.round(analysis.redditSentiment.avgScore)}`)
        console.log(`   Weight: ${analysis.redditSentiment.weight}%`)
      } else {
        console.log('\n🚀 Reddit Sentiment: No mentions found')
      }
      
      console.log('\n📄 Top 3 Headlines:')
      analysis.articles.slice(0, 3).forEach((article, index) => {
        const sentimentEmoji = article.sentiment === 'positive' ? '📈' : 
                              article.sentiment === 'negative' ? '📉' : '➡️'
        console.log(`\n   ${index + 1}. ${sentimentEmoji} ${article.title}`)
        console.log(`      Source: ${article.source}`)
        console.log(`      Date: ${new Date(article.publishedAt).toLocaleDateString()}`)
        console.log(`      Sentiment: ${article.sentiment}`)
      })
      
      console.log('\n\n📝 Formatted Analysis (as shown to AI):\n')
      console.log('-' .repeat(70))
      const formatted = formatNewsAnalysis(analysis, symbol)
      console.log(formatted)
      console.log('-' .repeat(70))
      
      // Calculate combined confidence
      const newsConfidence = (analysis.positiveCount / analysis.articles.length) * 100
      const redditConfidence = analysis.redditSentiment 
        ? (analysis.redditSentiment.sentiment === 'bullish' ? 80 : 
           analysis.redditSentiment.sentiment === 'bearish' ? 20 : 50)
        : 50
      
      console.log('\n📊 Confidence Levels:')
      console.log(`   News Sources (75-85% weight): ${Math.round(newsConfidence)}%`)
      console.log(`   Reddit (25% weight): ${Math.round(redditConfidence)}%`)
      
      const combinedConfidence = (newsConfidence * 0.75) + (redditConfidence * 0.25)
      console.log(`   Combined Confidence: ${Math.round(combinedConfidence)}%`)
      
      console.log('\n' + '=' .repeat(70))
      
      // Wait between stocks to avoid rate limiting
      if (symbol !== testSymbols[testSymbols.length - 1]) {
        console.log('\n⏳ Waiting 3 seconds before next stock...')
        await new Promise(resolve => setTimeout(resolve, 3000))
      }
      
    } catch (error) {
      console.error(`\n❌ Error analyzing ${symbol}:`, error)
      if (error instanceof Error) {
        console.error('Error message:', error.message)
      }
    }
  }
  
  console.log('\n\n✅ Full integration test completed!\n')
  
  // Summary
  console.log('=' .repeat(70))
  console.log('\n📊 SUMMARY\n')
  console.log('This integration combines:')
  console.log('  1. ✅ NewsAPI.org - Real news from Bloomberg, Reuters, WSJ, etc.')
  console.log('  2. ✅ Reddit r/wallstreetbets - Community sentiment analysis')
  console.log('  3. ✅ Sentiment Analysis - Keyword-based positive/negative detection')
  console.log('  4. ✅ Source Weighting - Credible sources (75-85%), Social (25%)')
  console.log('  5. ✅ AI Context - All data formatted for LLM consumption')
  console.log('\n' + '=' .repeat(70))
  
  console.log('\n💡 Next Steps:')
  console.log('  1. Test in the app by asking: "Tell me about NVIDIA"')
  console.log('  2. Check that real news appears in the AI response')
  console.log('  3. Verify Reddit sentiment is included')
  console.log('  4. Confirm source weights are explained')
  console.log('\n')
}

// Run the test
console.log('Starting full integration test...\n')
testFullIntegration()
  .then(() => {
    console.log('✅ Test completed successfully')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Test failed:', error)
    process.exit(1)
  })

