'use client'
import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X, DollarSign, Wallet, Calendar, FileText, TrendingUp } from 'lucide-react'
import { useCheckGuaranteeStore } from '@/lib/store/check-guarantee.store'
import { useTransactionStore } from '@/lib/store/transaction.store'
import { useSettingsStore } from '@/lib/store/settings.store'
import { useBusinessStore } from '@/lib/store/business.store'
import { formatCurrency } from '@/lib/utils/currency'
import { showToast } from '@/components/ui/Toast'
import type { CheckGuarantee } from '@/lib/types'

const MODAL_BG = 'rgba(11, 15, 26, 0.97)'
const MODAL_BORDER = '1px solid rgba(255,255,255,0.09)'
const INPUT_BG = 'rgba(255,255,255,0.06)'
const INPUT_BORDER = 'rgba(255,255,255,0.10)'
const INPUT_BORDER_ERROR = 'rgba(255,92,92,0.5)'

interface RecordPaymentModalProps {
  isOpen: boolean
  onClose: () => void
  check: CheckGuarantee
}

export function RecordPaymentModal({ isOpen, onClose, check }: RecordPaymentModalProps) {
  const { addInstallmentPayment } = useCheckGuaranteeStore()
  const { addTransaction } = useTransactionStore()
  const { wallets, categories } = useSettingsStore()
  const { activeBusinessId } = useBusinessStore()
  const bid = activeBusinessId ?? undefined

  const [amount, setAmount] = useState('')
  const [walletId, setWalletId] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [note, setNote] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  const enabledWallets = wallets.filter(w => w.is_enabled && (!bid || w.business_id === bid))
  const incomeCategory = categories.find(c => c.type === 'income' && c.is_default)

  const validate = () => {
    const newErrors: Record<string, string> = {}
    const paymentAmount = parseFloat(amount)
    if (!amount || paymentAmount <= 0) {
      newErrors.amount = 'Valid amount is required'
    } else if (paymentAmount > check.remaining_balance) {
      newErrors.amount = `Cannot exceed remaining (${formatCurrency(check.remaining_balance)})`
    }
    if (!walletId) newErrors.walletId = 'Payment method is required'
    if (!date) newErrors.date = 'Date is required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (!validate()) return
    const paymentAmount = parseFloat(amount)
    const wallet = wallets.find(w => w.id === walletId)
    const transactionId = addTransaction({
      business_id: bid || '',
      type: 'income',
      category_id: incomeCategory?.id || '',
      amount: paymentAmount,
      wallet_id: walletId,
      customer_id: check.customer_id,
      note_en: `Installment payment for Check #${check.check_number}${note ? ` - ${note}` : ''}`,
      date,
      time: new Date().toTimeString().split(' ')[0],
      is_reversed: false,
      created_by: 'user',
    })
    addInstallmentPayment({
      business_id: bid || '',
      customer_id: check.customer_id,
      check_guarantee_id: check.id,
      amount: paymentAmount,
      payment_method: wallet?.type || 'cash',
      wallet_id: walletId,
      transaction_id: transactionId,
      date,
      note: note.trim() || undefined,
    })
    showToast({ type: 'success', message: `Payment of ${formatCurrency(paymentAmount)} recorded!` })
    onClose()
    resetForm()
  }

  const resetForm = () => {
    setAmount('')
    setWalletId('')
    setDate(new Date().toISOString().split('T')[0])
    setNote('')
    setErrors({})
  }

  if (!isOpen || !mounted) return null

  const inputStyle = (hasError: boolean) => ({
    background: INPUT_BG,
    borderColor: hasError ? INPUT_BORDER_ERROR : INPUT_BORDER,
    color: 'white',
  })

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}
    >
      <div
        className="w-full max-w-md rounded-2xl"
        style={{ background: MODAL_BG, border: MODAL_BORDER, boxShadow: '0 30px 60px rgba(0,0,0,0.6)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <h2 className="text-lg font-black text-white">Record Payment</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <X size={14} className="text-white/50" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Check Info Summary */}
          <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-white/50">Check #{check.check_number}</span>
              <span className="text-xs text-white/70">{check.bank_name}</span>
            </div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-white/40">Total Amount</span>
              <span className="text-sm font-bold text-white">{formatCurrency(check.check_amount)}</span>
            </div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-white/40">Already Paid</span>
              <span className="text-sm font-semibold text-income">{formatCurrency(check.total_paid)}</span>
            </div>
            <div className="flex items-center justify-between pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <span className="text-xs font-semibold text-white/50">Remaining</span>
              <span className="text-lg font-black text-expense">{formatCurrency(check.remaining_balance)}</span>
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-white/50 mb-2 uppercase tracking-wide">
              <DollarSign size={12} /> Payment Amount (Rs.)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={`Max: ${check.remaining_balance}`}
              className="w-full px-4 py-2.5 rounded-xl border focus:outline-none text-sm placeholder:text-white/25"
              style={inputStyle(!!errors.amount)}
            />
            {errors.amount && <p className="text-xs text-expense mt-1">{errors.amount}</p>}
          </div>

          {/* Payment Method */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-white/50 mb-2 uppercase tracking-wide">
              <Wallet size={12} /> Payment Method
            </label>
            <select
              value={walletId}
              onChange={(e) => setWalletId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border focus:outline-none text-sm"
              style={inputStyle(!!errors.walletId)}
            >
              <option value="" style={{ background: '#0B0F1A' }}>Select Payment Method</option>
              {enabledWallets.map((w) => (
                <option key={w.id} value={w.id} style={{ background: '#0B0F1A' }}>{w.name}</option>
              ))}
            </select>
            {errors.walletId && <p className="text-xs text-expense mt-1">{errors.walletId}</p>}
          </div>

          {/* Date */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-white/50 mb-2 uppercase tracking-wide">
              <Calendar size={12} /> Payment Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border focus:outline-none text-sm"
              style={inputStyle(!!errors.date)}
            />
            {errors.date && <p className="text-xs text-expense mt-1">{errors.date}</p>}
          </div>

          {/* Note */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-white/50 mb-2 uppercase tracking-wide">
              <FileText size={12} /> Note (Optional)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add any additional notes..."
              rows={2}
              className="w-full px-4 py-2.5 rounded-xl border focus:outline-none text-sm resize-none placeholder:text-white/25"
              style={{ background: INPUT_BG, borderColor: INPUT_BORDER, color: 'white' }}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-xl font-semibold text-sm text-white/70 transition-all active:scale-95"
              style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.09)' }}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 py-3 rounded-xl font-semibold text-sm text-white transition-all active:scale-95 flex items-center justify-center gap-2"
              style={{ background: 'rgba(76,175,80,0.85)' }}
            >
              <TrendingUp size={15} />
              Record Payment
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}
