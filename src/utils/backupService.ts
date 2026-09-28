import {
  db,
  type Habit,
  type HabitLog,
  type Task,
  type TaskSubtask,
  type Prayer,
  type PrayerLog,
  type Note,
  type Setting,
} from '../db/database'

export interface BackupData {
  app: 'LifeOS'
  version: number
  exported_at: string
  data: {
    habits: Habit[]
    habit_logs: HabitLog[]
    tasks: Task[]
    task_subtasks: TaskSubtask[]
    prayers: Prayer[]
    prayer_logs: PrayerLog[]
    notes: Note[]
    settings: Setting[]
  }
}

const TABLE_KEYS = [
  'habits',
  'habit_logs',
  'tasks',
  'task_subtasks',
  'prayers',
  'prayer_logs',
  'notes',
  'settings',
] as const

export async function exportData(): Promise<BackupData> {
  const [habits, habit_logs, tasks, task_subtasks, prayers, prayer_logs, notes, settings] =
    await Promise.all([
      db.habits.toArray(),
      db.habit_logs.toArray(),
      db.tasks.toArray(),
      db.task_subtasks.toArray(),
      db.prayers.toArray(),
      db.prayer_logs.toArray(),
      db.notes.toArray(),
      db.settings.toArray(),
    ])
  return {
    app: 'LifeOS',
    version: 1,
    exported_at: new Date().toISOString(),
    data: { habits, habit_logs, tasks, task_subtasks, prayers, prayer_logs, notes, settings },
  }
}

/** Trigger a browser download of the current data as JSON. */
export async function downloadBackup(): Promise<void> {
  const payload = await exportData()
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  const stamp = new Date().toISOString().slice(0, 10)
  a.href = url
  a.download = `lifeos-backup-${stamp}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export function validateBackup(parsed: unknown): parsed is BackupData {
  if (!parsed || typeof parsed !== 'object') return false
  const obj = parsed as Record<string, unknown>
  if (obj.app !== 'LifeOS') return false
  if (typeof obj.data !== 'object' || obj.data === null) return false
  const data = obj.data as Record<string, unknown>
  for (const key of TABLE_KEYS) {
    if (!Array.isArray(data[key])) return false
  }
  return true
}

export type ImportMode = 'replace' | 'merge'

/**
 * Import backup data. In 'replace' mode all existing data is wiped first. In
 * 'merge' mode, records are added (ids are dropped so they get fresh keys).
 */
export async function importData(backup: BackupData, mode: ImportMode = 'replace'): Promise<void> {
  const d = backup.data
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
      if (mode === 'replace') {
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
        await Promise.all([
          db.habits.bulkAdd(d.habits),
          db.habit_logs.bulkAdd(d.habit_logs),
          db.tasks.bulkAdd(d.tasks),
          db.task_subtasks.bulkAdd(d.task_subtasks),
          db.prayers.bulkAdd(d.prayers),
          db.prayer_logs.bulkAdd(d.prayer_logs),
          db.notes.bulkAdd(d.notes),
          db.settings.bulkPut(d.settings),
        ])
      } else {
        const strip = <T extends { id?: number }>(rows: T[]) =>
          rows.map(({ id, ...rest }) => rest as T)
        await Promise.all([
          db.habits.bulkAdd(strip(d.habits)),
          db.habit_logs.bulkAdd(strip(d.habit_logs)),
          db.tasks.bulkAdd(strip(d.tasks)),
          db.task_subtasks.bulkAdd(strip(d.task_subtasks)),
          db.prayers.bulkAdd(strip(d.prayers)),
          db.prayer_logs.bulkAdd(strip(d.prayer_logs)),
          db.notes.bulkAdd(strip(d.notes)),
          db.settings.bulkPut(d.settings),
        ])
      }
    },
  )
}

/** Read a File and import it. Returns a human-readable result message. */
export async function importFromFile(file: File, mode: ImportMode = 'replace'): Promise<string> {
  const text = await file.text()
  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  } catch {
    throw new Error('File is not valid JSON.')
  }
  if (!validateBackup(parsed)) {
    throw new Error('This does not look like a LifeOS backup file.')
  }
  await importData(parsed, mode)
  const counts = parsed.data
  const total =
    counts.habits.length +
    counts.tasks.length +
    counts.prayers.length +
    counts.notes.length
  return `Imported ${total} top-level records successfully.`
}
