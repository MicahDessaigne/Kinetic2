import { useEffect, useState } from 'react'
import { HashRouter, Routes, Route } from 'react-router-dom'
import { db, getSetting } from './db/database'
import { useUIStore } from './stores/uiStore'
import { rescheduleAll } from './utils/notificationService'
import { wipeAllData } from './db/database'

import TabBar from './components/ui/TabBar'
import FAB from './components/ui/FAB'
import QuickCreate from './components/QuickCreate'
import PinLock from './components/ui/PinLock'

import TodayPage from './pages/TodayPage'
import HabitsPage from './pages/HabitsPage'
import TasksPage from './pages/TasksPage'
import CalendarPage from './pages/CalendarPage'
import MorePage from './pages/MorePage'
import PrayerPage from './pages/PrayerPage'
import NotesPage from './pages/NotesPage'
import BackupPage from './pages/BackupPage'
import AppearancePage from './pages/AppearancePage'
import SecurityPage from './pages/SecurityPage'
import NotificationsPage from './pages/NotificationsPage'

function applyTheme(mode: 'light' | 'dark' | 'system') {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  const dark = mode === 'dark' || (mode === 'system' && prefersDark)
  document.documentElement.classList.toggle('light', !dark)
  const meta = document.querySelector('meta[name="theme-color"]')
  if (meta) meta.setAttribute('content', dark ? '#0B0B0E' : '#F6F6F8')
  useUIStore.getState().setResolvedDark(dark)
}

export default function App() {
  const { theme, setTheme, locked, setLocked } = useUIStore()
  const [ready, setReady] = useState(false)
  const [pinHash, setPinHash] = useState('')

  // Initial load: settings, theme, lock state, notifications.
  useEffect(() => {
    let mounted = true
    ;(async () => {
      const [savedTheme, lockEnabled, hash] = await Promise.all([
        getSetting('theme'),
        getSetting('lock_enabled'),
        getSetting('pin_hash'),
      ])
      if (!mounted) return
      setTheme(savedTheme)
      applyTheme(savedTheme)
      setPinHash(hash)
      if (lockEnabled && hash) setLocked(true)
      setReady(true)
      // Reschedule notifications (no-op if permission not granted).
      rescheduleAll().catch(() => {})
    })()
    return () => {
      mounted = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // React to theme changes and system preference changes.
  useEffect(() => {
    applyTheme(theme)
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => theme === 'system' && applyTheme('system')
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [theme])

  // Re-lock when the app returns to the foreground.
  useEffect(() => {
    async function onVisible() {
      if (document.visibilityState !== 'visible') return
      const [lockEnabled, hash] = await Promise.all([
        getSetting('lock_enabled'),
        getSetting('pin_hash'),
      ])
      if (lockEnabled && hash) {
        setPinHash(hash)
        setLocked(true)
      }
      rescheduleAll().catch(() => {})
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [setLocked])

  async function handleForgotPin() {
    if (confirm('Forgot PIN? The only way to regain access is to erase all app data. Continue?')) {
      await wipeAllData()
      setLocked(false)
    }
  }

  if (!ready) {
    return <div className="flex h-full items-center justify-center bg-[var(--bg)]" />
  }

  if (locked) {
    return (
      <PinLock
        mode="verify"
        storedHash={pinHash}
        onSuccess={() => setLocked(false)}
        onForgot={handleForgotPin}
      />
    )
  }

  return (
    <HashRouter>
      <div className="relative z-10 min-h-full">
        <Routes>
          <Route path="/" element={<TodayPage />} />
          <Route path="/habits" element={<HabitsPage />} />
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/more" element={<MorePage />} />
          <Route path="/more/prayer" element={<PrayerPage />} />
          <Route path="/more/notes" element={<NotesPage />} />
          <Route path="/more/notifications" element={<NotificationsPage />} />
          <Route path="/more/security" element={<SecurityPage />} />
          <Route path="/more/backup" element={<BackupPage />} />
          <Route path="/more/appearance" element={<AppearancePage />} />
          <Route path="*" element={<TodayPage />} />
        </Routes>
        <FAB />
        <QuickCreate />
        <TabBar />
      </div>
    </HashRouter>
  )
}

// Touch db import so tree-shaking keeps the singleton initialized early.
void db
