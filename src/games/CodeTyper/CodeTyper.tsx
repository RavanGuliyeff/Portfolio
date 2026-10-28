import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { ChangeEvent, KeyboardEvent } from 'react'
import { Keyboard, SkipForward } from 'lucide-react'
import { readBest, recordScore } from '../engine/storage'
import { GameHud } from '../engine/GameUI'
import { useI18n } from '@/i18n/I18nProvider'
import { SNIPPETS } from './snippets'

const KEY = 'hs-typer-score'

// Scoring rules (also shown to the player).
const POINTS_PER_CHAR = 10
const POINTS_PER_SECOND_LEFT = 15
const PENALTY_PER_MISTAKE = 20

/** Time allowed for a snippet: roughly 30 words per minute, plus a small buffer. */
const timeLimitFor = (code: string) => Math.ceil(code.length / 2.5) + 6

function pickSnippet(exclude?: number) {
  let i = Math.floor(Math.random() * SNIPPETS.length)
  if (i === exclude) i = (i + 1) % SNIPPETS.length
  return i
}

const wpmFor = (chars: number, ms: number) => (ms > 0 ? Math.round(chars / 5 / (ms / 60000)) : 0)

type Status = 'ready' | 'typing' | 'done' | 'timeout'

interface Result {
  chars: number
  secondsLeft: number
  mistakes: number
  score: number
}

