'use client'
import { cn } from '@/lib/utils/cn'

interface ToggleProps {
  checked: boolean
  onChange: (v: boolean) => void
  disabled?: boolean
}

export function Toggle({ checked, onChange, disabled }: ToggleProps) {
  return (
    <button type="button" role="switch" aria-checked={checked} disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative w-12 h-6 rounded-full transition-all duration-250 focus:outline-none',
        checked ? 'bg-teal shadow-teal-glow' : 'bg-border',
        disabled && 'opacity-40 cursor-not-allowed'
      )}>
      <span className={cn(
        'absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-250',
        checked && 'translate-x-6'
      )} />
    </button>
  )
}
