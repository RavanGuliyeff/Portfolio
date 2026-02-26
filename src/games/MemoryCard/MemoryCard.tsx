import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { RefreshCw, Timer, Move } from 'lucide-react'

const EMOJIS = ['🦊', '🐉', '🌙', '⚡', '🎯', '🔮', '🦋', '🚀']
const SYMBOLS = [...EMOJIS, ...EMOJIS]

interface CardState {
  id:       number
  symbol:   string
  flipped:  boolean
  matched:  boolean
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function initCards(): CardState[] {
  return shuffle(SYMBOLS).map((symbol, id) => ({ id, symbol, flipped: false, matched: false }))
}

export const MemoryCard: React.FC = () => {
  const [cards,    setCards]    = useState<CardState[]>(initCards)
  const [selected, setSelected] = useState<number[]>([])
  const [moves,    setMoves]    = useState(0)
  const [time,     setTime]     = useState(0)
  const [running,  setRunning]  = useState(false)
  const [won,      setWon]      = useState(false)
  const [locked,   setLocked]   = useState(false)

  // Timer
  useEffect(() => {
    if (!running) return
    const id = setInterval(() => setTime(t => t + 1), 1000)
    return () => clearInterval(id)
  }, [running])

  // Save high score (best = fewest moves)
  useEffect(() => {
    if (!won) return
    const stored = parseInt(localStorage.getItem('hs-memory') ?? '9999', 10)
    if (moves < stored) localStorage.setItem('hs-memory', String(moves))
  }, [won, moves])

  const flip = useCallback((id: number) => {
    if (locked || won) return
    const card = cards[id]
    if (card.flipped || card.matched) return

    if (!running) setRunning(true)

    setCards(c => c.map(card => card.id === id ? { ...card, flipped: true } : card))
    const next = [...selected, id]
    setSelected(next)

    if (next.length === 2) {
      setLocked(true)
      setMoves(m => m + 1)
      const [a, b] = next
      if (cards[a].symbol === cards[b].symbol) {
        setCards(c =>
          c.map(card => card.id === a || card.id === b ? { ...card, matched: true } : card)
        )
        setSelected([])
        setLocked(false)
        if (cards.filter(c => !c.matched).length === 2) {
          setWon(true)
          setRunning(false)
        }
      } else {
        setTimeout(() => {
          setCards(c =>
            c.map(card => card.id === a || card.id === b ? { ...card, flipped: false } : card)
          )
          setSelected([])
          setLocked(false)
        }, 900)
      }
    }
  }, [cards, selected, locked, won, running])

  const restart = () => {
    setCards(initCards())
    setSelected([])
    setMoves(0)
    setTime(0)
    setRunning(false)
    setWon(false)
    setLocked(false)
  }

  const fmtTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

  return (
    <div className="flex flex-col items-center gap-4 select-none">
      {/* Stats */}
      <div className="flex items-center gap-6 text-sm dark:text-slate-400 text-slate-600">
        <span className="flex items-center gap-1.5"><Move size={14} /> {moves} moves</span>
        <span className="flex items-center gap-1.5"><Timer size={14} /> {fmtTime(time)}</span>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-4 gap-2">
        {cards.map(card => (
          <motion.button
            key={card.id}
            className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl text-2xl flex items-center justify-center
              border font-heading font-bold transition-colors
              ${card.matched
                ? 'dark:bg-accent-900/30 bg-accent-100 border-accent-500/40 cursor-default'
                : 'dark:bg-dark-border bg-light-border border-transparent hover:border-accent-500/50 cursor-pointer'
              }`}
            onClick={() => flip(card.id)}
            animate={{ rotateY: card.flipped || card.matched ? 0 : 180 }}
            transition={{ duration: 0.25 }}
            aria-label={card.flipped || card.matched ? card.symbol : 'Hidden card'}
          >
            {(card.flipped || card.matched) ? card.symbol : ''}
          </motion.button>
        ))}
      </div>

      {/* Win overlay */}
      <AnimatePresence>
        {won && (
          <motion.div
            className="absolute inset-0 dark:bg-dark-card/95 bg-light-card/95 flex flex-col items-center justify-center gap-4 rounded-2xl z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="text-4xl">🎉</div>
            <div className="font-heading font-bold text-xl dark:text-white text-slate-900">You won!</div>
            <div className="text-sm dark:text-slate-400 text-slate-600">
              {moves} moves · {fmtTime(time)}
            </div>
            <button
              onClick={restart}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-accent-500 text-white text-sm font-medium hover:bg-accent-600 transition-colors"
            >
              <RefreshCw size={14} /> Play Again
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={restart}
        className="flex items-center gap-1.5 text-xs dark:text-slate-500 text-slate-500 hover:text-accent-400 transition-colors"
        aria-label="Restart memory card game"
      >
        <RefreshCw size={12} /> Restart
      </button>
    </div>
  )
}
