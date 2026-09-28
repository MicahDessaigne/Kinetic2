import { useLiveQuery } from 'dexie-react-hooks'
import { Check, HandHeart } from 'lucide-react'
import Modal from '../components/ui/Modal'
import HabitRow from '../components/HabitRow'
import Badge from '../components/ui/Badge'
import { db } from '../db/database'
import { toggleTask } from '../db/hooks/useTasks'
import { togglePrayedOn } from '../db/hooks/usePrayers'
import { prettyDate, isFutureKey, dowFromKey, prettyTime } from '../utils/dateHelpers'

interface Props {
  open: boolean
  onClose: () => void
  date: string | null
}

export function DayInspector({ open, onClose, date }: Props) {
  const isFuture = date ? isFutureKey(date) : false
  const dow = date ? dowFromKey(date) : 0

  const habits = useLiveQuery(async () => {
    if (!date) return []
    const all = await db.habits.toArray()
    return all.filter((h) => !h.archived && (h.frequency.length === 0 || h.frequency.includes(dow)))
  }, [date, dow]) ?? []

  const tasks = useLiveQuery(async () => {
    if (!date) return []
    return db.tasks.where('due_date').equals(date).toArray()
  }, [date]) ?? []

  const prayers = useLiveQuery(async () => {
    if (!date) return []
    return db.prayers.where('status').equals('active').toArray()
  }, [date]) ?? []

  const prayerLogs = useLiveQuery(async () => {
    if (!date) return []
    return db.prayer_logs.where('date').equals(date).toArray()
  }, [date]) ?? []
  const prayedIds = new Set(prayerLogs.map((l) => l.prayer_id))

  if (!date) return null

  return (
    <Modal open={open} onClose={onClose} title={prettyDate(date)}>
      {isFuture && (
        <div className="mb-4">
          <Badge color="#B8860B">Future date — habits &amp; prayers are read-only</Badge>
        </div>
      )}

      <Section title="Habits">
        {habits.length === 0 ? (
          <Empty text="No habits scheduled." />
        ) : (
          <div className="space-y-2">
            {habits.map((h) => (
              <HabitRow key={h.id} habit={h} date={date} readOnly={isFuture} />
            ))}
          </div>
        )}
      </Section>

      <Section title="Tasks">
        {tasks.length === 0 ? (
          <Empty text="No tasks due." />
        ) : (
          <div className="space-y-2">
            {tasks.map((t) => (
              <div key={t.id} className="glass-card flex items-center gap-3 rounded-2xl px-4 py-3">
                <button
                  onClick={() => toggleTask(t.id!)}
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2"
                  style={{
                    background: t.completed ? 'var(--accent-light)' : 'transparent',
                    borderColor: t.completed ? 'var(--accent-light)' : 'var(--text-secondary)',
                  }}
                >
                  {t.completed ? <Check size={14} className="text-white" /> : null}
                </button>
                <div className="min-w-0 flex-1">
                  <p className={`truncate ${t.completed ? 'txt-secondary line-through' : 'txt-primary'}`}>
                    {t.title}
                  </p>
                  {t.due_time && <p className="text-xs txt-secondary">{prettyTime(t.due_time)}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>

      <Section title="Prayers">
        {prayers.length === 0 ? (
          <Empty text="No active prayers." />
        ) : (
          <div className="space-y-2">
            {prayers.map((p) => {
              const prayed = p.id != null && prayedIds.has(p.id)
              return (
                <div key={p.id} className="glass-card flex items-center gap-3 rounded-2xl px-4 py-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[rgba(122,92,46,0.25)] text-[#C9A15E]">
                    <HandHeart size={16} />
                  </span>
                  <p className="min-w-0 flex-1 truncate txt-primary">{p.title}</p>
                  <button
                    disabled={isFuture}
                    onClick={() => p.id != null && togglePrayedOn(p.id, date)}
                    className="rounded-full px-3 py-1.5 text-xs font-semibold disabled:opacity-40"
                    style={{
                      background: prayed ? 'var(--accent-light)' : 'rgba(255,255,255,0.08)',
                      color: prayed ? '#fff' : 'var(--text-secondary)',
                    }}
                  >
                    {prayed ? 'Prayed' : 'Mark prayed'}
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </Section>
    </Modal>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-5">
      <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide txt-secondary">{title}</h3>
      {children}
    </section>
  )
}

function Empty({ text }: { text: string }) {
  return <p className="text-sm txt-secondary">{text}</p>
}

export default DayInspector
