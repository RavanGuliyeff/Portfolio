import React, { useState, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useThemeContext } from '@/App'

// One dark message, one light message — alternating for variety
const DARK_QUIPS = [
  "Back to the dark side. 🌑",
  "The light was temporary. 🕯️",
  "Eyes saved. Electricity wasted.",
  "Home sweet dark theme. 🫠",
  "Productivity restored (allegedly).",
]

const LIGHT_QUIPS = [
  "Welcome to the light side. 🫣",
  "Bold move. Very bold.",
  "Your retinas asked for this?",
  "Respect. I'd never.",
  "Channelling spreadsheet energy. ✨",
]

function pick(arr: string[]): string {
  return arr[Math.floor(Math.random() * arr.length)]
}

interface ThemeToastProps {
  message: string | null
}

export const ThemeToast: React.FC<ThemeToastProps> = ({ message }) => (
  <AnimatePresence>
    {message && (
      <motion.div
        key={message}
        className="fixed bottom-6 left-1/2 z-[9998] pointer-events-none"
        initial={{ opacity: 0, y: 20, x: '-50%', scale: 0.9 }}
        animate={{ opacity: 1, y: 0,  x: '-50%', scale: 1   }}
        exit={{    opacity: 0, y: -10, x: '-50%', scale: 0.9 }}
        transition={{ type: 'spring', stiffness: 400, damping: 28 }}
      >
        <div className="flex items-center gap-2 px-5 py-2.5 rounded-full
          dark:bg-dark-card bg-white
          border dark:border-dark-border border-slate-200
          shadow-lg dark:shadow-violet-glow
          text-sm font-medium dark:text-slate-200 text-slate-700 whitespace-nowrap"
        >
          {message}
        </div>
      </motion.div>
    )}
  </AnimatePresence>
)

// ─── Animated toggle button ────────────────────────────────────────────────────
interface ThemeToggleProps {
  className?: string
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '' }) => {
  const { isDark, toggle } = useThemeContext()
  const [toast, setToast] = useState<string | null>(null)

  const handleToggle = useCallback(() => {
    toggle()
    const quip = isDark ? pick(LIGHT_QUIPS) : pick(DARK_QUIPS)
    setToast(quip)
    setTimeout(() => setToast(null), 2600)
  }, [isDark, toggle])

  return (
    <>
      <motion.button
        onClick={handleToggle}
        className={`relative w-12 h-6 rounded-full flex items-center cursor-pointer
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500
          ${isDark
            ? 'bg-accent-700 border border-accent-600'
            : 'bg-slate-200 border border-slate-300'
          } ${className}`}
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        aria-pressed={!isDark}
        whileTap={{ scale: 0.92 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      >
        {/* Track shimmer */}
        <motion.span
          className="absolute inset-0 rounded-full overflow-hidden"
          aria-hidden="true"
        >
          <motion.span
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full"
            animate={{ translateX: ['−100%', '200%'] }}
            transition={{ duration: 1.2, repeat: Infinity, repeatDelay: 3 }}
          />
        </motion.span>

        {/* Thumb */}
        <motion.span
          className="relative z-10 w-5 h-5 rounded-full flex items-center justify-center text-[11px]"
          style={{
            background: isDark
              ? 'linear-gradient(135deg, #1e1e30, #2d2d48)'
              : 'linear-gradient(135deg, #fff, #f3e58a)',
            boxShadow: isDark
              ? '0 0 8px rgba(124,58,237,0.6)'
              : '0 0 8px rgba(253,224,71,0.7)',
          }}
          animate={{
            x: isDark ? 2 : 22,
          }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        >
          <motion.span
            key={isDark ? 'moon' : 'sun'}
            initial={{ scale: 0, rotate: -90 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{    scale: 0, rotate: 90 }}
            transition={{ duration: 0.2 }}
          >
            {isDark ? '🌙' : '☀️'}
          </motion.span>
        </motion.span>
      </motion.button>

      <ThemeToast message={toast} />
    </>
  )
}
