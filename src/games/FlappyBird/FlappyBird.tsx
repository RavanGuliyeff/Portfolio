import React, { useRef, useEffect, useState } from 'react'
import { RefreshCw } from 'lucide-react'

const W         = 360
const H         = 480
const BIRD_R    = 13
const BIRD_X    = 75
const PIPE_W    = 52
const GAP_BASE  = 130
const GAP_MIN   = 88
const GRAVITY   = 0.38
const FLAP_V    = -7.8
const PIPE_SPEED_BASE = 2.8

interface Pipe {
  x:    number
  gapY: number  // center of gap
  gap:  number  // full gap height
  scored: boolean
}

interface GS {
  alive:    boolean
  started:  boolean
  birdY:    number
  birdVy:   number
  birdAngle:number
  pipes:    Pipe[]
  score:    number
  frame:    number
  pipeSpeed: number
}

function initGS(): GS {
  return {
    alive: true, started: false,
    birdY: H / 2, birdVy: 0, birdAngle: 0,
    pipes: [], score: 0, frame: 0,
    pipeSpeed: PIPE_SPEED_BASE,
  }
}

function drawBird(ctx: CanvasRenderingContext2D, x: number, y: number, angle: number, dead: boolean) {
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(angle)

  // Body
  ctx.fillStyle = dead ? '#ef4444' : '#fbbf24'
  ctx.beginPath()
  ctx.ellipse(0, 0, BIRD_R, BIRD_R - 2, 0, 0, Math.PI * 2)
  ctx.fill()

  // Wing
  ctx.fillStyle = dead ? '#dc2626' : '#f59e0b'
  ctx.beginPath()
  ctx.ellipse(-3, 3, 9, 5, 0.3, 0, Math.PI * 2)
  ctx.fill()

  // Belly
  ctx.fillStyle = '#fef3c7'
  ctx.beginPath()
  ctx.ellipse(2, 2, 7, 5, 0, 0, Math.PI * 2)
  ctx.fill()

  // Eye
  ctx.fillStyle = '#0a0a0f'
  ctx.beginPath()
  ctx.arc(6, -4, 3.5, 0, Math.PI * 2)
  ctx.fill()
  if (!dead) {
    ctx.fillStyle = '#fff'
    ctx.beginPath()
    ctx.arc(7, -5, 1.5, 0, Math.PI * 2)
    ctx.fill()
  } else {
    ctx.strokeStyle = '#fff'
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.moveTo(4, -6); ctx.lineTo(8, -2)
    ctx.moveTo(8, -6); ctx.lineTo(4, -2)
    ctx.stroke()
  }

  // Beak
  ctx.fillStyle = '#f97316'
  ctx.beginPath()
  ctx.moveTo(10, -2)
  ctx.lineTo(18, 1)
  ctx.lineTo(10, 4)
  ctx.closePath()
  ctx.fill()

  ctx.restore()
}

