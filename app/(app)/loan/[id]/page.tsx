'use client'
import { useParams } from 'next/navigation'
import { useState } from 'react'
import { useLoanStore } from '@/lib/store/loan.store'
import { useSettingsStore } from '@/lib/store/settings.store'
import { useTransactionStore } from '@/lib/store/transaction.store'
import { useTranslation } from '@/lib/hooks/useTranslation'
import { formatCurrency } from '@/lib/utils/currency'
import { formatDate } from '@/lib/utils/date'
import { formatPhone } from '@/lib/utils/phone'
import { openWhatsApp, generateLoanWhatsAppText } from '@/lib/utils/whatsapp'
import { PageHeader } from '@/components/layout/PageHeader'
import { WalletBadge } from '@/components/ui/WalletBadge'
import { EmptyState } from '@/components/ui/EmptyState'
import { cn } from '@/lib/utils/cn'
import { MessageCircle, DollarSign } from 'lucide-react'
import type { WalletType } from '@/lib/types'
import { format } from 'date-fns'
import { nanoid } from 'nanoid'

export default function LoanDetailPage() {
  const { t } = useTranslation()
  const { id } = useParams<{ id: string }>()
  const { customers, entries, getCustomerBalance, addEntry } = useLoanStore()
  const { wallets, getEnabledWallets } = useSettingsStore()
  const addTransaction = useTransactionStore(s => s.addTransaction)

  const customer = customers.find(c => c.id === id)
  const ledger = entries.filter(e => e.customer_id === id).sort((a, b) => b.date.localeCompare(a.date))
  const balance = customer ? getCustomerBalance(id) : 0

  const [showPayment, setShowPayment] = useState(false)
  const [payAmount, setPayAmount] = useState('')
  const [payWallet, setPayWallet] = useState(getEnabledWallets()[0]?.id || 'cash')

  if (!customer) return <div className="p-4 text-muted">{t('messages.noData')}</div>

  const handleReceivePayment = () => {
    const amt = parseFloat(payAmount)
    if (!amt || amt <= 0) return
    const today = format(new Date(), 'yyyy-MM-dd')
    const time = format(new Date(), 'HH:mm')
    const txnId = addTransaction({
      type: 'loan_received',
      category_id: 'loan',
      amount: amt,
      wallet_id: payWallet,
      customer_id: id,
      date: today,
      time,
      is_reversed: false,
      created_by: 'owner',
      note_en: `Payment from ${customer.name}`,
    })
    addEntry({
      customer_id: id,
      transaction_id: txnId,
      amount: amt,
      direction: 'received',
      wallet_id: payWallet,
      date: today,
      note_en: 'Payment received',
      is_settled: false,
    })
    setPayAmount('')
    setShowPayment(false)
  }

  return (
    <div className="min-h-screen bg-surface pb-20">
      <PageHeader title={customer.name} backTo="/loan" />

      <div className="px-4 pb-5" style={{ background: 'var(--t-card-bg)' }}>
        <p className="text-white/60 text-sm mb-3">{formatPhone(customer.phone)}</p>
        <div className={cn('rounded-2xl p-4 text-center', balance >= 0 ? 'bg-income-light' : 'bg-expense-light')}>
          <p className={cn('text-xs font-semibold mb-1', balance >= 0 ? 'text-income' : 'text-expense')}>
            {balance >= 0 ? t('dashboard.toReceive') : t('dashboard.toGive')}
          </p>
          <p className={cn('text-2xl font-bold', balance >= 0 ? 'text-income' : 'text-expense')}>
            {formatCurrency(Math.abs(balance))}
          </p>
        </div>
      </div>

      <div className="px-4 pt-4">
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => openWhatsApp(customer.phone, generateLoanWhatsAppText(customer.name, Math.abs(balance)))}
            className="flex-1 h-12 bg-[#25D366] text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
          >
            <MessageCircle size={16} /> WhatsApp
          </button>
          <button
            onClick={() => setShowPayment(!showPayment)}
            className="flex-1 h-12 bg-income text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
          >
            <DollarSign size={16} /> {t('loans.receivePayment')}
          </button>
        </div>

        {showPayment && (
          <div className="bg-white rounded-2xl p-4 border border-border mb-4">
            <h3 className="text-sm font-bold text-navy mb-3">{t('loans.receivePayment')}</h3>
            <input
              type="number"
              value={payAmount}
              onChange={e => setPayAmount(e.target.value)}
              placeholder={t('placeholders.enterAmount')}
              className="w-full h-11 bg-surface border border-border rounded-xl px-4 text-sm mb-3 focus:outline-none"
            />
            <div className="flex gap-2 mb-3">
              {getEnabledWallets().map(w => (
                <button
                  key={w.id}
                  onClick={() => setPayWallet(w.id)}
                  className={cn(
                    'flex-1 h-10 rounded-xl border text-xs font-semibold transition-all',
                    payWallet === w.id ? 'text-white' : 'text-muted'
                  )}
                  style={payWallet === w.id ? {
                    background: 'var(--t-accent)',
                    borderColor: 'var(--t-accent)',
                  } : {
                    background: 'var(--t-page-bg)',
                    borderColor: 'var(--t-card-border)',
                  }}
                >
                  {w.name}
                </button>
              ))}
            </div>
            <button onClick={handleReceivePayment} className="w-full h-11 bg-income text-white rounded-xl text-sm font-semibold">
              {t('common.confirm')}
            </button>
          </div>
        )}

        {ledger.length === 0 ? (
          <EmptyState icon="📋" title={t('dashboard.noTransactions')} />
        ) : (
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
            <div className="space-y-4 pl-10">
              {ledger.map(entry => {
                const wallet = wallets.find(w => w.id === entry.wallet_id)
                const isGiven = entry.direction === 'given'
                return (
                  <div key={entry.id} className="relative">
                    <div className={cn(
                      'absolute -left-[26px] w-4 h-4 rounded-full border-2 border-white',
                      isGiven ? 'bg-expense' : 'bg-income'
                    )} />
                    <div className="bg-white rounded-2xl p-3 border border-border">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-navy">
                          {isGiven ? 'Loan Given · اُدھار دیا' : 'Payment Received · ادائیگی ملی'}
                        </span>
                        <span className={cn('text-sm font-bold', isGiven ? 'text-expense' : 'text-income')}>
                          {isGiven ? '-' : '+'}{formatCurrency(entry.amount)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted">{formatDate(entry.date)}</span>
                        {wallet && <WalletBadge name={wallet.name} type={wallet.type as WalletType} />}
                      </div>
                      {entry.note_en && <p className="text-xs text-muted mt-1">{entry.note_en}</p>}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
