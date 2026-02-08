/**
 * Test script for NewsAPI integration
 * Run with: npx tsx scripts/test-newsapi.ts
 */

import { fetchNewsFromNewsAPI, fetchTopBusinessNews, getCompanyName } from '../lib/news/newsapi-fetcher'

async function testNewsAPI() {
  console.log('📰 Testing NewsAPI.org Integration\n')
  console.log('=' .repeat(60))
  
  try {
    // Test 1: Fetch news for NVIDIA
    console.log('\n📊 Test 1: Fetching news for NVIDIA (NVDA)...\n')
    
    const symbol = 'NVDA'
    const companyName = getCompanyName(symbol)
    console.log(`Company Name: ${companyName}`)
    
    const articles = await fetchNewsFromNewsAPI(symbol, companyName, 30)
    
    console.log(`✅ Found ${articles.length} articles from the past 30 days\n`)
    
    if (articles.length > 0) {
      console.log('📄 Sample Articles:\n')
      articles.slice(0, 5).forEach((article, index) => {
        console.log(`${index + 1}. ${article.title}`)
        console.log(`   Source: ${article.source}`)
        console.log(`   Published: ${new Date(article.publishedAt).toLocaleDateString()}`)
        console.log(`   URL: ${article.url}`)
        console.log(`   Snippet: ${article.snippet.substring(0, 100)}...`)
        console.log('')
      })
    } else {
      console.log('⚠️  No articles found. This could mean:')
      console.log('   - NewsAPI free tier limit reached (100 requests/day)')
      console.log('   - No recent news for this stock')
      console.log('   - API key issue')
    }
    
    console.log('=' .repeat(60))
    
    // Test 2: Fetch top business headlines
    console.log('\n📊 Test 2: Fetching top business headlines...\n')
    
    const headlines = await fetchTopBusinessNews('us', 10)
    
    console.log(`✅ Found ${headlines.length} top business headlines\n`)
    
    if (headlines.length > 0) {
      console.log('📰 Top Headlines:\n')
      headlines.forEach((article, index) => {
        console.log(`${index + 1}. ${article.title}`)
        console.log(`   Source: ${article.source}`)
        console.log(`   Published: ${new Date(article.publishedAt).toLocaleDateString()}`)
        console.log('')
      })
    }
    
    console.log('=' .repeat(60))
    
    // Test 3: Test multiple stocks
    console.log('\n📊 Test 3: Testing multiple stocks...\n')
    
    const testStocks = [
      { symbol: 'AAPL', name: 'Apple' },
      { symbol: 'TSLA', name: 'Tesla' },
      { symbol: 'MSFT', name: 'Microsoft' }
    ]
    
    for (const stock of testStocks) {
      const stockArticles = await fetchNewsFromNewsAPI(stock.symbol, stock.name, 7)
      console.log(`${stock.symbol} (${stock.name}): ${stockArticles.length} articles in past 7 days`)
      
      // Wait 1 second between requests to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
    
    console.log('\n' + '=' .repeat(60))
    
    // Test 4: Source distribution
    console.log('\n📊 Test 4: Source Distribution Analysis\n')
    
    const sourceCounts = new Map<string, number>()
    articles.forEach(article => {
      const count = sourceCounts.get(article.source) || 0
      sourceCounts.set(article.source, count + 1)
    })
    
    console.log('Articles by Source:')
    Array.from(sourceCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .forEach(([source, count]) => {
        console.log(`  ${source}: ${count} articles`)
      })
    
    console.log('\n' + '=' .repeat(60))
    console.log('\n✅ All tests completed successfully!\n')
    
    // Export summary
    const summary = {
      totalArticles: articles.length,
      dateRange: '30 days',
      sources: Array.from(sourceCounts.keys()),
      sampleArticles: articles.slice(0, 3).map(a => ({
        title: a.title,
        source: a.source,
        publishedAt: a.publishedAt,
        url: a.url
      }))
    }
    
    console.log('\n📄 Summary (JSON):')
    console.log(JSON.stringify(summary, null, 2))
    
  } catch (error) {
    console.error('❌ Error during testing:', error)
    if (error instanceof Error) {
      console.error('Error message:', error.message)
      console.error('Stack trace:', error.stack)
    }
  }
}

// Run the test
console.log('Starting NewsAPI test...\n')
testNewsAPI()
  .then(() => {
    console.log('\n✅ Test script completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Test script failed:', error)
    process.exit(1)
  })

