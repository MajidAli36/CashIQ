'use client'
import { useInvoiceStore } from '@/lib/store/invoice.store'
import { useSettingsStore } from '@/lib/store/settings.store'
import { useTranslation } from '@/lib/hooks/useTranslation'
import { formatCurrency } from '@/lib/utils/currency'
import { formatDate } from '@/lib/utils/date'
import { PageHeader } from '@/components/layout/PageHeader'
import { EmptyState } from '@/components/ui/EmptyState'
import { Plus } from 'lucide-react'
import Link from 'next/link'

export default function InvoiceListPage() {
  const { t } = useTranslation()
  const { invoices } = useInvoiceStore()

  return (
    <div className="min-h-screen bg-surface pb-20">
      <PageHeader title={t('invoices.invoices')} backTo="/dashboard"
        right={<Link href="/invoice/new" className="text-xs font-semibold px-3 py-1.5 rounded-xl" style={{ color: 'var(--t-muted)', background: 'var(--t-card-bg)', border: '1px solid var(--t-card-border)' }}>{t('buttons.addNew')}</Link>}
      />
      <div className="px-4 pt-4">
        {invoices.length === 0 ? (
          <EmptyState icon="🧾" title={t('invoices.noInvoices')}
            action={<Link href="/invoice/new" className="px-6 py-3 text-white rounded-xl text-sm font-semibold" style={{ background: 'var(--t-accent)' }}>{t('invoices.newInvoice')}</Link>}
          />
        ) : (
          <div className="space-y-2">
            {invoices.map(inv => (
              <div key={inv.id} className="bg-white rounded-2xl p-4 border border-border">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-bold text-navy">{inv.invoice_no}</span>
                  <span className="text-sm font-bold text-income">{formatCurrency(inv.total)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-muted">{inv.customer_name || t('transactions.walkInCustomer')}</span>
                  <span className="text-xs text-muted">{formatDate(inv.date)}</span>
                </div>
                {inv.is_loan && <span className="mt-2 inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full bg-loan-light text-loan">{t('transactions.loan')}</span>}
              </div>
            ))}
          </div>
        )}
      </div>
      <Link href="/invoice/new" className="fixed bottom-24 right-4 w-14 h-14 rounded-full flex items-center justify-center shadow-lg text-white" style={{ background: 'var(--t-accent)' }}>
        <Plus size={24} strokeWidth={2.5} />
      </Link>
    </div>
  )
}
