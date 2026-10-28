import { useCallback, useRef, useState } from 'react'
import { ArrowDown, ArrowLeft, ArrowRight, ChevronsDown, RotateCw } from 'lucide-react'
import { useCanvas } from '../engine/useCanvas'
import { useGameLoop } from '../engine/useGameLoop'
import { isTouchDevice, useKeyboard } from '../engine/input'
import { readBest, recordScore } from '../engine/storage'
import { GameButton, GameHud, Overlay } from '../engine/GameUI'
import { useI18n } from '@/i18n/I18nProvider'

const COLS = 10
const ROWS = 20
const CELL = 30
const W = COLS * CELL
const H = ROWS * CELL
const KEY = 'hs-tetris'
const DAS = 0.14 // delay before a held key starts repeating
const ARR = 0.04 // repeat interval while held
const LOCK_DELAY = 0.5
const MAX_LOCK_RESETS = 15
const CLEAR_TIME = 0.2
const LINE_POINTS = [0, 100, 300, 500, 800]

type Matrix = number[][]
type PieceType = 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L'
type Board = (string | null)[][]
type Phase = 'ready' | 'playing' | 'paused' | 'over'

const PIECES: Record<PieceType, { m: Matrix; color: string }> = {
  I: { m: [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]], color: '#22d3ee' },
  O: { m: [[1, 1], [1, 1]], color: '#facc15' },
  T: { m: [[0, 1, 0], [1, 1, 1], [0, 0, 0]], color: '#a78bfa' },
  S: { m: [[0, 1, 1], [1, 1, 0], [0, 0, 0]], color: '#4ade80' },
  Z: { m: [[1, 1, 0], [0, 1, 1], [0, 0, 0]], color: '#f87171' },
  J: { m: [[1, 0, 0], [1, 1, 1], [0, 0, 0]], color: '#60a5fa' },
  L: { m: [[0, 0, 1], [1, 1, 1], [0, 0, 0]], color: '#fb923c' },
}
const TYPES = Object.keys(PIECES) as PieceType[]
const KICKS = [[0, 0], [-1, 0], [1, 0], [0, -1], [-2, 0], [2, 0], [-1, -1], [1, -1]]

const rotateCW = (m: Matrix) => m[0].map((_, i) => m.map(r => r[i]).reverse())
const rotateCCW = (m: Matrix) => m[0].map((_, i) => m.map(r => r[r.length - 1 - i]))
const emptyBoard = (): Board => Array.from({ length: ROWS }, () => Array<string | null>(COLS).fill(null))
const gravityFor = (level: number) => Math.pow(0.8 - (level - 1) * 0.007, level - 1)

function shuffledBag(): PieceType[] {
  const bag = [...TYPES]
  for (let i = bag.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[bag[i], bag[j]] = [bag[j], bag[i]]
  }
  return bag
}

interface Active {
  type: PieceType
  m: Matrix
  x: number
  y: number
}

function newGame() {
  return {
    board: emptyBoard(),
    queue: [...shuffledBag(), ...shuffledBag()],
    active: null as Active | null,
    hold: null as PieceType | null,
    canHold: true,
    score: 0,
    lines: 0,
    level: 1,
    gravityAcc: 0,
    lockTimer: 0,
    lockResets: 0,
    held: { left: false, right: false },
    dasDir: 0 as -1 | 0 | 1,
    dasTimer: 0,
    arrAcc: 0,
    softDrop: false,
    clearing: null as { rows: number[]; t: number } | null,
  }
}

function MiniPiece({ type }: { type: PieceType | null }) {
  if (!type) return <div className="h-10" />
  const { m, color } = PIECES[type]
  const rows = m.filter(r => r.some(Boolean))
  const cols = m[0].map((_, i) => i).filter(i => m.some(r => r[i]))
  return (
    <div className="flex h-10 items-center justify-center">
      <div className="grid gap-[2px]" style={{ gridTemplateColumns: `repeat(${cols.length}, 12px)` }}>
        {rows.flatMap((r, ri) =>
          cols.map(ci => (
            <span
              key={`${ri}-${ci}`}
              className="h-3 w-3 rounded-[3px]"
              style={{ background: r[ci] ? color : 'transparent' }}
            />
          ))
        )}
      </div>
    </div>
  )
}

