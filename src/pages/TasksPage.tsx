import { useState } from 'react'
import { Plus, Check, Repeat as RepeatIcon, ChevronRight } from 'lucide-react'
import { motion } from 'framer-motion'
import PageHeader from '../components/ui/PageHeader'
import { PriorityBadge } from '../components/ui/Badge'
import TaskDetailModal from './TaskDetailModal'
import { useTasks, useTaskCounts, toggleTask, type TaskView } from '../db/hooks/useTasks'
import { useTaskStore } from '../stores/taskStore'
import type { Task } from '../db/database'
import { prettyDateShort, prettyTime, todayKey } from '../utils/dateHelpers'

const VIEWS: { key: TaskView; label: string }[] = [
  { key: 'today', label: 'Today' },
  { key: 'scheduled', label: 'Scheduled' },
  { key: 'all', label: 'All' },
  { key: 'done', label: 'Done' },
]

export function TasksPage() {
  const { view, setView } = useTaskStore()
  const tasks = useTasks(view) ?? []
  const counts = useTaskCounts()
  const [editing, setEditing] = useState<Task | null>(null)
  const [open, setOpen] = useState(false)

  function openTask(t: Task | null) {
    setEditing(t)
    setOpen(true)
  }

  return (
    <div className="mx-auto max-w-lg pb-28">
      <PageHeader
        title="Tasks"
        right={
          <button
            onClick={() => openTask(null)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-crimson-light to-crimson text-white shadow-fab"
            aria-label="New task"
          >
            <Plus size={22} />
          </button>
        }
      />

      {/* Segmented view control */}
      <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 pb-3 pt-1">
        {VIEWS.map((v) => {
          const active = view === v.key
          const count = counts ? counts[v.key] : 0
          return (
            <button
              key={v.key}
              onClick={() => setView(v.key)}
              className="flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-colors"
              style={{
                background: active ? 'var(--accent-light)' : 'rgba(255,255,255,0.06)',
                color: active ? '#fff' : 'var(--text-secondary)',
              }}
            >
              {v.label}
              {count > 0 && (
                <span
                  className="rounded-full px-1.5 text-xs"
                  style={{ background: active ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.1)' }}
                >
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      <div className="px-4">
        {tasks.length === 0 ? (
          <p className="mt-16 text-center txt-secondary">
            {view === 'done' ? 'No completed tasks yet.' : 'No tasks here.'}
          </p>
        ) : (
          <div className="space-y-2">
            {tasks.map((t) => (
              <TaskItem key={t.id} task={t} onOpen={openTask} />
            ))}
          </div>
        )}
      </div>

      <TaskDetailModal open={open} onClose={() => setOpen(false)} task={editing} />
    </div>
  )
}

function TaskItem({ task, onOpen }: { task: Task; onOpen: (t: Task) => void }) {
  const overdue = !task.completed && task.due_date != null && task.due_date < todayKey()
  return (
    <div className="glass-card flex items-center gap-3 rounded-2xl px-4 py-3">
      <motion.button
        whileTap={{ scale: 0.85 }}
        onClick={() => toggleTask(task.id!)}
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2"
        style={{
          background: task.completed ? 'var(--accent-light)' : 'transparent',
          borderColor: task.completed ? 'var(--accent-light)' : 'var(--text-secondary)',
        }}
        aria-label="Toggle complete"
      >
        {task.completed ? <Check size={14} className="text-white" /> : null}
      </motion.button>

      <button className="min-w-0 flex-1 text-left" onClick={() => onOpen(task)}>
        <p className={`truncate font-medium ${task.completed ? 'txt-secondary line-through' : 'txt-primary'}`}>
          {task.title}
        </p>
        <div className="mt-0.5 flex items-center gap-2 text-xs txt-secondary">
          {task.due_date && (
            <span style={{ color: overdue ? '#E06A6A' : undefined }}>
              {prettyDateShort(task.due_date)}
              {task.due_time ? ` · ${prettyTime(task.due_time)}` : ''}
            </span>
          )}
          {task.repeat_rule !== 'none' && <RepeatIcon size={12} />}
          <PriorityBadge priority={task.priority} />
        </div>
      </button>
      <ChevronRight size={18} className="txt-secondary" />
    </div>
  )
}

export default TasksPage
