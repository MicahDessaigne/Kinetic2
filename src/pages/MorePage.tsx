import { useNavigate } from 'react-router-dom'
import {
  HandHeart,
  StickyNote,
  Lock,
  Database,
  Palette,
  Bell,
  ChevronRight,
  Info,
} from 'lucide-react'
import type { ComponentType } from 'react'
import PageHeader from '../components/ui/PageHeader'
import GlassCard from '../components/ui/GlassCard'
import { useSetting } from '../db/hooks/useSettings'

interface Item {
  to: string
  label: string
  desc: string
  icon: ComponentType<{ size?: number }>
  color: string
}

const ITEMS: Item[] = [
  { to: '/more/prayer', label: 'Prayer List', desc: 'Active & answered prayers', icon: HandHeart, color: '#C9A15E' },
  { to: '/more/notes', label: 'Notes', desc: 'Scratchpad & pinned notes', icon: StickyNote, color: '#8A8A93' },
  { to: '/more/notifications', label: 'Notifications', desc: 'Reminders & nudges', icon: Bell, color: '#3B4E6B' },
  { to: '/more/security', label: 'Device Lock', desc: 'PIN protection', icon: Lock, color: '#931A25' },
  { to: '/more/backup', label: 'Backup & Restore', desc: 'Export / import your data', icon: Database, color: '#2E7D5B' },
  { to: '/more/appearance', label: 'Appearance', desc: 'Light, dark or system', icon: Palette, color: '#6A4C93' },
]

export function MorePage() {
  const nav = useNavigate()
  const lockEnabled = useSetting('lock_enabled')

  return (
    <div className="mx-auto max-w-lg pb-28">
      <PageHeader title="More" />
      <div className="space-y-2 px-4 pt-2">
        {ITEMS.map((item) => {
          const Icon = item.icon
          return (
            <button key={item.to} onClick={() => nav(item.to)} className="w-full text-left">
              <GlassCard className="flex items-center gap-3 p-4">
                <span
                  className="flex h-10 w-10 items-center justify-center rounded-xl text-white"
                  style={{ background: item.color }}
                >
                  <Icon size={20} />
                </span>
                <div className="flex-1">
                  <p className="font-semibold txt-primary">
                    {item.label}
                    {item.to === '/more/security' && lockEnabled && (
                      <span className="ml-2 text-xs text-crimson-light">On</span>
                    )}
                  </p>
                  <p className="text-xs txt-secondary">{item.desc}</p>
                </div>
                <ChevronRight size={18} className="txt-secondary" />
              </GlassCard>
            </button>
          )
        })}

        <GlassCard className="mt-4 flex items-start gap-3 p-4">
          <Info size={18} className="mt-0.5 txt-secondary" />
          <div className="text-xs txt-secondary">
            <p className="mb-1 font-semibold txt-primary">About LifeOS</p>
            <p>
              A fully offline, private tracker. All your data stays on this device in the browser's
              storage. Nothing is sent to any server. Install it to your home screen for the best
              experience.
            </p>
          </div>
        </GlassCard>
      </div>
    </div>
  )
}

export default MorePage
