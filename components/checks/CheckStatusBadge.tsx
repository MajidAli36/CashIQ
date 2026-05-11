import { cn } from '@/lib/utils/cn'
import type { CheckStatus } from '@/lib/types'

interface CheckStatusBadgeProps {
  status: CheckStatus
  className?: string
}

const STATUS_CONFIG: Record<CheckStatus, { label: string; color: string; bg: string }> = {
  active: {
    label: 'Active',
    color: 'text-blue-700',
    bg: 'bg-blue-100',
  },
  cleared: {
    label: 'Cleared',
    color: 'text-emerald-700',
    bg: 'bg-emerald-100',
  },
  bounced: {
    label: 'Bounced',
    color: 'text-rose-700',
    bg: 'bg-rose-100',
  },
  returned: {
    label: 'Returned',
    color: 'text-gray-700',
    bg: 'bg-gray-100',
  },
  cancelled: {
    label: 'Cancelled',
    color: 'text-orange-700',
    bg: 'bg-orange-100',
  },
}

export function CheckStatusBadge({ status, className }: CheckStatusBadgeProps) {
  const config = STATUS_CONFIG[status]

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold',
        config.bg,
        config.color,
        className
      )}
    >
      {config.label}
    </span>
  )
}
