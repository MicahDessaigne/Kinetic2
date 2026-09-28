import type { ReactNode, InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes } from 'react'

const baseInput =
  'w-full rounded-2xl bg-black/20 border border-[var(--border)] px-4 py-3 text-[15px] txt-primary placeholder:text-[var(--text-secondary)] outline-none focus:border-crimson-light transition-colors'

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="mb-4 block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide txt-secondary">
        {label}
      </span>
      {children}
    </label>
  )
}

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  const { className = '', ...rest } = props
  return <input className={`${baseInput} ${className}`} {...rest} />
}

export function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const { className = '', ...rest } = props
  return <textarea className={`${baseInput} resize-none ${className}`} {...rest} />
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  const { className = '', children, ...rest } = props
  return (
    <select className={`${baseInput} appearance-none ${className}`} {...rest}>
      {children}
    </select>
  )
}

export const inputClass = baseInput
