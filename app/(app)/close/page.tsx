'use client'
import { useState } from 'react'
import { useSettingsStore } from '@/lib/store/settings.store'
import { useTransactionStore } from '@/lib/store/transaction.store'
import { useTranslation } from '@/lib/hooks/useTranslation'
import { formatCurrency } from '@/lib/utils/currency'
import { formatDate, todayISO } from '@/lib/utils/date'
import { PageHeader } from '@/components/layout/PageHeader'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { showToast } from '@/components/ui/Toast'
import { cn } from '@/lib/utils/cn'
import { Lock, CheckCircle, AlertTriangle } from 'lucide-react'
import { format } from 'date-fns'
import { useBusinessStore } from '@/lib/store/business.store'

export default function CloseDayPage() {
  const { t } = useTranslation()
  const { wallets, getEnabledWallets } = useSettingsStore()
  const { getWalletBalance, getTotalIncome, getTotalExpense, getRealEarning, addTransaction } = useTransactionStore()
  const { activeBusinessId } = useBusinessStore()
  const bid = activeBusinessId ?? undefined

  const today = todayISO()
  const [actuals, setActuals] = useState<Record<string, string>>({})
  const [note, setNote] = useState('')
  const [showConfirm, setShowConfirm] = useState(false)
  const [isClosed, setIsClosed] = useState(false)

  const enabledWallets = getEnabledWallets(bid)
  const totalIncome = getTotalIncome(today, today, bid)
  const totalExpense = getTotalExpense(today, today, bid)
  const realEarning = getRealEarning(today, today, bid)

  const walletChecks = enabledWallets.map(w => {
    const expected = getWalletBalance(w.id, bid)
    const actual = parseFloat(actuals[w.id] || '')
    const diff = isNaN(actual) ? null : actual - expected
    return { wallet: w, expected, actual: isNaN(actual) ? null : actual, diff }
  })

  const hasMismatch = walletChecks.some(c => c.diff !== null && c.diff !== 0)

  const handleClose = () => {
    const time = format(new Date(), 'HH:mm')
    walletChecks.forEach(c => {
      if (c.diff !== null && c.diff !== 0) {
        addTransaction({
          type: 'adjustment',
          category_id: 'adjustment',
          amount: Math.abs(c.diff),
          wallet_id: c.wallet.id,
          date: today,
          time,
          is_reversed: false,
          created_by: 'owner',
          note_en: `Day close adjustment (${c.diff > 0 ? '+' : ''}${c.diff})`,
        })
      }
    })
    setIsClosed(true)
    setShowConfirm(false)
    showToast({ type: 'success', message: t('messages.success') })
  }

  if (isClosed) {
    return (
      <div className="min-h-screen bg-surface pb-20">
        <PageHeader title={t('closeDay.closeDay')} />
        <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
          <div className="w-16 h-16 bg-income rounded-full flex items-center justify-center mb-4">
            <CheckCircle size={32} className="text-white" />
          </div>
          <h2 className="text-xl font-bold text-navy mb-1">{t('closeDay.closeDay')}</h2>
          <p className="text-sm text-muted mt-2">{formatDate(today)} · {format(new Date(), 'hh:mm a')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface pb-20">
      <PageHeader title={t('closeDay.closeDay')} />

      <div className="px-4 pt-4 space-y-4">
        {/* Today Summary */}
        <div className="bg-white rounded-2xl p-4 border border-border">
          <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-3">{t('dashboard.dashboard')}</p>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted">{t('transactions.income')}</span>
              <span className="text-sm font-bold text-income">+{formatCurrency(totalIncome)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted">{t('transactions.expense')}</span>
              <span className="text-sm font-bold text-expense">-{formatCurrency(totalExpense)}</span>
            </div>
            <div className="border-t border-border pt-2 flex justify-between">
              <span className="text-sm font-semibold text-navy">{t('reports.net')}</span>
              <span className={cn('text-base font-bold', realEarning >= 0 ? 'text-income' : 'text-expense')}>
                {realEarning >= 0 ? '+' : ''}{formatCurrency(realEarning)}
              </span>
            </div>
          </div>
        </div>

        {/* Wallet Check */}
        <p className="text-xs font-semibold text-muted uppercase tracking-wide">{t('wallets.wallets')}</p>
        {walletChecks.map(({ wallet, expected, actual, diff }) => (
          <div key={wallet.id} className="bg-white rounded-2xl p-4 border border-border">
            <p className="text-sm font-bold text-navy mb-3" style={{ color: wallet.color }}>{wallet.name}</p>
            <div className="flex justify-between mb-2">
              <span className="text-xs text-muted">{t('wallets.balance')}</span>
              <span className="text-sm font-semibold text-navy">{formatCurrency(expected)}</span>
            </div>
            <div className="mb-3">
              <label className="text-xs text-muted">{t('wallets.balance')}</label>
              <div className="mt-1 flex items-center h-11 bg-surface border border-border rounded-xl px-3">
                <span className="text-muted text-sm mr-2">Rs.</span>
                <input
                  type="number"
                  value={actuals[wallet.id] || ''}
                  onChange={e => setActuals(prev => ({ ...prev, [wallet.id]: e.target.value }))}
                  placeholder={String(expected)}
                  className="flex-1 bg-transparent text-sm focus:outline-none"
                />
              </div>
            </div>
            {diff !== null && (
              <div className={cn('flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-lg',
                diff === 0 ? 'bg-income-light text-income' : 'bg-expense-light text-expense')}>
                {diff === 0 ? <CheckCircle size={14} /> : <AlertTriangle size={14} />}
                {diff === 0 ? '✓ Match' : `Rs. ${Math.abs(diff).toLocaleString()} difference`}
              </div>
            )}
          </div>
        ))}

        {/* Mismatch Warning */}
        {hasMismatch && (
          <div className="bg-loan-light border border-loan/20 rounded-2xl p-4">
            <div className="flex items-start gap-2">
              <AlertTriangle size={16} className="text-loan mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold text-loan">{t('closeDay.lockRecords')}</p>
              </div>
            </div>
          </div>
        )}

        {/* Notes */}
        <div>
          <label className="text-sm font-semibold text-navy">{t('closeDay.notes')}</label>
          <textarea value={note} onChange={e => setNote(e.target.value)} rows={2}
            className="mt-1 w-full bg-white border border-border rounded-xl px-4 py-3 text-sm focus:outline-none resize-none"
            placeholder={t('closeDay.anyNotes')} />
        </div>

        {/* Close Button */}
        <button onClick={() => setShowConfirm(true)}
          className="w-full h-14 bg-expense text-white rounded-2xl font-semibold text-base flex items-center justify-center gap-2">
          <Lock size={18} /> {t('closeDay.closeDayButton')}
        </button>
      </div>

      {showConfirm && (
        <ConfirmModal
          title={t('closeDay.closeDayQuestion')}
          message={t('closeDay.lockRecords')}
          confirmLabel={t('closeDay.closeDayButton')}
          cancelLabel={t('common.cancel')}
          onConfirm={handleClose}
          onCancel={() => setShowConfirm(false)}
          danger
        />
      )}
    </div>
  )
}
