# Ravan Guliyev — Personal Portfolio

A visually stunning, production-quality portfolio website for a backend-oriented full stack developer. Built with React 18, TypeScript, Vite, Tailwind CSS, Three.js, and Framer Motion.

## 🚀 Live Demo

> Deploy to Vercel / Netlify by connecting this repository.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + TypeScript (strict mode) |
| Build Tool | Vite 5 |
| Styling | Tailwind CSS with custom dark/light theme |
| 3D / WebGL | Three.js via `@react-three/fiber` + `@react-three/drei` |
| Animations | Framer Motion |
| Contact Form | EmailJS (`@emailjs/browser`) |
| Icons | Lucide React + React Icons |
| Linting | ESLint + Prettier |

---

## 📁 Project Structure

```
src/
├── constants/
│   └── portfolio.ts          # ALL personal data lives here
├── types/
│   └── index.ts              # All TypeScript interfaces
├── hooks/
│   ├── useTheme.ts
│   ├── useScrollProgress.ts
│   └── usePrefersReducedMotion.ts
├── three/
│   ├── ParticleField.tsx     # Hero background (2000 mouse-reactive particles)
│   ├── SkillsCloud.tsx       # 3D orbiting skill tag cloud
│   └── CursorEffect.tsx      # Custom cursor trail (canvas-based)
├── components/
│   ├── ui/                   # Button, Badge, Card, Modal, Tooltip
│   ├── layout/               # Navbar, Footer, ScrollProgress
│   └── shared/               # SectionHeader, AnimatedText (Typewriter), TiltCard
├── sections/
│   ├── Hero.tsx
│   ├── About.tsx
│   ├── Experience.tsx
│   ├── Projects.tsx
│   ├── Skills.tsx
│   ├── Education.tsx
│   ├── Games.tsx
│   └── Contact.tsx
├── games/
│   ├── GameCard.tsx          # Modal launcher wrapper
│   ├── MemoryCard/           # 4×4 flip-card memory game
│   ├── DinoRunner/           # Side-scrolling dino jump game
│   ├── Snake/                # Classic snake (WASD / arrow keys)
│   └── Tetris/               # Full Tetris with scoring & levels
├── styles/
│   └── globals.css
├── 404.tsx                   # Custom 404 page with Three.js scene
└── App.tsx                   # Root — ThemeProvider + all sections
```

---

## ⚙️ Setup

### Prerequisites

- Node.js ≥ 18
- npm ≥ 9

### Install & Run

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview
```

### Linting & Formatting

```bash
npm run lint
npm run format
```

---

## 📧 EmailJS Configuration

To enable the contact form, replace the placeholder IDs in [src/sections/Contact.tsx](src/sections/Contact.tsx):

```ts
const EMAILJS_SERVICE_ID  = 'YOUR_SERVICE_ID'   // service_xxxxxxx
const EMAILJS_TEMPLATE_ID = 'YOUR_TEMPLATE_ID'  // template_xxxxxxx
const EMAILJS_PUBLIC_KEY  = 'YOUR_PUBLIC_KEY'   // from Account → API Keys
```

1. Sign up at [emailjs.com](https://www.emailjs.com/)
2. Create a service (Gmail, Outlook, etc.)
3. Create a template with variables: `from_name`, `from_email`, `subject`, `message`
4. Paste your credentials above

---

## 🎮 Games

All 4 mini-games are fully playable and store high scores in `localStorage`:

| Game | Controls | High Score Key |
|---|---|---|
| Memory Cards | Click to flip | `hs-memory` (fewest moves) |
| Dino Runner | Space / Click / Tap | `hs-dino` |
| Snake | WASD / Arrow keys, R to restart | `hs-snake` |
| Tetris | ← → move, ↑ rotate, ↓ soft drop, Space hard drop, R restart | `hs-tetris` |

---

## 🎨 Design System

- **Default theme:** Dark mode (toggleable, persisted in `localStorage`)
- **Accent colour:** Electric Violet `#7c3aed`
- **Backgrounds:** Deep navy `#0a0a0f` / `#0f0f1a`
- **Headings:** Space Grotesk
- **Body:** Inter
- **Code:** JetBrains Mono
- All animations respect `prefers-reduced-motion`

---

## 🚢 Deployment

### Vercel (recommended)

```bash
npm i -g vercel
vercel --prod
```

### Netlify

```bash
npm run build
# Drag & drop the dist/ folder to Netlify, or connect via Git
```

---

## 📄 License

MIT © 2026 Ravan Guliyev
