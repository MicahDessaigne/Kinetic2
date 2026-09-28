import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShieldCheck } from 'lucide-react'
import PageSubHeader from '../components/ui/PageSubHeader'
import GlassCard from '../components/ui/GlassCard'
import GlassButton from '../components/ui/GlassButton'
import Toggle from '../components/ui/Toggle'
import PinLock from '../components/ui/PinLock'
import { useSetting, setSetting } from '../db/hooks/useSettings'

export function SecurityPage() {
  const nav = useNavigate()
  const enabled = useSetting('lock_enabled')
  const [setting, setSettingFlow] = useState<'set' | 'change' | null>(null)

  async function onToggle(v: boolean) {
    if (v) {
      setSettingFlow('set')
    } else {
      await setSetting('lock_enabled', false)
      await setSetting('pin_hash', '')
    }
  }

  async function onPinSet(_: string, hash: string) {
    await setSetting('pin_hash', hash)
    await setSetting('lock_enabled', true)
    setSettingFlow(null)
  }

  return (
    <div className="mx-auto max-w-lg pb-28">
      <PageSubHeader title="Device Lock" onBack={() => nav('/more')} />
      <div className="space-y-4 px-4 pt-2">
        <GlassCard className="p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-crimson-light to-crimson text-white">
              <ShieldCheck size={20} />
            </span>
            <div className="flex-1">
              <p className="font-semibold txt-primary">PIN lock</p>
              <p className="text-xs txt-secondary">Require a 4–6 digit PIN to open the app</p>
            </div>
            <Toggle checked={enabled} onChange={onToggle} label="PIN lock" />
          </div>
        </GlassCard>

        {enabled && (
          <GlassButton variant="secondary" full onClick={() => setSettingFlow('change')}>
            Change PIN
          </GlassButton>
        )}

        <GlassCard className="p-4">
          <p className="text-xs txt-secondary">
            The PIN is hashed with SHA-256 and stored only on this device. There is no recovery — if
            you forget it you can wipe the app data from the unlock screen to start over. This lock
            protects casual access; it is not full device encryption.
          </p>
        </GlassCard>
      </div>

      {setting && (
        <PinLock
          mode="set"
          title={setting === 'change' ? 'Set a new PIN' : undefined}
          onSuccess={onPinSet}
          onForgot={() => setSettingFlow(null)}
        />
      )}
      {setting && (
        <button
          onClick={() => setSettingFlow(null)}
          className="fixed bottom-8 left-1/2 z-[101] -translate-x-1/2 text-sm txt-secondary underline"
        >
          Cancel
        </button>
      )}
    </div>
  )
}

export default SecurityPage
