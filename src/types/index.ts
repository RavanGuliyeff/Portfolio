export type Theme = 'dark' | 'light'

export type ScoreOrder = 'higher' | 'lower'

export interface GameMeta {
  id: string
  accent: string
  score: {
    key: string
    label: 'best' | 'fewestMoves' | 'bestTime'
    order: ScoreOrder
    unit?: string
  }
}

export interface ContactFormData {
  name: string
  email: string
  subject: string
  message: string
}
