'use client'

import * as React from 'react'
import Image from 'next/image'
import Link from 'next/link'

export function LogoBadge() {
  return (
    <Link
      href="/new"
      className="fixed bottom-4 left-4 z-50 group"
    >
      <div className="w-12 h-12 rounded-full overflow-hidden border-3 border-stocrates-dark shadow-lg hover:scale-110 transition-transform bg-white flex items-center justify-center">
        <Image
          src="/logo.png"
          alt="Stocrates Logo"
          width={48}
          height={48}
          className="object-cover w-full h-full"
          priority
        />
      </div>
    </Link>
  )
}


