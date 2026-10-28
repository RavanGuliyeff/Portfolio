import { BriefcaseBusiness, GraduationCap, Languages, MapPin } from 'lucide-react'
import { Section } from '@/components/shared/Section'
import { SectionHeader } from '@/components/shared/SectionHeader'
import { Reveal } from '@/components/shared/Reveal'
import { useI18n } from '@/i18n/I18nProvider'

const ICONS = [MapPin, BriefcaseBusiness, GraduationCap, Languages]

/** Renders `**text**` as emphasised text. */
function Rich({ text }: { text: string }) {
  return (
    <>
      {text.split(/(\*\*[^*]+\*\*)/).map((part, i) =>
        part.startsWith('**') ? (
          <span key={i} className="text-fg">
            {part.slice(2, -2)}
          </span>
        ) : (
          part
        )
      )}
    </>
  )
}

export function About() {
  const { t } = useI18n()
  return (
    <Section id="about" label={t.nav.about}>
      <SectionHeader eyebrow={t.about.eyebrow} title={t.about.title} />

      <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr]">
        <Reveal className="space-y-5 text-[17px] leading-relaxed text-muted">
          {t.about.paragraphs.map(p => (
            <p key={p.slice(0, 24)}>
              <Rich text={p} />
            </p>
          ))}
        </Reveal>

        <Reveal delay={0.08}>
          <dl className="card divide-y divide-line">
            {t.about.facts.map(({ label, value }, i) => {
              const Icon = ICONS[i]
              return (
                <div key={label} className="flex gap-4 p-5">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent/10 text-accent-text">
                    <Icon size={18} />
                  </div>
                  <div className="min-w-0">
                    <dt className="text-xs font-medium uppercase tracking-wider text-subtle">{label}</dt>
                    <dd className="mt-1 text-[15px] text-fg">{value}</dd>
                  </div>
                </div>
              )
            })}
          </dl>
        </Reveal>
      </div>
    </Section>
  )
}
