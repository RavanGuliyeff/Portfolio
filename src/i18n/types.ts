export type Lang = 'en' | 'az' | 'tr' | 'ru'

export const LANGS: { code: Lang; label: string; short: string }[] = [
  { code: 'en', label: 'English', short: 'EN' },
  { code: 'az', label: 'Azərbaycanca', short: 'AZ' },
  { code: 'tr', label: 'Türkçe', short: 'TR' },
  { code: 'ru', label: 'Русский', short: 'RU' },
]

type Fn<A extends unknown[]> = (...args: A) => string

export interface Dictionary {
  months: string[]
  present: string

  nav: Record<'about' | 'experience' | 'projects' | 'skills' | 'education' | 'arcade' | 'contact', string> & {
    resume: string
    downloadResume: string
    skip: string
    openMenu: string
    closeMenu: string
    lightTheme: string
    darkTheme: string
    language: string
  }

  hero: {
    available: string
    role: string
    headline: string
    intro: string
    seeWork: string
    downloadCv: string
    github: string
    linkedin: string
  }
  metrics: { value: string; label: string }[]

  about: {
    eyebrow: string
    title: string
    /** `**text**` is rendered with emphasis */
    paragraphs: string[]
    facts: { label: string; value: string }[]
  }

  experience: {
    eyebrow: string
    title: string
    description: string
    technologies: string
    items: Record<string, { role: string; employment?: string; highlights: string[] }>
  }

  projects: {
    eyebrow: string
    title: string
    description: string
    moreOnGithub: string
    items: Record<string, { kind: string; summary: string; highlights: string[]; team?: string }>
  }

  skills: {
    eyebrow: string
    title: string
    description: string
    groups: Record<string, string>
  }

  education: {
    eyebrow: string
    title: string
    education: string
    certifications: string
    inProgress: string
    items: Record<string, { degree: string; details: string[] }>
    certNotes: Record<string, string>
  }

  arcade: {
    eyebrow: string
    title: string
    description: string
    new: string
    play: string
    loading: string
    failed: string
    scoreLabels: Record<'best' | 'fewestMoves' | 'bestTime', string>
    games: Record<string, { title: string; description: string; controls: string }>
  }

  contact: {
    eyebrow: string
    title: string
    description: string
    email: string
    copy: string
    fields: { name: string; email: string; subject: string; message: string }
    errors: { name: string; email: string; emailInvalid: string; subject: string; message: string }
    send: string
    sending: string
    viaService: string
    viaMailApp: string
    success: string
    mailtoInfo: string
    failed: string
    failedLink: string
    failedTail: string
  }

  footer: { builtWith: string }

  game: {
    start: string
    resume: string
    paused: string
    gameOver: string
    playAgain: string
    tryAgain: string
    runAgain: string
    newGame: string
    restart: string
    newBest: string
    score: string
    best: string
    lines: string
    level: string
    lives: string
    moves: string
    time: string
    mines: string
    hold: string
    next: string
    up: string
    down: string
    left: string
    right: string
    snake: { hintKeys: string; hintTouch: string; result: Fn<[number]> }
    tetris: {
      hintKeys: string
      hintTouch: string
      result: Fn<[number, number]>
      keys: string[]
      rotate: string
      hardDrop: string
      softDrop: string
    }
    runner: { hintKeys: string; hintTouch: string; result: Fn<[number]>; jump: string; duck: string }
    flappy: { hintKeys: string; hintTouch: string; result: Fn<[number]> }
    breakout: {
      hintKeys: string
      hintTouch: string
      launchKeys: string
      launchTouch: string
      levelLabel: string
      cleared: string
      result: Fn<[number]>
    }
    g2048: { won: string; noMoves: string; keepGoing: string; hint: string; result: Fn<[number]> }
    memory: { allFound: string; result: Fn<[number, string]>; hidden: string }
    minesweeper: {
      easy: string
      medium: string
      cleared: Fn<[number]>
      boom: string
      flagMode: string
      digMode: string
      longPress: string
      hintDesktop: string
    }
    typer: {
      timeLeft: string
      accuracy: string
      wpm: string
      newSnippet: string
      focus: string
      timeUp: string
      timeUpText: string
      finished: string
      breakdown: { chars: Fn<[number]>; time: Fn<[number]>; mistakes: Fn<[number]>; total: string }
      next: string
      retry: string
      rules: string
      fixErrors: string
    }
  }
}
