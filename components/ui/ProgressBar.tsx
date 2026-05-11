import { cn } from '@/lib/utils/cn'

interface ProgressBarProps {
  value: number
  max: number
  className?: string
  color?: 'teal' | 'income' | 'expense' | 'loan'
}

export function ProgressBar({ value, max, className, color = 'teal' }: ProgressBarProps) {
  const pct = Math.min((value / max) * 100, 100)
  const auto = pct >= 90 ? 'expense' : pct >= 70 ? 'loan' : color
  const colors = { teal: 'bg-teal', income: 'bg-income', expense: 'bg-expense', loan: 'bg-loan' }
  return (
    <div className={cn('w-full h-1.5 bg-surface-dark rounded-full overflow-hidden', className)}>
      <div className={cn('h-full rounded-full transition-all duration-500', colors[auto])}
        style={{ width: `${pct}%` }} />
    </div>
  )
}
