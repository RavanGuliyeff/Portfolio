import React, { useRef, useEffect, useState, useCallback } from 'react'
import { RefreshCw } from 'lucide-react'

const COLS  = 20
const ROWS  = 18
const CELL  = 22
const W     = COLS * CELL
const H     = ROWS * CELL
const BASE_SPEED  = 130   // ms per tick
const MIN_SPEED   = 55    // fastest

// Polyfill for roundRect (not in all browsers)
function roundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.arcTo(x + w, y, x + w, y + r, r)
  ctx.lineTo(x + w, y + h - r)
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r)
  ctx.lineTo(x + r, y + h)
  ctx.arcTo(x, y + h, x, y + h - r, r)
  ctx.lineTo(x, y + r)
  ctx.arcTo(x, y, x + r, y, r)
  ctx.closePath()
}

type Dir = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT'
type Point = { x: number; y: number }

function randFood(snake: Point[]): Point {
  let p: Point
  do {
    p = { x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS) }
  } while (snake.some(s => s.x === p.x && s.y === p.y))
  return p
}

export const Snake: React.FC = () => {
  const canvasRef  = useRef<HTMLCanvasElement>(null)
  const gameRef    = useRef({
    snake:  [{ x: 10, y: 9 }] as Point[],
    dir:    'RIGHT' as Dir,
    nextDir:'RIGHT' as Dir,
    food:   { x: 15, y: 9 } as Point,
    score:  0,
    dead:   false,
    started: false,
  })
  const timerRef   = useRef<ReturnType<typeof setInterval> | null>(null)
  const [score, setScore] = useState(0)
  const [dead,  setDead]  = useState(false)
  const [started, setStarted] = useState(false)

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const { snake, food, score: sc, dead: dead_, started: st } = gameRef.current

    ctx.fillStyle = '#0a0a0f'
    ctx.fillRect(0, 0, W, H)

    // Grid dots
    ctx.fillStyle = 'rgba(124,58,237,0.07)'
    for (let x = 0; x < COLS; x++)
      for (let y = 0; y < ROWS; y++)
        ctx.fillRect(x * CELL + CELL / 2 - 1, y * CELL + CELL / 2 - 1, 2, 2)

    // Snake body (head = bright, tail = dim)
    snake.forEach((seg, i) => {
      const alpha = 1.0 - (i / Math.max(snake.length, 1)) * 0.55
      ctx.fillStyle = `rgba(124, 58, 237, ${alpha})`
      roundedRect(ctx, seg.x * CELL + 2, seg.y * CELL + 2, CELL - 4, CELL - 4, 4)
      ctx.fill()
    })
    // Head — bright highlight with eyes
    if (snake.length > 0) {
      const hx = snake[0].x * CELL
      const hy = snake[0].y * CELL
      ctx.fillStyle = '#a78bfa'
      roundedRect(ctx, hx + 2, hy + 2, CELL - 4, CELL - 4, 5)
      ctx.fill()
      // eyes
      ctx.fillStyle = '#0a0a0f'
      const g0 = gameRef.current
      const eyeOff = g0.dir === 'RIGHT' ? [CELL - 7, 5, CELL - 7, CELL - 9]
                   : g0.dir === 'LEFT'  ? [3, 5, 3, CELL - 9]
                   : g0.dir === 'UP'    ? [5, 3, CELL - 9, 3]
                                        : [5, CELL - 7, CELL - 9, CELL - 7]
      ctx.fillRect(hx + eyeOff[0], hy + eyeOff[1], 3, 3)
      ctx.fillRect(hx + eyeOff[2], hy + eyeOff[3], 3, 3)
    }

    // Food
    ctx.fillStyle = '#dc2626'
    ctx.beginPath()
    ctx.arc(food.x * CELL + CELL / 2, food.y * CELL + CELL / 2, CELL / 2 - 3, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#fca5a5'
    ctx.beginPath()
    ctx.arc(food.x * CELL + CELL / 2 - 2, food.y * CELL + CELL / 2 - 2, 3, 0, Math.PI * 2)
    ctx.fill()

    // Score
    ctx.fillStyle = '#7c3aed'
    ctx.font = '12px JetBrains Mono, monospace'
    ctx.fillText(`${sc}`, 8, 16)

    if (!st) {
      ctx.fillStyle = 'rgba(0,0,0,0.6)'
      ctx.fillRect(0, 0, W, H)
      ctx.fillStyle = '#f1f5f9'
      ctx.font = '14px Space Grotesk, sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('Arrow keys / WASD to start', W / 2, H / 2)
      ctx.textAlign = 'left'
    }

    if (dead_) {
      ctx.fillStyle = 'rgba(0,0,0,0.65)'
      ctx.fillRect(0, 0, W, H)
      ctx.fillStyle = '#f1f5f9'
      ctx.font = 'bold 20px Space Grotesk, sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('Game Over!', W / 2, H / 2 - 12)
      ctx.font = '12px JetBrains Mono, monospace'
      ctx.fillText(`Score: ${sc} · Press R to restart`, W / 2, H / 2 + 12)
      ctx.textAlign = 'left'
    }
  }, [])

  const tick = useCallback(() => {
    const g = gameRef.current
    if (g.dead || !g.started) return

    g.dir = g.nextDir
    const head = g.snake[0]
    const next: Point = {
      x: (head.x + (g.dir === 'RIGHT' ? 1 : g.dir === 'LEFT' ? -1 : 0) + COLS) % COLS,
      y: (head.y + (g.dir === 'DOWN'  ? 1 : g.dir === 'UP'   ? -1 : 0) + ROWS) % ROWS,
    }

    // Wall collision (wrap-around is implemented above, so collision is with self)
    if (g.snake.some(s => s.x === next.x && s.y === next.y)) {
      g.dead = true
      const stored = parseInt(localStorage.getItem('hs-snake') ?? '0', 10)
      if (g.score > stored) localStorage.setItem('hs-snake', String(g.score))
      setDead(true)
      draw()
      return
    }

    g.snake.unshift(next)
    if (next.x === g.food.x && next.y === g.food.y) {
      g.score++
      setScore(g.score)
      g.food = randFood(g.snake)
      // Speed up every 5 points
      if (g.score % 5 === 0 && timerRef.current) {
        clearInterval(timerRef.current)
        const newSpeed = Math.max(MIN_SPEED, BASE_SPEED - g.score * 3)
        timerRef.current = setInterval(tick, newSpeed)
      }
    } else {
      g.snake.pop()
    }
    draw()
  }, [draw])

  const restart = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    const g = gameRef.current
    g.snake   = [{ x: 10, y: 9 }]
    g.dir     = 'RIGHT'
    g.nextDir = 'RIGHT'
    g.food    = { x: 15, y: 9 }
    g.score   = 0
    g.dead    = false
    g.started = false
    setScore(0)
    setDead(false)
    setStarted(false)
    draw()
    timerRef.current = setInterval(tick, BASE_SPEED)
  }, [tick, draw])

  useEffect(() => {
    draw()
    timerRef.current = setInterval(tick, BASE_SPEED)

    const onKey = (e: KeyboardEvent) => {
      const g = gameRef.current
      if (e.key === 'r' || e.key === 'R') { restart(); return }

      const map: Record<string, Dir> = {
        ArrowUp: 'UP', ArrowDown: 'DOWN', ArrowLeft: 'LEFT', ArrowRight: 'RIGHT',
        w: 'UP', s: 'DOWN', a: 'LEFT', d: 'RIGHT',
        W: 'UP', S: 'DOWN', A: 'LEFT', D: 'RIGHT',
      }
      const dir = map[e.key]
      if (!dir) return
      e.preventDefault()

      const opposite: Record<Dir, Dir> = { UP: 'DOWN', DOWN: 'UP', LEFT: 'RIGHT', RIGHT: 'LEFT' }
      if (dir !== opposite[g.dir]) {
        g.nextDir = dir
        if (!g.started) { g.started = true; setStarted(true) }
      }
    }

    window.addEventListener('keydown', onKey)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      window.removeEventListener('keydown', onKey)
    }
  }, [tick, draw, restart])

  return (
    <div className="flex flex-col items-center gap-3 select-none">
      <canvas
        ref={canvasRef}
        width={W}
        height={H}
        className="rounded-xl border dark:border-dark-border border-light-border w-full max-w-[400px]"
        style={{ touchAction: 'none' }}
        aria-label="Snake game canvas"
      />
      {/* Mobile controls */}
      <div className="grid grid-cols-3 gap-1 mt-1">
        {[
          ['', '↑', ''],
          ['←', '', '→'],
          ['', '↓', ''],
        ].flatMap((row, ri) =>
          row.map((cell, ci) => (
            cell ? (
              <button
                key={`${ri}-${ci}`}
                className="w-8 h-8 rounded-lg dark:bg-dark-border bg-light-border text-sm dark:text-slate-300 text-slate-700 hover:bg-accent-500/20 transition-colors"
                onClick={() => {
                  const g = gameRef.current
                  const map: Record<string, Dir> = { '↑': 'UP', '↓': 'DOWN', '←': 'LEFT', '→': 'RIGHT' }
                  const dir = map[cell]
                  if (!dir) return
                  const opposite: Record<Dir, Dir> = { UP: 'DOWN', DOWN: 'UP', LEFT: 'RIGHT', RIGHT: 'LEFT' }
                  if (dir !== opposite[g.dir]) {
                    g.nextDir = dir
                    if (!g.started) { g.started = true; setStarted(true) }
                  }
                }}
                aria-label={`Move ${cell}`}
              >
                {cell}
              </button>
            ) : (
              <div key={`${ri}-${ci}`} className="w-8 h-8" />
            )
          ))
        )}
      </div>
      <div className="flex items-center gap-6 text-sm dark:text-slate-400 text-slate-600">
        <span className="font-mono">Score: <span className="text-accent-400 font-semibold">{score}</span></span>
        <span className="font-mono text-xs dark:text-slate-500 text-slate-500">
          Best: <span className="text-emerald-400">{localStorage.getItem('hs-snake') ?? 0}</span>
        </span>
      </div>
      <button
        onClick={restart}
        className="flex items-center gap-1.5 text-xs dark:text-slate-500 text-slate-500 hover:text-accent-400 transition-colors"
        aria-label="Restart snake"
      >
        <RefreshCw size={12} /> Restart (R)
      </button>
    </div>
  )
}
