import { useEffect, useRef, useState } from 'react'
import { Check, Languages } from 'lucide-react'
import { useI18n } from '@/i18n/I18nProvider'
import { LANGS } from '@/i18n/types'

export function LanguageSwitcher() {
  const { lang, setLang, t } = useI18n()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e: PointerEvent) => !ref.current?.contains(e.target as Node) && setOpen(false)
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('pointerdown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const current = LANGS.find(l => l.code === lang)!

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t.nav.language}
        className="flex h-9 items-center gap-1.5 rounded-lg px-2 text-sm text-muted transition-colors hover:bg-elevated hover:text-fg"
      >
        <Languages size={16} />
        <span className="font-medium">{current.short}</span>
      </button>
      {open && (
        <ul
          role="listbox"
          aria-label={t.nav.language}
          className="absolute right-0 top-11 z-50 w-44 overflow-hidden rounded-xl border border-line bg-surface p-1 shadow-xl"
        >
          {LANGS.map(l => (
            <li key={l.code}>
              <button
                type="button"
                role="option"
                aria-selected={l.code === lang}
                onClick={() => {
                  setLang(l.code)
                  setOpen(false)
                }}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-elevated ${
                  l.code === lang ? 'text-fg' : 'text-muted'
                }`}
              >
                <span>
                  <span className="mr-2 font-mono text-xs text-subtle">{l.short}</span>
                  {l.label}
                </span>
                {l.code === lang && <Check size={15} className="text-accent-text" />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
