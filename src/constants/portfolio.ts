import type {
  PortfolioOwner,
  NavLink,
  ExperienceEntry,
  Project,
  SkillCategory,
  EducationEntry,
  Certification,
  Stat,
  GameMeta,
} from '@/types'

// ─── Owner ────────────────────────────────────────────────────────────────────
export const OWNER: PortfolioOwner = {
  name:     'Ravan Guliyev',
  title:    'Backend-Oriented Full Stack Developer',
  email:    'guliyeffravan@gmail.com',
  linkedin: 'https://www.linkedin.com/in/ravan-guliyev-72535735b/',
  github:   'https://github.com/RavanGuliyeff',
  location: 'Baku, Azerbaijan',
  summary:
    'Software developer with a journey from Python and frontend to C++ and now C#/.NET Core backend. Passionate about scalable architecture, mentoring junior developers, and competitive programming.',
  languages: ['Azerbaijani (Native)', 'Turkish (Fluent)', 'English (Intermediate)'],
}

// ─── Navigation ───────────────────────────────────────────────────────────────
export const NAV_LINKS: NavLink[] = [
  { label: 'About',      href: '#about',      id: 'about'      },
  { label: 'Experience', href: '#experience', id: 'experience' },
  { label: 'Projects',   href: '#projects',   id: 'projects'   },
  { label: 'Skills',     href: '#skills',     id: 'skills'     },
  { label: 'Education',  href: '#education',  id: 'education'  },
  { label: 'Games',      href: '#games',      id: 'games'      },
  { label: 'Contact',    href: '#contact',    id: 'contact'    },
]

// ─── Experience ───────────────────────────────────────────────────────────────
export const EXPERIENCE: ExperienceEntry[] = [
  {
    id:          'mentor',
    role:        'Software Development Mentor',
    company:     'Code Academy',
    type:        'Part-time',
    period:      'Jun 2025 – Present',
    startDate:   '2025-06',
    endDate:     null,
    description: [
      'Mentored 20+ interns through real-world backend projects, providing code reviews and architectural guidance.',
      'Improved average intern code quality by ~25% through structured feedback sessions and pair programming.',
      'Reduced repeated errors by ~30% by developing a personalised issue-tracking system for each mentee.',
      'Conducted weekly knowledge-sharing sessions on Clean Architecture and SOLID principles.',
    ],
    tech: ['C#', '.NET Core', 'ASP.NET', 'Clean Architecture', 'SOLID', 'Code Review'],
  },
  {
    id:          'instructor',
    role:        'Software Development Instructor',
    company:     'Code Academy',
    type:        'Part-time',
    period:      'Oct 2025 – Present',
    startDate:   '2025-10',
    endDate:     null,
    description: [
      'Train 15+ students in backend development fundamentals with hands-on, project-based curriculum.',
      'Designed 10+ real-world assignments covering REST APIs, database design, and authentication flows.',
      'Improved learning efficiency by ~25% by introducing progressive difficulty and peer-review exercises.',
      'Developed course materials bridging theory and industry practice.',
    ],
    tech: ['C#', 'ASP.NET Core', 'SQL', 'REST API', 'Entity Framework', 'Curriculum Design'],
  },
  {
    id:          'freelance',
    role:        'Backend Developer',
    company:     'Freelance',
    type:        'Freelance',
    period:      'Oct 2024 – Present',
    startDate:   '2024-10',
    endDate:     null,
    description: [
      'Delivered custom backend solutions for clients across multiple industries.',
      'Achieved ~20% performance improvements through strategic query optimisation and caching layers.',
      'Built scalable, reusable component libraries that reduced time-to-deploy on subsequent projects.',
      'Implemented secure authentication flows and third-party API integrations.',
    ],
    tech: ['C#', 'ASP.NET Core', 'PostgreSQL', 'MSSQL', 'Redis', 'Docker', 'EF Core', 'Dapper'],
  },
]

