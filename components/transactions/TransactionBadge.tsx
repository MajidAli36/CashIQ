import { type TransactionType } from '@/lib/data/mockTransactions'

interface TransactionBadgeProps {
  type: TransactionType
}

const badgeStyles: Record<TransactionType, string> = {
  sale: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  expense: 'bg-rose-50 text-rose-700 border-rose-200',
  loan: 'bg-amber-50 text-amber-700 border-amber-200',
  transfer: 'bg-blue-50 text-blue-700 border-blue-200',
}

const badgeLabels: Record<TransactionType, string> = {
  sale: 'Sale',
  expense: 'Expense',
  loan: 'Loan',
  transfer: 'Transfer',
}

export function TransactionBadge({ type }: TransactionBadgeProps) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badgeStyles[type]}`}>
      {badgeLabels[type]}
    </span>
  )
}
