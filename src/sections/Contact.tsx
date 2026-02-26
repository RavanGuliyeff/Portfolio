import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import emailjs from '@emailjs/browser'
import { Send, Github, Linkedin, Mail, CheckCircle, XCircle, MapPin } from 'lucide-react'
import { SectionHeader } from '@/components/shared/SectionHeader'
import { Button } from '@/components/ui/Button'
import { OWNER } from '@/constants/portfolio'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import type { ContactFormData } from '@/types'

// ─── REPLACE with your actual EmailJS credentials ────────────────────────────
const EMAILJS_SERVICE_ID  = 'YOUR_SERVICE_ID'   // e.g. service_xxxxxxx
const EMAILJS_TEMPLATE_ID = 'YOUR_TEMPLATE_ID'  // e.g. template_xxxxxxx
const EMAILJS_PUBLIC_KEY  = 'YOUR_PUBLIC_KEY'   // e.g. xxxxxxxxxxxxxxxxxxxx
// ─────────────────────────────────────────────────────────────────────────────

type Status = 'idle' | 'loading' | 'success' | 'error'

const initialForm: ContactFormData = { name: '', email: '', subject: '', message: '' }

export const Contact: React.FC = () => {
  const reduced = usePrefersReducedMotion()
  const [form,   setForm]   = useState<ContactFormData>(initialForm)
  const [errors, setErrors] = useState<Partial<ContactFormData>>({})
  const [status, setStatus] = useState<Status>('idle')

  const validate = (): boolean => {
    const e: Partial<ContactFormData> = {}
    if (!form.name.trim())    e.name    = 'Name is required'
    if (!form.email.trim())   e.email   = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email'
    if (!form.subject.trim()) e.subject = 'Subject is required'
    if (!form.message.trim()) e.message = 'Message cannot be empty'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
    setErrors(err => ({ ...err, [name]: undefined }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setStatus('loading')
    try {
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
          from_name:    form.name,
          from_email:   form.email,
          subject:      form.subject,
          message:      form.message,
          reply_to:     form.email,
        },
        EMAILJS_PUBLIC_KEY
      )
      setStatus('success')
      setForm(initialForm)
      setTimeout(() => setStatus('idle'), 5000)
    } catch {
      setStatus('error')
      setTimeout(() => setStatus('idle'), 5000)
    }
  }

  const inputCls = (field: keyof ContactFormData) =>
    `w-full px-4 py-3 rounded-xl border text-sm font-body bg-dark-card dark:bg-dark-card bg-light-card
     dark:text-slate-100 text-slate-900 placeholder:text-slate-500
     focus:outline-none focus:ring-2 focus:ring-accent-500 transition-all duration-200
     ${errors[field]
       ? 'border-red-500/70'
       : 'dark:border-dark-border border-light-border hover:border-accent-500/40'}`

  return (
    <section
      id="contact"
      className="py-24 dark:bg-dark-surface bg-light-surface"
      aria-label="Contact section"
    >
      <div className="section-container">
        <SectionHeader
          label="Get In Touch"
          title="Let's "
          highlight="Connect"
          subtitle="Got a project, opportunity, or just want to chat about backend architecture? Drop me a message."
        />

        <div className="grid lg:grid-cols-2 gap-12 mt-4 items-start">
          {/* Left – visual / info */}
          <motion.div
            initial={reduced ? {} : { opacity: 0, x: -30 }}
            whileInView={reduced ? {} : { opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex flex-col gap-8"
          >
            <div className="dark:bg-dark-card bg-light-card border dark:border-dark-border border-light-border rounded-2xl p-8">
              <blockquote className="text-lg font-heading font-medium dark:text-slate-200 text-slate-800 leading-relaxed mb-6">
                "Good software is like a good friend — it does what you expect, doesn't break under pressure, and is easy to talk to."
              </blockquote>
              <p className="text-sm dark:text-slate-500 text-slate-500 font-mono">— Ravan Guliyev</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 dark:text-slate-400 text-slate-600">
                <div className="w-10 h-10 rounded-xl bg-accent-500/10 flex items-center justify-center">
                  <Mail size={18} className="text-accent-400" />
                </div>
                <div>
                  <p className="text-xs dark:text-slate-500 text-slate-500">Email</p>
                  <a href={`mailto:${OWNER.email}`} className="text-sm hover:text-accent-400 transition-colors">
                    {OWNER.email}
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3 dark:text-slate-400 text-slate-600">
                <div className="w-10 h-10 rounded-xl bg-accent-500/10 flex items-center justify-center">
                  <MapPin size={18} className="text-accent-400" />
                </div>
                <div>
                  <p className="text-xs dark:text-slate-500 text-slate-500">Location</p>
                  <p className="text-sm">{OWNER.location}</p>
                </div>
              </div>
            </div>

            {/* Social links */}
            <div className="flex gap-3">
              {[
                { href: OWNER.github,   icon: <Github  size={20} />, label: 'GitHub'   },
                { href: OWNER.linkedin, icon: <Linkedin size={20} />, label: 'LinkedIn' },
                { href: `mailto:${OWNER.email}`, icon: <Mail size={20} />, label: 'Email' },
              ].map(s => (
                <motion.a
                  key={s.label}
                  href={s.href}
                  target={s.href.startsWith('mailto') ? undefined : '_blank'}
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl dark:bg-dark-card bg-light-card border dark:border-dark-border border-light-border dark:text-slate-400 text-slate-600 hover:text-accent-400 hover:border-accent-500/40 transition-all text-sm font-medium"
                  whileHover={{ y: -2 }}
                  aria-label={s.label}
                >
                  {s.icon}
                  {s.label}
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Right – form */}
          <motion.form
            onSubmit={handleSubmit}
            initial={reduced ? {} : { opacity: 0, x: 30 }}
            whileInView={reduced ? {} : { opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="dark:bg-dark-card bg-light-card border dark:border-dark-border border-light-border rounded-2xl p-6 sm:p-8 space-y-4"
            noValidate
            aria-label="Contact form"
          >
            {/* Name + Email row */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-xs font-medium dark:text-slate-400 text-slate-600 mb-1.5">
                  Name *
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Your name"
                  className={inputCls('name')}
                  autoComplete="name"
                  aria-required="true"
                  aria-describedby={errors.name ? 'name-error' : undefined}
                />
                {errors.name && <p id="name-error" className="mt-1 text-xs text-red-400">{errors.name}</p>}
              </div>
              <div>
                <label htmlFor="email" className="block text-xs font-medium dark:text-slate-400 text-slate-600 mb-1.5">
                  Email *
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className={inputCls('email')}
                  autoComplete="email"
                  aria-required="true"
                  aria-describedby={errors.email ? 'email-error' : undefined}
                />
                {errors.email && <p id="email-error" className="mt-1 text-xs text-red-400">{errors.email}</p>}
              </div>
            </div>

            {/* Subject */}
            <div>
              <label htmlFor="subject" className="block text-xs font-medium dark:text-slate-400 text-slate-600 mb-1.5">
                Subject *
              </label>
              <input
                id="subject"
                name="subject"
                type="text"
                value={form.subject}
                onChange={handleChange}
                placeholder="What's it about?"
                className={inputCls('subject')}
                aria-required="true"
                aria-describedby={errors.subject ? 'subject-error' : undefined}
              />
              {errors.subject && <p id="subject-error" className="mt-1 text-xs text-red-400">{errors.subject}</p>}
            </div>

            {/* Message */}
            <div>
              <label htmlFor="message" className="block text-xs font-medium dark:text-slate-400 text-slate-600 mb-1.5">
                Message *
              </label>
              <textarea
                id="message"
                name="message"
                rows={5}
                value={form.message}
                onChange={handleChange}
                placeholder="Tell me about your project…"
                className={`${inputCls('message')} resize-none`}
                aria-required="true"
                aria-describedby={errors.message ? 'message-error' : undefined}
              />
              {errors.message && <p id="message-error" className="mt-1 text-xs text-red-400">{errors.message}</p>}
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full justify-center"
              disabled={status === 'loading'}
              icon={<Send size={16} />}
              aria-label="Send message"
            >
              {status === 'loading' ? 'Sending…' : 'Send Message'}
            </Button>

            {/* Toast */}
            <AnimatePresence>
              {(status === 'success' || status === 'error') && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm ${
                    status === 'success'
                      ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                      : 'bg-red-500/15 text-red-300 border border-red-500/30'
                  }`}
                  role="alert"
                >
                  {status === 'success'
                    ? <><CheckCircle size={16} /> Message sent! I'll get back to you soon.</>
                    : <><XCircle    size={16} /> Something went wrong. Please try again.</>
                  }
                </motion.div>
              )}
            </AnimatePresence>
          </motion.form>
        </div>
      </div>
    </section>
  )
}
