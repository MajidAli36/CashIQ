import { cn } from '@/lib/utils/cn'
import type { WalletType } from '@/lib/types'

const WALLET_STYLES: Record<WalletType, { bg: string; text: string; dot: string }> = {
  cash:      { bg: 'bg-navy-700/10', text: 'text-navy', dot: 'bg-navy' },
  jazzcash:  { bg: 'bg-[#C8102E]/10', text: 'text-[#C8102E]', dot: 'bg-[#C8102E]' },
  easypaisa: { bg: 'bg-[#3a7a28]/10', text: 'text-[#3a7a28]', dot: 'bg-[#3a7a28]' },
  bank:      { bg: 'bg-teal/10', text: 'text-teal-dark', dot: 'bg-teal' },
  custom:    { bg: 'bg-surface-dark', text: 'text-muted', dot: 'bg-muted' },
}

interface WalletBadgeProps {
  name: string
  type: WalletType
  size?: 'sm' | 'md'
}

export function WalletBadge({ name, type, size = 'sm' }: WalletBadgeProps) {
  const s = WALLET_STYLES[type] || WALLET_STYLES.custom
  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 rounded-full font-semibold',
      size === 'sm' ? 'text-[11px] px-2 py-0.5' : 'text-xs px-2.5 py-1',
      s.bg, s.text
    )}>
      <span className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', s.dot)} />
      {name}
    </span>
  )
}
