import { useNavigate } from 'react-router-dom'
import { Sun, Moon, Smartphone, Check } from 'lucide-react'
import type { ComponentType } from 'react'
import PageSubHeader from '../components/ui/PageSubHeader'
import GlassCard from '../components/ui/GlassCard'
import { useSetting, setSetting } from '../db/hooks/useSettings'
import { useUIStore, type ThemeMode } from '../stores/uiStore'

const OPTIONS: { value: ThemeMode; label: string; desc: string; icon: ComponentType<{ size?: number }> }[] = [
  { value: 'system', label: 'System', desc: 'Match your device setting', icon: Smartphone },
  { value: 'dark', label: 'Dark', desc: 'Dark kinetic minimalism', icon: Moon },
  { value: 'light', label: 'Light', desc: 'Bright liquid glass', icon: Sun },
]

export function AppearancePage() {
  const nav = useNavigate()
  const theme = useSetting('theme')
  const setTheme = useUIStore((s) => s.setTheme)

  async function choose(t: ThemeMode) {
    await setSetting('theme', t)
    setTheme(t)
  }

  return (
    <div className="mx-auto max-w-lg pb-28">
      <PageSubHeader title="Appearance" onBack={() => nav('/more')} />
      <div className="space-y-2 px-4 pt-2">
        {OPTIONS.map((opt) => {
          const Icon = opt.icon
          const active = theme === opt.value
          return (
            <button key={opt.value} onClick={() => choose(opt.value)} className="w-full text-left">
              <GlassCard className="flex items-center gap-3 p-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/8 txt-primary">
                  <Icon size={20} />
                </span>
                <div className="flex-1">
                  <p className="font-semibold txt-primary">{opt.label}</p>
                  <p className="text-xs txt-secondary">{opt.desc}</p>
                </div>
                {active && (
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-crimson-light to-crimson text-white">
                    <Check size={14} />
                  </span>
                )}
              </GlassCard>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default AppearancePage
