import { useCallback, useEffect, useRef, useState } from 'react'

export const useScrollAnchor = () => {
  const messagesRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const visibilityRef = useRef<HTMLDivElement>(null)

  const [isAtBottom, setIsAtBottom] = useState(true)
  const [isVisible, setIsVisible] = useState(false)

  const scrollToBottom = useCallback(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollIntoView({
        block: 'end',
        behavior: 'smooth'
      })
    }
  }, [])

  // Scroll when isAtBottom/isVisible state changes (initial load, new messages)
  useEffect(() => {
    if (messagesRef.current) {
      if (isAtBottom && !isVisible) {
        messagesRef.current.scrollIntoView({
          block: 'end'
        })
      }
    }
  }, [isAtBottom, isVisible])

  // Track whether user has scrolled away from the bottom
  useEffect(() => {
    const { current } = scrollRef

    if (current) {
      const handleScroll = (event: Event) => {
        const target = event.target as HTMLDivElement
        const offset = 25
        const atBottom =
          target.scrollTop + target.clientHeight >= target.scrollHeight - offset
        setIsAtBottom(atBottom)
      }

      current.addEventListener('scroll', handleScroll, { passive: true })
      return () => current.removeEventListener('scroll', handleScroll)
    }
  }, [])

  // MutationObserver: auto-scroll during streaming whenever the message
  // container grows (text content changes, new nodes added) and the user
  // is at or near the bottom.
  useEffect(() => {
    const scrollEl = scrollRef.current
    const messagesEl = messagesRef.current

    if (!scrollEl || !messagesEl) return

    const observer = new MutationObserver(() => {
      const offset = 150
      const atBottom =
        scrollEl.scrollTop + scrollEl.clientHeight >=
        scrollEl.scrollHeight - offset

      if (atBottom) {
        // Instant scroll (no smooth) so it keeps up with rapid streaming
        scrollEl.scrollTop = scrollEl.scrollHeight
      }
    })

    observer.observe(messagesEl, {
      childList: true,
      subtree: true,
      characterData: true,
    })

    return () => observer.disconnect()
  }, [])

  // IntersectionObserver: track visibility of the bottom anchor div
  useEffect(() => {
    if (visibilityRef.current) {
      const observer = new IntersectionObserver(
        entries => {
          entries.forEach(entry => {
            setIsVisible(entry.isIntersecting)
          })
        },
        { rootMargin: '0px 0px -150px 0px' }
      )

      observer.observe(visibilityRef.current)
      return () => observer.disconnect()
    }
  })

  return {
    messagesRef,
    scrollRef,
    visibilityRef,
    scrollToBottom,
    isAtBottom,
    isVisible
  }
}
