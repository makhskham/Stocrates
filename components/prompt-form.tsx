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

export function PromptForm({
  input,
  setInput
}: {
  input: string
  setInput: (value: string) => void
}) {
  const router = useRouter()
  const { formRef, onKeyDown } = useEnterSubmit()
  const inputRef = React.useRef<HTMLTextAreaElement>(null)
  const { submitUserMessage } = useActions()
  const [_, setMessages] = useUIState<typeof AI>()
  const [apiKey, setApiKey] = useLocalStorage('groqKey', '')
  const [isMounted, setIsMounted] = React.useState(false)

  React.useEffect(() => {
    setIsMounted(true)
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  if (!isMounted) {
    return null
  }

  return (
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
          {
            id: nanoid(),
            display: <UserMessage>{value}</UserMessage>
          }
        ])
        const responseMessage = await submitUserMessage(value, apiKey)
        setMessages(currentMessages => [...currentMessages, responseMessage])
      }}
      suppressHydrationWarning
    >
      <div
        className="relative flex max-h-60 w-full grow flex-col overflow-hidden bg-white border-3 border-stocrates-dark px-12 sm:rounded-full sm:px-12 shadow-md"
        data-grammarly="false"
        data-grammarly-avoid="true"
        suppressHydrationWarning
      >
        <button
          type="button"
          className="absolute left-4 top-[14px] size-8 rounded-full bg-stocrates-dark text-stocrates-cream hover:bg-stocrates-dark-blue transition-colors flex items-center justify-center p-0 sm:left-4"
          onClick={() => {
            router.push('/new')
          }}
          suppressHydrationWarning
        >
          <IconPlus />
          <span className="sr-only">New Chat</span>
        </button>
        <Textarea
          ref={inputRef}
          tabIndex={0}
          onKeyDown={onKeyDown}
          placeholder="Ask me about stocks..."
          className="font-body min-h-[60px] w-full bg-transparent placeholder:text-stocrates-dark/50 text-stocrates-dark resize-none px-4 py-[1.3rem] focus-within:outline-none sm:text-sm"
          autoFocus
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          data-grammarly="false"
          data-grammarly-avoid="true"
          name="message"
          rows={1}
          value={input}
          onChange={e => setInput(e.target.value)}
        />
        <div className="absolute right-4 top-[13px] sm:right-4" suppressHydrationWarning>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="submit"
                disabled={input === ''}
                className="size-8 bg-stocrates-dark text-stocrates-cream rounded-full hover:bg-stocrates-dark-blue disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center"
                suppressHydrationWarning
              >
                <IconArrowElbow />
                <span className="sr-only">Send message</span>
              </button>
            </TooltipTrigger>
            <TooltipContent className="bg-stocrates-dark text-stocrates-cream border-stocrates-dark">
              Send message
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </form>
  )
}