// ─── Projects ─────────────────────────────────────────────────────────────────
export const PROJECTS: Project[] = [
  {
    id:          'englishwithmovies',
    name:        'EnglishWithMovies',
    date:        '2025',
    description:
      'A gamified language-learning platform that builds vocabulary from real movie scripts. Features daily tasks, leaderboard competitions, and an achievement system to keep learners engaged.',
    teamSize:    3,
    tech:        ['C#', 'ASP.NET', 'MSSQL', 'EF Core', 'SignalR'],
    github:      null,
    highlights:  [
      'Real-time vocabulary challenges powered by SignalR',
      'Achievement & competition system to drive engagement',
      'Movie-script corpus parsed and indexed for contextual learning',
    ],
    featured: true,
  },
  {
    id:          'otaqaz',
    name:        'OtaqAz',
    date:        '2024',
    description:
      'A real estate listings platform optimised with GraphQL for highly efficient, flexible filtering — allowing users to query exactly the fields they need.',
    teamSize:    3,
    tech:        ['C#', 'ASP.NET Core', 'PostgreSQL', 'GraphQL', 'Dapper'],
    github:      null,
    highlights:  [
      'GraphQL API replaced REST to reduce over-fetching by ~60%',
      'Dapper used for high-performance raw SQL queries on complex filters',
      'Full-text search over listing descriptions',
    ],
    featured: true,
  },
  {
    id:          'smartlogistics',
    name:        'SmartLogistics',
    date:        '2025 — In Development',
    description:
      'Backend for a logistics startup built with scalable microservice-oriented architecture. Real-time tracking via WebSockets and full-text search powered by Elasticsearch.',
    teamSize:    7,
    tech:        ['C#', 'ASP.NET', 'WebSocket', 'SQL', 'Elasticsearch', 'Microservices'],
    github:      null,
    highlights:  [
      'Microservice architecture for independently deployable domains',
      'Elasticsearch for intelligent cargo and route search',
      'WebSocket-based real-time fleet tracking',
    ],
    featured: true,
  },
]

// ─── Skills ───────────────────────────────────────────────────────────────────
export const SKILL_CATEGORIES: SkillCategory[] = [
  {
    id:    'languages',
    label: 'Languages & Frameworks',
    icon:  '⚡',
    skills: [
      { name: 'C#',               level: 5 },
      { name: '.NET Core',         level: 5 },
      { name: 'ASP.NET Web API',   level: 5 },
      { name: 'ASP.NET MVC',       level: 4 },
      { name: 'GraphQL',           level: 4 },
      { name: 'JavaScript',        level: 3 },
      { name: 'HTML',              level: 4 },
      { name: 'CSS',               level: 3 },
    ],
  },
  {
    id:    'databases',
    label: 'Databases',
    icon:  '🗄️',
    skills: [
      { name: 'MS SQL Server', level: 5 },
      { name: 'PostgreSQL',    level: 4 },
      { name: 'MongoDB',       level: 3 },
    ],
  },
  {
    id:    'orm',
    label: 'ORM & Data Access',
    icon:  '🔗',
    skills: [
      { name: 'EF Core', level: 5 },
      { name: 'Dapper',  level: 4 },
      { name: 'ADO.NET', level: 4 },
    ],
  },
  {
    id:    'architecture',
    label: 'Architecture & Design',
    icon:  '🏛️',
    skills: [
      { name: 'Clean Architecture',   level: 5 },
      { name: 'Onion Architecture',   level: 5 },
      { name: 'Microservices',        level: 4 },
      { name: 'CQRS',                 level: 4 },
      { name: 'Repository Pattern',   level: 5 },
      { name: 'Unit of Work',         level: 4 },
      { name: 'Dependency Injection', level: 5 },
    ],
  },
  {
    id:    'devops',
    label: 'DevOps & Tools',
    icon:  '🛠️',
    skills: [
      { name: 'Docker',       level: 4 },
      { name: 'Jenkins',      level: 3 },
      { name: 'Redis',        level: 4 },
      { name: 'Git',          level: 5 },
      { name: 'GitHub',       level: 5 },
      { name: 'CI/CD',        level: 4 },
      { name: 'Unit Testing', level: 4 },
    ],
  },
]

// All skill names flattened (used for 3D tag cloud)
export const ALL_SKILLS: string[] = SKILL_CATEGORIES.flatMap(c => c.skills.map(s => s.name))

