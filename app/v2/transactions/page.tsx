'use client'
import { useEffect, useState, useMemo } from 'react'
import { useTransactionStore } from '@/lib/store/transaction.store'
import { useSettingsStore } from '@/lib/store/settings.store'
import { useBusinessStore } from '@/lib/store/business.store'
import { useLoanStore } from '@/lib/store/loan.store'
import { formatCurrency } from '@/lib/utils/currency'
import { TrendingUp, TrendingDown, ArrowLeftRight, Banknote, Search, ArrowDownLeft } from 'lucide-react'
import type { Transaction } from '@/lib/types'

type FilterType = 'all' | 'income' | 'expense' | 'loan'
type DateFilter = 'today' | 'week' | 'month' | 'all'

export default function V2TransactionsPage() {
  const [mounted, setMounted]           = useState(false)
  const [typeFilter, setTypeFilter]     = useState<FilterType>('all')
  const [dateFilter, setDateFilter]     = useState<DateFilter>('all')
  const [search, setSearch]             = useState('')

  useEffect(() => { setMounted(true) }, [])

  const bid        = useBusinessStore(s => s.activeBusinessId) ?? undefined
  const categories = useSettingsStore(s => s.categories)
  const wallets    = useSettingsStore(s => s.wallets)
  const allTxns    = useTransactionStore(s => s.transactions)
  const loanEntries = useLoanStore(s => s.entries)
  const customers  = useLoanStore(s => s.customers)

  const now = new Date()
  const todayStr  = now.toISOString().split('T')[0]
  const weekStart = new Date(now); weekStart.setDate(now.getDate() - 6)
  const weekStr   = weekStart.toISOString().split('T')[0]
  const monthStr  = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`

  const getCategoryName = (catId: string) =>
    categories.find(c => c.id === catId)?.name_en || 'Transaction'

  const getWalletName = (wId: string) =>
    wallets.find(w => w.id === wId)?.name || ''

  const getCustomerName = (cId?: string) =>
    cId ? (customers.find(c => c.id === cId)?.name || '') : ''

  const filtered = useMemo(() => {
    if (!mounted) return []

    const datePass = (date: string) => {
      if (dateFilter === 'today') return date === todayStr
      if (dateFilter === 'week')  return date >= weekStr
      if (dateFilter === 'month') return date >= monthStr
      return true
    }

    const typePass = (t: Transaction) => {
      if (typeFilter === 'income')  return t.type === 'income'
      if (typeFilter === 'expense') return t.type === 'expense'
      if (typeFilter === 'loan')    return t.type === 'loan_given' || t.type === 'loan_received'
      return true
    }

    const searchPass = (t: Transaction) => {
      if (!search) return true
      const q = search.toLowerCase()
      const catName = getCategoryName(t.category_id).toLowerCase()
      const note    = (t.note_en || '').toLowerCase()
      const cust    = getCustomerName(t.customer_id).toLowerCase()
      return catName.includes(q) || note.includes(q) || cust.includes(q)
    }

    return allTxns
      .filter(t => !t.is_deleted && !t.is_reversed)
      .filter(t => !bid || t.business_id === bid)
      .filter(t => !['reversal', 'advance_offset', 'opening_balance', 'adjustment'].includes(t.type))
      .filter(t => typePass(t))
      .filter(t => datePass(t.date))
      .filter(t => searchPass(t))
      .sort((a, b) => b.date.localeCompare(a.date) || b.created_at.localeCompare(a.created_at))
  }, [mounted, allTxns, bid, typeFilter, dateFilter, search, todayStr, weekStr, monthStr])

  // Group by date
  const grouped = useMemo(() => {
    const map = new Map<string, Transaction[]>()
    for (const t of filtered) {
      const list = map.get(t.date) ?? []
      list.push(t)
      map.set(t.date, list)
    }
    return map
  }, [filtered])

  const dateKeys = Array.from(grouped.keys())

  const formatDateHeader = (d: string) =>
    new Date(d).toLocaleDateString('en-PK', { weekday: 'short', day: 'numeric', month: 'short' })

  const TYPE_FILTERS: { label: string; value: FilterType }[] = [
    { label: 'All', value: 'all' },
    { label: 'Income', value: 'income' },
    { label: 'Expense', value: 'expense' },
    { label: 'Loan', value: 'loan' },
  ]

  const DATE_FILTERS: { label: string; value: DateFilter }[] = [
    { label: 'Today', value: 'today' },
    { label: 'This Week', value: 'week' },
    { label: 'This Month', value: 'month' },
    { label: 'All Time', value: 'all' },
  ]

  if (!mounted) return null

  return (
    <div className="min-h-screen pb-24" style={{ background: '#F8FAFC' }}>

      {/* ── HEADER ── */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-100">
        <div className="px-4 py-4">
          <h1 className="text-[22px] font-black" style={{ color: '#0B0F1A' }}>Transactions</h1>
        </div>

        {/* Type filter pills */}
        <div className="px-4 pb-2 flex gap-2 overflow-x-auto scrollbar-none">
          {TYPE_FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => setTypeFilter(f.value)}
              className="flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold transition-all"
              style={{
                background: typeFilter === f.value ? '#00C4B4' : '#F1F5F9',
                color: typeFilter === f.value ? '#fff' : '#64748B',
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Date filter pills */}
        <div className="px-4 pb-2 flex gap-2 overflow-x-auto scrollbar-none">
          {DATE_FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => setDateFilter(f.value)}
              className="flex-shrink-0 px-3 py-1 rounded-full text-xs font-semibold transition-all"
              style={{
                background: dateFilter === f.value ? '#0B0F1A' : 'transparent',
                color: dateFilter === f.value ? '#fff' : '#94A3B8',
                border: dateFilter === f.value ? '1px solid #0B0F1A' : '1px solid #E2E8F0',
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="px-4 pb-3">
          <div className="flex items-center gap-2 rounded-xl px-3 py-2.5"
            style={{ background: '#F1F5F9' }}>
            <Search size={16} style={{ color: '#94A3B8', flexShrink: 0 }} />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search transactions..."
              className="flex-1 bg-transparent text-sm outline-none"
              style={{ color: '#0B0F1A' }}
            />
          </div>
        </div>
      </div>

      {/* ── LIST ── */}
      <div className="px-4 pt-3">
        {dateKeys.length === 0 ? (
          <div className="mt-16 text-center">
            <ArrowLeftRight size={40} className="mx-auto mb-3" style={{ color: '#CBD5E1' }} />
            <p className="text-base font-semibold" style={{ color: '#64748B' }}>No transactions found</p>
            <p className="text-sm mt-1" style={{ color: '#94A3B8' }}>Try changing your filters</p>
          </div>
        ) : (
          dateKeys.map(date => (
            <div key={date} className="mb-4">
              {/* Date header */}
              <p className="text-xs font-bold uppercase tracking-wider mb-2 px-1"
                style={{ color: '#94A3B8' }}>
                {formatDateHeader(date)}
              </p>

              {/* Transactions for this date */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {(grouped.get(date) ?? []).map((tx, i) => {
                  const isIncome  = tx.type === 'income'
                  const isExpense = tx.type === 'expense'
                  const isLoanGiven = tx.type === 'loan_given'
                  const isLoanRec   = tx.type === 'loan_received'
                  const isLoan    = isLoanGiven || isLoanRec

                  const iconColor  = isIncome ? '#4CAF50' : isExpense ? '#FF5C5C' : isLoan ? '#F59E0B' : '#94A3B8'
                  const iconBg     = isIncome ? '#E8F5E9' : isExpense ? '#FFEBEB' : isLoan ? '#FEF3C7' : '#F1F5F9'
                  const amtColor   = isIncome ? '#4CAF50' : isExpense ? '#FF5C5C' : isLoanGiven ? '#F59E0B' : isLoanRec ? '#00C4B4' : '#64748B'
                  const amtPrefix  = isIncome ? '+' : isExpense ? '-' : ''
                  const label      = isLoanGiven ? 'Loan' : isLoanRec ? 'Received' : ''
                  const catName    = getCategoryName(tx.category_id)
                  const note       = tx.note_en || getCustomerName(tx.customer_id)
                  const walletName = getWalletName(tx.wallet_id)

                  return (
                    <div
                      key={tx.id}
                      className={`flex items-center gap-3 px-4 py-3 ${i > 0 ? 'border-t border-gray-100' : ''}`}
                    >
                      {/* Icon */}
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: iconBg }}>
                        {isIncome    ? <TrendingUp   size={16} style={{ color: iconColor }} /> : null}
                        {isExpense   ? <TrendingDown  size={16} style={{ color: iconColor }} /> : null}
                        {isLoan      ? <Banknote      size={16} style={{ color: iconColor }} /> : null}
                        {!isIncome && !isExpense && !isLoan
                          ? <ArrowLeftRight size={16} style={{ color: iconColor }} />
                          : null}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-sm font-semibold truncate" style={{ color: '#0B0F1A' }}>
                            {catName}
                          </p>
                          {label ? (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                              style={{
                                background: isLoanGiven ? '#FEF3C7' : '#CCFBF1',
                                color: isLoanGiven ? '#B45309' : '#0D9488',
                              }}>
                              {label}
                            </span>
                          ) : null}
                        </div>
                        {note ? (
                          <p className="text-[11px] truncate" style={{ color: '#94A3B8' }}>{note}</p>
                        ) : null}
                      </div>

                      {/* Amount + wallet */}
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-black" style={{ color: amtColor }}>
                          {amtPrefix}{formatCurrency(tx.amount)}
                        </p>
                        {walletName ? (
                          <p className="text-[10px] mt-0.5" style={{ color: '#CBD5E1' }}>{walletName}</p>
                        ) : null}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
