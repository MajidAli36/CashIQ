import { formatCurrency } from '@/lib/utils/currency'
import { CheckStatusBadge } from './CheckStatusBadge'
import { Calendar, Building2, CreditCard, TrendingUp } from 'lucide-react'
import type { CheckGuarantee } from '@/lib/types'
import { cn } from '@/lib/utils/cn'

interface CheckCardProps {
  check: CheckGuarantee
  customerName?: string
  onRecordPayment?: () => void
  onViewDetails?: () => void
}

export function CheckCard({ check, customerName, onRecordPayment, onViewDetails }: CheckCardProps) {
  const percentage = check.check_amount > 0 ? (check.total_paid / check.check_amount) * 100 : 0

  return (
    <div
      className="rounded-xl p-4 border transition-all hover:shadow-md cursor-pointer"
      style={{ background: 'var(--t-card-bg)', borderColor: 'var(--t-card-border)' }}
      onClick={onViewDetails}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <CreditCard size={16} style={{ color: 'var(--t-muted)' }} />
            <span className="font-bold text-sm" style={{ color: 'var(--t-text)' }}>
              Check #{check.check_number}
            </span>
          </div>
          {customerName && (
            <p className="text-xs" style={{ color: 'var(--t-muted)' }}>
              {customerName}
            </p>
          )}
        </div>
        <CheckStatusBadge status={check.status} />
      </div>

      {/* Details */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="flex items-center gap-1.5">
          <Building2 size={12} style={{ color: 'var(--t-muted)' }} />
          <span className="text-xs" style={{ color: 'var(--t-text)' }}>
            {check.bank_name}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <Calendar size={12} style={{ color: 'var(--t-muted)' }} />
          <span className="text-xs" style={{ color: 'var(--t-text)' }}>
            {new Date(check.check_date).toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Amount Info */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-semibold" style={{ color: 'var(--t-muted)' }}>
            Amount
          </span>
          <span className="text-sm font-bold" style={{ color: 'var(--t-text)' }}>
            {formatCurrency(check.check_amount)}
          </span>
        </div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs" style={{ color: 'var(--t-muted)' }}>
            Paid
          </span>
          <span className="text-sm font-semibold text-emerald-600">
            {formatCurrency(check.total_paid)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs" style={{ color: 'var(--t-muted)' }}>
            Remaining
          </span>
          <span className="text-sm font-semibold text-rose-600">
            {formatCurrency(check.remaining_balance)}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-semibold" style={{ color: 'var(--t-muted)' }}>
            Progress
          </span>
          <span className="text-xs font-bold" style={{ color: 'var(--t-text)' }}>
            {percentage.toFixed(0)}%
          </span>
        </div>
        <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--t-page-bg)' }}>
          <div
            className={cn(
              'h-full transition-all',
              percentage >= 100 ? 'bg-emerald-500' : 'bg-blue-500'
            )}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
      </div>

      {/* Actions */}
      {check.status === 'active' && onRecordPayment && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onRecordPayment()
          }}
          className="w-full py-2 rounded-xl text-sm font-semibold text-white bg-blue-500 hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
        >
          <TrendingUp size={14} />
          Record Payment
        </button>
      )}
    </div>
  )
}
