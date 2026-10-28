import { useCallback, useRef, useState } from 'react'
import { ArrowDown, ArrowUp } from 'lucide-react'
import { useCanvas } from '../engine/useCanvas'
import { useGameLoop } from '../engine/useGameLoop'
import { isTouchDevice, useKeyboard } from '../engine/input'
import { readBest, recordScore } from '../engine/storage'
import { GameButton, GameHud, Overlay, Stage } from '../engine/GameUI'
import { useI18n } from '@/i18n/I18nProvider'

const W = 800
const H = 280
const GROUND = 232
const KEY = 'hs-dino'

const PLAYER_X = 90
const RUN = { w: 40, h: 50 }
const DUCK = { w: 56, h: 30 }
const GRAVITY = 2700
const JUMP_VELOCITY = -760 // tap ≈ 105px high
const HOLD_GRAVITY = 0.72 // holding the key on the way up ≈ 150px high
const COYOTE = 0.08
const BUFFER = 0.12
const START_SPEED = 430
const MAX_SPEED = 1050

type Phase = 'ready' | 'playing' | 'over'
interface Obstacle {
  kind: 'cactus' | 'bird'
  x: number
  y: number
  w: number
  h: number
}

function newState() {
  return {
    y: GROUND - RUN.h,
    vy: 0,
    onGround: true,
    ducking: false,
    jumpHeld: false,
    coyote: 0,
    buffer: 0,
    speed: START_SPEED,
    distance: 0,
    obstacles: [] as Obstacle[],
    nextGap: 500,
    time: 0,
    milestoneFlash: 0,
    stars: Array.from({ length: 40 }, () => ({ x: Math.random() * W, y: Math.random() * (GROUND - 60), s: Math.random() * 1.5 + 0.5 })),
    pebbles: Array.from({ length: 24 }, () => ({ x: Math.random() * W, y: GROUND + 8 + Math.random() * 30, w: Math.random() * 6 + 2 })),
  }
}

