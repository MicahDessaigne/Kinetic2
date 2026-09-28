import type { ReactNode, HTMLAttributes } from 'react'

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  className?: string
  as?: 'div' | 'section' | 'article'
}

export function GlassCard({ children, className = '', as = 'div', ...rest }: GlassCardProps) {
  const Tag = as
  return (
    <Tag
      className={`glass-card relative rounded-3xl shadow-glass ${className}`}
      {...rest}
    >
      {children}
    </Tag>
  )
}

export default GlassCard
