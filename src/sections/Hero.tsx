import React, { Suspense, lazy } from 'react'
import { motion } from 'framer-motion'
import { ChevronDown, ArrowRight, Download } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Typewriter } from '@/components/shared/AnimatedText'
import { OWNER } from '@/constants/portfolio'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

const LaptopScene = lazy(() =>
  import('@/three/LaptopScene').then(m => ({ default: m.LaptopScene }))
)

const fadeUp = {
  hidden:  { opacity: 0, y: 32 },
  visible: (d: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.65, delay: d, ease: [0.4, 0, 0.2, 1] as const },
  }),
}

export const Hero: React.FC = () => {
  const reduced = usePrefersReducedMotion()

  return (
    <section
      id="hero"
      className="relative min-h-screen flex flex-col overflow-hidden noise-overlay"
      aria-label="Hero section"
    >
      {/* Background layers */}
      <div className="absolute inset-0 dark:bg-dark-bg bg-light-bg" />
      <div className="absolute inset-0 bg-gradient-radial from-accent-950/40 via-transparent to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t dark:from-dark-bg from-light-bg to-transparent z-10" />

      {/* Two-column layout */}
      <div className="relative z-10 flex-1 flex items-center section-container">
        <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-6 items-center min-h-screen pt-24 pb-16 lg:pt-0 lg:pb-0">

          {/* Left — content */}
          <div className="flex flex-col items-start">
            {/* Status badge */}
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-mono
                dark:bg-dark-card bg-light-card border dark:border-dark-border border-light-border
                dark:text-slate-400 text-slate-600 mb-8"
              custom={0}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Available for projects &amp; opportunities
            </motion.div>

            {/* Name */}
            <motion.h1
              className="font-heading font-black text-5xl sm:text-6xl md:text-7xl leading-none mb-4 tracking-tight"
              custom={0.15}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
            >
              <span className="dark:text-white text-slate-900">{OWNER.name.split(' ')[0]}{' '}</span>
              <span className="gradient-text">{OWNER.name.split(' ')[1]}</span>
            </motion.h1>

            {/* Typewriter title */}
            <motion.div
              className="font-heading text-xl sm:text-2xl md:text-3xl mb-6 dark:text-slate-300 text-slate-700 min-h-[2.5rem]"
              custom={0.3}
              variants={reduced ? {} : fadeUp}
              initial="hidden"
              animate="visible"
            >
              <Typewriter
                words={[
                  'Backend Developer',
                  '.NET / C# Specialist',
                  'Clean Architecture Advocate',
                  'Competitive Programmer',
                  'Mentor & Instructor',
                ]}
              />
            </motion.div>

            {/* Tagline */}
            <motion.p
              className="text-base sm:text-lg dark:text-slate-400 text-slate-600 max-w-lg mb-10 leading-relaxed"
              custom={0.45}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
            >
              {OWNER.summary}
            </motion.p>

            {/* CTAs */}
            <motion.div
              className="flex flex-wrap items-center gap-4 mb-12"
              custom={0.6}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
            >
              <Button
                variant="primary"
                size="lg"
                icon={<ArrowRight size={18} />}
                onClick={() => document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' })}
                aria-label="View my work"
              >
                View My Work
              </Button>
              <Button
                as="a"
                href="/cv.pdf"
                download="Ravan-Guliyev_CV.pdf"
                variant="outline"
                size="lg"
                icon={<Download size={18} />}
                iconPosition="left"
                aria-label="Download CV"
              >
                Download CV
              </Button>
            </motion.div>

            {/* Stats row */}
            <motion.div
              className="flex flex-wrap gap-8"
              custom={0.75}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
            >
              {[
                { val: '3+',  lbl: 'Years Coding'       },
                { val: '20+', lbl: 'Devs Mentored'      },
                { val: '3',   lbl: 'Production Projects' },
                { val: '🏆',  lbl: 'ICPC Qualifier'      },
              ].map(s => (
                <div key={s.lbl} className="text-center">
                  <div className="font-heading font-bold text-2xl gradient-text">{s.val}</div>
                  <div className="text-xs dark:text-slate-500 text-slate-500 mt-0.5">{s.lbl}</div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right — 3D laptop */}
          <motion.div
            className="hidden lg:flex items-center justify-center h-[520px] w-full relative"
            initial={reduced ? {} : { opacity: 0, scale: 0.92 }}
            animate={reduced ? {} : { opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.4, ease: 'easeOut' }}
          >
            {/* Ambient glow behind laptop */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-72 h-72 rounded-full bg-accent-600/10 blur-[80px]" />
            </div>
            <Suspense fallback={
              <div className="flex flex-col items-center gap-3 dark:text-slate-600 text-slate-400">
                <div className="w-14 h-14 border-2 border-accent-500/30 border-t-accent-500 rounded-full animate-spin" />
                <span className="text-xs font-mono">loading 3D…</span>
              </div>
            }>
              <LaptopScene className="absolute inset-0" />
            </Suspense>
          </motion.div>

        </div>
      </div>

      {/* Scroll indicator */}
      <motion.button
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1
          dark:text-slate-500 text-slate-400 hover:text-accent-400 transition-colors"
        onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}
        animate={reduced ? {} : { y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        aria-label="Scroll to next section"
      >
        <span className="text-xs font-mono tracking-wider">scroll</span>
        <ChevronDown size={20} />
      </motion.button>
    </section>
  )
}
