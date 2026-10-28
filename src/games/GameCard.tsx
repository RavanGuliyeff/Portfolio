import { Suspense, lazy, useState } from 'react'
import type { ComponentType } from 'react'
import { Bird, Bomb, Brain, BrickWall, Footprints, Grid2x2, Keyboard, Play, Blocks, Trophy, Worm } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'
import type { GameMeta } from '@/types'
import { readBest } from './engine/storage'
import { useI18n } from '@/i18n/I18nProvider'

const GAMES: Record<string, ComponentType> = {
  typer: lazy(() => import('./CodeTyper/CodeTyper').then(m => ({ default: m.CodeTyper }))),
  snake: lazy(() => import('./Snake/Snake').then(m => ({ default: m.Snake }))),
  tetris: lazy(() => import('./Tetris/Tetris').then(m => ({ default: m.Tetris }))),
  dino: lazy(() => import('./DinoRunner/DinoRunner').then(m => ({ default: m.DinoRunner }))),
  '2048': lazy(() => import('./Game2048/Game2048').then(m => ({ default: m.Game2048 }))),
  breakout: lazy(() => import('./Breakout/Breakout').then(m => ({ default: m.Breakout }))),
  flappy: lazy(() => import('./FlappyBird/FlappyBird').then(m => ({ default: m.FlappyBird }))),
  memory: lazy(() => import('./MemoryCard/MemoryCard').then(m => ({ default: m.MemoryCard }))),
  minesweeper: lazy(() => import('./Minesweeper/Minesweeper').then(m => ({ default: m.Minesweeper }))),
}

const ICONS: Record<string, LucideIcon> = {
  typer: Keyboard,
  snake: Worm,
  tetris: Blocks,
  dino: Footprints,
  '2048': Grid2x2,
  breakout: BrickWall,
  flappy: Bird,
  memory: Brain,
  minesweeper: Bomb,
}

export function GameCard({ game, featured = false }: { game: GameMeta; featured?: boolean }) {
  const [open, setOpen] = useState(false)
  const { t } = useI18n()
  const text = t.arcade.games[game.id]
  const [best, setBest] = useState(() => readBest(game.score.key))
  const Game = GAMES[game.id]
  const Icon = ICONS[game.id] ?? Play

  const close = () => {
    setOpen(false)
    setBest(readBest(game.score.key))
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`card group flex h-full w-full flex-col p-5 text-left transition-colors hover:border-accent/40 ${
          featured ? 'sm:p-6' : ''
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div
            className="grid h-10 w-10 place-items-center rounded-xl"
            style={{ background: `${game.accent}1f`, color: game.accent }}
          >
            <Icon size={19} />
          </div>
          {featured && (
            <span className="rounded-full bg-accent/10 px-2 py-0.5 text-[11px] font-medium text-accent-text">{t.arcade.new}</span>
          )}
        </div>
        <h3 className="mt-4 font-semibold text-fg">{text.title}</h3>
        <p className="mt-1 text-sm leading-relaxed text-muted">{text.description}</p>
        <div className="mt-auto flex items-center justify-between gap-2 pt-4 text-xs">
          <span className="flex items-center gap-1.5 text-subtle">
            {best !== null && (
              <>
                <Trophy size={12} />
                {t.arcade.scoreLabels[game.score.label]}: <span className="font-mono text-fg">{best}{game.score.unit ? ` ${game.score.unit}` : ''}</span>
              </>
            )}
          </span>
          <span className="flex items-center gap-1 font-medium text-accent-text opacity-80 transition-opacity group-hover:opacity-100">
            <Play size={12} /> {t.arcade.play}
          </span>
        </div>
      </button>

      <Modal open={open} onClose={close} title={text.title} subtitle={text.controls}>
        <ErrorBoundary fallback={<p className="py-16 text-center text-sm text-muted">{t.arcade.failed}</p>}>
          <Suspense fallback={<div className="grid h-72 place-items-center text-sm text-subtle">{t.arcade.loading}</div>}>
            {open && <Game />}
          </Suspense>
        </ErrorBoundary>
      </Modal>
    </>
  )
}
