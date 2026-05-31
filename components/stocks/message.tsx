'use client'

import { IconGroq, IconUser } from '@/components/ui/icons'
import { cn } from '@/lib/utils'
import { spinner } from './spinner'
import { CodeBlock } from '../ui/codeblock'
import { MemoizedReactMarkdown } from '../markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import { StreamableValue } from 'ai/rsc'
import { useStreamableText } from '@/lib/hooks/use-streamable-text'
import { useCopyToClipboard } from '@/lib/hooks/use-copy-to-clipboard'
import { Copy, Check } from 'lucide-react'

function UserAvatar() {
  return (
    <div className="flex size-[26px] shrink-0 select-none items-center justify-center rounded-md border-2 border-stocrates-dark bg-stocrates-blue shadow-sm transition-transform duration-150 group-hover:scale-105">
      <IconUser className="text-stocrates-dark size-3.5" />
    </div>
  )
}

function BotAvatar() {
  return (
    <div className="flex size-[26px] shrink-0 select-none items-center justify-center rounded-md border-2 border-stocrates-dark bg-stocrates-red shadow-sm transition-transform duration-150 group-hover:scale-105">
      <IconGroq className="text-white size-3.5" />
    </div>
  )
}

function CopyButton({ text }: { text: string }) {
  const { isCopied, copyToClipboard } = useCopyToClipboard({ timeout: 2000 })
  return (
    <button
      onClick={() => copyToClipboard(text)}
      className={cn(
        'opacity-0 group-hover:opacity-100 transition-opacity duration-150',
        'p-1.5 rounded-md text-stocrates-dark/40 hover:text-stocrates-dark hover:bg-stocrates-dark/6',
        'absolute top-0 right-0'
      )}
      title="Copy message"
    >
      {isCopied ? <Check className="size-3.5 text-emerald-600" /> : <Copy className="size-3.5" />}
    </button>
  )
}

export function UserMessage({ children }: { children: React.ReactNode }) {
  return (
    <div className="group relative flex items-start md:-ml-12 animate-fade-in">
      <UserAvatar />
      <div className="ml-4 flex-1 space-y-2 overflow-hidden pl-2 pt-0.5">
        <div className="font-body text-stocrates-dark leading-relaxed">{children}</div>
      </div>
    </div>
  )
}

export function BotMessage({
  content,
  className
}: {
  content: string | StreamableValue<string>
  className?: string
}) {
  const text = useStreamableText(content)

  return (
    <div className={cn('group relative flex items-start md:-ml-12 animate-fade-in', className)}>
      <BotAvatar />
      <div className="ml-4 flex-1 space-y-2 overflow-hidden px-1 pt-0.5 relative pr-8">
        <CopyButton text={text} />
        <MemoizedReactMarkdown
          className="prose break-words prose-p:leading-relaxed prose-pre:p-0 font-body text-stocrates-dark prose-headings:font-title prose-headings:text-stocrates-dark prose-strong:text-stocrates-dark max-w-none"
          remarkPlugins={[remarkGfm, remarkMath]}
          components={{
            p({ children }) {
              return <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>
            },
            code({ node, inline, className, children, ...props }) {
              if (children.length) {
                if (children[0] == '◍') {
                  return <span className="mt-1 animate-pulse cursor-default">◍</span>
                }
                children[0] = (children[0] as string).replace('`◍`', '◍')
              }
              const match = /language-(\w+)/.exec(className || '')
              if (inline) {
                return (
                  <code className={cn('font-mono text-sm bg-stocrates-gray px-1.5 py-0.5 rounded text-stocrates-dark', className)} {...props}>
                    {children}
                  </code>
                )
              }
              return (
                <CodeBlock
                  key={Math.random()}
                  language={(match && match[1]) || ''}
                  value={String(children).replace(/\n$/, '')}
                  {...props}
                />
              )
            }
          }}
        >
          {text}
        </MemoizedReactMarkdown>
      </div>
    </div>
  )
}

export function BotCard({
  children,
  showAvatar = true
}: {
  children: React.ReactNode
  showAvatar?: boolean
}) {
  return (
    <div className="group relative flex items-start md:-ml-12 animate-fade-in">
      <div className={cn('flex size-[26px] shrink-0 select-none items-center justify-center rounded-md border-2 border-stocrates-dark bg-stocrates-red shadow-sm', !showAvatar && 'invisible')}>
        <IconGroq className="text-white size-3.5" />
      </div>
      <div className="ml-4 flex-1 pl-2 pt-0.5">{children}</div>
    </div>
  )
}

export function SystemMessage({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-2 flex items-center justify-center gap-2 text-xs text-stocrates-dark-blue/70 font-body">
      <div className="max-w-[600px] flex-initial px-3 py-1.5 bg-stocrates-gray/50 rounded-full border border-stocrates-dark/10">
        {children}
      </div>
    </div>
  )
}

export function SpinnerMessage() {
  return (
    <div className="group relative flex items-start md:-ml-12">
      <BotAvatar />
      <div className="ml-4 h-[26px] flex flex-row items-center flex-1 space-y-2 overflow-hidden px-1">
        {spinner}
      </div>
    </div>
  )
}