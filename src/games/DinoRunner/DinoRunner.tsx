import React, { useRef, useEffect, useState } from 'react'
import { RefreshCw } from 'lucide-react'

const W        = 600
const H        = 160
const GROUND_Y = 128
const DINO_W   = 26
const DINO_H   = 34
const DINO_X   = 54
const OBS_W    = 16
const OBS_MIN  = 30
const OBS_MAX  = 56
const GRAVITY  = 0.6
const JUMP_V   = -13.5

interface Obstacle { x: number; height: number }

interface GS {
  running:   boolean
  dead:      boolean
  score:     number
  speed:     number
  vy:        number
  dinoY:     number
  obstacles: Obstacle[]
  frame:     0 | 1
  nextObs:   number
  distance:  number
}

function initGS(): GS {
  return {
    running: false, dead: false, score: 0, speed: 4.5,
    vy: 0, dinoY: GROUND_Y - DINO_H,
    obstacles: [], frame: 0, nextObs: 90, distance: 0,
  }
}

// Draw a blocky dino with ctx
function drawDino(ctx: CanvasRenderingContext2D, y: number, legFrame: 0 | 1, dead: boolean) {
  const x = DINO_X
  ctx.fillStyle = dead ? '#ef4444' : '#9b6af5'
  // body
  ctx.fillRect(x, y + 10, DINO_W, DINO_H - 16)
  // head
  ctx.fillRect(x + 4, y, DINO_W - 2, 16)
  // mouth / eye
  ctx.fillStyle = '#0a0a0f'
  ctx.fillRect(x + DINO_W - 6, y + 3, 4, 4)   // eye
  if (dead) {
    ctx.fillStyle = '#fca5a5'
    ctx.fillRect(x + DINO_W - 8, y + 9, 6, 2) // X-eye when dead
    ctx.fillRect(x + DINO_W - 6, y + 7, 2, 6)
  }
  // tail
  ctx.fillStyle = dead ? '#ef4444' : '#9b6af5'
  ctx.fillRect(x - 6, y + 14, 8, 6)
  // legs
  const onGround = y >= GROUND_Y - DINO_H
  if (onGround && !dead) {
    if (legFrame === 0) {
      ctx.fillRect(x + 2,  y + DINO_H - 8, 8, 8)
      ctx.fillRect(x + 14, y + DINO_H - 4, 8, 4)
    } else {
      ctx.fillRect(x + 2,  y + DINO_H - 4, 8, 4)
      ctx.fillRect(x + 14, y + DINO_H - 8, 8, 8)
    }
  } else {
    ctx.fillRect(x + 2,  y + DINO_H - 8, 8, 6)
    ctx.fillRect(x + 14, y + DINO_H - 8, 8, 6)
  }
}

