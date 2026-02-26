import React from 'react'
import { motion } from 'framer-motion'
import { Github, Users, Calendar, ExternalLink } from 'lucide-react'
import { SectionHeader } from '@/components/shared/SectionHeader'
import { Badge } from '@/components/ui/Badge'
import { TiltCard } from '@/components/shared/TiltCard'
import { PROJECTS } from '@/constants/portfolio'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

const projectColors: Record<string, string> = {
  englishwithmovies: 'from-violet-500/20 to-indigo-500/20',
  otaqaz:            'from-emerald-500/20 to-teal-500/20',
  smartlogistics:    'from-cyan-500/20 to-blue-500/20',
}

export const Projects: React.FC = () => {
  const reduced = usePrefersReducedMotion()

  return (
    <section
      id="projects"
      className="py-24 dark:bg-dark-surface bg-light-surface"
      aria-label="Projects section"
    >
      <div className="section-container">
        <SectionHeader
          label="What I've Built"
          title="Featured "
          highlight="Projects"
          subtitle="Production systems from real estate platforms to gamified learning apps — built with scalability in mind."
        />

        {/* Bento-style asymmetric grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {PROJECTS.map((project, i) => (
            <motion.div
              key={project.id}
              className={i === 0 ? 'md:col-span-2 xl:col-span-1' : ''}
              initial={reduced ? {} : { opacity: 0, y: 30 }}
              whileInView={reduced ? {} : { opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.55, delay: i * 0.1, ease: 'easeOut' }}
            >
              <TiltCard className="h-full">
                <div
                  className={`h-full dark:bg-dark-card bg-light-card border dark:border-dark-border border-light-border rounded-2xl overflow-hidden group hover-glow`}
                >
                  {/* Top gradient stripe */}
                  <div className={`h-1.5 w-full bg-gradient-to-r ${projectColors[project.id] ?? 'from-accent-600 to-accent-400'} opacity-80`} />

                  <div className="p-6 flex flex-col h-full">
                    {/* Title row */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <h3 className="font-heading font-bold text-xl dark:text-white text-slate-900 group-hover:text-accent-400 transition-colors">
                          {project.name}
                        </h3>
                        <div className="flex items-center gap-3 mt-1 text-xs dark:text-slate-500 text-slate-500">
                          <span className="flex items-center gap-1">
                            <Calendar size={11} />
                            {project.date}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users size={11} />
                            {project.teamSize} {project.teamSize === 1 ? 'person' : 'people'}
                          </span>
                        </div>
                      </div>
                      {project.github && (
                        <a
                          href={project.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-lg dark:text-slate-400 text-slate-500 hover:text-accent-400 hover:bg-accent-500/10 transition-colors shrink-0"
                          aria-label={`View ${project.name} on GitHub`}
                        >
                          <Github size={18} />
                        </a>
                      )}
                    </div>

                    {/* Description */}
                    <p className="text-sm dark:text-slate-400 text-slate-600 leading-relaxed mb-4">
                      {project.description}
                    </p>

                    {/* Highlights */}
                    {project.highlights && (
                      <ul className="space-y-1 mb-4">
                        {project.highlights.map((h, hi) => (
                          <li key={hi} className="text-xs dark:text-slate-500 text-slate-500 flex gap-1.5 items-start">
                            <span className="text-accent-500 shrink-0">→</span>
                            {h}
                          </li>
                        ))}
                      </ul>
                    )}

                    {/* Tech badges — push to bottom */}
                    <div className="mt-auto flex flex-wrap gap-1.5 pt-2">
                      {project.tech.map(t => (
                        <Badge key={t} variant="accent" size="sm">{t}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </TiltCard>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          className="mt-10 text-center"
          initial={reduced ? {} : { opacity: 0 }}
          whileInView={reduced ? {} : { opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
        >
          <a
            href="https://github.com/RavanGuliyeff"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-accent-400 hover:text-accent-300 font-medium transition-colors"
            aria-label="View more projects on GitHub"
          >
            <Github size={16} />
            More on GitHub
            <ExternalLink size={14} />
          </a>
        </motion.div>
      </div>
    </section>
  )
}
