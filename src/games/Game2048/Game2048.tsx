import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { RefreshCw, Trophy } from 'lucide-react'

//  Types 
type Direction = 'left' | 'right' | 'up' | 'down'

interface TileData {
  id:         number
  value:      number
  row:        number
  col:        number
  isNew:      boolean
  isMerged:   boolean
}

//  Tile ID counter 
let _id = 0
function freshId() { return ++_id }

//  Tile style map 
const COLORS: Record<number, { bg: string; fg: string }> = {
  2:    { bg: '#1e1b3a', fg: '#c4b5fd' },
  4:    { bg: '#2e2060', fg: '#ddd6fe' },
  8:    { bg: '#7c3aed', fg: '#ffffff' },
  16:   { bg: '#6d28d9', fg: '#ffffff' },
  32:   { bg: '#ea580c', fg: '#ffffff' },
  64:   { bg: '#dc2626', fg: '#ffffff' },
  128:  { bg: '#d97706', fg: '#ffffff' },
  256:  { bg: '#ca8a04', fg: '#ffffff' },
  512:  { bg: '#16a34a', fg: '#ffffff' },
  1024: { bg: '#0891b2', fg: '#ffffff' },
  2048: { bg: '#7c3aed', fg: '#fff176' },
}
function tileColor(v: number) {
  return COLORS[v] ?? { bg: '#581c87', fg: '#ffffff' }
}

//  Grid helpers 
function makeEmpty(): TileData[] { return [] }

function spawnRandom(tiles: TileData[]): TileData[] {
  const occupied = new Set(tiles.map(t => `${t.row},${t.col}`))
  const free: [number, number][] = []
  for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) {
    if (!occupied.has(`${r},${c}`)) free.push([r, c])
  }
  if (!free.length) return tiles
  const [row, col] = free[Math.floor(Math.random() * free.length)]
  return [...tiles, { id: freshId(), value: Math.random() < 0.85 ? 2 : 4, row, col, isNew: true, isMerged: false }]
}

function init(): TileData[] {
  return spawnRandom(spawnRandom(makeEmpty()))
}

//  Move algorithm 
function moveTiles(tiles: TileData[], dir: Direction): { tiles: TileData[]; score: number; moved: boolean } {
  // Flatten to 4x4 grid keyed by position
  const grid: (TileData | null)[][] = Array.from({ length: 4 }, () => Array(4).fill(null))
  tiles.forEach(t => { grid[t.row][t.col] = t })

  const result: TileData[] = []
  let score = 0

  // Determine iteration order & target position assignment for each direction
  const rows    = [0, 1, 2, 3]
  const cols    = [0, 1, 2, 3]
  const revCols = [3, 2, 1, 0]
  const revRows = [3, 2, 1, 0]

  function slideLine(line: (TileData | null)[]): { out: TileData[]; removed: TileData[]; pts: number } {
    const filled = line.filter(Boolean) as TileData[]
    const out: TileData[] = []
    const removed: TileData[] = []
    let pts = 0
    let i = 0
    while (i < filled.length) {
      if (i + 1 < filled.length && filled[i].value === filled[i + 1].value) {
        const val = filled[i].value * 2
        pts += val
        out.push({ ...filled[i], value: val, isMerged: true, isNew: false })
        removed.push(filled[i + 1])
        i += 2
      } else {
        out.push({ ...filled[i], isMerged: false, isNew: false })
        i++
      }
    }
    return { out, removed, pts }
  }

  const removedIds = new Set<number>()

  if (dir === 'left') {
    rows.forEach(r => {
      const line = cols.map(c => grid[r][c])
      const { out, removed, pts } = slideLine(line)
      score += pts
      removed.forEach(t => removedIds.add(t.id))
      out.forEach((t, newC) => result.push({ ...t, row: r, col: newC }))
    })
  } else if (dir === 'right') {
    rows.forEach(r => {
      const line = revCols.map(c => grid[r][c])
      const { out, removed, pts } = slideLine(line)
      score += pts
      removed.forEach(t => removedIds.add(t.id))
      out.forEach((t, i) => result.push({ ...t, row: r, col: 3 - i }))
    })
  } else if (dir === 'up') {
    cols.forEach(c => {
      const line = rows.map(r => grid[r][c])
      const { out, removed, pts } = slideLine(line)
      score += pts
      removed.forEach(t => removedIds.add(t.id))
      out.forEach((t, newR) => result.push({ ...t, row: newR, col: c }))
    })
  } else {
    cols.forEach(c => {
      const line = revRows.map(r => grid[r][c])
      const { out, removed, pts } = slideLine(line)
      score += pts
      removed.forEach(t => removedIds.add(t.id))
      out.forEach((t, i) => result.push({ ...t, row: 3 - i, col: c }))
    })
  }

  const moved = result.some(t => {
    const orig = tiles.find(o => o.id === t.id)
    return orig && (orig.row !== t.row || orig.col !== t.col)
  }) || removedIds.size > 0

  return { tiles: result, score, moved }
}

