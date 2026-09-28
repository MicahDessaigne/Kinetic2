import { useState } from 'react'
import { motion } from 'framer-motion'
import { Delete, Lock } from 'lucide-react'
import { hashPin } from '../../utils/crypto'

interface PinLockProps {
  mode: 'verify' | 'set'
  storedHash?: string
  onSuccess: (pin: string, hash: string) => void
  onForgot?: () => void
  title?: string
}

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del']

export function PinLock({ mode, storedHash, onSuccess, onForgot, title }: PinLockProps) {
  const [pin, setPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [stage, setStage] = useState<'enter' | 'confirm'>('enter')
  const [error, setError] = useState(false)

  const current = stage === 'confirm' ? confirmPin : pin
  const heading =
    title ??
    (mode === 'set'
      ? stage === 'enter'
        ? 'Create a PIN'
        : 'Confirm your PIN'
      : 'Enter your PIN')

  async function commitSet(next: string) {
    if (stage === 'enter') {
      setPin(next)
      setStage('confirm')
      return
    }
    if (next === pin) {
      const h = await hashPin(next)
      onSuccess(next, h)
    } else {
      triggerError()
      setConfirmPin('')
      setPin('')
      setStage('enter')
    }
  }

  function triggerError() {
    setError(true)
    window.setTimeout(() => setError(false), 500)
  }

  async function attemptVerify(next: string) {
    const h = await hashPin(next)
    if (h === storedHash) {
      onSuccess(next, h)
      return true
    }
    return false
  }

  function press(key: string) {
    if (key === 'del') {
      if (stage === 'confirm') setConfirmPin((p) => p.slice(0, -1))
      else setPin((p) => p.slice(0, -1))
      return
    }
    if (key === '') return
    const next = (current + key).slice(0, 6)
    if (stage === 'confirm') setConfirmPin(next)
    else setPin(next)

    if (mode === 'verify') {
      // Silently check on each keypress (supports 4-6 digit PINs). Only error at 6.
      void attemptVerify(next).then((ok) => {
        if (!ok && next.length >= 6) {
          triggerError()
          setPin('')
        }
      })
    }
  }

  const dots = Math.max(6, current.length)

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[var(--bg)] px-8 safe-area-top safe-area-bottom">
      <motion.div
        animate={error ? { x: [0, -8, 8, -8, 8, 0] } : { x: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col items-center"
      >
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-crimson-light to-crimson text-white shadow-fab">
          <Lock size={26} />
        </div>
        <h1 className="mb-1 text-xl font-semibold txt-primary">{heading}</h1>
        <p className="mb-8 text-sm txt-secondary">
          {mode === 'set' ? '4 to 6 digits' : 'Unlock LifeOS'}
        </p>

        <div className="mb-10 flex items-center gap-3">
          {Array.from({ length: dots }).map((_, i) => (
            <span
              key={i}
              className="h-3.5 w-3.5 rounded-full border transition-colors"
              style={{
                borderColor: 'var(--text-secondary)',
                background: i < current.length ? 'var(--accent-light)' : 'transparent',
              }}
            />
          ))}
        </div>

        <div className="grid grid-cols-3 gap-5">
          {KEYS.map((k, i) =>
            k === '' ? (
              <span key={i} />
            ) : (
              <motion.button
                key={i}
                whileTap={{ scale: 0.9 }}
                onClick={() => press(k)}
                className="flex h-16 w-16 items-center justify-center rounded-full bg-white/6 border border-[var(--border)] text-2xl font-medium txt-primary"
              >
                {k === 'del' ? <Delete size={22} /> : k}
              </motion.button>
            ),
          )}
        </div>

        {mode === 'set' && (
          <button
            onClick={() => current.length >= 4 && void commitSet(current)}
            disabled={current.length < 4}
            className="mt-8 rounded-2xl bg-gradient-to-br from-crimson-light to-crimson px-8 py-3 font-semibold text-white shadow-fab disabled:opacity-40"
          >
            {stage === 'enter' ? 'Continue' : 'Set PIN'}
          </button>
        )}

        {mode === 'verify' && onForgot && (
          <button onClick={onForgot} className="mt-8 text-sm txt-secondary underline">
            Forgot PIN?
          </button>
        )}
      </motion.div>
    </div>
  )
}

export default PinLock
