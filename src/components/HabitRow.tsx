import { useEffect, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { Check, Flame } from 'lucide-react'
import { motion } from 'framer-motion'
import { db, type Habit } from '../db/database'
import { getLog, setLog, incrementLog } from '../db/hooks/useHabits'
import { computeStreak } from '../utils/streakEngine'
import { useHabitStore } from '../stores/habitStore'
import NumberStepper from './ui/NumberStepper'
import TimerDisplay from './ui/TimerDisplay'
import Badge from './ui/Badge'
import { todayKey, formatSeconds } from '../utils/dateHelpers'

interface Props {
  habit: Habit
  date?: string
  onOpen?: (habit: Habit) => void
  readOnly?: boolean
}

export function HabitRow({ habit, date = todayKey(), onOpen, readOnly = false }: Props) {
  const habitId = habit.id!
  const log = useLiveQuery(() => getLog(habitId, date), [habitId, date])
  const logs = useLiveQuery(
    () => db.habit_logs.where('habit_id').equals(habitId).toArray(),
    [habitId],
  )
  const streak = logs ? computeStreak(habit, logs) : { currentStreak: 0, bestStreak: 0, totalLogged: 0 }

  const value = log?.value ?? 0
  const target = habit.type === 'boolean' ? 1 : habit.target_value > 0 ? habit.target_value : 1
  const done = value >= target

  const { isRunning, elapsed, startTimer, stopTimer } = useHabitStore()
  const running = isRunning(habitId)
  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    if (!running) return
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [running])

  const timerSeconds = running ? elapsed(habitId, now) : value

  async function toggleBoolean() {
    if (readOnly) return
    await setLog(habitId, date, done ? 0 : 1, { removeIfZero: true })
  }

  async function toggleTimer() {
    if (readOnly) return
    if (running) {
      const total = stopTimer(habitId)
      if (total != null) await setLog(habitId, date, total)
    } else {
      startTimer(habitId, date, value)
    }
  }

  async function resetTimer() {
    if (readOnly) return
    if (running) stopTimer(habitId)
    await setLog(habitId, date, 0, { removeIfZero: true })
  }

  return (
    <div
      className="glass-card flex items-center gap-3 rounded-2xl px-4 py-3"
      style={{ borderLeft: `3px solid ${habit.color_tag}` }}
    >
      <button
        className="min-w-0 flex-1 text-left"
        onClick={() => onOpen?.(habit)}
      >
        <div className="flex items-center gap-2">
          <p className={`truncate font-semibold ${done ? 'txt-secondary line-through' : 'txt-primary'}`}>
            {habit.name}
          </p>
          {streak.currentStreak > 0 && (
            <span className="flex items-center gap-0.5 text-xs" style={{ color: '#E0803A' }}>
              <Flame size={13} /> {streak.currentStreak}
            </span>
          )}
        </div>
        <p className="mt-0.5 text-xs txt-secondary">
          {habit.type === 'boolean' && (done ? 'Completed' : 'Tap to complete')}
          {habit.type === 'quantity' && `${value} / ${habit.target_value} ${habit.unit}`}
          {habit.type === 'timer' && `${formatSeconds(timerSeconds)} / ${formatSeconds(habit.target_value)}`}
          {log?.is_backfilled ? <span className="ml-2"><Badge color="#B8860B">backfilled</Badge></span> : null}
        </p>
      </button>

      {habit.type === 'boolean' && (
        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={toggleBoolean}
          disabled={readOnly}
          className="flex h-9 w-9 items-center justify-center rounded-full border-2 transition-colors disabled:opacity-40"
          style={{
            background: done ? habit.color_tag : 'transparent',
            borderColor: done ? habit.color_tag : 'var(--text-secondary)',
          }}
          aria-label="Toggle"
        >
          {done && <Check size={18} className="text-white" />}
        </motion.button>
      )}

      {habit.type === 'quantity' && (
        <NumberStepper
          value={value}
          onChange={(v) => !readOnly && incrementLog(habitId, date, v - value)}
          min={0}
        />
      )}

      {habit.type === 'timer' && (
        <TimerDisplay
          seconds={timerSeconds}
          targetSeconds={habit.target_value}
          running={running}
          onToggle={toggleTimer}
          onReset={resetTimer}
          compact
        />
      )}
    </div>
  )
}

export default HabitRow
