import { useCallback, useRef, useState } from 'react'
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp } from 'lucide-react'
import { useCanvas } from '../engine/useCanvas'
import { useGameLoop } from '../engine/useGameLoop'
import { isTouchDevice, useKeyboard, useSwipe } from '../engine/input'
import { readBest, recordScore } from '../engine/storage'
import { GameButton, GameHud, Overlay, Stage } from '../engine/GameUI'
import { useI18n } from '@/i18n/I18nProvider'

const COLS = 20
const ROWS = 15
const CELL = 30
const W = COLS * CELL
const H = ROWS * CELL
const KEY = 'hs-snake'

type Dir = 'up' | 'down' | 'left' | 'right'
type Point = { x: number; y: number }
type Phase = 'ready' | 'playing' | 'paused' | 'over'

const VEC: Record<Dir, Point> = { up: { x: 0, y: -1 }, down: { x: 0, y: 1 }, left: { x: -1, y: 0 }, right: { x: 1, y: 0 } }
const OPPOSITE: Record<Dir, Dir> = { up: 'down', down: 'up', left: 'right', right: 'left' }
const KEYMAP: Record<string, Dir> = {
  ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
  w: 'up', s: 'down', a: 'left', d: 'right', W: 'up', S: 'down', A: 'left', D: 'right',
}

function placeFood(snake: Point[]): Point {
  const free: Point[] = []
  for (let x = 0; x < COLS; x++)
    for (let y = 0; y < ROWS; y++) if (!snake.some(s => s.x === x && s.y === y)) free.push({ x, y })
  return free[Math.floor(Math.random() * free.length)] ?? { x: 0, y: 0 }
}

function initialState() {
  const snake = [{ x: 6, y: 7 }, { x: 5, y: 7 }, { x: 4, y: 7 }]
  return {
    snake,
    prev: snake.map(p => ({ ...p })),
    dir: 'right' as Dir,
    queue: [] as Dir[],
    food: placeFood(snake),
    score: 0,
    stepTime: 0.12,
    acc: 0,
    time: 0,
    flash: 0,
  }
}

