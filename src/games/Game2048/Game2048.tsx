import { useCallback, useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp } from 'lucide-react'
import { isTouchDevice, useKeyboard, useSwipe } from '../engine/input'
import { readBest, recordScore } from '../engine/storage'
import { GameButton, GameHud } from '../engine/GameUI'
import { useI18n } from '@/i18n/I18nProvider'

const SIZE = 4
const KEY = 'hs-2048'
const MOVE_MS = 110

type Dir = 'up' | 'down' | 'left' | 'right'
interface Tile {
  id: number
  value: number
  r: number
  c: number
  isNew?: boolean
  merged?: boolean
  removing?: boolean
}

let nextId = 1

const STYLES: Record<number, { bg: string; fg: string }> = {
  2: { bg: '#27272a', fg: '#e4e4e7' },
  4: { bg: '#3f3f46', fg: '#f4f4f5' },
  8: { bg: '#c2410c', fg: '#fff' },
  16: { bg: '#ea580c', fg: '#fff' },
  32: { bg: '#e11d48', fg: '#fff' },
  64: { bg: '#be123c', fg: '#fff' },
  128: { bg: '#ca8a04', fg: '#fff' },
  256: { bg: '#d97706', fg: '#fff' },
  512: { bg: '#16a34a', fg: '#fff' },
  1024: { bg: '#0891b2', fg: '#fff' },
  2048: { bg: '#7c6cff', fg: '#fff' },
}
const styleFor = (v: number) => STYLES[v] ?? { bg: '#18181b', fg: '#a79dff' }

function spawn(tiles: Tile[]): Tile[] {
  const taken = new Set(tiles.filter(t => !t.removing).map(t => t.r * SIZE + t.c))
  const free = Array.from({ length: SIZE * SIZE }, (_, i) => i).filter(i => !taken.has(i))
  if (!free.length) return tiles
  const i = free[Math.floor(Math.random() * free.length)]
  return [...tiles, { id: nextId++, value: Math.random() < 0.9 ? 2 : 4, r: Math.floor(i / SIZE), c: i % SIZE, isNew: true }]
}

const initial = () => spawn(spawn([]))

/** Pure move: returns the new tiles (merged-away tiles flagged `removing`) and points gained. */
function move(tiles: Tile[], dir: Dir) {
  const live = tiles.filter(t => !t.removing).map(t => ({ ...t, isNew: false, merged: false }))
  const out: Tile[] = []
  let points = 0
  let moved = false

  for (let line = 0; line < SIZE; line++) {
    const inLine = live
      .filter(t => (dir === 'left' || dir === 'right' ? t.r === line : t.c === line))
      .sort((a, b) => {
        const ka = dir === 'left' || dir === 'right' ? a.c : a.r
        const kb = dir === 'left' || dir === 'right' ? b.c : b.r
        return dir === 'left' || dir === 'up' ? ka - kb : kb - ka
      })

    let pos = 0
    let last: Tile | null = null
    for (const t of inLine) {
      if (last && !last.merged && last.value === t.value) {
        last.value *= 2
        last.merged = true
        points += last.value
        out.push({ ...t, r: last.r, c: last.c, removing: true })
        moved = true
        continue
      }
      const idx = dir === 'left' || dir === 'up' ? pos : SIZE - 1 - pos
      const target = dir === 'left' || dir === 'right' ? { r: line, c: idx } : { r: idx, c: line }
      if (target.r !== t.r || target.c !== t.c) moved = true
      const placed = { ...t, ...target }
      out.push(placed)
      last = placed
      pos++
    }
  }
  return { tiles: out, points, moved }
}

function canMove(tiles: Tile[]) {
  const live = tiles.filter(t => !t.removing)
  if (live.length < SIZE * SIZE) return true
  const grid: number[][] = Array.from({ length: SIZE }, () => Array(SIZE).fill(0))
  live.forEach(t => (grid[t.r][t.c] = t.value))
  for (let r = 0; r < SIZE; r++)
    for (let c = 0; c < SIZE; c++) {
      if (c < SIZE - 1 && grid[r][c] === grid[r][c + 1]) return true
      if (r < SIZE - 1 && grid[r][c] === grid[r + 1][c]) return true
    }
  return false
}

