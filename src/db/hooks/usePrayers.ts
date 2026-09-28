import { useLiveQuery } from 'dexie-react-hooks'
import { db, type Prayer, type PrayerStatus } from '../database'
import { todayKey } from '../../utils/dateHelpers'

export function usePrayers(status?: PrayerStatus) {
  return useLiveQuery(async () => {
    const all = await db.prayers.orderBy('created_at').reverse().toArray()
    return status ? all.filter((p) => p.status === status) : all
  }, [status])
}

export function usePrayer(id: number | undefined) {
  return useLiveQuery(async () => {
    if (id == null) return undefined
    return db.prayers.get(id)
  }, [id])
}

export function usePrayerLogs(prayerId: number | undefined) {
  return useLiveQuery(async () => {
    if (prayerId == null) return []
    const logs = await db.prayer_logs.where('prayer_id').equals(prayerId).toArray()
    return logs.sort((a, b) => b.date.localeCompare(a.date))
  }, [prayerId])
}

// ---- CRUD ----
export async function createPrayer(
  data: Partial<Prayer> & Pick<Prayer, 'title'>,
): Promise<number> {
  return db.prayers.add({
    title: data.title,
    category: data.category ?? 'General',
    private_notes: data.private_notes ?? '',
    status: data.status ?? 'active',
    answered_date: data.answered_date ?? null,
    answered_reflection: data.answered_reflection ?? '',
    created_at: Date.now(),
  })
}

export async function updatePrayer(id: number, changes: Partial<Prayer>): Promise<void> {
  await db.prayers.update(id, changes)
}

export async function markAnswered(id: number, reflection: string): Promise<void> {
  await db.prayers.update(id, {
    status: 'answered',
    answered_date: todayKey(),
    answered_reflection: reflection,
  })
}

export async function reactivatePrayer(id: number): Promise<void> {
  await db.prayers.update(id, { status: 'active', answered_date: null })
}

export async function deletePrayer(id: number): Promise<void> {
  await db.transaction('rw', db.prayers, db.prayer_logs, async () => {
    await db.prayer_logs.where('prayer_id').equals(id).delete()
    await db.prayers.delete(id)
  })
}

/** Toggle "prayed today" for a prayer on a specific date. */
export async function togglePrayedOn(prayerId: number, date: string): Promise<void> {
  const existing = await db.prayer_logs
    .where('[prayer_id+date]')
    .equals([prayerId, date])
    .first()
  if (existing?.id != null) {
    await db.prayer_logs.delete(existing.id)
  } else {
    await db.prayer_logs.add({ prayer_id: prayerId, date })
  }
}

export async function hasPrayedOn(prayerId: number, date: string): Promise<boolean> {
  const existing = await db.prayer_logs
    .where('[prayer_id+date]')
    .equals([prayerId, date])
    .first()
  return existing != null
}
