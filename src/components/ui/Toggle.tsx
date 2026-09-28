import { motion } from 'framer-motion'

interface ToggleProps {
  checked: boolean
  onChange: (v: boolean) => void
  disabled?: boolean
  label?: string
}

export function Toggle({ checked, onChange, disabled, label }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative h-[31px] w-[51px] shrink-0 rounded-full transition-colors disabled:opacity-40 ${
        checked ? 'bg-gradient-to-r from-crimson-light to-crimson' : 'bg-white/15'
      }`}
    >
      <motion.span
        layout
        transition={{ type: 'spring', stiffness: 500, damping: 32 }}
        className="absolute top-[2px] h-[27px] w-[27px] rounded-full bg-white shadow-md"
        style={{ left: checked ? 22 : 2 }}
      />
    </button>
  )
}

export default Toggle
