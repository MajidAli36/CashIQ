'use client'
import { Delete } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface NumericKeypadProps {
  onKey: (key: string) => void
  disabled?: boolean
}

const KEYS = ['1','2','3','4','5','6','7','8','9','','0','del'] as const

export function NumericKeypad({ onKey, disabled }: NumericKeypadProps) {
  return (
    <div className="grid grid-cols-3 gap-3 w-full max-w-[288px] mx-auto select-none">
      {KEYS.map((key, i) => {
        if (key === '') return <div key={i} />

        if (key === 'del') return (
          <button
            key={i}
            onClick={() => onKey('del')}
            disabled={disabled}
            className={cn(
              'h-[68px] rounded-2xl flex items-center justify-center',
              'bg-white/6 border border-white/8',
              'transition-transform duration-75 active:scale-[0.93] active:bg-white/12',
              'disabled:opacity-40'
            )}>
            <Delete size={22} className="text-white/70" strokeWidth={1.8} />
          </button>
        )

        return (
          <button
            key={i}
            onClick={() => onKey(key)}
            disabled={disabled}
            className={cn(
              'h-[68px] rounded-2xl flex flex-col items-center justify-center gap-0.5',
              'bg-white/8 border border-white/8',
              'transition-transform duration-75 active:scale-[0.93] active:bg-white/18',
              'disabled:opacity-40'
            )}>
            <span className="text-[26px] font-bold text-white leading-none">{key}</span>
          </button>
        )
      })}
    </div>
  )
}
