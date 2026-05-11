'use client'
import { useState, useMemo } from 'react'
import { Search, Plus, Filter, FileCheck, TrendingUp, TrendingDown, DollarSign } from 'lucide-react'
import { useCheckGuaranteeStore } from '@/lib/store/check-guarantee.store'
import { useLoanStore } from '@/lib/store/loan.store'
import { useBusinessStore } from '@/lib/store/business.store'
import { formatCurrency } from '@/lib/utils/currency'
import { PageHeader } from '@/components/layout/PageHeader'
import { CheckCard } from '@/components/checks/CheckCard'
import { AddCheckModal } from '@/components/checks/AddCheckModal'
import { RecordPaymentModal } from '@/components/checks/RecordPaymentModal'
import { CheckDetailModal } from '@/components/checks/CheckDetailModal'
import type { CheckGuarantee } from '@/lib/types'

export default function ChecksPage() {
  const { checkGuarantees } = useCheckGuaranteeStore()
  const { customers } = useLoanStore()
  const { activeBusinessId } = useBusinessStore()
  const bid = activeBusinessId ?? undefined

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedCheck, setSelectedCheck] = useState<CheckGuarantee | null>(null)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)

  const filteredChecks = useMemo(() => {
    let filtered = checkGuarantees.filter(check => {
      if (bid && check.business_id !== bid) return false
      return true
    })

    if (search) {
      const q = search.toLowerCase()
      filtered = filtered.filter(check => {
        const customer = customers.find(c => c.id === check.customer_id)
        return (
          check.check_number.toLowerCase().includes(q) ||
          check.bank_name.toLowerCase().includes(q) ||
          customer?.name.toLowerCase().includes(q)
        )
      })
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(check => check.status === statusFilter)
    }

    return filtered.sort((a, b) => b.created_at.localeCompare(a.created_at))
  }, [checkGuarantees, search, statusFilter, bid, customers])

  const summary = useMemo(() => {
    const activeChecks = filteredChecks.filter(c => c.status === 'active')
    const totalCheckAmount = activeChecks.reduce((sum, c) => sum + c.check_amount, 0)
    const totalPaid = activeChecks.reduce((sum, c) => sum + c.total_paid, 0)
    const totalRemaining = activeChecks.reduce((sum, c) => sum + c.remaining_balance, 0)

    return {
      activeCount: activeChecks.length,
      totalCheckAmount,
      totalPaid,
      totalRemaining,
    }
  }, [filteredChecks])

  const handleViewDetail = (check: CheckGuarantee) => {
    setSelectedCheck(check)
    setShowDetailModal(true)
  }

  const handleRecordPayment = (check: CheckGuarantee) => {
    setSelectedCheck(check)
    setShowPaymentModal(true)
  }

  const getCustomerName = (customerId: string) => {
    return customers.find(c => c.id === customerId)?.name || 'Unknown'
  }

  return (
    <div className="min-h-screen pb-20" style={{ background: 'var(--t-page-bg)' }}>
      <PageHeader
        title="Checks"
        titleUr="چیک"
        backTo="/dashboard"
        right={
          <button
            onClick={() => setShowAddModal(true)}
            className="w-9 h-9 rounded-xl flex items-center justify-center bg-blue-500"
          >
            <Plus size={16} className="text-white" />
          </button>
        }
      />
      <div className="px-4 pt-3 pb-4">
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs font-semibold" style={{ color: 'var(--t-muted)' }}>
            {filteredChecks.length} checks found
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="rounded-xl p-4" style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', boxShadow: '0 4px 12px rgba(59, 130, 246, 0.2)' }}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-blue-100 text-xs font-semibold">Active Checks</p>
              <FileCheck size={16} className="text-blue-200" />
            </div>
            <p className="text-white text-xl font-black">{summary.activeCount}</p>
          </div>

          <div className="rounded-xl p-4" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)' }}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-emerald-100 text-xs font-semibold">Collected</p>
              <TrendingUp size={16} className="text-emerald-200" />
            </div>
            <p className="text-white text-xl font-black">{formatCurrency(summary.totalPaid)}</p>
          </div>

          <div className="rounded-xl p-4" style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)' }}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-rose-100 text-xs font-semibold">Remaining</p>
              <TrendingDown size={16} className="text-rose-200" />
            </div>
            <p className="text-white text-xl font-black">{formatCurrency(summary.totalRemaining)}</p>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex gap-3 mb-4">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--t-muted)' }} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by check number, bank, or customer..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{ background: 'var(--t-card-bg)', border: '1px solid var(--t-card-border)', color: 'var(--t-text)' }}
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            style={{ background: 'var(--t-card-bg)', border: '1px solid var(--t-card-border)', color: 'var(--t-text)' }}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="cleared">Cleared</option>
            <option value="bounced">Bounced</option>
            <option value="returned">Returned</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Checks List */}
      <div className="px-4">
        {filteredChecks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ background: 'var(--t-card-bg)' }}>
              <FileCheck size={32} style={{ color: 'var(--t-muted)' }} />
            </div>
            <p className="text-lg font-bold mb-1" style={{ color: 'var(--t-text)' }}>
              No checks found
            </p>
            <p className="text-sm" style={{ color: 'var(--t-muted)' }}>
              {search || statusFilter !== 'all' ? 'Try adjusting your filters' : 'Add your first check guarantee'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredChecks.map((check) => (
              <CheckCard
                key={check.id}
                check={check}
                customerName={getCustomerName(check.customer_id)}
                onViewDetails={() => handleViewDetail(check)}
                onRecordPayment={() => handleRecordPayment(check)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <AddCheckModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
      />

      {selectedCheck && (
        <CheckDetailModal
          isOpen={showDetailModal}
          onClose={() => {
            setShowDetailModal(false)
            setSelectedCheck(null)
          }}
          check={selectedCheck}
          customerName={getCustomerName(selectedCheck.customer_id)}
          onRecordPayment={() => {
            setShowDetailModal(false)
            setShowPaymentModal(true)
          }}
        />
      )}

      {selectedCheck && (
        <RecordPaymentModal
          isOpen={showPaymentModal}
          onClose={() => {
            setShowPaymentModal(false)
            setSelectedCheck(null)
          }}
          check={selectedCheck}
        />
      )}
    </div>
  )
}
