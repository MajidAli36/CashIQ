'use client'
import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { useLoanStore } from '@/lib/store/loan.store'
import { useBusinessStore } from '@/lib/store/business.store'
import { formatCurrency } from '@/lib/utils/currency'
import { Search, Plus, Users } from 'lucide-react'

export default function V2PeoplePage() {
  const [mounted, setMounted] = useState(false)
  const [search, setSearch]   = useState('')

  useEffect(() => { setMounted(true) }, [])

  const bid               = useBusinessStore(s => s.activeBusinessId) ?? undefined
  const getBusinessCustomers = useLoanStore(s => s.getBusinessCustomers)
  const getCustomerBalance   = useLoanStore(s => s.getCustomerBalance)
  const getTotalToReceive    = useLoanStore(s => s.getTotalToReceive)
  const getTotalToGive       = useLoanStore(s => s.getTotalToGive)

  const customers = useMemo(() => {
    if (!mounted || !bid) return []
    return getBusinessCustomers(bid)
  }, [mounted, bid, getBusinessCustomers])

  const filtered = useMemo(() => {
    if (!search) return customers
    const q = search.toLowerCase()
    return customers.filter(c =>
      c.name.toLowerCase().includes(q) || c.phone.includes(q)
    )
  }, [customers, search])

  const toReceive = mounted ? getTotalToReceive(bid) : 0
  const toGive    = mounted ? getTotalToGive(bid)    : 0

  const getInitials = (name: string) =>
    name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)

  if (!mounted) return null

  return (
    <div className="min-h-screen pb-24" style={{ background: '#F8FAFC' }}>

      {/* ── HEADER ── */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-100">
        <div className="px-4 py-4 flex items-center justify-between">
          <h1 className="text-[22px] font-black" style={{ color: '#0B0F1A' }}>People</h1>
          <Link
            href="/customers"
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: '#00C4B4' }}
          >
            <Plus size={18} color="#fff" strokeWidth={2.5} />
          </Link>
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
              placeholder="Search by name or phone..."
              className="flex-1 bg-transparent text-sm outline-none"
              style={{ color: '#0B0F1A' }}
            />
          </div>
        </div>
      </div>

      {/* ── SUMMARY ROW ── */}
      <div className="px-4 pt-4 mb-4 grid grid-cols-2 gap-3">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-3">
          <p className="text-[10px] font-bold uppercase tracking-wider mb-1"
            style={{ color: '#94A3B8' }}>To Collect</p>
          <p className="text-lg font-black" style={{ color: '#4CAF50' }}>
            {formatCurrency(toReceive)}
          </p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-3">
          <p className="text-[10px] font-bold uppercase tracking-wider mb-1"
            style={{ color: '#94A3B8' }}>To Pay</p>
          <p className="text-lg font-black" style={{ color: '#FF5C5C' }}>
            {formatCurrency(toGive)}
          </p>
        </div>
      </div>

      {/* ── PEOPLE LIST ── */}
      <div className="px-4">
        {filtered.length === 0 ? (
          <div className="mt-16 text-center">
            <Users size={40} className="mx-auto mb-3" style={{ color: '#CBD5E1' }} />
            <p className="text-base font-semibold" style={{ color: '#64748B' }}>
              {customers.length === 0 ? 'No customers yet' : 'No results found'}
            </p>
            {customers.length === 0 && (
              <Link
                href="/customers"
                className="text-sm font-bold mt-2 inline-block"
                style={{ color: '#00C4B4' }}
              >
                Add your first customer →
              </Link>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {filtered.map((customer, i) => {
              const balance = getCustomerBalance(customer.id, bid)
              const hasDebt = balance > 0
              const hasCredit = balance < 0
              const settled = balance === 0

              return (
                <Link
                  key={customer.id}
                  href={`/v2/people/${customer.id}`}
                  className={`flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-gray-50 ${
                    i > 0 ? 'border-t border-gray-100' : ''
                  }`}
                >
                  {/* Avatar */}
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: '#00C4B4' }}
                  >
                    <span className="text-white font-bold text-sm">
                      {getInitials(customer.name)}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate" style={{ color: '#0B0F1A' }}>
                      {customer.name}
                    </p>
                    {customer.phone ? (
                      <p className="text-xs truncate" style={{ color: '#94A3B8' }}>
                        {customer.phone}
                      </p>
                    ) : null}
                  </div>

                  {/* Balance chip */}
                  <div className="flex-shrink-0">
                    {settled ? (
                      <span
                        className="text-xs font-semibold px-2 py-1 rounded-full"
                        style={{ background: '#F1F5F9', color: '#94A3B8' }}
                      >
                        Settled
                      </span>
                    ) : hasDebt ? (
                      <div className="text-right">
                        <p className="text-[10px] font-semibold" style={{ color: '#4CAF50' }}>to collect</p>
                        <p className="text-sm font-black" style={{ color: '#4CAF50' }}>
                          {formatCurrency(balance)}
                        </p>
                      </div>
                    ) : (
                      <div className="text-right">
                        <p className="text-[10px] font-semibold" style={{ color: '#FF5C5C' }}>to pay</p>
                        <p className="text-sm font-black" style={{ color: '#FF5C5C' }}>
                          {formatCurrency(Math.abs(balance))}
                        </p>
                      </div>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
