import { useState, useEffect } from 'react'
import { useUIStore } from '../stores/uiStore'
import HabitDetailModal from '../pages/HabitDetailModal'
import TaskDetailModal from '../pages/TaskDetailModal'
import Modal from './ui/Modal'
import GlassButton from './ui/GlassButton'
import { Field, TextInput, TextArea } from './ui/Field'
import { createPrayer } from '../db/hooks/usePrayers'
import { createNote } from '../db/hooks/useNotes'

/** Renders the correct creation sheet based on the FAB quick-create selection. */
export function QuickCreate() {
  const { quickCreate, closeQuickCreate } = useUIStore()

  return (
    <>
      <HabitDetailModal open={quickCreate === 'habit'} onClose={closeQuickCreate} habit={null} />
      <TaskDetailModal open={quickCreate === 'task'} onClose={closeQuickCreate} task={null} />
      <QuickPrayer open={quickCreate === 'prayer'} onClose={closeQuickCreate} />
      <QuickNote open={quickCreate === 'note'} onClose={closeQuickCreate} />
    </>
  )
}

function QuickPrayer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('General')
  useEffect(() => {
    if (open) {
      setTitle('')
      setCategory('General')
    }
  }, [open])
  async function save() {
    if (!title.trim()) return
    await createPrayer({ title: title.trim(), category: category.trim() || 'General' })
    onClose()
  }
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="New Prayer"
      footer={
        <GlassButton variant="primary" full onClick={save}>
          Add Prayer
        </GlassButton>
      }
    >
      <Field label="Title">
        <TextInput value={title} onChange={(e) => setTitle(e.target.value)} placeholder="What are you praying for?" autoFocus />
      </Field>
      <Field label="Category">
        <TextInput value={category} onChange={(e) => setCategory(e.target.value)} />
      </Field>
    </Modal>
  )
}

function QuickNote({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  useEffect(() => {
    if (open) {
      setTitle('')
      setContent('')
    }
  }, [open])
  async function save() {
    if (!title.trim() && !content.trim()) {
      onClose()
      return
    }
    await createNote({ title: title.trim(), content })
    onClose()
  }
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="New Note"
      footer={
        <GlassButton variant="primary" full onClick={save}>
          Save Note
        </GlassButton>
      }
    >
      <Field label="Title">
        <TextInput value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Optional title" autoFocus />
      </Field>
      <Field label="Content">
        <TextArea rows={8} value={content} onChange={(e) => setContent(e.target.value)} placeholder="Write something..." />
      </Field>
    </Modal>
  )
}

export default QuickCreate