// ─── Education ────────────────────────────────────────────────────────────────
export const EDUCATION: EducationEntry[] = [
  {
    id:          'atu',
    degree:      'B.Sc. Computer Science',
    institution: 'Azerbaijan Technical University',
    period:      '2022 – 2026',
    description: 'Focus on algorithms, data structures, software engineering, and computer systems.',
    highlights:  ['ICPC Participant', 'Algorithms & Competitive Programming', 'Software Engineering Projects'],
  },
  {
    id:          'codeacademy',
    degree:      'Backend-Focused Full-Stack Certificate',
    institution: 'Code Academy',
    period:      'Sep 2024 – Feb 2025',
    description: 'Intensive program covering C# backend, .NET ecosystem, databases, and frontend essentials.',
    highlights:  ['High Honour Graduate', 'C# & .NET Core', 'REST API Design', 'Database Design'],
  },
  {
    id:          'peerstack',
    degree:      'Backend Development Certificate',
    institution: 'Peerstack Academy',
    period:      'Oct 2025 – Feb 2026',
    description: 'Advanced backend engineering: microservices, containerisation, and cloud-native patterns.',
    highlights:  ['Microservices', 'Docker & CI/CD', 'Advanced .NET Patterns'],
  },
]

export const CERTIFICATIONS: Certification[] = [
  {
    id:      'udemy-solid',
    title:   'ASP.NET Core – SOLID and Clean Architecture',
    issuer:  'Udemy',
    date:    'May 2025',
  },
  {
    id:      'codeacademy-cert',
    title:   'Software Development',
    issuer:  'Code Academy',
    date:    'Apr 2025',
  },
  {
    id:      'peerstack-cert',
    title:   'Backend Development',
    issuer:  'Peerstack Academy',
    date:    'Feb 2026',
  },
  {
    id:      'icpc-2023',
    title:   'The 2023 ICPC Azerbaijan Qualification',
    issuer:  'ICPC',
    date:    '2023',
  },
]

// ─── Stats ────────────────────────────────────────────────────────────────────
export const STATS: Stat[] = [
  { value: '3+',  label: 'Years Coding',        icon: '💻' },
  { value: '20+', label: 'Developers Mentored',  icon: '🎓' },
  { value: '3',   label: 'Production Projects',  icon: '🚀' },
  { value: '🏆',  label: 'ICPC Participant',      icon: '⚔️' },
]

// ─── Games ────────────────────────────────────────────────────────────────────
export const GAMES: GameMeta[] = [
  {
    id:          'memory',
    title:       'Memory Cards',
    description: 'Match all pairs in the fewest moves. Test your recall.',
    icon:        '🃏',
    color:       '#7c3aed',
  },
  {
    id:          'dino',
    title:       'Dino Runner',
    description: 'Jump over obstacles. How far can you go?',
    icon:        '🦕',
    color:       '#059669',
  },
  {
    id:          'snake',
    title:       'Snake',
    description: 'Classic snake — grow without hitting yourself.',
    icon:        '🐍',
    color:       '#0891b2',
  },
  {
    id:          'tetris',
    title:       'Tetris',
    description: 'Clear lines. Race the clock. Old school perfection.',
    icon:        '🧱',
    color:       '#dc2626',
  },
  {
    id:          'flappy',
    title:       'Flappy Bird',
    description: 'Stay airborne. One tap at a time. Good luck with that.',
    icon:        '🐦',
    color:       '#f59e0b',
  },
  {
    id:          '2048',
    title:       '2048',
    description: 'Slide and merge tiles until you reach 2048.',
    icon:        '🔢',
    color:       '#a78bfa',
  },
  {
    id:          'breakout',
    title:       'Breakout',
    description: 'Break all bricks with the ball. Don\'t let it fall.',
    icon:        '🟦',
    color:       '#0ea5e9',
  },
  {
    id:          'minesweeper',
    title:       'Minesweeper',
    description: 'Find all mines without blowing up. Classic puzzle.',
    icon:        '💣',
    color:       '#6b7280',
  },
]
