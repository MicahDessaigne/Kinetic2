import { Play, Pause, RotateCcw } from 'lucide-react'
import { motion } from 'framer-motion'
import { formatSeconds } from '../../utils/dateHelpers'

interface TimerDisplayProps {
  seconds: number
  targetSeconds?: number
  running: boolean
  onToggle: () => void
  onReset: () => void
  compact?: boolean
}

export function TimerDisplay({
  seconds,
  targetSeconds,
  running,
  onToggle,
  onReset,
  compact = false,
}: TimerDisplayProps) {
  const remaining =
    targetSeconds && targetSeconds > 0 ? Math.max(0, targetSeconds - seconds) : seconds
  const label = targetSeconds && targetSeconds > 0 ? formatSeconds(remaining) : formatSeconds(seconds)

  return (
    <div className={`flex items-center gap-3 ${compact ? '' : 'flex-col'}`}>
      <span className="font-mono text-2xl font-semibold tabular-nums txt-primary">{label}</span>
      <div className="flex items-center gap-2">
        <motion.button
          whileTap={{ scale: 0.88 }}
          onClick={onToggle}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-crimson-light to-crimson text-white shadow-fab"
          aria-label={running ? 'Pause' : 'Start'}
        >
          {running ? <Pause size={18} /> : <Play size={18} />}
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.88 }}
          onClick={onReset}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/8 border border-[var(--border)] txt-secondary"
          aria-label="Reset"
        >
          <RotateCcw size={16} />
        </motion.button>
      </div>
    </div>
  )
}

export default TimerDisplay
