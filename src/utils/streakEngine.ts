import { db, type Habit, type HabitLog } from '../db/database'
import { fromKey, toKey } from './dateHelpers'
import { addDays, differenceInCalendarDays } from 'date-fns'

export interface StreakResult {
  currentStreak: number
  bestStreak: number
  totalLogged: number
}

/**
 * A habit is considered "done" on a given day when a log exists for that date
 * with a positive value:
 *  - boolean: value >= 1
 *  - quantity: value >= target_value (or > 0 if target is 0)
 *  - timer:   value >= target_value seconds (or > 0 if target is 0)
 */
export function isLogComplete(habit: Habit, log: HabitLog | undefined): boolean {
  if (!log) return false
  if (habit.type === 'boolean') return log.value >= 1
  const target = habit.target_value > 0 ? habit.target_value : 1
  return log.value >= target
}

/**
 * Compute streaks for a habit given its logs.
 *
 * Rules:
 *  - A streak counts consecutive *scheduled* days (day-of-week in habit.frequency)
 *    where the habit is complete.
 *  - Days NOT in frequency are skipped entirely — they neither extend nor break
 *    a streak.
 *  - Backfilled entries count normally.
 *  - The current streak is measured backwards from today; if today is a scheduled
 *    day that is not yet complete, it does not break the streak (we look to the
 *    most recent completed scheduled day chain), but an incomplete *past*
 *    scheduled day does break it.
 */
export function computeStreak(habit: Habit, logs: HabitLog[]): StreakResult {
  const completeByDate = new Map<string, boolean>()
  let totalLogged = 0
  for (const log of logs) {
    const done = isLogComplete(habit, log)
    if (done) {
      completeByDate.set(log.date, true)
      totalLogged++
    }
  }

  // Frequency: if empty, treat every day as scheduled.
  const freq = habit.frequency && habit.frequency.length > 0 ? habit.frequency : [0, 1, 2, 3, 4, 5, 6]
  const isScheduled = (d: Date) => freq.includes(d.getDay())

  const created = fromKey(toKey(fromKey(habitCreatedKey(habit))))
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // ---- Best streak: walk from created date to today over scheduled days ----
  let best = 0
  let running = 0
  const totalDays = Math.max(0, differenceInCalendarDays(today, created))
  for (let i = 0; i <= totalDays; i++) {
    const day = addDays(created, i)
    if (!isScheduled(day)) continue
    const done = completeByDate.get(toKey(day)) === true
    if (done) {
      running++
      if (running > best) best = running
    } else {
      running = 0
    }
  }

  // ---- Current streak: walk backwards from today over scheduled days ----
  let current = 0
  let cursor = new Date(today)
  // If today is scheduled but not done yet, don't penalize — start from yesterday.
  if (isScheduled(cursor) && completeByDate.get(toKey(cursor)) !== true) {
    cursor = addDays(cursor, -1)
  }
  // Guard against infinite loops: never look back further than creation.
  while (differenceInCalendarDays(cursor, created) >= 0) {
    if (isScheduled(cursor)) {
      const done = completeByDate.get(toKey(cursor)) === true
      if (done) {
        current++
      } else {
        break
      }
    }
    cursor = addDays(cursor, -1)
  }

  return { currentStreak: current, bestStreak: Math.max(best, current), totalLogged }
}

function habitCreatedKey(habit: Habit): string {
  return toKey(new Date(habit.created_at))
}

/** Convenience: load logs for a habit and compute its streak. */
export async function getHabitStreak(habitId: number): Promise<StreakResult> {
  const habit = await db.habits.get(habitId)
  if (!habit) return { currentStreak: 0, bestStreak: 0, totalLogged: 0 }
  const logs = await db.habit_logs.where('habit_id').equals(habitId).toArray()
  logs.sort((a, b) => a.date.localeCompare(b.date))
  return computeStreak(habit, logs)
}
