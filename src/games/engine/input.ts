import { useEffect, useRef } from 'react'

const SCROLL_KEYS = new Set([' ', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'])

function isTyping(target: EventTarget | null) {
  const el = target as HTMLElement | null
  return !!el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable)
}

/**
 * Window-level keyboard handler for a game. Prevents arrow keys and space from
 * scrolling the page or "clicking" a focused button behind the game.
 */
export function useKeyboard(
  onDown: (e: KeyboardEvent) => void,
  onUp?: (e: KeyboardEvent) => void
) {
  const down = useRef(onDown)
  const up = useRef(onUp)
  down.current = onDown
  up.current = onUp

  useEffect(() => {
    const handleDown = (e: KeyboardEvent) => {
      if (isTyping(e.target) || e.ctrlKey || e.metaKey || e.altKey) return
      if (SCROLL_KEYS.has(e.key)) e.preventDefault()
      down.current(e)
    }
    const handleUp = (e: KeyboardEvent) => {
      if (isTyping(e.target)) return
      if (SCROLL_KEYS.has(e.key)) e.preventDefault()
      up.current?.(e)
    }
    window.addEventListener('keydown', handleDown)
    window.addEventListener('keyup', handleUp)
    return () => {
      window.removeEventListener('keydown', handleDown)
      window.removeEventListener('keyup', handleUp)
    }
  }, [])
}

export type SwipeDir = 'up' | 'down' | 'left' | 'right'

/** Detects swipes on an element and stops the page from scrolling while swiping on it. */
export function useSwipe(
  ref: React.RefObject<HTMLElement>,
  onSwipe: (dir: SwipeDir) => void,
  minDistance = 24
) {
  const cb = useRef(onSwipe)
  cb.current = onSwipe

  useEffect(() => {
    const el = ref.current
    if (!el) return
    let sx = 0
    let sy = 0
    let tracking = false

    const start = (e: TouchEvent) => {
      sx = e.touches[0].clientX
      sy = e.touches[0].clientY
      tracking = true
    }
    const move = (e: TouchEvent) => {
      if (!tracking) return
      e.preventDefault()
      const dx = e.touches[0].clientX - sx
      const dy = e.touches[0].clientY - sy
      if (Math.max(Math.abs(dx), Math.abs(dy)) < minDistance) return
      tracking = false
      cb.current(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : dy > 0 ? 'down' : 'up')
    }
    const end = () => {
      tracking = false
    }

    el.addEventListener('touchstart', start, { passive: true })
    el.addEventListener('touchmove', move, { passive: false })
    el.addEventListener('touchend', end)
    return () => {
      el.removeEventListener('touchstart', start)
      el.removeEventListener('touchmove', move)
      el.removeEventListener('touchend', end)
    }
  }, [ref, minDistance])
}

export function isTouchDevice() {
  return window.matchMedia('(pointer: coarse)').matches
}
