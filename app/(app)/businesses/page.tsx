'use client'
import { useState } from 'react'
import { useBusinessStore } from '@/lib/store/business.store'
import { useSettingsStore } from '@/lib/store/settings.store'
import { useTransactionStore } from '@/lib/store/transaction.store'
import { useLoanStore } from '@/lib/store/loan.store'
import { PageHeader } from '@/components/layout/PageHeader'
import { showToast } from '@/components/ui/Toast'
import { formatAmount } from '@/lib/utils/currency'
import { todayISO } from '@/lib/utils/date'
import { cn } from '@/lib/utils/cn'
import { useTranslation } from '@/lib/hooks/useTranslation'
import {
  Building2, Plus, Check, Pencil, Trash2, X, ChevronRight,
  TrendingUp, TrendingDown, Wallet, Users,
} from 'lucide-react'
import type { BusinessTypeId } from '@/lib/types'

const BUSINESS_TYPES: { id: BusinessTypeId; label: string; icon: string }[] = [
  { id: 'mobile_shop',  label: 'mobileShop',   icon: '📱' },
  { id: 'repair_shop',  label: 'repairShop',   icon: '🔧' },
  { id: 'garments',     label: 'garments',      icon: '👗' },
  { id: 'grocery',      label: 'grocery',       icon: '🛒' },
  { id: 'freelancer',   label: 'freelancer',    icon: '💻' },
  { id: 'manufacturer', label: 'manufacturer',  icon: '🏭' },
  { id: 'other',        label: 'other',         icon: '🏪' },
]

