import React from 'react'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'accent' | 'success' | 'info' | 'warning' | 'neutral'
  size?: 'sm' | 'md'
  className?: string
}

const variantStyles: Record<string, string> = {
  accent:  'bg-accent-500/15 text-accent-300 border-accent-500/30',
  success: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  info:    'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
  warning: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  neutral: 'bg-slate-500/15 text-slate-300 border-slate-500/30',
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'accent',
  size    = 'sm',
  className = '',
}) => {
  const sizeStyles = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'
  return (
    <span
      className={`inline-flex items-center font-mono font-medium rounded-full border ${sizeStyles} ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  )
}
