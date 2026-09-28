import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, Search, Pin, Trash2 } from 'lucide-react'
import Modal from '../components/ui/Modal'
import GlassCard from '../components/ui/GlassCard'
import { TextInput, TextArea } from '../components/ui/Field'
import {
  useNotes,
  createNote,
  updateNote,
  deleteNote,
  togglePin,
} from '../db/hooks/useNotes'
import type { Note } from '../db/database'
import { prettyDateShort } from '../utils/dateHelpers'

export function NotesPage() {
  const nav = useNavigate()
  const [search, setSearch] = useState('')
  const notes = useNotes(search) ?? []
  const [active, setActive] = useState<Note | null>(null)
  const [open, setOpen] = useState(false)

  async function newNote() {
    const id = await createNote({})
    const n = notes.find((x) => x.id === id)
    setActive(n ?? ({ id, title: '', content: '', pinned: 0, updated_at: Date.now(), created_at: Date.now() } as Note))
    setOpen(true)
  }

  function openNote(n: Note) {
    setActive(n)
    setOpen(true)
  }

  return (
    <div className="mx-auto max-w-lg pb-28">
      <header className="safe-area-top flex items-center gap-3 px-4 pt-4 pb-2">
        <button onClick={() => nav('/more')} className="txt-primary">
          <ArrowLeft size={22} />
        </button>
        <h1 className="flex-1 text-xl font-bold txt-primary">Notes</h1>
        <button
          onClick={newNote}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-crimson-light to-crimson text-white shadow-fab"
        >
          <Plus size={22} />
        </button>
      </header>

      <div className="px-4 pb-3">
        <div className="flex items-center gap-2 rounded-2xl bg-black/20 border border-[var(--border)] px-3">
          <Search size={16} className="txt-secondary" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search notes"
            className="w-full bg-transparent py-3 text-[15px] txt-primary outline-none placeholder:text-[var(--text-secondary)]"
          />
        </div>
      </div>

      <div className="space-y-2 px-4">
        {notes.length === 0 ? (
          <p className="mt-12 text-center txt-secondary">
            {search ? 'No matching notes.' : 'No notes yet. Tap + to add one.'}
          </p>
        ) : (
          notes.map((n) => (
            <GlassCard key={n.id} className="p-4">
              <button className="w-full text-left" onClick={() => openNote(n)}>
                <div className="flex items-start gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold txt-primary">
                      {n.title || n.content.slice(0, 40) || 'Untitled'}
                    </p>
                    {n.content && <p className="mt-0.5 line-clamp-2 text-sm txt-secondary">{n.content}</p>}
                    <p className="mt-1 text-xs txt-secondary">{prettyDateShort(new Date(n.updated_at).toISOString().slice(0, 10))}</p>
                  </div>
                  {n.pinned ? <Pin size={16} className="fill-current text-crimson-light" /> : null}
                </div>
              </button>
            </GlassCard>
          ))
        )}
      </div>

      <NoteEditor note={active} open={open} onClose={() => setOpen(false)} />
    </div>
  )
}

function NoteEditor({ note, open, onClose }: { note: Note | null; open: boolean; onClose: () => void }) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (open && note) {
      setTitle(note.title)
      setContent(note.content)
    }
  }, [open, note])

  // Auto-save debounced.
  useEffect(() => {
    if (!open || !note?.id) return
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      updateNote(note.id!, { title, content })
    }, 500)
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current)
    }
  }, [title, content, open, note])

  async function close() {
    if (note?.id) await updateNote(note.id, { title, content })
    onClose()
  }

  if (!note) return null

  return (
    <Modal
      open={open}
      onClose={close}
      title="Note"
    >
      <div className="mb-3 flex items-center justify-end gap-2">
        <button
          onClick={() => note.id != null && togglePin(note.id)}
          className="flex items-center gap-1.5 rounded-full bg-white/8 px-3 py-1.5 text-xs font-semibold txt-secondary"
        >
          <Pin size={14} className={note.pinned ? 'fill-current text-crimson-light' : ''} />
          {note.pinned ? 'Pinned' : 'Pin'}
        </button>
        <button
          onClick={() => note.id != null && confirm('Delete this note?') && deleteNote(note.id).then(onClose)}
          className="flex items-center gap-1.5 rounded-full bg-white/8 px-3 py-1.5 text-xs font-semibold txt-secondary"
        >
          <Trash2 size={14} /> Delete
        </button>
      </div>
      <TextInput
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title"
        className="mb-3 text-lg font-semibold"
      />
      <TextArea
        rows={12}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Start writing... (auto-saves)"
        autoFocus
      />
    </Modal>
  )
}

export default NotesPage
