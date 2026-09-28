import type { ReactNode, ButtonHTMLAttributes } from 'react'
import { motion } from 'framer-motion'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'

interface GlassButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'ref'> {
  children: ReactNode
  variant?: Variant
  full?: boolean
  className?: string
}

const variantClasses: Record<Variant, string> = {
  primary:
    'text-white bg-gradient-to-br from-crimson-light to-crimson border border-white/10 shadow-fab',
  secondary:
    'txt-primary bg-[rgba(59,78,107,0.25)] border border-[rgba(59,78,107,0.5)]',
  ghost: 'txt-primary bg-transparent border border-[var(--border)]',
  danger: 'text-white bg-gradient-to-br from-red-600 to-red-700 border border-white/10',
}

export function GlassButton({
  children,
  variant = 'primary',
  full = false,
  className = '',
  disabled,
  ...rest
}: GlassButtonProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-[15px] font-semibold transition-opacity disabled:opacity-40 ${
        variantClasses[variant]
      } ${full ? 'w-full' : ''} ${className}`}
      {...(rest as React.ComponentProps<typeof motion.button>)}
    >
      {children}
    </motion.button>
  )
}

export default GlassButton
