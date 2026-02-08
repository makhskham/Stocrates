'use client'

import React, { useEffect, useRef, memo } from 'react'

export function MarketHeatmap({}) {
  const container = useRef<HTMLDivElement>(null)
  const scriptAdded = useRef(false)

  useEffect(() => {
    if (!container.current || scriptAdded.current) return

    // Clear any existing content to prevent duplicates
    container.current.innerHTML = ''

    const script = document.createElement('script')
    script.src =
      'https://s3.tradingview.com/external-embedding/embed-widget-stock-heatmap.js'
    script.type = 'text/javascript'
    script.async = true
    script.innerHTML = JSON.stringify({
      exchanges: [],
      dataSource: 'SPX500',
      grouping: 'sector',
      blockSize: 'market_cap_basic',
      blockColor: 'change',
      locale: 'en',
      symbolUrl: '',
      colorTheme: 'light',
      hasTopBar: false,
      isDataSetEnabled: false,
      isZoomEnabled: true,
      hasSymbolTooltip: true,
      isMonoSize: false,
      width: '100%',
      height: '100%'
    })

    container.current.appendChild(script)
    scriptAdded.current = true

    return () => {
      scriptAdded.current = false
      if (container.current) {
        container.current.innerHTML = ''
      }
    }
  }, [])

  return (
    <div style={{ height: '500px' }}>
      <div
        className="tradingview-widget-container"
        ref={container}
        style={{ height: '100%', width: '100%' }}
      >
        <div
          className="tradingview-widget-container__widget"
          style={{ height: '100%', width: '100%' }}
        ></div>
      </div>
    </div>
  )
}

export default memo(MarketHeatmap)
