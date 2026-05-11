import { cn } from '@/lib/utils/cn'
import type { PlanId } from '@/lib/types'

const STYLES: Record<PlanId, { bg: string; text: string; label: string }> = {
  starter:  { bg: 'bg-border/60',      text: 'text-muted',        label: 'Starter' },
  growth:   { bg: 'bg-blue-50',        text: 'text-blue-600',     label: 'Growth' },
  business: { bg: 'bg-teal/10',        text: 'text-teal-dark',    label: 'Business' },
  pro:      { bg: 'bg-purple-50',      text: 'text-purple-700',   label: 'Pro' },
}

export function PlanBadge({ plan }: { plan: PlanId }) {
  const s = STYLES[plan]
  return (
    <span className={cn('text-[11px] font-bold px-2.5 py-0.5 rounded-full tracking-wide', s.bg, s.text)}>
      {s.label}
    </span>
  )
}
