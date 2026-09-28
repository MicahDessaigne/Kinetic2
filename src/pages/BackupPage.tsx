import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Download, Upload, AlertTriangle } from 'lucide-react'
import PageSubHeader from '../components/ui/PageSubHeader'
import GlassCard from '../components/ui/GlassCard'
import GlassButton from '../components/ui/GlassButton'
import { downloadBackup, importFromFile, type ImportMode } from '../utils/backupService'
import { wipeAllData } from '../db/database'

export function BackupPage() {
  const nav = useNavigate()
  const fileRef = useRef<HTMLInputElement>(null)
  const [mode, setMode] = useState<ImportMode>('replace')
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleExport() {
    setError(null)
    try {
      await downloadBackup()
      setMessage('Backup downloaded.')
    } catch (e) {
      setError(String(e))
    }
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setError(null)
    setMessage(null)
    try {
      const result = await importFromFile(file, mode)
      setMessage(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  async function handleWipe() {
    if (confirm('This permanently deletes ALL data on this device. Continue?')) {
      await wipeAllData()
      setMessage('All data wiped.')
    }
  }

  return (
    <div className="mx-auto max-w-lg pb-28">
      <PageSubHeader title="Backup & Restore" onBack={() => nav('/more')} />

      <div className="space-y-4 px-4 pt-2">
        <GlassCard className="p-5">
          <h2 className="mb-1 font-semibold txt-primary">Export</h2>
          <p className="mb-4 text-sm txt-secondary">
            Download all your habits, tasks, prayers, notes and settings as a single JSON file. Keep
            it somewhere safe — it is your complete backup.
          </p>
          <GlassButton variant="primary" full onClick={handleExport}>
            <Download size={18} /> Download backup
          </GlassButton>
        </GlassCard>

        <GlassCard className="p-5">
          <h2 className="mb-1 font-semibold txt-primary">Import</h2>
          <p className="mb-3 text-sm txt-secondary">Restore from a previously exported LifeOS file.</p>
          <div className="mb-3 flex gap-2">
            {(['replace', 'merge'] as ImportMode[]).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className="flex-1 rounded-xl py-2 text-sm font-semibold capitalize transition-colors"
                style={{
                  background: mode === m ? 'var(--accent-light)' : 'rgba(255,255,255,0.06)',
                  color: mode === m ? '#fff' : 'var(--text-secondary)',
                }}
              >
                {m}
              </button>
            ))}
          </div>
          <p className="mb-3 text-xs txt-secondary">
            {mode === 'replace'
              ? 'Replace: wipes current data, then restores the file exactly.'
              : 'Merge: adds records from the file alongside your current data.'}
          </p>
          <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={handleFile} />
          <GlassButton variant="secondary" full onClick={() => fileRef.current?.click()}>
            <Upload size={18} /> Choose file
          </GlassButton>
        </GlassCard>

        {message && (
          <div className="rounded-2xl bg-[rgba(46,125,91,0.2)] px-4 py-3 text-sm text-[#7BD3A8]">
            {message}
          </div>
        )}
        {error && (
          <div className="rounded-2xl bg-[rgba(168,32,46,0.2)] px-4 py-3 text-sm text-[#F1A0A0]">
            {error}
          </div>
        )}

        <GlassCard className="p-5">
          <h2 className="mb-1 flex items-center gap-2 font-semibold text-[#E06A6A]">
            <AlertTriangle size={18} /> Danger zone
          </h2>
          <p className="mb-4 text-sm txt-secondary">Erase everything and start fresh. Cannot be undone.</p>
          <GlassButton variant="danger" full onClick={handleWipe}>
            Wipe all data
          </GlassButton>
        </GlassCard>
      </div>
    </div>
  )
}

export default BackupPage
