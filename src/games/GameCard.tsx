import React, { useState, lazy, Suspense } from 'react'
import { motion } from 'framer-motion'
import { Play, Trophy } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import type { GameMeta } from '@/types'

const MemoryCard    = lazy(() => import('./MemoryCard/MemoryCard').then(m => ({ default: m.MemoryCard })))
const DinoRunner    = lazy(() => import('./DinoRunner/DinoRunner').then(m => ({ default: m.DinoRunner })))
const Snake         = lazy(() => import('./Snake/Snake').then(m => ({ default: m.Snake })))
const Tetris        = lazy(() => import('./Tetris/Tetris').then(m => ({ default: m.Tetris })))
const FlappyBird    = lazy(() => import('./FlappyBird/FlappyBird').then(m => ({ default: m.FlappyBird })))
const Game2048      = lazy(() => import('./Game2048/Game2048').then(m => ({ default: m.Game2048 })))
const Breakout      = lazy(() => import('./Breakout/Breakout').then(m => ({ default: m.Breakout })))
const Minesweeper   = lazy(() => import('./Minesweeper/Minesweeper').then(m => ({ default: m.Minesweeper })))

const gameMap: Record<string, React.ComponentType> = {
  memory:      MemoryCard,
  dino:        DinoRunner,
  snake:       Snake,
  tetris:      Tetris,
  flappy:      FlappyBird,
  '2048':      Game2048,
  breakout:    Breakout,
  minesweeper: Minesweeper,
}

interface GameCardProps {
  game: GameMeta
}

export const GameCard: React.FC<GameCardProps> = ({ game }) => {
  const [open, setOpen] = useState(false)
  const highScore = parseInt(localStorage.getItem(`hs-${game.id}`) ?? '0', 10)
  const GameComponent = gameMap[game.id]

  return (
    <>
      <motion.div
        className="h-full dark:bg-dark-card bg-light-card border dark:border-dark-border border-light-border rounded-2xl p-5 flex flex-col gap-3 cursor-pointer group hover-glow"
        whileHover={{ y: -4 }}
        onClick={() => setOpen(true)}
        role="button"
        tabIndex={0}
        onKeyDown={e => e.key === 'Enter' && setOpen(true)}
        aria-label={`Launch ${game.title}`}
      >
        {/* Icon */}
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
          style={{ background: `${game.color}22`, border: `1px solid ${game.color}44` }}
        >
          {game.icon}
        </div>

        <div>
          <h3 className="font-heading font-semibold dark:text-white text-slate-900 group-hover:text-accent-400 transition-colors">
            {game.title}
          </h3>
          <p className="text-xs dark:text-slate-500 text-slate-500 mt-0.5 leading-relaxed">
            {game.description}
          </p>
        </div>

        <div className="mt-auto flex items-center justify-between">
          {highScore > 0 && (
            <span className="flex items-center gap-1 text-xs dark:text-slate-400 text-slate-500">
              <Trophy size={11} style={{ color: game.color }} />
              {highScore}
            </span>
          )}
          <motion.div
            className="ml-auto flex items-center gap-1 text-xs font-medium transition-colors"
            style={{ color: game.color }}
          >
            <Play size={13} />
            Play
          </motion.div>
        </div>
      </motion.div>

      <Modal
        isOpen={open}
        onClose={() => setOpen(false)}
        title={game.title}
        size="lg"
      >
        <div className="p-4">
          <Suspense
            fallback={
              <div className="h-64 flex items-center justify-center text-sm dark:text-slate-500 text-slate-500">
                Loading game…
              </div>
            }
          >
            {GameComponent && <GameComponent />}
          </Suspense>
        </div>
      </Modal>
    </>
  )
}
