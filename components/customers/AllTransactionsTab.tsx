'use client'
import { useState, useMemo } from 'react'
import { 
  ArrowDownLeft, ArrowUpRight, CreditCard, 
  FileText, ArrowLeftRight, Calendar, Filter,
  Banknote, CheckCircle, Money
} from 'lucide-react'
import { useLoanStore } from '@/lib/store/loan.store'
import { useCheckGuaranteeStore } from '@/lib/store/check-guarantee.store'
import { useTransactionStore } from '@/lib/store/transaction.store'
import { useBusinessStore } from '@/lib/store/business.store'
import { formatCurrency } from '@/lib/utils/currency'
import { cn } from '@/lib/utils/cn'

type UnifiedTransactionType = 'loan' | 'check' | 'payment' | 'money_in' | 'money_out' | 'transfer'

interface UnifiedTransaction {
  id: string
  type: UnifiedTransactionType
  amount: number
  direction: 'in' | 'out'
  date: string
  time?: string
  status: string
  note?: string
  referenceId?: string
}

type FilterOption = 'all' | 'loan' | 'check' | 'payment' | 'money_in' | 'money_out' | 'transfer'

const typeConfig: Record<UnifiedTransactionType, { label: string; icon: typeof Banknote; color: string; bgColor: string }> = {
  loan: { label: 'Loan', icon: Money, color: 'text-blue-600', bgColor: 'bg-blue-50' },
  check: { label: 'Check', icon: CreditCard, color: 'text-amber-600', bgColor: 'bg-amber-50' },
  payment: { label: 'Payment', icon: CheckCircle, color: 'text-emerald-600', bgColor: 'bg-emerald-50' },
  money_in: { label: 'Money In', icon: ArrowDownLeft, color: 'text-emerald-600', bgColor: 'bg-emerald-50' },
  money_out: { label: 'Money Out', icon: ArrowUpRight, color: 'text-rose-600', bgColor: 'bg-rose-50' },
  transfer: { label: 'Transfer', icon: ArrowLeftRight, color: 'text-purple-600', bgColor: 'bg-purple-50' },
}

interface AllTransactionsTabProps {
  customerId: string
}

