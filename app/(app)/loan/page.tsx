'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLoanStore } from '@/lib/store/loan.store'
import { useBusinessStore } from '@/lib/store/business.store'
import { useTranslation } from '@/lib/hooks/useTranslation'
import { formatCurrency } from '@/lib/utils/currency'
import { formatDate } from '@/lib/utils/date'
import { formatPhone as fPhone } from '@/lib/utils/phone'
import { GradientPageHeader } from '@/components/layout/GradientPageHeader'
import { SearchBar } from '@/components/ui/SearchBar'
import { EmptyState } from '@/components/ui/EmptyState'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils/cn'

export default function LoanPage() {
  const { t } = useTranslation()
  const { customers, getCustomerBalance } = useLoanStore()
  const { activeBusinessId } = useBusinessStore()
  const bid = activeBusinessId ?? undefined

  const [filter, setFilter] = useState<'all' | 'given' | 'received'>('all')
  const [search, setSearch] = useState('')

  const bizCustomers = bid
    ? customers.filter(c => !c.business_id || c.business_id === bid)
    : customers

  const filtered = bizCustomers.filter(c => {
    const bal = getCustomerBalance(c.id, bid)
    if (filter === 'given' && bal <= 0) return false
    if (filter === 'received' && bal >= 0) return false
    if (search && !c.name.toLowerCase().includes(search.toLowerCase()) && !c.phone.includes(search)) return false
    return true
  })

  const totalToReceive = bizCustomers.reduce((sum, c) => {
    const b = getCustomerBalance(c.id, bid)
    return b > 0 ? sum + b : sum
  }, 0)
  const totalToGive = bizCustomers.reduce((sum, c) => {
    const b = getCustomerBalance(c.id, bid)
    return b < 0 ? sum + Math.abs(b) : sum
  }, 0)

  return (
    <div className="min-h-screen bg-surface pb-20">
      <GradientPageHeader title={t('loans.loans')} backTo="/dashboard" />

      <div className="px-4 py-4" style={{ background: 'var(--t-card-bg)' }}>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-income-light rounded-2xl p-3 text-center">
            <p className="text-xs text-income font-semibold mb-1">{t('dashboard.toReceive')}</p>
            <p className="text-lg font-bold text-income">{formatCurrency(totalToReceive)}</p>
          </div>
          <div className="bg-expense-light rounded-2xl p-3 text-center">
            <p className="text-xs text-expense font-semibold mb-1">{t('dashboard.toGive')}</p>
            <p className="text-lg font-bold text-expense">{formatCurrency(totalToGive)}</p>
          </div>
        </div>
      </div>

      <div className="px-4 pt-4">
        <div className="flex gap-2 mb-3 overflow-x-auto">
          {[{v:'all',l:'loanAll'},{v:'given',l:'loanGiven'},{v:'received',l:'loanReceived'}].map(f => (
            <button key={f.v} onClick={() => setFilter(f.v as any)}
              className={cn('flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all',
                filter === f.v ? 'text-white' : 'text-muted')}
              style={filter === f.v ? {
                background: 'var(--t-accent)',
                borderColor: 'var(--t-accent)',
              } : {
                background: 'var(--t-card-bg)',
                borderColor: 'var(--t-card-border)',
              }}>
              {t(`loans.${f.l}`)}
            </button>
          ))}
        </div>

        <div className="mb-4">
          <SearchBar value={search} onChange={setSearch} placeholder={t('customers.searchNameOrPhone')} />
        </div>

        {filtered.length === 0 ? (
          <EmptyState icon="🤝" title={t('loans.noLoans')}
            description={t('loans.addFirstLoan')}
            action={<Link href="/add?type=loan" className="px-6 py-3 bg-loan text-white rounded-xl text-sm font-semibold">{t('loans.addFirstLoan')}</Link>}
          />
        ) : (
          <div className="space-y-2">
            {filtered.map(c => {
              const bal = getCustomerBalance(c.id)
              const isPositive = bal >= 0
              const initials = c.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0,2)
              return (
                <Link key={c.id} href={`/loan/${c.id}`}
                  className="flex items-center gap-3 bg-white rounded-2xl p-4 border border-border card-tap">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${isPositive ? 'bg-income-light text-income' : 'bg-expense-light text-expense'}`}>
                    {initials}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-navy">{c.name}</p>
                    <p className="text-xs text-muted">{fPhone(c.phone)}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-bold ${isPositive ? 'text-income' : 'text-expense'}`}>
                      {formatCurrency(Math.abs(bal))}
                    </p>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${isPositive ? 'bg-income-light text-income' : 'bg-expense-light text-expense'}`}>
                      {isPositive ? 'لینا ہے' : 'دینا ہے'}
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>

      <Link href="/add?type=loan"
        className="fixed bottom-24 right-4 w-14 h-14 rounded-full flex items-center justify-center shadow-lg text-white"
        style={{ background: 'var(--t-accent)' }}>
        <Plus size={24} strokeWidth={2.5} />
      </Link>
    </div>
  )
}
