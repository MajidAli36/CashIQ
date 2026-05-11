import { cn } from '@/lib/utils/cn'

interface Chip {
  id: string
  label: string
  labelUr?: string
}

interface FilterChipsProps {
  chips: Chip[]
  active: string
  onChange: (id: string) => void
  className?: string
}

export function FilterChips({ chips, active, onChange, className }: FilterChipsProps) {
  return (
    <div className={cn('flex gap-2 overflow-x-auto pb-1', className)}>
      {chips.map(c => (
        <button key={c.id} onClick={() => onChange(c.id)}
          className={cn('flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all',
            active === c.id ? 'bg-navy text-white border-navy' : 'bg-white text-muted border-border')}>
          {c.labelUr && <span className="font-urdu">{c.labelUr} · </span>}
          {c.label}
        </button>
      ))}
    </div>
  )
}