export const FlappyBird: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const gsRef     = useRef<GS>(initGS())
  const rafRef    = useRef(0)
  const [uiScore, setUiScore] = useState(0)
  const [uiBest,  setUiBest]  = useState(() => parseInt(localStorage.getItem('hs-flappy') ?? '0', 10))

  // ── game loop ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current!
    const ctx    = canvas.getContext('2d')!

    function loop() {
      const s = gsRef.current

      // ── Sky background ──────────────────────────────────────────────────
      const sky = ctx.createLinearGradient(0, 0, 0, H)
      sky.addColorStop(0, '#0f0c29')
      sky.addColorStop(1, '#302b63')
      ctx.fillStyle = sky
      ctx.fillRect(0, 0, W, H)

      // Stars
      ctx.fillStyle = 'rgba(255,255,255,0.4)'
      for (let i = 0; i < 30; i++) {
        const sx = ((i * 137 + s.frame * 0.2) % W)
        const sy = ((i * 89) % (H * 0.65))
        ctx.fillRect(sx, sy, i % 2 === 0 ? 1 : 2, i % 2 === 0 ? 1 : 2)
      }

      if (s.started && s.alive) {
        // Physics
        s.birdVy     += GRAVITY
        s.birdY      += s.birdVy
        s.birdAngle   = Math.max(-0.5, Math.min(1.2, s.birdVy * 0.08))

        // Spawn pipes
        s.frame++
        if (s.frame % 120 === 0 || (s.pipes.length === 0 && s.frame > 60)) {
          const gapCenter = 80 + Math.random() * (H - 160)
          const gap = Math.max(GAP_MIN, GAP_BASE - s.score * 2)
          s.pipes.push({ x: W + PIPE_W, gapY: gapCenter, gap, scored: false })
        }

        // Move pipes
        s.pipes.forEach(p => { p.x -= s.pipeSpeed })
        s.pipes = s.pipes.filter(p => p.x + PIPE_W > -10)

        // Score
        for (const p of s.pipes) {
          if (!p.scored && p.x + PIPE_W < BIRD_X) {
            p.scored = true
            s.score++
            s.pipeSpeed = PIPE_SPEED_BASE + s.score * 0.06
            setUiScore(s.score)
          }
        }

        // Collision: floor / ceiling
        if (s.birdY + BIRD_R > H || s.birdY - BIRD_R < 0) {
          killBird(s)
        }

        // Collision: pipes
        for (const p of s.pipes) {
          const inX = BIRD_X + BIRD_R - 4 > p.x && BIRD_X - BIRD_R + 4 < p.x + PIPE_W
          if (!inX) continue
          const topPipe   = p.gapY - p.gap / 2
          const botPipe   = p.gapY + p.gap / 2
          if (s.birdY - BIRD_R + 4 < topPipe || s.birdY + BIRD_R - 4 > botPipe) {
            killBird(s)
          }
        }
      }

      // ── Draw pipes ───────────────────────────────────────────────────────
      for (const p of s.pipes) {
        const topH  = p.gapY - p.gap / 2
        const botY  = p.gapY + p.gap / 2
        const botH  = H - botY

        // Pipe gradient
        const pg = ctx.createLinearGradient(p.x, 0, p.x + PIPE_W, 0)
        pg.addColorStop(0, '#065f46')
        pg.addColorStop(0.4, '#10b981')
        pg.addColorStop(1, '#047857')
        ctx.fillStyle = pg

        // Top pipe body
        ctx.fillRect(p.x, 0, PIPE_W, topH)
        // Top cap
        ctx.fillStyle = '#059669'
        ctx.fillRect(p.x - 4, topH - 14, PIPE_W + 8, 14)
        ctx.fillStyle = '#34d399'
        ctx.fillRect(p.x - 4, topH - 14, PIPE_W + 8, 3)

        // Bottom pipe body
        ctx.fillStyle = pg
        ctx.fillRect(p.x, botY, PIPE_W, botH)
        // Bottom cap
        ctx.fillStyle = '#059669'
        ctx.fillRect(p.x - 4, botY, PIPE_W + 8, 14)
        ctx.fillStyle = '#34d399'
        ctx.fillRect(p.x - 4, botY, PIPE_W + 8, 3)
      }

      // Ground
      ctx.fillStyle = '#92400e'
      ctx.fillRect(0, H - 20, W, 20)
      ctx.fillStyle = '#a16207'
      ctx.fillRect(0, H - 20, W, 3)

      // ── Draw bird ────────────────────────────────────────────────────────
      drawBird(ctx, BIRD_X, s.birdY, s.birdAngle, !s.alive)

      // Score HUD
      if (s.started) {
        ctx.fillStyle = 'rgba(0,0,0,0.35)'
        ctx.fillRect(W / 2 - 34, 12, 68, 26)
        ctx.fillStyle = '#f1f5f9'
        ctx.font = 'bold 18px "Space Grotesk", sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText(String(s.score), W / 2, 30)
        ctx.textAlign = 'left'
      }

      // Start overlay
      if (!s.started && s.alive) {
        ctx.fillStyle = 'rgba(0,0,0,0.55)'
        ctx.fillRect(0, 0, W, H)
        ctx.fillStyle = '#fbbf24'
        ctx.font = 'bold 26px "Space Grotesk", sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText('Flappy Bird', W / 2, H / 2 - 26)
        ctx.fillStyle = '#a78bfa'
        ctx.font = '14px "Space Grotesk", sans-serif'
        ctx.fillText('Space / Tap to flap', W / 2, H / 2 + 4)
        ctx.textAlign = 'left'
      }

      // Dead overlay
      if (!s.alive) {
        ctx.fillStyle = 'rgba(0,0,0,0.6)'
        ctx.fillRect(0, 0, W, H)
        ctx.fillStyle = '#f1f5f9'
        ctx.font = 'bold 24px "Space Grotesk", sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText('Oops! 💀', W / 2, H / 2 - 28)
        ctx.fillStyle = '#a78bfa'
        ctx.font = '15px "JetBrains Mono", monospace'
        ctx.fillText(`Score: ${s.score}`, W / 2, H / 2)
        ctx.font = '12px "JetBrains Mono", monospace'
        ctx.fillStyle = '#94a3b8'
        ctx.fillText('Space / Tap to restart', W / 2, H / 2 + 24)
        ctx.textAlign = 'left'
      }

      rafRef.current = requestAnimationFrame(loop)
    }

    function killBird(s: GS) {
      if (!s.alive) return
      s.alive = false
      const best = parseInt(localStorage.getItem('hs-flappy') ?? '0', 10)
      if (s.score > best) {
        localStorage.setItem('hs-flappy', String(s.score))
        setUiBest(s.score)
      }
    }

    rafRef.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  // ── Input ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    function flap() {
      const s = gsRef.current
      if (!s.alive) {
        // Restart
        Object.assign(s, initGS())
        setUiScore(0)
        return
      }
      if (!s.started) s.started = true
      s.birdVy = FLAP_V
    }

    function onKey(e: KeyboardEvent) {
      if (e.code === 'Space' || e.code === 'ArrowUp') { e.preventDefault(); flap() }
    }

    const canvas = canvasRef.current!
    const onTouch = (e: TouchEvent) => { e.preventDefault(); flap() }

    window.addEventListener('keydown', onKey)
    canvas.addEventListener('touchstart', onTouch, { passive: false })
    canvas.addEventListener('click', flap)

    return () => {
      window.removeEventListener('keydown', onKey)
      canvas.removeEventListener('touchstart', onTouch)
      canvas.removeEventListener('click', flap)
    }
  }, [])

  return (
    <div className="flex flex-col items-center gap-3 select-none">
      <canvas
        ref={canvasRef}
        width={W}
        height={H}
        className="rounded-xl border dark:border-dark-border border-light-border w-full max-w-[360px]"
        style={{ cursor: 'pointer', touchAction: 'none' }}
        aria-label="Flappy Bird canvas"
      />
      <div className="flex items-center gap-6 text-sm dark:text-slate-400 text-slate-600">
        <span className="font-mono">Score: <span className="text-accent-400 font-semibold">{uiScore}</span></span>
        <span className="font-mono text-xs dark:text-slate-500 text-slate-500">
          Best: <span className="text-emerald-400">{uiBest}</span>
        </span>
      </div>
      <button
        className="md:hidden w-28 py-3 rounded-xl text-sm font-semibold
          bg-yellow-500 hover:bg-yellow-400 text-slate-900 active:scale-95 transition-all"
        onPointerDown={e => { e.preventDefault(); canvasRef.current?.click() }}
        aria-label="Flap"
      >
        Flap 🐦
      </button>
      <span className="text-xs dark:text-slate-600 text-slate-400 font-mono">Space / ↑ / Tap to flap</span>
    </div>
  )
}
