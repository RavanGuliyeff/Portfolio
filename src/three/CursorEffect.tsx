import React, { useEffect, useRef, useCallback } from 'react'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

interface TrailDot {
  x: number
  y: number
  life: number
}

export const CursorEffect: React.FC = () => {
  const reduced    = usePrefersReducedMotion()
  const canvasRef  = useRef<HTMLCanvasElement>(null)
  const trailRef   = useRef<TrailDot[]>([])
  const mouseRef   = useRef({ x: -999, y: -999 })
  const rafRef     = useRef(0)

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Add new dot
    trailRef.current.push({ x: mouseRef.current.x, y: mouseRef.current.y, life: 1 })
    if (trailRef.current.length > 28) trailRef.current.shift()

    trailRef.current.forEach((dot, i) => {
      dot.life -= 0.05
      const size = (i / trailRef.current.length) * 10
      ctx.beginPath()
      ctx.arc(dot.x, dot.y, Math.max(0, size), 0, Math.PI * 2)
      ctx.fillStyle = `rgba(124,58,237,${dot.life * 0.35})`
      ctx.fill()
    })

    trailRef.current = trailRef.current.filter(d => d.life > 0)
    rafRef.current = requestAnimationFrame(draw)
  }, [])

  useEffect(() => {
    if (reduced) return

    const canvas = canvasRef.current
    if (!canvas) return
    canvas.width  = window.innerWidth
    canvas.height = window.innerHeight

    const onResize = () => {
      if (!canvasRef.current) return
      canvasRef.current.width  = window.innerWidth
      canvasRef.current.height = window.innerHeight
    }

    const onMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY }
    }

    window.addEventListener('resize',    onResize, { passive: true })
    window.addEventListener('mousemove', onMove,   { passive: true })
    rafRef.current = requestAnimationFrame(draw)

    return () => {
      window.removeEventListener('resize',    onResize)
      window.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(rafRef.current)
    }
  }, [reduced, draw])

  if (reduced) return null

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[9999]"
      aria-hidden="true"
    />
  )
}
