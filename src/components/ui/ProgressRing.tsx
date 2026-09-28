import type { ReactNode } from 'react'

interface ProgressRingProps {
  progress: number // 0..1
  size?: number
  stroke?: number
  children?: ReactNode
  trackColor?: string
  className?: string
}

export function ProgressRing({
  progress,
  size = 160,
  stroke = 14,
  children,
  trackColor = 'rgba(255,255,255,0.10)',
  className = '',
}: ProgressRingProps) {
  const clamped = Math.max(0, Math.min(1, progress))
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference * (1 - clamped)

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="rotate-[-90deg]">
        <defs>
          <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#A8202E" />
            <stop offset="100%" stopColor="#931A25" />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#ringGrad)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.6s cubic-bezier(0.22,1,0.36,1)' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {children}
      </div>
    </div>
  )
}

export default ProgressRing
