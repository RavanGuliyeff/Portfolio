import { useEffect, useRef, useState } from 'react'
import { Bomb, Flag, MousePointerClick } from 'lucide-react'
import { isTouchDevice } from '../engine/input'
import { readBest, recordScore } from '../engine/storage'
import { GameHud } from '../engine/GameUI'
import { useI18n } from '@/i18n/I18nProvider'

interface Level {
  id: string
  label: string
  size: number
  mines: number
  key: string
}

const LEVELS: Level[] = [
  { id: 'easy', label: 'Easy', size: 9, mines: 10, key: 'hs-minesweeper' },
  { id: 'medium', label: 'Medium', size: 16, mines: 40, key: 'hs-minesweeper-medium' },
]

const NUMBER_COLORS = ['', '#60a5fa', '#4ade80', '#f87171', '#a78bfa', '#fb923c', '#22d3ee', '#e4e4e7', '#a1a1aa']

interface Cell {
  mine: boolean
  open: boolean
  flag: boolean
  adj: number
}
type Phase = 'idle' | 'playing' | 'won' | 'lost'

const emptyBoard = (n: number): Cell[] =>
  Array.from({ length: n * n }, () => ({ mine: false, open: false, flag: false, adj: 0 }))

function neighbours(i: number, n: number) {
  const r = Math.floor(i / n)
  const c = i % n
  const out: number[] = []
  for (let dr = -1; dr <= 1; dr++)
    for (let dc = -1; dc <= 1; dc++) {
      if (!dr && !dc) continue
      const nr = r + dr
      const nc = c + dc
      if (nr >= 0 && nr < n && nc >= 0 && nc < n) out.push(nr * n + nc)
    }
  return out
}

/** Places mines after the first click, keeping that cell and its neighbours safe. */
function layMines(board: Cell[], n: number, mines: number, safe: number) {
  const forbidden = new Set([safe, ...neighbours(safe, n)])
  const spots = board.map((_, i) => i).filter(i => !forbidden.has(i))
  for (let k = 0; k < mines; k++) {
    const j = k + Math.floor(Math.random() * (spots.length - k))
    ;[spots[k], spots[j]] = [spots[j], spots[k]]
    board[spots[k]].mine = true
  }
  board.forEach((cell, i) => (cell.adj = neighbours(i, n).filter(j => board[j].mine).length))
}

/** Opens cells (flood-filling zeros). Returns true if a mine was opened. */
function openCells(board: Cell[], n: number, start: number[]) {
  const stack = [...start]
  let boom = false
  while (stack.length) {
    const i = stack.pop()!
    const cell = board[i]
    if (cell.open || cell.flag) continue
    cell.open = true
    if (cell.mine) {
      boom = true
      continue
    }
    if (cell.adj === 0) stack.push(...neighbours(i, n))
  }
  return boom
}

