'use client'

import { useEffect } from 'react'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('[Stocrates error]', error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <div className="max-w-md w-full border-2 border-stocrates-dark/20 rounded-xl p-6 bg-stocrates-cream space-y-4">
        <div>
          <p className="font-title text-sm font-bold text-stocrates-dark uppercase tracking-wide mb-1">
            Something went wrong
          </p>
          <p className="font-body text-sm text-stocrates-dark/70 leading-relaxed">
            An error occurred while processing your request. This sometimes happens due to
            a temporary API issue or an unexpected response from the AI model.
          </p>
        </div>

        {error.digest && (
          <p className="font-mono text-xs text-stocrates-dark/40 bg-stocrates-gray px-3 py-2 rounded">
            Error ID: {error.digest}
          </p>
        )}

        <div className="flex gap-3">
          <button
            onClick={reset}
            className="font-title text-sm font-bold uppercase tracking-wide px-4 py-2 bg-stocrates-dark text-stocrates-cream rounded-full hover:bg-stocrates-dark-blue transition-colors"
          >
            Try again
          </button>
          <a
            href="/new"
            className="font-title text-sm font-bold uppercase tracking-wide px-4 py-2 border-2 border-stocrates-dark text-stocrates-dark rounded-full hover:bg-stocrates-dark/5 transition-colors"
          >
            New chat
          </a>
        </div>
      </div>
    </div>
  )
}