export function Game2048() {
  const [tiles, setTiles] = useState<Tile[]>(initial)
  const [score, setScore] = useState(0)
  const [best, setBest] = useState(() => readBest(KEY) ?? 0)
  const [status, setStatus] = useState<'playing' | 'won' | 'over' | 'continue'>('playing')
  const tilesRef = useRef(tiles)
  const scoreRef = useRef(0)
  const statusRef = useRef(status)
  const boardRef = useRef<HTMLDivElement>(null)
  const cleanup = useRef<ReturnType<typeof setTimeout>>()
  const touch = useState(isTouchDevice)[0]
  const { t: tr } = useI18n()
  const g$ = tr.game

  tilesRef.current = tiles
  statusRef.current = status

  useEffect(() => () => clearTimeout(cleanup.current), [])

  const doMove = useCallback((dir: Dir) => {
    if (statusRef.current === 'won' || statusRef.current === 'over') return
    const result = move(tilesRef.current, dir)
    if (!result.moved) return

    const next = spawn(result.tiles)
    tilesRef.current = next
    setTiles(next)

    scoreRef.current += result.points
    setScore(scoreRef.current)
    setBest(b => Math.max(b, scoreRef.current))

    // Remove merged-away tiles once they have slid under their partner.
    clearTimeout(cleanup.current)
    cleanup.current = setTimeout(() => {
      setTiles(ts => {
        const kept = ts.filter(t => !t.removing)
        tilesRef.current = kept
        return kept
      })
    }, MOVE_MS)

    if (statusRef.current === 'playing' && next.some(t => t.value >= 2048 && !t.removing)) {
      recordScore(KEY, scoreRef.current)
      setStatus('won')
    } else if (!canMove(next)) {
      recordScore(KEY, scoreRef.current)
      setStatus('over')
    }
  }, [])

  const restart = useCallback(() => {
    recordScore(KEY, scoreRef.current)
    const t = initial()
    tilesRef.current = t
    scoreRef.current = 0
    setTiles(t)
    setScore(0)
    setStatus('playing')
  }, [])

  // Persist the best score if the dialog is closed mid-game.
  useEffect(() => () => void recordScore(KEY, scoreRef.current), [])

  const KEYS: Record<string, Dir> = {
    ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
    w: 'up', s: 'down', a: 'left', d: 'right', W: 'up', S: 'down', A: 'left', D: 'right',
  }
  useKeyboard(e => {
    const dir = KEYS[e.key]
    if (dir) doMove(dir)
    if (e.key === 'r' || e.key === 'R') restart()
  })
  useSwipe(boardRef, doMove)

  const gap = 'clamp(6px, 2.4cqw, 12px)'

  return (
    <div>
      <GameHud stats={[{ label: g$.score, value: score }, { label: g$.best, value: best }]} onRestart={restart} />
      <div className="flex justify-center">
        <div
          ref={boardRef}
          className="relative touch-none select-none overflow-hidden rounded-xl bg-[#18181b] dark:bg-[#111113]"
          style={{
            width: `min(100%, 460px, calc(100dvh - ${touch ? 360 : 220}px))`,
            aspectRatio: '1',
            containerType: 'inline-size',
            minWidth: 240,
          }}
        >
          <div className="absolute inset-0 grid grid-cols-4 grid-rows-4" style={{ gap, padding: gap }}>
            {Array.from({ length: 16 }, (_, i) => (
              <div key={i} className="rounded-lg bg-white/[0.05]" />
            ))}
          </div>
          <div className="absolute inset-0" style={{ padding: gap }}>
            <div className="relative h-full w-full">
              {tiles.map(t => {
                const st = styleFor(t.value)
                const style: CSSProperties = {
                  width: `calc((100% - 3 * ${gap}) / 4)`,
                  height: `calc((100% - 3 * ${gap}) / 4)`,
                  transform: `translate(calc(${t.c} * (100% + ${gap})), calc(${t.r} * (100% + ${gap})))`,
                  transition: `transform ${MOVE_MS}ms ease-in-out`,
                  zIndex: t.removing ? 1 : 2,
                }
                return (
                  <div key={t.id} className="absolute left-0 top-0" style={style}>
                    <div
                      key={t.value}
                      className={`grid h-full w-full place-items-center rounded-lg font-bold tabular-nums ${
                        t.isNew ? 'animate-tile-in' : t.merged ? 'animate-tile-pop' : ''
                      }`}
                      style={{
                        background: st.bg,
                        color: st.fg,
                        fontSize: t.value >= 1024 ? '6.5cqw' : t.value >= 128 ? '8cqw' : '9.5cqw',
                      }}
                    >
                      {t.value}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {(status === 'won' || status === 'over') && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-black/60 text-center backdrop-blur-[2px]">
              <p className="text-2xl font-semibold text-white">{status === 'won' ? g$.g2048.won : g$.g2048.noMoves}</p>
              <p className="text-sm text-white/75">{g$.g2048.result(score)}</p>
              <div className="flex gap-2">
                {status === 'won' && (
                  <button
                    type="button"
                    onMouseDown={e => e.preventDefault()}
                    onClick={() => setStatus('continue')}
                    className="rounded-lg border border-white/30 px-4 py-2 text-sm font-medium text-white"
                  >
                    {g$.g2048.keepGoing}
                  </button>
                )}
                <button
                  type="button"
                  onMouseDown={e => e.preventDefault()}
                  onClick={restart}
                  className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-zinc-900"
                >
                  {g$.newGame}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {touch && (
        <div className="mx-auto mt-4 grid w-44 grid-cols-3 gap-2">
          <span />
          <GameButton label={g$.up} onPress={() => doMove('up')}><ArrowUp size={20} /></GameButton>
          <span />
          <GameButton label={g$.left} onPress={() => doMove('left')}><ArrowLeft size={20} /></GameButton>
          <GameButton label={g$.down} onPress={() => doMove('down')}><ArrowDown size={20} /></GameButton>
          <GameButton label={g$.right} onPress={() => doMove('right')}><ArrowRight size={20} /></GameButton>
        </div>
      )}
      {!touch && <p className="mt-3 text-center font-mono text-xs text-subtle">{g$.g2048.hint}</p>}
    </div>
  )
}
