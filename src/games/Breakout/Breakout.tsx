import React, { useRef, useEffect, useCallback } from 'react'

//  Constants 
const CW   = 460
const CH   = 360
const ROWS = 6
const COLS = 8
const BW   = 50        // brick width
const BH   = 18        // brick height
const BG   = 4         // brick gap
const BL   = (CW - (COLS * (BW + BG) - BG)) / 2  // left offset
const BT   = 52        // top offset for bricks
const PAD_W   = 86
const PAD_H   = 12
const BALL_R  = 8
const BALL_SP = 4.8    // initial speed

const ROW_COLORS = [
  '#ff4757', '#ff6b81',  // rows 0-1  red
  '#ffa502', '#ffdd59',  // rows 2-3  orange/yellow
  '#2ed573', '#1e90ff',  // rows 4-5  green/blue
]

//  State factory 
function initBricks() {
  return Array.from({ length: ROWS }, (_, r) =>
    Array.from({ length: COLS }, (_, c) => ({
      x: BL + c * (BW + BG),
      y: BT + r * (BH + BG),
      color: ROW_COLORS[r],
      alive: true,
    }))
  ).flat()
}

function initState() {
  const angle = (-Math.PI / 2) + (Math.random() - 0.5) * 0.6
  return {
    bricks:   initBricks(),
    padX:     CW / 2 - PAD_W / 2,
    bx:       CW / 2,
    by:       CH - 60,
    vx:       BALL_SP * Math.cos(angle),
    vy:       BALL_SP * Math.sin(angle),
    lives:    3,
    score:    0,
    best:     parseInt(localStorage.getItem('hs-breakout') ?? '0', 10),
    phase:    'playing' as 'playing' | 'dead' | 'win',
    speed:    BALL_SP,
  }
}

//  Helpers 
function brickHit(bx: number, by: number, b: { x: number; y: number; alive: boolean }) {
  return (
    b.alive &&
    bx + BALL_R > b.x && bx - BALL_R < b.x + BW &&
    by + BALL_R > b.y && by - BALL_R < b.y + BH
  )
}

