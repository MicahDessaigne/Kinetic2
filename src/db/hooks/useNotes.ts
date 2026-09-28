import { useLiveQuery } from 'dexie-react-hooks'
import { db, type Note } from '../database'

export function useNotes(search = '') {
  return useLiveQuery(async () => {
    const all = await db.notes.toArray()
    const q = search.trim().toLowerCase()
    const filtered = q
      ? all.filter(
          (n) =>
            n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q),
        )
      : all
    // pinned first, then most recently updated
    return filtered.sort((a, b) => {
      if (a.pinned !== b.pinned) return b.pinned - a.pinned
      return b.updated_at - a.updated_at
    })
  }, [search])
}

export function useNote(id: number | undefined) {
  return useLiveQuery(async () => {
    if (id == null) return undefined
    return db.notes.get(id)
  }, [id])
}

// ---- CRUD ----
export async function createNote(
  data: Partial<Note> & { title?: string; content?: string } = {},
): Promise<number> {
  const now = Date.now()
  return db.notes.add({
    title: data.title ?? '',
    content: data.content ?? '',
    pinned: data.pinned ?? 0,
    updated_at: now,
    created_at: now,
  })
}

export async function updateNote(id: number, changes: Partial<Note>): Promise<void> {
  await db.notes.update(id, { ...changes, updated_at: Date.now() })
}

export async function togglePin(id: number): Promise<void> {
  const note = await db.notes.get(id)
  if (!note) return
  await db.notes.update(id, { pinned: note.pinned ? 0 : 1 })
}

export async function deleteNote(id: number): Promise<void> {
  await db.notes.delete(id)
}
