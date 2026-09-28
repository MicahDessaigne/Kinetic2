import { Minus, Plus } from 'lucide-react'
import { motion } from 'framer-motion'

interface NumberStepperProps {
  value: number
  onChange: (v: number) => void
  min?: number
  max?: number
  step?: number
  suffix?: string
}

export function NumberStepper({
  value,
  onChange,
  min = 0,
  max = Infinity,
  step = 1,
  suffix,
}: NumberStepperProps) {
  const dec = () => onChange(Math.max(min, value - step))
  const inc = () => onChange(Math.min(max, value + step))
  return (
    <div className="flex items-center gap-3">
      <motion.button
        whileTap={{ scale: 0.85 }}
        onClick={dec}
        disabled={value <= min}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-white/8 border border-[var(--border)] txt-primary disabled:opacity-30"
        aria-label="Decrease"
      >
        <Minus size={16} />
      </motion.button>
      <span className="min-w-[3ch] text-center text-lg font-semibold tabular-nums txt-primary">
        {value}
        {suffix ? <span className="ml-1 text-xs txt-secondary">{suffix}</span> : null}
      </span>
      <motion.button
        whileTap={{ scale: 0.85 }}
        onClick={inc}
        disabled={value >= max}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-white/8 border border-[var(--border)] txt-primary disabled:opacity-30"
        aria-label="Increase"
      >
        <Plus size={16} />
      </motion.button>
    </div>
  )
}

export default NumberStepper
