'use client'
import * as React from 'react'
import Textarea from 'react-textarea-autosize'
import { useActions, useUIState } from 'ai/rsc'
import { UserMessage } from './stocks/message'
import { type AI } from '@/lib/chat/actions'
import { Button } from '@/components/ui/button'
import { IconArrowElbow, IconPlus } from '@/components/ui/icons'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip'
import { useEnterSubmit } from '@/lib/hooks/use-enter-submit'
import { nanoid } from 'nanoid'
import { useRouter } from 'next/navigation'
import { useLocalStorage } from '@/lib/hooks/use-local-storage'
import { useMode } from '@/lib/modes/mode-context'
import { Square } from 'lucide-react'

// Follow-up question suggestions keyed to the last tool called
const FOLLOW_UPS: Record<string, string[]> = {
  showStockChart:    ['Show the financials', 'Show the latest news', 'How did it react to last earnings?'],
  showStockPrice:    ['Show the full chart', 'Compare to the sector', 'What do the financials look like?'],
  showStockNews:     ['Show the chart', 'How have similar news events affected this stock historically?', 'Show the financials'],
  showStockFinancials: ['Show the chart', 'How does this compare to competitors?', 'What does a healthy P/E ratio look like?'],
  showMarketOverview:  ['Show the market heatmap', 'Which sectors are outperforming?', 'Show trending stocks'],
  showMarketHeatmap:   ['Explain what these colors mean', 'Which sector looks interesting and why?', 'Show trending stocks'],
  showTrendingStocks:  ['Show me the chart for the top gainer', 'Why do stocks trend up or down?', 'Show the market overview'],
  showETFHeatmap:      ['What is an ETF?', 'Show the market heatmap', 'Which ETFs are Shariah-compliant?'],
  showStockScreener:   ['Explain P/E ratio', 'What metrics matter most for value investing?', 'Show the market heatmap'],
  default:             ['What moves stock prices?', 'Explain market cap', 'Show me the market overview'],
}

export function PromptForm({
  input,
  setInput,
  isLoading,
  onStop,
  lastTool,
}: {
  input: string
  setInput: (value: string) => void
  isLoading?: boolean
  onStop?: () => void
  lastTool?: string
}) {
  const router = useRouter()
  const { formRef, onKeyDown } = useEnterSubmit()
  const inputRef = React.useRef<HTMLTextAreaElement>(null)
  const { submitUserMessage } = useActions()
  const [_, setMessages] = useUIState<typeof AI>()
  const [apiKey] = useLocalStorage('groqKey', '')
  const [isMounted, setIsMounted] = React.useState(false)
  const { mode } = useMode()

  React.useEffect(() => {
    setIsMounted(true)
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  if (!isMounted) return null

  // Pick suggestions based on the last tool called
  const suggestions = FOLLOW_UPS[lastTool ?? ''] ?? FOLLOW_UPS.default

  const handleSuggestion = async (question: string) => {
    setMessages(currentMessages => [
      ...currentMessages,
      { id: nanoid(), display: <UserMessage>{question}</UserMessage> }
    ])
    const responseMessage = await submitUserMessage(question, mode)
    setMessages(currentMessages => [...currentMessages, responseMessage])
  }

  return (
    <div className="space-y-3">
      {/* Follow-up suggestion chips — only show when not loading and not empty */}
      {!isLoading && (
        <div className="flex flex-wrap gap-2 px-1">
          {suggestions.map((q, i) => (
            <button
              key={i}
              onClick={() => handleSuggestion(q)}
              className="text-xs font-body px-3 py-1.5 rounded-full bg-stocrates-blue/30 border border-stocrates-dark/15 text-stocrates-dark/75 hover:bg-stocrates-blue/50 hover:text-stocrates-dark transition-all duration-150 hover:shadow-sm"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      <form
        ref={formRef}
        onSubmit={async (e: any) => {
          e.preventDefault()
          if (window.innerWidth < 600) {
            e.target['message']?.blur()
          }
          const value = input.trim()
          setInput('')
          if (!value) return
          setMessages(currentMessages => [
            ...currentMessages,
            { id: nanoid(), display: <UserMessage>{value}</UserMessage> }
          ])
          const responseMessage = await submitUserMessage(value, mode)
          setMessages(currentMessages => [...currentMessages, responseMessage])
        }}
        suppressHydrationWarning
      >
        <div
          className="relative flex max-h-60 w-full grow flex-col overflow-hidden bg-white border-3 border-stocrates-dark px-12 sm:rounded-full sm:px-12 shadow-md"
          data-grammarly="false"
          suppressHydrationWarning
        >
          {/* New chat button */}
          <button
            type="button"
            className="absolute left-4 top-[14px] size-8 rounded-full bg-stocrates-dark text-stocrates-cream hover:bg-stocrates-dark-blue transition-colors flex items-center justify-center p-0 sm:left-4"
            onClick={() => router.push('/new')}
            suppressHydrationWarning
          >
            <IconPlus />
            <span className="sr-only">New Chat</span>
          </button>

          <Textarea
            ref={inputRef}
            tabIndex={0}
            onKeyDown={onKeyDown}
            placeholder={mode === 'halal' ? 'Ask about halal stocks...' : 'Ask me about stocks...'}
            className="font-body min-h-[60px] w-full bg-transparent placeholder:text-stocrates-dark/50 text-stocrates-dark resize-none px-4 py-[1.3rem] focus-within:outline-none sm:text-sm"
            autoFocus
            spellCheck={false}
            autoComplete="off"
            autoCorrect="off"
            name="message"
            rows={1}
            value={input}
            onChange={e => setInput(e.target.value)}
          />

          {/* Send / Stop button */}
          <div className="absolute right-4 top-[13px] sm:right-4" suppressHydrationWarning>
            <Tooltip>
              <TooltipTrigger asChild>
                {isLoading ? (
                  <button
                    type="button"
                    onClick={onStop}
                    className="size-8 bg-stocrates-dark text-stocrates-cream rounded-full hover:bg-stocrates-red transition-all hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center"
                    suppressHydrationWarning
                  >
                    <Square className="size-3 fill-current" />
                    <span className="sr-only">Stop generating</span>
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={input === ''}
                    className="size-8 bg-stocrates-dark text-stocrates-cream rounded-full hover:bg-stocrates-dark-blue disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center"
                    suppressHydrationWarning
                  >
                    <IconArrowElbow />
                    <span className="sr-only">Send message</span>
                  </button>
                )}
              </TooltipTrigger>
              <TooltipContent className="bg-stocrates-dark text-stocrates-cream border-stocrates-dark">
                {isLoading ? 'Stop generating' : 'Send message'}
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </form>
    </div>
  )
}
