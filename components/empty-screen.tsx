import { UseChatHelpers } from 'ai/react'
import { Button } from '@/components/ui/button'
import { ExternalLink } from '@/components/external-link'
import { IconArrowRight } from '@/components/ui/icons'

export function EmptyScreen() {
  return (
    <div className="mx-auto max-w-2xl px-4">
      <div className="flex flex-col gap-4 decorative-border bg-background p-8 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold title">Welcome to Stocrates! 🎓📊</h1>
        <p className="text-lg body-text font-semibold text-primary">
          Learn Markets Through Historical Patterns
        </p>
        <p className="text-base body-text text-gray-700">
          I'm your educational guide to understanding how markets react to real-world events.
          Instead of making predictions, I'll show you <strong>transparent historical pattern analysis</strong> -
          teaching you how similar events played out in the past so you can learn to think critically about markets.
        </p>

        <div className="mt-2 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border-2 border-blue-200 dark:border-blue-800">
          <p className="text-sm body-text font-semibold mb-2 text-blue-900 dark:text-blue-100">
            🎯 What Makes Stocrates Different?
          </p>
          <ul className="text-sm body-text space-y-1 text-blue-800 dark:text-blue-200">
            <li>✅ <strong>Educational First</strong> - Learn concepts, not just data</li>
            <li>✅ <strong>Historical Context</strong> - See how similar events unfolded before</li>
            <li>✅ <strong>No Predictions</strong> - We teach patterns, not fortune-telling</li>
            <li>✅ <strong>Beginner Friendly</strong> - Simple explanations with analogies</li>
            <li>✅ <strong>Transparent</strong> - Clear about uncertainty and limitations</li>
          </ul>
        </div>

        <div className="mt-4 p-4 bg-accent/20 rounded-lg border-2 border-primary/20">
          <p className="text-sm body-text font-semibold mb-2">💡 Try asking educational questions:</p>
          <ul className="text-sm body-text space-y-2 text-gray-600">
            <li>• "What happens when a tech company announces a partnership?"</li>
            <li>• "Show me Tesla's chart and explain what I'm looking at"</li>
            <li>• "How do markets typically react to earnings announcements?"</li>
            <li>• "What can Apple's financials teach me about analyzing companies?"</li>
            <li>• "Show me the market heatmap and explain what it means"</li>
          </ul>
        </div>

        <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg border-2 border-yellow-300 dark:border-yellow-700">
          <p className="text-xs text-yellow-900 dark:text-yellow-100">
            <strong>⚠️ Important Educational Disclaimer:</strong>
          </p>
          <p className="text-xs text-yellow-800 dark:text-yellow-200 mt-1">
            Stocrates is a <strong>learning platform for beginners</strong>, not a financial advisor.
            All information is for educational purposes only and is NOT financial advice.
            Past performance does not guarantee future results. Always do your own research
            before making any financial decisions.
          </p>
        </div>
      </div>
    </div>
  )
}
