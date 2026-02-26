import React from 'react'
import { motion } from 'framer-motion'
import { Briefcase, Calendar, MapPin } from 'lucide-react'
import { SectionHeader } from '@/components/shared/SectionHeader'
import { Badge } from '@/components/ui/Badge'
import { EXPERIENCE } from '@/constants/portfolio'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

const cardVariants = {
  hidden:  { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay: i * 0.12, ease: 'easeOut' },
  }),
}

export const Experience: React.FC = () => {
  const reduced = usePrefersReducedMotion()

  return (
    <section
      id="experience"
      className="py-24 dark:bg-dark-bg bg-light-bg"
      aria-label="Experience section"
    >
      <div className="section-container">
        <SectionHeader
          label="Career Path"
          title="Work "
          highlight="Experience"
          subtitle="Real-world projects, mentorship, and freelance engineering — here's where I've been."
        />

        <div className="relative max-w-4xl mx-auto mt-4">
          {/* Timeline line */}
          <div className="hidden md:block absolute left-1/2 -translate-x-px top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-accent-600/50 to-transparent" aria-hidden="true" />

          {EXPERIENCE.map((exp, i) => {
            const isLeft = i % 2 === 0

            return (
              <motion.div
                key={exp.id}
                className={`relative flex md:items-start gap-6 mb-12 ${isLeft ? 'md:flex-row' : 'md:flex-row-reverse'}`}
                custom={i}
                variants={reduced ? {} : cardVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-60px' }}
              >
                {/* Card (takes ~45% on desktop) */}
                <div className={`flex-1 md:max-w-[45%] ${isLeft ? '' : 'md:text-right'}`}>
                  <div className="dark:bg-dark-card bg-light-card border dark:border-dark-border border-light-border rounded-2xl p-6 shadow-card-dark hover-glow transition-all duration-300">
                    {/* Header */}
                    <div className={`flex items-start justify-between gap-3 mb-3 ${isLeft ? '' : 'flex-row-reverse'}`}>
                      <div>
                        <h3 className="font-heading font-semibold text-lg dark:text-white text-slate-900">
                          {exp.role}
                        </h3>
                        <p className="text-accent-400 font-medium text-sm">{exp.company}</p>
                      </div>
                      <span className="shrink-0 px-2.5 py-1 rounded-full text-xs font-mono dark:bg-dark-border bg-light-border dark:text-slate-400 text-slate-500">
                        {exp.type}
                      </span>
                    </div>

                    {/* Meta */}
                    <div className={`flex flex-wrap gap-3 text-xs dark:text-slate-500 text-slate-500 mb-4 ${isLeft ? '' : 'justify-end'}`}>
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        {exp.period}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin size={12} />
                        Baku, Azerbaijan
                      </span>
                    </div>

                    {/* Bullets */}
                    <ul className={`space-y-1.5 mb-4 ${isLeft ? '' : 'text-right'}`}>
                      {exp.description.map((point, j) => (
                        <li key={j} className="text-sm dark:text-slate-400 text-slate-600 flex gap-2 items-start">
                          <span className="text-accent-500 mt-1 shrink-0">▸</span>
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>

                    {/* Tech badges */}
                    <div className={`flex flex-wrap gap-1.5 ${isLeft ? '' : 'justify-end'}`}>
                      {exp.tech.map(t => (
                        <Badge key={t} variant="accent">{t}</Badge>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Centre dot */}
                <div className="hidden md:flex flex-col items-center justify-start pt-6 shrink-0">
                  <motion.div
                    className="w-4 h-4 rounded-full bg-accent-500 border-4 dark:border-dark-bg border-light-bg shadow-violet-glow z-10"
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.12 + 0.3, type: 'spring', stiffness: 400 }}
                  />
                </div>

                {/* Spacer for the other side */}
                <div className="hidden md:block flex-1 md:max-w-[45%]" />
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
