import { useLiveQuery } from 'dexie-react-hooks'
import { db, type Habit, type HabitLog } from '../database'
import { todayKey } from '../../utils/dateHelpers'

export function useHabits(includeArchived = false) {
  return useLiveQuery(async () => {
    const all = await db.habits.orderBy('created_at').toArray()
    return includeArchived ? all : all.filter((h) => !h.archived)
  }, [includeArchived])
}

export function useHabit(id: number | undefined) {
  return useLiveQuery(async () => {
    if (id == null) return undefined
    return db.habits.get(id)
  }, [id])
}

export function useHabitLogs(habitId: number | undefined) {
  return useLiveQuery(async () => {
    if (habitId == null) return []
    const logs = await db.habit_logs.where('habit_id').equals(habitId).toArray()
    return logs.sort((a, b) => a.date.localeCompare(b.date))
  }, [habitId])
}

/** All logs for a given date across all habits. */
export function useLogsForDate(date: string) {
  return useLiveQuery(async () => {
    return db.habit_logs.where('date').equals(date).toArray()
  }, [date])
}

// ---- CRUD ----
export async function createHabit(
  data: Omit<Habit, 'id' | 'created_at' | 'archived'> & Partial<Pick<Habit, 'archived'>>,
): Promise<number> {
  return db.habits.add({
    archived: 0,
    created_at: Date.now(),
    ...data,
  } as Habit)
}

export async function updateHabit(id: number, changes: Partial<Habit>): Promise<void> {
  await db.habits.update(id, changes)
}

export async function archiveHabit(id: number, archived = true): Promise<void> {
  await db.habits.update(id, { archived: archived ? 1 : 0 })
}

export async function deleteHabit(id: number): Promise<void> {
  await db.transaction('rw', db.habits, db.habit_logs, async () => {
    await db.habit_logs.where('habit_id').equals(id).delete()
    await db.habits.delete(id)
  })
}

/** Get the log for a habit on a date (or undefined). */
export async function getLog(habitId: number, date: string): Promise<HabitLog | undefined> {
  return db.habit_logs.where('[habit_id+date]').equals([habitId, date]).first()
}

/**
 * Upsert a habit log for a date. Marks is_backfilled when the date is not today.
 * Passing value <= 0 for the same date removes the log (used to "un-toggle").
 */
export async function setLog(
  habitId: number,
  date: string,
  value: number,
  opts: { notes?: string; removeIfZero?: boolean } = {},
): Promise<void> {
  const existing = await getLog(habitId, date)
  const backfilled = date !== todayKey() ? 1 : 0
  if (opts.removeIfZero && value <= 0) {
    if (existing?.id != null) await db.habit_logs.delete(existing.id)
    return
  }
  if (existing?.id != null) {
    await db.habit_logs.update(existing.id, {
      value,
      notes: opts.notes ?? existing.notes,
      is_backfilled: existing.is_backfilled || backfilled,
      logged_at: Date.now(),
    })
  } else {
    await db.habit_logs.add({
      habit_id: habitId,
      date,
      value,
      notes: opts.notes ?? '',
      is_backfilled: backfilled,
      logged_at: Date.now(),
    })
  }
}

/** Increment a quantity/timer log by delta (never below 0). */
export async function incrementLog(
  habitId: number,
  date: string,
  delta: number,
): Promise<void> {
  const existing = await getLog(habitId, date)
  const next = Math.max(0, (existing?.value ?? 0) + delta)
  await setLog(habitId, date, next, { removeIfZero: true })
}
