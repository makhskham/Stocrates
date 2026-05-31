'use client'

import { DecorativeFrame } from '@/components/ui/stocrates-card'
import { useMode } from '@/lib/modes/mode-context'
import { HALAL_EMPTY_SCREEN_EXAMPLES } from '@/lib/modes/halal'

const standardFeatures = [
  { label: 'Educational First', desc: 'Learn market reasoning and concepts, not just raw data points' },
  { label: 'Historical Context', desc: 'See exactly how similar events unfolded in the past' },
  { label: 'Pattern Over Prediction', desc: 'Critical thinking through patterns, not fortune-telling' },
  { label: 'Beginner Friendly', desc: 'Simple explanations with real-world analogies throughout' },
]

const halalFeatures = [
  { label: 'Shariah Screening', desc: 'Every stock analysed against AAOIFI standards for halal compliance' },
  { label: 'Certified Sources', desc: 'References Islamicly, Zoya, DJIMI, and MSCI Islamic Indexes' },
  { label: 'Scholarly Context', desc: 'Notes where Islamic finance scholars differ on edge cases' },
  { label: 'Historical Patterns', desc: 'Educational analysis of halal sectors through market history' },
]

const standardExamples = [
  'What happens when a tech company announces a major partnership?',
  "Show me Tesla's chart and explain what I'm looking at",
  'How do markets typically react to earnings announcements?',
  'Show me the market heatmap and explain what the colors mean',
]

export function EmptyScreen() {
  const { mode } = useMode()
  const isHalal = mode === 'halal'

  const features = isHalal ? halalFeatures : standardFeatures
  const examples = isHalal ? HALAL_EMPTY_SCREEN_EXAMPLES : standardExamples

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 animate-fade-up">
      <DecorativeFrame cornerColor="blue" className="bg-stocrates-cream p-8 shadow-lg">
        <div className="flex flex-col gap-7">

          {/* Header */}
          <div>
            <p className="font-mono text-xs font-bold text-stocrates-dark-blue uppercase tracking-widest mb-3">
              {isHalal ? 'Halal / Shariah-Compliant Mode' : 'Educational Financial Intelligence'}
            </p>
            <h1 className="font-title text-4xl font-bold text-stocrates-dark mb-2 leading-tight">
              Welcome to Stocrates.
            </h1>
            <p className="font-title text-lg text-stocrates-dark-blue">
              {isHalal ? 'Learn markets the halal way.' : 'Proven Past, Prepared Future'}
            </p>
          </div>

          {/* Description */}
          <p className="font-body text-base text-stocrates-dark leading-relaxed max-w-[60ch]">
            {isHalal
              ? <>
                  Your educational guide to <strong className="font-semibold">Shariah-compliant investing</strong>.
                  Every stock analysis includes halal screening based on AAOIFI standards, referencing
                  certified sources like Islamicly, Zoya, and the Dow Jones Islamic Market Index.
                  Always verify with a certified Shariah advisor for personal decisions.
                </>
              : <>
                  Your educational guide to understanding how markets react to real-world events,
                  using the Socratic method. Instead of making predictions, you get{' '}
                  <strong className="font-semibold">transparent historical pattern analysis</strong>{' '}
                  that teaches you to think critically about markets.
                </>
            }
          </p>

          {/* Features grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {features.map((feature, i) => (
              <div
                key={i}
                className="flex gap-3 p-4 bg-stocrates-blue/20 border border-stocrates-dark/10 rounded-lg"
              >
                <span className="font-title text-xs font-bold text-stocrates-dark-blue mt-0.5 shrink-0 tabular-nums">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div>
                  <p className="font-title text-sm font-bold text-stocrates-dark">{feature.label}</p>
                  <p className="font-body text-xs text-stocrates-dark/65 mt-0.5 leading-relaxed">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Example questions */}
          <div className="p-5 bg-stocrates-gray/60 border border-stocrates-dark/12 rounded-lg">
            <p className="font-title text-xs font-bold mb-3 text-stocrates-dark uppercase tracking-wide">
              {isHalal ? 'Try these halal investing questions:' : 'Start with a question:'}
            </p>
            <ul className="font-body text-sm space-y-2.5 text-stocrates-dark/80">
              {examples.map((q, i) => (
                <li key={i} className="flex gap-2 items-start">
                  <span className="text-stocrates-dark-blue shrink-0 mt-0.5 text-base leading-none">›</span>
                  <span className="leading-relaxed">"{q}"</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Halal sources note */}
          {isHalal && (
            <div className="px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-md">
              <p className="font-body text-xs text-emerald-900 leading-relaxed">
                <strong className="font-semibold">Certified sources used for halal screening:</strong>{' '}
                Islamicly (islamicly.com), Zoya (zoya.finance), Dow Jones Islamic Market Index (S&P Global),
                MSCI Islamic Indexes, IdealRatings, FTSE Russell Islamic Index Series.
                Screening follows AAOIFI standards. Always consult a certified Shariah advisor for
                personal financial decisions.
              </p>
            </div>
          )}

          {/* Standard disclaimer */}
          <div className="px-4 py-3 bg-stocrates-gray border border-stocrates-dark/20 rounded-md">
            <p className="font-body text-xs text-stocrates-dark/65 leading-relaxed">
              <strong className="text-stocrates-dark font-semibold">Educational disclaimer:</strong>{' '}
              Stocrates is a learning platform for beginners, not a financial advisor. All content
              is for educational purposes only and is not financial advice. Past performance does
              not guarantee future results. Always do your own research before making any
              financial decisions.
            </p>
          </div>

        </div>
      </DecorativeFrame>
    </div>
  )
}
