import { ArrowUpRight, Github } from 'lucide-react'
import { Section } from '@/components/shared/Section'
import { SectionHeader } from '@/components/shared/SectionHeader'
import { Reveal } from '@/components/shared/Reveal'
import { OWNER, PROJECTS } from '@/constants/portfolio'
import { useI18n } from '@/i18n/I18nProvider'

export function Projects() {
  const { t, range } = useI18n()
  return (
    <Section id="projects" label={t.nav.projects}>
      <SectionHeader eyebrow={t.projects.eyebrow} title={t.projects.title} description={t.projects.description} />

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {PROJECTS.map((p, i) => {
          const text = t.projects.items[p.id]
          return (
            <Reveal
              as="article"
              key={p.id}
              delay={i * 0.06}
              className="card group flex flex-col p-6 transition-colors hover:border-accent/40"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="font-mono text-xs text-accent-text">{text.kind}</p>
                <p className="shrink-0 font-mono text-xs text-subtle">{range(p.start, p.end)}</p>
              </div>
              <h3 className="mt-3 text-xl font-semibold tracking-tight text-fg">{p.name}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-muted">{text.summary}</p>

              <ul className="mt-5 space-y-2 border-t border-line pt-5">
                {text.highlights.map(h => (
                  <li key={h} className="flex gap-2.5 text-sm leading-relaxed text-muted">
                    <span className="mt-[9px] h-1 w-1 shrink-0 rounded-full bg-accent" aria-hidden="true" />
                    {h}
                  </li>
                ))}
              </ul>

              <div className="mt-auto pt-6">
                {text.team && <p className="mb-3 text-xs text-subtle">{text.team}</p>}
                <ul className="flex flex-wrap gap-1.5">
                  {p.tech.map(tech => (
                    <li key={tech} className="chip">
                      {tech}
                    </li>
                  ))}
                </ul>
                {p.links && p.links.length > 0 && (
                  <div className="mt-5 flex gap-4">
                    {p.links.map(l => (
                      <a
                        key={l.url}
                        href={l.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="link inline-flex items-center gap-1 text-sm"
                      >
                        {l.label} <ArrowUpRight size={14} />
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </Reveal>
          )
        })}
      </div>

      <Reveal className="mt-10 flex justify-center">
        <a
          href={OWNER.github}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-fg"
        >
          <Github size={16} /> {t.projects.moreOnGithub} <ArrowUpRight size={14} />
        </a>
      </Reveal>
    </Section>
  )
}
