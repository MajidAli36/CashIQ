'use client'
import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { useTransactionStore } from '@/lib/store/transaction.store'
import { useSettingsStore } from '@/lib/store/settings.store'
import { useBusinessStore } from '@/lib/store/business.store'
import { useLoanStore } from '@/lib/store/loan.store'
import { formatCurrency } from '@/lib/utils/currency'
import {
  TrendingUp, TrendingDown, ArrowDownLeft, ArrowUpRight,
  Banknote, AlertCircle, ArrowLeftRight, ChevronRight,
} from 'lucide-react'

export default function V2DashboardPage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  const bid           = useBusinessStore(s => s.activeBusinessId) ?? undefined
  const wallets       = useSettingsStore(s => s.wallets)
  const categories    = useSettingsStore(s => s.categories)
  const shop          = useSettingsStore(s => s.shop)
  const getWalletBalance  = useTransactionStore(s => s.getWalletBalance)
  const getTotalIncome    = useTransactionStore(s => s.getTotalIncome)
  const getTotalExpense   = useTransactionStore(s => s.getTotalExpense)
  const getRecent         = useTransactionStore(s => s.getRecent)
  const getTotalToReceive = useLoanStore(s => s.getTotalToReceive)
  const getTotalToGive    = useLoanStore(s => s.getTotalToGive)

  const now            = new Date()
  const today          = now.toISOString().split('T')[0]
  const monthStart     = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`

  const stats = useMemo(() => {
    if (!mounted) return { totalBalance: 0, monthIncome: 0, monthExpense: 0, todayIncome: 0, todayExpense: 0 }
    const enabledWallets = bid
      ? wallets.filter(w => w.business_id === bid && w.is_enabled)
      : wallets.filter(w => w.is_enabled)
    const totalBalance  = enabledWallets.reduce((s, w) => s + getWalletBalance(w.id, bid), 0)
    const monthIncome   = getTotalIncome(monthStart, today, bid)
    const monthExpense  = getTotalExpense(monthStart, today, bid)
    const todayIncome   = getTotalIncome(today, today, bid)
    const todayExpense  = getTotalExpense(today, today, bid)
    return { totalBalance, monthIncome, monthExpense, todayIncome, todayExpense }
  }, [mounted, bid, wallets, getWalletBalance, getTotalIncome, getTotalExpense, monthStart, today])

  const toReceive  = mounted ? getTotalToReceive(bid) : 0
  const toGive     = mounted ? getTotalToGive(bid)    : 0
  const recent     = mounted
    ? getRecent(20, bid)
        .filter(t => !['opening_balance', 'adjustment', 'reversal', 'advance_offset', 'advance_received'].includes(t.type))
        .slice(0, 5)
    : []

  const getCategoryName = (catId: string) =>
    categories.find(c => c.id === catId)?.name_en || 'Transaction'

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-PK', { day: 'numeric', month: 'short' })

  if (!mounted) return null

  return (
    <div className="min-h-screen pb-24" style={{ background: '#F8FAFC' }}>

      {/* ── HERO ── */}
      <div className="bg-navy-gradient px-5 pt-14 pb-8 relative overflow-hidden">
        <div className="absolute -top-16 right-0 w-48 h-48 rounded-full pointer-events-none"
          style={{ background: 'rgba(0,196,180,0.08)', filter: 'blur(60px)' }} />

        {/* Shop label */}
        {shop.name ? (
          <p className="text-[10px] font-bold uppercase tracking-widest mb-2"
            style={{ color: '#00C4B4' }}>
            {shop.name}
          </p>
        ) : null}

        {/* Balance */}
        <p className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-1">Total Balance</p>
        <p className="text-white font-black text-3xl tracking-tight mb-4">
          {formatCurrency(stats.totalBalance)}
        </p>

        {/* Today chips */}
        <div className="flex gap-2">
          <div className="glass-dark rounded-xl px-3 py-2 flex items-center gap-1.5">
            <ArrowDownLeft size={13} style={{ color: '#4CAF50' }} />
            <span className="text-white/50 text-[10px] font-semibold">Today In</span>
            <span className="text-[12px] font-bold" style={{ color: '#4CAF50' }}>
              {formatCurrency(stats.todayIncome)}
            </span>
          </div>
          <div className="glass-dark rounded-xl px-3 py-2 flex items-center gap-1.5">
            <ArrowUpRight size={13} style={{ color: '#FF5C5C' }} />
            <span className="text-white/50 text-[10px] font-semibold">Today Out</span>
            <span className="text-[12px] font-bold" style={{ color: '#FF5C5C' }}>
              {formatCurrency(stats.todayExpense)}
            </span>
          </div>
        </div>
      </div>

      {/* ── QUICK ACTIONS ── */}
      <div className="mx-4 -mt-4 relative z-10 bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <div className="flex gap-2">
          <Link href="/add?type=income"
            className="flex-1 flex flex-col items-center justify-center gap-1.5 py-4 rounded-xl"
            style={{ background: '#E8F5E9' }}>
            <ArrowDownLeft size={22} style={{ color: '#4CAF50' }} />
            <span className="text-xs font-bold" style={{ color: '#4CAF50' }}>Money In</span>
          </Link>
          <Link href="/add?type=expense"
            className="flex-1 flex flex-col items-center justify-center gap-1.5 py-4 rounded-xl"
            style={{ background: '#FFEBEB' }}>
            <ArrowUpRight size={22} style={{ color: '#FF5C5C' }} />
            <span className="text-xs font-bold" style={{ color: '#FF5C5C' }}>Money Out</span>
          </Link>
          <Link href="/add?type=loan"
            className="flex-1 flex flex-col items-center justify-center gap-1.5 py-4 rounded-xl"
            style={{ background: '#FEF3C7' }}>
            <Banknote size={22} style={{ color: '#F59E0B' }} />
            <span className="text-xs font-bold" style={{ color: '#F59E0B' }}>New Loan</span>
          </Link>
        </div>
      </div>

      {/* ── THIS MONTH ── */}
      <div className="px-4 mt-6">
        <p className="text-[18px] font-black mb-3" style={{ color: '#0B0F1A' }}>This Month</p>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: '#E8F5E9' }}>
                <TrendingUp size={16} style={{ color: '#4CAF50' }} />
              </div>
              <span className="text-sm font-semibold" style={{ color: '#64748B' }}>Income</span>
            </div>
            <p className="text-xl font-black" style={{ color: '#4CAF50' }}>
              {formatCurrency(stats.monthIncome)}
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: '#FFEBEB' }}>
                <TrendingDown size={16} style={{ color: '#FF5C5C' }} />
              </div>
              <span className="text-sm font-semibold" style={{ color: '#64748B' }}>Expense</span>
            </div>
            <p className="text-xl font-black" style={{ color: '#FF5C5C' }}>
              {formatCurrency(stats.monthExpense)}
            </p>
          </div>
        </div>
      </div>

      {/* ── LOAN ALERT ── */}
      {(toReceive > 0 || toGive > 0) && (
        <div className="px-4 mt-4">
          <div className="rounded-2xl p-4 flex items-start gap-3" style={{ background: '#FEF3C7' }}>
            <AlertCircle size={20} style={{ color: '#F59E0B', flexShrink: 0, marginTop: 1 }} />
            <div className="flex-1 min-w-0">
              {toReceive > 0 && (
                <p className="text-sm font-semibold" style={{ color: '#92400E' }}>
                  You have {formatCurrency(toReceive)} to collect from customers
                </p>
              )}
              {toGive > 0 && (
                <p className="text-sm font-semibold mt-0.5" style={{ color: '#92400E' }}>
                  You owe {formatCurrency(toGive)} to people
                </p>
              )}
              <Link href="/v2/people"
                className="text-xs font-bold mt-1 inline-block"
                style={{ color: '#B45309' }}>
                View People →
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ── RECENT TRANSACTIONS ── */}
      <div className="px-4 mt-6">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[18px] font-black" style={{ color: '#0B0F1A' }}>Recent</p>
          <Link href="/v2/transactions"
            className="flex items-center gap-0.5 text-sm font-semibold"
            style={{ color: '#00C4B4' }}>
            See All <ChevronRight size={14} />
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {recent.length === 0 ? (
            <div className="py-10 text-center">
              <ArrowLeftRight size={32} className="mx-auto mb-2" style={{ color: '#CBD5E1' }} />
              <p className="text-sm" style={{ color: '#64748B' }}>No transactions yet</p>
              <Link href="/add"
                className="text-sm font-bold mt-1 inline-block"
                style={{ color: '#00C4B4' }}>
                Add your first →
              </Link>
            </div>
          ) : (
            recent.map((tx, i) => {
              const isIncome  = tx.type === 'income'
              const isExpense = tx.type === 'expense'
              const isLoan    = tx.type === 'loan_given' || tx.type === 'loan_received'
              const iconColor = isIncome ? '#4CAF50' : isExpense ? '#FF5C5C' : isLoan ? '#F59E0B' : '#94A3B8'
              const iconBg    = isIncome ? '#E8F5E9' : isExpense ? '#FFEBEB' : isLoan ? '#FEF3C7' : '#F1F5F9'
              const amountColor = isIncome ? '#4CAF50' : isExpense ? '#FF5C5C' : isLoan ? '#F59E0B' : '#64748B'
              const prefix    = isIncome ? '+' : isExpense ? '-' : ''

              return (
                <div
                  key={tx.id}
                  className={`flex items-center gap-3 px-4 py-3 ${i > 0 ? 'border-t border-gray-100' : ''}`}
                >
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: iconBg }}>
                    {isIncome  ? <TrendingUp   size={16} style={{ color: iconColor }} /> : null}
                    {isExpense ? <TrendingDown  size={16} style={{ color: iconColor }} /> : null}
                    {isLoan    ? <Banknote      size={16} style={{ color: iconColor }} /> : null}
                    {!isIncome && !isExpense && !isLoan
                      ? <ArrowLeftRight size={16} style={{ color: iconColor }} />
                      : null}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: '#0B0F1A' }}>
                      {getCategoryName(tx.category_id)}
                    </p>
                    <p className="text-[11px]" style={{ color: '#64748B' }}>
                      {formatDate(tx.date)}
                    </p>
                  </div>
                  <p className="text-sm font-black flex-shrink-0" style={{ color: amountColor }}>
                    {prefix}{formatCurrency(tx.amount)}
                  </p>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
