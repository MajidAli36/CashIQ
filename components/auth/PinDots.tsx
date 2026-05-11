'use client'
import { cn } from '@/lib/utils/cn'

interface PinDotsProps {
  length: number
  total?: number
  error?: boolean
}

export function PinDots({ length, total = 4, error }: PinDotsProps) {
  return (
    <div className={cn('flex items-center gap-5', error && 'animate-shake')}>
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'w-[18px] h-[18px] rounded-full border-2 transition-all duration-200',
            length > i
              ? error
                ? 'bg-expense border-expense scale-110'
                : 'bg-teal border-teal scale-110'
              : 'bg-transparent border-white/25'
          )}
        />
      ))}
    </div>
  )
}
