import { Moon, Sun } from 'lucide-react'
import { useTheme } from '@/theme/ThemeProvider'
import { useI18n } from '@/i18n/I18nProvider'

export function ThemeToggle() {
  const { isDark, toggle } = useTheme()
  const { t } = useI18n()
  return (
    <button
      type="button"
      onClick={toggle}
      className="grid h-9 w-9 place-items-center rounded-lg text-muted transition-colors hover:bg-elevated hover:text-fg"
      aria-label={isDark ? t.nav.lightTheme : t.nav.darkTheme}
      title={isDark ? t.nav.lightTheme : t.nav.darkTheme}
    >
      {isDark ? <Sun size={17} /> : <Moon size={17} />}
    </button>
  )
}
