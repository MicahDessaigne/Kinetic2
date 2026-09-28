import { db, getSetting, setSetting } from '../db/database'
import { todayKey } from './dateHelpers'
import { quoteForDay } from './quotes'

export interface ScheduledNotification {
  id: string
  title: string
  body: string
  timestamp: number
  tag: string
}

export function notificationsSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window
}

export function permission(): NotificationPermission {
  if (!notificationsSupported()) return 'denied'
  return Notification.permission
}

export async function requestPermission(): Promise<NotificationPermission> {
  if (!notificationsSupported()) return 'denied'
  try {
    return await Notification.requestPermission()
  } catch {
    return 'denied'
  }
}

async function getRegistration(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) return null
  try {
    return (await navigator.serviceWorker.ready) ?? null
  } catch {
    return null
  }
}

/** Show a notification immediately (via SW if available, else Notification API). */
export async function showNow(title: string, body: string, tag = 'lifeos'): Promise<void> {
  if (permission() !== 'granted') return
  const reg = await getRegistration()
  const options: NotificationOptions = {
    body,
    tag,
    icon: './icons/icon-192.png',
    badge: './icons/icon-192.png',
  }
  if (reg) {
    await reg.showNotification(title, options)
  } else if (notificationsSupported()) {
    new Notification(title, options)
  }
}

function nextOccurrence(time: string): number {
  const [h, m] = time.split(':').map(Number)
  const now = new Date()
  const target = new Date()
  target.setHours(h, m, 0, 0)
  if (target.getTime() <= now.getTime()) {
    target.setDate(target.getDate() + 1)
  }
  return target.getTime()
}

/**
 * Recompute and persist the list of pending notifications, then hand it to the
 * service worker so it can fire them while the page/SW is alive. Because static
 * hosts have no push server, delivery is best-effort and depends on the SW being
 * awake (documented for the user in the About Notifications note).
 */
export async function rescheduleAll(): Promise<void> {
  if (permission() !== 'granted') {
    await setSetting('scheduled_notifications', [])
    await postToSW([])
    return
  }

  const [morningOn, morningTime, eveningOn, eveningTime, tasksOn] = await Promise.all([
    getSetting('notif_morning_enabled'),
    getSetting('notif_morning_time'),
    getSetting('notif_evening_enabled'),
    getSetting('notif_evening_time'),
    getSetting('notif_tasks_enabled'),
  ])

  const scheduled: ScheduledNotification[] = []

  if (morningOn) {
    const q = quoteForDay(todayKey())
    scheduled.push({
      id: 'morning',
      title: 'Good morning ☀️',
      body: `"${q.text}" — ${q.author}`,
      timestamp: nextOccurrence(morningTime),
      tag: 'morning',
    })
  }

  if (eveningOn) {
    const incomplete = await countIncompleteHabitsToday()
    if (incomplete > 0) {
      scheduled.push({
        id: 'evening',
        title: 'Evening check-in 🌙',
        body: `You have ${incomplete} habit${incomplete === 1 ? '' : 's'} left today. Finish strong.`,
        timestamp: nextOccurrence(eveningTime),
        tag: 'evening',
      })
    }
  }

  if (tasksOn) {
    const today = todayKey()
    const tasks = await db.tasks
      .where('due_date')
      .equals(today)
      .filter((t) => !t.completed && !!t.due_time)
      .toArray()
    for (const t of tasks) {
      if (!t.due_time) continue
      const [h, m] = t.due_time.split(':').map(Number)
      const ts = new Date()
      ts.setHours(h, m, 0, 0)
      if (ts.getTime() > Date.now()) {
        scheduled.push({
          id: `task-${t.id}`,
          title: 'Task due',
          body: t.title,
          timestamp: ts.getTime(),
          tag: `task-${t.id}`,
        })
      }
    }
  }

  await setSetting('scheduled_notifications', scheduled)
  await postToSW(scheduled)
}

async function countIncompleteHabitsToday(): Promise<number> {
  const today = todayKey()
  const dow = new Date().getDay()
  const habits = (await db.habits.toArray()).filter(
    (h) => !h.archived && (h.frequency.length === 0 || h.frequency.includes(dow)),
  )
  if (habits.length === 0) return 0
  const logs = await db.habit_logs.where('date').equals(today).toArray()
  const logByHabit = new Map(logs.map((l) => [l.habit_id, l]))
  let incomplete = 0
  for (const h of habits) {
    const log = h.id != null ? logByHabit.get(h.id) : undefined
    const target = h.type === 'boolean' ? 1 : h.target_value > 0 ? h.target_value : 1
    if (!log || log.value < target) incomplete++
  }
  return incomplete
}

async function postToSW(scheduled: ScheduledNotification[]): Promise<void> {
  const reg = await getRegistration()
  const target = reg?.active ?? navigator.serviceWorker?.controller
  if (target) {
    target.postMessage({ type: 'SCHEDULE_NOTIFICATIONS', payload: scheduled })
  }
}

/** Cancel all scheduled notifications. */
export async function cancelAll(): Promise<void> {
  await setSetting('scheduled_notifications', [])
  await postToSW([])
}
