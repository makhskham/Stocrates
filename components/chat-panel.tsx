import * as React from 'react'
import { PromptForm } from '@/components/prompt-form'
import { ButtonScrollToBottom } from '@/components/button-scroll-to-bottom'
import { FooterText } from '@/components/footer'
import { useAIState } from 'ai/rsc'

export interface ChatPanelProps {
  id?: string
  title?: string
  input: string
  setInput: (value: string) => void
  isAtBottom: boolean
  scrollToBottom: () => void
  isLoading?: boolean
  onStop?: () => void
  lastTool?: string
}

export function ChatPanel({
  id,
  title,
  input,
  setInput,
  isAtBottom,
  scrollToBottom,
  isLoading,
  onStop,
  lastTool,
}: ChatPanelProps) {
  const [aiState] = useAIState()

  return (
    <div className="fixed inset-x-0 bg-stocrates-cream/95 backdrop-blur-sm bottom-0 w-full duration-300 ease-in-out peer-[[data-state=open]]:group-[]:lg:pl-[250px] peer-[[data-state=open]]:group-[]:xl:pl-[300px] border-t border-stocrates-dark/10">
      <ButtonScrollToBottom
        isAtBottom={isAtBottom}
        scrollToBottom={scrollToBottom}
      />

      <div className="mx-auto sm:max-w-2xl sm:px-4">
        <div className="grid gap-3 sm:pb-4 pt-3">
          <PromptForm
            input={input}
            setInput={setInput}
            isLoading={isLoading}
            onStop={onStop}
            lastTool={lastTool}
          />
          <FooterText className="hidden sm:block" />
        </div>
      </div>
    </div>
  )
}
