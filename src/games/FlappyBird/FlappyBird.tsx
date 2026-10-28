import { useCallback, useRef, useState } from 'react'
import { useCanvas } from '../engine/useCanvas'
import { useGameLoop } from '../engine/useGameLoop'
import { isTouchDevice, useKeyboard } from '../engine/input'
import { readBest, recordScore } from '../engine/storage'
import { GameHud, Overlay, Stage } from '../engine/GameUI'
import { useI18n } from '@/i18n/I18nProvider'

const W = 400
const H = 600
const FLOOR = H - 56
const KEY = 'hs-flappy'

const BIRD_X = 110
const BIRD_R = 15
const GRAVITY = 1650
const FLAP = -500
const MAX_FALL = 720
const PIPE_W = 68
const PIPE_SPACING = 230
const GAP_START = 170
const GAP_MIN = 128
const SPEED_START = 170
const SPEED_MAX = 250

type Phase = 'ready' | 'playing' | 'over'
interface Pipe {
  x: number
  gapY: number
  gap: number
  scored: boolean
}

function newState() {
  return {
    y: H / 2 - 40,
    vy: 0,
    pipes: [] as Pipe[],
    score: 0,
    speed: SPEED_START,
    sinceSpawn: PIPE_SPACING,
    time: 0,
    groundX: 0,
    flapAnim: 0,
    deadTimer: 0,
  }
}

