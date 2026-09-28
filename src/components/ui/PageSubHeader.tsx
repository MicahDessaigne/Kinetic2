import { ArrowLeft } from 'lucide-react'
import type { ReactNode } from 'react'

interface Props {
  title: string
  onBack: () => void
  right?: ReactNode
}

export function PageSubHeader({ title, onBack, right }: Props) {
  return (
    <header className="safe-area-top flex items-center gap-3 px-4 pt-4 pb-2">
      <button onClick={onBack} className="txt-primary" aria-label="Back">
        <ArrowLeft size={22} />
      </button>
      <h1 className="flex-1 text-xl font-bold txt-primary">{title}</h1>
      {right}
    </header>
  )
}

export default PageSubHeader
