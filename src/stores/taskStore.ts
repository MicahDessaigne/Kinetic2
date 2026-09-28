import { create } from 'zustand'
import type { TaskView } from '../db/hooks/useTasks'

interface TaskStoreState {
  view: TaskView
  selectedTaskId: number | null
  setView: (v: TaskView) => void
  setSelectedTask: (id: number | null) => void
}

export const useTaskStore = create<TaskStoreState>((set) => ({
  view: 'today',
  selectedTaskId: null,
  setView: (view) => set({ view }),
  setSelectedTask: (selectedTaskId) => set({ selectedTaskId }),
}))
