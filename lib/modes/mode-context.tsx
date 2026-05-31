'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { type StocatesMode } from './types'

interface ModeContextValue {
  mode: StocatesMode
  setMode: (mode: StocatesMode) => void
}

const ModeContext = createContext<ModeContextValue>({
  mode: 'standard',
  setMode: () => {},
})

const STORAGE_KEY = 'stocrates-mode'

export function ModeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<StocatesMode>('standard')

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as StocatesMode | null
      if (stored === 'halal' || stored === 'standard') {
        setModeState(stored)
      }
    } catch {}
  }, [])

  const setMode = useCallback((m: StocatesMode) => {
    setModeState(m)
    try {
      localStorage.setItem(STORAGE_KEY, m)
    } catch {}
  }, [])

  return (
    <ModeContext.Provider value={{ mode, setMode }}>
      {children}
    </ModeContext.Provider>
  )
}

export function useMode() {
  return useContext(ModeContext)
}
