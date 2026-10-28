import type { ContactFormData } from '@/types'
import { OWNER } from '@/constants/portfolio'

// EmailJS public IDs are designed to live in client code; env vars can override them.
const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || 'service_ql6lhy2'
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'template_f75kczj'
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || 'vJHWTnIAs6RG6oE0S'

export const emailServiceConfigured = Boolean(SERVICE_ID && TEMPLATE_ID && PUBLIC_KEY)

export function mailtoLink(data: Partial<ContactFormData>) {
  const signature = [data.name, data.email].filter(Boolean).join(' · ')
  const body = [data.message ?? '', signature && `\n— ${signature}`].filter(Boolean).join('\n')
  const params = new URLSearchParams({ subject: data.subject || 'Hello from your website', body })
  // URLSearchParams encodes spaces as "+", which mail clients show literally.
  return `mailto:${OWNER.email}?${params.toString().replace(/\+/g, '%20')}`
}

/**
 * Sends the contact form through EmailJS.
 * Throws if the service is not configured or the request fails, so the caller can
 * fall back to a mailto: link.
 */
export async function sendMessage(data: ContactFormData) {
  if (!emailServiceConfigured) throw new Error('Email service is not configured')

  // Loaded on demand so the SDK is not part of the initial page load.
  const { default: emailjs } = await import('@emailjs/browser')

  await emailjs.send(
    SERVICE_ID,
    TEMPLATE_ID,
    {
      // Both naming styles, so either the custom template or EmailJS's
      // default "Contact Us" template works without edits.
      from_name: data.name,
      from_email: data.email,
      reply_to: data.email,
      subject: data.subject,
      message: data.message,
      name: data.name,
      email: data.email,
      title: data.subject,
      time: new Date().toLocaleString('en-GB'),
      // in case the template's "To Email" field is set to {{to_email}}
      to_email: OWNER.email,
      to_name: OWNER.name,
    },
    { publicKey: PUBLIC_KEY, limitRate: { id: 'contact-form', throttle: 10_000 } }
  )
}
