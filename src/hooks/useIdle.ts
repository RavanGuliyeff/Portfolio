import { useEffect, useState } from 'react'

/**
 * Becomes true once the browser has finished the initial page work.
 * Used to defer heavy, non-essential things (like the WebGL scene) so they
 * never compete with the first paint.
 */
export function useIdle(timeout = 1200) {
  const [idle, setIdle] = useState(false)

  useEffect(() => {
    let cancelled = false
    const done = () => !cancelled && setIdle(true)
    const start = () => {
      if ('requestIdleCallback' in window) {
        const id = window.requestIdleCallback(done, { timeout })
        return () => window.cancelIdleCallback(id)
      }
      const id = setTimeout(done, 300)
      return () => clearTimeout(id)
    }

    let cleanup: (() => void) | undefined
    if (document.readyState === 'complete') cleanup = start()
    else {
      const onLoad = () => (cleanup = start())
      window.addEventListener('load', onLoad, { once: true })
      cleanup = () => window.removeEventListener('load', onLoad)
    }
    return () => {
      cancelled = true
      cleanup?.()
    }
  }, [timeout])

  return idle
}