export function DinoRunner() {
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
    setScore(0)
    setRecord(false)
    setPhase('playing')
  }, [])

  const jumpDown = () => {
    if (phaseRef.current === 'ready') start()
    else if (phaseRef.current === 'over') return start()
    s.current.jumpHeld = true
    s.current.buffer = BUFFER
  }
  const jumpUp = () => {
    s.current.jumpHeld = false
  }
  const duck = (on: boolean) => {
    s.current.ducking = on
  }

  useKeyboard(
    e => {
      if (e.repeat) return
      if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') jumpDown()
      if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') duck(true)
      if ((e.key === 'Enter' || e.key === 'r' || e.key === 'R') && phaseRef.current !== 'playing') start()
    },
    e => {
      if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') jumpUp()
      if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') duck(false)
    }
  )

  const spawn = () => {
    const st = s.current
    const score = Math.floor(st.distance / 10)
    const birdChance = score > 250 ? 0.3 : 0
    if (Math.random() < birdChance) {
      // low: jump over it · middle: duck under it · high: just keep running
      const tops = [GROUND - 36, GROUND - 62, GROUND - 116]
      st.obstacles.push({ kind: 'bird', x: W + 20, y: tops[Math.floor(Math.random() * tops.length)], w: 42, h: 26 })
    } else {
      const count = score > 150 && Math.random() < 0.35 ? 2 + Math.floor(Math.random() * 2) : 1
      let x = W + 20
      for (let i = 0; i < count; i++) {
        const w = 18 + Math.random() * 10
        const h = 36 + Math.random() * 26
        st.obstacles.push({ kind: 'cactus', x, y: GROUND - h, w, h })
        x += w + 6
      }
    }
    st.nextGap = st.speed * (0.62 + Math.random() * 0.65) + 140
  }

  useGameLoop(
    dt => {
      const st = s.current
      st.time += dt
      if (phaseRef.current !== 'playing') return

      st.speed = Math.min(MAX_SPEED, st.speed + dt * 9)
      const dx = st.speed * dt
      st.distance += dx
      const newScore = Math.floor(st.distance / 10)
      if (Math.floor(newScore / 100) > Math.floor((newScore - dx / 10) / 100)) st.milestoneFlash = 1
      st.milestoneFlash = Math.max(0, st.milestoneFlash - dt * 2)

      // Jumping with coyote time and input buffering so it feels responsive.
      st.coyote = st.onGround ? COYOTE : Math.max(0, st.coyote - dt)
      st.buffer = Math.max(0, st.buffer - dt)
      if (st.buffer > 0 && st.coyote > 0) {
        st.vy = JUMP_VELOCITY
        st.onGround = false
        st.buffer = 0
        st.coyote = 0
      }
      const g = st.vy < 0 && st.jumpHeld ? GRAVITY * HOLD_GRAVITY : st.ducking ? GRAVITY * 2.2 : GRAVITY
      st.vy += g * dt
      st.y += st.vy * dt
      const h = st.ducking && st.onGround ? DUCK.h : RUN.h
      if (st.y >= GROUND - h) {
        st.y = GROUND - h
        st.vy = 0
        st.onGround = true
      } else st.onGround = false
      if (st.y < 8) {
        st.y = 8
        st.vy = Math.max(st.vy, 0)
      }

      for (const o of st.obstacles) o.x -= dx * (o.kind === 'bird' ? 1.08 : 1)
      st.obstacles = st.obstacles.filter(o => o.x + o.w > -20)
      st.nextGap -= dx
      if (st.nextGap <= 0) spawn()

      for (const p of st.stars) p.x = (p.x - dx * 0.05 * p.s + W) % W
      for (const p of st.pebbles) p.x = (p.x - dx + W * 2) % W

      // Collision with a slightly forgiving hitbox.
      const box = st.ducking && st.onGround ? DUCK : RUN
      const px = PLAYER_X + 6
      const py = st.y + 6
      const pw = box.w - 12
      const ph = box.h - 10
      for (const o of st.obstacles) {
        if (px < o.x + o.w - 4 && px + pw > o.x + 4 && py < o.y + o.h - 4 && py + ph > o.y + 4) {
          const final = Math.floor(st.distance / 10)
          setScore(final)
          setRecord(final > (readBest(KEY) ?? 0))
          setBest(recordScore(KEY, final))
          setPhase('over')
          return
        }
      }
      if (newScore !== score && newScore % 5 === 0) setScore(newScore)
    },
    () => {
      const ctx = ctxRef.current
      if (!ctx) return
      const st = s.current
      const dead = phaseRef.current === 'over'

      const sky = ctx.createLinearGradient(0, 0, 0, H)
      sky.addColorStop(0, '#0b0b14')
      sky.addColorStop(1, '#16142a')
      ctx.fillStyle = sky
      ctx.fillRect(0, 0, W, H)

      for (const p of st.stars) {
        ctx.fillStyle = `rgba(255,255,255,${0.25 + p.s * 0.2})`
        ctx.fillRect(p.x, p.y, p.s, p.s)
      }
      // moon
      ctx.fillStyle = '#e9e6ff'
      ctx.beginPath()
      ctx.arc(680, 58, 18, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#0d0c18'
      ctx.beginPath()
      ctx.arc(689, 52, 16, 0, Math.PI * 2)
      ctx.fill()

      // ground
      ctx.fillStyle = '#7c6cff'
      ctx.fillRect(0, GROUND, W, 2)
      ctx.fillStyle = 'rgba(124,108,255,0.35)'
      for (const p of st.pebbles) ctx.fillRect(p.x, p.y, p.w, 2)

      // obstacles
      for (const o of st.obstacles) {
        if (o.kind === 'cactus') {
          ctx.fillStyle = '#10b981'
          ctx.beginPath()
          ctx.roundRect(o.x, o.y, o.w, o.h + 2, [6, 6, 0, 0])
          ctx.fill()
          ctx.fillStyle = '#34d399'
          const arm = o.h * 0.4
          ctx.beginPath()
          ctx.roundRect(o.x - 7, o.y + o.h * 0.35, 8, arm * 0.6, 3)
          ctx.roundRect(o.x - 7, o.y + o.h * 0.35 - 8, 5, 12, 3)
          ctx.roundRect(o.x + o.w - 1, o.y + o.h * 0.25, 8, arm * 0.5, 3)
          ctx.roundRect(o.x + o.w + 2, o.y + o.h * 0.25 - 8, 5, 12, 3)
          ctx.fill()
        } else {
          const flap = Math.sin(st.time * 18) > 0
          ctx.fillStyle = '#f472b6'
          ctx.beginPath()
          ctx.ellipse(o.x + 22, o.y + 15, 16, 8, 0, 0, Math.PI * 2)
          ctx.fill()
          ctx.beginPath()
          ctx.moveTo(o.x + 14, o.y + 12)
          ctx.lineTo(o.x + 26, o.y + (flap ? -4 : 30))
          ctx.lineTo(o.x + 32, o.y + 12)
          ctx.fill()
          ctx.fillStyle = '#fbbf24'
          ctx.beginPath()
          ctx.moveTo(o.x + 6, o.y + 13)
          ctx.lineTo(o.x - 4, o.y + 16)
          ctx.lineTo(o.x + 6, o.y + 18)
          ctx.fill()
        }
      }

      // player
      const ducking = st.ducking && st.onGround
      const box = ducking ? DUCK : RUN
      const x = PLAYER_X
      const y = st.y
      const body = dead ? '#ef4444' : '#a79dff'
      ctx.fillStyle = body
      if (ducking) {
        ctx.beginPath()
        ctx.roundRect(x, y + 6, box.w - 12, box.h - 12, 6)
        ctx.roundRect(x + box.w - 22, y, 22, 18, 5)
        ctx.fill()
      } else {
        ctx.beginPath()
        ctx.roundRect(x, y + 14, box.w - 6, box.h - 26, 7)
        ctx.roundRect(x + 14, y, box.w - 12, 20, 6)
        ctx.roundRect(x - 8, y + 18, 12, 8, 3)
        ctx.fill()
      }
      // eye
      ctx.fillStyle = '#0b0b14'
      ctx.fillRect(ducking ? x + box.w - 9 : x + box.w - 10, ducking ? y + 5 : y + 6, 4, 4)
      // legs
      ctx.fillStyle = body
      const step = Math.floor(st.distance / 28) % 2
      const legY = y + box.h - 12
      if (!st.onGround) {
        ctx.fillRect(x + 6, legY, 8, 10)
        ctx.fillRect(x + 20, legY, 8, 10)
      } else {
        ctx.fillRect(x + 6, legY + (step ? 0 : 4), 8, step ? 12 : 8)
        ctx.fillRect(x + 20, legY + (step ? 4 : 0), 8, step ? 8 : 12)
      }

      // score
      const shown = Math.floor(st.distance / 10)
      ctx.font = '600 16px "JetBrains Mono", monospace'
      ctx.textAlign = 'right'
      ctx.fillStyle = st.milestoneFlash > 0 && Math.floor(st.milestoneFlash * 8) % 2 === 0 ? '#ffffff' : 'rgba(255,255,255,0.6)'
      ctx.fillText(String(shown).padStart(5, '0'), W - 20, 34)
      ctx.textAlign = 'left'
    }
  )

  const overlay =
    phase === 'ready' ? (
      <Overlay title={tr.arcade.games.dino.title} subtitle={touch ? g$.runner.hintTouch : g$.runner.hintKeys} action={g$.start} onAction={start} />
    ) : phase === 'over' ? (
      <Overlay title={g$.gameOver} subtitle={g$.runner.result(score) + (record ? g$.newBest : '')} action={g$.runAgain} onAction={start} />
    ) : null

  return (
    <div>
      <GameHud stats={[{ label: g$.score, value: score }, { label: g$.best, value: best }]} onRestart={start} />
      <div
        onPointerDown={e => {
          if (phaseRef.current !== 'playing' || (e.target as HTMLElement).closest('button')) return
          e.preventDefault()
          jumpDown()
        }}
        onPointerUp={jumpUp}
        className="touch-none"
      >
        <Stage ratio={W / H} reserve={touch ? 320 : 220} overlay={overlay}>
          <canvas ref={canvasRef} className="block h-full w-full cursor-pointer" aria-label="Runner game" />
        </Stage>
      </div>
      {touch && (
        <div className="mx-auto mt-4 grid max-w-xs grid-cols-2 gap-3">
          <GameButton label={g$.runner.duck} onPress={() => duck(true)} onRelease={() => duck(false)}>
            <ArrowDown size={20} />
          </GameButton>
          <GameButton label={g$.runner.jump} onPress={jumpDown} onRelease={jumpUp} className="bg-accent text-accent-fg">
            <ArrowUp size={20} />
          </GameButton>
        </div>
      )}
    </div>
  )
}
