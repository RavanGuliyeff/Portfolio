import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { Dictionary, Lang } from './types'
import { LANGS } from './types'
import en from './en'
import az from './az'
import tr from './tr'
import ru from './ru'

const DICTS: Record<Lang, Dictionary> = { en, az, tr, ru }
const STORAGE_KEY = 'rg-lang'

function initialLang(): Lang {
  try {
    const saved = localStorage.getItem(STORAGE_KEY) as Lang | null
    if (saved && saved in DICTS) return saved
  } catch {
    // ignore
  }
  const browser = (navigator.languages?.[0] ?? navigator.language ?? 'en').slice(0, 2).toLowerCase()
  return LANGS.some(l => l.code === browser) ? (browser as Lang) : 'en'
}

interface I18nValue {
  lang: Lang
  setLang: (l: Lang) => void
  t: Dictionary
  /** Formats `YYYY-MM` as e.g. "Oct 2025" in the current language. */
  date: (ym: string) => string
  range: (start: string, end?: string | null) => string
}

const I18nContext = createContext<I18nValue | null>(null)

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(initialLang)
  const t = DICTS[lang]

  useEffect(() => {
    document.documentElement.lang = lang
    try {
      localStorage.setItem(STORAGE_KEY, lang)
    } catch {
      // ignore
    }
  }, [lang])

  const setLang = useCallback((l: Lang) => setLangState(l), [])

  const value = useMemo<I18nValue>(() => {
    const date = (ym: string) => {
      const [y, m] = ym.split('-').map(Number)
      return `${t.months[m - 1]} ${y}`
    }
    const range = (start: string, end?: string | null) =>
      end === undefined ? date(start) : `${date(start)} – ${end === null ? t.present : date(end)}`
    return { lang, setLang, t, date, range }
  }, [lang, setLang, t])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used inside I18nProvider')
  return ctx
}