export function Snake() {
  const { canvasRef, ctxRef } = useCanvas(W, H)
  const stageRef = useRef<HTMLDivElement>(null)
  const game = useRef(initialState())
  const phaseRef = useRef<Phase>('ready')
  const [phase, setPhaseState] = useState<Phase>('ready')
  const [score, setScore] = useState(0)
  const [best, setBest] = useState(() => readBest(KEY) ?? 0)
  const [record, setRecord] = useState(false)
  const touch = useState(isTouchDevice)[0]
  const { t: tr } = useI18n()
  const g$ = tr.game

  const setPhase = (p: Phase) => {
    phaseRef.current = p
    setPhaseState(p)
  }

  const restart = useCallback(() => {
    game.current = initialState()
    setScore(0)
    setPhase('playing')
  }, [])

  const turn = useCallback(
    (dir: Dir) => {
      const g = game.current
      if (phaseRef.current === 'ready') setPhase('playing')
      if (phaseRef.current !== 'playing') return
      const last = g.queue[g.queue.length - 1] ?? g.dir
      if (dir !== last && dir !== OPPOSITE[last] && g.queue.length < 3) g.queue.push(dir)
    },
    []
  )

  useKeyboard(e => {
    const dir = KEYMAP[e.key]
    if (dir) return turn(dir)
    if (e.key === 'p' || e.key === 'P') {
      if (phaseRef.current === 'playing') setPhase('paused')
      else if (phaseRef.current === 'paused') setPhase('playing')
    }
    if ((e.key === ' ' || e.key === 'Enter' || e.key === 'r' || e.key === 'R') && phaseRef.current !== 'playing') {
      if (phaseRef.current === 'paused') setPhase('playing')
      else restart()
    }
  })

  useSwipe(stageRef, d => turn(d))

  const advance = () => {
    const g = game.current
    const next = g.queue.shift()
    if (next) g.dir = next
    const head = g.snake[0]
    const v = VEC[g.dir]
    // Walls wrap around: leaving one side brings you back on the other.
    const nh = { x: (head.x + v.x + COLS) % COLS, y: (head.y + v.y + ROWS) % ROWS }
    const eating = nh.x === g.food.x && nh.y === g.food.y
    const body = eating ? g.snake : g.snake.slice(0, -1)

    if (body.some(s => s.x === nh.x && s.y === nh.y)) {
      g.flash = 1
      setPhase('over')
      setRecord(g.score > (readBest(KEY) ?? 0))
      setBest(recordScore(KEY, g.score))
      return
    }

    g.prev = g.snake.map(p => ({ ...p }))
    g.snake = [nh, ...body]
    if (eating) {
      g.score += 1
      g.stepTime = Math.max(0.055, 0.12 - g.score * 0.0025)
      g.food = placeFood(g.snake)
      setScore(g.score)
    }
  }

  useGameLoop(
    dt => {
      const g = game.current
      g.time += dt
      g.flash = Math.max(0, g.flash - dt * 2)
      if (phaseRef.current !== 'playing') return
      g.acc += dt
      while (g.acc >= g.stepTime && phaseRef.current === 'playing') {
        g.acc -= g.stepTime
        advance()
      }
    },
    () => {
      const ctx = ctxRef.current
      if (!ctx) return
      const g = game.current
      const t = phaseRef.current === 'playing' ? g.acc / g.stepTime : phaseRef.current === 'ready' ? 0 : 1

      ctx.fillStyle = '#0c0f0d'
      ctx.fillRect(0, 0, W, H)
      // checkerboard
      ctx.fillStyle = '#101512'
      for (let x = 0; x < COLS; x++)
        for (let y = 0; y < ROWS; y++) if ((x + y) % 2 === 0) ctx.fillRect(x * CELL, y * CELL, CELL, CELL)

      // food
      const pulse = 1 + Math.sin(g.time * 6) * 0.08
      const fx = g.food.x * CELL + CELL / 2
      const fy = g.food.y * CELL + CELL / 2
      ctx.fillStyle = 'rgba(248,113,113,0.18)'
      ctx.beginPath()
      ctx.arc(fx, fy, CELL * 0.5 * pulse, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#f87171'
      ctx.beginPath()
      ctx.arc(fx, fy, CELL * 0.3 * pulse, 0, Math.PI * 2)
      ctx.fill()

      // snake, drawn as one smooth stroke through interpolated segment centres
      const pts = g.snake.map((p, i) => {
        let from = g.prev[i] ?? g.prev[g.prev.length - 1]
        // A segment that just wrapped through a wall jumps instead of sliding across the board.
        if (Math.abs(from.x - p.x) > 1 || Math.abs(from.y - p.y) > 1) from = p
        return {
          x: (from.x + (p.x - from.x) * t) * CELL + CELL / 2,
          y: (from.y + (p.y - from.y) * t) * CELL + CELL / 2,
        }
      })
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      const dead = phaseRef.current === 'over'
      for (let i = pts.length - 1; i > 0; i--) {
        const k = i / pts.length
        ctx.strokeStyle = dead ? `rgba(239,68,68,${1 - k * 0.5})` : `hsl(${142 - k * 30} 70% ${50 - k * 18}%)`
        ctx.lineWidth = CELL * (0.74 - k * 0.22)
        ctx.beginPath()
        ctx.moveTo(pts[i].x, pts[i].y)
        // Across a wall wrap the two points are far apart: draw dots instead of a line.
        if (Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y) > CELL * 1.5) ctx.lineTo(pts[i].x + 0.01, pts[i].y)
        else ctx.lineTo(pts[i - 1].x, pts[i - 1].y)
        ctx.stroke()
      }
      const h = pts[0]
      ctx.fillStyle = dead ? '#ef4444' : '#4ade80'
      ctx.beginPath()
      ctx.arc(h.x, h.y, CELL * 0.4, 0, Math.PI * 2)
      ctx.fill()
      // eyes
      const v = VEC[g.dir]
      const ex = -v.y * CELL * 0.17
      const ey = v.x * CELL * 0.17
      ctx.fillStyle = '#0c0f0d'
      for (const s of [1, -1]) {
        ctx.beginPath()
        ctx.arc(h.x + v.x * CELL * 0.12 + ex * s, h.y + v.y * CELL * 0.12 + ey * s, CELL * 0.07, 0, Math.PI * 2)
        ctx.fill()
      }

      if (g.flash > 0) {
        ctx.fillStyle = `rgba(239,68,68,${g.flash * 0.25})`
        ctx.fillRect(0, 0, W, H)
      }
    }
  )

  const overlay =
    phase === 'ready' ? (
      <Overlay title={tr.arcade.games.snake.title} subtitle={touch ? g$.snake.hintTouch : g$.snake.hintKeys} action={g$.start} onAction={restart} />
    ) : phase === 'paused' ? (
      <Overlay title={g$.paused} action={g$.resume} onAction={() => setPhase('playing')} />
    ) : phase === 'over' ? (
      <Overlay title={g$.gameOver} subtitle={g$.snake.result(score) + (record ? g$.newBest : '')} action={g$.playAgain} onAction={restart} />
    ) : null

  return (
    <div>
      <GameHud stats={[{ label: g$.score, value: score }, { label: g$.best, value: best }]} onRestart={restart} />
      <div ref={stageRef}>
        <Stage ratio={W / H} reserve={touch ? 360 : 220} overlay={overlay}>
          <canvas ref={canvasRef} className="block h-full w-full" aria-label="Snake game board" />
        </Stage>
      </div>
      {touch && (
        <div className="mx-auto mt-4 grid w-44 grid-cols-3 gap-2">
          <span />
          <GameButton label={g$.up} onPress={() => turn('up')}><ArrowUp size={20} /></GameButton>
          <span />
          <GameButton label={g$.left} onPress={() => turn('left')}><ArrowLeft size={20} /></GameButton>
          <GameButton label={g$.down} onPress={() => turn('down')}><ArrowDown size={20} /></GameButton>
          <GameButton label={g$.right} onPress={() => turn('right')}><ArrowRight size={20} /></GameButton>
        </div>
      )}
    </div>
  )
}
