import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

interface TypewriterProps {
  words: string[]
  className?: string
  speed?: number        // ms per char
  deleteSpeed?: number
  pauseMs?: number
}

export const Typewriter: React.FC<TypewriterProps> = ({
  words,
  className = '',
  speed      = 90,
  deleteSpeed = 50,
  pauseMs    = 1800,
}) => {
  const reduced  = usePrefersReducedMotion()
  const [displayed, setDisplayed] = useState('')
  const [wordIdx,   setWordIdx]   = useState(0)
  const [charIdx,   setCharIdx]   = useState(0)
  const [deleting,  setDeleting]  = useState(false)

  useEffect(() => {
    if (reduced) { setDisplayed(words[0]); return }

    const current = words[wordIdx % words.length]
    let timeout: ReturnType<typeof setTimeout>

    if (!deleting && charIdx <= current.length) {
      timeout = setTimeout(() => {
        setDisplayed(current.slice(0, charIdx))
        setCharIdx(i => i + 1)
        if (charIdx === current.length) {
          setTimeout(() => setDeleting(true), pauseMs)
        }
      }, speed)
    } else if (deleting && charIdx >= 0) {
      timeout = setTimeout(() => {
        setDisplayed(current.slice(0, charIdx))
        setCharIdx(i => i - 1)
        if (charIdx === 0) {
          setDeleting(false)
          setWordIdx(w => (w + 1) % words.length)
        }
      }, deleteSpeed)
    }

    return () => clearTimeout(timeout)
  }, [charIdx, deleting, wordIdx, words, reduced, speed, deleteSpeed, pauseMs])

  return (
    <span className={className} aria-label={words.join(', ')}>
      {displayed}
      <span className="animate-pulse text-accent-400">|</span>
    </span>
  )
}

// ─── Fade-up text ──────────────────────────────────────────────────────────
interface AnimatedTextProps {
  children: React.ReactNode
  className?: string
  delay?: number
  as?: keyof React.JSX.IntrinsicElements
}

export const AnimatedText: React.FC<AnimatedTextProps> = ({
  children,
  className = '',
  delay = 0,
  as: Tag = 'span',
}) => {
  const reduced = usePrefersReducedMotion()

  return (
    <motion.div
      className={className}
      initial={reduced ? {} : { opacity: 0, y: 20 }}
      whileInView={reduced ? {} : { opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.55, delay, ease: 'easeOut' }}
      // @ts-ignore - polymorphic tag
      as={Tag}
    >
      {children}
    </motion.div>
  )
}
