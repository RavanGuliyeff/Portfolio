import type { ReactNode } from 'react'

interface SectionProps {
  id: string
  label: string
  children: ReactNode
  muted?: boolean
}

export function Section({ id, label, children, muted = false }: SectionProps) {
  return (
    <section
      id={id}
      aria-label={label}
      className={`py-20 sm:py-28 ${muted ? 'border-y border-line bg-surface/60' : ''}`}
    >
      <div className="container-page">{children}</div>
    </section>
  )
}
