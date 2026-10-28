import { Suspense, lazy } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Download, Github, Linkedin, MapPin } from 'lucide-react'
import { ButtonLink } from '@/components/ui/Button'
import { OWNER } from '@/constants/portfolio'
import { useI18n } from '@/i18n/I18nProvider'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { useIdle } from '@/hooks/useIdle'

const LaptopScene = lazy(() => import('@/three/LaptopScene'))

const rise = (delay: number) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] as const },
})

export function Hero() {
  const isDesktop = useMediaQuery('(min-width: 1024px)')
  const idle = useIdle()
  const show3d = isDesktop && idle
  const { t } = useI18n()

  return (
    <section id="top" aria-label="Introduction" className="relative overflow-hidden pt-16">
      <div className="bg-grid pointer-events-none absolute inset-0 opacity-60" aria-hidden="true" />
      <div
        className="pointer-events-none absolute -top-40 left-1/2 h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-accent/15 blur-[120px]"
        aria-hidden="true"
      />

      <div className="container-page relative">
        <div className="grid items-center gap-10 py-16 lg:min-h-[calc(100svh-12.5rem)] lg:grid-cols-[1.1fr_1fr] lg:py-8">
          <div>
            <motion.p
              {...rise(0)}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-line bg-surface/70 px-3 py-1 text-xs text-muted backdrop-blur"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              {t.hero.available}
            </motion.p>

            <motion.h1 {...rise(0.05)} className="text-5xl font-bold tracking-tight text-fg sm:text-6xl lg:text-7xl">
              {OWNER.name}
            </motion.h1>

            <motion.p
              {...rise(0.12)}
              className="mt-5 max-w-2xl text-balance text-xl font-medium leading-snug text-fg/90 sm:text-2xl"
            >
              {t.hero.headline}
            </motion.p>

            <motion.p {...rise(0.18)} className="mt-4 max-w-xl text-pretty leading-relaxed text-muted">
              {t.hero.intro}
            </motion.p>

            <motion.div {...rise(0.24)} className="mt-8 flex flex-wrap items-center gap-3">
              <ButtonLink href="#projects" size="lg" iconRight={<ArrowRight size={17} />}>
                {t.hero.seeWork}
              </ButtonLink>
              <ButtonLink
                href={OWNER.resumeUrl}
                download="Ravan-Guliyev-CV.pdf"
                size="lg"
                variant="secondary"
                icon={<Download size={17} />}
              >
                {t.hero.downloadCv}
              </ButtonLink>
              <div className="flex items-center gap-1 sm:ml-2">
                <a
                  href={OWNER.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={t.hero.github}
                  className="grid h-11 w-11 place-items-center rounded-xl text-muted transition-colors hover:bg-elevated hover:text-fg"
                >
                  <Github size={19} />
                </a>
                <a
                  href={OWNER.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={t.hero.linkedin}
                  className="grid h-11 w-11 place-items-center rounded-xl text-muted transition-colors hover:bg-elevated hover:text-fg"
                >
                  <Linkedin size={19} />
                </a>
              </div>
            </motion.div>

            <motion.p {...rise(0.3)} className="mt-6 flex items-center gap-1.5 text-sm text-subtle">
              <MapPin size={14} /> {t.about.facts[0].value}
            </motion.p>
          </div>

          <div className="relative hidden h-[480px] lg:block xl:-mr-10" aria-hidden="true">
            {show3d && (
              <Suspense fallback={null}>
                <LaptopScene />
              </Suspense>
            )}
          </div>
        </div>

        <motion.dl
          {...rise(0.36)}
          className="mb-16 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line lg:mb-10 lg:grid-cols-4"
        >
          {t.metrics.map(m => (
            <div key={m.label} className="flex flex-col-reverse justify-end bg-surface/90 px-5 py-5 backdrop-blur">
              <dt className="mt-1 text-sm leading-snug text-muted">{m.label}</dt>
              <dd className="text-2xl font-semibold tracking-tight text-fg">{m.value}</dd>
            </div>
          ))}
        </motion.dl>
      </div>
    </section>
  )
}
