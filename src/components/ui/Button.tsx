import React from 'react'
import { motion } from 'framer-motion'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  as?: 'button' | 'a'
  href?: string
  target?: string
  rel?: string
  download?: string
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  as: Tag = 'button',
  href,
  icon,
  iconPosition = 'right',
  className = '',
  ...rest
}) => {
  const reduced = usePrefersReducedMotion()

  const base =
    'inline-flex items-center gap-2 font-heading font-semibold rounded-lg transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 select-none cursor-pointer'

  const variants = {
    primary:
      'bg-accent-500 hover:bg-accent-600 text-white shadow-violet-glow hover:shadow-violet-glow-lg',
    outline:
      'border border-accent-500 text-accent-400 hover:bg-accent-500 hover:text-white',
    ghost:
      'text-accent-400 hover:text-accent-300 hover:bg-accent-500/10',
  }

  const sizes = {
    sm:  'px-3 py-1.5 text-sm',
    md:  'px-5 py-2.5 text-base',
    lg:  'px-7 py-3.5 text-lg',
  }

  const cls = `${base} ${variants[variant]} ${sizes[size]} ${className}`

  const content = (
    <>
      {icon && iconPosition === 'left'  && <span>{icon}</span>}
      {children}
      {icon && iconPosition === 'right' && <span>{icon}</span>}
    </>
  )

  if (Tag === 'a') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const AnchorMotion = motion.a as any
    return (
      <AnchorMotion
        href={href}
        className={cls}
        whileHover={reduced ? {} : { scale: 1.04 }}
        whileTap={reduced  ? {} : { scale: 0.97 }}
        {...rest}
      >
        {content}
      </AnchorMotion>
    )
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ButtonMotion = motion.button as any
  return (
    <ButtonMotion
      className={cls}
      whileHover={reduced ? {} : { scale: 1.04 }}
      whileTap={reduced   ? {} : { scale: 0.97 }}
      {...rest}
    >
      {content}
    </ButtonMotion>
  )
}
