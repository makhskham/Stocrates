'use client'

import * as React from 'react'
import Link from 'next/link'
import Image from 'next/image'

import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import { IconSeparator } from '@/components/ui/icons'
import { useGame } from '@/lib/game/game-context'
import { Gamepad2 } from 'lucide-react'

function Navigation() {
  return (
    <nav className="flex items-center space-x-4">
      <Link
        href="/new"
        className="flex items-center gap-3 group"
      >
        <div className="w-10 h-10 rounded-full overflow-hidden border-3 border-stocrates-dark shadow-md group-hover:scale-110 transition-transform bg-white flex items-center justify-center">
          <Image
            src="/logo.jpg"
            alt="Stocrates Logo"
            width={40}
            height={40}
            className="object-cover w-full h-full"
            priority
          />
        </div>
        <span className="font-title text-2xl font-bold text-stocrates-dark group-hover:text-stocrates-dark-blue transition-colors">
          Stocrates
        </span>
      </Link>
      <IconSeparator className="size-6 text-stocrates-dark/30" />
      <Link
        href="/new"
        className="font-body text-sm font-medium text-stocrates-dark hover:text-stocrates-dark-blue transition-colors px-4 py-2 rounded-full hover:bg-stocrates-cream"
      >
        New Chat
      </Link>
      <Link
        href="/events"
        className={cn(
          buttonVariants({ variant: 'ghost' }),
          'text-sm font-medium text-muted-foreground hover:text-primary'
        )}
      >
        Event Analysis
      </Link>
    </nav>
  )
}

export function Header() {
  const { toggleGame, isGameOpen } = useGame()

  return (
    <header className="sticky top-0 z-50 w-full bg-stocrates-blue border-b-3 border-stocrates-dark">
      <div className="container mx-auto px-4 flex h-16 items-center justify-between">
        <Navigation />
        <div className="flex items-center gap-4">
          <div className="font-body text-sm text-stocrates-dark hidden md:block italic">
  Proven Past, Prepared Future
</div>

          <button
            onClick={toggleGame}
            className={cn(
              "relative overflow-hidden px-4 py-2 rounded-full font-title text-sm font-bold uppercase tracking-wide transition-all duration-300",
              "flex items-center gap-2 border-2 border-stocrates-dark shadow-md",
              isGameOpen
                ? "bg-stocrates-dark text-stocrates-cream"
                : "bg-gradient-to-r from-stocrates-purple to-stocrates-pink text-white hover:shadow-lg hover:scale-105 active:scale-95"
            )}
          >
            <Gamepad2 className="h-4 w-4" />
            <span className="hidden sm:inline">Investment Game</span>
            <span className="sm:hidden">Game</span>
          </button>
        </div>
      </div>
    </header>
  )
}