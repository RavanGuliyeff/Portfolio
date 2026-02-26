import React from 'react'
import { motion } from 'framer-motion'
import { GraduationCap, Award, Calendar } from 'lucide-react'
import { SectionHeader } from '@/components/shared/SectionHeader'
import { EDUCATION, CERTIFICATIONS } from '@/constants/portfolio'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

const cardVariants = {
  hidden:  { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.1 },
  }),
}

export const Education: React.FC = () => {
  const reduced = usePrefersReducedMotion()

  return (
    <section
      id="education"
      className="py-24 dark:bg-dark-surface bg-light-surface"
      aria-label="Education and certifications section"
    >
      <div className="section-container">
        <SectionHeader
          label="Background"
          title="Education & "
          highlight="Certifications"
          subtitle="Formal degree, immersive academies, and industry certifications — a well-rounded foundation."
        />

        <div className="grid lg:grid-cols-2 gap-10 mt-4">
          {/* Education column */}
          <div>
            <div className="flex items-center gap-2 mb-6">
              <GraduationCap className="text-accent-400" size={20} />
              <h3 className="font-heading font-semibold text-lg dark:text-white text-slate-800">
                Education
              </h3>
            </div>
            <div className="space-y-4">
              {EDUCATION.map((edu, i) => (
                <motion.div
                  key={edu.id}
                  className="dark:bg-dark-card bg-light-card border dark:border-dark-border border-light-border rounded-2xl p-5 hover-glow"
                  custom={i}
                  variants={reduced ? {} : cardVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <h4 className="font-heading font-semibold dark:text-white text-slate-900">
                        {edu.degree}
                      </h4>
                      <p className="text-accent-400 text-sm font-medium">{edu.institution}</p>
                    </div>
                    <span className="flex items-center gap-1 text-xs dark:text-slate-500 text-slate-500 shrink-0">
                      <Calendar size={11} />
                      {edu.period}
                    </span>
                  </div>
                  <p className="text-sm dark:text-slate-400 text-slate-600 mb-3">{edu.description}</p>
                  {edu.highlights && (
                    <div className="flex flex-wrap gap-1.5">
                      {edu.highlights.map(h => (
                        <span key={h} className="tech-badge">{h}</span>
                      ))}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Certifications column */}
          <div>
            <div className="flex items-center gap-2 mb-6">
              <Award className="text-accent-400" size={20} />
              <h3 className="font-heading font-semibold text-lg dark:text-white text-slate-800">
                Certifications
              </h3>
            </div>
            <div className="space-y-3">
              {CERTIFICATIONS.map((cert, i) => (
                <motion.div
                  key={cert.id}
                  className="dark:bg-dark-card bg-light-card border dark:border-dark-border border-light-border rounded-xl p-4 flex items-center gap-4 hover-glow group"
                  custom={i}
                  variants={reduced ? {} : cardVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                >
                  <div className="w-10 h-10 rounded-xl bg-accent-500/15 border border-accent-500/25 flex items-center justify-center shrink-0">
                    <Award size={18} className="text-accent-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-sm dark:text-white text-slate-900 truncate group-hover:text-accent-400 transition-colors">
                      {cert.title}
                    </p>
                    <p className="text-xs dark:text-slate-500 text-slate-500">
                      {cert.issuer} · {cert.date}
                    </p>
                  </div>
                  {cert.credentialUrl && (
                    <a
                      href={cert.credentialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-auto shrink-0 text-xs text-accent-400 hover:underline"
                      aria-label={`View ${cert.title} credential`}
                    >
                      View
                    </a>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
