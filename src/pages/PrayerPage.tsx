import { useState, useEffect } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { ArrowLeft, Plus, HandHeart, CheckCircle2, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Modal from '../components/ui/Modal'
import GlassCard from '../components/ui/GlassCard'
import GlassButton from '../components/ui/GlassButton'
import Badge from '../components/ui/Badge'
import { Field, TextInput, TextArea } from '../components/ui/Field'
import { db, type Prayer } from '../db/database'
import {
  usePrayers,
  createPrayer,
  updatePrayer,
  deletePrayer,
  markAnswered,
  reactivatePrayer,
  togglePrayedOn,
} from '../db/hooks/usePrayers'
import { todayKey, prettyDateShort } from '../utils/dateHelpers'

export function PrayerPage() {
  const nav = useNavigate()
  const active = usePrayers('active') ?? []
  const answered = usePrayers('answered') ?? []
  const [tab, setTab] = useState<'active' | 'answered'>('active')
  const [detail, setDetail] = useState<Prayer | null>(null)
  const [createOpen, setCreateOpen] = useState(false)

  const list = tab === 'active' ? active : answered

  return (
    <div className="mx-auto max-w-lg pb-28">
      <header className="safe-area-top flex items-center gap-3 px-4 pt-4 pb-2">
        <button onClick={() => nav('/more')} className="txt-primary">
          <ArrowLeft size={22} />
        </button>
        <h1 className="flex-1 text-xl font-bold txt-primary">Prayer List</h1>
        <button
          onClick={() => setCreateOpen(true)}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-crimson-light to-crimson text-white shadow-fab"
        >
          <Plus size={22} />
        </button>
      </header>

      <div className="flex gap-2 px-4 pb-3 pt-1">
        {(['active', 'answered'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="flex-1 rounded-full py-2 text-sm font-semibold capitalize transition-colors"
            style={{
              background: tab === t ? 'var(--accent-light)' : 'rgba(255,255,255,0.06)',
              color: tab === t ? '#fff' : 'var(--text-secondary)',
            }}
          >
            {t} ({t === 'active' ? active.length : answered.length})
          </button>
        ))}
      </div>

      <div className="space-y-2 px-4">
        {list.length === 0 ? (
          <p className="mt-12 text-center txt-secondary">
            {tab === 'active' ? 'No active prayers.' : 'No answered prayers yet.'}
          </p>
        ) : (
          list.map((p) => <PrayerCard key={p.id} prayer={p} onOpen={() => setDetail(p)} />)
        )}
      </div>

      <PrayerCreateModal open={createOpen} onClose={() => setCreateOpen(false)} />
      <PrayerDetailModal prayer={detail} onClose={() => setDetail(null)} />
    </div>
  )
}

function PrayerCard({ prayer, onOpen }: { prayer: Prayer; onOpen: () => void }) {
  const today = todayKey()
  const prayedToday = useLiveQuery(
    () =>
      prayer.id != null
        ? db.prayer_logs.where('[prayer_id+date]').equals([prayer.id, today]).count()
        : Promise.resolve(0),
    [prayer.id, today],
  )
  const totalDays = useLiveQuery(
    () => (prayer.id != null ? db.prayer_logs.where('prayer_id').equals(prayer.id).count() : Promise.resolve(0)),
    [prayer.id],
  )

  return (
    <GlassCard className="p-4">
      <button className="w-full text-left" onClick={onOpen}>
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[rgba(122,92,46,0.25)] text-[#C9A15E]">
            <HandHeart size={16} />
          </span>
          <p className="flex-1 font-semibold txt-primary">{prayer.title}</p>
          {prayer.status === 'answered' && <Badge color="#2E7D5B">Answered</Badge>}
        </div>
        <div className="mt-2 flex items-center gap-3 text-xs txt-secondary">
          <Badge>{prayer.category}</Badge>
          <span>Prayed {totalDays ?? 0} days</span>
        </div>
      </button>
      {prayer.status === 'active' && (
        <button
          onClick={() => prayer.id != null && togglePrayedOn(prayer.id, today)}
          className="mt-3 w-full rounded-xl py-2 text-sm font-semibold"
          style={{
            background: prayedToday ? 'var(--accent-light)' : 'rgba(255,255,255,0.08)',
            color: prayedToday ? '#fff' : 'var(--text-secondary)',
          }}
        >
          {prayedToday ? 'Prayed today ✓' : 'Mark prayed today'}
        </button>
      )}
    </GlassCard>
  )
}

function PrayerCreateModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('General')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    if (open) {
      setTitle('')
      setCategory('General')
      setNotes('')
    }
  }, [open])

  async function save() {
    if (!title.trim()) return
    await createPrayer({ title: title.trim(), category: category.trim() || 'General', private_notes: notes })
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
        <TextInput value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Family, Health, Guidance..." />
      </Field>
      <Field label="Private notes">
        <TextArea rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Kept only on this device" />
      </Field>
    </Modal>
  )
}

function PrayerDetailModal({ prayer, onClose }: { prayer: Prayer | null; onClose: () => void }) {
  const [notes, setNotes] = useState('')
  const [reflection, setReflection] = useState('')
  const [answering, setAnswering] = useState(false)

  useEffect(() => {
    if (prayer) {
      setNotes(prayer.private_notes)
      setReflection(prayer.answered_reflection)
      setAnswering(false)
    }
  }, [prayer])

  if (!prayer) return null

  async function saveNotes() {
    if (prayer?.id != null) await updatePrayer(prayer.id, { private_notes: notes })
    onClose()
  }
  async function confirmAnswered() {
    if (prayer?.id != null) await markAnswered(prayer.id, reflection)
    onClose()
  }
  async function remove() {
    if (prayer?.id != null && confirm('Delete this prayer?')) {
      await deletePrayer(prayer.id)
      onClose()
    }
  }

  return (
    <Modal
      open={!!prayer}
      onClose={onClose}
      title={prayer.title}
      footer={
        <div className="flex gap-3">
          <GlassButton variant="ghost" onClick={remove} aria-label="Delete">
            <Trash2 size={18} />
          </GlassButton>
          <GlassButton variant="primary" full onClick={saveNotes}>
            Save
          </GlassButton>
        </div>
      }
    >
      <div className="mb-3 flex items-center gap-2">
        <Badge>{prayer.category}</Badge>
        {prayer.status === 'answered' && <Badge color="#2E7D5B">Answered {prayer.answered_date && prettyDateShort(prayer.answered_date)}</Badge>}
      </div>

      <Field label="Private notes">
        <TextArea rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} />
      </Field>

      {prayer.status === 'active' ? (
        <>
          {!answering ? (
            <GlassButton variant="secondary" full onClick={() => setAnswering(true)}>
              <CheckCircle2 size={18} /> Mark as answered
            </GlassButton>
          ) : (
            <div className="mt-2">
              <Field label="Reflection — how was it answered?">
                <TextArea
                  rows={3}
                  value={reflection}
                  onChange={(e) => setReflection(e.target.value)}
                  placeholder="Record what happened..."
                  autoFocus
                />
              </Field>
              <GlassButton variant="primary" full onClick={confirmAnswered}>
                Confirm Answered
              </GlassButton>
            </div>
          )}
        </>
      ) : (
        <>
          <Field label="Reflection">
            <TextArea rows={3} value={reflection} onChange={(e) => setReflection(e.target.value)} />
          </Field>
          <GlassButton
            variant="ghost"
            full
            onClick={() => prayer.id != null && reactivatePrayer(prayer.id).then(onClose)}
          >
            Reactivate prayer
          </GlassButton>
        </>
      )}
    </Modal>
  )
}

export default PrayerPage
