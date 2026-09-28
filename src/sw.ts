/// <reference lib="webworker" />
import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching'
import { clientsClaim } from 'workbox-core'

declare const self: ServiceWorkerGlobalScope & typeof globalThis

interface ScheduledNotification {
  id: string
  title: string
  body: string
  timestamp: number
  tag: string
}

// Precache the app shell injected at build time.
precacheAndRoute(self.__WB_MANIFEST || [])
cleanupOutdatedCaches()

self.skipWaiting()
clientsClaim()

// Keep track of pending notification timers so we can reset them.
const timers = new Map<string, ReturnType<typeof setTimeout>>()

function clearTimers() {
  for (const t of timers.values()) clearTimeout(t)
  timers.clear()
}

function scheduleNotifications(list: ScheduledNotification[]) {
  clearTimers()
  const now = Date.now()
  for (const n of list) {
    const delay = n.timestamp - now
    // Fire immediately if it's already due (within the last minute), else schedule.
    if (delay <= 0 && delay > -60_000) {
      void self.registration.showNotification(n.title, buildOptions(n))
      continue
    }
    if (delay <= 0) continue
    // setTimeout only fires while the SW is alive; capped to a safe window.
    const capped = Math.min(delay, 24 * 60 * 60 * 1000)
    const handle = setTimeout(() => {
      void self.registration.showNotification(n.title, buildOptions(n))
      timers.delete(n.id)
    }, capped)
    timers.set(n.id, handle)
  }
}

function buildOptions(n: ScheduledNotification): NotificationOptions {
  return {
    body: n.body,
    tag: n.tag,
    icon: './icons/icon-192.png',
    badge: './icons/icon-192.png',
    data: { url: './' },
  }
}

self.addEventListener('message', (event: ExtendableMessageEvent) => {
  const data = event.data
  if (!data || typeof data !== 'object') return
  if (data.type === 'SCHEDULE_NOTIFICATIONS') {
    scheduleNotifications((data.payload as ScheduledNotification[]) || [])
  } else if (data.type === 'SKIP_WAITING') {
    void self.skipWaiting()
  }
})

self.addEventListener('notificationclick', (event: NotificationEvent) => {
  event.notification.close()
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) return (client as WindowClient).focus()
      }
      return self.clients.openWindow('./')
    }),
  )
})

// Support push if a server ever sends one (no-op on static hosting by default).
self.addEventListener('push', (event: PushEvent) => {
  let payload: { title?: string; body?: string } = {}
  try {
    payload = event.data?.json() ?? {}
  } catch {
    payload = { body: event.data?.text() }
  }
  event.waitUntil(
    self.registration.showNotification(payload.title || 'LifeOS', {
      body: payload.body || '',
      icon: './icons/icon-192.png',
      badge: './icons/icon-192.png',
    }),
  )
})
