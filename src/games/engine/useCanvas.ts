import { useLayoutEffect, useRef } from 'react'

/**
 * Sets up a canvas that is drawn in fixed "logical" units (width × height) but
 * whose backing store matches its real on-screen size × devicePixelRatio,
 * so it stays sharp at any size and on retina screens.
 */
export function useCanvas(width: number, height: number) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null)

  useLayoutEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { alpha: false })
    if (!ctx) return
    ctxRef.current = ctx

    const resize = () => {
      const cssWidth = canvas.getBoundingClientRect().width || width
      const dpr = Math.min(window.devicePixelRatio || 1, 2.5)
      const scale = (cssWidth / width) * dpr
      const w = Math.max(1, Math.round(width * scale))
      const h = Math.max(1, Math.round(height * scale))
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w
        canvas.height = h
      }
      ctx.setTransform(scale, 0, 0, scale, 0, 0)
    }

    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)
    window.addEventListener('resize', resize)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', resize)
    }
  }, [width, height])

  return { canvasRef, ctxRef }
}
