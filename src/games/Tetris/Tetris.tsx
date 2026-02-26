import React, { useRef, useEffect, useState, useCallback } from 'react'
import { RefreshCw } from 'lucide-react'

const COLS  = 10
const ROWS  = 20
const CELL  = 26
const W     = COLS * CELL
const H     = ROWS * CELL

type Piece = { shape: number[][]; color: string }

const PIECES: Piece[] = [
  { shape: [[1,1,1,1]],                color: '#06b6d4' },
  { shape: [[1,1],[1,1]],              color: '#f59e0b' },
  { shape: [[0,1,0],[1,1,1]],          color: '#7c3aed' },
  { shape: [[1,1,0],[0,1,1]],          color: '#dc2626' },
  { shape: [[0,1,1],[1,1,0]],          color: '#16a34a' },
  { shape: [[1,0,0],[1,1,1]],          color: '#2563eb' },
  { shape: [[0,0,1],[1,1,1]],          color: '#ea580c' },
]

const POINTS = [0, 100, 300, 500, 800]

function randomPiece() { return { ...PIECES[Math.floor(Math.random() * PIECES.length)] } }
function rotate(s: number[][]): number[][] { return s[0].map((_, i) => s.map(r => r[i]).reverse()) }
function emptyBoard(): (string | 0)[][] { return Array.from({ length: ROWS }, () => Array(COLS).fill(0)) }

function drawBlock(ctx: CanvasRenderingContext2D, x: number, y: number, color: string, alpha = 1) {
  ctx.save()
  ctx.globalAlpha = alpha
  ctx.fillStyle = color
  ctx.fillRect(x + 1, y + 1, CELL - 2, CELL - 2)
  // top-left highlight
  ctx.fillStyle = 'rgba(255,255,255,0.18)'
  ctx.fillRect(x + 1, y + 1, CELL - 2, 4)
  ctx.fillRect(x + 1, y + 1, 4, CELL - 2)
  // bottom-right shadow
  ctx.fillStyle = 'rgba(0,0,0,0.25)'
  ctx.fillRect(x + 1, y + CELL - 5, CELL - 2, 4)
  ctx.fillRect(x + CELL - 5, y + 1, 4, CELL - 2)
  ctx.restore()
}

