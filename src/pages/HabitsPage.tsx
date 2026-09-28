import { useState } from 'react'
import { Plus, Archive } from 'lucide-react'
import PageHeader from '../components/ui/PageHeader'
import HabitRow from '../components/HabitRow'
import HabitDetailModal from './HabitDetailModal'
import { useHabits } from '../db/hooks/useHabits'
import type { Habit } from '../db/database'
import { todayKey } from '../utils/dateHelpers'

export function HabitsPage() {
  const active = useHabits(false) ?? []
  const all = useHabits(true) ?? []
  const archived = all.filter((h) => h.archived)
  const [showArchived, setShowArchived] = useState(false)
  const [editing, setEditing] = useState<Habit | null>(null)
  const [open, setOpen] = useState(false)

  function openHabit(h: Habit | null) {
    setEditing(h)
    setOpen(true)
  }

  return (
    <div className="mx-auto max-w-lg pb-28">
      <PageHeader
        title="Habits"
        subtitle={`${active.length} active`}
        right={
          <button
            onClick={() => openHabit(null)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-crimson-light to-crimson text-white shadow-fab"
            aria-label="New habit"
          >
            <Plus size={22} />
          </button>
        }
      />

      <div className="px-4 pt-2">
        {active.length === 0 ? (
          <div className="mt-16 text-center">
            <p className="txt-secondary">No habits yet.</p>
            <button
              onClick={() => openHabit(null)}
              className="mt-3 rounded-2xl bg-gradient-to-br from-crimson-light to-crimson px-5 py-2.5 font-semibold text-white shadow-fab"
            >
              Create your first habit
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {active.map((h) => (
              <HabitRow key={h.id} habit={h} date={todayKey()} onOpen={openHabit} />
            ))}
          </div>
        )}

        {archived.length > 0 && (
          <div className="mt-6">
            <button
              onClick={() => setShowArchived((v) => !v)}
              className="flex items-center gap-2 px-1 text-sm txt-secondary"
            >
              <Archive size={15} /> Archived ({archived.length})
            </button>
            {showArchived && (
              <div className="mt-2 space-y-2 opacity-70">
                {archived.map((h) => (
                  <HabitRow key={h.id} habit={h} date={todayKey()} onOpen={openHabit} readOnly />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <HabitDetailModal open={open} onClose={() => setOpen(false)} habit={editing} />
    </div>
  )
}

export default HabitsPage
