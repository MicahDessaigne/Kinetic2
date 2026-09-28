import Dexie, { type Table } from 'dexie'

// ---- Types ----
export type HabitType = 'boolean' | 'quantity' | 'timer'

export interface Habit {
  id?: number
  name: string
  type: HabitType
  target_value: number // for quantity/timer (timer in seconds)
  unit: string
  frequency: number[] // 0=Sun ... 6=Sat
  reminder_time: string | null // 'HH:MM'
  color_tag: string
  archived: number // 0 | 1 (indexable boolean)
  created_at: number
}

export interface HabitLog {
  id?: number
  habit_id: number
  date: string // 'YYYY-MM-DD'
  value: number // boolean: 0/1, quantity: count, timer: seconds
  notes: string
  is_backfilled: number // 0 | 1
  logged_at: number
}

export type RepeatRule = 'none' | 'daily' | 'weekdays' | 'weekly' | 'monthly'

export interface Task {
  id?: number
  title: string
  notes: string
  due_date: string | null // 'YYYY-MM-DD'
  due_time: string | null // 'HH:MM'
  priority: number // 0..3
  repeat_rule: RepeatRule
  completed: number // 0 | 1
  completed_at: number | null
  list_category: string
  created_at: number
}

export interface TaskSubtask {
  id?: number
  task_id: number
  title: string
  completed: number // 0 | 1
  sort_order: number
}

export type PrayerStatus = 'active' | 'answered' | 'archived'

export interface Prayer {
  id?: number
  title: string
  category: string
  private_notes: string
  status: PrayerStatus
  answered_date: string | null
  answered_reflection: string
  created_at: number
}

export interface PrayerLog {
  id?: number
  prayer_id: number
  date: string // 'YYYY-MM-DD'
}

export interface Note {
  id?: number
  title: string
  content: string
  pinned: number // 0 | 1
  updated_at: number
  created_at: number
}

export interface Setting {
  key: string
  value: unknown
}

// ---- Database ----
export class LifeOSDatabase extends Dexie {
  habits!: Table<Habit, number>
  habit_logs!: Table<HabitLog, number>
  tasks!: Table<Task, number>
  task_subtasks!: Table<TaskSubtask, number>
  prayers!: Table<Prayer, number>
  prayer_logs!: Table<PrayerLog, number>
  notes!: Table<Note, number>
  settings!: Table<Setting, string>

  constructor() {
    super('lifeos')
    this.version(1).stores({
      habits: '++id, name, type, archived, created_at',
      habit_logs: '++id, habit_id, date, [habit_id+date], is_backfilled, logged_at',
      tasks: '++id, title, due_date, completed, priority, list_category, created_at',
      task_subtasks: '++id, task_id, sort_order',
      prayers: '++id, title, status, category, created_at',
      prayer_logs: '++id, prayer_id, date, [prayer_id+date]',
      notes: '++id, pinned, updated_at, created_at',
      settings: 'key',
    })
  }
}

export const db = new LifeOSDatabase()

// ---- Settings helpers (typed key/value store) ----
export const DEFAULT_SETTINGS = {
  theme: 'system' as 'light' | 'dark' | 'system',
  lock_enabled: false,
  pin_hash: '' as string,
  notif_morning_enabled: true,
  notif_morning_time: '08:00',
  notif_evening_enabled: true,
  notif_evening_time: '20:30',
  notif_tasks_enabled: true,
  scheduled_notifications: [] as Array<{
    id: string
    title: string
    body: string
    timestamp: number
    tag: string
  }>,
  onboarded: false,
}

export type SettingsShape = typeof DEFAULT_SETTINGS

export async function getSetting<K extends keyof SettingsShape>(
  key: K,
): Promise<SettingsShape[K]> {
  const row = await db.settings.get(key as string)
  if (row === undefined) return DEFAULT_SETTINGS[key]
  return row.value as SettingsShape[K]
}

export async function setSetting<K extends keyof SettingsShape>(
  key: K,
  value: SettingsShape[K],
): Promise<void> {
  await db.settings.put({ key: key as string, value })
}

export async function wipeAllData(): Promise<void> {
  await db.transaction(
    'rw',
    [
      db.habits,
      db.habit_logs,
      db.tasks,
      db.task_subtasks,
      db.prayers,
      db.prayer_logs,
      db.notes,
      db.settings,
    ],
    async () => {
      await Promise.all([
        db.habits.clear(),
        db.habit_logs.clear(),
        db.tasks.clear(),
        db.task_subtasks.clear(),
        db.prayers.clear(),
        db.prayer_logs.clear(),
        db.notes.clear(),
        db.settings.clear(),
      ])
    },
  )
}
