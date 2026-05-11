import { cn } from '@/lib/utils/cn'

interface StepIndicatorProps {
  steps: number
  current: number
}

export function StepIndicator({ steps, current }: StepIndicatorProps) {
  return (
    <div className="flex gap-1.5 items-center">
      {Array.from({ length: steps }, (_, i) => (
        <div key={i} className={cn('h-1.5 rounded-full transition-all',
          current > i ? 'bg-white w-6' : 'bg-white/30 w-5')} />
      ))}
    </div>
  )
}
