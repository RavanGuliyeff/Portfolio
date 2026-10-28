import { Section } from '@/components/shared/Section'
import { SectionHeader } from '@/components/shared/SectionHeader'
import { Reveal } from '@/components/shared/Reveal'
import { GameCard } from '@/games/GameCard'
import { GAMES } from '@/constants/portfolio'
import { useI18n } from '@/i18n/I18nProvider'

export function Arcade() {
  const { t } = useI18n()
  return (
    <Section id="arcade" label={t.nav.arcade} muted>
      <SectionHeader eyebrow={t.arcade.eyebrow} title={t.arcade.title} description={t.arcade.description} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {GAMES.map((game, i) => (
          <Reveal key={game.id} delay={(i % 3) * 0.04}>
            <GameCard game={game} featured={game.id === 'typer'} />
          </Reveal>
        ))}
      </div>
    </Section>
  )
}
