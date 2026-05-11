import { cn } from '@/lib/utils/cn'
import type { UserRole } from '@/lib/types'

const ROLE_COLORS: Record<UserRole, string> = {
  owner: 'bg-navy/10 text-navy',
  manager: 'bg-blue-50 text-blue-700',
  staff: 'bg-gray-100 text-gray-600',
}

const ROLE_LABELS: Record<UserRole, string> = {
  owner: 'Owner',
  manager: 'Manager',
  staff: 'Staff',
}

export function RoleBadge({ role }: { role: UserRole }) {
  return (
    <span className={cn('text-[11px] font-semibold px-2 py-0.5 rounded-full', ROLE_COLORS[role])}>
      {ROLE_LABELS[role]}
    </span>
  )
}
