import React, { Suspense, lazy, createContext, useContext } from 'react'
import { useTheme } from '@/hooks/useTheme'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { ScrollProgress } from '@/components/layout/ScrollProgress'
import { CursorEffect } from '@/three/CursorEffect'
import { Hero } from '@/sections/Hero'

// Lazy-load below-the-fold sections
const About      = lazy(() => import('@/sections/About').then(m =>      ({ default: m.About      })))
const Experience = lazy(() => import('@/sections/Experience').then(m => ({ default: m.Experience })))
const Projects   = lazy(() => import('@/sections/Projects').then(m =>   ({ default: m.Projects   })))
const Skills     = lazy(() => import('@/sections/Skills').then(m =>     ({ default: m.Skills     })))
const Education  = lazy(() => import('@/sections/Education').then(m =>  ({ default: m.Education  })))
const Games      = lazy(() => import('@/sections/Games').then(m =>      ({ default: m.Games      })))
const Contact    = lazy(() => import('@/sections/Contact').then(m =>    ({ default: m.Contact    })))

// ─── Theme Context ─────────────────────────────────────────────────────────────
interface ThemeCtx {
  isDark: boolean
  toggle: () => void
}

export const ThemeContext = createContext<ThemeCtx>({ isDark: true, toggle: () => {} })

export const useThemeContext = () => useContext(ThemeContext)

const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isDark, toggle } = useTheme()

  return (
    <ThemeContext.Provider value={{ isDark, toggle }}>
      {children}
    </ThemeContext.Provider>
  )
}

// ─── Section loading fallback ─────────────────────────────────────────────────
const SectionFallback: React.FC = () => (
  <div className="flex items-center justify-center py-24">
    <div className="w-8 h-8 rounded-full border-2 border-accent-500 border-t-transparent animate-spin" role="status" aria-label="Loading section" />
  </div>
)

// ─── App ───────────────────────────────────────────────────────────────────────
const App: React.FC = () => (
  <ThemeProvider>
    <ScrollProgress />
    <CursorEffect />
    <Navbar />

    <main id="main-content">
      {/* Hero renders eagerly (above the fold) */}
      <Hero />

      <Suspense fallback={<SectionFallback />}>
        <About />
      </Suspense>

      <Suspense fallback={<SectionFallback />}>
        <Experience />
      </Suspense>

      <Suspense fallback={<SectionFallback />}>
        <Projects />
      </Suspense>

      <Suspense fallback={<SectionFallback />}>
        <Skills />
      </Suspense>

      <Suspense fallback={<SectionFallback />}>
        <Education />
      </Suspense>

      <Suspense fallback={<SectionFallback />}>
        <Games />
      </Suspense>

      <Suspense fallback={<SectionFallback />}>
        <Contact />
      </Suspense>
    </main>

    <Footer />
  </ThemeProvider>
)

export default App
