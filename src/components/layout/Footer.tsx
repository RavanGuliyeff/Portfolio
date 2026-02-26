import React from 'react'
import { Github, Linkedin, Mail } from 'lucide-react'
import { OWNER } from '@/constants/portfolio'

export const Footer: React.FC = () => {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t dark:border-dark-border border-light-border py-10 mt-0">
      <div className="section-container flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm dark:text-slate-500 text-slate-500">
          © {year} <span className="text-accent-400 font-semibold">{OWNER.name}</span> — Built with React &amp; ❤️
        </p>

        <div className="flex items-center gap-4">
          <a
            href={OWNER.github}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            className="dark:text-slate-500 text-slate-500 hover:text-accent-400 transition-colors"
          >
            <Github size={18} />
          </a>
          <a
            href={OWNER.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
            className="dark:text-slate-500 text-slate-500 hover:text-accent-400 transition-colors"
          >
            <Linkedin size={18} />
          </a>
          <a
            href={`mailto:${OWNER.email}`}
            aria-label="Email"
            className="dark:text-slate-500 text-slate-500 hover:text-accent-400 transition-colors"
          >
            <Mail size={18} />
          </a>
        </div>
      </div>
    </footer>
  )
}
