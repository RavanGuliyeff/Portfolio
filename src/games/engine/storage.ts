import type { ScoreOrder } from '@/types'

export function readBest(key: string): number | null {
  try {
    const raw = localStorage.getItem(key)
    if (raw === null) return null
    const n = Number(raw)
    return Number.isFinite(n) && n > 0 ? n : null
  } catch {
    return null
  }
}

/** Saves `value` if it beats the stored record. Returns the (possibly new) best. */
export function recordScore(key: string, value: number, order: ScoreOrder = 'higher'): number {
  const best = readBest(key)
  const better = best === null || (order === 'higher' ? value > best : value < best)
  if (!better || value <= 0) return best ?? 0
  try {
    localStorage.setItem(key, String(value))
  } catch {
    // Ignore: storage may be disabled.
  }
  return value
}
