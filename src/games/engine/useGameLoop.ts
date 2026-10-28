import { useEffect, useRef } from 'react'

const MAX_STEP = 1 / 120 // physics never advances more than this in one go
const MAX_FRAME = 1 / 15 // after a hitch or tab switch, don't try to catch up

/**
 * requestAnimationFrame loop with real elapsed time.
 * `update` receives seconds and is called in small sub-steps, so movement is the
 * same speed on 60 Hz, 144 Hz and slow devices, and fast objects don't tunnel.
 */
export function useGameLoop(update: (dt: number) => void, render: () => void) {
  const updateRef = useRef(update)
  const renderRef = useRef(render)
  updateRef.current = update
  renderRef.current = render

  useEffect(() => {
    let raf = 0
    let last = performance.now()

    const frame = (now: number) => {
      let dt = Math.min((now - last) / 1000, MAX_FRAME)
      last = now
      while (dt > 0) {
        const step = Math.min(dt, MAX_STEP)
        updateRef.current(step)
        dt -= step
      }
      renderRef.current()
      raf = requestAnimationFrame(frame)
    }

    const onVisibility = () => {
      last = performance.now()
    }

    raf = requestAnimationFrame(now => {
      last = now
      frame(now)
    })
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      cancelAnimationFrame(raf)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [])
}
