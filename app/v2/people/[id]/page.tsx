'use client'
import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { useLoanStore } from '@/lib/store/loan.store'
import { useBusinessStore } from '@/lib/store/business.store'
import { useCheckGuaranteeStore } from '@/lib/store/check-guarantee.store'
import { formatCurrency } from '@/lib/utils/currency'
import { useParams, useRouter } from 'next/navigation'
import { ChevronLeft, Plus, CheckCircle2, Clock, XCircle } from 'lucide-react'
import type { CheckStatus } from '@/lib/types'

type Tab = 'transactions' | 'loans' | 'checks'

export default function V2PersonDetailPage() {
  const [mounted, setMounted] = useState(false)
  const [tab, setTab]         = useState<Tab>('transactions')

  useEffect(() => { setMounted(true) }, [])

  const params   = useParams()
  const router   = useRouter()
  const customerId = params?.id as string

  const bid                = useBusinessStore(s => s.activeBusinessId) ?? undefined
  const customers          = useLoanStore(s => s.customers)
  const getCustomerLedger  = useLoanStore(s => s.getCustomerLedger)
  const getCustomerBalance = useLoanStore(s => s.getCustomerBalance)
  const getCustomerChecks  = useCheckGuaranteeStore(s => s.getCustomerChecks)

  const customer = customers.find(c => c.id === customerId)

  const ledger = useMemo(() => {
    if (!mounted) return []
    return getCustomerLedger(customerId, bid)
  }, [mounted, customerId, bid, getCustomerLedger])

  const checks = useMemo(() => {
    if (!mounted) return []
    return getCustomerChecks(customerId)
  }, [mounted, customerId, getCustomerChecks])

  const balance = mounted ? getCustomerBalance(customerId, bid) : 0

  const totalGiven = ledger
    .filter(e => e.direction === 'given' && !e.is_settled)
    .reduce((sum, e) => sum + e.amount, 0)

  const totalReceived = ledger
    .filter(e => e.direction === 'received' && !e.is_settled)
    .reduce((sum, e) => sum + e.amount, 0)

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })

  const checkStatusConfig: Record<CheckStatus, { label: string; color: string; bg: string; icon: typeof CheckCircle2 }> = {
    active:    { label: 'Active',    color: '#F59E0B', bg: '#FEF3C7', icon: Clock },
    cleared:   { label: 'Cleared',   color: '#4CAF50', bg: '#E8F5E9', icon: CheckCircle2 },
    bounced:   { label: 'Bounced',   color: '#FF5C5C', bg: '#FFEBEB', icon: XCircle },
    returned:  { label: 'Returned',  color: '#94A3B8', bg: '#F1F5F9', icon: XCircle },
    cancelled: { label: 'Cancelled', color: '#94A3B8', bg: '#F1F5F9', icon: XCircle },
  }

  if (!mounted) return null

  if (!customer) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-8 text-center"
        style={{ background: '#F8FAFC' }}>
        <p className="text-lg font-bold" style={{ color: '#0B0F1A' }}>Customer not found</p>
        <p className="text-sm" style={{ color: '#64748B' }}>
          This customer does not exist or may have been removed.
        </p>
        <button
          onClick={() => router.back()}
          className="text-sm font-bold px-5 py-2.5 rounded-xl"
          style={{ background: '#00C4B4', color: '#fff' }}
        >
          Go Back
        </button>
      </div>
    )
  }

  const getInitials = (name: string) =>
    name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)

  const TABS: { label: string; value: Tab }[] = [
    { label: 'Transactions', value: 'transactions' },
    { label: 'Loans', value: 'loans' },
    { label: 'Checks', value: 'checks' },
  ]

  return (
    <div className="min-h-screen pb-24" style={{ background: '#F8FAFC' }}>

      {/* ── STICKY HEADER ── */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-100">
        <div className="flex items-center gap-3 px-4 py-3.5">
          <button
            onClick={() => router.back()}
            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: '#F1F5F9' }}
          >
            <ChevronLeft size={18} style={{ color: '#0B0F1A' }} />
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-base font-black truncate" style={{ color: '#0B0F1A' }}>
              {customer.name}
            </p>
            {customer.phone ? (
              <p className="text-xs" style={{ color: '#94A3B8' }}>{customer.phone}</p>
            ) : null}
          </div>
          <Link href="/add"
            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: '#00C4B4' }}>
            <Plus size={16} color="#fff" strokeWidth={2.5} />
          </Link>
        </div>
      </div>

      <div className="px-4 pt-4">

        {/* ── SUMMARY CARDS ── */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-3">
            <p className="text-[10px] font-bold uppercase tracking-wider mb-1.5"
              style={{ color: '#94A3B8' }}>Given</p>
            <p className="text-base font-black" style={{ color: '#FF5C5C' }}>
              {formatCurrency(totalGiven)}
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-3">
            <p className="text-[10px] font-bold uppercase tracking-wider mb-1.5"
              style={{ color: '#94A3B8' }}>Received</p>
            <p className="text-base font-black" style={{ color: '#4CAF50' }}>
              {formatCurrency(totalReceived)}
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-3">
            <p className="text-[10px] font-bold uppercase tracking-wider mb-1.5"
              style={{ color: '#94A3B8' }}>Balance</p>
            <p className="text-base font-black"
              style={{ color: balance > 0 ? '#00C4B4' : balance < 0 ? '#FF5C5C' : '#94A3B8' }}>
              {balance === 0 ? 'Settled' : formatCurrency(Math.abs(balance))}
            </p>
          </div>
        </div>

        {/* ── ACTION BUTTONS ── */}
        <div className="flex gap-3 mb-4">
          <Link
            href="/add"
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm"
            style={{ background: '#E8F5E9', color: '#4CAF50' }}
          >
            <Plus size={16} />
            Add Payment
          </Link>
          <Link
            href="/add?type=loan"
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm"
            style={{ background: '#CCFBF1', color: '#00C4B4' }}
          >
            <Plus size={16} />
            Add Loan
          </Link>
        </div>

        {/* ── TABS ── */}
        <div className="flex gap-1 mb-4 bg-white rounded-xl p-1 shadow-sm border border-gray-100">
          {TABS.map(t => (
            <button
              key={t.value}
              onClick={() => setTab(t.value)}
              className="flex-1 py-2 rounded-lg text-sm font-semibold transition-all"
              style={{
                background: tab === t.value ? '#0B0F1A' : 'transparent',
                color: tab === t.value ? '#fff' : '#94A3B8',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ── TRANSACTIONS TAB ── */}
        {tab === 'transactions' && (
          <div>
            {ledger.length === 0 ? (
              <div className="mt-8 text-center">
                <p className="text-sm" style={{ color: '#94A3B8' }}>No transactions yet</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {ledger.map((entry, i) => (
                  <div
                    key={entry.id}
                    className={`flex items-center gap-3 px-4 py-3.5 ${i > 0 ? 'border-t border-gray-100' : ''}`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className="text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                          style={{
                            background: entry.direction === 'given' ? '#FEF3C7' : '#E8F5E9',
                            color:      entry.direction === 'given' ? '#B45309' : '#388E3C',
                          }}
                        >
                          {entry.direction === 'given' ? 'Loan' : 'Received'}
                        </span>
                        {entry.is_settled && (
                          <span
                            className="text-xs font-semibold px-2 py-0.5 rounded-full"
                            style={{ background: '#F1F5F9', color: '#94A3B8' }}
                          >
                            Settled
                          </span>
                        )}
                      </div>
                      {entry.note_en ? (
                        <p className="text-xs mt-1 truncate" style={{ color: '#94A3B8' }}>
                          {entry.note_en}
                        </p>
                      ) : null}
                      <p className="text-[11px] mt-0.5" style={{ color: '#CBD5E1' }}>
                        {formatDate(entry.date)}
                      </p>
                    </div>
                    <p
                      className="text-sm font-black flex-shrink-0"
                      style={{ color: entry.direction === 'given' ? '#F59E0B' : '#4CAF50' }}
                    >
                      {formatCurrency(entry.amount)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── LOANS TAB ── */}
        {tab === 'loans' && (
          <div>
            {/* Active loans */}
            {ledger.filter(e => !e.is_settled).length > 0 && (
              <div className="mb-4">
                <p className="text-xs font-bold uppercase tracking-wider mb-2 px-1"
                  style={{ color: '#F59E0B' }}>Active</p>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  {ledger.filter(e => !e.is_settled).map((entry, i) => (
                    <div
                      key={entry.id}
                      className={`flex items-center justify-between px-4 py-3.5 ${i > 0 ? 'border-t border-gray-100' : ''}`}
                    >
                      <div>
                        <p className="text-sm font-semibold" style={{ color: '#0B0F1A' }}>
                          {entry.direction === 'given' ? 'Loan Given' : 'Loan Received'}
                        </p>
                        <p className="text-xs" style={{ color: '#94A3B8' }}>{formatDate(entry.date)}</p>
                      </div>
                      <p className="text-sm font-black"
                        style={{ color: entry.direction === 'given' ? '#F59E0B' : '#4CAF50' }}>
                        {formatCurrency(entry.amount)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Settled loans */}
            {ledger.filter(e => e.is_settled).length > 0 && (
              <div>
                <p className="text-xs font-bold uppercase tracking-wider mb-2 px-1"
                  style={{ color: '#94A3B8' }}>Settled</p>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  {ledger.filter(e => e.is_settled).map((entry, i) => (
                    <div
                      key={entry.id}
                      className={`flex items-center justify-between px-4 py-3.5 ${i > 0 ? 'border-t border-gray-100' : ''}`}
                    >
                      <div>
                        <p className="text-sm font-semibold" style={{ color: '#94A3B8' }}>
                          {entry.direction === 'given' ? 'Loan Given' : 'Loan Received'}
                        </p>
                        <p className="text-xs" style={{ color: '#CBD5E1' }}>{formatDate(entry.date)}</p>
                      </div>
                      <p className="text-sm font-black" style={{ color: '#CBD5E1' }}>
                        {formatCurrency(entry.amount)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {ledger.length === 0 && (
              <div className="mt-8 text-center">
                <p className="text-sm" style={{ color: '#94A3B8' }}>No loan entries</p>
              </div>
            )}
          </div>
        )}

        {/* ── CHECKS TAB ── */}
        {tab === 'checks' && (
          <div>
            {checks.length === 0 ? (
              <div className="mt-8 text-center">
                <p className="text-sm" style={{ color: '#94A3B8' }}>No checks recorded</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {checks.map((chk, i) => {
                  const cfg = checkStatusConfig[chk.status]
                  const StatusIcon = cfg.icon
                  return (
                    <div
                      key={chk.id}
                      className={`px-4 py-3.5 ${i > 0 ? 'border-t border-gray-100' : ''}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-sm font-bold truncate" style={{ color: '#0B0F1A' }}>
                              {chk.bank_name}
                            </p>
                            <span
                              className="flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0"
                              style={{ background: cfg.bg, color: cfg.color }}
                            >
                              <StatusIcon size={10} />
                              {cfg.label}
                            </span>
                          </div>
                          <p className="text-xs" style={{ color: '#94A3B8' }}>
                            Check #{chk.check_number} · {formatDate(chk.check_date)}
                          </p>
                          {chk.total_paid > 0 && (
                            <p className="text-[11px] mt-1" style={{ color: '#94A3B8' }}>
                              Paid {formatCurrency(chk.total_paid)} of {formatCurrency(chk.check_amount)}
                            </p>
                          )}
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-base font-black" style={{ color: '#0B0F1A' }}>
                            {formatCurrency(chk.check_amount)}
                          </p>
                          {chk.remaining_balance > 0 && chk.status !== 'cleared' && (
                            <p className="text-[11px]" style={{ color: '#FF5C5C' }}>
                              {formatCurrency(chk.remaining_balance)} left
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
        )}
      </div>
    </div>
  )
}
