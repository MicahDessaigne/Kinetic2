import { Plus, Repeat, CheckSquare, HandHeart, StickyNote } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useUIStore, type FabAction } from '../../stores/uiStore'

const ACTIONS: { key: FabAction; label: string; icon: typeof Repeat; color: string }[] = [
  { key: 'habit', label: 'Habit', icon: Repeat, color: '#931A25' },
  { key: 'task', label: 'Task', icon: CheckSquare, color: '#3B4E6B' },
  { key: 'prayer', label: 'Prayer', icon: HandHeart, color: '#7A5C2E' },
  { key: 'note', label: 'Note', icon: StickyNote, color: '#4B4B57' },
]

export function FAB() {
  const { fabOpen, toggleFab, closeFab, openQuickCreate } = useUIStore()

  return (
    <>
      <AnimatePresence>
        {fabOpen && (
          <motion.div
            className="fixed inset-0 z-40 bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeFab}
          />
        )}
      </AnimatePresence>

      <div className="fixed bottom-[calc(env(safe-area-inset-bottom)+72px)] right-5 z-50 flex flex-col items-end gap-3">
        <AnimatePresence>
          {fabOpen &&
            ACTIONS.map((a, i) => {
              const Icon = a.icon
              return (
                <motion.button
                  key={a.key}
                  initial={{ opacity: 0, y: 20, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 20, scale: 0.8 }}
                  transition={{ delay: i * 0.04, type: 'spring', stiffness: 400, damping: 22 }}
                  onClick={() => openQuickCreate(a.key)}
                  className="flex items-center gap-3"
                >
                  <span className="glass-card rounded-full px-3 py-1.5 text-sm font-medium txt-primary">
                    {a.label}
                  </span>
                  <span
                    className="flex h-12 w-12 items-center justify-center rounded-full text-white shadow-lg"
                    style={{ background: a.color }}
                  >
                    <Icon size={20} />
                  </span>
                </motion.button>
              )
            })}
        </AnimatePresence>

        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={toggleFab}
          animate={{ rotate: fabOpen ? 45 : 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-crimson-light to-crimson text-white shadow-fab"
          aria-label="Create"
        >
          <Plus size={28} />
        </motion.button>
      </div>
    </>
  )
}

export default FAB
