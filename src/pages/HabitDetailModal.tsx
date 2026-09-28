import { useEffect, useState } from 'react'
import { Trash2, Archive } from 'lucide-react'
import Modal from '../components/ui/Modal'
import { Field, TextInput, Select } from '../components/ui/Field'
import GlassButton from '../components/ui/GlassButton'
import Badge from '../components/ui/Badge'
import { WEEKDAY_LABELS_SHORT, prettyDateShort } from '../utils/dateHelpers'
import { computeStreak } from '../utils/streakEngine'
import {
  createHabit,
  updateHabit,
  deleteHabit,
  archiveHabit,
  useHabitLogs,
} from '../db/hooks/useHabits'
import type { Habit, HabitType } from '../db/database'

interface Props {
  open: boolean
  onClose: () => void
  habit: Habit | null // null = create mode
}

const COLORS = ['#931A25', '#3B4E6B', '#2E7D5B', '#B8860B', '#6A4C93', '#C05621']

export function HabitDetailModal({ open, onClose, habit }: Props) {
  const isEdit = !!habit
  const [name, setName] = useState('')
  const [type, setType] = useState<HabitType>('boolean')
  const [target, setTarget] = useState(1)
  const [unit, setUnit] = useState('')
  const [freq, setFreq] = useState<number[]>([0, 1, 2, 3, 4, 5, 6])
  const [reminder, setReminder] = useState('')
  const [color, setColor] = useState(COLORS[0])

  const logs = useHabitLogs(habit?.id) ?? []

  useEffect(() => {
    if (open) {
      setName(habit?.name ?? '')
      setType(habit?.type ?? 'boolean')
      setTarget(habit?.target_value ?? (habit?.type === 'timer' ? 1800 : 1))
      setUnit(habit?.unit ?? '')
      setFreq(habit?.frequency ?? [0, 1, 2, 3, 4, 5, 6])
      setReminder(habit?.reminder_time ?? '')
      setColor(habit?.color_tag ?? COLORS[0])
    }
  }, [open, habit])

  const streak = habit ? computeStreak(habit, logs) : null

  function toggleDay(d: number) {
    setFreq((cur) => (cur.includes(d) ? cur.filter((x) => x !== d) : [...cur, d].sort()))
  }

  async function save() {
    if (!name.trim()) return
    const payload = {
      name: name.trim(),
      type,
      target_value: type === 'boolean' ? 1 : target,
      unit: type === 'timer' ? 'min' : unit,
      frequency: freq,
      reminder_time: reminder || null,
      color_tag: color,
    }
    if (isEdit && habit?.id != null) {
      await updateHabit(habit.id, payload)
    } else {
      await createHabit(payload)
    }
    onClose()
  }

  async function remove() {
    if (habit?.id != null && confirm('Delete this habit and all its history?')) {
      await deleteHabit(habit.id)
      onClose()
    }
  }

  // For timer habits target is stored in seconds; edit in minutes.
  const targetDisplay = type === 'timer' ? Math.round(target / 60) : target
  function setTargetDisplay(v: number) {
    setTarget(type === 'timer' ? v * 60 : v)
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit Habit' : 'New Habit'}
      footer={
        <div className="flex gap-3">
          {isEdit && (
            <GlassButton variant="ghost" onClick={remove} aria-label="Delete">
              <Trash2 size={18} />
            </GlassButton>
          )}
          <GlassButton variant="primary" full onClick={save}>
            {isEdit ? 'Save Changes' : 'Create Habit'}
          </GlassButton>
        </div>
      }
    >
      <Field label="Name">
        <TextInput
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Read, Pushups, Meditate"
          autoFocus={!isEdit}
        />
      </Field>

      <Field label="Type">
        <Select value={type} onChange={(e) => setType(e.target.value as HabitType)}>
          <option value="boolean">Yes / No (checkmark)</option>
          <option value="quantity">Quantity (count toward a goal)</option>
          <option value="timer">Timer (minutes)</option>
        </Select>
      </Field>

      {type !== 'boolean' && (
        <div className="flex gap-3">
          <div className="flex-1">
            <Field label={type === 'timer' ? 'Target (minutes)' : 'Target'}>
              <TextInput
                type="number"
                min={1}
                value={targetDisplay}
                onChange={(e) => setTargetDisplay(Math.max(1, Number(e.target.value)))}
              />
            </Field>
          </div>
          {type === 'quantity' && (
            <div className="flex-1">
              <Field label="Unit">
                <TextInput
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  placeholder="reps, pages, glasses"
                />
              </Field>
            </div>
          )}
        </div>
      )}

      <Field label="Repeat on">
        <div className="flex justify-between gap-1">
          {WEEKDAY_LABELS_SHORT.map((lbl, d) => {
            const on = freq.includes(d)
            return (
              <button
                key={d}
                onClick={() => toggleDay(d)}
                className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold transition-colors"
                style={{
                  background: on ? 'var(--accent-light)' : 'rgba(255,255,255,0.06)',
                  color: on ? '#fff' : 'var(--text-secondary)',
                }}
              >
                {lbl}
              </button>
            )
          })}
        </div>
      </Field>

      <Field label="Reminder time (optional)">
        <TextInput type="time" value={reminder} onChange={(e) => setReminder(e.target.value)} />
      </Field>

      <Field label="Color">
        <div className="flex gap-3">
          {COLORS.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className="h-9 w-9 rounded-full border-2 transition-transform"
              style={{
                background: c,
                borderColor: color === c ? '#fff' : 'transparent',
                transform: color === c ? 'scale(1.1)' : 'scale(1)',
              }}
            />
          ))}
        </div>
      </Field>

      {isEdit && streak && (
        <div className="mt-2 rounded-2xl bg-black/20 p-4">
          <div className="mb-3 flex justify-between text-center">
            <Stat label="Current" value={`${streak.currentStreak}`} />
            <Stat label="Best" value={`${streak.bestStreak}`} />
            <Stat label="Total" value={`${streak.totalLogged}`} />
          </div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide txt-secondary">
            Recent history
          </p>
          <div className="max-h-40 space-y-1.5 overflow-y-auto no-scrollbar">
            {logs.length === 0 && <p className="text-sm txt-secondary">No entries yet.</p>}
            {[...logs].reverse().slice(0, 30).map((l) => (
              <div key={l.id} className="flex items-center justify-between text-sm">
                <span className="txt-primary">{prettyDateShort(l.date)}</span>
                <span className="flex items-center gap-2 txt-secondary">
                  {habit?.type === 'timer'
                    ? `${Math.round(l.value / 60)} min`
                    : habit?.type === 'quantity'
                      ? `${l.value} ${habit.unit}`
                      : 'Done'}
                  {l.is_backfilled ? <Badge color="#B8860B">backfilled</Badge> : null}
                </span>
              </div>
            ))}
          </div>
          {habit?.id != null && (
            <button
              onClick={() => archiveHabit(habit.id!, !habit.archived).then(onClose)}
              className="mt-3 flex items-center gap-2 text-sm txt-secondary"
            >
              <Archive size={15} /> {habit.archived ? 'Unarchive' : 'Archive'} habit
            </button>
          )}
        </div>
      )}
    </Modal>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex-1">
      <p className="text-2xl font-bold txt-primary">{value}</p>
      <p className="text-[11px] uppercase tracking-wide txt-secondary">{label}</p>
    </div>
  )
}

export default HabitDetailModal
