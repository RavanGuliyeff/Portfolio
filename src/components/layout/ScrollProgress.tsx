import { motion, useScroll, useSpring } from 'framer-motion'

// Driven by motion values, so scrolling never re-renders React.
export function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 200, damping: 40, restDelta: 0.001 })
  return (
    <motion.div
      aria-hidden="true"
      className="fixed inset-x-0 top-0 z-[55] h-0.5 origin-left bg-accent"
      style={{ scaleX }}
    />
  )
}