export function CodeTyper() {
  const { t } = useI18n()
  const g$ = t.game
  const ty = g$.typer

  const [index, setIndex] = useState(() => pickSnippet())
  const [typed, setTyped] = useState('')
  const [status, setStatus] = useState<Status>('ready')
  const [startedAt, setStartedAt] = useState<number | null>(null)
  const [now, setNow] = useState(Date.now())
  const [keystrokes, setKeystrokes] = useState(0)
  const [mistakes, setMistakes] = useState(0)
  const [result, setResult] = useState<Result | null>(null)
  const [focused, setFocused] = useState(false)
  const [best, setBest] = useState(() => readBest(KEY) ?? 0)
  const [record, setRecord] = useState(false)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const snippet = SNIPPETS[index]
  const target = snippet.code
  const limit = timeLimitFor(target)
  const over = status === 'done' || status === 'timeout'

  useEffect(() => {
    inputRef.current?.focus()
  }, [index])

  // Tick the clock while typing and end the round when time runs out.
  useEffect(() => {
    if (status !== 'typing' || !startedAt) return
    const id = setInterval(() => {
      const n = Date.now()
      setNow(n)
      if ((n - startedAt) / 1000 >= limit) setStatus('timeout')
    }, 100)
    return () => clearInterval(id)
  }, [status, startedAt, limit])

  const correctPrefix = useMemo(() => {
    let i = 0
    while (i < typed.length && typed[i] === target[i]) i++
    return i
  }, [typed, target])
  const hasError = correctPrefix < typed.length

  const elapsedMs = startedAt ? Math.min(now - startedAt, limit * 1000) : 0
  const timeLeft = Math.max(0, limit - elapsedMs / 1000)
  const wpm = wpmFor(correctPrefix, elapsedMs)
  const accuracy = keystrokes ? Math.max(0, Math.round(((keystrokes - mistakes) / keystrokes) * 100)) : 100

  const next = useCallback(() => {
    setIndex(i => pickSnippet(i))
    setTyped('')
    setStatus('ready')
    setStartedAt(null)
    setKeystrokes(0)
    setMistakes(0)
    setResult(null)
    setRecord(false)
  }, [])

  const onChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    if (over) return
    let value = e.target.value.replace(/\r/g, '')
    if (value.length > target.length) value = value.slice(0, target.length)

    let ks = keystrokes
    let ms = mistakes
    let start = startedAt
    if (value.length > typed.length) {
      const added = value.slice(typed.length)
      ks += added.length
      for (let k = 0; k < added.length; k++) if (added[k] !== target[typed.length + k]) ms++
      if (!start) {
        start = Date.now()
        setNow(start)
        setStatus('typing')
      }
      // After a correct newline, skip the indentation automatically.
      if (value.endsWith('\n') && value === target.slice(0, value.length)) {
        while (target[value.length] === ' ') value += ' '
      }
    }
    setKeystrokes(ks)
    setMistakes(ms)
    setStartedAt(start)
    setTyped(value)

    if (value === target && start) {
      const end = Date.now()
      setNow(end)
      const secondsLeft = Math.max(0, Math.floor(limit - (end - start) / 1000))
      const score = Math.max(
        0,
        target.length * POINTS_PER_CHAR + secondsLeft * POINTS_PER_SECOND_LEFT - ms * PENALTY_PER_MISTAKE
      )
      setResult({ chars: target.length, secondsLeft, mistakes: ms, score })
      setStatus('done')
      setRecord(score > best)
      setBest(recordScore(KEY, score))
    }
  }

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab' || (e.key === 'Enter' && over)) {
      e.preventDefault()
      next()
    }
  }

  const chars = useMemo(() => {
    const out: JSX.Element[] = []
    for (let i = 0; i < target.length; i++) {
      const ch = target[i]
      const isTyped = i < typed.length
      const wrong = isTyped && typed[i] !== ch
      let cls = 'text-zinc-600'
      if (isTyped) cls = wrong ? 'bg-red-500/30 text-red-400 rounded-[2px]' : 'text-zinc-100'
      if (i === typed.length && !over) cls += ' caret'
      out.push(
        ch === '\n' ? (
          <span key={i} className={`${cls} select-none opacity-60`}>
            ↵{'\n'}
          </span>
        ) : (
          <span key={i} className={cls}>
            {ch}
          </span>
        )
      )
    }
    return out
  }, [target, typed, over])

  const pct = (timeLeft / limit) * 100
  const barColor = pct > 50 ? 'bg-emerald-500' : pct > 20 ? 'bg-amber-500' : 'bg-red-500'

  return (
    <div>
      <GameHud
        stats={[
          { label: ty.timeLeft, value: `${Math.ceil(timeLeft)}s` },
          { label: ty.wpm, value: wpm },
          { label: ty.accuracy, value: `${accuracy}%` },
          { label: g$.best, value: best ? `${best}` : '—' },
        ]}
      >
        <button
          type="button"
          onMouseDown={e => e.preventDefault()}
          onClick={next}
          className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-line bg-surface px-3 text-sm text-muted transition-colors hover:bg-elevated hover:text-fg"
        >
          <SkipForward size={14} /> {ty.newSnippet}
        </button>
      </GameHud>

      <div
        className="relative mx-auto max-w-3xl cursor-text overflow-hidden rounded-xl border border-line bg-[#0e0e14]"
        onClick={() => inputRef.current?.focus()}
      >
        <div className="flex items-center justify-between border-b border-white/5 px-4 py-2.5">
          <span className="font-mono text-xs text-zinc-400">{snippet.title}</span>
          <span className="rounded bg-white/5 px-1.5 py-0.5 font-mono text-[10px] text-zinc-400">{snippet.lang}</span>
        </div>
        <div className="h-1 w-full bg-white/5" aria-hidden="true">
          <div className={`h-full transition-[width] duration-100 ease-linear ${barColor}`} style={{ width: `${pct}%` }} />
        </div>
        <pre className="overflow-x-auto whitespace-pre px-4 py-5 font-mono text-[13px] leading-7 sm:px-6 sm:text-[15px]">
          {chars}
        </pre>

        <textarea
          ref={inputRef}
          value={typed}
          onChange={onChange}
          onKeyDown={onKeyDown}
          onPaste={e => e.preventDefault()}
          onDrop={e => e.preventDefault()}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          autoComplete="off"
          aria-label={ty.focus}
          className="absolute inset-0 h-full w-full resize-none opacity-0"
        />

        {!focused && !over && (
          <div className="pointer-events-none absolute inset-0 grid place-items-center bg-black/50 backdrop-blur-[1px]">
            <span className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-zinc-900">
              <Keyboard size={16} /> {ty.focus}
            </span>
          </div>
        )}

        {status === 'timeout' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/75 p-4 text-center backdrop-blur-[2px]">
            <p className="text-3xl font-semibold text-red-400">{ty.timeUp}</p>
            <p className="max-w-sm text-sm text-white/75">{ty.timeUpText}</p>
            <button
              type="button"
              onClick={e => {
                e.stopPropagation()
                next()
              }}
              className="mt-1 rounded-lg bg-white px-4 py-2 text-sm font-medium text-zinc-900"
            >
              {ty.retry}
            </button>
          </div>
        )}

        {status === 'done' && result && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/75 p-4 text-center backdrop-blur-[2px]">
            <p className="text-sm font-medium uppercase tracking-wider text-emerald-400">{ty.finished}</p>
            <dl className="w-64 space-y-1 font-mono text-sm text-white/80">
              <div className="flex justify-between">
                <dt>{ty.breakdown.chars(result.chars)}</dt>
                <dd>+{result.chars * POINTS_PER_CHAR}</dd>
              </div>
              <div className="flex justify-between">
                <dt>{ty.breakdown.time(result.secondsLeft)}</dt>
                <dd>+{result.secondsLeft * POINTS_PER_SECOND_LEFT}</dd>
              </div>
              <div className="flex justify-between">
                <dt>{ty.breakdown.mistakes(result.mistakes)}</dt>
                <dd>−{result.mistakes * PENALTY_PER_MISTAKE}</dd>
              </div>
              <div className="flex justify-between border-t border-white/20 pt-1 text-base font-semibold text-white">
                <dt>{ty.breakdown.total}</dt>
                <dd>{result.score}</dd>
              </div>
            </dl>
            <p className="text-sm text-white/70">
              {wpm} {ty.wpm} · {accuracy}%{record ? g$.newBest : ''}
            </p>
            <button
              type="button"
              onClick={e => {
                e.stopPropagation()
                next()
              }}
              className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-zinc-900"
            >
              {ty.next}
            </button>
          </div>
        )}
      </div>

      <p className="mx-auto mt-3 max-w-3xl text-center text-xs leading-relaxed text-subtle">
        {hasError && !over && <span className="text-red-400">{ty.fixErrors} </span>}
        {ty.rules}
      </p>
    </div>
  )
}
