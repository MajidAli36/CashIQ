'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSettingsStore } from '@/lib/store/settings.store'
import { useTransactionStore } from '@/lib/store/transaction.store'
import { useInvoiceStore } from '@/lib/store/invoice.store'
import { useLoanStore } from '@/lib/store/loan.store'
import { useTranslation } from '@/lib/hooks/useTranslation'
import { formatCurrency, formatAmount } from '@/lib/utils/currency'
import { todayISO } from '@/lib/utils/date'
import { autoTranslate } from '@/lib/translation/urdu-dictionary'
import { showToast } from '@/components/ui/Toast'
import { cn } from '@/lib/utils/cn'
import { Plus, Trash2, ChevronLeft, Check, FileText } from 'lucide-react'
import { format } from 'date-fns'
import { nanoid } from 'nanoid'
import type { InvoiceItem } from '@/lib/types'

export default function NewInvoicePage() {
  const { t } = useTranslation()
  const router = useRouter()
  const { getEnabledWallets, businessItems } = useSettingsStore()
  const addTransaction = useTransactionStore(s => s.addTransaction)
  const { addInvoice } = useInvoiceStore()
  const { customers } = useLoanStore()

  const [step, setStep] = useState(1)
  const [customerName, setCustomerName] = useState('')
  const [items, setItems] = useState<InvoiceItem[]>([
    { id: nanoid(), name_en: '', name_ur: '', quantity: 1, price: 0, total: 0 }
  ])
  const [discount, setDiscount] = useState(0)
  const [paymentMode, setPaymentMode] = useState<'paid' | 'loan'>('paid')
  const [walletId, setWalletId] = useState(getEnabledWallets()[0]?.id || 'cash')
  const [date, setDate] = useState(todayISO())

  const subtotal = items.reduce((s, i) => s + i.total, 0)
  const total = Math.max(subtotal - discount, 0)
  const enabledWallets = getEnabledWallets()

  const updateItem = (id: string, field: keyof InvoiceItem, value: string | number) => {
    setItems(prev => prev.map(item => {
      if (item.id !== id) return item
      const updated = { ...item, [field]: value }
      if (field === 'quantity' || field === 'price')
        updated.total = Number(updated.quantity) * Number(updated.price)
      if (field === 'name_en') updated.name_ur = autoTranslate(String(value))
      return updated
    }))
  }

  const addItem = () => setItems(prev => [
    ...prev,
    { id: nanoid(), name_en: '', name_ur: '', quantity: 1, price: 0, total: 0 }
  ])

  const removeItem = (id: string) => {
    if (items.length <= 1) return
    setItems(prev => prev.filter(i => i.id !== id))
  }

  const handleCreate = () => {
    if (total <= 0) return
    const time = format(new Date(), 'HH:mm')
    addTransaction({
      type: paymentMode === 'paid' ? 'income' : 'loan_given',
      category_id: 'sale',
      amount: total,
      wallet_id: walletId,
      date,
      time,
      is_reversed: false,
      created_by: 'owner',
      note_en: `Invoice - ${customerName || 'Walk-in'}`,
    })
    addInvoice({ customer_name: customerName || undefined, items, subtotal, discount, total, wallet_id: walletId, is_loan: paymentMode === 'loan', date })
    showToast({ type: 'success', message: t('messages.created') })
    router.replace('/invoice')
  }

  return (
    <div className="min-h-screen bg-surface pb-[88px]">
      {/* Header */}
      <div className="bg-navy-gradient px-5 pt-12 pb-5 relative overflow-hidden">
        <div className="absolute -top-8 right-0 w-40 h-40 bg-teal/8 rounded-full blur-[50px] pointer-events-none" />
        <div className="relative z-10 flex items-center justify-between mb-4">
          <button onClick={() => step > 1 ? setStep(s => s - 1) : router.back()}
            className="w-9 h-9 bg-white/8 rounded-xl border border-white/10 flex items-center justify-center">
            <ChevronLeft size={20} className="text-white" strokeWidth={2} />
          </button>
          <div className="flex gap-1.5">
            {[1,2,3].map(s => (
              <div key={s} className={cn('h-1 rounded-full transition-all',
                step >= s ? 'bg-teal w-6' : 'bg-white/15 w-4')} />
            ))}
          </div>
          <div className="w-9" />
        </div>
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 bg-teal/15 rounded-2xl border border-teal/20 flex items-center justify-center">
            <FileText size={18} className="text-teal" />
          </div>
          <div>
            <h1 className="text-white font-black text-lg">{t('invoices.newInvoice')}</h1>
          </div>
        </div>
      </div>

      {/* STEP 1 — Customer */}
      {step === 1 && (
        <div className="px-4 pt-5">
          <p className="text-[11px] font-bold text-muted uppercase tracking-wider mb-4">{t('customers.customers')}</p>
          <input value={customerName} onChange={e => setCustomerName(e.target.value)}
            placeholder={t('placeholders.enterName')}
            className="w-full h-13 bg-white border border-border rounded-2xl px-4 text-sm focus:outline-none focus:border-teal shadow-card mb-3 transition-colors" />
          {customers.length > 0 && customerName === '' && (
            <div className="mb-4">
              <p className="text-[11px] text-muted font-semibold mb-2">{t('invoices.recentCustomers')}</p>
              <div className="space-y-2">
                {customers.slice(0, 4).map(c => (
                  <button key={c.id} onClick={() => setCustomerName(c.name)}
                    className="w-full text-left px-4 py-3 bg-white border border-border rounded-2xl text-sm font-semibold text-navy shadow-card card-tap flex items-center justify-between">
                    <span>{c.name}</span>
                    <span className="text-[11px] text-muted font-normal">{c.phone}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
          <button onClick={() => setStep(2)} className="btn-teal w-full h-13 font-bold text-sm text-navy mt-4">
            {t('buttons.next')}
          </button>
        </div>
      )}

      {/* STEP 2 — Items */}
      {step === 2 && (
        <div className="px-4 pt-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[11px] font-bold text-muted uppercase tracking-wider">{t('invoices.items')}</p>
            <button onClick={addItem}
              className="flex items-center gap-1.5 text-[11px] font-bold text-teal px-3 py-1.5 bg-teal/10 rounded-xl">
              <Plus size={13} /> {t('buttons.add')}
            </button>
          </div>

          <div className="space-y-3 mb-4">
            {items.map((item, idx) => (
              <div key={item.id} className="card p-4">
                <div className="flex gap-2 mb-3">
                  <input value={item.name_en} onChange={e => updateItem(item.id, 'name_en', e.target.value)}
                    placeholder={t('invoices.itemName')} list={`items-${idx}`}
                    className="flex-1 h-10 bg-surface border border-border rounded-xl px-3 text-sm focus:outline-none focus:border-teal" />
                  <datalist id={`items-${idx}`}>
                    {businessItems.filter(b => b.is_enabled).map(b => (
                      <option key={b.id} value={b.name_en} />
                    ))}
                  </datalist>
                  {items.length > 1 && (
                    <button onClick={() => removeItem(item.id)}
                      className="w-10 h-10 bg-expense/10 rounded-xl flex items-center justify-center">
                      <Trash2 size={14} className="text-expense" />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] font-semibold text-muted mb-1 block">{t('invoices.quantity')}</label>
                    <input type="number" value={item.quantity || ''} onChange={e => updateItem(item.id, 'quantity', Number(e.target.value))}
                      className="w-full h-9 bg-surface border border-border rounded-xl px-2 text-sm text-center focus:outline-none" />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-muted mb-1 block">{t('invoices.price')}</label>
                    <input type="number" value={item.price || ''} onChange={e => updateItem(item.id, 'price', Number(e.target.value))}
                      className="w-full h-9 bg-surface border border-border rounded-xl px-2 text-sm text-center focus:outline-none" />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-muted mb-1 block">{t('invoices.total')}</label>
                    <div className="h-9 bg-teal/5 border border-teal/20 rounded-xl px-2 flex items-center justify-center">
                      <span className="text-sm font-bold text-teal-dark">Rs. {formatAmount(item.total)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="card p-4 mb-5">
            <div className="flex justify-between py-2 text-sm">
              <span className="text-muted">{t('invoices.subtotal')}</span>
              <span className="font-semibold text-navy">Rs. {formatAmount(subtotal)}</span>
            </div>
            <div className="flex items-center justify-between py-2 text-sm border-t border-border/60">
              <span className="text-muted">{t('invoices.discount')}</span>
              <div className="flex items-center gap-1">
                <span className="text-muted text-xs">Rs.</span>
                <input type="number" value={discount || ''} onChange={e => setDiscount(Number(e.target.value))}
                  placeholder="0"
                  className="w-20 text-right bg-transparent font-semibold focus:outline-none text-navy" />
              </div>
            </div>
            <div className="flex justify-between items-center pt-3 border-t border-border">
              <span className="font-bold text-navy">{t('invoices.total')}</span>
              <span className="text-2xl font-black text-navy">Rs. {formatAmount(total)}</span>
            </div>
          </div>

          <button onClick={() => setStep(3)} disabled={total <= 0}
            className={cn('w-full h-13 rounded-2xl font-bold text-sm',
              total > 0 ? 'btn-teal text-navy' : 'bg-border text-muted cursor-not-allowed')}>
            {t('buttons.next')}
          </button>
        </div>
      )}

      {/* STEP 3 — Payment */}
      {step === 3 && (
        <div className="px-4 pt-5">
          <div className="card p-5 text-center mb-5">
            <p className="text-[11px] font-bold text-muted uppercase tracking-wider mb-2">{t('invoices.totalAmount')}</p>
            <p className="text-4xl font-black text-navy">Rs. {formatAmount(total)}</p>
          </div>

          <p className="text-[11px] font-bold text-muted uppercase tracking-wider mb-3">{t('invoices.paymentMethod')}</p>
          <div className="grid grid-cols-2 gap-3 mb-5">
            {[
              { v: 'paid', l: 'invoices.paidNow', icon: '✓', color: 'border-income bg-income/5' },
              { v: 'loan', l: 'invoices.loanCredit', icon: '⏳', color: 'border-loan bg-loan/5' },
            ].map(m => (
              <button key={m.v} onClick={() => setPaymentMode(m.v as 'paid' | 'loan')}
                className={cn('p-4 rounded-2xl border-2 text-left transition-all',
                  paymentMode === m.v ? m.color : 'border-border bg-white')}>
                <p className="text-xl mb-2">{m.icon}</p>
                <p className="text-sm font-bold text-navy">{t(m.l)}</p>
              </button>
            ))}
          </div>

          {paymentMode === 'paid' && (
            <div className="mb-5">
              <p className="text-[11px] font-bold text-muted uppercase tracking-wider mb-3">{t('wallets.wallets')}</p>
              <div className="flex gap-2">
                {enabledWallets.map(w => (
                  <button key={w.id} onClick={() => setWalletId(w.id)}
                    className={cn('flex-1 h-11 rounded-xl border-2 text-xs font-bold transition-all',
                      walletId === w.id ? 'border-teal bg-teal/5 text-teal-dark' : 'border-border text-muted')}>
                    {w.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mb-6">
            <p className="text-[11px] font-bold text-muted uppercase tracking-wider mb-2">{t('transactions.when')}</p>
            <input type="date" value={date} onChange={e => setDate(e.target.value)}
              className="w-full h-12 bg-white border border-border rounded-xl px-4 text-sm focus:outline-none focus:border-teal" />
          </div>

          <button onClick={handleCreate}
            className="btn-teal w-full h-14 font-bold text-base text-navy flex items-center justify-center gap-2">
            <Check size={20} strokeWidth={2.5} />
            {t('invoices.createInvoice')}
          </button>
        </div>
      )}
    </div>
  )
}
