import React, { Suspense, lazy } from 'react'
import { motion } from 'framer-motion'
import { SectionHeader } from '@/components/shared/SectionHeader'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'
import { SKILL_CATEGORIES, ALL_SKILLS } from '@/constants/portfolio'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

const SkillsCloud = lazy(() =>
  import('@/three/SkillsCloud').then(m => ({ default: m.SkillsCloud }))
)

const levelLabels = ['', 'Beginner', 'Familiar', 'Proficient', 'Advanced', 'Expert']

export const Skills: React.FC = () => {
  const reduced = usePrefersReducedMotion()

  return (
    <section
      id="skills"
      className="py-24 dark:bg-dark-bg bg-light-bg"
      aria-label="Skills section"
    >
      <div className="section-container">
        <SectionHeader
          label="Expertise"
          title="Skills & "
          highlight="Technologies"
          subtitle="From C#/.NET backends to distributed systems — here's what I work with daily."
        />

        {/* 3D Skills Cloud */}
        <div className="mb-16 dark:bg-dark-card bg-light-card border dark:border-dark-border border-light-border rounded-2xl overflow-hidden">
          <ErrorBoundary
            fallback={
              <div className="flex flex-wrap gap-2 justify-center p-6">
                {ALL_SKILLS.map(s => (
                  <span key={s} className="tech-badge">{s}</span>
                ))}
              </div>
            }
          >
            <Suspense
              fallback={
                <div className="h-[380px] flex items-center justify-center dark:text-slate-500 text-slate-500 text-sm">
                  Loading 3D cloud…
                </div>
              }
            >
              <SkillsCloud />
            </Suspense>
          </ErrorBoundary>
        </div>

        {/* Categorised grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {SKILL_CATEGORIES.map((cat, ci) => (
            <motion.div
              key={cat.id}
              initial={reduced ? {} : { opacity: 0, y: 24 }}
              whileInView={reduced ? {} : { opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: ci * 0.08 }}
              className="dark:bg-dark-card bg-light-card border dark:border-dark-border border-light-border rounded-2xl p-5 hover-glow"
            >
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl" aria-hidden="true">{cat.icon}</span>
                <h3 className="font-heading font-semibold text-sm dark:text-white text-slate-800">
                  {cat.label}
                </h3>
              </div>

              <div className="space-y-3">
                {cat.skills.map(skill => (
                  <div key={skill.name}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-mono dark:text-slate-300 text-slate-700">{skill.name}</span>
                      <span className="text-xs dark:text-slate-500 text-slate-500">{levelLabels[skill.level]}</span>
                    </div>
                    <div
                      className="h-1.5 w-full dark:bg-dark-border bg-light-border rounded-full overflow-hidden"
                      role="progressbar"
                      aria-valuenow={skill.level}
                      aria-valuemin={0}
                      aria-valuemax={5}
                      aria-label={`${skill.name}: ${levelLabels[skill.level]}`}
                    >
                      <motion.div
                        className="h-full bg-gradient-to-r from-accent-600 to-accent-400 rounded-full"
                        initial={{ width: 0 }}
                        whileInView={{ width: `${(skill.level / 5) * 100}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: ci * 0.05 + 0.2, ease: 'easeOut' }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
