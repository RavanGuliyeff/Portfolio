import React, { useState, useEffect, useCallback, useRef } from 'react'
import { RefreshCw, Flag, Trophy } from 'lucide-react'

//  Types & Config 
type Phase = 'idle' | 'playing' | 'won' | 'lost'

interface Cell {
  mine:     boolean
  revealed: boolean
  flagged:  boolean
  adj:      number
}

interface Config { rows: number; cols: number; mines: number; label: string }

const CONFIGS: Config[] = [
  { rows: 9,  cols: 9,  mines: 10, label: 'Beginner'      },
  { rows: 16, cols: 16, mines: 40, label: 'Intermediate'  },
]

const ADJ_COLORS = ['','#3b82f6','#16a34a','#dc2626','#1d4ed8','#b91c1c','#0891b2','#6b7280','#6b7280']

//  Helpers 
function emptyGrid(rows: number, cols: number): Cell[][] {
  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ({ mine: false, revealed: false, flagged: false, adj: 0 }))
  )
}

function buildGrid(rows: number, cols: number, mines: number, safeR: number, safeC: number): Cell[][] {
  const grid = emptyGrid(rows, cols)
  // Place mines avoiding safe cell and its neighbors
  const safe = new Set<string>()
  for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
    const nr = safeR + dr, nc = safeC + dc
    if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) safe.add(`${nr},${nc}`)
  }
  let placed = 0
  while (placed < mines) {
    const r = Math.floor(Math.random() * rows)
    const c = Math.floor(Math.random() * cols)
    if (!grid[r][c].mine && !safe.has(`${r},${c}`)) { grid[r][c].mine = true; placed++ }
  }
  // Calculate adjacencies
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    if (grid[r][c].mine) continue
    let cnt = 0
    for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
      const nr = r + dr, nc = c + dc
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc].mine) cnt++
    }
    grid[r][c].adj = cnt
  }
  return grid
}

function reveal(grid: Cell[][], r: number, c: number): Cell[][] {
  const next = grid.map(row => row.map(cell => ({ ...cell })))
  function flood(rr: number, cc: number) {
    if (rr < 0 || rr >= next.length || cc < 0 || cc >= next[0].length) return
    const cell = next[rr][cc]
    if (cell.revealed || cell.flagged || cell.mine) return
    cell.revealed = true
    if (cell.adj === 0) {
      for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
        if (dr !== 0 || dc !== 0) flood(rr + dr, cc + dc)
      }
    }
  }
  flood(r, c)
  return next
}

function revealAll(grid: Cell[][]): Cell[][] {
  return grid.map(row => row.map(c => ({ ...c, revealed: true })))
}

function checkWin(grid: Cell[][]): boolean {
  return grid.every(row => row.every(c => c.mine ? !c.revealed : c.revealed))
}

