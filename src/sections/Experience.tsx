import { Section } from '@/components/shared/Section'
import { SectionHeader } from '@/components/shared/SectionHeader'
import { Reveal } from '@/components/shared/Reveal'
import { EXPERIENCE } from '@/constants/portfolio'
import { useI18n } from '@/i18n/I18nProvider'

export function Experience() {
  const { t, range } = useI18n()
  return (
    <Section id="experience" label={t.nav.experience} muted>
      <SectionHeader eyebrow={t.experience.eyebrow} title={t.experience.title} description={t.experience.description} />

      <ol className="relative space-y-6 border-l border-line pl-6 sm:pl-10">
        {EXPERIENCE.map((job, i) => {
          const text = t.experience.items[job.id]
          return (
            <Reveal as="li" key={job.id} delay={i * 0.05} className="relative">
              <span
                className="absolute -left-[29px] top-7 h-2.5 w-2.5 rounded-full border-2 border-bg bg-accent ring-4 ring-accent/15 sm:-left-[45px]"
                aria-hidden="true"
              />
              <article className="card p-6 sm:p-7">
                <header className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-fg">{text.role}</h3>
                    <p className="mt-0.5 text-[15px] text-accent-text">
                      {job.company}
                      {text.employment && text.employment !== job.company && (
                        <span className="text-subtle"> · {text.employment}</span>
                      )}
                    </p>
                  </div>
                  <p className="shrink-0 font-mono text-xs text-subtle sm:pt-1.5">{range(job.start, job.end)}</p>
                </header>

                <ul className="mt-4 space-y-2.5">
                  {text.highlights.map(point => (
                    <li key={point} className="flex gap-3 text-[15px] leading-relaxed text-muted">
                      <span className="mt-[11px] h-1 w-1 shrink-0 rounded-full bg-subtle" aria-hidden="true" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>

                <ul className="mt-5 flex flex-wrap gap-1.5" aria-label={t.experience.technologies}>
                  {job.tech.map(tech => (
                    <li key={tech} className="chip">
                      {tech}
                    </li>
                  ))}
                </ul>
              </article>
            </Reveal>
          )
        })}
      </ol>
    </Section>
  )
}
