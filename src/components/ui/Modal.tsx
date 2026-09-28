import type { ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  footer?: ReactNode
}

export function Modal({ open, onClose, title, children, footer }: ModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center">
          <motion.div
            className="absolute inset-0 bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="glass-card relative z-10 flex max-h-[90vh] w-full max-w-lg flex-col rounded-t-3xl sm:rounded-3xl"
            initial={{ y: '100%', opacity: 0.6 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0.6 }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
          >
            <div className="mx-auto mt-3 h-1.5 w-10 rounded-full bg-white/20 sm:hidden" />
            <div className="flex items-center justify-between px-5 py-4">
              <h2 className="text-lg font-semibold txt-primary">{title}</h2>
              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 txt-secondary"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>
            <div className="no-scrollbar flex-1 overflow-y-auto px-5 pb-4">{children}</div>
            {footer && (
              <div className="border-t border-[var(--border)] px-5 py-4 safe-area-bottom">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export default Modal