//  Component 
export const Minesweeper: React.FC = () => {
  const [cfgIdx, setCfgIdx]   = useState(0)
  const cfg = CONFIGS[cfgIdx]

  const [grid,    setGrid]    = useState<Cell[][]>(() => emptyGrid(cfg.rows, cfg.cols))
  const [phase,   setPhase]   = useState<Phase>('idle')
  const [time,    setTime]    = useState(0)
  const [best,    setBest]    = useState<number[]>([
    parseInt(localStorage.getItem('ms-best-0') ?? '0', 10),
    parseInt(localStorage.getItem('ms-best-1') ?? '0', 10),
  ])
  const [flags,   setFlags]   = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => setTime(t => t + 1), 1000)
  }, [])

  const stopTimer = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null }
  }, [])

  useEffect(() => () => stopTimer(), [stopTimer])

  const reset = useCallback((newCfgIdx?: number) => {
    stopTimer()
    const idx = newCfgIdx ?? cfgIdx
    const c = CONFIGS[idx]
    setGrid(emptyGrid(c.rows, c.cols))
    setPhase('idle')
    setTime(0)
    setFlags(0)
  }, [cfgIdx, stopTimer])

  const switchDifficulty = (idx: number) => { setCfgIdx(idx); reset(idx) }

  const handleReveal = useCallback((r: number, c: number) => {
    if (phase === 'lost' || phase === 'won') return
    setGrid(prev => {
      const cell = prev[r][c]
      if (cell.revealed || cell.flagged) return prev
      // First click  build real grid
      let g = prev
      if (phase === 'idle') {
        g = buildGrid(cfg.rows, cfg.cols, cfg.mines, r, c)
        setPhase('playing')
        startTimer()
      }
      if (g[r][c].mine) {
        stopTimer()
        const next = revealAll(g)
        next[r][c] = { ...next[r][c], revealed: true }
        setPhase('lost')
        return next
      }
      const next = reveal(g, r, c)
      if (checkWin(next)) {
        stopTimer()
        setPhase('won')
        setBest(prev2 => {
          const updated = [...prev2]
          const key = `ms-best-${cfgIdx}`
          const prev3 = updated[cfgIdx]
          if (!prev3 || time + 1 < prev3) {
            updated[cfgIdx] = time + 1
            localStorage.setItem(key, String(time + 1))
          }
          return updated
        })
      }
      return next
    })
  }, [phase, cfg, cfgIdx, startTimer, stopTimer, time])

  const handleFlag = useCallback((e: React.MouseEvent, r: number, c: number) => {
    e.preventDefault()
    if (phase === 'lost' || phase === 'won') return
    setGrid(prev => {
      const cell = prev[r][c]
      if (cell.revealed) return prev
      const next = prev.map(row => row.map(c2 => ({ ...c2 })))
      next[r][c].flagged = !next[r][c].flagged
      setFlags(f => next[r][c].flagged ? f + 1 : f - 1)
      return next
    })
  }, [phase])

  const cellSize = cfgIdx === 0 ? 36 : 24

  function cellClass(cell: Cell, r: number, c: number): string {
    const base = 'relative flex items-center justify-center font-mono font-bold transition-all border select-none'
    if (cell.revealed) {
      if (cell.mine) return `${base} bg-red-600/90 border-red-500 text-white`
      return `${base} dark:bg-[#0e0e1c] bg-slate-100 dark:border-[#1e1e38] border-slate-200 text-[${ADJ_COLORS[cell.adj] || 'transparent'}]`
    }
    return `${base} dark:bg-[#1a1a2e] bg-white dark:border-[#2d2d5a] border-slate-300 cursor-pointer
      dark:hover:bg-[#22224a] hover:bg-violet-50 dark:hover:border-violet-600 hover:border-violet-400 active:scale-95`
  }

  function cellContent(cell: Cell) {
    if (!cell.revealed) return cell.flagged ? '' : null
    if (cell.mine) return ''
    if (cell.adj === 0) return null
    return <span style={{ color: ADJ_COLORS[cell.adj] }}>{cell.adj}</span>
  }

  const minesLeft = cfg.mines - flags

  return (
    <div className="flex flex-col items-center gap-3 select-none">
      {/* Header */}
      <div className="flex items-center gap-3 w-full justify-center flex-wrap">
        {CONFIGS.map((c, i) => (
          <button key={i} onClick={() => switchDifficulty(i)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all
              ${cfgIdx === i ? 'bg-violet-600 text-white' : 'dark:bg-[#1a1a2e] bg-slate-100 dark:text-slate-400 text-slate-600 hover:bg-violet-600/20 dark:border-[#2d2d5a] border border-slate-300'}`}
          >{c.label}</button>
        ))}
        <button onClick={() => reset()} aria-label="Restart"
          className="p-2 rounded-lg dark:bg-[#1a1a2e] bg-white dark:border-[#2d2d5a] border border-slate-300 dark:text-slate-400 text-slate-600 hover:text-violet-400 transition-all">
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Stats bar */}
      <div className="flex items-center gap-6 text-sm font-mono">
        <span className="flex items-center gap-1.5 dark:text-slate-400 text-slate-600">
          <Flag size={13} className="text-violet-400" /> {Math.max(0, minesLeft)}
        </span>
        <span className={`font-bold ${phase === 'won' ? 'text-emerald-400' : phase === 'lost' ? 'text-red-400' : 'dark:text-slate-300 text-slate-700'}`}>
          {phase === 'idle' ? '' : phase === 'won' ? '' : phase === 'lost' ? '' : ''}{' '}
          {phase !== 'idle' ? `${String(time).padStart(3, '0')}s` : 'Click to start'}
        </span>
        {best[cfgIdx] > 0 && (
          <span className="flex items-center gap-1 dark:text-slate-500 text-slate-500 text-xs">
            <Trophy size={11} className="text-yellow-500" /> {best[cfgIdx]}s
          </span>
        )}
      </div>

      {/* Grid */}
      <div
        className="rounded-xl overflow-hidden border dark:border-[#2d2d5a] border-slate-300 dark:bg-[#0a0a14] bg-slate-50"
        style={{ display: 'grid', gridTemplateColumns: `repeat(${cfg.cols}, ${cellSize}px)`, gap: 1, padding: 1 }}
      >
        {grid.map((row, r) =>
          row.map((cell, c) => (
            <div
              key={`${r},${c}`}
              className={cellClass(cell, r, c)}
              style={{ width: cellSize, height: cellSize, fontSize: cfgIdx === 0 ? 18 : 13 }}
              onClick={() => handleReveal(r, c)}
              onContextMenu={e => handleFlag(e, r, c)}
              role="button"
              tabIndex={0}
              onKeyDown={e => { if (e.key === 'Enter') handleReveal(r, c); if (e.key === 'f' || e.key === 'F') handleFlag(e as unknown as React.MouseEvent, r, c) }}
              aria-label={cell.revealed ? (cell.mine ? 'Mine' : `${cell.adj}`) : cell.flagged ? 'Flagged' : 'Hidden'}
            >
              {cellContent(cell)}
            </div>
          ))
        )}
      </div>

      <p className="text-xs dark:text-slate-600 text-slate-500 font-mono">
        Left click reveal  Right click flag
      </p>
    </div>
  )
}
