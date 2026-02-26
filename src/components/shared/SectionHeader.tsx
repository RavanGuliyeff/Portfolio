import React from 'react'
import { motion } from 'framer-motion'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

interface SectionHeaderProps {
  label?: string   // small eyebrow text
  title: string
  highlight?: string   // portion of title to colour with gradient
  subtitle?: string
  align?: 'left' | 'center'
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  label,
  title,
  highlight,
  subtitle,
  align = 'center',
}) => {
  const reduced  = usePrefersReducedMotion()
  const centered = align === 'center'

  const containerVariants = {
    hidden:  {},
    visible: { transition: { staggerChildren: 0.12 } },
  }

  const itemVariants = {
    hidden:  reduced ? {} : { opacity: 0, y: 20 },
    visible: reduced ? {} : { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
  }

  const titleWithHighlight = highlight
    ? title.split(highlight).flatMap((part, i, arr) =>
        i < arr.length - 1
          ? [part, <span key={i} className="gradient-text">{highlight}</span>]
          : [part]
      )
    : title

  return (
    <motion.div
      className={`mb-12 ${centered ? 'text-center' : 'text-left'}`}
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-80px' }}
    >
      {label && (
        <motion.p
          className="font-mono text-accent-400 text-sm font-medium tracking-widest uppercase mb-3"
          variants={itemVariants}
        >
          {label}
        </motion.p>
      )}

      <motion.h2
        className="font-heading font-bold text-3xl sm:text-4xl md:text-5xl dark:text-white text-slate-900 leading-tight"
        variants={itemVariants}
      >
        {titleWithHighlight}
      </motion.h2>

      {subtitle && (
        <motion.p
          className={`mt-4 text-base sm:text-lg dark:text-slate-400 text-slate-600 max-w-2xl ${centered ? 'mx-auto' : ''}`}
          variants={itemVariants}
        >
          {subtitle}
        </motion.p>
      )}

      <motion.div
        className={`mt-4 h-0.5 w-16 bg-gradient-to-r from-accent-500 to-accent-400 rounded-full ${centered ? 'mx-auto' : ''}`}
        variants={itemVariants}
      />
    </motion.div>
  )
}
