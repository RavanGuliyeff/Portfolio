import React, { useRef, MouseEvent } from 'react'
import { motion, useMotionValue, useTransform } from 'framer-motion'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

interface TiltCardProps {
  children: React.ReactNode
  className?: string
  maxTilt?: number   // degrees
  glowColor?: string
}

export const TiltCard: React.FC<TiltCardProps> = ({
  children,
  className = '',
  maxTilt   = 8,
  glowColor = 'rgba(124,58,237,0.35)',
}) => {
  const reduced = usePrefersReducedMotion()
  const ref     = useRef<HTMLDivElement>(null)

  const mouseX  = useMotionValue(0)
  const mouseY  = useMotionValue(0)

  const rotateX = useTransform(mouseY, [-0.5, 0.5], [maxTilt, -maxTilt])
  const rotateY = useTransform(mouseX, [-0.5, 0.5], [-maxTilt, maxTilt])

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (reduced || !ref.current) return
    const rect = ref.current.getBoundingClientRect()
    mouseX.set((e.clientX - rect.left) / rect.width  - 0.5)
    mouseY.set((e.clientY - rect.top)  / rect.height - 0.5)
  }

  const handleMouseLeave = () => {
    mouseX.set(0)
    mouseY.set(0)
  }

  return (
    <motion.div
      ref={ref}
      className={`relative ${className}`}
      style={reduced ? {} : { rotateX, rotateY, transformStyle: 'preserve-3d', perspective: 800 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileHover={reduced ? {} : { scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 250, damping: 30 }}
    >
      {/* Glow border on hover */}
      <motion.div
        className="absolute -inset-px rounded-2xl pointer-events-none z-0 opacity-0 transition-opacity duration-300"
        style={{ background: `radial-gradient(circle at 50% 50%, ${glowColor}, transparent 70%)` }}
        whileHover={{ opacity: 1 }}
      />
      <div className="relative z-10">{children}</div>
    </motion.div>
  )
}
