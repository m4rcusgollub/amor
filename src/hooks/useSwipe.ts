import { useCallback, useRef } from 'react'

/**
 * Detecta swipe horizontal em touch.
 * onSwipeLeft = próximo, onSwipeRight = anterior.
 */
export function useSwipe(onSwipeLeft: () => void, onSwipeRight: () => void) {
  const startX = useRef<number | null>(null)
  const startY = useRef<number | null>(null)

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    const t = e.touches[0]
    startX.current = t.clientX
    startY.current = t.clientY
  }, [])

  const onTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (startX.current === null || startY.current === null) return
      const t = e.changedTouches[0]
      const dx = t.clientX - startX.current
      const dy = t.clientY - startY.current
      startX.current = null
      startY.current = null
      if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.4) {
        if (dx < 0) onSwipeLeft()
        else onSwipeRight()
      }
    },
    [onSwipeLeft, onSwipeRight]
  )

  return { onTouchStart, onTouchEnd }
}
