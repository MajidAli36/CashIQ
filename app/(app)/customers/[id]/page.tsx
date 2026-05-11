'use client'
import { useState, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Phone, FileCheck, TrendingUp, TrendingDown, DollarSign, Calendar, Plus, Eye } from 'lucide-react'
import { useCheckGuaranteeStore } from '@/lib/store/check-guarantee.store'
import { useLoanStore } from '@/lib/store/loan.store'
import { useTransactionStore } from '@/lib/store/transaction.store'
import { useBusinessStore } from '@/lib/store/business.store'
import { formatCurrency } from '@/lib/utils/currency'
import { CheckCard } from '@/components/checks/CheckCard'
import { AddCheckModal } from '@/components/checks/AddCheckModal'
import { RecordPaymentModal } from '@/components/checks/RecordPaymentModal'
import { CustomerLedger } from '@/components/customers/CustomerLedger'
import { AllTransactionsTab } from '@/components/customers/AllTransactionsTab'
import type { CheckGuarantee } from '@/lib/types'

type TabType = 'transactions' | 'checks' | 'payments' | 'ledger'

export default function CustomerDetailPage() {
  const params = useParams()
  const router = useRouter()
  const customerId = params.id as string

  const { customers } = useLoanStore()
  const { getCustomerLedger } = useLoanStore()
  const { checkGuarantees, installmentPayments, getCustomerChecks, getCustomerTotalBalance } = useCheckGuaranteeStore()
  const { transactions } = useTransactionStore()
  const { activeBusinessId } = useBusinessStore()
  const bid = activeBusinessId ?? undefined

  const [activeTab, setActiveTab] = useState<TabType>('transactions')
  const [showAddCheckModal, setShowAddCheckModal] = useState(false)
  const [selectedCheck, setSelectedCheck] = useState<CheckGuarantee | null>(null)
  const [showPaymentModal, setShowPaymentModal] = useState(false)

  const customer = customers.find(c => c.id === customerId)
  const customerChecks = getCustomerChecks(customerId)
  const customerBalance = getCustomerTotalBalance(customerId)
  const customerPayments = installmentPayments.filter(p => p.customer_id === customerId)
  const customerLoans = getCustomerLedger(customerId, bid)

  const activeChecks = customerChecks.filter(c => c.status === 'active')
  const clearedChecks = customerChecks.filter(c => c.status === 'cleared')

  if (!customer) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--t-page-bg)' }}>
        <div className="text-center">
          <p className="text-lg font-bold mb-2" style={{ color: 'var(--t-text)' }}>Customer not found</p>
          <button
            onClick={() => router.back()}
            className="text-sm text-blue-500 hover:underline"
          >
            Go back
          </button>
        </div>
      </div>
    )
  }

  const handleRecordPayment = (check: CheckGuarantee) => {
    setSelectedCheck(check)
    setShowPaymentModal(true)
  }

  return (
    <div className="min-h-screen pb-20" style={{ background: 'var(--t-page-bg)' }}>
      {/* Header */}
      <div className="px-4 pt-6 pb-4">
        <button
          onClick={() => router.push('/customers')}
          className="flex items-center gap-2 mb-4 text-sm font-semibold hover:opacity-70 transition-opacity"
          style={{ color: 'var(--t-text)' }}
        >
          <ArrowLeft size={16} />
          Back
        </button>

        {/* Customer Info */}
        <div className="rounded-xl p-6 mb-6" style={{ background: 'var(--t-card-bg)', border: '1px solid var(--t-card-border)' }}>
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-2xl font-black mb-2" style={{ color: 'var(--t-text)' }}>
                {customer.name}
              </h1>
              {customer.phone && (
                <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--t-muted)' }}>
                  <Phone size={14} />
                  {customer.phone}
                </div>
              )}
            </div>
            <button
              onClick={() => setShowAddCheckModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm text-white bg-blue-500 hover:bg-blue-600 transition-colors"
            >
              <Plus size={16} />
              Add Check
            </button>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-lg p-3" style={{ background: 'var(--t-page-bg)' }}>
              <div className="flex items-center gap-2 mb-1">
                <FileCheck size={14} style={{ color: 'var(--t-muted)' }} />
                <span className="text-xs font-semibold" style={{ color: 'var(--t-muted)' }}>Active Checks</span>
              </div>
              <p className="text-xl font-black" style={{ color: 'var(--t-text)' }}>{activeChecks.length}</p>
            </div>

            <div className="rounded-lg p-3" style={{ background: 'var(--t-page-bg)' }}>
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp size={14} className="text-emerald-600" />
                <span className="text-xs font-semibold" style={{ color: 'var(--t-muted)' }}>Total Paid</span>
              </div>
              <p className="text-xl font-black text-emerald-600">{formatCurrency(customerBalance.totalPaid)}</p>
            </div>

            <div className="rounded-lg p-3" style={{ background: 'var(--t-page-bg)' }}>
              <div className="flex items-center gap-2 mb-1">
                <TrendingDown size={14} className="text-rose-600" />
                <span className="text-xs font-semibold" style={{ color: 'var(--t-muted)' }}>Remaining</span>
              </div>
              <p className="text-xl font-black text-rose-600">{formatCurrency(customerBalance.totalRemaining)}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('transactions')}
            className={`flex-1 py-2.5 rounded-xl font-semibold text-sm transition-all ${
              activeTab === 'transactions' ? 'text-white bg-blue-500' : ''
            }`}
            style={activeTab !== 'transactions' ? { background: 'var(--t-card-bg)', border: '1px solid var(--t-card-border)', color: 'var(--t-text)' } : {}}
          >
            All ({customerChecks.length + customerPayments.length + customerLoans.length})
          </button>
          <button
            onClick={() => setActiveTab('checks')}
            className={`flex-1 py-2.5 rounded-xl font-semibold text-sm transition-all ${
              activeTab === 'checks' ? 'text-white bg-blue-500' : ''
            }`}
            style={activeTab !== 'checks' ? { background: 'var(--t-card-bg)', border: '1px solid var(--t-card-border)', color: 'var(--t-text)' } : {}}
          >
            Checks ({customerChecks.length})
          </button>
          <button
            onClick={() => setActiveTab('payments')}
            className={`flex-1 py-2.5 rounded-xl font-semibold text-sm transition-all ${
              activeTab === 'payments' ? 'text-white bg-blue-500' : ''
            }`}
            style={activeTab !== 'payments' ? { background: 'var(--t-card-bg)', border: '1px solid var(--t-card-border)', color: 'var(--t-text)' } : {}}
          >
            Payments ({customerPayments.length})
          </button>
          <button
            onClick={() => setActiveTab('ledger')}
            className={`flex-1 py-2.5 rounded-xl font-semibold text-sm transition-all ${
              activeTab === 'ledger' ? 'text-white bg-blue-500' : ''
            }`}
            style={activeTab !== 'ledger' ? { background: 'var(--t-card-bg)', border: '1px solid var(--t-card-border)', color: 'var(--t-text)' } : {}}
          >
            Ledger
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="px-4">
        {/* All Transactions Tab */}
        {activeTab === 'transactions' && (
          <AllTransactionsTab customerId={customerId} />
        )}

        {/* Checks Tab */}
        {activeTab === 'checks' && (
          <div>
            {customerChecks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ background: 'var(--t-card-bg)' }}>
                  <FileCheck size={32} style={{ color: 'var(--t-muted)' }} />
                </div>
                <p className="text-lg font-bold mb-1" style={{ color: 'var(--t-text)' }}>No checks yet</p>
                <p className="text-sm mb-4" style={{ color: 'var(--t-muted)' }}>Add a check guarantee for this customer</p>
                <button
                  onClick={() => setShowAddCheckModal(true)}
                  className="px-4 py-2 rounded-xl font-semibold text-sm text-white bg-blue-500 hover:bg-blue-600 transition-colors"
                >
                  Add First Check
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {customerChecks.map((check) => (
                  <CheckCard
                    key={check.id}
                    check={check}
                    onRecordPayment={() => handleRecordPayment(check)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Payments Tab */}
        {activeTab === 'payments' && (
          <div>
            {customerPayments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ background: 'var(--t-card-bg)' }}>
                  <DollarSign size={32} style={{ color: 'var(--t-muted)' }} />
                </div>
                <p className="text-lg font-bold mb-1" style={{ color: 'var(--t-text)' }}>No payments yet</p>
                <p className="text-sm" style={{ color: 'var(--t-muted)' }}>Payment history will appear here</p>
              </div>
            ) : (
              <div className="space-y-3">
                {customerPayments
                  .sort((a, b) => b.date.localeCompare(a.date))
                  .map((payment) => {
                    const check = checkGuarantees.find(c => c.id === payment.check_guarantee_id)
                    return (
                      <div
                        key={payment.id}
                        className="rounded-xl p-4"
                        style={{ background: 'var(--t-card-bg)', border: '1px solid var(--t-card-border)' }}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-bold text-sm mb-1" style={{ color: 'var(--t-text)' }}>
                              Check #{check?.check_number || 'Unknown'}
                            </p>
                            <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--t-muted)' }}>
                              <Calendar size={12} />
                              {new Date(payment.date).toLocaleDateString()}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-black text-emerald-600">
                              {formatCurrency(payment.amount)}
                            </p>
                            <p className="text-xs capitalize" style={{ color: 'var(--t-muted)' }}>
                              {payment.payment_method}
                            </p>
                          </div>
                        </div>
                        {payment.note && (
                          <p className="text-xs mt-2" style={{ color: 'var(--t-muted)' }}>
                            {payment.note}
                          </p>
                        )}
                      </div>
                    )
                  })}
              </div>
            )}
          </div>
        )}

        {/* Ledger Tab */}
        {activeTab === 'ledger' && (
          <CustomerLedger customerId={customerId} />
        )}
      </div>

      {/* Modals */}
      <AddCheckModal
        isOpen={showAddCheckModal}
        onClose={() => setShowAddCheckModal(false)}
        preselectedCustomerId={customerId}
      />

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