export const DinoRunner: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const gsRef     = useRef<GS>(initGS())
  const rafRef    = useRef(0)
  const [uiScore, setUiScore] = useState(0)
  const [uiDead,  setUiDead]  = useState(false)
  const [uiBest,  setUiBest]  = useState(() => parseInt(localStorage.getItem('hs-dino') ?? '0', 10))

  // ── game loop ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current!
    const ctx    = canvas.getContext('2d')!

    function loop() {
      const s = gsRef.current
      ctx.clearRect(0, 0, W, H)

      // Sky gradient
      const sky = ctx.createLinearGradient(0, 0, 0, H)
      sky.addColorStop(0, '#0a0a0f')
      sky.addColorStop(1, '#12122b')
      ctx.fillStyle = sky
      ctx.fillRect(0, 0, W, H)

      // Ground + glow
      ctx.fillStyle = 'rgba(124,58,237,0.15)'
      ctx.fillRect(0, GROUND_Y, W, 4)
      ctx.fillStyle = '#7c3aed55'
      ctx.fillRect(0, GROUND_Y + 4, W, 1)

      if (s.running && !s.dead) {
        // Physics
        s.vy    += GRAVITY
        s.dinoY += s.vy
        if (s.dinoY >= GROUND_Y - DINO_H) { s.dinoY = GROUND_Y - DINO_H; s.vy = 0 }

        // Scoring / speed
        s.distance++
        if (s.distance % 5 === 0) {
          s.score++
          if (s.score % 60 === 0) s.speed = Math.min(s.speed + 0.5, 16)
          if (s.distance % 25 === 0) setUiScore(s.score)
        }

        // Spawn obstacles
        s.nextObs--
        if (s.nextObs <= 0) {
          const h = OBS_MIN + Math.random() * (OBS_MAX - OBS_MIN)
          s.obstacles.push({ x: W + 10, height: h })
          s.nextObs = 70 + Math.random() * 70 - s.speed * 1.5
        }
        s.obstacles.forEach(o => { o.x -= s.speed })
        s.obstacles = s.obstacles.filter(o => o.x + OBS_W > 0)

        // Leg animation
        if (s.dinoY >= GROUND_Y - DINO_H && s.distance % 9 === 0)
          s.frame = s.frame === 0 ? 1 : 0

        // Collision
        for (const obs of s.obstacles) {
          const hit =
            DINO_X + DINO_W - 5 > obs.x + 3 &&
            DINO_X + 5         < obs.x + OBS_W - 3 &&
            s.dinoY + DINO_H - 3  > GROUND_Y - obs.height
          if (hit) {
            s.dead = true
            const best = parseInt(localStorage.getItem('hs-dino') ?? '0', 10)
            if (s.score > best) {
              localStorage.setItem('hs-dino', String(s.score))
              setUiBest(s.score)
            }
            setUiDead(true)
            setUiScore(s.score)
            break
          }
        }
      }

      // Draw obstacles (cactus-ish)
      for (const obs of s.obstacles) {
        const ox = obs.x, oy = GROUND_Y - obs.height
        ctx.fillStyle = '#059669'
        ctx.fillRect(ox, oy, OBS_W, obs.height)
        ctx.fillStyle = '#10b981'
        ctx.fillRect(ox - 7, oy + 10, 9, obs.height * 0.55)
        ctx.fillRect(ox + OBS_W - 2, oy + obs.height * 0.2, 9, obs.height * 0.5)
        ctx.fillStyle = '#059669'
        ctx.fillRect(ox - 3, oy + 4, OBS_W + 4, 4)
      }

      // Draw dino
      drawDino(ctx, s.dinoY, s.frame, s.dead)

      // Overlay messages
      if (!s.running && !s.dead) {
        ctx.fillStyle = 'rgba(10,10,20,0.55)'
        ctx.fillRect(0, 0, W, H)
        ctx.fillStyle = '#a78bfa'
        ctx.font = '600 15px "Space Grotesk", sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText('Space  /  Tap to Start', W / 2, H / 2 + 5)
        ctx.textAlign = 'left'
      }

      if (s.dead) {
        ctx.fillStyle = 'rgba(0,0,0,0.6)'
        ctx.fillRect(0, 0, W, H)
        ctx.fillStyle = '#f1f5f9'
        ctx.font = 'bold 22px "Space Grotesk", sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText('Game Over!', W / 2, H / 2 - 14)
        ctx.fillStyle = '#a78bfa'
        ctx.font = '13px "JetBrains Mono", monospace'
        ctx.fillText(`Score ${s.score}  ·  Space / Tap to Restart`, W / 2, H / 2 + 12)
        ctx.textAlign = 'left'
      }

      rafRef.current = requestAnimationFrame(loop)
    }

    rafRef.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  // ── input ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    function jump() {
      const s = gsRef.current
      if (s.dead) {
        // restart
        Object.assign(s, initGS())
        setUiScore(0)
        setUiDead(false)
        return
      }
      if (!s.running) s.running = true
      if (s.dinoY >= GROUND_Y - DINO_H) s.vy = JUMP_V
    }

    function onKey(e: KeyboardEvent) {
      if (e.code === 'Space' || e.code === 'ArrowUp') { e.preventDefault(); jump() }
    }

    window.addEventListener('keydown', onKey)
    const canvas = canvasRef.current!
    const onTouch = (e: TouchEvent) => { e.preventDefault(); jump() }
    canvas.addEventListener('touchstart', onTouch, { passive: false })
    canvas.addEventListener('click', jump)

    return () => {
      window.removeEventListener('keydown', onKey)
      canvas.removeEventListener('touchstart', onTouch)
      canvas.removeEventListener('click', jump)
    }
  }, [])

  function handleRestart() {
    Object.assign(gsRef.current, initGS())
    setUiScore(0)
    setUiDead(false)
  }

  return (
    <div className="flex flex-col items-center gap-3 select-none">
      <canvas
        ref={canvasRef}
        width={W}
        height={H}
        className="rounded-xl border dark:border-dark-border border-light-border w-full max-w-[600px]"
        style={{ cursor: 'pointer', touchAction: 'none' }}
        aria-label="Dino Runner game canvas"
      />
      <div className="flex items-center gap-6 text-sm dark:text-slate-400 text-slate-600">
        <span className="font-mono">Score: <span className="text-accent-400 font-semibold">{uiScore}</span></span>
        <span className="font-mono text-xs dark:text-slate-500 text-slate-500">
          Best: <span className="text-emerald-400">{uiBest}</span>
        </span>
      </div>
      <div className="flex items-center gap-4">
        <button
          onClick={handleRestart}
          className="flex items-center gap-1.5 text-xs dark:text-slate-500 text-slate-500 hover:text-accent-400 transition-colors px-3 py-1.5 rounded-lg border dark:border-dark-border border-light-border"
          aria-label="Restart dino runner"
        >
          <RefreshCw size={12} /> Restart
        </button>
        <span className="text-xs dark:text-slate-600 text-slate-400 font-mono">Space / ↑ to jump</span>
      </div>
      {/* Mobile jump button */}
      <button
        className="md:hidden mt-1 w-28 py-3 rounded-xl text-sm font-semibold
          bg-accent-600 hover:bg-accent-500 text-white active:scale-95 transition-all"
        onPointerDown={e => { e.preventDefault(); canvasRef.current?.click() }}
        aria-label="Jump"
      >
        Jump ↑
      </button>
    </div>
  )
}
