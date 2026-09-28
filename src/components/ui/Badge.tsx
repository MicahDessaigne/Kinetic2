import type { ReactNode } from 'react'

interface BadgeProps {
  children: ReactNode
  color?: string
  className?: string
}

export function Badge({ children, color, className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${className}`}
      style={{
        background: color ? `${color}22` : 'rgba(255,255,255,0.08)',
        color: color ?? 'var(--text-secondary)',
        border: `1px solid ${color ? `${color}55` : 'var(--border)'}`,
      }}
    >
      {children}
    </span>
  )
}

export const PRIORITY_META = [
  { label: 'None', color: '#8A8A93' },
  { label: 'Low', color: '#3B4E6B' },
  { label: 'Medium', color: '#B8860B' },
  { label: 'High', color: '#A8202E' },
] as const

export function PriorityBadge({ priority }: { priority: number }) {
  const meta = PRIORITY_META[priority] ?? PRIORITY_META[0]
  if (priority === 0) return null
  return <Badge color={meta.color}>{meta.label}</Badge>
}

export default Badge
