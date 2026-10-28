import { useCallback, useRef, useState } from 'react'
import { useCanvas } from '../engine/useCanvas'
import { useGameLoop } from '../engine/useGameLoop'
import { isTouchDevice, useKeyboard } from '../engine/input'
import { readBest, recordScore } from '../engine/storage'
import { GameHud, Overlay, Stage } from '../engine/GameUI'
import { useI18n } from '@/i18n/I18nProvider'

const W = 640
const H = 480
const KEY = 'hs-breakout'

const PADDLE_Y = 440
const PADDLE_H = 12
const PADDLE_W = 100
const PADDLE_KEY_SPEED = 760
const BALL_R = 7
const BALL_SPEED = 390
const BALL_SPEED_MAX = 640

const BRICK_COLS = 10
const BRICK_ROWS = 6
const BRICK_GAP = 6
const BRICK_TOP = 64
const BRICK_H = 20
const BRICK_W = (W - 40 - BRICK_GAP * (BRICK_COLS - 1)) / BRICK_COLS
const ROW_COLORS = ['#f87171', '#fb923c', '#facc15', '#4ade80', '#38bdf8', '#a78bfa']

type Phase = 'ready' | 'serving' | 'playing' | 'over' | 'won'

interface Brick {
  x: number
  y: number
  row: number
  alive: boolean
}
interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  color: string
}

function makeBricks(): Brick[] {
  const bricks: Brick[] = []
  for (let r = 0; r < BRICK_ROWS; r++)
    for (let c = 0; c < BRICK_COLS; c++)
      bricks.push({ x: 20 + c * (BRICK_W + BRICK_GAP), y: BRICK_TOP + r * (BRICK_H + BRICK_GAP), row: r, alive: true })
  return bricks
}

function newState() {
  return {
    paddleX: W / 2 - PADDLE_W / 2,
    targetX: null as number | null,
    keys: { left: false, right: false },
    ball: { x: W / 2, y: PADDLE_Y - BALL_R - 1, vx: 0, vy: 0 },
    speed: BALL_SPEED,
    bricks: makeBricks(),
    particles: [] as Particle[],
    lives: 3,
    score: 0,
    level: 1,
  }
}

