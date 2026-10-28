import type { CSSProperties, MouseEvent, PointerEvent, ReactNode } from 'react'
import { RotateCcw } from 'lucide-react'
import { useI18n } from '@/i18n/I18nProvider'

export interface Stat {
  label: string
  value: ReactNode
}

// Buttons inside games must not keep keyboard focus, otherwise Space/Enter
// would both play the game and press the button.
const keepFocus = (e: MouseEvent) => e.preventDefault()

export function GameHud({
  stats,
  onRestart,
  children,
}: {
  stats: Stat[]
  onRestart?: () => void
  children?: ReactNode
}) {
  const { t } = useI18n()
  return (
    <div className="mb-3 flex flex-wrap items-center justify-between gap-2 sm:mb-4">
      <dl className="flex flex-wrap gap-2">
        {stats.map(s => (
          <div key={s.label} className="min-w-[72px] rounded-lg border border-line bg-elevated px-3 py-1.5">
            <dt className="text-[10px] font-medium uppercase tracking-wider text-subtle">{s.label}</dt>
            <dd className="font-mono text-sm font-semibold tabular-nums text-fg">{s.value}</dd>
          </div>
        ))}
      </dl>
      <div className="flex items-center gap-2">
        {children}
        {onRestart && (
          <button
            type="button"
            onMouseDown={keepFocus}
            onClick={onRestart}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-line bg-surface px-3 text-sm text-muted transition-colors hover:bg-elevated hover:text-fg"
          >
            <RotateCcw size={14} /> {t.game.restart}
          </button>
        )}
      </div>
    </div>
  )
}

export function GameButton({
  children,
  onPress,
  onRelease,
  className = '',
  label,
}: {
  children: ReactNode
  onPress: () => void
  onRelease?: () => void
  className?: string
  label: string
}) {
  const down = (e: PointerEvent) => {
    e.preventDefault()
    ;(e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId)
    onPress()
  }
  return (
    <button
      type="button"
      aria-label={label}
      onMouseDown={keepFocus}
      onPointerDown={down}
      onPointerUp={onRelease}
      onPointerCancel={onRelease}
      onContextMenu={e => e.preventDefault()}
      className={`grid h-12 min-w-12 touch-none select-none place-items-center rounded-xl border border-line bg-elevated px-3 text-fg active:scale-95 active:bg-line ${className}`}
    >
      {children}
    </button>
  )
}

/**
 * Centers a game surface and scales it to fit both the width and the height
 * of the dialog. `reserve` is the vertical space (px) used by the HUD and controls.
 */
export function Stage({
  ratio,
  reserve = 230,
  maxWidth,
  children,
  overlay,
}: {
  ratio: number
  reserve?: number
  maxWidth?: number
  children: ReactNode
  overlay?: ReactNode
}) {
  const style: CSSProperties = {
    aspectRatio: String(ratio),
    width: `min(100%, ${maxWidth ? `${maxWidth}px, ` : ''}calc((100dvh - ${reserve}px) * ${ratio}))`,
  }
  return (
    <div className="flex justify-center">
      <div className="relative min-w-[240px] overflow-hidden rounded-xl border border-line" style={style}>
        {children}
        {overlay}
      </div>
    </div>
  )
}

export function Overlay({
  title,
  subtitle,
  action,
  onAction,
}: {
  title: string
  subtitle?: ReactNode
  action?: string
  onAction?: () => void
}) {
  return (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/55 p-4 text-center backdrop-blur-[2px]"
      onPointerDown={e => {
        if (!onAction) return
        e.preventDefault()
        e.stopPropagation()
        onAction()
      }}
    >
      <p className="text-xl font-semibold text-white sm:text-2xl">{title}</p>
      {subtitle && <div className="max-w-xs text-sm text-white/75">{subtitle}</div>}
      {action && (
        <span className="mt-1 rounded-lg bg-white px-4 py-2 text-sm font-medium text-zinc-900 shadow">{action}</span>
      )}
    </div>
  )
}
