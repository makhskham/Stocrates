import * as React from 'react'
import Link from 'next/link'

import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import { IconGitHub, IconSeparator } from '@/components/ui/icons'

function Navigation() {
  return (
    <nav className="flex items-center space-x-4">
      <Link
        href="/new"
        className="text-2xl font-bold text-primary hover:text-primary/80 transition-colors title"
      >
        Stocrates
      </Link>
      <IconSeparator className="size-6 text-muted-foreground/50" />
      <Link
        href="/new"
        className={cn(
          buttonVariants({ variant: 'ghost' }),
          'text-sm font-medium text-muted-foreground hover:text-primary'
        )}
      >
        New Chat
      </Link>
    </nav>
  )
}

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="container mx-auto px-4 flex h-16 items-center justify-between">
        <Navigation />
        <div className="text-sm text-muted-foreground body-text">
          Learn Markets Through History 🎓
        </div>
      </div>
    </header>
  )
}
