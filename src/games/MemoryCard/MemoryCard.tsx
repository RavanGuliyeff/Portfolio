import { useCallback, useEffect, useRef, useState } from 'react'
import type { IconType } from 'react-icons'
import { SiDocker, SiDotnet, SiGit, SiGithub, SiGraphql, SiJavascript, SiPostgresql, SiRedis } from 'react-icons/si'
import { isTouchDevice } from '../engine/input'
import { readBest, recordScore } from '../engine/storage'
import { GameHud } from '../engine/GameUI'
import { useI18n } from '@/i18n/I18nProvider'

const KEY = 'hs-memory'

const LOGOS: { id: string; icon: IconType; color: string }[] = [
  { id: 'dotnet', icon: SiDotnet, color: '#7c6cff' },
  { id: 'postgres', icon: SiPostgresql, color: '#60a5fa' },
  { id: 'docker', icon: SiDocker, color: '#38bdf8' },
  { id: 'redis', icon: SiRedis, color: '#f87171' },
  { id: 'git', icon: SiGit, color: '#fb923c' },
  { id: 'graphql', icon: SiGraphql, color: '#f472b6' },
  { id: 'js', icon: SiJavascript, color: '#facc15' },
  { id: 'github', icon: SiGithub, color: '#e4e4e7' },
]

interface Card {
  key: number
  logo: number
  matched: boolean
}

function deal(): Card[] {
  const cards = [...LOGOS.keys(), ...LOGOS.keys()].map((logo, key) => ({ key, logo, matched: false }))
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[cards[i], cards[j]] = [cards[j], cards[i]]
  }
  return cards
}

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

export function MemoryCard() {
  const [cards, setCards] = useState(deal)
  const [open, setOpen] = useState<number[]>([]) // indexes currently face up (max 2)
  const [moves, setMoves] = useState(0)
  const [seconds, setSeconds] = useState(0)
  const [started, setStarted] = useState(false)
  const [won, setWon] = useState(false)
  const [best, setBest] = useState(() => readBest(KEY))
  const [record, setRecord] = useState(false)
  const hideTimer = useRef<ReturnType<typeof setTimeout>>()
  const touch = useState(isTouchDevice)[0]
  const { t: tr } = useI18n()
  const g$ = tr.game

  useEffect(() => {
    if (!started || won) return
    const id = setInterval(() => setSeconds(s => s + 1), 1000)
    return () => clearInterval(id)
  }, [started, won])

  useEffect(() => () => clearTimeout(hideTimer.current), [])

  const flip = useCallback(
    (index: number) => {
      if (won || cards[index].matched || open.includes(index)) return
      if (!started) setStarted(true)

      // A third click while a mismatched pair is showing hides it right away.
      if (open.length === 2) {
        clearTimeout(hideTimer.current)
        setOpen([index])
        return
      }
      const nextOpen = [...open, index]
      setOpen(nextOpen)
      if (nextOpen.length < 2) return

      const movesNow = moves + 1
      setMoves(movesNow)
      const [a, b] = nextOpen
      if (cards[a].logo === cards[b].logo) {
        const next = cards.map((c, i) => (i === a || i === b ? { ...c, matched: true } : c))
        setCards(next)
        setOpen([])
        if (next.every(c => c.matched)) {
          setWon(true)
          setRecord(best === null || movesNow < best)
          setBest(recordScore(KEY, movesNow, 'lower'))
        }
      } else {
        hideTimer.current = setTimeout(() => setOpen([]), 800)
      }
    },
    [cards, open, moves, won, started, best]
  )

  const restart = () => {
    clearTimeout(hideTimer.current)
    setCards(deal())
    setOpen([])
    setMoves(0)
    setSeconds(0)
    setStarted(false)
    setWon(false)
    setRecord(false)
  }

  return (
    <div>
      <GameHud
        stats={[
          { label: g$.moves, value: moves },
          { label: g$.time, value: fmt(seconds) },
          { label: g$.best, value: best ?? '—' },
        ]}
        onRestart={restart}
      />
      <div className="flex justify-center">
        <div
          className="relative grid grid-cols-4 gap-2 sm:gap-3"
          style={{ width: `min(100%, 480px, calc(100dvh - ${touch ? 240 : 220}px))`, minWidth: 240 }}
        >
          {cards.map((card, i) => {
            const faceUp = card.matched || open.includes(i)
            const { icon: Icon, color } = LOGOS[card.logo]
            return (
              <button
                key={card.key}
                type="button"
                onClick={() => flip(i)}
                className="aspect-square [perspective:600px]"
                aria-label={faceUp ? LOGOS[card.logo].id : g$.memory.hidden}
                disabled={card.matched}
              >
                <div
                  className="relative h-full w-full transition-transform duration-300 [transform-style:preserve-3d]"
                  style={{ transform: faceUp ? 'rotateY(180deg)' : 'none' }}
                >
                  <div className="absolute inset-0 grid place-items-center rounded-xl border border-line bg-elevated [backface-visibility:hidden] hover:border-accent/50">
                    <span className="h-2 w-2 rounded-full bg-accent/50" />
                  </div>
                  <div
                    className={`absolute inset-0 grid place-items-center rounded-xl border bg-[#141418] [backface-visibility:hidden] [transform:rotateY(180deg)] ${
                      card.matched ? 'border-emerald-500/50' : 'border-line'
                    }`}
                  >
                    <Icon style={{ color, width: '45%', height: '45%' }} />
                  </div>
                </div>
              </button>
            )
          })}

          {won && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-xl bg-black/65 text-center backdrop-blur-[2px]">
              <p className="text-2xl font-semibold text-white">{g$.memory.allFound}</p>
              <p className="text-sm text-white/75">
                {g$.memory.result(moves, fmt(seconds))}
                {record ? g$.newBest : ''}
              </p>
              <button
                type="button"
                onClick={restart}
                className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-zinc-900"
              >
                {g$.playAgain}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