export function Tetris() {
  const { canvasRef, ctxRef } = useCanvas(W, H)
  const g = useRef(newGame())
  const phaseRef = useRef<Phase>('ready')
  const [phase, setPhaseState] = useState<Phase>('ready')
  const [stats, setStats] = useState({ score: 0, lines: 0, level: 1 })
  const [preview, setPreview] = useState<{ next: PieceType[]; hold: PieceType | null }>({ next: [], hold: null })
  const [best, setBest] = useState(() => readBest(KEY) ?? 0)
  const [record, setRecord] = useState(false)
  const touch = useState(isTouchDevice)[0]
  const { t: tr } = useI18n()
  const g$ = tr.game

  const setPhase = (p: Phase) => {
    phaseRef.current = p
    setPhaseState(p)
  }

  const collides = (m: Matrix, x: number, y: number) => {
    const board = g.current.board
    for (let r = 0; r < m.length; r++)
      for (let c = 0; c < m[r].length; c++) {
        if (!m[r][c]) continue
        const bx = x + c
        const by = y + r
        if (bx < 0 || bx >= COLS || by >= ROWS) return true
        if (by >= 0 && board[by][bx]) return true
      }
    return false
  }

  const syncHud = () => {
    const s = g.current
    setStats({ score: s.score, lines: s.lines, level: s.level })
    setPreview({ next: s.queue.slice(0, 3), hold: s.hold })
  }

  const gameOver = () => {
    const s = g.current
    setPhase('over')
    setRecord(s.score > (readBest(KEY) ?? 0))
    setBest(recordScore(KEY, s.score))
  }

  const spawn = (type: PieceType) => {
    const s = g.current
    const m = PIECES[type].m.map(r => [...r])
    const active: Active = { type, m, x: Math.floor((COLS - m.length) / 2), y: type === 'I' ? -1 : 0 }
    s.active = active
    s.gravityAcc = 0
    s.lockTimer = 0
    s.lockResets = 0
    if (collides(m, active.x, active.y)) gameOver()
  }

  const spawnNext = () => {
    const s = g.current
    const type = s.queue.shift()!
    if (s.queue.length < 7) s.queue.push(...shuffledBag())
    s.canHold = true
    spawn(type)
    syncHud()
  }

  const grounded = () => {
    const a = g.current.active
    return !!a && collides(a.m, a.x, a.y + 1)
  }

  const resetLock = () => {
    const s = g.current
    if (grounded() && s.lockResets < MAX_LOCK_RESETS) {
      s.lockTimer = 0
      s.lockResets++
    }
  }

  const tryMove = (dx: number, dy: number) => {
    const a = g.current.active
    if (!a || collides(a.m, a.x + dx, a.y + dy)) return false
    a.x += dx
    a.y += dy
    if (dx !== 0) resetLock()
    return true
  }

  const rotate = (dir: 1 | -1) => {
    const a = g.current.active
    if (!a || a.type === 'O') return
    const m = dir === 1 ? rotateCW(a.m) : rotateCCW(a.m)
    for (const [kx, ky] of KICKS) {
      if (!collides(m, a.x + kx, a.y + ky)) {
        a.m = m
        a.x += kx
        a.y += ky
        resetLock()
        return
      }
    }
  }

  const lock = () => {
    const s = g.current
    const a = s.active
    if (!a) return
    let above = false
    a.m.forEach((row, r) =>
      row.forEach((v, c) => {
        if (!v) return
        if (a.y + r < 0) above = true
        else s.board[a.y + r][a.x + c] = PIECES[a.type].color
      })
    )
    s.active = null
    if (above) return gameOver()

    const full = s.board.map((row, i) => (row.every(Boolean) ? i : -1)).filter(i => i >= 0)
    if (full.length) {
      s.clearing = { rows: full, t: CLEAR_TIME }
      s.lines += full.length
      s.score += LINE_POINTS[full.length] * s.level
      s.level = Math.floor(s.lines / 10) + 1
      syncHud()
    } else {
      spawnNext()
    }
  }

  const hardDrop = () => {
    const s = g.current
    const a = s.active
    if (!a) return
    let d = 0
    while (!collides(a.m, a.x, a.y + 1)) {
      a.y++
      d++
    }
    s.score += d * 2
    lock()
    syncHud()
  }

  const hold = () => {
    const s = g.current
    if (!s.canHold || !s.active) return
    const current = s.active.type
    if (s.hold) {
      const swap = s.hold
      s.hold = current
      spawn(swap)
    } else {
      s.hold = current
      spawnNext()
    }
    s.canHold = false
    syncHud()
  }

  const start = useCallback(() => {
    g.current = newGame()
    setRecord(false)
    setPhase('playing')
    spawnNext()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const press = (action: string) => {
    const s = g.current
    if (phaseRef.current !== 'playing' || !s.active || s.clearing) return
    switch (action) {
      case 'left':
      case 'right': {
        const d = action === 'left' ? -1 : 1
        s.held[action] = true
        s.dasDir = d
        s.dasTimer = 0
        s.arrAcc = 0
        tryMove(d, 0)
        break
      }
      case 'down':
        s.softDrop = true
        break
      case 'rotate':
        rotate(1)
        break
      case 'rotateBack':
        rotate(-1)
        break
      case 'drop':
        hardDrop()
        break
      case 'hold':
        hold()
        break
    }
  }

  const release = (action: string) => {
    const s = g.current
    if (action === 'left' || action === 'right') {
      s.held[action] = false
      const other = action === 'left' ? 'right' : 'left'
      s.dasDir = s.held[other] ? (other === 'left' ? -1 : 1) : 0
      s.dasTimer = 0
    }
    if (action === 'down') s.softDrop = false
  }

  const keyAction = (k: string) =>
    ({
      ArrowLeft: 'left', a: 'left', A: 'left',
      ArrowRight: 'right', d: 'right', D: 'right',
      ArrowDown: 'down', s: 'down', S: 'down',
      ArrowUp: 'rotate', w: 'rotate', W: 'rotate', x: 'rotate', X: 'rotate',
      z: 'rotateBack', Z: 'rotateBack',
      ' ': 'drop',
      c: 'hold', C: 'hold', Shift: 'hold',
    })[k]

  useKeyboard(
    e => {
      const p = phaseRef.current
      if (e.key === 'p' || e.key === 'P') {
        if (p === 'playing') setPhase('paused')
        else if (p === 'paused') setPhase('playing')
        return
      }
      if (p !== 'playing') {
        if (e.key === 'Enter' || e.key === ' ' || e.key === 'r' || e.key === 'R') {
          if (p === 'paused') setPhase('playing')
          else start()
        }
        return
      }
      if (e.key === 'r' || e.key === 'R') return start()
      const action = keyAction(e.key)
      if (action && !e.repeat) press(action)
    },
    e => {
      const action = keyAction(e.key)
      if (action) release(action)
    }
  )

  useGameLoop(
    dt => {
      const s = g.current
      if (phaseRef.current !== 'playing') return

      if (s.clearing) {
        s.clearing.t -= dt
        if (s.clearing.t <= 0) {
          const rows = new Set(s.clearing.rows)
          const kept = s.board.filter((_, i) => !rows.has(i))
          s.board = [...Array.from({ length: rows.size }, () => Array<string | null>(COLS).fill(null)), ...kept]
          s.clearing = null
          spawnNext()
        }
        return
      }
      if (!s.active) return

      if (s.dasDir !== 0) {
        s.dasTimer += dt
        if (s.dasTimer >= DAS) {
          s.arrAcc += dt
          while (s.arrAcc >= ARR) {
            s.arrAcc -= ARR
            if (!tryMove(s.dasDir, 0)) break
          }
        }
      }

      // Soft drop: about 10x faster than normal gravity, but still visibly falling.
      const interval = s.softDrop ? Math.max(0.05, Math.min(gravityFor(s.level), gravityFor(s.level) / 10)) : gravityFor(s.level)
      s.gravityAcc += dt
      while (s.gravityAcc >= interval) {
        s.gravityAcc -= interval
        if (!tryMove(0, 1)) {
          s.gravityAcc = 0
          break
        }
        if (s.softDrop) s.score += 1
      }

      if (grounded()) {
        s.lockTimer += dt
        if (s.lockTimer >= LOCK_DELAY) {
          lock()
          syncHud()
        }
      } else s.lockTimer = 0
    },
    () => {
      const ctx = ctxRef.current
      if (!ctx) return
      const s = g.current

      ctx.fillStyle = '#0b0b10'
      ctx.fillRect(0, 0, W, H)
      ctx.strokeStyle = 'rgba(255,255,255,0.04)'
      ctx.lineWidth = 1
      ctx.beginPath()
      for (let x = 1; x < COLS; x++) {
        ctx.moveTo(x * CELL + 0.5, 0)
        ctx.lineTo(x * CELL + 0.5, H)
      }
      for (let y = 1; y < ROWS; y++) {
        ctx.moveTo(0, y * CELL + 0.5)
        ctx.lineTo(W, y * CELL + 0.5)
      }
      ctx.stroke()

      const block = (x: number, y: number, color: string, alpha = 1) => {
        ctx.globalAlpha = alpha
        ctx.fillStyle = color
        ctx.beginPath()
        ctx.roundRect(x * CELL + 1.5, y * CELL + 1.5, CELL - 3, CELL - 3, 5)
        ctx.fill()
        ctx.fillStyle = 'rgba(255,255,255,0.22)'
        ctx.fillRect(x * CELL + 5, y * CELL + 4, CELL - 10, 3)
        ctx.globalAlpha = 1
      }

      s.board.forEach((row, y) => row.forEach((c, x) => c && block(x, y, c)))

      if (s.clearing) {
        const k = s.clearing.t / CLEAR_TIME
        ctx.fillStyle = `rgba(255,255,255,${0.85 * k})`
        for (const r of s.clearing.rows) ctx.fillRect(0, r * CELL, W, CELL)
      }

      const a = s.active
      if (a) {
        let gy = a.y
        while (!collides(a.m, a.x, gy + 1)) gy++
        const color = PIECES[a.type].color
        ctx.strokeStyle = color
        ctx.globalAlpha = 0.45
        ctx.lineWidth = 1.5
        a.m.forEach((row, r) =>
          row.forEach((v, c) => {
            if (!v || gy + r < 0) return
            ctx.beginPath()
            ctx.roundRect((a.x + c) * CELL + 3, (gy + r) * CELL + 3, CELL - 6, CELL - 6, 4)
            ctx.stroke()
          })
        )
        ctx.globalAlpha = 1
        const fade = grounded() ? 1 - (s.lockTimer / LOCK_DELAY) * 0.35 : 1
        a.m.forEach((row, r) => row.forEach((v, c) => v && a.y + r >= 0 && block(a.x + c, a.y + r, color, fade)))
      }
    }
  )

  const reserve = touch ? 370 : 210
  const overlay =
    phase === 'ready' ? (
      <Overlay title={tr.arcade.games.tetris.title} subtitle={touch ? g$.tetris.hintTouch : g$.tetris.hintKeys} action={g$.start} onAction={start} />
    ) : phase === 'paused' ? (
      <Overlay title={g$.paused} action={g$.resume} onAction={() => setPhase('playing')} />
    ) : phase === 'over' ? (
      <Overlay title={g$.gameOver} subtitle={g$.tetris.result(stats.score, stats.lines) + (record ? g$.newBest : '')} action={g$.playAgain} onAction={start} />
    ) : null

  return (
    <div>
      <GameHud
        stats={[
          { label: g$.score, value: stats.score },
          { label: g$.lines, value: stats.lines },
          { label: g$.level, value: stats.level },
          { label: g$.best, value: best },
        ]}
        onRestart={start}
      />
      <div className="flex justify-center gap-3">
        <div
          className="relative overflow-hidden rounded-xl border border-line"
          style={{ height: `min(600px, calc(100dvh - ${reserve}px))`, aspectRatio: '1 / 2', minHeight: 320 }}
        >
          <canvas ref={canvasRef} className="block h-full w-full" aria-label="Tetris board" />
          {overlay}
        </div>
        <div className="flex w-20 flex-col gap-2 sm:w-24">
          <div className="rounded-lg border border-line bg-elevated p-2">
            <p className="text-[10px] font-medium uppercase tracking-wider text-subtle">{g$.hold}</p>
            <MiniPiece type={preview.hold} />
          </div>
          <div className="rounded-lg border border-line bg-elevated p-2">
            <p className="text-[10px] font-medium uppercase tracking-wider text-subtle">{g$.next}</p>
            {preview.next.map((t, i) => (
              <div key={i} style={{ opacity: 1 - i * 0.25 }}>
                <MiniPiece type={t} />
              </div>
            ))}
          </div>
          {!touch && (
            <ul className="mt-1 space-y-1 font-mono text-[10px] leading-tight text-subtle">
              {g$.tetris.keys.map(k => (
                <li key={k}>{k}</li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {touch && (
        <div className="mx-auto mt-4 flex max-w-xs flex-col gap-2">
          <div className="grid grid-cols-4 gap-2">
            <GameButton label={g$.hold} onPress={() => press('hold')}><span className="text-xs font-medium">{g$.hold}</span></GameButton>
            <GameButton label={g$.tetris.rotate} onPress={() => press('rotate')} className="col-span-2"><RotateCw size={20} /></GameButton>
            <GameButton label={g$.tetris.hardDrop} onPress={() => press('drop')}><ChevronsDown size={20} /></GameButton>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <GameButton label={g$.left} onPress={() => press('left')} onRelease={() => release('left')}><ArrowLeft size={20} /></GameButton>
            <GameButton label={g$.tetris.softDrop} onPress={() => press('down')} onRelease={() => release('down')}><ArrowDown size={20} /></GameButton>
            <GameButton label={g$.right} onPress={() => press('right')} onRelease={() => release('right')}><ArrowRight size={20} /></GameButton>
          </div>
        </div>
      )}
    </div>
  )
}