function canMove(tiles: TileData[]): boolean {
  if (tiles.length < 16) return true
  const g: number[][] = Array.from({ length: 4 }, () => Array(4).fill(0))
  tiles.forEach(t => { g[t.row][t.col] = t.value })
  for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) {
    if (c < 3 && g[r][c] === g[r][c + 1]) return true
    if (r < 3 && g[r][c] === g[r + 1][c]) return true
  }
  return false
}

function hasWon(tiles: TileData[]) { return tiles.some(t => t.value >= 2048) }

//  Layout constants 
const GRID_PX = 308
const GAP_PX  = 6
const CELL_PX = (GRID_PX - GAP_PX * 5) / 4

function tilePos(n: number) { return GAP_PX + n * (CELL_PX + GAP_PX) }

//  Component 
export const Game2048: React.FC = () => {
  const [tiles,    setTiles]    = useState<TileData[]>(init)
  const [score,    setScore]    = useState(0)
  const [best,     setBest]     = useState(() => parseInt(localStorage.getItem('hs-2048') ?? '0', 10))
  const [gameOver, setGameOver] = useState(false)
  const [won,      setWon]      = useState(false)

  const doMove = useCallback((dir: Direction) => {
    setTiles(prev => {
      if (gameOver) return prev
      const { tiles: moved, score: pts, moved: didMove } = moveTiles(prev, dir)
      if (!didMove) return prev
      // Clear isNew/isMerged flags after first pass (so layout animates cleanly)
      const withNew = spawnRandom(moved.map(t => ({ ...t, isNew: false, isMerged: false })))
      setScore(s => {
        const ns = s + pts
        setBest(b => { const nb = Math.max(b, ns); if (nb > b) localStorage.setItem('hs-2048', String(nb)); return nb })
        return ns
      })
      if (!canMove(withNew)) setGameOver(true)
      if (hasWon(withNew) && !won) setWon(true)
      return withNew
    })
  }, [gameOver, won])

  const restart = useCallback(() => {
    setTiles(init())
    setScore(0)
    setGameOver(false)
    setWon(false)
  }, [])

  // Keyboard
  useEffect(() => {
    const map: Record<string, Direction> = {
      ArrowLeft:'left', ArrowRight:'right', ArrowUp:'up', ArrowDown:'down',
      a:'left', d:'right', w:'up', s:'down', A:'left', D:'right', W:'up', S:'down',
    }
    const onKey = (e: KeyboardEvent) => {
      const dir = map[e.key];
      if (!dir) return;
      e.preventDefault();
      doMove(dir)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [doMove])

  // Touch swipe
  useEffect(() => {
    let sx = 0, sy = 0
    const onStart = (e: TouchEvent) => { sx = e.touches[0].clientX; sy = e.touches[0].clientY }
    const onEnd   = (e: TouchEvent) => {
      const dx = e.changedTouches[0].clientX - sx
      const dy = e.changedTouches[0].clientY - sy
      if (Math.abs(dx) < 12 && Math.abs(dy) < 12) return
      doMove(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up'))
    }
    window.addEventListener('touchstart', onStart, { passive: true })
    window.addEventListener('touchend',   onEnd,   { passive: true })
    return () => { window.removeEventListener('touchstart', onStart); window.removeEventListener('touchend', onEnd) }
  }, [doMove])

  const fs = (v: number) => v >= 1024 ? 'text-sm font-bold' : v >= 128 ? 'text-base font-bold' : 'text-xl font-bold'

  return (
    <div className="flex flex-col items-center gap-4 select-none">
      {/* Score row */}
      <div className="flex items-center gap-3 w-full max-w-xs">
        <div className="flex gap-2 flex-1">
          {[{ l: 'SCORE', v: score }, { l: 'BEST', v: best }].map(({ l, v }) => (
            <div key={l} className="flex-1 px-3 py-2 rounded-xl bg-[#1a1a2e] border border-[#7c3aed33] text-center">
              <div className="text-[10px] font-mono tracking-widest text-violet-400 opacity-80">{l}</div>
              <div className="font-heading font-bold text-lg text-white leading-none">{v}</div>
            </div>
          ))}
        </div>
        <button onClick={restart} className="p-2 rounded-xl bg-[#1a1a2e] border border-[#7c3aed33] text-violet-400 hover:text-violet-300 hover:border-violet-500 transition-all" aria-label="Restart">
          <RefreshCw size={18} />
        </button>
      </div>

      {/* Grid */}
      <div
        className="relative rounded-xl overflow-hidden"
        style={{ width: GRID_PX, height: GRID_PX, background: '#13132a' }}
      >
        {/* Background cells */}
        {Array.from({ length: 16 }, (_, i) => {
          const r = Math.floor(i / 4), c = i % 4
          return (
            <div
              key={i}
              className="absolute rounded-lg"
              style={{
                top:    tilePos(r), left:  tilePos(c),
                width:  CELL_PX,   height: CELL_PX,
                background: '#1c1c38',
              }}
            />
          )
        })}

        {/* Tiles with layout animation */}
        <AnimatePresence>
          {tiles.map(tile => {
            const { bg, fg } = tileColor(tile.value)
            return (
              <motion.div
                key={tile.id}
                layout
                layoutId={String(tile.id)}
                initial={tile.isNew ? { scale: 0, opacity: 0 } : false}
                animate={
                  tile.isMerged
                    ? { scale: [1, 1.18, 1], opacity: 1, transition: { duration: 0.22 } }
                    : { scale: 1, opacity: 1, transition: { duration: 0.12 } }
                }
                exit={{ scale: 0.5, opacity: 0, transition: { duration: 0.12 } }}
                transition={{ layout: { type: 'spring', stiffness: 600, damping: 38 } }}
                className="absolute flex items-center justify-center rounded-lg"
                style={{
                  top:        tilePos(tile.row),
                  left:       tilePos(tile.col),
                  width:      CELL_PX,
                  height:     CELL_PX,
                  background: bg,
                  color:      fg,
                }}
              >
                <span className={fs(tile.value)}>{tile.value}</span>
              </motion.div>
            )
          })}
        </AnimatePresence>

        {/* Game-over overlay */}
        <AnimatePresence>
          {(gameOver || won) && (
            <motion.div
              className="absolute inset-0 flex flex-col items-center justify-center rounded-xl"
              style={{ background: 'rgba(5,5,20,0.82)' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="text-4xl mb-2">{won ? '' : ''}</div>
              <div className="font-heading font-bold text-xl text-white mb-1">
                {won ? 'You Won!' : 'Game Over'}
              </div>
              {gameOver && <div className="text-sm text-violet-300 mb-4">Score: {score}</div>}
              <button
                onClick={restart}
                className="px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-sm transition-colors"
              >
                Play Again
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* D-pad mobile controls */}
      <div className="flex md:hidden flex-col items-center gap-1 mt-1">
        <button onClick={() => doMove('up')} className="w-12 h-10 rounded-lg bg-[#1a1a2e] border border-[#7c3aed44] text-violet-400 text-xl font-bold hover:bg-violet-900/40 transition-colors"></button>
        <div className="flex gap-1">
          {(['left', 'down', 'right'] as Direction[]).map((d, i) => (
            <button key={d} onClick={() => doMove(d)} className="w-12 h-10 rounded-lg bg-[#1a1a2e] border border-[#7c3aed44] text-violet-400 text-xl font-bold hover:bg-violet-900/40 transition-colors">
              {['', '', ''][i]}
            </button>
          ))}
        </div>
      </div>

      {/* Best score trophy */}
      {best > 0 && (
        <div className="flex items-center gap-1.5 text-xs text-violet-400 font-medium opacity-70">
          <Trophy size={12} /> Best: {best}
        </div>
      )}
    </div>
  )
}
