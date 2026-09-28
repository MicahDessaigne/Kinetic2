import { useLiveQuery } from 'dexie-react-hooks'
import {
  db,
  DEFAULT_SETTINGS,
  setSetting,
  type SettingsShape,
} from '../database'

/** Reactive access to a single setting with default fallback. */
export function useSetting<K extends keyof SettingsShape>(key: K): SettingsShape[K] {
  const value = useLiveQuery(async () => {
    const row = await db.settings.get(key as string)
    return row === undefined ? DEFAULT_SETTINGS[key] : (row.value as SettingsShape[K])
  }, [key])
  return (value === undefined ? DEFAULT_SETTINGS[key] : value) as SettingsShape[K]
}

/** Reactive access to all settings merged with defaults. */
export function useAllSettings(): SettingsShape {
  const value = useLiveQuery(async () => {
    const rows = await db.settings.toArray()
    const merged = { ...DEFAULT_SETTINGS }
    for (const row of rows) {
      if (row.key in merged) {
        // @ts-expect-error dynamic assignment against typed shape
        merged[row.key] = row.value
      }
    }
    return merged
  }, [])
  return value ?? DEFAULT_SETTINGS
}

export { setSetting }
