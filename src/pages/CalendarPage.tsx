import { useMemo, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import PageHeader from '../components/ui/PageHeader'
import DayInspector from './DayInspector'
import { db } from '../db/database'
import {
  monthGrid,
  monthLabel,
  weekKeys,
  isInMonth,
  dayNumber,
  todayKey,
  WEEKDAY_LABELS_SHORT,
  isFutureKey,
} from '../utils/dateHelpers'

type Mode = 'month' | 'week'

export function CalendarPage() {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const [mode, setMode] = useState<Mode>('month')
  const [selected, setSelected] = useState<string | null>(null)
  const [open, setOpen] = useState(false)

  const grid = useMemo(() => monthGrid(year, month), [year, month])
  const week = useMemo(() => weekKeys(now), [])
  const days = mode === 'month' ? grid : week

  // Load activity markers for the visible range.
  const rangeStart = days[0]
  const rangeEnd = days[days.length - 1]

  const habitLogs = useLiveQuery(
    () => db.habit_logs.where('date').between(rangeStart, rangeEnd, true, true).toArray(),
    [rangeStart, rangeEnd],
  ) ?? []
  const tasks = useLiveQuery(
    () =>
      db.tasks
        .where('due_date')
        .between(rangeStart, rangeEnd, true, true)
        .toArray(),
    [rangeStart, rangeEnd],
  ) ?? []
  const prayerLogs = useLiveQuery(
    () => db.prayer_logs.where('date').between(rangeStart, rangeEnd, true, true).toArray(),
    [rangeStart, rangeEnd],
  ) ?? []

  const activity = useMemo(() => {
    const map = new Map<string, { habit: boolean; task: boolean; prayer: boolean }>()
    const ensure = (d: string) => {
      if (!map.has(d)) map.set(d, { habit: false, task: false, prayer: false })
      return map.get(d)!
    }
    for (const l of habitLogs) ensure(l.date).habit = true
    for (const t of tasks) if (t.due_date) ensure(t.due_date).task = true
    for (const p of prayerLogs) ensure(p.date).prayer = true
    return map
  }, [habitLogs, tasks, prayerLogs])

  function prevMonth() {
    if (month === 0) {
      setMonth(11)
      setYear((y) => y - 1)
    } else setMonth((m) => m - 1)
  }
  function nextMonth() {
    if (month === 11) {
      setMonth(0)
      setYear((y) => y + 1)
    } else setMonth((m) => m + 1)
  }

  function selectDay(d: string) {
    setSelected(d)
    setOpen(true)
  }

  const today = todayKey()

  return (
    <div className="mx-auto max-w-lg pb-28">
      <PageHeader title="Calendar" />

      <div className="px-4">
        {/* Mode switch */}
        <div className="mb-3 flex gap-2">
          {(['month', 'week'] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className="flex-1 rounded-full py-2 text-sm font-semibold capitalize transition-colors"
              style={{
                background: mode === m ? 'var(--accent-light)' : 'rgba(255,255,255,0.06)',
                color: mode === m ? '#fff' : 'var(--text-secondary)',
              }}
            >
              {m}
            </button>
          ))}
        </div>

        {mode === 'month' && (
          <div className="mb-3 flex items-center justify-between">
            <button onClick={prevMonth} className="flex h-9 w-9 items-center justify-center rounded-full bg-white/6 txt-primary">
              <ChevronLeft size={18} />
            </button>
            <h2 className="text-base font-semibold txt-primary">{monthLabel(year, month)}</h2>
            <button onClick={nextMonth} className="flex h-9 w-9 items-center justify-center rounded-full bg-white/6 txt-primary">
              <ChevronRight size={18} />
            </button>
          </div>
        )}

        {/* Weekday header */}
        <div className="mb-1 grid grid-cols-7 gap-1">
          {WEEKDAY_LABELS_SHORT.map((l, i) => (
            <div key={i} className="text-center text-xs font-semibold txt-secondary">
              {l}
            </div>
          ))}
        </div>

        {/* Grid */}
        <div className={`grid grid-cols-7 gap-1 ${mode === 'week' ? '' : ''}`}>
          {days.map((d) => {
            const inMonth = mode === 'week' ? true : isInMonth(d, year, month)
            const act = activity.get(d)
            const isToday = d === today
            const future = isFutureKey(d)
            return (
              <button
                key={d}
                onClick={() => selectDay(d)}
                className="relative flex aspect-square flex-col items-center justify-center rounded-xl transition-colors"
                style={{
                  background: isToday ? 'rgba(147,26,37,0.22)' : 'rgba(255,255,255,0.03)',
                  opacity: inMonth ? (future ? 0.55 : 1) : 0.28,
                  border: isToday ? '1px solid var(--accent-light)' : '1px solid transparent',
                }}
              >
                <span className={`text-sm ${isToday ? 'font-bold' : ''} txt-primary`}>
                  {dayNumber(d)}
                </span>
                <span className="mt-1 flex h-1.5 items-center gap-0.5">
                  {act?.habit && <Dot color="#931A25" />}
                  {act?.task && <Dot color="#3B4E6B" />}
                  {act?.prayer && <Dot color="#C9A15E" />}
                </span>
              </button>
            )
          })}
        </div>

        {/* Legend */}
        <div className="mt-4 flex items-center justify-center gap-4 text-xs txt-secondary">
          <Legend color="#931A25" label="Habits" />
          <Legend color="#3B4E6B" label="Tasks" />
          <Legend color="#C9A15E" label="Prayer" />
        </div>
      </div>

      <DayInspector open={open} onClose={() => setOpen(false)} date={selected} />
    </div>
  )
}

function Dot({ color }: { color: string }) {
  return <span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <Dot color={color} /> {label}
    </span>
  )
}

export default CalendarPage