export const Tetris: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const nextRef   = useRef<HTMLCanvasElement>(null)
  const holdRef   = useRef<HTMLCanvasElement>(null)

  const gameRef = useRef({
    board:   emptyBoard() as (string | 0)[][],
    piece:   randomPiece(),
    next:    randomPiece(),
    hold:    null as Piece | null,
    canHold: true,
    px: 3, py: 0,
    score: 0, level: 1, lines: 0,
    dead: false,
  })

  const [score,   setScore]   = useState(0)
  const [level,   setLevel]   = useState(1)
  const [lines,   setLines]   = useState(0)
  const [dead,    setDead]    = useState(false)
  const [best,    setBest]    = useState(() => parseInt(localStorage.getItem('hs-tetris') ?? '0', 10))
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const valid = (shape: number[][], px: number, py: number, board: (string | 0)[][]): boolean => {
    for (let r = 0; r < shape.length; r++)
      for (let c = 0; c < shape[r].length; c++)
        if (shape[r][c]) {
          const nx = px + c, ny = py + r
          if (nx < 0 || nx >= COLS || ny >= ROWS) return false
          if (ny >= 0 && board[ny][nx]) return false
        }
    return true
  }

  const drawBoard = useCallback(() => {
    const canvas = canvasRef.current; if (!canvas) return
    const ctx = canvas.getContext('2d'); if (!ctx) return
    const g = gameRef.current

    ctx.fillStyle = '#09090f'
    ctx.fillRect(0, 0, W, H)

    // Subtle grid
    ctx.strokeStyle = 'rgba(124,58,237,0.07)'
    ctx.lineWidth = 0.5
    for (let x = 0; x <= COLS; x++) { ctx.beginPath(); ctx.moveTo(x * CELL, 0); ctx.lineTo(x * CELL, H); ctx.stroke() }
    for (let y = 0; y <= ROWS; y++) { ctx.beginPath(); ctx.moveTo(0, y * CELL); ctx.lineTo(W, y * CELL); ctx.stroke() }

    // Placed blocks
    g.board.forEach((row, r) =>
      row.forEach((cell, c) => { if (cell) drawBlock(ctx, c * CELL, r * CELL, cell as string) })
    )

    // Ghost piece
    let ghostY = g.py
    while (valid(g.piece.shape, g.px, ghostY + 1, g.board)) ghostY++
    if (ghostY > g.py) {
      g.piece.shape.forEach((row, r) =>
        row.forEach((cell, c) => {
          if (cell) {
            ctx.save()
            ctx.globalAlpha = 0.18
            ctx.fillStyle = g.piece.color
            ctx.fillRect((g.px + c) * CELL + 1, (ghostY + r) * CELL + 1, CELL - 2, CELL - 2)
            ctx.restore()
          }
        })
      )
    }

    // Active piece
    g.piece.shape.forEach((row, r) =>
      row.forEach((cell, c) => {
        if (cell) drawBlock(ctx, (g.px + c) * CELL, (g.py + r) * CELL, g.piece.color)
      })
    )

    if (g.dead) {
      ctx.fillStyle = 'rgba(0,0,0,0.72)'
      ctx.fillRect(0, 0, W, H)
      ctx.fillStyle = '#f1f5f9'
      ctx.font = 'bold 18px Space Grotesk, sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('Game Over', W / 2, H / 2 - 16)
      ctx.font = '13px JetBrains Mono, monospace'
      ctx.fillText(`Score: ${g.score}`, W / 2, H / 2 + 6)
      ctx.fillText('Press R to restart', W / 2, H / 2 + 24)
      ctx.textAlign = 'left'
    }
  }, [])

  function drawPieceCanvas(ref: React.RefObject<HTMLCanvasElement>, piece: Piece | null) {
    const canvas = ref.current; if (!canvas) return
    const ctx = canvas.getContext('2d'); if (!ctx) return
    const side = 4 * CELL
    ctx.fillStyle = '#0f0f1a'
    ctx.fillRect(0, 0, side, side)
    if (!piece) return
    const { shape, color } = piece
    const offX = Math.floor((4 - shape[0].length) / 2)
    const offY = Math.floor((4 - shape.length) / 2)
    shape.forEach((row, r) =>
      row.forEach((cell, c) => { if (cell) drawBlock(ctx, (offX + c) * CELL, (offY + r) * CELL, color) })
    )
  }

  const drawNext = useCallback(() => drawPieceCanvas(nextRef, gameRef.current.next), [])
  const drawHold = useCallback(() => drawPieceCanvas(holdRef, gameRef.current.hold), [])

  const lock = useCallback(() => {
    const g = gameRef.current
    g.piece.shape.forEach((row, r) =>
      row.forEach((cell, c) => { if (cell && g.py + r >= 0) g.board[g.py + r][g.px + c] = g.piece.color })
    )
    let cleared = 0
    for (let r = ROWS - 1; r >= 0; r--) {
      if (g.board[r].every(c => c !== 0)) {
        g.board.splice(r, 1); g.board.unshift(Array(COLS).fill(0)); cleared++; r++
      }
    }
    if (cleared > 0) {
      g.lines += cleared
      g.score += POINTS[cleared] * g.level
      g.level  = Math.floor(g.lines / 10) + 1
      setScore(g.score); setLevel(g.level); setLines(g.lines)
    }
    g.piece = g.next; g.next = randomPiece(); g.px = 3; g.py = 0; g.canHold = true
    if (!valid(g.piece.shape, g.px, g.py, g.board)) {
      g.dead = true
      const nb = Math.max(g.score, parseInt(localStorage.getItem('hs-tetris') ?? '0', 10))
      localStorage.setItem('hs-tetris', String(nb))
      setBest(nb); setDead(true)
    }
  }, [])

  const drop = useCallback(() => {
    const g = gameRef.current; if (g.dead) return
    if (valid(g.piece.shape, g.px, g.py + 1, g.board)) { g.py++ } else { lock() }
    drawBoard(); drawNext()
  }, [drawBoard, drawNext, lock])

  const holdPiece = useCallback(() => {
    const g = gameRef.current
    if (!g.canHold || g.dead) return
    g.canHold = false
    if (g.hold === null) {
      g.hold = g.piece; g.piece = g.next; g.next = randomPiece()
    } else {
      const tmp = g.hold; g.hold = g.piece; g.piece = tmp
    }
    g.px = 3; g.py = 0
    if (!valid(g.piece.shape, g.px, g.py, g.board)) { g.py = -1 }
    drawBoard(); drawNext(); drawHold()
  }, [drawBoard, drawNext, drawHold])

  const restart = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    const g = gameRef.current
    g.board = emptyBoard(); g.piece = randomPiece(); g.next = randomPiece()
    g.hold = null; g.canHold = true; g.px = 3; g.py = 0
    g.score = 0; g.level = 1; g.lines = 0; g.dead = false
    setScore(0); setLevel(1); setLines(0); setDead(false)
    drawBoard(); drawNext(); drawHold()
    timerRef.current = setInterval(drop, Math.max(80, 500 - g.level * 35))
  }, [drop, drawBoard, drawNext, drawHold])

  useEffect(() => {
    drawBoard(); drawNext(); drawHold()
    const onKey = (e: KeyboardEvent) => {
      const g = gameRef.current
      if (e.key === 'r' || e.key === 'R') { restart(); return }
      if (g.dead) return
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        if (valid(g.piece.shape, g.px - 1, g.py, g.board)) { g.px--; drawBoard() }
      }
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        if (valid(g.piece.shape, g.px + 1, g.py, g.board)) { g.px++; drawBoard() }
      }
      if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') { e.preventDefault(); drop() }
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W' || e.key === 'x') {
        const rot = rotate(g.piece.shape)
        let offset = 0
        while (!valid(rot, g.px + offset, g.py, g.board)) {
          offset = offset <= 0 ? -offset + 1 : -offset
          if (Math.abs(offset) > 2) return
        }
        g.piece = { ...g.piece, shape: rot }; g.px += offset; drawBoard()
      }
      if (e.key === ' ') { e.preventDefault(); while (valid(g.piece.shape, g.px, g.py + 1, g.board)) g.py++; lock(); drawBoard(); drawNext() }
      if (e.key === 'c' || e.key === 'C' || e.key === 'Shift') { e.preventDefault(); holdPiece() }
    }
    window.addEventListener('keydown', onKey)
    return () => { if (timerRef.current) clearInterval(timerRef.current); window.removeEventListener('keydown', onKey) }
  }, [drop, drawBoard, drawNext, drawHold, lock, holdPiece, restart])

  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(drop, Math.max(80, 500 - level * 35))
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [level, drop])

  return (
    <div className="flex gap-3 items-start justify-center select-none flex-wrap">
      <canvas ref={canvasRef} width={W} height={H}
        className="rounded-xl border dark:border-dark-border border-light-border"
        style={{ touchAction: 'none' }}
      />

      <div className="flex flex-col gap-3 min-w-[104px]">
        {/* Hold */}
        <div className="dark:bg-dark-card bg-light-card border dark:border-dark-border border-light-border rounded-xl p-2.5">
          <p className="text-[10px] dark:text-slate-500 text-slate-500 mb-1 font-mono tracking-widest">HOLD (C)</p>
          <canvas ref={holdRef} width={4 * CELL} height={4 * CELL} className="rounded-lg" />
        </div>
        {/* Next */}
        <div className="dark:bg-dark-card bg-light-card border dark:border-dark-border border-light-border rounded-xl p-2.5">
          <p className="text-[10px] dark:text-slate-500 text-slate-500 mb-1 font-mono tracking-widest">NEXT</p>
          <canvas ref={nextRef} width={4 * CELL} height={4 * CELL} className="rounded-lg" />
        </div>

        {[{ l: 'SCORE', v: score }, { l: 'BEST',  v: best  }, { l: 'LEVEL', v: level }, { l: 'LINES', v: lines }].map(item => (
          <div key={item.l} className="dark:bg-dark-card bg-light-card border dark:border-dark-border border-light-border rounded-xl px-3 py-2 text-center">
            <p className="text-[10px] dark:text-slate-500 text-slate-500 font-mono tracking-widest mb-0.5">{item.l}</p>
            <p className="font-heading font-bold text-base text-accent-400">{item.v}</p>
          </div>
        ))}

        <button onClick={restart} className="flex items-center justify-center gap-1.5 text-xs dark:text-slate-500 text-slate-500 hover:text-accent-400 transition-colors py-1">
          <RefreshCw size={12} /> Restart
        </button>

        <div className="text-[10px] dark:text-slate-600 text-slate-400 font-mono leading-relaxed space-y-0.5">
          <p>  Move</p><p> / W Rotate</p><p> Soft drop</p>
          <p>Space Hard drop</p><p>C / Shift Hold</p><p>R Restart</p>
        </div>
      </div>

      {/* Mobile controls */}
      <div className="md:hidden flex flex-col items-center gap-1.5 mt-1 w-full">
        <div className="flex gap-2">
          <button className="w-16 h-9 rounded-xl dark:bg-dark-card bg-light-card border dark:border-dark-border border-light-border text-xs font-bold dark:text-slate-300 text-slate-700 hover:bg-accent-500/20 active:scale-90 transition-all"
            onPointerDown={e => { e.preventDefault(); holdPiece() }}>Hold</button>
          <button className="w-16 h-9 rounded-xl dark:bg-dark-card bg-light-card border dark:border-dark-border border-light-border text-xs font-bold dark:text-slate-300 text-slate-700 hover:bg-accent-500/20 active:scale-90 transition-all"
            onPointerDown={e => {
              e.preventDefault()
              const g = gameRef.current
              const rot = rotate(g.piece.shape)
              let off = 0
              while (!valid(rot, g.px + off, g.py, g.board)) { off = off <= 0 ? -off + 1 : -off; if (Math.abs(off) > 2) return }
              g.piece = { ...g.piece, shape: rot }; g.px += off; drawBoard()
            }}>Rotate</button>
        </div>
        <div className="flex gap-1.5">
          {(['','',''] as const).map((a, i) => (
            <button key={a} className="w-14 h-12 rounded-xl dark:bg-dark-card bg-light-card border dark:border-dark-border border-light-border text-xl dark:text-slate-300 text-slate-700 hover:bg-accent-500/20 active:scale-90 transition-all"
              onPointerDown={e => {
                e.preventDefault()
                const g = gameRef.current
                if (i===0 && valid(g.piece.shape,g.px-1,g.py,g.board)) { g.px--; drawBoard() }
                if (i===1) drop()
                if (i===2 && valid(g.piece.shape,g.px+1,g.py,g.board)) { g.px++; drawBoard() }
              }}>{a}</button>
          ))}
        </div>
        <button className="w-40 h-9 rounded-xl bg-accent-600 hover:bg-accent-500 text-white text-sm font-semibold active:scale-90 transition-all"
          onPointerDown={e => {
            e.preventDefault()
            const g = gameRef.current
            while (valid(g.piece.shape, g.px, g.py + 1, g.board)) g.py++
            lock(); drawBoard(); drawNext()
          }}> Hard Drop</button>
      </div>
    </div>
  )
}
