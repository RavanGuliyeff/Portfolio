import { useState } from 'react'
import type { ChangeEvent, FormEvent, ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, CheckCircle2, Copy, Github, Linkedin, Loader2, Mail, Send, TriangleAlert } from 'lucide-react'
import { Section } from '@/components/shared/Section'
import { SectionHeader } from '@/components/shared/SectionHeader'
import { Reveal } from '@/components/shared/Reveal'
import { Button } from '@/components/ui/Button'
import { OWNER } from '@/constants/portfolio'
import { emailServiceConfigured, mailtoLink, sendMessage } from '@/lib/sendMessage'
import type { ContactFormData } from '@/types'
import { useI18n } from '@/i18n/I18nProvider'
import type { Dictionary } from '@/i18n/types'

type Status = 'idle' | 'sending' | 'sent' | 'failed' | 'mailto'
type Errors = Partial<Record<keyof ContactFormData, string>>

const EMPTY: ContactFormData = { name: '', email: '', subject: '', message: '' }
const LIMITS = { name: 80, email: 120, subject: 120, message: 4000 }

function validate(f: ContactFormData, msg: Dictionary['contact']['errors']): Errors {
  const e: Errors = {}
  if (!f.name.trim()) e.name = msg.name
  if (!f.email.trim()) e.email = msg.email
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email.trim())) e.email = msg.emailInvalid
  if (!f.subject.trim()) e.subject = msg.subject
  if (f.message.trim().length < 10) e.message = msg.message
  return e
}

function Field({
  id,
  label,
  error,
  children,
}: {
  id: keyof ContactFormData
  label: string
  error?: string
  children: ReactNode
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-fg">
        {label}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-sm text-red-500">
          {error}
        </p>
      )}
    </div>
  )
}

