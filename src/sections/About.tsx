import React from 'react'
import { motion } from 'framer-motion'
import { MapPin, Github, Linkedin, Mail, Briefcase, GraduationCap, Code2 } from 'lucide-react'
import { SectionHeader } from '@/components/shared/SectionHeader'
import { OWNER, STATS } from '@/constants/portfolio'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

const TECH_BADGES = [
  { label: 'C#',           color: '#9b59d0' },
  { label: '.NET',         color: '#7c3aed' },
  { label: 'SQL Server',   color: '#0ea5e9' },
  { label: 'PostgreSQL',   color: '#3b82f6' },
  { label: 'Clean Arch.',  color: '#10b981' },
  { label: 'CQRS',         color: '#f59e0b' },
  { label: 'Docker',       color: '#06b6d4' },
  { label: 'RabbitMQ',     color: '#f97316' },
]

const QUICK_FACTS = [
  { icon: <MapPin size={13} />,          text: 'Baku, Azerbaijan'  },
  { icon: <Briefcase size={13} />,       text: 'Backend Developer' },
  { icon: <GraduationCap size={13} />,   text: 'BHOS University'  },
  { icon: <Code2 size={13} />,           text: '3+ years coding'   },
]

const cardVariants = {
  hidden:  { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, delay: i * 0.1, ease: 'easeOut' },
  }),
}