export function FlappyBird() {
  const { canvasRef, ctxRef } = useCanvas(W, H)
  const s = useRef(newState())
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

  const start = useCallback(() => {
    s.current = newState()
    s.current.vy = FLAP
    setScore(0)
    setRecord(false)
    setPhase('playing')
  }, [])

  const flap = useCallback(() => {
    const p = phaseRef.current
    if (p === 'ready') return start()
    if (p === 'over') {
      // short grace period so a panicked extra tap doesn't skip the result
      if (s.current.deadTimer > 0.45) start()
      return
    }
    s.current.vy = FLAP
    s.current.flapAnim = 1
  }, [start])

  useKeyboard(e => {
    if (e.repeat) return
    if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W' || e.key === 'Enter') flap()
  })

  const die = () => {
    const st = s.current
    setPhase('over')
    setRecord(st.score > (readBest(KEY) ?? 0))
    setBest(recordScore(KEY, st.score))
  }

  useGameLoop(
    dt => {
      const st = s.current
      st.time += dt
      st.flapAnim = Math.max(0, st.flapAnim - dt * 5)
      const p = phaseRef.current

      if (p === 'ready') {
        st.y = H / 2 - 40 + Math.sin(st.time * 3) * 8
        st.groundX = (st.groundX + SPEED_START * dt) % 24
        return
      }
      if (p === 'over') {
        st.deadTimer += dt
        // let the bird fall to the ground
        if (st.y + BIRD_R < FLOOR) {
          st.vy = Math.min(MAX_FALL * 1.4, st.vy + GRAVITY * dt)
          st.y = Math.min(FLOOR - BIRD_R, st.y + st.vy * dt)
        }
        return
      }

      st.vy = Math.min(MAX_FALL, st.vy + GRAVITY * dt)
      st.y += st.vy * dt
      const dx = st.speed * dt
      st.groundX = (st.groundX + dx) % 24

      st.sinceSpawn += dx
      if (st.sinceSpawn >= PIPE_SPACING) {
        st.sinceSpawn = 0
        const gap = Math.max(GAP_MIN, GAP_START - st.score * 2)
        const margin = 70
        const gapY = margin + gap / 2 + Math.random() * (FLOOR - margin * 2 - gap)
        st.pipes.push({ x: W + 10, gapY, gap, scored: false })
      }
      for (const pipe of st.pipes) {
        pipe.x -= dx
        if (!pipe.scored && pipe.x + PIPE_W < BIRD_X - BIRD_R) {
          pipe.scored = true
          st.score++
          st.speed = Math.min(SPEED_MAX, SPEED_START + st.score * 2.5)
          setScore(st.score)
        }
      }
      st.pipes = st.pipes.filter(pp => pp.x + PIPE_W > -20)

      if (st.y + BIRD_R >= FLOOR) {
        st.y = FLOOR - BIRD_R
        return die()
      }
      if (st.y - BIRD_R < -40) st.y = BIRD_R - 40

      // circle vs rectangle collision against both pipe halves
      const r = BIRD_R - 3
      for (const pipe of st.pipes) {
        const top = pipe.gapY - pipe.gap / 2
        const bottom = pipe.gapY + pipe.gap / 2
        for (const [ry0, ry1] of [[-1000, top], [bottom, FLOOR]]) {
          const cx = Math.max(pipe.x, Math.min(BIRD_X, pipe.x + PIPE_W))
          const cy = Math.max(ry0, Math.min(st.y, ry1))
          if ((BIRD_X - cx) ** 2 + (st.y - cy) ** 2 < r * r) return die()
        }
      }
    },
    () => {
      const ctx = ctxRef.current
      if (!ctx) return
      const st = s.current

      const sky = ctx.createLinearGradient(0, 0, 0, FLOOR)
      sky.addColorStop(0, '#1e1b4b')
      sky.addColorStop(1, '#4c1d95')
      ctx.fillStyle = sky
      ctx.fillRect(0, 0, W, FLOOR)

      // distant city silhouette
      ctx.fillStyle = 'rgba(15,10,40,0.55)'
      for (let i = 0; i < 10; i++) {
        const bw = 44
        const bx = ((i * bw * 1.1 - st.time * 12) % (W + bw * 2) + W + bw * 2) % (W + bw * 2) - bw
        const bh = 60 + ((i * 37) % 70)
        ctx.fillRect(bx, FLOOR - bh, bw - 6, bh)
      }

      for (const p of st.pipes) {
        const top = p.gapY - p.gap / 2
        const bottom = p.gapY + p.gap / 2
        const grad = ctx.createLinearGradient(p.x, 0, p.x + PIPE_W, 0)
        grad.addColorStop(0, '#15803d')
        grad.addColorStop(0.45, '#4ade80')
        grad.addColorStop(1, '#166534')
        ctx.fillStyle = grad
        ctx.fillRect(p.x, 0, PIPE_W, top)
        ctx.fillRect(p.x, bottom, PIPE_W, FLOOR - bottom)
        ctx.fillRect(p.x - 5, top - 26, PIPE_W + 10, 26)
        ctx.fillRect(p.x - 5, bottom, PIPE_W + 10, 26)
        ctx.fillStyle = 'rgba(0,0,0,0.25)'
        ctx.fillRect(p.x - 5, top - 4, PIPE_W + 10, 4)
        ctx.fillRect(p.x - 5, bottom + 22, PIPE_W + 10, 4)
      }

      // ground
      ctx.fillStyle = '#3b2f1e'
      ctx.fillRect(0, FLOOR, W, H - FLOOR)
      ctx.fillStyle = '#65a30d'
      ctx.fillRect(0, FLOOR, W, 10)
      ctx.fillStyle = '#4d7c0f'
      for (let x = -st.groundX; x < W; x += 24) ctx.fillRect(x, FLOOR + 10, 12, 4)

      // bird
      const dead = phaseRef.current === 'over'
      const angle = phaseRef.current === 'ready' ? 0 : Math.max(-0.45, Math.min(1.3, st.vy / 600))
      ctx.save()
      ctx.translate(BIRD_X, st.y)
      ctx.rotate(angle)
      ctx.fillStyle = dead ? '#f87171' : '#facc15'
      ctx.beginPath()
      ctx.ellipse(0, 0, BIRD_R + 2, BIRD_R, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#fef9c3'
      ctx.beginPath()
      ctx.ellipse(3, 5, 9, 6, 0, 0, Math.PI * 2)
      ctx.fill()
      const wing = st.flapAnim > 0 ? -8 : Math.sin(st.time * 14) * 3
      ctx.fillStyle = dead ? '#dc2626' : '#eab308'
      ctx.beginPath()
      ctx.ellipse(-6, wing, 9, 5, -0.3, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#fff'
      ctx.beginPath()
      ctx.arc(7, -5, 5, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#111'
      ctx.beginPath()
      ctx.arc(8.5, -5, 2.4, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#f97316'
      ctx.beginPath()
      ctx.moveTo(13, -1)
      ctx.lineTo(23, 3)
      ctx.lineTo(13, 7)
      ctx.fill()
      ctx.restore()

      if (phaseRef.current === 'playing') {
        ctx.font = '700 44px Inter, sans-serif'
        ctx.textAlign = 'center'
        ctx.lineWidth = 6
        ctx.strokeStyle = 'rgba(0,0,0,0.45)'
        ctx.strokeText(String(st.score), W / 2, 82)
        ctx.fillStyle = '#fff'
        ctx.fillText(String(st.score), W / 2, 82)
        ctx.textAlign = 'left'
      }
    }
  )

  const overlay =
    phase === 'ready' ? (
      <Overlay title={tr.arcade.games.flappy.title} subtitle={touch ? g$.flappy.hintTouch : g$.flappy.hintKeys} action={g$.start} onAction={start} />
    ) : phase === 'over' ? (
      <Overlay title={g$.gameOver} subtitle={g$.flappy.result(score) + (record ? g$.newBest : '')} action={g$.tryAgain} onAction={() => s.current.deadTimer > 0.45 && start()} />
    ) : null

  return (
    <div>
      <GameHud stats={[{ label: g$.score, value: score }, { label: g$.best, value: best }]} onRestart={start} />
      <div
        className="touch-none select-none"
        onPointerDown={e => {
          if (phaseRef.current !== 'playing') return
          e.preventDefault()
          flap()
        }}
      >
        <Stage ratio={W / H} reserve={210} maxWidth={440} overlay={overlay}>
          <canvas ref={canvasRef} className="block h-full w-full cursor-pointer" aria-label="Flappy game" />
        </Stage>
      </div>
    </div>
  )
}
