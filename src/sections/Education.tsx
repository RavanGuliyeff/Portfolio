import { Award, GraduationCap } from 'lucide-react'
import { Section } from '@/components/shared/Section'
import { SectionHeader } from '@/components/shared/SectionHeader'
import { Reveal } from '@/components/shared/Reveal'
import { CERTIFICATIONS, EDUCATION } from '@/constants/portfolio'
import { useI18n } from '@/i18n/I18nProvider'

export function Education() {
  const { t, range, date } = useI18n()
  return (
    <Section id="education" label={t.nav.education}>
      <SectionHeader eyebrow={t.education.eyebrow} title={t.education.title} />

      <div className="grid gap-10 lg:grid-cols-2">
        <div>
          <h3 className="mb-4 flex items-center gap-2 text-sm font-medium text-subtle">
            <GraduationCap size={16} /> {t.education.education}
          </h3>
          <div className="space-y-4">
            {EDUCATION.map((e, i) => {
              const text = t.education.items[e.id]
              return (
                <Reveal as="article" key={e.id} delay={i * 0.05} className="card p-6">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <p className="font-mono text-xs text-subtle">{range(e.start, e.end)}</p>
                    {e.inProgress && (
                      <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                        {t.education.inProgress}
                      </span>
                    )}
                  </div>
                  <h4 className="mt-2 text-lg font-semibold text-fg">{text.degree}</h4>
                  <p className="text-[15px] text-accent-text">{e.institution}</p>
                  <ul className="mt-3 space-y-1.5">
                    {text.details.map(d => (
                      <li key={d} className="text-sm leading-relaxed text-muted">
                        {d}
                      </li>
                    ))}
                  </ul>
                </Reveal>
              )
            })}
          </div>
        </div>

        <div>
          <h3 className="mb-4 flex items-center gap-2 text-sm font-medium text-subtle">
            <Award size={16} /> {t.education.certifications}
          </h3>
          <ul className="card divide-y divide-line">
            {CERTIFICATIONS.map((c, i) => (
              <Reveal as="li" key={c.id} delay={i * 0.04} className="flex items-start justify-between gap-4 p-5">
                <div className="min-w-0">
                  <p className="font-medium text-fg">{c.title}</p>
                  <p className="mt-0.5 text-sm text-muted">{c.issuer}</p>
                  {t.education.certNotes[c.id] && <p className="mt-1 text-sm text-accent-text">{t.education.certNotes[c.id]}</p>}
                </div>
                <p className="shrink-0 font-mono text-xs text-subtle">{date(c.date)}</p>
              </Reveal>
            ))}
          </ul>
        </div>
      </div>
    </Section>
  )
}