export const About: React.FC = () => {
  const reduced = usePrefersReducedMotion()

  return (
    <section
      id="about"
      className="py-24 dark:bg-dark-surface bg-light-surface relative"
      aria-label="About section"
    >
      <div className="section-container">
        <SectionHeader
          label="Who I Am"
          title="About "
          highlight="Me"
          subtitle="A developer who started with Python scripts and today architects distributed .NET systems."
        />

        <div className="grid lg:grid-cols-2 gap-12 items-center mt-8">
          {/* Text column */}
          <motion.div
            initial={reduced ? {} : { opacity: 0, x: -40 }}
            whileInView={reduced ? {} : { opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <div className="space-y-5 dark:text-slate-300 text-slate-700 text-base leading-relaxed">
              <p>
                Hey, I'm <span className="text-accent-400 font-semibold">Ravan</span> — based in{' '}
                <span className="text-accent-400 font-semibold">Baku, Azerbaijan</span>. My journey started
                with Python scripts and frontend experiments, then took a detour through C++ competitive
                programming, and has now settled (happily) in the world of C#/.NET backend development.
              </p>
              <p>
                I get energised by <span className="text-accent-400 font-semibold">clean architecture</span>,
                performance-focused design, and mentoring the next generation of developers. I've instructed
                15+ students and mentored 20+ interns at Code Academy while building real-world products.
              </p>
              <p>
                When I'm not writing C# I'm probably competing in programming contests, reading about
                distributed systems, or teaching someone why <em>dependency injection</em> is worth the
                extra boilerplate.
              </p>

              {/* Languages */}
              <div className="pt-2">
                <p className="text-sm font-mono text-slate-500 mb-2">// Languages spoken</p>
                <div className="flex flex-wrap gap-2">
                  {OWNER.languages.map(lang => (
                    <span key={lang} className="tech-badge">{lang}</span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Visual column — Profile card */}
          <motion.div
            className="flex flex-col items-center gap-6"
            initial={reduced ? {} : { opacity: 0, x: 40 }}
            whileInView={reduced ? {} : { opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6, ease: 'easeOut', delay: 0.15 }}
          >
            {/* ── Card ─────────────────────────────────────────────────────── */}
            <motion.div
              className="w-full max-w-sm dark:bg-dark-card bg-light-card border dark:border-dark-border border-light-border rounded-2xl overflow-hidden shadow-xl"
              whileHover={reduced ? {} : { y: -4 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              {/* Header gradient banner */}
              <div className="h-24 bg-gradient-to-br from-accent-700 via-accent-600 to-indigo-700 relative">
                {/* Decorative dots */}
                {[
                  ['top-3 left-4',  'w-2 h-2', 'bg-white/20'],
                  ['top-6 left-12', 'w-1 h-1', 'bg-white/30'],
                  ['top-4 right-8', 'w-3 h-3', 'bg-white/10'],
                  ['top-10 right-4','w-1 h-1', 'bg-white/25'],
                ].map(([pos, size, col], i) => (
                  <span key={i} className={`absolute ${pos} ${size} ${col} rounded-full`} />
                ))}
                {/* Status badge */}
                <span className="absolute top-3 right-3 inline-flex items-center gap-1.5
                  px-2.5 py-1 rounded-full text-xs font-mono bg-emerald-500/20 border border-emerald-400/40 text-emerald-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Open to work
                </span>
              </div>

              {/* Avatar */}
              <div className="px-6 pb-6">
                <div className="relative -mt-10 mb-4 inline-flex">
                  <motion.div
                    className="w-20 h-20 rounded-2xl border-4 dark:border-dark-card border-light-card
                      bg-gradient-to-br from-accent-600 to-indigo-700
                      flex items-center justify-center shadow-lg"
                    initial={{ scale: 0.7, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ type: 'spring', stiffness: 400, damping: 18, delay: 0.3 }}
                  >
                    <span className="font-heading font-black text-2xl text-white tracking-tight select-none">
                      RG
                    </span>
                  </motion.div>
                  {/* Ring glow */}
                  <span className="absolute inset-0 rounded-2xl ring-2 ring-accent-500/40" />
                </div>

                {/* Name / role */}
                <h3 className="font-heading font-bold text-lg dark:text-white text-slate-900 leading-tight">
                  {OWNER.name}
                </h3>
                <p className="text-sm text-accent-400 font-mono mb-4">{OWNER.title}</p>

                {/* Quick facts */}
                <ul className="space-y-1.5 mb-5">
                  {QUICK_FACTS.map((f, i) => (
                    <motion.li
                      key={i}
                      className="flex items-center gap-2 text-sm dark:text-slate-400 text-slate-600"
                      initial={reduced ? {} : { opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.35 + i * 0.07 }}
                    >
                      <span className="text-accent-500">{f.icon}</span>
                      {f.text}
                    </motion.li>
                  ))}
                </ul>

                {/* Tech badges */}
                <div className="flex flex-wrap gap-1.5 mb-5">
                  {TECH_BADGES.map((b, i) => (
                    <motion.span
                      key={b.label}
                      className="px-2 py-0.5 rounded-md text-xs font-mono font-medium border"
                      style={{
                        color: b.color,
                        borderColor: b.color + '44',
                        background: b.color + '16',
                      }}
                      initial={reduced ? {} : { scale: 0, opacity: 0 }}
                      whileInView={{ scale: 1, opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ type: 'spring', delay: 0.45 + i * 0.04 }}
                    >
                      {b.label}
                    </motion.span>
                  ))}
                </div>

                {/* Social links */}
                <div className="flex gap-2">
                  {[
                    { href: OWNER.github,              icon: <Github size={15} />,   label: 'GitHub'   },
                    { href: OWNER.linkedin,             icon: <Linkedin size={15} />, label: 'LinkedIn' },
                    { href: `mailto:${OWNER.email}`,    icon: <Mail size={15} />,     label: 'Email'    },
                  ].map(s => (
                    <a
                      key={s.label}
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={s.label}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                        dark:bg-dark-border bg-slate-100 dark:text-slate-300 text-slate-700
                        hover:text-accent-400 hover:bg-accent-500/10 dark:hover:bg-accent-500/10
                        border dark:border-dark-border border-slate-200 transition-all"
                    >
                      {s.icon} {s.label}
                    </a>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Stat cards */}
            <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
              {STATS.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  className="dark:bg-dark-card bg-light-card border dark:border-dark-border border-light-border rounded-xl p-4 text-center hover-glow"
                  custom={i}
                  variants={cardVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                >
                  <div className="text-2xl mb-1">{stat.icon}</div>
                  <div className="font-heading font-bold text-xl gradient-text">{stat.value}</div>
                  <div className="text-xs dark:text-slate-500 text-slate-500 mt-0.5">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