//  Component 
export const Breakout: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const gsRef     = useRef(initState())
  const rafRef    = useRef(0)

  const draw = useCallback(() => {
    const canvas = canvasRef.current; if (!canvas) return
    const ctx = canvas.getContext('2d'); if (!ctx) return
    const gs = gsRef.current

    // Background
    ctx.fillStyle = '#09090f'
    ctx.fillRect(0, 0, CW, CH)

    // Bricks
    gs.bricks.forEach(b => {
      if (!b.alive) return
      const grd = ctx.createLinearGradient(b.x, b.y, b.x, b.y + BH)
      grd.addColorStop(0, b.color + 'ee')
      grd.addColorStop(1, b.color + '99')
      ctx.fillStyle = grd
      ctx.beginPath()
      ctx.roundRect?.(b.x, b.y, BW, BH, 4) ?? ctx.rect(b.x, b.y, BW, BH)
      ctx.fill()
      // highlight
      ctx.fillStyle = 'rgba(255,255,255,0.12)'
      ctx.beginPath()
      ctx.roundRect?.(b.x + 2, b.y + 2, BW - 4, 4, 2) ?? ctx.rect(b.x + 2, b.y + 2, BW - 4, 4)
      ctx.fill()
    })

    // Paddle
    const pg = ctx.createLinearGradient(gs.padX, CH - 25, gs.padX, CH - 25 + PAD_H)
    pg.addColorStop(0, '#7c3aed')
    pg.addColorStop(1, '#5b21b6')
    ctx.fillStyle = pg
    ctx.beginPath()
    ctx.roundRect?.(gs.padX, CH - 25, PAD_W, PAD_H, 6) ?? ctx.rect(gs.padX, CH - 25, PAD_W, PAD_H)
    ctx.fill()
    // paddle shine
    ctx.fillStyle = 'rgba(255,255,255,0.15)'
    ctx.beginPath()
    ctx.roundRect?.(gs.padX + 4, CH - 25 + 2, PAD_W - 8, 4, 2) ?? ctx.rect(gs.padX + 4, CH - 25 + 2, PAD_W - 8, 4)
    ctx.fill()

    // Ball
    const ballGrd = ctx.createRadialGradient(gs.bx - 2, gs.by - 2, 1, gs.bx, gs.by, BALL_R)
    ballGrd.addColorStop(0, '#c4b5fd')
    ballGrd.addColorStop(1, '#7c3aed')
    ctx.beginPath()
    ctx.arc(gs.bx, gs.by, BALL_R, 0, Math.PI * 2)
    ctx.fillStyle = ballGrd
    ctx.fill()

    // HUD
    ctx.fillStyle = 'rgba(255,255,255,0.75)'
    ctx.font = '13px JetBrains Mono, monospace'
    ctx.fillText(`Score: ${gs.score}`, 10, 20)
    ctx.textAlign = 'right'
    ctx.fillText(`Best: ${gs.best}`, CW - 10, 20)
    ctx.textAlign = 'center'
    // Lives as hearts
    ctx.fillText(''.repeat(gs.lives), CW / 2, 20)
    ctx.textAlign = 'left'

    // Overlay
    if (gs.phase === 'dead') {
      ctx.fillStyle = 'rgba(0,0,0,0.75)'
      ctx.fillRect(0, 0, CW, CH)
      ctx.fillStyle = '#f1f5f9'
      ctx.font = 'bold 22px Space Grotesk, sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('Game Over', CW / 2, CH / 2 - 14)
      ctx.font = '14px JetBrains Mono, monospace'
      ctx.fillText(`Score: ${gs.score}  Best: ${gs.best}`, CW / 2, CH / 2 + 10)
      ctx.fillText('Press Space or click to restart', CW / 2, CH / 2 + 30)
      ctx.textAlign = 'left'
    } else if (gs.phase === 'win') {
      ctx.fillStyle = 'rgba(0,0,0,0.7)'
      ctx.fillRect(0, 0, CW, CH)
      ctx.fillStyle = '#a78bfa'
      ctx.font = 'bold 24px Space Grotesk, sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('You Win! ', CW / 2, CH / 2 - 14)
      ctx.font = '14px JetBrains Mono, monospace'
      ctx.fillStyle = '#f1f5f9'
      ctx.fillText(`Score: ${gs.score}`, CW / 2, CH / 2 + 10)
      ctx.fillText('Press Space to play again', CW / 2, CH / 2 + 30)
      ctx.textAlign = 'left'
    }
  }, [])

  useEffect(() => {
    const gs = gsRef.current

    function tick() {
      if (gs.phase !== 'playing') { rafRef.current = requestAnimationFrame(tick); draw(); return }

      // Move ball
      gs.bx += gs.vx
      gs.by += gs.vy

      // Wall collisions
      if (gs.bx - BALL_R < 0)    { gs.bx = BALL_R;      gs.vx =  Math.abs(gs.vx) }
      if (gs.bx + BALL_R > CW)   { gs.bx = CW - BALL_R; gs.vx = -Math.abs(gs.vx) }
      if (gs.by - BALL_R < 0)    { gs.by = BALL_R;       gs.vy =  Math.abs(gs.vy) }

      // Ball falls off bottom
      if (gs.by - BALL_R > CH) {
        gs.lives--
        if (gs.lives <= 0) {
          gs.phase = 'dead'
          const nb = Math.max(gs.score, gs.best)
          if (nb > gs.best) { gs.best = nb; localStorage.setItem('hs-breakout', String(nb)) }
        } else {
          gs.bx = gs.padX + PAD_W / 2
          gs.by = CH - 60
          const a = (-Math.PI / 2) + (Math.random() - 0.5) * 0.5
          gs.vx = gs.speed * Math.cos(a)
          gs.vy = gs.speed * Math.sin(a)
        }
      }

      // Paddle collision
      const py = CH - 25
      if (
        gs.by + BALL_R >= py && gs.by + BALL_R <= py + PAD_H &&
        gs.bx > gs.padX && gs.bx < gs.padX + PAD_W &&
        gs.vy > 0
      ) {
        // Angle based on hit position relative to paddle center
        const rel   = (gs.bx - (gs.padX + PAD_W / 2)) / (PAD_W / 2) // -1 to +1
        const angle = rel * (Math.PI / 3)  // max 60
        gs.vy = -gs.speed * Math.cos(angle)
        gs.vx =  gs.speed * Math.sin(angle)
        gs.by  = py - BALL_R
      }

      // Brick collisions
      let allDead = true
      for (const b of gs.bricks) {
        if (!b.alive) continue
        allDead = false
        if (brickHit(gs.bx, gs.by, b)) {
          b.alive = false
          gs.score += 10
          gs.speed = Math.min(BALL_SP + 2.5, gs.speed + 0.08)
          // Determine bounce axis
          const overlapX = Math.min(gs.bx + BALL_R - b.x, b.x + BW - (gs.bx - BALL_R))
          const overlapY = Math.min(gs.by + BALL_R - b.y, b.y + BH - (gs.by - BALL_R))
          if (overlapX < overlapY) { gs.vx = -gs.vx } else { gs.vy = -gs.vy }
          allDead = false  // just hit one, check if rest are all dead
          break
        }
      }

      if (gs.bricks.every(b => !b.alive)) {
        gs.phase = 'win'
        const nb = Math.max(gs.score, gs.best)
        if (nb > gs.best) { gs.best = nb; localStorage.setItem('hs-breakout', String(nb)) }
      }

      draw()
      rafRef.current = requestAnimationFrame(tick)
    }

    // Controls
    const keysDown = new Set<string>()
    const onKeyDown = (e: KeyboardEvent) => {
      keysDown.add(e.key)
      if (e.key === ' ') {
        e.preventDefault()
        if (gs.phase !== 'playing') { Object.assign(gsRef.current, initState()); }
      }
    }
    const onKeyUp = (e: KeyboardEvent) => keysDown.delete(e.key)

    // Paddle movement loop
    const padLoop = setInterval(() => {
      if (keysDown.has('ArrowLeft') || keysDown.has('a') || keysDown.has('A')) {
        gsRef.current.padX = Math.max(0, gsRef.current.padX - 7)
      }
      if (keysDown.has('ArrowRight') || keysDown.has('d') || keysDown.has('D')) {
        gsRef.current.padX = Math.min(CW - PAD_W, gsRef.current.padX + 7)
      }
    }, 16)

    // Mouse control
    const onMouseMove = (e: MouseEvent) => {
      const rect = canvasRef.current?.getBoundingClientRect()
      if (!rect) return
      const x = (e.clientX - rect.left) * (CW / rect.width)
      gsRef.current.padX = Math.max(0, Math.min(CW - PAD_W, x - PAD_W / 2))
    }

    // Touch control
    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault()
      const rect = canvasRef.current?.getBoundingClientRect()
      if (!rect) return
      const x = (e.touches[0].clientX - rect.left) * (CW / rect.width)
      gsRef.current.padX = Math.max(0, Math.min(CW - PAD_W, x - PAD_W / 2))
    }

    const onClick = () => {
      if (gs.phase !== 'playing') { Object.assign(gsRef.current, initState()); }
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup',   onKeyUp)
    canvasRef.current?.addEventListener('mousemove', onMouseMove)
    canvasRef.current?.addEventListener('touchmove', onTouchMove, { passive: false })
    canvasRef.current?.addEventListener('click',     onClick)

    rafRef.current = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(rafRef.current)
      clearInterval(padLoop)
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup',   onKeyUp)
      canvasRef.current?.removeEventListener('mousemove', onMouseMove)
      canvasRef.current?.removeEventListener('touchmove', onTouchMove)
      canvasRef.current?.removeEventListener('click',     onClick)
    }
  }, [draw])

  return (
    <div className="flex flex-col items-center gap-3 select-none">
      <canvas
        ref={canvasRef}
        width={CW}
        height={CH}
        className="rounded-xl border dark:border-dark-border border-light-border cursor-none"
        style={{ maxWidth: '100%', touchAction: 'none' }}
        aria-label="Breakout game"
      />
      <p className="text-xs dark:text-slate-500 text-slate-500 font-mono">
        Move mouse    keys  <span className="text-accent-400">break all bricks</span>
      </p>
    </div>
  )
}
