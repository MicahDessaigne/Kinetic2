import { create } from 'zustand'

/** Transient state for a running timer habit. */
interface TimerState {
  habitId: number
  date: string
  baseSeconds: number // seconds already persisted for the day
  startedAt: number // epoch ms when the current run started
}

interface HabitStoreState {
  // habitId -> running timer state
  timers: Record<number, TimerState>
  selectedHabitId: number | null
  startTimer: (habitId: number, date: string, baseSeconds: number) => void
  stopTimer: (habitId: number) => number | null // returns total elapsed seconds
  isRunning: (habitId: number) => boolean
  elapsed: (habitId: number, now: number) => number
  setSelectedHabit: (id: number | null) => void
}

export const useHabitStore = create<HabitStoreState>((set, get) => ({
  timers: {},
  selectedHabitId: null,
  startTimer: (habitId, date, baseSeconds) =>
    set((s) => ({
      timers: {
        ...s.timers,
        [habitId]: { habitId, date, baseSeconds, startedAt: Date.now() },
      },
    })),
  stopTimer: (habitId) => {
    const t = get().timers[habitId]
    if (!t) return null
    const total = t.baseSeconds + Math.floor((Date.now() - t.startedAt) / 1000)
    set((s) => {
      const next = { ...s.timers }
      delete next[habitId]
      return { timers: next }
    })
    return total
  },
  isRunning: (habitId) => !!get().timers[habitId],
  elapsed: (habitId, now) => {
    const t = get().timers[habitId]
    if (!t) return 0
    return t.baseSeconds + Math.floor((now - t.startedAt) / 1000)
  },
  setSelectedHabit: (selectedHabitId) => set({ selectedHabitId }),
}))
