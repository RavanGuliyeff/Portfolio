import { Github, Linkedin, Mail } from 'lucide-react'
import { OWNER } from '@/constants/portfolio'
import { useI18n } from '@/i18n/I18nProvider'

const links = [
  { href: OWNER.github, label: 'GitHub', icon: Github },
  { href: OWNER.linkedin, label: 'LinkedIn', icon: Linkedin },
  { href: `mailto:${OWNER.email}`, label: 'Email', icon: Mail },
]

export function Footer() {
  const { t } = useI18n()
  return (
    <footer className="border-t border-line py-10">
      <div className="container-page flex flex-col items-center justify-between gap-4 sm:flex-row">
        <p className="text-sm text-subtle">
          © {new Date().getFullYear()} {OWNER.name} · {t.footer.builtWith}
        </p>
        <div className="flex items-center gap-1">
          {links.map(({ href, label, icon: Icon }) => (
            <a
              key={label}
              href={href}
              aria-label={label}
              target={href.startsWith('mailto') ? undefined : '_blank'}
              rel="noopener noreferrer"
              className="grid h-9 w-9 place-items-center rounded-lg text-subtle transition-colors hover:bg-elevated hover:text-fg"
            >
              <Icon size={17} />
            </a>
          ))}
        </div>
      </div>
    </footer>
  )
}