export function Breakout() {
  const { canvasRef, ctxRef } = useCanvas(W, H)
  const stageRef = useRef<HTMLDivElement>(null)
  const s = useRef(newState())
  const phaseRef = useRef<Phase>('ready')
  const [phase, setPhaseState] = useState<Phase>('ready')
  const [hud, setHud] = useState({ score: 0, lives: 3, level: 1 })
  const [best, setBest] = useState(() => readBest(KEY) ?? 0)
  const [record, setRecord] = useState(false)
  const touch = useState(isTouchDevice)[0]
  const { t: tr } = useI18n()
  const g$ = tr.game

  const setPhase = (p: Phase) => {
    phaseRef.current = p
    setPhaseState(p)
  }
  const sync = () => setHud({ score: s.current.score, lives: s.current.lives, level: s.current.level })

  const launch = useCallback(() => {
    const p = phaseRef.current
    if (p === 'ready' || p === 'over' || p === 'won') {
      if (p !== 'ready') s.current = newState()
      setRecord(false)
      sync()
      setPhase('serving')
      return
    }
    if (p !== 'serving') return
    const st = s.current
    const angle = -Math.PI / 2 + (Math.random() - 0.5) * 0.7
    st.ball.vx = Math.cos(angle) * st.speed
    st.ball.vy = Math.sin(angle) * st.speed
    setPhase('playing')
  }, [])

  const restart = useCallback(() => {
    s.current = newState()
    setRecord(false)
    sync()
    setPhase('serving')
  }, [])

  useKeyboard(
    e => {
      const k = s.current.keys
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        k.left = true
        s.current.targetX = null
      }
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        k.right = true
        s.current.targetX = null
      }
      if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) launch()
    },
    e => {
      const k = s.current.keys
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') k.left = false
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') k.right = false
    }
  )

  const pointerToX = (clientX: number) => {
    const rect = stageRef.current?.querySelector('canvas')?.getBoundingClientRect()
    if (!rect) return
    s.current.targetX = ((clientX - rect.left) / rect.width) * W - PADDLE_W / 2
  }

  const endGame = (phase: 'over' | 'won') => {
    const st = s.current
    setRecord(st.score > (readBest(KEY) ?? 0))
    setBest(recordScore(KEY, st.score))
    sync()
    setPhase(phase)
  }

  const burst = (x: number, y: number, color: string) => {
    const st = s.current
    for (let i = 0; i < 8; i++) {
      const a = Math.random() * Math.PI * 2
      const v = 60 + Math.random() * 140
      st.particles.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 0.5, color })
    }
    if (st.particles.length > 120) st.particles.splice(0, st.particles.length - 120)
  }

  useGameLoop(
    dt => {
      const st = s.current
      for (const p of st.particles) {
        p.x += p.vx * dt
        p.y += p.vy * dt
        p.vy += 500 * dt
        p.life -= dt
      }
      st.particles = st.particles.filter(p => p.life > 0)

      const p = phaseRef.current
      if (p === 'ready' || p === 'over' || p === 'won') return

      // Paddle: keys move at constant speed, the mouse is followed with fast easing.
      if (st.keys.left) st.paddleX -= PADDLE_KEY_SPEED * dt
      if (st.keys.right) st.paddleX += PADDLE_KEY_SPEED * dt
      if (st.targetX !== null) st.paddleX += (st.targetX - st.paddleX) * Math.min(1, dt * 25)
      st.paddleX = Math.max(0, Math.min(W - PADDLE_W, st.paddleX))

      const b = st.ball
      if (p === 'serving') {
        b.x = st.paddleX + PADDLE_W / 2
        b.y = PADDLE_Y - BALL_R - 1
        return
      }

      b.x += b.vx * dt
      b.y += b.vy * dt

      if (b.x < BALL_R) {
        b.x = BALL_R
        b.vx = Math.abs(b.vx)
      } else if (b.x > W - BALL_R) {
        b.x = W - BALL_R
        b.vx = -Math.abs(b.vx)
      }
      if (b.y < BALL_R) {
        b.y = BALL_R
        b.vy = Math.abs(b.vy)
      }

      // Paddle: bounce angle depends on where the ball hits.
      if (
        b.vy > 0 &&
        b.y + BALL_R >= PADDLE_Y &&
        b.y - BALL_R <= PADDLE_Y + PADDLE_H &&
        b.x >= st.paddleX - BALL_R &&
        b.x <= st.paddleX + PADDLE_W + BALL_R
      ) {
        const rel = Math.max(-1, Math.min(1, (b.x - (st.paddleX + PADDLE_W / 2)) / (PADDLE_W / 2)))
        const angle = rel * (Math.PI / 3)
        b.vx = Math.sin(angle) * st.speed
        b.vy = -Math.cos(angle) * st.speed
        b.y = PADDLE_Y - BALL_R
      }

      // Bricks: one hit per step, reflect on the axis of least penetration.
      for (const br of st.bricks) {
        if (!br.alive) continue
        const cx = Math.max(br.x, Math.min(b.x, br.x + BRICK_W))
        const cy = Math.max(br.y, Math.min(b.y, br.y + BRICK_H))
        if ((b.x - cx) ** 2 + (b.y - cy) ** 2 > BALL_R * BALL_R) continue
        br.alive = false
        const overlapX = Math.min(b.x + BALL_R - br.x, br.x + BRICK_W - (b.x - BALL_R))
        const overlapY = Math.min(b.y + BALL_R - br.y, br.y + BRICK_H - (b.y - BALL_R))
        if (overlapX < overlapY) b.vx = -b.vx
        else b.vy = -b.vy
        st.score += (BRICK_ROWS - br.row) * 10
        st.speed = Math.min(BALL_SPEED_MAX, st.speed + 3)
        const len = Math.hypot(b.vx, b.vy)
        b.vx = (b.vx / len) * st.speed
        b.vy = (b.vy / len) * st.speed
        burst(br.x + BRICK_W / 2, br.y + BRICK_H / 2, ROW_COLORS[br.row])
        sync()
        break
      }

      if (st.bricks.every(br => !br.alive)) {
        // Next level: a fresh wall and a slightly faster ball.
        st.level++
        st.bricks = makeBricks()
        st.speed = Math.min(BALL_SPEED_MAX, BALL_SPEED + (st.level - 1) * 40)
        sync()
        setPhase('serving')
        if (st.level > 5) endGame('won')
        return
      }

      if (b.y - BALL_R > H) {
        st.lives--
        sync()
        if (st.lives <= 0) endGame('over')
        else setPhase('serving')
      }
    },
    () => {
      const ctx = ctxRef.current
      if (!ctx) return
      const st = s.current

      const bg = ctx.createLinearGradient(0, 0, 0, H)
      bg.addColorStop(0, '#0b0b14')
      bg.addColorStop(1, '#111827')
      ctx.fillStyle = bg
      ctx.fillRect(0, 0, W, H)

      for (const br of st.bricks) {
        if (!br.alive) continue
        ctx.fillStyle = ROW_COLORS[br.row]
        ctx.beginPath()
        ctx.roundRect(br.x, br.y, BRICK_W, BRICK_H, 4)
        ctx.fill()
        ctx.fillStyle = 'rgba(255,255,255,0.25)'
        ctx.fillRect(br.x + 3, br.y + 3, BRICK_W - 6, 3)
      }

      for (const p of st.particles) {
        ctx.globalAlpha = Math.max(0, p.life * 2)
        ctx.fillStyle = p.color
        ctx.fillRect(p.x - 2, p.y - 2, 4, 4)
      }
      ctx.globalAlpha = 1

      ctx.fillStyle = '#a79dff'
      ctx.beginPath()
      ctx.roundRect(st.paddleX, PADDLE_Y, PADDLE_W, PADDLE_H, 6)
      ctx.fill()
      ctx.fillStyle = 'rgba(255,255,255,0.35)'
      ctx.fillRect(st.paddleX + 8, PADDLE_Y + 2, PADDLE_W - 16, 2)

      ctx.fillStyle = '#ffffff'
      ctx.beginPath()
      ctx.arc(st.ball.x, st.ball.y, BALL_R, 0, Math.PI * 2)
      ctx.fill()

      // lives
      for (let i = 0; i < st.lives; i++) {
        ctx.fillStyle = '#f87171'
        ctx.beginPath()
        ctx.arc(W - 24 - i * 20, 28, 6, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.fillStyle = 'rgba(255,255,255,0.55)'
      ctx.font = '500 14px "JetBrains Mono", monospace'
      ctx.fillText(`${g$.breakout.levelLabel} ${st.level}`, 20, 33)

      if (phaseRef.current === 'serving') {
        ctx.fillStyle = 'rgba(255,255,255,0.7)'
        ctx.font = '500 15px Inter, sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText(touch ? g$.breakout.launchTouch : g$.breakout.launchKeys, W / 2, 330)
        ctx.textAlign = 'left'
      }
    }
  )

  const overlay =
    phase === 'ready' ? (
      <Overlay title={tr.arcade.games.breakout.title} subtitle={touch ? g$.breakout.hintTouch : g$.breakout.hintKeys} action={g$.start} onAction={launch} />
    ) : phase === 'over' || phase === 'won' ? (
      <Overlay
        title={phase === 'won' ? g$.breakout.cleared : g$.gameOver}
        subtitle={g$.breakout.result(hud.score) + (record ? g$.newBest : '')}
        action={g$.playAgain}
        onAction={launch}
      />
    ) : null

  return (
    <div>
      <GameHud
        stats={[
          { label: g$.score, value: hud.score },
          { label: g$.lives, value: hud.lives },
          { label: g$.level, value: hud.level },
          { label: g$.best, value: best },
        ]}
        onRestart={restart}
      />
      <div
        ref={stageRef}
        className="touch-none"
        onPointerMove={e => pointerToX(e.clientX)}
        onPointerDown={e => {
          pointerToX(e.clientX)
          if (phaseRef.current === 'serving') launch()
        }}
      >
        <Stage ratio={W / H} reserve={210} overlay={overlay}>
          <canvas ref={canvasRef} className="block h-full w-full cursor-none" aria-label="Breakout game" />
        </Stage>
      </div>
    </div>
  )
}
