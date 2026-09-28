import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, Info } from 'lucide-react'
import PageSubHeader from '../components/ui/PageSubHeader'
import GlassCard from '../components/ui/GlassCard'
import GlassButton from '../components/ui/GlassButton'
import Toggle from '../components/ui/Toggle'
import { TextInput } from '../components/ui/Field'
import { useAllSettings, setSetting } from '../db/hooks/useSettings'
import {
  permission,
  requestPermission,
  rescheduleAll,
  showNow,
  notificationsSupported,
} from '../utils/notificationService'

export function NotificationsPage() {
  const nav = useNavigate()
  const s = useAllSettings()
  const [perm, setPerm] = useState(permission())

  async function ensurePermission() {
    const p = await requestPermission()
    setPerm(p)
    if (p === 'granted') await rescheduleAll()
  }

  async function update<K extends keyof typeof s>(key: K, value: (typeof s)[K]) {
    await setSetting(key, value)
    await rescheduleAll()
  }

  return (
    <div className="mx-auto max-w-lg pb-28">
      <PageSubHeader title="Notifications" onBack={() => nav('/more')} />
      <div className="space-y-4 px-4 pt-2">
        {perm !== 'granted' && (
          <GlassCard className="p-5">
            <div className="mb-3 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-crimson-light to-crimson text-white">
                <Bell size={20} />
              </span>
              <div className="flex-1">
                <p className="font-semibold txt-primary">Enable notifications</p>
                <p className="text-xs txt-secondary">
                  {notificationsSupported()
                    ? perm === 'denied'
                      ? 'Blocked. Enable them in your browser settings.'
                      : 'Grant permission to receive reminders.'
                    : 'Not supported on this browser.'}
                </p>
              </div>
            </div>
            <GlassButton
              variant="primary"
              full
              onClick={ensurePermission}
              disabled={!notificationsSupported() || perm === 'denied'}
            >
              Allow notifications
            </GlassButton>
          </GlassCard>
        )}

        <GlassCard className="divide-y divide-[var(--border)] p-0">
          <Row
            title="Morning motivation"
            desc="A daily quote to start your day"
            checked={s.notif_morning_enabled}
            onToggle={(v) => update('notif_morning_enabled', v)}
            time={s.notif_morning_time}
            onTime={(t) => update('notif_morning_time', t)}
          />
          <Row
            title="Evening habit nudge"
            desc="Reminder if habits are still open"
            checked={s.notif_evening_enabled}
            onToggle={(v) => update('notif_evening_enabled', v)}
            time={s.notif_evening_time}
            onTime={(t) => update('notif_evening_time', t)}
          />
          <Row
            title="Task due reminders"
            desc="Alert at a task's due time"
            checked={s.notif_tasks_enabled}
            onToggle={(v) => update('notif_tasks_enabled', v)}
          />
        </GlassCard>

        {perm === 'granted' && (
          <GlassButton
            variant="secondary"
            full
            onClick={() => showNow('LifeOS test 🔔', 'Notifications are working!', 'test')}
          >
            Send a test notification
          </GlassButton>
        )}

        <GlassCard className="flex items-start gap-3 p-4">
          <Info size={18} className="mt-0.5 txt-secondary" />
          <div className="text-xs txt-secondary">
            <p className="mb-1 font-semibold txt-primary">About notifications</p>
            <p>
              This is a fully offline app with no server, so reminders are scheduled locally by the
              service worker and are delivered on a best-effort basis while your device allows it. On
              iOS, notifications only work when the app has been added to your Home Screen (installed
              as a PWA) on iOS 16.4 or later, and the system may delay or coalesce them to save
              battery. For guaranteed timing, keep the app installed and opened periodically.
            </p>
          </div>
        </GlassCard>
      </div>
    </div>
  )
}

function Row({
  title,
  desc,
  checked,
  onToggle,
  time,
  onTime,
}: {
  title: string
  desc: string
  checked: boolean
  onToggle: (v: boolean) => void
  time?: string
  onTime?: (t: string) => void
}) {
  return (
    <div className="flex items-center gap-3 p-4">
      <div className="flex-1">
        <p className="font-semibold txt-primary">{title}</p>
        <p className="text-xs txt-secondary">{desc}</p>
        {checked && time != null && onTime && (
          <div className="mt-2 w-32">
            <TextInput type="time" value={time} onChange={(e) => onTime(e.target.value)} />
          </div>
        )}
      </div>
      <Toggle checked={checked} onChange={onToggle} label={title} />
    </div>
  )
}

export default NotificationsPage
