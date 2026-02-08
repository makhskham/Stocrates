import { UseChatHelpers } from 'ai/react'
import { Button } from '@/components/ui/button'
import { ExternalLink } from '@/components/external-link'
import { IconArrowRight } from '@/components/ui/icons'

export function EmptyScreen() {
  return (
    <div className="mx-auto max-w-2xl px-4">
      <div className="flex flex-col gap-4 decorative-border bg-background p-8 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold title">Welcome to Stocrates! 🎓</h1>
        <p className="text-base body-text text-gray-700">
          I'm here to help you learn about markets through historical patterns.
          Ask me anything about stocks, events, or market trends, and I'll show you
          how similar situations played out in the past.
        </p>
        <div className="mt-4 p-4 bg-accent/20 rounded-lg border-2 border-primary/20">
          <p className="text-sm body-text font-semibold mb-2">Try asking:</p>
          <ul className="text-sm body-text space-y-1 text-gray-600">
            <li>• "Show me a chart of AAPL"</li>
            <li>• "What happens when Tesla announces a partnership?"</li>
            <li>• "Show me the market heatmap"</li>
            <li>• "What's the price of NVDA?"</li>
          </ul>
        </div>
        <p className="text-xs text-gray-500 mt-4">
          <strong>Educational Tool:</strong> Stocrates is for learning only.
          All information is educational and not financial advice.
        </p>
      </div>
    </div>
  )
}
