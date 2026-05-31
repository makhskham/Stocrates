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
      <Link href="/new" className="flex items-center gap-3 group">
        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-stocrates-dark/80 shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all duration-200 bg-white flex items-center justify-center">
          <Image
            src="/logo.jpg"
            alt="Stocrates Logo"
            width={40}
            height={40}
            className="object-cover w-full h-full"
            priority
          />
        </div>
        <span className="font-title text-2xl font-bold text-stocrates-dark group-hover:text-stocrates-dark-blue transition-colors duration-200">
          Stocrates
        </span>
      </Link>

      <IconSeparator className="size-5 text-stocrates-dark/25" />

      <Link
        href="/new"
        className="font-body text-sm font-medium text-stocrates-dark/70 hover:text-stocrates-dark transition-colors duration-150 px-3 py-1.5 rounded-full hover:bg-stocrates-dark/5"
      >
        New Chat
      </Link>

      <Link
        href="/events"
        className={cn(
          buttonVariants({ variant: 'ghost' }),
          'text-sm font-medium text-stocrates-dark/60 hover:text-stocrates-dark hover:bg-stocrates-dark/5 transition-colors duration-150'
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
    <header className="sticky top-0 z-50 w-full bg-stocrates-blue/95 backdrop-blur-sm border-b border-stocrates-dark/15 shadow-sm">
      <div className="container mx-auto px-4 flex h-16 items-center justify-between">
        <Navigation />

        <div className="flex items-center gap-5">
          <span className="font-body text-sm text-stocrates-dark/60 hidden md:block italic select-none">
            Proven Past, Prepared Future
          </span>

          <button
            onClick={toggleGame}
            className={cn(
              'relative overflow-hidden px-4 py-2 rounded-full font-title text-xs font-bold uppercase tracking-wider',
              'flex items-center gap-2 border-2 border-stocrates-dark/80 shadow-sm',
              'transition-all duration-200',
              isGameOpen
                ? 'bg-stocrates-dark text-stocrates-cream hover:bg-stocrates-dark/90'
                : 'bg-gradient-to-r from-stocrates-purple to-stocrates-pink text-white hover:shadow-md hover:scale-105 active:scale-100'
            )}
          >
            <Gamepad2 className="h-3.5 w-3.5 shrink-0" />
            <span className="hidden sm:inline">Investment Game</span>
            <span className="sm:hidden">Game</span>
          </button>
        </div>
      </div>
    </header>
  )
}
