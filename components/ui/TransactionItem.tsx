'use client'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils/cn'
import { WalletBadge } from './WalletBadge'
import type { WalletType } from '@/lib/types'

interface TransactionItemProps {
  id: string
  icon: string
  label: string
  time: string
  note?: string
  amount: number
  type: 'income' | 'expense' | 'transfer' | 'loan' | 'other'
  walletName?: string
  walletType?: WalletType
  index?: number
  isLast?: boolean
}

const TYPE_COLORS: Record<string, string> = {
  income:   '#4CAF50',
  expense:  '#FF5C5C',
  transfer: '#00C4B4',
  loan:     '#F59E0B',
  other:    '#94A3B8',
}

const TYPE_BG: Record<string, string> = {
  income:   'rgba(76,175,80,0.10)',
  expense:  'rgba(255,92,92,0.10)',
  transfer: 'rgba(0,196,180,0.10)',
  loan:     'rgba(245,158,11,0.10)',
  other:    'rgba(148,163,184,0.08)',
}

const TYPE_PREFIX: Record<string, string> = {
  income:   '+',
  expense:  '-',
  transfer: '⇄',
  loan:     '↔',
  other:    '',
}

export function TransactionItem({
  id,
  icon,
  label,
  time,
  note,
  amount,
  type,
  walletName,
  walletType,
  index = 0,
  isLast = false,
}: TransactionItemProps) {
  const color  = TYPE_COLORS[type] || TYPE_COLORS.other
  const bg     = TYPE_BG[type]    || TYPE_BG.other
  const prefix = TYPE_PREFIX[type] ?? ''

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04, ease: [0.16, 1, 0.3, 1] }}
      className={cn('flex items-center gap-3 px-4 py-3.5 relative', !isLast && 'border-b')}
      style={{ borderColor: 'var(--t-card-border, #E2E8F0)' }}
      whileHover={{
        backgroundColor: 'rgba(0,0,0,0.018)',
        transition: { duration: 0.1 },
      }}
    >
      {/* Category icon bubble */}
      <div
        className="w-10 h-10 rounded-2xl flex items-center justify-center text-[17px] flex-shrink-0"
        style={{ background: bg }}
      >
        {icon}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold truncate" style={{ color: 'var(--t-text)' }}>
          {label}
        </p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="text-[11px]" style={{ color: 'var(--t-muted)' }}>{time}</span>
          {note && (
            <>
              <span className="w-0.5 h-0.5 rounded-full flex-shrink-0" style={{ background: 'var(--t-muted)' }} />
              <span className="text-[11px] truncate" style={{ color: 'var(--t-muted)' }}>
                {note.slice(0, 24)}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Amount */}
      <div className="text-right flex-shrink-0">
        <p className="text-[13px] font-bold tabular-nums" style={{ color }}>
          {prefix}Rs.{' '}
          {amount.toLocaleString('en-PK', { maximumFractionDigits: 0 })}
        </p>
        {walletName && walletType && (
          <div className="mt-0.5 flex justify-end">
            <WalletBadge name={walletName} type={walletType} size="sm" />
          </div>
        )}
      </div>
    </motion.div>
  )
}
