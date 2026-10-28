// Language-independent data. All visible text lives in src/i18n/<lang>.ts,
// matched by the `id` fields below.
import type { GameMeta } from '@/types'

export const OWNER = {
  name: 'Ravan Guliyev',
  email: 'hi@ravanguliyev.dev',
  github: 'https://github.com/RavanGuliyeff',
  linkedin: 'https://www.linkedin.com/in/ravan-guliyev-72535735b/',
  resumeUrl: '/cv.pdf',
  city: 'Baku',
}

export const NAV_IDS = ['about', 'experience', 'projects', 'skills', 'education', 'arcade', 'contact'] as const

/** Dates are `YYYY-MM`; `end: null` means ongoing. */
export const EXPERIENCE = [
  {
    id: 'codeacademy-instructor',
    company: 'Code Academy',
    start: '2025-10',
    end: '2026-07',
    tech: ['C#', '.NET', 'ASP.NET Core', 'EF Core', 'SQL Server', 'JavaScript'],
  },
  {
    id: 'otaqaz',
    company: 'OtaqAz',
    start: '2025-07',
    end: '2026-01',
    tech: ['ASP.NET Core', 'GraphQL', 'PostgreSQL', 'EF Core', 'Dapper', 'Hangfire', 'AWS S3', 'Docker'],
  },
  {
    id: 'codeacademy-mentor',
    company: 'Code Academy',
    start: '2025-06',
    end: '2026-01',
    tech: ['C#', 'ASP.NET Core', 'EF Core', 'SQL Server'],
  },
  {
    id: 'freelance',
    company: 'Freelance',
    start: '2024-10',
    end: null,
    tech: ['C#', 'ASP.NET Core', 'PostgreSQL', 'SQL Server', 'EF Core', 'Dapper', 'Redis', 'Docker'],
  },
] as const

export const PROJECTS: { id: string; name: string; start: string; end?: string; tech: string[]; links?: { label: string; url: string }[] }[] = [
  {
    id: 'otaqaz',
    name: 'OtaqAz',
    start: '2025-07',
    tech: ['ASP.NET Core', 'GraphQL', 'PostgreSQL', 'Dapper', 'Hangfire'],
  },
  {
    id: 'englishwithmovies',
    name: 'EnglishWithMovies',
    start: '2025-02',
    end: '2025-03',
    tech: ['ASP.NET Core', 'EF Core', 'SQL Server', 'SignalR', 'Stripe', 'Azure Blob'],
  },
  {
    id: 'smartlogistics',
    name: 'SmartLogistics',
    start: '2025-08',
    end: '2025-10',
    tech: ['ASP.NET Core', 'EF Core', 'SQL Server', 'Elasticsearch', 'SignalR', 'JWT'],
  },
]

export const SKILL_GROUPS = [
  {
    id: 'backend',
    skills: ['C#', '.NET', 'ASP.NET Core', 'ASP.NET Web API', 'ASP.NET MVC', 'GraphQL', 'JavaScript', 'HTML', 'CSS'],
  },
  { id: 'data', skills: ['SQL Server', 'PostgreSQL', 'Entity Framework Core', 'Dapper', 'ADO.NET', 'Redis'] },
  {
    id: 'architecture',
    skills: ['Clean Architecture', 'Onion Architecture', 'Microservices', 'CQRS', 'Repository Pattern', 'Unit of Work', 'Dependency Injection'],
  },
  {
    id: 'integrations',
    skills: ['Hangfire', 'SignalR', 'RabbitMQ', 'MemoryCache', 'AWS S3', 'Azure Blob Storage', 'Stripe', 'Elasticsearch', 'JWT'],
  },
  { id: 'tooling', skills: ['Git', 'GitHub', 'Docker', 'Jenkins', 'CI/CD', 'Unit Testing'] },
  { id: 'other', skills: ['Python', 'C++', 'Algorithms'] },
]

export const EDUCATION = [
  { id: 'msc', institution: 'Azerbaijan Technical University', start: '2026-09', end: '2028-07', inProgress: true },
  { id: 'bsc', institution: 'Azerbaijan Technical University', start: '2022-09', end: '2026-07', inProgress: false },
]

export const CERTIFICATIONS = [
  { id: 'peerstack', title: 'Backend Development', issuer: 'Peerstack Academy', date: '2026-02' },
  { id: 'udemy', title: 'ASP.NET Core: SOLID and Clean Architecture', issuer: 'Udemy', date: '2025-05' },
  {
    id: 'codeacademy',
    title: 'Software Development (Backend-focused Full-Stack)',
    issuer: 'Code Academy',
    date: '2025-04',
  },
  { id: 'icpc', title: 'ICPC Azerbaijan Qualification 2023', issuer: 'International Collegiate Programming Contest', date: '2023-10' },
]

export const GAMES: GameMeta[] = [
  { id: 'typer', accent: '#7c6cff', score: { key: 'hs-typer-score', label: 'best', order: 'higher', unit: 'pts' } },
  { id: 'snake', accent: '#22c55e', score: { key: 'hs-snake', label: 'best', order: 'higher' } },
  { id: 'tetris', accent: '#06b6d4', score: { key: 'hs-tetris', label: 'best', order: 'higher' } },
  { id: 'dino', accent: '#10b981', score: { key: 'hs-dino', label: 'best', order: 'higher' } },
  { id: '2048', accent: '#f59e0b', score: { key: 'hs-2048', label: 'best', order: 'higher' } },
  { id: 'breakout', accent: '#3b82f6', score: { key: 'hs-breakout', label: 'best', order: 'higher' } },
  { id: 'flappy', accent: '#eab308', score: { key: 'hs-flappy', label: 'best', order: 'higher' } },
  { id: 'memory', accent: '#a855f7', score: { key: 'hs-memory', label: 'fewestMoves', order: 'lower' } },
  { id: 'minesweeper', accent: '#64748b', score: { key: 'hs-minesweeper', label: 'bestTime', order: 'lower', unit: 's' } },
]
