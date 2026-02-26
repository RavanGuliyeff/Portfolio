import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { SectionHeader } from '@/components/shared/SectionHeader'
import { GameCard } from '@/games/GameCard'
import { GAMES } from '@/constants/portfolio'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

export const Games: React.FC = () => {
  const reduced = usePrefersReducedMotion()

  return (
    <section
      id="games"
      className="py-24 dark:bg-dark-bg bg-light-bg"
      aria-label="Mini games section"
    >
      <div className="section-container">
        <SectionHeader
          label="Take a Break"
          title="Mini "
          highlight="Games"
          subtitle="Even serious developers need a break. Launch any game — high scores are saved locally."
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-4">
          {GAMES.map((game, i) => (
            <motion.div
              key={game.id}
              initial={reduced ? {} : { opacity: 0, y: 24 }}
              whileInView={reduced ? {} : { opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.45 }}
            >
              <GameCard game={game} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
