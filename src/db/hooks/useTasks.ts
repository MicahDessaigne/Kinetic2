import { useLiveQuery } from 'dexie-react-hooks'
import { db, type Task, type TaskSubtask, type RepeatRule } from '../database'
import { todayKey, toKey, fromKey } from '../../utils/dateHelpers'
import { addDays, addMonths, nextMonday } from 'date-fns'

export type TaskView = 'today' | 'scheduled' | 'all' | 'done'

export function useTasks(view: TaskView) {
  return useLiveQuery(async () => {
    const all = await db.tasks.orderBy('created_at').toArray()
    const today = todayKey()
    let filtered: Task[]
    switch (view) {
      case 'today':
        filtered = all.filter(
          (t) => !t.completed && t.due_date != null && t.due_date <= today,
        )
        break
      case 'scheduled':
        filtered = all.filter((t) => !t.completed && t.due_date != null && t.due_date > today)
        break
      case 'done':
        filtered = all.filter((t) => t.completed)
        break
      case 'all':
      default:
        filtered = all.filter((t) => !t.completed)
        break
    }
    return sortTasks(filtered)
  }, [view])
}

function sortTasks(tasks: Task[]): Task[] {
  return tasks.sort((a, b) => {
    // completed last
    if (a.completed !== b.completed) return a.completed - b.completed
    // by due date (nulls last)
    const ad = a.due_date ?? '9999-99-99'
    const bd = b.due_date ?? '9999-99-99'
    if (ad !== bd) return ad.localeCompare(bd)
    // higher priority first
    if (a.priority !== b.priority) return b.priority - a.priority
    return a.created_at - b.created_at
  })
}

export function useTask(id: number | undefined) {
  return useLiveQuery(async () => {
    if (id == null) return undefined
    return db.tasks.get(id)
  }, [id])
}

export function useSubtasks(taskId: number | undefined) {
  return useLiveQuery(async () => {
    if (taskId == null) return []
    const subs = await db.task_subtasks.where('task_id').equals(taskId).toArray()
    return subs.sort((a, b) => a.sort_order - b.sort_order)
  }, [taskId])
}

export function useTasksForDate(date: string) {
  return useLiveQuery(async () => {
    return db.tasks.where('due_date').equals(date).toArray()
  }, [date])
}

export function useTaskCounts() {
  return useLiveQuery(async () => {
    const all = await db.tasks.toArray()
    const today = todayKey()
    return {
      today: all.filter((t) => !t.completed && t.due_date != null && t.due_date <= today).length,
      scheduled: all.filter((t) => !t.completed && t.due_date != null && t.due_date > today)
        .length,
      all: all.filter((t) => !t.completed).length,
      done: all.filter((t) => t.completed).length,
    }
  }, [])
}

// ---- CRUD ----
export async function createTask(
  data: Partial<Task> & Pick<Task, 'title'>,
): Promise<number> {
  return db.tasks.add({
    title: data.title,
    notes: data.notes ?? '',
    due_date: data.due_date ?? null,
    due_time: data.due_time ?? null,
    priority: data.priority ?? 0,
    repeat_rule: data.repeat_rule ?? 'none',
    completed: 0,
    completed_at: null,
    list_category: data.list_category ?? 'Inbox',
    created_at: Date.now(),
  })
}

export async function updateTask(id: number, changes: Partial<Task>): Promise<void> {
  await db.tasks.update(id, changes)
}

export async function deleteTask(id: number): Promise<void> {
  await db.transaction('rw', db.tasks, db.task_subtasks, async () => {
    await db.task_subtasks.where('task_id').equals(id).delete()
    await db.tasks.delete(id)
  })
}

/** Compute the next due date for a repeating task. */
export function nextDueDate(dueDate: string, rule: RepeatRule): string | null {
  if (rule === 'none') return null
  const d = fromKey(dueDate)
  switch (rule) {
    case 'daily':
      return toKey(addDays(d, 1))
    case 'weekly':
      return toKey(addDays(d, 7))
    case 'monthly':
      return toKey(addMonths(d, 1))
    case 'weekdays': {
      const day = d.getDay()
      // next weekday Mon-Fri
      if (day >= 1 && day <= 4) return toKey(addDays(d, 1)) // Mon-Thu -> next day
      return toKey(nextMonday(d)) // Fri/Sat/Sun -> Monday
    }
    default:
      return null
  }
}

/**
 * Toggle a task's completion. When completing a repeating task, spawn the next
 * instance automatically.
 */
export async function toggleTask(id: number): Promise<void> {
  const task = await db.tasks.get(id)
  if (!task) return
  const nowCompleted = !task.completed
  await db.tasks.update(id, {
    completed: nowCompleted ? 1 : 0,
    completed_at: nowCompleted ? Date.now() : null,
  })
  if (nowCompleted && task.repeat_rule !== 'none' && task.due_date) {
    const next = nextDueDate(task.due_date, task.repeat_rule)
    if (next) {
      await db.tasks.add({
        title: task.title,
        notes: task.notes,
        due_date: next,
        due_time: task.due_time,
        priority: task.priority,
        repeat_rule: task.repeat_rule,
        completed: 0,
        completed_at: null,
        list_category: task.list_category,
        created_at: Date.now(),
      })
    }
  }
}

// ---- Subtasks ----
export async function addSubtask(taskId: number, title: string): Promise<number> {
  const count = await db.task_subtasks.where('task_id').equals(taskId).count()
  return db.task_subtasks.add({
    task_id: taskId,
    title,
    completed: 0,
    sort_order: count,
  } as TaskSubtask)
}

export async function toggleSubtask(id: number): Promise<void> {
  const sub = await db.task_subtasks.get(id)
  if (!sub) return
  await db.task_subtasks.update(id, { completed: sub.completed ? 0 : 1 })
}

export async function updateSubtask(id: number, changes: Partial<TaskSubtask>): Promise<void> {
  await db.task_subtasks.update(id, changes)
}

export async function deleteSubtask(id: number): Promise<void> {
  await db.task_subtasks.delete(id)
}
