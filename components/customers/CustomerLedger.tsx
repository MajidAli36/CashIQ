'use client'
import { useMemo } from 'react'
import { Calendar, TrendingUp, TrendingDown, FileCheck, DollarSign, Download } from 'lucide-react'
import { useCheckGuaranteeStore } from '@/lib/store/check-guarantee.store'
import { formatCurrency } from '@/lib/utils/currency'

interface CustomerLedgerProps {
  customerId: string
}

type LedgerEntry = {
  id: string
  date: string
  type: 'check_given' | 'payment'
  checkNumber?: string
  amount: number
  balance: number
  note?: string
}

export function CustomerLedger({ customerId }: CustomerLedgerProps) {
  const { checkGuarantees, installmentPayments } = useCheckGuaranteeStore()

  const ledgerEntries = useMemo(() => {
    const entries: LedgerEntry[] = []
    
    // Get all checks for this customer
    const customerChecks = checkGuarantees.filter(c => c.customer_id === customerId)
    
    // Add check entries
    customerChecks.forEach(check => {
      entries.push({
        id: `check_${check.id}`,
        date: check.created_at,
        type: 'check_given',
        checkNumber: check.check_number,
        amount: check.check_amount,
        balance: 0, // Will calculate later
        note: `Check #${check.check_number} - ${check.bank_name}`,
      })
    })

    // Add payment entries
    const customerPayments = installmentPayments.filter(p => p.customer_id === customerId)
    customerPayments.forEach(payment => {
      const check = checkGuarantees.find(c => c.id === payment.check_guarantee_id)
      entries.push({
        id: `payment_${payment.id}`,
        date: payment.date,
        type: 'payment',
        checkNumber: check?.check_number,
        amount: payment.amount,
        balance: 0, // Will calculate later
        note: payment.note || `Payment for Check #${check?.check_number}`,
      })
    })

    // Sort by date
    entries.sort((a, b) => a.date.localeCompare(b.date))

    // Calculate running balance
    let runningBalance = 0
    entries.forEach(entry => {
      if (entry.type === 'check_given') {
        runningBalance += entry.amount
      } else {
        runningBalance -= entry.amount
      }
      entry.balance = runningBalance
    })

    return entries.reverse() // Show newest first
  }, [checkGuarantees, installmentPayments, customerId])

  const exportToCSV = () => {
    const headers = ['Date', 'Type', 'Check Number', 'Amount', 'Balance', 'Note']
    const rows = ledgerEntries.map(entry => [
      new Date(entry.date).toLocaleDateString(),
      entry.type === 'check_given' ? 'Check Given' : 'Payment',
      entry.checkNumber || '-',
      entry.type === 'check_given' ? `+${formatCurrency(entry.amount)}` : `-${formatCurrency(entry.amount)}`,
      formatCurrency(entry.balance),
      entry.note || '-',
    ])

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `customer-ledger-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  if (ledgerEntries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ background: 'var(--t-card-bg)' }}>
          <FileCheck size={32} style={{ color: 'var(--t-muted)' }} />
        </div>
        <p className="text-lg font-bold mb-1" style={{ color: 'var(--t-text)' }}>No ledger entries</p>
        <p className="text-sm" style={{ color: 'var(--t-muted)' }}>Add checks and payments to see the ledger</p>
      </div>
    )
  }

  return (
    <div>
      {/* Export Button */}
      <div className="flex justify-end mb-4">
        <button
          onClick={exportToCSV}
          className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm hover:opacity-80 transition-opacity"
          style={{ background: 'var(--t-card-bg)', border: '1px solid var(--t-card-border)', color: 'var(--t-text)' }}
        >
          <Download size={16} />
          Export CSV
        </button>
      </div>

      {/* Ledger Table */}
      <div className="rounded-xl overflow-hidden" style={{ background: 'var(--t-card-bg)', border: '1px solid var(--t-card-border)' }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead style={{ background: 'var(--t-page-bg)', borderBottom: '1px solid var(--t-card-border)' }}>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--t-muted)' }}>
                  Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--t-muted)' }}>
                  Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--t-muted)' }}>
                  Check #
                </th>
                <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--t-muted)' }}>
                  Amount
                </th>
                <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--t-muted)' }}>
                  Balance
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--t-muted)' }}>
                  Note
                </th>
              </tr>
            </thead>
            <tbody>
              {ledgerEntries.map((entry, idx) => (
                <tr
                  key={entry.id}
                  className="hover:opacity-70 transition-opacity"
                  style={{ borderTop: idx > 0 ? '1px solid var(--t-card-border)' : 'none' }}
                >
                  <td className="px-4 py-3 whitespace-nowrap text-sm" style={{ color: 'var(--t-text)' }}>
                    <div className="flex items-center gap-2">
                      <Calendar size={14} style={{ color: 'var(--t-muted)' }} />
                      {new Date(entry.date).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm" style={{ color: 'var(--t-text)' }}>
                    <div className="flex items-center gap-2">
                      {entry.type === 'check_given' ? (
                        <>
                          <FileCheck size={14} className="text-blue-600" />
                          <span className="text-blue-600 font-semibold">Check Given</span>
                        </>
                      ) : (
                        <>
                          <DollarSign size={14} className="text-emerald-600" />
                          <span className="text-emerald-600 font-semibold">Payment</span>
                        </>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium" style={{ color: 'var(--t-text)' }}>
                    {entry.checkNumber || '-'}
                  </td>
                  <td className={`px-4 py-3 text-right text-sm font-bold whitespace-nowrap ${
                    entry.type === 'check_given' ? 'text-blue-600' : 'text-emerald-600'
                  }`}>
                    {entry.type === 'check_given' ? '+' : '-'}
                    {formatCurrency(entry.amount)}
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-bold whitespace-nowrap" style={{ color: 'var(--t-text)' }}>
                    {formatCurrency(entry.balance)}
                  </td>
                  <td className="px-4 py-3 text-sm max-w-xs truncate" style={{ color: 'var(--t-muted)' }}>
                    {entry.note || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary Footer */}
        <div className="px-4 py-3 flex items-center justify-between" style={{ borderTop: '1px solid var(--t-card-border)', background: 'var(--t-page-bg)' }}>
          <span className="text-sm font-semibold" style={{ color: 'var(--t-muted)' }}>
            Total Entries: {ledgerEntries.length}
          </span>
          <div className="flex items-center gap-4">
            <span className="text-sm font-semibold" style={{ color: 'var(--t-text)' }}>
              Current Balance:
            </span>
            <span className="text-lg font-black" style={{ color: ledgerEntries[0]?.balance >= 0 ? '#3b82f6' : '#ef4444' }}>
              {formatCurrency(Math.abs(ledgerEntries[0]?.balance || 0))}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
