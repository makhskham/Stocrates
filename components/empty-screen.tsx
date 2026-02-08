import { UseChatHelpers } from 'ai/react'
import { DecorativeFrame } from '@/components/ui/stocrates-card'

export function EmptyScreen() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <DecorativeFrame cornerColor="blue" className="bg-stocrates-cream p-8 shadow-lg">
        <div className="flex flex-col gap-6">
          <div>
            <h1 className="font-title text-4xl font-bold text-stocrates-dark mb-2">
              Welcome to Stocrates!
            </h1>
            <p className="font-title text-xl text-stocrates-dark-blue">
              Proven Past, Prepared Future
            </p>
          </div>

          <p className="font-body text-base text-stocrates-dark leading-relaxed">
            I'm your educational guide to understanding how markets react to real-world events using the Socratic method.
            Instead of making predictions, I'll show you <strong>transparent historical pattern analysis</strong> -
            teaching you how similar events played out in the past so you can learn to think critically about markets.
          </p>

          <div className="p-5 bg-stocrates-blue border-3 border-stocrates-dark rounded-lg">
            <p className="font-title text-sm font-bold mb-3 text-stocrates-dark">
              What Makes Stocrates Different?
            </p>
            <ul className="font-body text-sm space-y-2 text-stocrates-dark">
              <li>✅ <strong>Educational First</strong> - Learn concepts, not just data</li>
              <li>✅ <strong>Historical Context</strong> - See how similar events unfolded before</li>
              <li>✅ <strong>No Predictions</strong> - We teach patterns, not fortune-telling</li>
              <li>✅ <strong>Beginner Friendly</strong> - Simple explanations with analogies</li>
              <li>✅ <strong>Transparent</strong> - Clear about uncertainty and limitations</li>
            </ul>
          </div>

          <div className="p-5 bg-stocrates-gray border-2 border-stocrates-dark rounded-lg">
            <p className="font-title text-sm font-bold mb-3 text-stocrates-dark">
              Try asking educational questions:
            </p>
            <ul className="font-body text-sm space-y-2 text-stocrates-dark">
              <li>• "What happens when a tech company announces a partnership?"</li>
              <li>• "Show me Tesla's chart and explain what I'm looking at"</li>
              <li>• "How do markets typically react to earnings announcements?"</li>
              <li>• "What can Apple's financials teach me about analyzing companies?"</li>
              <li>• "Show me the market heatmap and explain what it means"</li>
            </ul>
          </div>

          <div className="info-box">
            <p className="font-body text-xs text-stocrates-dark">
              <strong>⚠️ Important Educational Disclaimer:</strong>
            </p>
            <p className="font-body text-xs text-stocrates-dark mt-2">
              Stocrates is a <strong>learning platform for beginners</strong>, not a financial advisor.
              All information is for educational purposes only and is NOT financial advice.
              Past performance does not guarantee future results. Always do your own research
              before making any financial decisions.
            </p>
          </div>
        </div>
      </DecorativeFrame>
    </div>
  )
}