export function Minesweeper() {
  const [level, setLevel] = useState(LEVELS[0])
  const [board, setBoard] = useState(() => emptyBoard(LEVELS[0].size))
  const [phase, setPhase] = useState<Phase>('idle')
  const [exploded, setExploded] = useState<number | null>(null)
  const [startedAt, setStartedAt] = useState(0)
  const [elapsed, setElapsed] = useState(0)
  const [flagMode, setFlagMode] = useState(false)
  const [best, setBest] = useState(() => readBest(LEVELS[0].key))
  const [record, setRecord] = useState(false)
  const pressTimer = useRef<ReturnType<typeof setTimeout>>()
  const longPressed = useRef(false)
  const touch = useState(isTouchDevice)[0]
  const { t: tr } = useI18n()
  const g$ = tr.game
  const n = level.size

  useEffect(() => {
    if (phase !== 'playing') return
    const id = setInterval(() => setElapsed(Math.floor((Date.now() - startedAt) / 1000)), 250)
    return () => clearInterval(id)
  }, [phase, startedAt])

  const reset = (lv = level) => {
    setLevel(lv)
    setBoard(emptyBoard(lv.size))
    setPhase('idle')
    setExploded(null)
    setElapsed(0)
    setBest(readBest(lv.key))
    setRecord(false)
  }

  const reveal = (i: number) => {
    if (phase === 'won' || phase === 'lost') return
    const next = board.map(c => ({ ...c }))
    const cell = next[i]
    if (cell.flag) return

    let start = startedAt
    if (phase === 'idle') {
      layMines(next, n, level.mines, i)
      start = Date.now()
      setStartedAt(start)
      setPhase('playing')
    }

    let targets = [i]
    // "Chording": clicking an open number with the right flags around it opens the rest.
    if (cell.open) {
      const around = neighbours(i, n)
      if (cell.adj === 0 || around.filter(j => next[j].flag).length !== cell.adj) return
      targets = around.filter(j => !next[j].flag && !next[j].open)
    }

    const boom = openCells(next, n, targets)
    if (boom) {
      setExploded(targets.find(j => next[j].mine && next[j].open) ?? i)
      next.forEach(c => c.mine && (c.open = true))
      setPhase('lost')
      setBoard(next)
      return
    }
    setBoard(next)
    if (next.every(c => c.mine || c.open)) {
      const time = Math.max(1, Math.round((Date.now() - start) / 1000))
      setElapsed(time)
      setRecord(best === null || time < best)
      setBest(recordScore(level.key, time, 'lower'))
      setPhase('won')
      next.forEach(c => c.mine && (c.flag = true))
    }
  }

  const toggleFlag = (i: number) => {
    if (phase === 'won' || phase === 'lost' || board[i].open) return
    setBoard(b => b.map((c, j) => (j === i ? { ...c, flag: !c.flag } : c)))
  }

  const act = (i: number) => (flagMode ? toggleFlag(i) : reveal(i))

  const flags = board.filter(c => c.flag).length
  const fontSize = n <= 9 ? '5cqw' : '3.4cqw'

  return (
    <div>
      <GameHud
        stats={[
          { label: g$.mines, value: Math.max(0, level.mines - flags) },
          { label: g$.time, value: `${elapsed}s` },
          { label: g$.best, value: best ? `${best}s` : '—' },
        ]}
        onRestart={() => reset()}
      >
        <div className="flex rounded-lg border border-line p-0.5">
          {LEVELS.map(lv => (
            <button
              key={lv.id}
              type="button"
              onMouseDown={e => e.preventDefault()}
              onClick={() => reset(lv)}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                lv.id === level.id ? 'bg-accent text-accent-fg' : 'text-muted hover:text-fg'
              }`}
            >
              {lv.id === 'easy' ? g$.minesweeper.easy : g$.minesweeper.medium}
            </button>
          ))}
        </div>
      </GameHud>

      <div className="flex justify-center">
        <div
          className="relative select-none overflow-hidden rounded-xl border border-line bg-[#1c1c24] p-1"
          style={{
            width: `min(100%, 560px, calc(100dvh - ${touch ? 280 : 220}px))`,
            minWidth: 260,
            containerType: 'inline-size',
          }}
          onContextMenu={e => e.preventDefault()}
        >
          <div className="grid gap-[2px]" style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}>
            {board.map((cell, i) => {
              const lostMine = phase === 'lost' && cell.mine
              const wrongFlag = phase === 'lost' && cell.flag && !cell.mine
              return (
                <button
                  key={i}
                  type="button"
                  className={`grid aspect-square place-items-center rounded-[3px] font-mono font-bold leading-none transition-colors ${
                    cell.open
                      ? lostMine
                        ? i === exploded
                          ? 'bg-red-500'
                          : 'bg-red-500/25'
                        : 'bg-[#0e0e12]'
                      : 'bg-[#3a3a48] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] hover:bg-[#464656] active:bg-[#50505f]'
                  }`}
                  style={{ fontSize, color: cell.open && !cell.mine ? NUMBER_COLORS[cell.adj] : undefined }}
                  onClick={() => {
                    if (longPressed.current) {
                      longPressed.current = false
                      return
                    }
                    act(i)
                  }}
                  onContextMenu={e => {
                    e.preventDefault()
                    toggleFlag(i)
                  }}
                  onPointerDown={e => {
                    if (e.pointerType !== 'touch') return
                    longPressed.current = false
                    pressTimer.current = setTimeout(() => {
                      longPressed.current = true
                      navigator.vibrate?.(15)
                      toggleFlag(i)
                    }, 380)
                  }}
                  onPointerUp={() => clearTimeout(pressTimer.current)}
                  onPointerLeave={() => clearTimeout(pressTimer.current)}
                  aria-label={cell.open ? (cell.mine ? 'Mine' : `${cell.adj} adjacent mines`) : cell.flag ? 'Flagged' : 'Hidden'}
                >
                  {cell.open && cell.mine ? (
                    <Bomb className="h-[60%] w-[60%] text-white" />
                  ) : cell.flag ? (
                    <Flag className={`h-[55%] w-[55%] ${wrongFlag ? 'text-zinc-500 opacity-60' : 'text-amber-400'}`} />
                  ) : cell.open && cell.adj > 0 ? (
                    cell.adj
                  ) : null}
                </button>
              )
            })}
          </div>

          {(phase === 'won' || phase === 'lost') && (
            <div className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center">
              <div className="pointer-events-auto flex items-center gap-3 rounded-xl bg-black/80 px-4 py-2.5 text-sm text-white shadow-lg backdrop-blur">
                <span>{phase === 'won' ? g$.minesweeper.cleared(elapsed) + (record ? g$.newBest : '') : g$.minesweeper.boom}</span>
                <button type="button" onClick={() => reset()} className="rounded-md bg-white px-2.5 py-1 text-xs font-medium text-zinc-900">
                  {g$.playAgain}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-center gap-3">
        {touch ? (
          <button
            type="button"
            onClick={() => setFlagMode(f => !f)}
            className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${
              flagMode ? 'border-amber-400/60 bg-amber-400/10 text-amber-500' : 'border-line text-muted'
            }`}
          >
            {flagMode ? <Flag size={15} /> : <MousePointerClick size={15} />}
            {flagMode ? g$.minesweeper.flagMode : g$.minesweeper.digMode} · {g$.minesweeper.longPress}
          </button>
        ) : (
          <p className="font-mono text-xs text-subtle">{g$.minesweeper.hintDesktop}</p>
        )}
      </div>
    </div>
  )
}