export function AllTransactionsTab({ customerId }: AllTransactionsTabProps) {
  const [filter, setFilter] = useState<FilterOption>('all')
  const [showFilters, setShowFilters] = useState(false)

  const { entries: loanEntries, getCustomerLedger } = useLoanStore()
  const { checkGuarantees, installmentPayments, getCustomerChecks } = useCheckGuaranteeStore()
  const { transactions } = useTransactionStore()
  const { activeBusinessId } = useBusinessStore()
  const bid = activeBusinessId ?? undefined

  const customerLoans = useMemo(() => 
    getCustomerLedger(customerId, bid), 
    [customerId, bid, loanEntries]
  )

  const customerChecks = useMemo(() => 
    getCustomerChecks(customerId),
    [customerId, checkGuarantees]
  )

  const customerPayments = useMemo(() => 
    installmentPayments.filter(p => p.customer_id === customerId),
    [customerId, installmentPayments]
  )

  const customerTransactions = useMemo(() => 
    transactions.filter(t => t.customer_id === customerId),
    [customerId, transactions]
  )

  const allData: UnifiedTransaction[] = useMemo(() => {
    const data: UnifiedTransaction[] = []

    loanEntries
      .filter(e => e.customer_id === customerId && (!bid || e.business_id === bid))
      .forEach(entry => {
        data.push({
          id: entry.id,
          type: 'loan',
          amount: entry.amount,
          direction: entry.direction === 'given' ? 'out' : 'in',
          date: entry.date,
          status: entry.is_settled ? 'settled' : 'active',
          note: entry.note_en,
          referenceId: entry.transaction_id,
        })
      })

    checkGuarantees
      .filter(c => c.customer_id === customerId && (!bid || c.business_id === bid))
      .forEach(check => {
        data.push({
          id: check.id,
          type: 'check',
          amount: check.check_amount,
          direction: 'out',
          date: check.check_date,
          status: check.status,
          note: check.note,
          referenceId: check.check_number,
        })
      })

    installmentPayments
      .filter(p => p.customer_id === customerId && (!bid || p.business_id === bid))
      .forEach(payment => {
        data.push({
          id: payment.id,
          type: 'payment',
          amount: payment.amount,
          direction: 'in',
          date: payment.date,
          status: 'completed',
          note: payment.note,
          referenceId: payment.transaction_id,
        })
      })

    transactions
      .filter(t => t.customer_id === customerId && (!bid || t.business_id === bid))
      .forEach(txn => {
        const isIncome = ['income', 'loan_given', 'advance_received'].includes(txn.type)
        const isTransfer = txn.type === 'transfer'
        
        if (isTransfer) {
          data.push({
            id: txn.id,
            type: 'transfer',
            amount: txn.amount,
            direction: 'in',
            date: txn.date,
            time: txn.time,
            status: txn.is_reversed ? 'reversed' : 'completed',
            note: txn.note_en,
          })
        } else if (isIncome || txn.type === 'expense') {
          data.push({
            id: txn.id,
            type: isIncome ? 'money_in' : 'money_out',
            amount: txn.amount,
            direction: isIncome ? 'in' : 'out',
            date: txn.date,
            time: txn.time,
            status: txn.is_reversed ? 'reversed' : 'completed',
            note: txn.note_en,
          })
        }
      })

    return data.sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time || '00:00'}`).getTime()
      const dateB = new Date(`${b.date}T${b.time || '00:00'}`).getTime()
      return dateB - dateA
    })
  }, [loanEntries, checkGuarantees, installmentPayments, transactions, customerId, bid])

  const filteredData = useMemo(() => {
    if (filter === 'all') return allData
    if (filter === 'transfer') return allData.filter(d => d.type === 'transfer')
    return allData.filter(d => d.type === filter)
  }, [allData, filter])

  const summary = useMemo(() => {
    const totalGiven = allData
      .filter(d => d.direction === 'out')
      .reduce((s, d) => s + d.amount, 0)
    const totalReceived = allData
      .filter(d => d.direction === 'in')
      .reduce((s, d) => s + d.amount, 0)
    return {
      totalGiven,
      totalReceived,
      netBalance: totalReceived - totalGiven,
    }
  }, [allData])

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-PK', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'completed':
        return 'bg-emerald-100 text-emerald-700'
      case 'settled':
        return 'bg-blue-100 text-blue-700'
      case 'cleared':
        return 'bg-gray-100 text-gray-700'
      case 'bounced':
      case 'returned':
      case 'reversed':
        return 'bg-rose-100 text-rose-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl p-3" style={{ background: 'var(--t-card-bg)', border: '1px solid var(--t-card-border)' }}>
          <div className="flex items-center gap-1.5 mb-1">
            <ArrowUpRight size={12} className="text-rose-500" />
            <span className="text-[10px] font-semibold uppercase" style={{ color: 'var(--t-muted)' }}>Given</span>
          </div>
          <p className="text-lg font-black text-rose-600">{formatCurrency(summary.totalGiven)}</p>
        </div>

        <div className="rounded-xl p-3" style={{ background: 'var(--t-card-bg)', border: '1px solid var(--t-card-border)' }}>
          <div className="flex items-center gap-1.5 mb-1">
            <ArrowDownLeft size={12} className="text-emerald-500" />
            <span className="text-[10px] font-semibold uppercase" style={{ color: 'var(--t-muted)' }}>Received</span>
          </div>
          <p className="text-lg font-black text-emerald-600">{formatCurrency(summary.totalReceived)}</p>
        </div>

        <div className="rounded-xl p-3" style={{ background: 'var(--t-card-bg)', border: '1px solid var(--t-card-border)' }}>
          <div className="flex items-center gap-1.5 mb-1">
            <FileText size={12} className="text-blue-500" />
            <span className="text-[10px] font-semibold uppercase" style={{ color: 'var(--t-muted)' }}>Net</span>
          </div>
          <p className={cn(
            'text-lg font-black',
            summary.netBalance >= 0 ? 'text-emerald-600' : 'text-rose-600'
          )}>
            {formatCurrency(Math.abs(summary.netBalance))}
            {summary.netBalance !== 0 && (
              <span className="text-xs font-semibold ml-1">
                {summary.netBalance >= 0 ? 'CR' : 'DR'}
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold"
          style={{ background: 'var(--t-card-bg)', border: '1px solid var(--t-card-border)', color: 'var(--t-text)' }}
        >
          <Filter size={14} />
          {filter === 'all' ? 'All' : typeConfig[filter as UnifiedTransactionType]?.label || filter}
        </button>
        <span className="text-xs font-semibold" style={{ color: 'var(--t-muted)' }}>
          {filteredData.length} transaction{filteredData.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Filter Dropdown */}
      {showFilters && (
        <div className="grid grid-cols-3 gap-2">
          {(['all', 'loan', 'check', 'payment', 'money_in', 'money_out'] as FilterOption[]).map((option) => (
            <button
              key={option}
              onClick={() => {
                setFilter(option)
                setShowFilters(false)
              }}
              className={cn(
                'py-2 px-3 rounded-lg text-xs font-semibold transition-all',
                filter === option ? 'text-white bg-blue-500' : ''
              )}
              style={filter !== option ? { background: 'var(--t-card-bg)', border: '1px solid var(--t-card-border)', color: 'var(--t-text)' } : {}}
            >
              {option === 'all' ? 'All' : typeConfig[option as UnifiedTransactionType]?.label || option}
            </button>
          ))}
        </div>
      )}

      {/* Transaction List */}
      {filteredData.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-14 h-14 rounded-full flex items-center justify-center mb-3" style={{ background: 'var(--t-card-bg)' }}>
            <FileText size={24} style={{ color: 'var(--t-muted)' }} />
          </div>
          <p className="text-base font-bold mb-1" style={{ color: 'var(--t-text)' }}>No transactions</p>
          <p className="text-xs" style={{ color: 'var(--t-muted)' }}>Transactions will appear here once created</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredData.map((txn) => {
            const config = typeConfig[txn.type]
            const Icon = config.icon
            
            return (
              <div
                key={txn.id}
                className="rounded-xl p-3.5"
                style={{ background: 'var(--t-card-bg)', border: '1px solid var(--t-card-border)' }}
              >
                <div className="flex items-start gap-3">
                  <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0', config.bgColor)}>
                    <Icon size={18} className={config.color} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                      <div>
                        <p className="text-sm font-bold" style={{ color: 'var(--t-text)' }}>
                          {config.label}
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <Calendar size={10} style={{ color: 'var(--t-muted)' }} />
                          <span className="text-[11px]" style={{ color: 'var(--t-muted)' }}>
                            {formatDate(txn.date)}
                            {txn.time && ` • ${txn.time}`}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={cn(
                          'text-lg font-black',
                          txn.direction === 'in' ? 'text-emerald-600' : 'text-rose-600'
                        )}>
                          {txn.direction === 'in' ? '+' : '-'}{formatCurrency(txn.amount)}
                        </p>
                        <span className={cn('text-[10px] px-1.5 py-0.5 rounded font-semibold', getStatusColor(txn.status))}>
                          {txn.status}
                        </span>
                      </div>
                    </div>
                    
                    {txn.note && (
                      <p className="text-xs mt-2 line-clamp-2" style={{ color: 'var(--t-muted)' }}>
                        {txn.note}
                      </p>
                    )}
                    
                    {txn.referenceId && (
                      <p className="text-[10px] mt-1" style={{ color: 'var(--t-muted)' }}>
                        Ref: {txn.referenceId}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}