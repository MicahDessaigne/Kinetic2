import { create } from 'zustand'

export type ThemeMode = 'light' | 'dark' | 'system'
export type FabAction = 'habit' | 'task' | 'prayer' | 'note'

interface UIState {
  theme: ThemeMode
  resolvedDark: boolean
  fabOpen: boolean
  locked: boolean
  quickCreate: FabAction | null
  setTheme: (t: ThemeMode) => void
  setResolvedDark: (dark: boolean) => void
  toggleFab: () => void
  closeFab: () => void
  setLocked: (v: boolean) => void
  openQuickCreate: (a: FabAction) => void
  closeQuickCreate: () => void
}

export const useUIStore = create<UIState>((set) => ({
  theme: 'system',
  resolvedDark: true,
  fabOpen: false,
  locked: false,
  quickCreate: null,
  setTheme: (theme) => set({ theme }),
  setResolvedDark: (resolvedDark) => set({ resolvedDark }),
  toggleFab: () => set((s) => ({ fabOpen: !s.fabOpen })),
  closeFab: () => set({ fabOpen: false }),
  setLocked: (locked) => set({ locked }),
  openQuickCreate: (quickCreate) => set({ quickCreate, fabOpen: false }),
  closeQuickCreate: () => set({ quickCreate: null }),
}))
