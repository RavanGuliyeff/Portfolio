import { MotionConfig } from 'framer-motion'
import { Analytics } from '@vercel/analytics/react'
import { ThemeProvider } from '@/theme/ThemeProvider'
import { I18nProvider, useI18n } from '@/i18n/I18nProvider'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { ScrollProgress } from '@/components/layout/ScrollProgress'
import { Hero } from '@/sections/Hero'
import { About } from '@/sections/About'
import { Experience } from '@/sections/Experience'
import { Projects } from '@/sections/Projects'
import { Skills } from '@/sections/Skills'
import { Education } from '@/sections/Education'
import { Arcade } from '@/sections/Arcade'
import { Contact } from '@/sections/Contact'

function Page() {
  const { t } = useI18n()
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-accent focus:px-4 focus:py-2 focus:text-accent-fg"
      >
        {t.nav.skip}
      </a>
      <ScrollProgress />
      <Navbar />
      <main id="main">
        <Hero />
        <About />
        <Experience />
        <Projects />
        <Skills />
        <Education />
        <Arcade />
        <Contact />
      </main>
      <Footer />
    </>
  )
}

// The page sections are small, so they ship in the main bundle.
// Only the heavy parts (3D scene, games, email SDK) are code-split.
export default function App() {
  return (
    <ThemeProvider>
      <I18nProvider>
        <MotionConfig reducedMotion="user">
          <Page />
        </MotionConfig>
      </I18nProvider>
      {/* Page-view stats; only active once Analytics is enabled in the Vercel dashboard. */}
      <Analytics />
    </ThemeProvider>
  )
}
