import { useMemo, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { RefreshCw, Send, HandHeart } from 'lucide-react'
import { motion } from 'framer-motion'
import { db, type Habit } from '../db/database'
import { useHabits } from '../db/hooks/useHabits'
import { useTasks, toggleTask } from '../db/hooks/useTasks'
import { usePrayers } from '../db/hooks/usePrayers'
import { createNote } from '../db/hooks/useNotes'
import HabitRow from '../components/HabitRow'
import HabitDetailModal from './HabitDetailModal'
import ProgressRing from '../components/ui/ProgressRing'
import GlassCard from '../components/ui/GlassCard'
import { PriorityBadge } from '../components/ui/Badge'
import { TextInput } from '../components/ui/Field'
import { greeting, todayKey, prettyDate, prettyTime } from '../utils/dateHelpers'
import { quoteForDay, randomQuote, type Quote } from '../utils/quotes'

export function TodayPage() {
  const today = todayKey()
  const dow = new Date().getDay()
  const allHabits = useHabits() ?? []
  const todaysHabits = useMemo(
    () => allHabits.filter((h) => h.frequency.length === 0 || h.frequency.includes(dow)),
    [allHabits, dow],
  )
  const dueTasks = useTasks('today') ?? []
  const activePrayers = usePrayers('active') ?? []

  const todaysLogs = useLiveQuery(() => db.habit_logs.where('date').equals(today).toArray(), [today]) ?? []

  const completedCount = useMemo(() => {
    let c = 0
    for (const h of todaysHabits) {
      const log = todaysLogs.find((l) => l.habit_id === h.id)
      const target = h.type === 'boolean' ? 1 : h.target_value > 0 ? h.target_value : 1
      if (log && log.value >= target) c++
    }
    return c
  }, [todaysHabits, todaysLogs])

  const progress = todaysHabits.length ? completedCount / todaysHabits.length : 0

  const [quote, setQuote] = useState<Quote>(() => quoteForDay(today))
  const [editing, setEditing] = useState<Habit | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [quickNote, setQuickNote] = useState('')

  function openHabit(h: Habit) {
    setEditing(h)
    setModalOpen(true)
  }

  async function saveQuickNote() {
    const text = quickNote.trim()
    if (!text) return
    await createNote({ title: text.slice(0, 40), content: text })
    setQuickNote('')
  }

  return (
    <div className="mx-auto max-w-lg px-4 pb-28 safe-area-top pt-6">
      <div className="mb-1 px-1">
        <p className="text-sm txt-secondary">{prettyDate(today)}</p>
        <h1 className="text-[28px] font-bold tracking-tight txt-primary">{greeting()}</h1>
      </div>

      {/* Quote */}
      <GlassCard className="mb-5 mt-3 p-4">
        <button
          className="flex w-full items-start gap-3 text-left"
          onClick={() => setQuote(randomQuote())}
        >
          <span className="mt-0.5 text-crimson-light">
            <RefreshCw size={16} />
          </span>
          <span>
            <p className="text-[15px] italic leading-snug txt-primary">"{quote.text}"</p>
            <p className="mt-1 text-xs txt-secondary">— {quote.author}</p>
          </span>
        </button>
      </GlassCard>

      {/* Progress ring */}
      <div className="mb-6 flex items-center justify-center gap-6">
        <ProgressRing progress={progress} size={140}>
          <span className="text-3xl font-bold txt-primary">{Math.round(progress * 100)}%</span>
          <span className="text-xs txt-secondary">
            {completedCount}/{todaysHabits.length} habits
          </span>
        </ProgressRing>
      </div>

      {/* Habits */}
      <Section title="Today's Habits" count={todaysHabits.length}>
        {todaysHabits.length === 0 ? (
          <Empty text="No habits scheduled today. Add one with the + button." />
        ) : (
          <div className="space-y-2">
            {todaysHabits.map((h) => (
              <HabitRow key={h.id} habit={h} date={today} onOpen={openHabit} />
            ))}
          </div>
        )}
      </Section>

      {/* Tasks */}
      <Section title="Due Today" count={dueTasks.length}>
        {dueTasks.length === 0 ? (
          <Empty text="Nothing due. Enjoy the calm." />
        ) : (
          <div className="space-y-2">
            {dueTasks.map((t) => (
              <div key={t.id} className="glass-card flex items-center gap-3 rounded-2xl px-4 py-3">
                <motion.button
                  whileTap={{ scale: 0.85 }}
                  onClick={() => toggleTask(t.id!)}
                  className="h-6 w-6 shrink-0 rounded-full border-2 border-[var(--text-secondary)]"
                  aria-label="Complete task"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium txt-primary">{t.title}</p>
                  {t.due_time && <p className="text-xs txt-secondary">{prettyTime(t.due_time)}</p>}
                </div>
                <PriorityBadge priority={t.priority} />
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* Prayer focus */}
      {activePrayers.length > 0 && (
        <Section title="Prayer Focus">
          <GlassCard className="flex items-center gap-3 p-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[rgba(122,92,46,0.25)] text-[#C9A15E]">
              <HandHeart size={20} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium txt-primary">{activePrayers[0].title}</p>
              <p className="text-xs txt-secondary">
                {activePrayers.length} active {activePrayers.length === 1 ? 'prayer' : 'prayers'}
              </p>
            </div>
          </GlassCard>
        </Section>
      )}

      {/* Quick note */}
      <Section title="Quick Note">
        <div className="flex items-center gap-2">
          <TextInput
            value={quickNote}
            onChange={(e) => setQuickNote(e.target.value)}
            placeholder="Jot something down..."
            onKeyDown={(e) => e.key === 'Enter' && saveQuickNote()}
          />
          <button
            onClick={saveQuickNote}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-crimson-light to-crimson text-white"
            aria-label="Save note"
          >
            <Send size={18} />
          </button>
        </div>
      </Section>

      <HabitDetailModal open={modalOpen} onClose={() => setModalOpen(false)} habit={editing} />
    </div>
  )
}

function Section({
  title,
  count,
  children,
}: {
  title: string
  count?: number
  children: React.ReactNode
}) {
  return (
    <section className="mb-6">
      <div className="mb-2 flex items-center gap-2 px-1">
        <h2 className="text-sm font-semibold uppercase tracking-wide txt-secondary">{title}</h2>
        {count != null && count > 0 && (
          <span className="rounded-full bg-white/8 px-2 text-xs txt-secondary">{count}</span>
        )}
      </div>
      {children}
    </section>
  )
}

function Empty({ text }: { text: string }) {
  return <p className="px-1 text-sm txt-secondary">{text}</p>
}

export default TodayPage