export function Contact() {
  const { t } = useI18n()
  const c = t.contact
  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState<Errors>({})
  const [status, setStatus] = useState<Status>('idle')
  const [honeypot, setHoneypot] = useState('')
  const [copied, setCopied] = useState(false)

  const onChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
    if (errors[name as keyof ContactFormData]) setErrors(err => ({ ...err, [name]: undefined }))
    if (status === 'failed' || status === 'sent' || status === 'mailto') setStatus('idle')
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const found = validate(form, c.errors)
    setErrors(found)
    if (Object.keys(found).length) {
      document.getElementById(Object.keys(found)[0])?.focus()
      return
    }
    // Bots fill every field, people never see this one.
    if (honeypot) {
      setStatus('sent')
      return
    }

    if (!emailServiceConfigured) {
      window.location.href = mailtoLink(form)
      setStatus('mailto')
      return
    }

    setStatus('sending')
    try {
      await sendMessage({
        name: form.name.trim(),
        email: form.email.trim(),
        subject: form.subject.trim(),
        message: form.message.trim(),
      })
      setStatus('sent')
      setForm(EMPTY)
    } catch (err) {
      console.error('Contact form failed to send:', err)
      setStatus('failed')
    }
  }

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(OWNER.email)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      window.location.href = `mailto:${OWNER.email}`
    }
  }

  const describedBy = (k: keyof ContactFormData) => (errors[k] ? `${k}-error` : undefined)

  return (
    <Section id="contact" label={t.nav.contact} muted>
      <div className="grid gap-12 lg:grid-cols-[1fr_1.25fr]">
        <div>
          <SectionHeader
            eyebrow={c.eyebrow}
            title={c.title}
            description={c.description}
          />

          <Reveal className="space-y-3">
            <div className="card flex items-center gap-4 p-4">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent/10 text-accent-text">
                <Mail size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-subtle">{c.email}</p>
                <a href={`mailto:${OWNER.email}`} className="truncate text-[15px] text-fg hover:text-accent-text">
                  {OWNER.email}
                </a>
              </div>
              <button
                type="button"
                onClick={copyEmail}
                className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-muted transition-colors hover:bg-elevated hover:text-fg"
                aria-label={c.copy}
                title={c.copy}
              >
                {copied ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
              </button>
            </div>
            <div className="flex gap-3">
              <a
                href={OWNER.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="card flex flex-1 items-center justify-center gap-2 p-3 text-sm text-muted transition-colors hover:text-fg"
              >
                <Linkedin size={16} /> LinkedIn
              </a>
              <a
                href={OWNER.github}
                target="_blank"
                rel="noopener noreferrer"
                className="card flex flex-1 items-center justify-center gap-2 p-3 text-sm text-muted transition-colors hover:text-fg"
              >
                <Github size={16} /> GitHub
              </a>
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.06}>
          <form onSubmit={onSubmit} noValidate className="card relative space-y-5 p-6 sm:p-8" aria-label={c.title}>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field id="name" label={c.fields.name} error={errors.name}>
                <input
                  id="name"
                  name="name"
                  className="input"
                  value={form.name}
                  onChange={onChange}
                  maxLength={LIMITS.name}
                  autoComplete="name"
                  aria-invalid={!!errors.name}
                  aria-describedby={describedBy('name')}
                />
              </Field>
              <Field id="email" label={c.fields.email} error={errors.email}>
                <input
                  id="email"
                  name="email"
                  type="email"
                  inputMode="email"
                  className="input"
                  value={form.email}
                  onChange={onChange}
                  maxLength={LIMITS.email}
                  autoComplete="email"
                  aria-invalid={!!errors.email}
                  aria-describedby={describedBy('email')}
                />
              </Field>
            </div>
            <Field id="subject" label={c.fields.subject} error={errors.subject}>
              <input
                id="subject"
                name="subject"
                className="input"
                value={form.subject}
                onChange={onChange}
                maxLength={LIMITS.subject}
                aria-invalid={!!errors.subject}
                aria-describedby={describedBy('subject')}
              />
            </Field>
            <Field id="message" label={c.fields.message} error={errors.message}>
              <textarea
                id="message"
                name="message"
                rows={6}
                className="input resize-y"
                value={form.message}
                onChange={onChange}
                maxLength={LIMITS.message}
                aria-invalid={!!errors.message}
                aria-describedby={describedBy('message')}
              />
            </Field>

            {/* Honeypot: hidden from people and screen readers */}
            <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
              <label>
                Company
                <input tabIndex={-1} autoComplete="off" value={honeypot} onChange={e => setHoneypot(e.target.value)} />
              </label>
            </div>

            <div className="flex flex-col-reverse items-stretch gap-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-subtle">
                {emailServiceConfigured ? c.viaService : c.viaMailApp}
              </p>
              <Button
                type="submit"
                size="lg"
                disabled={status === 'sending'}
                icon={status === 'sending' ? <Loader2 size={17} className="animate-spin" /> : <Send size={16} />}
              >
                {status === 'sending' ? c.sending : c.send}
              </Button>
            </div>

            <AnimatePresence mode="wait">
              {status === 'sent' && (
                <motion.p
                  key="sent"
                  role="status"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-300"
                >
                  <CheckCircle2 size={17} /> {c.success}
                </motion.p>
              )}
              {status === 'mailto' && (
                <motion.p
                  key="mailto"
                  role="status"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="rounded-xl border border-line bg-elevated px-4 py-3 text-sm text-muted"
                >
                  {c.mailtoInfo}{' '}
                  <a className="link" href={`mailto:${OWNER.email}`}>
                    {OWNER.email}
                  </a>
                  .
                </motion.p>
              )}
              {status === 'failed' && (
                <motion.div
                  key="failed"
                  role="alert"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-300"
                >
                  <TriangleAlert size={17} className="mt-0.5 shrink-0" />
                  <p>
                    {c.failed}{' '}
                    <a className="font-medium underline underline-offset-2" href={mailtoLink(form)}>
                      {c.failedLink}
                    </a>{' '}
                    {c.failedTail}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </Reveal>
      </div>
    </Section>
  )
}
