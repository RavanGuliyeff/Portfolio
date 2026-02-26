import React from 'react'
import { motion, useSpring } from 'framer-motion'
import { useScrollProgress } from '@/hooks/useScrollProgress'

export const ScrollProgress: React.FC = () => {
  const progress = useScrollProgress()
  const spring   = useSpring(progress, { stiffness: 150, damping: 30 })

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 h-[3px] dark:bg-dark-border bg-light-border"
      aria-hidden="true"
    >
      <motion.div
        className="h-full bg-gradient-to-r from-accent-600 to-accent-400"
        style={{ width: `${spring.get()}%` }}
        animate={{ width: `${progress}%` }}
        transition={{ ease: 'easeOut', duration: 0.1 }}
      />
    </div>
  )
}
