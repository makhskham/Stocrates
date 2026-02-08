'use client'

import { useState } from 'react'
import { ChevronRight, BookOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FINANCIAL_TERMS } from '@/components/ui/financial-term'
import { cn } from '@/lib/utils'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

export function TerminologyLegend() {
  const [isOpen, setIsOpen] = useState(false)

  const terms = Object.values(FINANCIAL_TERMS)

  return (
    <>
      {/* Toggle Button - Fixed position */}
      <div className={cn(
        'fixed top-20 transition-all duration-300 z-40',
        isOpen ? 'right-80' : 'right-0'
      )}>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="rounded-l-md rounded-r-none shadow-lg bg-background border-r-0"
        >
          {isOpen ? (
            <>
              <ChevronRight className="h-4 w-4 mr-1" />
              <span className="text-xs">Hide</span>
            </>
          ) : (
            <>
              <BookOpen className="h-4 w-4 mr-1" />
              <span className="text-xs">Terms</span>
            </>
          )}
        </Button>
      </div>

      {/* Sidebar Panel */}
      <div
        className={cn(
          'fixed top-16 right-0 h-[calc(100vh-4rem)] w-80 bg-background border-l shadow-xl transition-transform duration-300 z-30',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b bg-muted/50">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <h2 className="font-semibold text-lg">Financial Terms</h2>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Hover over any term to see its definition
            </p>
          </div>

          {/* Terms List */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-3">
              {terms.map((termData, index) => (
                <TooltipProvider key={index} delayDuration={200}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="p-3 rounded-lg border bg-card hover:bg-accent hover:border-primary/50 transition-colors cursor-help">
                        <div className="flex items-start gap-2">
                          <div className="flex-1">
                            <h3 className="font-medium text-sm leading-tight">
                              {termData.term}
                            </h3>
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {termData.definition}
                            </p>
                          </div>
                          <div className="text-xs text-muted-foreground">ℹ️</div>
                        </div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="left" className="max-w-xs">
                      <p className="font-semibold mb-1">{termData.term}</p>
                      <p className="text-sm">{termData.definition}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t bg-muted/30">
            <p className="text-xs text-muted-foreground text-center">
              📚 Learn as you explore the markets
            </p>
          </div>
        </div>
      </div>

      {/* Overlay when open (mobile) */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-20 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  )
}

