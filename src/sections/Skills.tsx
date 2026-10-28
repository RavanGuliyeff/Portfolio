import { Blocks, Boxes, Database, Layers, Plug, Wrench } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Section } from '@/components/shared/Section'
import { SectionHeader } from '@/components/shared/SectionHeader'
import { Reveal } from '@/components/shared/Reveal'
import { SKILL_GROUPS } from '@/constants/portfolio'
import { useI18n } from '@/i18n/I18nProvider'

const ICONS: Record<string, LucideIcon> = {
  backend: Layers,
  data: Database,
  architecture: Blocks,
  integrations: Plug,
  tooling: Wrench,
  other: Boxes,
}

export function Skills() {
  const { t } = useI18n()
  return (
    <Section id="skills" label={t.nav.skills} muted>
      <SectionHeader eyebrow={t.skills.eyebrow} title={t.skills.title} description={t.skills.description} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SKILL_GROUPS.map((group, i) => {
          const Icon = ICONS[group.id] ?? Boxes
          return (
            <Reveal key={group.id} delay={i * 0.04} className="card p-6">
              <div className="flex items-center gap-3">
                <div className="grid h-9 w-9 place-items-center rounded-lg bg-accent/10 text-accent-text">
                  <Icon size={17} />
                </div>
                <h3 className="font-semibold text-fg">{t.skills.groups[group.id]}</h3>
              </div>
              <ul className="mt-5 flex flex-wrap gap-2">
                {group.skills.map(s => (
                  <li key={s} className="rounded-lg border border-line bg-bg px-2.5 py-1 text-sm text-muted">
                    {s}
                  </li>
                ))}
              </ul>
            </Reveal>
          )
        })}
      </div>
    </Section>
  )
}
