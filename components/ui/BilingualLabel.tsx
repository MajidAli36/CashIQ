import { cn } from '@/lib/utils/cn'

interface BilingualLabelProps {
  en: string
  ur: string
  size?: 'xs' | 'sm' | 'base'
  className?: string
  urClass?: string
}

export function BilingualLabel({ en, ur, size = 'sm', className, urClass }: BilingualLabelProps) {
  return (
    <span className={cn('inline-flex items-baseline gap-1', className)}>
      <span className={cn(
        size === 'xs' ? 'text-xs' : size === 'sm' ? 'text-sm' : 'text-base',
        'font-semibold'
      )}>{en}</span>
      <span className={cn('font-urdu opacity-70',
        size === 'xs' ? 'text-[10px]' : size === 'sm' ? 'text-xs' : 'text-sm',
        urClass
      )}> · {ur}</span>
    </span>
  )
}
