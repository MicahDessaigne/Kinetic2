import { NavLink, useLocation } from 'react-router-dom'
import { Home, Repeat, CheckSquare, Calendar, LayoutGrid } from 'lucide-react'
import type { ComponentType } from 'react'

interface Tab {
  to: string
  label: string
  icon: ComponentType<{ size?: number; strokeWidth?: number }>
}

const TABS: Tab[] = [
  { to: '/', label: 'Today', icon: Home },
  { to: '/habits', label: 'Habits', icon: Repeat },
  { to: '/tasks', label: 'Tasks', icon: CheckSquare },
  { to: '/calendar', label: 'Calendar', icon: Calendar },
  { to: '/more', label: 'More', icon: LayoutGrid },
]

export function TabBar() {
  const location = useLocation()
  return (
    <nav className="glass-nav fixed bottom-0 left-0 right-0 z-40 safe-area-bottom">
      <div className="mx-auto flex max-w-lg items-stretch justify-around px-2 pt-2">
        {TABS.map((tab) => {
          const active =
            tab.to === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(tab.to)
          const Icon = tab.icon
          return (
            <NavLink
              key={tab.to}
              to={tab.to}
              className="flex flex-1 flex-col items-center gap-1 rounded-xl py-1.5 text-[10px] font-medium"
              style={{ color: active ? 'var(--accent-light)' : 'var(--text-secondary)' }}
            >
              <Icon size={22} strokeWidth={active ? 2.4 : 1.9} />
              <span>{tab.label}</span>
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}

export default TabBar
