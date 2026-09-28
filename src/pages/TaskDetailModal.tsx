import { useEffect, useState } from 'react'
import { Trash2, Plus, Check, X } from 'lucide-react'
import Modal from '../components/ui/Modal'
import { Field, TextInput, TextArea, Select } from '../components/ui/Field'
import GlassButton from '../components/ui/GlassButton'
import { PRIORITY_META } from '../components/ui/Badge'
import {
  createTask,
  updateTask,
  deleteTask,
  useSubtasks,
  addSubtask,
  toggleSubtask,
  deleteSubtask,
} from '../db/hooks/useTasks'
import type { Task, RepeatRule } from '../db/database'
import { todayKey } from '../utils/dateHelpers'

interface Props {
  open: boolean
  onClose: () => void
  task: Task | null
  defaultDate?: string | null
}

const REPEATS: { value: RepeatRule; label: string }[] = [
  { value: 'none', label: 'Never' },
  { value: 'daily', label: 'Every day' },
  { value: 'weekdays', label: 'Weekdays (Mon–Fri)' },
  { value: 'weekly', label: 'Every week' },
  { value: 'monthly', label: 'Every month' },
]

export function TaskDetailModal({ open, onClose, task, defaultDate }: Props) {
  const isEdit = !!task
  const [title, setTitle] = useState('')
  const [notes, setNotes] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [dueTime, setDueTime] = useState('')
  const [priority, setPriority] = useState(0)
  const [repeat, setRepeat] = useState<RepeatRule>('none')
  const [category, setCategory] = useState('Inbox')
  const [newSub, setNewSub] = useState('')
  const [createdId, setCreatedId] = useState<number | null>(null)

  const subtaskParentId = task?.id ?? createdId ?? undefined
  const subtasks = useSubtasks(subtaskParentId) ?? []

  useEffect(() => {
    if (open) {
      setTitle(task?.title ?? '')
      setNotes(task?.notes ?? '')
      setDueDate(task?.due_date ?? defaultDate ?? '')
      setDueTime(task?.due_time ?? '')
      setPriority(task?.priority ?? 0)
      setRepeat(task?.repeat_rule ?? 'none')
      setCategory(task?.list_category ?? 'Inbox')
      setCreatedId(null)
      setNewSub('')
    }
  }, [open, task, defaultDate])

  async function ensureTaskId(): Promise<number> {
    if (task?.id != null) return task.id
    if (createdId != null) return createdId
    const id = await createTask({ title: title.trim() || 'Untitled', due_date: dueDate || null })
    setCreatedId(id)
    return id
  }

  async function save() {
    if (!title.trim()) return
    const payload = {
      title: title.trim(),
      notes,
      due_date: dueDate || null,
      due_time: dueTime || null,
      priority,
      repeat_rule: repeat,
      list_category: category || 'Inbox',
    }
    if (task?.id != null) {
      await updateTask(task.id, payload)
    } else if (createdId != null) {
      await updateTask(createdId, payload)
    } else {
      await createTask(payload)
    }
    onClose()
  }

  async function remove() {
    const id = task?.id ?? createdId
    if (id != null && confirm('Delete this task?')) {
      await deleteTask(id)
      onClose()
    }
  }

  async function handleAddSub() {
    const t = newSub.trim()
    if (!t) return
    const id = await ensureTaskId()
    await addSubtask(id, t)
    setNewSub('')
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit Task' : 'New Task'}
      footer={
        <div className="flex gap-3">
          {(isEdit || createdId != null) && (
            <GlassButton variant="ghost" onClick={remove} aria-label="Delete">
              <Trash2 size={18} />
            </GlassButton>
          )}
          <GlassButton variant="primary" full onClick={save}>
            {isEdit ? 'Save Changes' : 'Create Task'}
          </GlassButton>
        </div>
      }
    >
      <Field label="Title">
        <TextInput
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What needs doing?"
          autoFocus={!isEdit}
        />
      </Field>

      <div className="flex gap-3">
        <div className="flex-1">
          <Field label="Due date">
            <TextInput type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </Field>
        </div>
        <div className="flex-1">
          <Field label="Time">
            <TextInput type="time" value={dueTime} onChange={(e) => setDueTime(e.target.value)} />
          </Field>
        </div>
      </div>
      {!dueDate && (
        <button
          onClick={() => setDueDate(todayKey())}
          className="mb-4 -mt-2 text-sm text-crimson-light"
        >
          Set to today
        </button>
      )}

      <Field label="Priority">
        <div className="flex gap-2">
          {PRIORITY_META.map((p, i) => (
            <button
              key={i}
              onClick={() => setPriority(i)}
              className="flex-1 rounded-xl py-2 text-sm font-semibold transition-colors"
              style={{
                background: priority === i ? `${p.color}33` : 'rgba(255,255,255,0.05)',
                color: priority === i ? p.color : 'var(--text-secondary)',
                border: `1px solid ${priority === i ? `${p.color}88` : 'var(--border)'}`,
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
      </Field>

      <Field label="Repeat">
        <Select value={repeat} onChange={(e) => setRepeat(e.target.value as RepeatRule)}>
          {REPEATS.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </Select>
      </Field>

      <Field label="List">
        <TextInput value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Inbox" />
      </Field>

      <Field label="Notes">
        <TextArea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Details..." />
      </Field>

      <div className="mb-2">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide txt-secondary">Subtasks</p>
        <div className="space-y-2">
          {subtasks.map((s) => (
            <div key={s.id} className="flex items-center gap-2">
              <button
                onClick={() => toggleSubtask(s.id!)}
                className="flex h-6 w-6 items-center justify-center rounded-full border-2"
                style={{
                  background: s.completed ? 'var(--accent-light)' : 'transparent',
                  borderColor: s.completed ? 'var(--accent-light)' : 'var(--text-secondary)',
                }}
              >
                {s.completed ? <Check size={14} className="text-white" /> : null}
              </button>
              <span className={`flex-1 text-sm ${s.completed ? 'txt-secondary line-through' : 'txt-primary'}`}>
                {s.title}
              </span>
              <button onClick={() => deleteSubtask(s.id!)} className="txt-secondary">
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
        <div className="mt-2 flex items-center gap-2">
          <TextInput
            value={newSub}
            onChange={(e) => setNewSub(e.target.value)}
            placeholder="Add subtask"
            onKeyDown={(e) => e.key === 'Enter' && handleAddSub()}
          />
          <button
            onClick={handleAddSub}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/8 border border-[var(--border)] txt-primary"
          >
            <Plus size={18} />
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default TaskDetailModal
