// ─── Theme ────────────────────────────────────────────────────────────────────
export type Theme = 'dark' | 'light'

// ─── Navigation ───────────────────────────────────────────────────────────────
export interface NavLink {
  label: string
  href: string
  id: string
}

// ─── Owner / Portfolio ────────────────────────────────────────────────────────
export interface PortfolioOwner {
  name: string
  title: string
  email: string
  linkedin: string
  github: string
  location: string
  summary: string
  languages: string[]
}

// ─── Experience ───────────────────────────────────────────────────────────────
export interface ExperienceEntry {
  id: string
  role: string
  company: string
  type: string          // Full-time | Part-time | Freelance
  period: string
  startDate: string
  endDate: string | null
  description: string[]
  tech: string[]
}

// ─── Projects ─────────────────────────────────────────────────────────────────
export interface Project {
  id: string
  name: string
  date: string
  description: string
  teamSize: number
  tech: string[]
  github: string | null
  highlights?: string[]
  featured?: boolean
}

// ─── Skills ───────────────────────────────────────────────────────────────────
export interface SkillCategory {
  id: string
  label: string
  icon: string
  skills: Skill[]
}

export interface Skill {
  name: string
  level: number   // 1-5
  icon?: string
}

// ─── Education ────────────────────────────────────────────────────────────────
export interface EducationEntry {
  id: string
  degree: string
  institution: string
  period: string
  description: string
  highlights?: string[]
}

export interface Certification {
  id: string
  title: string
  issuer: string
  date: string
  credentialUrl?: string
}

// ─── Stats ────────────────────────────────────────────────────────────────────
export interface Stat {
  value: string
  label: string
  icon: string
}

// ─── Toast ────────────────────────────────────────────────────────────────────
export type ToastType = 'success' | 'error' | 'info'

export interface Toast {
  id: string
  type: ToastType
  message: string
}

// ─── Games ────────────────────────────────────────────────────────────────────
export interface GameMeta {
  id: string
  title: string
  description: string
  icon: string
  color: string
}

// ─── Contact Form ─────────────────────────────────────────────────────────────
export interface ContactFormData {
  name: string
  email: string
  subject: string
  message: string
}
