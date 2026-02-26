import React from 'react'
import { motion } from 'framer-motion'

interface CardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
  onClick?: () => void
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hover = false,
  onClick,
}) => {
  const base =
    'rounded-2xl border border-dark-border bg-dark-card dark:bg-dark-card dark:border-dark-border shadow-card-dark transition-all duration-300'

  return (
    <motion.div
      className={`${base} ${hover ? 'hover-glow cursor-pointer' : ''} ${className}`}
      whileHover={hover ? { y: -4 } : undefined}
      onClick={onClick}
    >
      {children}
    </motion.div>
  )
}
