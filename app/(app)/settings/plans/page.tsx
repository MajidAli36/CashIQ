'use client'
import { useState } from 'react'
import { useSubscriptionStore } from '@/lib/store/subscription.store'
import { useTranslation } from '@/lib/hooks/useTranslation'
import { PLANS } from '@/lib/config/plans.config'
import { COUNTRIES } from '@/lib/config/countries.config'
import { PageHeader } from '@/components/layout/PageHeader'
import { PlanBadge } from '@/components/ui/PlanBadge'
import { formatCurrency } from '@/lib/utils/currency'
import { showToast } from '@/components/ui/Toast'
import { cn } from '@/lib/utils/cn'
import { Check, Copy, Clock } from 'lucide-react'
import type { PlanId, BillingCycle } from '@/lib/types'

export default function PlansPage() {
  const { subscription, setPlan } = useSubscriptionStore()
  const [billing, setBilling] = useState<BillingCycle>('monthly')
  const [selectedPlan, setSelectedPlan] = useState<PlanId | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const handleSelectPlan = (id: PlanId) => {
    if (id === 'starter') {
      setPlan('starter', 'monthly')
      showToast({ type: 'success', message: 'Switched to Starter Plan' })
      return
    }
    setSelectedPlan(id)
  }

  const handleSubmit = () => {
    if (!selectedPlan) return
    setPlan(selectedPlan, billing)
    setSubmitted(true)
    showToast({ type: 'success', message: 'Request submitted!', messageUr: 'درخواست موصول' })
  }

  const featureLabels: Record<string, string> = {
    invoice: 'Invoice creation',
    pdf_export: 'PDF export',
    csv_export: 'CSV export',
    advanced_reports: 'Advanced reports',
    priority_support: 'Priority support',
    inventory: 'Inventory',
    multi_user: 'Multi-user',
    custom_categories: 'Custom categories',
    daily_close: 'Daily close',
    loan_management: 'Loan management',
    wallet_management: 'Wallet management',
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-surface">
        <PageHeader title="Plans" titleUr="پلان" backTo="/settings" />
        <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
          <div className="w-16 h-16 bg-loan-light rounded-full flex items-center justify-center mb-4">
            <Clock size={32} className="text-loan" />
          </div>
          <h2 className="text-xl font-bold text-navy mb-1">Request Received · درخواست موصول</h2>
          <p className="text-sm text-muted">Will be activated in 1-24 hours</p>
          <p className="font-urdu text-sm text-muted mt-1">1-24 گھنٹوں میں فعال ہوگا</p>
          <a href="https://wa.me/923001234567" target="_blank" rel="noopener noreferrer"
            className="mt-6 px-6 py-3 bg-[#25D366] text-white rounded-xl text-sm font-semibold">
            WhatsApp Support
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface pb-8">
      <PageHeader title="Plans" titleUr="پلان" backTo="/settings" />

      <div className="px-4 pt-4 space-y-4">
        {/* Billing Toggle */}
        <div className="flex border border-border rounded-2xl p-1" style={{ background: 'var(--t-card-bg)' }}>
          {(['monthly', 'annual'] as BillingCycle[]).map(b => (
            <button key={b} onClick={() => setBilling(b)}
              className={cn('flex-1 h-10 rounded-xl text-sm font-semibold transition-all',
                billing === b ? 'text-white' : 'text-muted')}
              style={billing === b ? { background: 'var(--t-accent)' } : {}}>
              {b === 'monthly' ? 'Monthly · ماہانہ' : 'Annual · سالانہ (Save 17%)'}
            </button>
          ))}
        </div>

        {/* Plan Cards */}
        {PLANS.map(plan => {
          const price = billing === 'annual' ? plan.price_annual : plan.price_monthly
          const isCurrent = subscription.plan_id === plan.id
          const isSelected = selectedPlan === plan.id
          const features = Object.entries(plan.features as Record<string, boolean>)

          return (
            <button key={plan.id} onClick={() => handleSelectPlan(plan.id as PlanId)}
              className={cn('w-full text-left bg-white rounded-2xl p-4 border-2 transition-all',
                isCurrent ? 'border-navy' : isSelected ? 'border-income' : 'border-border')}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-base font-bold text-navy">{plan.name_en}</span>
                    <PlanBadge plan={plan.id as PlanId} />
                    {plan.is_recommended && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-loan-light text-loan">Recommended</span>
                    )}
                  </div>
                  <p className="font-urdu text-sm text-muted">{plan.name_ur}</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-navy">
                    {price === 0 ? 'Free' : `Rs. ${price.toLocaleString()}`}
                  </p>
                  {price > 0 && <p className="text-xs text-muted">/{billing === 'annual' ? 'year' : 'month'}</p>}
                  {billing === 'annual' && 'annual_saving' in plan && (plan as any).annual_saving > 0 && (
                    <p className="text-xs text-income font-semibold">Save Rs. {(plan as any).annual_saving.toLocaleString()}</p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-1">
                {features.map(([key, enabled]) => (
                  <div key={key} className={cn('flex items-center gap-1.5 text-xs', enabled ? 'text-navy' : 'text-border')}>
                    <Check size={12} className={enabled ? 'text-income' : 'text-border'} />
                    {featureLabels[key] || key}
                  </div>
                ))}
              </div>
              {isCurrent && (
                <div className="mt-3 flex items-center gap-1.5 text-xs text-navy font-semibold">
                  <Check size={14} className="text-income" /> Current Plan
                </div>
              )}
            </button>
          )
        })}

        {/* Payment Section */}
        {selectedPlan && selectedPlan !== 'starter' && (
          <div className="bg-white rounded-2xl p-4 border border-border">
            <p className="text-sm font-bold text-navy mb-3">Send Payment · ادائیگی بھیجیں</p>

            <div className="space-y-3 mb-4">
              {[
                { name: 'JazzCash', account: '03XX-XXXXXXX', color: 'bg-jazz/10 border-jazz/20' },
                { name: 'EasyPaisa', account: '03XX-XXXXXXX', color: 'bg-easy/10 border-easy/20' },
              ].map(w => (
                <div key={w.name} className={cn('flex items-center justify-between p-3 rounded-xl border', w.color)}>
                  <div>
                    <p className="text-sm font-bold text-navy">{w.name}</p>
                    <p className="text-xs text-muted">{w.account}</p>
                  </div>
                  <button onClick={() => { navigator.clipboard.writeText(w.account); showToast({ type: 'success', message: 'Copied!' }) }}
                    className="p-2 bg-white rounded-lg border border-border">
                    <Copy size={14} className="text-navy" />
                  </button>
                </div>
              ))}
            </div>

            <div className="bg-loan-light border border-loan/20 rounded-xl p-3 mb-4 text-xs text-loan">
              No Stripe or card needed. Send via JazzCash or EasyPaisa and submit your payment screenshot below.
            </div>

            <button onClick={handleSubmit}
              className="w-full h-12 bg-income text-white rounded-xl text-sm font-semibold">
              Submit for Approval · منظوری کے لیے بھیجیں
            </button>
          </div>
        )}

        {/* Country Pricing */}
        <div>
          <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">Country Pricing · ملک کے مطابق قیمت</p>
          <div className="bg-white rounded-2xl border border-border overflow-hidden">
            {COUNTRIES.map((c, i) => (
              <div key={c.code} className={cn('flex items-center gap-3 px-4 py-3', i > 0 && 'border-t border-border', !(c as any).is_active && 'opacity-50')}>
                <span className="text-xl">{c.flag}</span>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-navy">{c.name_en}</p>
                  <p className="text-xs text-muted">{c.currency}</p>
                </div>
                {(c as any).is_active
                  ? <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-income-light text-income">Active</span>
                  : <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-surface text-muted border border-border">Coming Soon</span>
                }
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
