import { DecorativeFrame } from '@/components/ui/stocrates-card'

const features = [
  {
    label: 'Educational First',
    desc: 'Learn market reasoning and concepts, not just raw data points',
  },
  {
    label: 'Historical Context',
    desc: 'See exactly how similar events unfolded in the past',
  },
  {
    label: 'Pattern Over Prediction',
    desc: 'Critical thinking through patterns, not fortune-telling',
  },
  {
    label: 'Beginner Friendly',
    desc: 'Simple explanations with real-world analogies throughout',
  },
]

const examples = [
  'What happens when a tech company announces a major partnership?',
  'Show me Tesla\'s chart and explain what I\'m looking at',
  'How do markets typically react to earnings announcements?',
  'Show me the market heatmap and explain what the colors mean',
]

export function EmptyScreen() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 animate-fade-up">
      <DecorativeFrame cornerColor="blue" className="bg-stocrates-cream p-8 shadow-lg">
        <div className="flex flex-col gap-7">

          {/* Header */}
          <div>
            <p className="font-mono text-xs font-bold text-stocrates-dark-blue uppercase tracking-widest mb-3">
              Educational Financial Intelligence
            </p>
            <h1 className="font-title text-4xl font-bold text-stocrates-dark mb-2 leading-tight">
              Welcome to Stocrates.
            </h1>
            <p className="font-title text-lg text-stocrates-dark-blue">
              Proven Past, Prepared Future
            </p>
          </div>

          {/* Description */}
          <p className="font-body text-base text-stocrates-dark leading-relaxed max-w-[60ch]">
            Your educational guide to understanding how markets react to real-world events,
            using the Socratic method. Instead of making predictions, you get{' '}
            <strong className="font-semibold">transparent historical pattern analysis</strong>{' '}
            that teaches you to think critically about markets.
          </p>

          {/* Features — 2-column grid, numbered */}
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
              Start with a question:
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

          {/* Disclaimer — full border, no side-stripe */}
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