const COLORS = ['#00C4B4', '#6366f1', '#f59e0b', '#ef4444', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#f97316']

export default function BusinessesPage() {
  const { t } = useTranslation()
  const {
    businesses, activeBusinessId,
    addBusiness, updateBusiness, deleteBusiness, setActiveBusiness,
  } = useBusinessStore()
  const { initBusinessDefaults } = useSettingsStore()
  const { getTotalIncome, getTotalExpense, getMonthlyCount } = useTransactionStore()
  const { getTotalToReceive, getTotalToGive } = useLoanStore()

  const [mode, setMode] = useState<'list' | 'add' | 'edit'>('list')
  const [editId, setEditId] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  // Form state
  const [name, setName]         = useState('')
  const [ownerName, setOwner]   = useState('')
  const [phone, setPhone]       = useState('')
  const [city, setCity]         = useState('')
  const [type, setType]         = useState<BusinessTypeId>('mobile_shop')
  const [color, setColor]       = useState(COLORS[0])
  const [errors, setErrors]     = useState<Record<string, string>>({})

  const today = todayISO()

  const resetForm = () => {
    setName(''); setOwner(''); setPhone(''); setCity('')
    setType('mobile_shop'); setColor(COLORS[0]); setErrors({})
  }

  const openAdd = () => {
    resetForm()
    const nextColor = COLORS[businesses.length % COLORS.length]
    setColor(nextColor)
    setMode('add')
  }

  const openEdit = (id: string) => {
    const b = businesses.find(b => b.id === id)
    if (!b) return
    setName(b.name); setOwner(b.owner_name); setPhone(b.phone)
    setCity(b.city); setType(b.type); setColor(b.color)
    setEditId(id); setErrors({}); setMode('edit')
  }

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!name.trim()) errs.name = t('validation.nameRequired')
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSave = () => {
    if (!validate()) return
    if (mode === 'add') {
      const id = addBusiness({
        name: name.trim(),
        type,
        owner_name: ownerName.trim(),
        phone: phone.trim(),
        city: city.trim(),
        currency: 'PKR',
        country_code: 'PK',
        color,
        is_default: false,
      })
      setActiveBusiness(id)
      initBusinessDefaults(id)
      showToast({ type: 'success', message: t('messages.created') })
    } else if (mode === 'edit' && editId) {
      updateBusiness(editId, {
        name: name.trim(),
        type,
        owner_name: ownerName.trim(),
        phone: phone.trim(),
        city: city.trim(),
        color,
      })
      showToast({ type: 'success', message: t('messages.updated') })
    }
    resetForm(); setMode('list')
  }

  const handleDelete = (id: string) => {
    if (businesses.length <= 1) {
      showToast({ type: 'error', message: t('validation.required') })
      return
    }
    deleteBusiness(id)
    showToast({ type: 'success', message: t('messages.deleted') })
    setConfirmDeleteId(null)
  }

  /* ─ Form UI ─ */
  if (mode === 'add' || mode === 'edit') {
    return (
      <div className="min-h-screen bg-surface pb-10">
        <PageHeader
          title={mode === 'add' ? t('businesses.addBusiness') : t('businesses.editBusiness')}
          dark
          onBack={() => { resetForm(); setMode('list') }}
          right={
            <button onClick={() => { resetForm(); setMode('list') }}
              className="w-8 h-8 flex items-center justify-center bg-white/10 rounded-xl">
              <X size={16} className="text-white" />
            </button>
          }
        />

        <div className="px-4 pt-5 space-y-4">

          {/* Name */}
          <div>
            <label className="text-xs font-semibold text-muted mb-1 block">{t('businesses.businessName')} *</label>
            <input
              value={name}
              onChange={e => { setName(e.target.value); setErrors(p => ({ ...p, name: '' })) }}
              placeholder={t('businesses.businessNamePlaceholder')}
              className={cn(
                'w-full h-11 px-4 rounded-xl border text-sm focus:outline-none bg-white',
                errors.name ? 'border-expense' : 'border-border focus:border-navy'
              )}
            />
            {errors.name && <p className="text-xs text-expense mt-1">{errors.name}</p>}
          </div>

          {/* Owner & Phone */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-muted mb-1 block">{t('businesses.ownerName')}</label>
              <input value={ownerName} onChange={e => setOwner(e.target.value)}
                placeholder={t('businesses.ownerNamePlaceholder')} className="w-full h-11 px-4 rounded-xl border border-border text-sm focus:outline-none bg-white" />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted mb-1 block">{t('common.phone')}</label>
              <input value={phone} onChange={e => setPhone(e.target.value)}
                placeholder={t('businesses.phonePlaceholder')} type="tel" className="w-full h-11 px-4 rounded-xl border border-border text-sm focus:outline-none bg-white" />
            </div>
          </div>

          {/* City */}
          <div>
            <label className="text-xs font-semibold text-muted mb-1 block">{t('settings.shopCity')}</label>
            <input value={city} onChange={e => setCity(e.target.value)}
              placeholder={t('businesses.cityPlaceholder')} className="w-full h-11 px-4 rounded-xl border border-border text-sm focus:outline-none bg-white" />
          </div>

          {/* Business Type */}
          <div>
            <label className="text-xs font-semibold text-muted mb-2 block">{t('businesses.businessType')}</label>
            <div className="grid grid-cols-2 gap-2">
              {BUSINESS_TYPES.map(t => (
                <button key={t.id} onClick={() => setType(t.id)}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-semibold transition-all text-left',
                    type === t.id ? 'text-white' : 'text-navy'
                  )}
                  style={type === t.id ? {
                    background: 'var(--t-accent)',
                    borderColor: 'var(--t-accent)',
                  } : {
                    background: 'var(--t-card-bg)',
                    borderColor: 'var(--t-card-border)',
                  }}>
                  <span className="text-lg">{t.icon}</span>
                  <span className="truncate">{t.label}</span>
                  {type === t.id && <Check size={13} className="ml-auto flex-shrink-0" />}
                </button>
              ))}
            </div>
          </div>

          {/* Color */}
          <div>
            <label className="text-xs font-semibold text-muted mb-2 block">{t('businesses.selectColor')}</label>
            <div className="flex gap-2.5 flex-wrap">
              {COLORS.map(c => (
                <button key={c} onClick={() => setColor(c)}
                  className={cn(
                    'w-9 h-9 rounded-full transition-transform',
                    color === c ? 'ring-2 ring-offset-2 ring-navy scale-110' : ''
                  )}
                  style={{ background: c }} />
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="rounded-2xl p-4 flex items-center gap-3"
            style={{ background: `${color}15`, border: `1px solid ${color}35` }}>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-black text-lg flex-shrink-0"
              style={{ background: color }}>
              {(name || 'BZ').slice(0, 2).toUpperCase()}
            </div>
            <div>
              <p className="font-bold text-navy text-sm">{name || 'Business Name'}</p>
              <p className="text-xs text-muted">{BUSINESS_TYPES.find(t => t.id === type)?.label}</p>
              {ownerName && <p className="text-xs text-muted">{ownerName}</p>}
            </div>
          </div>

          <button
            onClick={handleSave}
            className="w-full h-12 rounded-xl text-white font-bold text-sm"
            style={{ background: color }}>
            {mode === 'add' ? t('businesses.addBusiness') : t('common.save')}
          </button>
        </div>
      </div>
    )
  }

  /* ─ List UI ─ */
  return (
    <div className="min-h-screen bg-surface pb-20">
      <PageHeader
        title={t('businesses.businesses')} backTo="/dashboard"
        right={
          <button onClick={openAdd}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl"
            style={{ color: 'var(--t-muted)', background: 'var(--t-card-bg)', border: '1px solid var(--t-card-border)' }}>
            <Plus size={14} /> {t('common.add')}
          </button>
        }
      />

      <div className="px-4 pt-4 space-y-3">

        {/* Consolidated Summary */}
        {businesses.length > 1 && (
          <div className="bg-white rounded-2xl border border-border p-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted mb-3">{t('businesses.businesses')}</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl p-3 bg-income/8">
                <p className="text-[10px] text-muted mb-1">{t('dashboard.dashboard')} {t('transactions.income')}</p>
                <p className="font-black text-income">Rs. {formatAmount(
                  businesses.reduce((s, b) => s + getTotalIncome(today, today, b.id), 0)
                )}</p>
              </div>
              <div className="rounded-xl p-3 bg-expense/8">
                <p className="text-[10px] text-muted mb-1">{t('dashboard.dashboard')} {t('transactions.expense')}</p>
                <p className="font-black text-expense">Rs. {formatAmount(
                  businesses.reduce((s, b) => s + getTotalExpense(today, today, b.id), 0)
                )}</p>
              </div>
            </div>
          </div>
        )}

        {/* Business cards */}
        {businesses.length === 0 ? (
          <div className="text-center py-16">
            <Building2 size={40} className="text-muted mx-auto mb-3" />
            <p className="text-muted font-semibold">{t('messages.noData')}</p>
            <button onClick={openAdd}
              className="mt-4 px-6 py-2.5 text-white rounded-xl text-sm font-semibold"
              style={{ background: 'var(--t-accent)' }}>
              {t('businesses.createFirst')}
            </button>
          </div>
        ) : (
          businesses.map(b => {
            const isActive    = b.id === activeBusinessId
            const todayIn     = getTotalIncome(today, today, b.id)
            const todayOut    = getTotalExpense(today, today, b.id)
            const monthCount  = getMonthlyCount(b.id)
            const loanIn      = getTotalToReceive(b.id)
            const loanOut     = getTotalToGive(b.id)
            const bType       = BUSINESS_TYPES.find(t => t.id === b.type)

            return (
              <div key={b.id}
                className={cn(
                  'bg-white rounded-2xl border overflow-hidden',
                  isActive ? 'border-2' : 'border-border',
                )}
                style={isActive ? { borderColor: b.color } : {}}>

                {/* Card header */}
                <div className="flex items-center gap-3 px-4 pt-4 pb-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-black text-base flex-shrink-0"
                    style={{ background: b.color }}>
                    {b.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-navy text-sm truncate">{b.name}</p>
                      {isActive && (
                        <span className="flex-shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded-full text-white"
                          style={{ background: b.color }}>
                          ACTIVE
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted">{bType?.icon} {bType?.label} {b.city ? `· ${b.city}` : ''}</p>
                  </div>
                  <div className="flex gap-1.5 flex-shrink-0">
                    <button onClick={() => openEdit(b.id)}
                      className="w-8 h-8 flex items-center justify-center rounded-xl bg-surface hover:bg-border transition-colors">
                      <Pencil size={13} className="text-muted" />
                    </button>
                    {businesses.length > 1 && (
                      <button onClick={() => setConfirmDeleteId(b.id)}
                        className="w-8 h-8 flex items-center justify-center rounded-xl bg-surface hover:bg-red-50 transition-colors">
                        <Trash2 size={13} className="text-muted" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-3 gap-px bg-border mx-4 mb-3 rounded-xl overflow-hidden">
                  <div className="bg-white p-2.5 text-center">
                    <p className="text-[9px] text-muted mb-0.5">{t('transactions.income')}</p>
                    <p className="text-[12px] font-bold text-income">+{formatAmount(todayIn)}</p>
                  </div>
                  <div className="bg-white p-2.5 text-center">
                    <p className="text-[9px] text-muted mb-0.5">{t('transactions.expense')}</p>
                    <p className="text-[12px] font-bold text-expense">-{formatAmount(todayOut)}</p>
                  </div>
                  <div className="bg-white p-2.5 text-center">
                    <p className="text-[9px] text-muted mb-0.5">{t('reports.thisMonth')}</p>
                    <p className="text-[12px] font-bold text-navy">{monthCount} {t('records.transactions')}</p>
                  </div>
                </div>

                {/* Loan row */}
                {(loanIn > 0 || loanOut > 0) && (
                  <div className="mx-4 mb-3 px-3 py-2 rounded-xl bg-loan/8 flex gap-4">
                    {loanIn > 0 && (
                      <div className="flex items-center gap-1.5">
                        <TrendingUp size={11} className="text-income" />
                        <span className="text-[11px] font-semibold text-income">لینا: {formatAmount(loanIn)}</span>
                      </div>
                    )}
                    {loanOut > 0 && (
                      <div className="flex items-center gap-1.5">
                        <TrendingDown size={11} className="text-expense" />
                        <span className="text-[11px] font-semibold text-expense">دینا: {formatAmount(loanOut)}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Switch button */}
                {!isActive && (
                  <div className="px-4 pb-4">
                    <button
                      onClick={() => { setActiveBusiness(b.id); showToast({ type: 'success', message: t('messages.success') }) }}
                      className="w-full h-10 rounded-xl border text-sm font-semibold text-navy border-border bg-surface hover:bg-white transition-colors flex items-center justify-center gap-2">
                      <Building2 size={14} />
                      {t('businesses.selectBusiness')}
                    </button>
                  </div>
                )}
              </div>
            )
          })
        )}

        {/* Add card */}
        <button onClick={openAdd}
          className="w-full flex items-center justify-center gap-2 h-14 rounded-2xl border-2 border-dashed border-border text-muted hover:border-navy hover:text-navy transition-colors">
          <Plus size={18} />
          <span className="text-sm font-semibold">{t('buttons.addNew')}</span>
        </button>

      </div>

      {/* Delete Confirm Modal */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setConfirmDeleteId(null)} />
          <div className="relative w-full md:max-w-[480px] bg-white rounded-t-3xl md:rounded-2xl p-6">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 bg-red-50 rounded-2xl flex items-center justify-center flex-shrink-0">
                <Trash2 size={20} className="text-expense" />
              </div>
              <button onClick={() => setConfirmDeleteId(null)} className="flex-shrink-0 p-1">
                <X size={18} className="text-muted" />
              </button>
            </div>
            <p className="text-base font-bold text-navy mb-1">{t('businesses.deleteBusiness')}</p>
            <p className="text-sm text-muted mb-5">
              {t('messages.confirm')}
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDeleteId(null)}
                className="flex-1 h-11 border border-border rounded-xl text-sm font-semibold text-navy">
                {t('common.cancel')}
              </button>
              <button onClick={() => handleDelete(confirmDeleteId)}
                className="flex-1 h-11 bg-expense text-white rounded-xl text-sm font-semibold">
                {t('common.delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
