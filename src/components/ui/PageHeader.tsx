import type { ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  subtitle?: string
  right?: ReactNode
}

export function PageHeader({ title, subtitle, right }: PageHeaderProps) {
  return (
    <header className="safe-area-top px-5 pt-4 pb-2">
      <div className="flex items-end justify-between">
        <div>
          {subtitle && <p className="text-sm txt-secondary">{subtitle}</p>}
          <h1 className="text-[28px] font-bold tracking-tight txt-primary">{title}</h1>
        </div>
        {right}
      </div>
    </header>
  )
}

export default PageHeader
