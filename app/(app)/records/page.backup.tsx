'use client'
import { useState, useMemo } from 'react'
import { useSettingsStore } from '@/lib/store/settings.store'
import { useTransactionStore } from '@/lib/store/transaction.store'
import { useSubscriptionStore } from '@/lib/store/subscription.store'
import { useTranslation } from '@/lib/hooks/useTranslation'
import { formatCurrency } from '@/lib/utils/currency'
import { formatDate } from '@/lib/utils/date'
import { PageHeader } from '@/components/layout/PageHeader'
import { SearchBar } from '@/components/ui/SearchBar'
import { WalletBadge } from '@/components/ui/WalletBadge'
import { EmptyState } from '@/components/ui/EmptyState'
import { showToast } from '@/components/ui/Toast'
import { cn } from '@/lib/utils/cn'
import {
  Download, Pencil, RotateCcw, Trash2, X, Check,
  Tag, Wallet as WalletIcon, StickyNote,
} from 'lucide-react'
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns'
import { useBusinessStore } from '@/lib/store/business.store'
import type { Transaction, WalletType } from '@/lib/types'

/* ─────────────── constants ── */

const DATE_FILTERS = [
  { id: 'all',   label: 'dateAll' },
  { id: 'today', label: 'dateToday' },
  { id: 'week',  label: 'dateWeek' },
  { id: 'month', label: 'dateMonth' },
]

const TYPE_FILTERS = [
  { id: 'all',        label: 'typeAll' },
  { id: 'income',     label: 'typeIncome' },
  { id: 'expense',    label: 'typeExpense' },
  { id: 'transfer',   label: 'typeTransfer' },
  { id: 'loan_given', label: 'typeLoan' },
]

const PAGE_SIZE = 20

/* ─────────────── helpers ── */

const TYPE_COLOR: Record<string, string> = {
  income:           '#4CAF50',
  advance_received: '#3B82F6',
  expense:          '#FF5C5C',
  transfer:         '#00C4B4',
  loan_given:       '#F59E0B',
  loan_received:    '#F59E0B',
  opening_balance:  '#6b7280',
  adjustment:       '#6b7280',
}

function tColor(type: string) { return TYPE_COLOR[type] || '#6b7280' }

function iconBg(type: string) {
  if (['income', 'opening_balance', 'loan_received'].includes(type)) return 'rgba(76,175,80,0.12)'
  if (type === 'advance_received') return 'rgba(59,130,246,0.12)'
  if (type === 'loan_given')       return 'rgba(245,158,11,0.12)'
  if (type === 'transfer')         return 'rgba(0,196,180,0.12)'
  return 'rgba(255,92,92,0.12)'
}

function amtPrefix(type: string) {
  if (['income', 'loan_received', 'opening_balance', 'advance_received'].includes(type)) return '+'
  if (type === 'transfer') return '⇄'
  return '−'
}

const REVERSIBLE = new Set(['income', 'expense', 'loan_given', 'loan_received', 'transfer'])
const FULL_EDIT  = new Set(['income', 'expense', 'advance_received', 'opening_balance', 'adjustment'])

/* ─────────────── component ── */

export default function RecordsPage() {
  const { t } = useTranslation()
  const { categories, wallets } = useSettingsStore()
  const {
    transactions, editTransaction, softDeleteTransaction, reverseTransaction,
  } = useTransactionStore()
  const { isFeatureEnabled } = useSubscriptionStore()
  const { activeBusinessId } = useBusinessStore()
  const bid = activeBusinessId ?? undefined

  /* filter state */
  const [dateFilter,   setDateFilter]   = useState('all')
  const [typeFilter,   setTypeFilter]   = useState('all')
  const [walletFilter, setWalletFilter] = useState('all')
  const [search,       setSearch]       = useState('')
  const [page,         setPage]         = useState(1)
  const [showDeleted,  setShowDeleted]  = useState(false)

  /* sheet state */
  const [sel,   setSel]   = useState<Transaction | null>(null)
  const [sheet, setSheet] = useState<'action' | 'edit' | 'delete' | 'reverse' | null>(null)

  /* edit form */
  const [editAmt,   setEditAmt]   = useState('')
  const [editCatId, setEditCatId] = useState('')
  const [editWalId, setEditWalId] = useState('')
  const [editNote,  setEditNote]  = useState('')
  const [editErr,   setEditErr]   = useState('')

  const today        = format(new Date(), 'yyyy-MM-dd')
  const enabledWals  = wallets.filter(w => w.is_enabled && (!bid || w.business_id === bid))
  const deletedCount = useMemo(
    () => transactions.filter(t => !!t.is_deleted).length,
    [transactions],
  )

  const dateRange = useMemo(() => {
    if (dateFilter === 'today') return { from: today, to: today }
    if (dateFilter === 'week')  return {
      from: format(startOfWeek(new Date()),  'yyyy-MM-dd'),
      to:   format(endOfWeek(new Date()),    'yyyy-MM-dd'),
    }
    if (dateFilter === 'month') return {
      from: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
      to:   format(endOfMonth(new Date()),   'yyyy-MM-dd'),
    }
    return null
  }, [dateFilter, today])

  const filtered = useMemo(() => {
    return transactions.filter(t => {
      if (bid && t.business_id && t.business_id !== bid) return false
      if (['reversal', 'advance_offset'].includes(t.type)) return false
      if (t.is_deleted)  return showDeleted
      if (t.is_reversed) return false
      if (dateRange && (t.date < dateRange.from || t.date > dateRange.to)) return false
      if (typeFilter === 'income'     && !['income', 'advance_received'].includes(t.type)) return false
      if (typeFilter === 'expense'    && t.type !== 'expense')   return false
      if (typeFilter === 'transfer'   && t.type !== 'transfer')  return false
      if (typeFilter === 'loan_given' && !['loan_given', 'loan_received'].includes(t.type)) return false
      if (walletFilter !== 'all' && t.wallet_id !== walletFilter) return false
      if (search) {
        const cat = categories.find(c => c.id === t.category_id)
        const q   = search.toLowerCase()
        if (!cat?.name_en.toLowerCase().includes(q) && !t.note_en?.toLowerCase().includes(q)) return false
      }
      return true
    })
  }, [transactions, dateRange, typeFilter, walletFilter, search, categories, showDeleted])

  const paginated = filtered.slice(0, page * PAGE_SIZE)

  /* ── handlers ── */
  const closeSheet = () => { setSheet(null); setSel(null) }
  const openAction = (txn: Transaction) => { setSel(txn); setSheet('action') }

  const openEdit = () => {
    if (!sel) return
    setEditAmt(String(sel.amount))
    setEditCatId(sel.category_id)
    setEditWalId(sel.wallet_id)
    setEditNote(sel.note_en || '')
    setEditErr('')
    setSheet('edit')
  }

  const handleSaveEdit = () => {
    if (!sel) return
    const amt = parseFloat(editAmt.replace(/,/g, ''))
    if (isNaN(amt) || amt <= 0) { setEditErr('Enter a valid amount · رقم درج کریں'); return }
    editTransaction(sel.id, {
      amount:      amt,
      category_id: editCatId || sel.category_id,
      wallet_id:   editWalId  || sel.wallet_id,
      note_en:     editNote.trim() || undefined,
    })
    showToast({ type: 'success', message: 'Record updated!', messageUr: 'ریکارڈ اپ ڈیٹ ہوگیا' })
    closeSheet()
  }

  const handleDelete = () => {
    if (!sel) return
    softDeleteTransaction(sel.id)
    showToast({ type: 'success', message: 'Record deleted', messageUr: 'ریکارڈ حذف ہوگیا' })
    closeSheet()
  }

  const handleReverse = () => {
    if (!sel) return
    reverseTransaction(sel.id, 'owner')
    showToast({ type: 'success', message: 'Entry reversed!', messageUr: 'اندراج واپس ہوگیا' })
    closeSheet()
  }

  const exportCSV = () => {
    if (!isFeatureEnabled('csv_export')) return
    const rows = [['Date', 'Type', 'Category', 'Amount', 'Wallet', 'Note']]
    filtered.filter(t => !t.is_deleted).forEach(t => {
      const cat    = categories.find(c => c.id === t.category_id)
      const wallet = wallets.find(w => w.id === t.wallet_id)
      rows.push([t.date, t.type, cat?.name_en || '', String(t.amount), wallet?.name || '', t.note_en || ''])
    })
    const csv  = rows.map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a'); a.href = url; a.download = `rozcash-records-${today}.csv`; a.click()
  }

  /* edit derived */
  const editCats = sel
    ? categories.filter(c => c.is_enabled && (
        ['income', 'advance_received'].includes(sel.type) ? c.type === 'income' :
        sel.type === 'expense' ? c.type === 'expense' : false
      ))
    : []
  const isFullEdit = sel ? FULL_EDIT.has(sel.type) : false
  const canReverse = sel ? REVERSIBLE.has(sel.type) : false

  /* ── sheet wrapper ── */
  const Sheet = ({ children }: { children: React.ReactNode }) => (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      <div className="absolute inset-0 bg-black/65 backdrop-blur-sm" onClick={closeSheet} />
      <div className="relative w-full md:max-w-[480px] rounded-t-[28px] md:rounded-2xl overflow-hidden"
        style={{ background: 'var(--t-card-bg)', border: '1px solid var(--t-card-border)' }}>
        <div className="flex items-center justify-between px-5 pt-3 pb-1">
          <div className="w-10 h-1 rounded-full" style={{ background: 'var(--t-card-border)', opacity: 0.3 }} />
          <button onClick={closeSheet} className="flex-shrink-0">
            <X size={18} style={{ color: 'var(--t-muted)' }} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )

  /* ════════════════════════ RENDER ════════════════════════ */
  return (
    <div className="min-h-screen bg-surface pb-20">

      <PageHeader
        title={t('records.records')} showBack={false}
        right={
          <button onClick={exportCSV}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl"
            style={{ color: 'var(--t-muted)', background: 'var(--t-card-bg)', border: '1px solid var(--t-card-border)' }}>
            <Download size={14} /> {t('buttons.export')}
          </button>
        }
      />

      <div className="px-4 pt-4 space-y-3">

        <SearchBar value={search} onChange={setSearch} placeholder={t('placeholders.search')} />

        {/* Date filters */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {DATE_FILTERS.map(f => (
            <button key={f.id} onClick={() => { setDateFilter(f.id); setPage(1) }}
              className={cn('flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all',
                dateFilter === f.id ? 'text-white' : 'text-muted')}
              style={dateFilter === f.id ? {
                background: 'var(--t-accent)',
                borderColor: 'var(--t-accent)',
              } : {
                background: 'var(--t-card-bg)',
                borderColor: 'var(--t-card-border)',
              }}>
              {f.label}
            </button>
          ))}
        </div>

        {/* Type filters */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {TYPE_FILTERS.map(f => (
            <button key={f.id} onClick={() => { setTypeFilter(f.id); setPage(1) }}
              className={cn('flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all',
                typeFilter === f.id ? 'text-white' : 'text-muted')}
              style={typeFilter === f.id ? {
                background: 'var(--t-accent)',
                borderColor: 'var(--t-accent)',
              } : {
                background: 'var(--t-card-bg)',
                borderColor: 'var(--t-card-border)',
              }}>
              {t(`records.${f.label}`)}
            </button>
          ))}
        </div>

        {/* Wallet filters */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button onClick={() => { setWalletFilter('all'); setPage(1) }}
            className={cn('flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all',
              walletFilter === 'all' ? 'text-white' : 'text-muted')}
            style={walletFilter === 'all' ? {
              background: 'var(--t-accent)',
              borderColor: 'var(--t-accent)',
            } : {
              background: 'var(--t-card-bg)',
              borderColor: 'var(--t-card-border)',
            }}>
            All Wallets
          </button>
          {enabledWals.map(w => (
            <button key={w.id} onClick={() => { setWalletFilter(w.id); setPage(1) }}
              className={cn('flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all',
                walletFilter === w.id ? 'text-white' : 'text-muted')}
              style={walletFilter === w.id ? {
                background: 'var(--t-accent)',
                borderColor: 'var(--t-accent)',
              } : {
                background: 'var(--t-card-bg)',
                borderColor: 'var(--t-card-border)',
              }}>
              {w.name}
            </button>
          ))}
        </div>

        {/* Summary row */}
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted">
            {filtered.filter(t => !t.is_deleted).length} records
          </p>
          {deletedCount > 0 && (
            <button onClick={() => setShowDeleted(d => !d)}
              className={cn(
                'text-[11px] font-semibold px-3 py-1 rounded-full border transition-all',
                showDeleted ? 'text-expense' : 'text-muted',
              )}
              style={showDeleted ? {
                background: 'rgba(255,92,92,0.10)',
                borderColor: 'rgba(255,92,92,0.30)',
              } : {
                background: 'var(--t-card-bg)',
                borderColor: 'var(--t-card-border)',
              }}>
              {showDeleted ? '✕ Hide Deleted' : `Show ${deletedCount} Deleted`}
            </button>
          )}
        </div>

        {/* ── LIST ── */}
        {paginated.length === 0 ? (
          <EmptyState icon="📋" title={t('messages.noRecords')} />
        ) : (
          <div className="bg-white rounded-2xl border border-border overflow-hidden">
            {paginated.map((t, i) => {
              const cat    = categories.find(c => c.id === t.category_id)
              const wallet = wallets.find(w => w.id === t.wallet_id)
              const isPos  = amtPrefix(t.type) === '+'
              const isXfer = t.type === 'transfer'
              const isAdv  = t.type === 'advance_received'
              const isDel  = !!t.is_deleted

              return (
                <button key={t.id}
                  onClick={() => !isDel && openAction(t)}
                  disabled={isDel}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-3 text-left transition-colors',
                    i > 0 && 'border-t border-border',
                    isDel ? 'opacity-40 cursor-default' : 'hover:bg-surface/60 active:bg-surface',
                  )}>

                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-base flex-shrink-0"
                    style={{ backgroundColor: isDel ? '#f3f4f6' : iconBg(t.type) }}>
                    {cat?.icon || (isXfer ? '↔' : '💱')}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-semibold text-navy truncate leading-tight">
                        {cat?.name_en || t.type}
                      </p>
                      {isAdv && !isDel && (
                        <span className="flex-shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded"
                          style={{ background: 'rgba(59,130,246,0.12)', color: '#3B82F6' }}>
                          ADVANCE
                        </span>
                      )}
                      {isDel && (
                        <span className="flex-shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded bg-red-50 text-expense">
                          DELETED
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[11px] text-muted">{formatDate(t.date)} · {t.time}</span>
                      {t.note_en && (
                        <span className="text-[11px] text-muted truncate">· {t.note_en.slice(0, 26)}</span>
                      )}
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold"
                      style={{ color: isDel ? '#9ca3af' : isXfer ? '#00C4B4' : isPos ? '#4CAF50' : '#FF5C5C' }}>
                      {amtPrefix(t.type)}{formatCurrency(t.amount)}
                    </p>
                    {wallet && !isDel && <WalletBadge name={wallet.name} type={wallet.type as WalletType} />}
                  </div>
                </button>
              )
            })}
          </div>
        )}

        {paginated.length < filtered.length && (
          <button onClick={() => setPage(p => p + 1)}
            className="w-full h-12 border border-border rounded-xl text-sm font-semibold text-navy bg-white">
            Load More · مزید
          </button>
        )}

      </div>

      {/* ══ ACTION SHEET ══ */}
      {sheet === 'action' && sel && (
        <Sheet>
          <div className="px-5 pb-7">
            {/* Preview */}
            <div className="flex items-center gap-3 px-4 py-3 rounded-2xl mb-5"
              style={{ background: 'var(--t-page-bg)', border: '1px solid var(--t-card-border)' }}>
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-lg flex-shrink-0"
                style={{ background: iconBg(sel.type) }}>
                {categories.find(c => c.id === sel.category_id)?.icon || '💱'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-bold text-navy truncate">
                  {categories.find(c => c.id === sel.category_id)?.name_en || sel.type}
                </p>
                <p className="text-[11px] mt-0.5 text-muted">
                  {formatDate(sel.date)} · {sel.time}
                </p>
              </div>
              <p className="text-[16px] font-black flex-shrink-0" style={{ color: tColor(sel.type) }}>
                {amtPrefix(sel.type)}{formatCurrency(sel.amount)}
              </p>
            </div>

            {/* Buttons */}
            <div className="space-y-2">
              <button onClick={openEdit}
                className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-left active:opacity-70"
                style={{ background: 'var(--t-page-bg)', border: '1px solid var(--t-card-border)' }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(0,196,180,0.18)' }}>
                  <Pencil size={17} style={{ color: '#00C4B4' }} />
                </div>
                <div>
                  <p className="text-[14px] font-bold text-navy">
                    Edit · <span className="font-urdu font-normal text-sm opacity-50">ترمیم کریں</span>
                  </p>
                  <p className="text-[11px] mt-0.5 text-muted">
                    Modify amount, category, wallet or note
                  </p>
                </div>
              </button>

              {canReverse && (
                <button onClick={() => setSheet('reverse')}
                  className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-left active:opacity-70"
                  style={{ background: 'var(--t-page-bg)', border: '1px solid var(--t-card-border)' }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(245,158,11,0.18)' }}>
                    <RotateCcw size={17} style={{ color: '#F59E0B' }} />
                  </div>
                  <div>
                    <p className="text-[14px] font-bold text-navy">
                      Reverse Entry · <span className="font-urdu font-normal text-sm opacity-50">واپس کریں</span>
                    </p>
                    <p className="text-[11px] mt-0.5 text-muted">
                      Creates opposite transaction to cancel this
                    </p>
                  </div>
                </button>
              )}

              <button onClick={() => setSheet('delete')}
                className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-left active:opacity-70"
                style={{ background: 'rgba(255,92,92,0.08)', border: '1px solid rgba(255,92,92,0.18)' }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(255,92,92,0.18)' }}>
                  <Trash2 size={17} style={{ color: '#FF5C5C' }} />
                </div>
                <div>
                  <p className="text-[14px] font-bold" style={{ color: '#FF5C5C' }}>
                    Delete · <span className="font-urdu font-normal text-sm opacity-40">حذف کریں</span>
                  </p>
                  <p className="text-[11px] mt-0.5 opacity-60" style={{ color: 'var(--t-text)' }}>
                    Hides from list — data kept safely
                  </p>
                </div>
              </button>
            </div>

            <button onClick={closeSheet}
              className="w-full h-11 mt-3 rounded-2xl text-[13px] font-semibold"
              style={{ background: 'var(--t-page-bg)', border: '1px solid var(--t-card-border)', color: 'var(--t-muted)' }}>
              Cancel · <span className="font-urdu">منسوخ</span>
            </button>
          </div>
        </Sheet>
      )}

      {/* ══ EDIT SHEET ══ */}
      {sheet === 'edit' && sel && (
        <Sheet>
          <div className="px-5 pb-7">
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="text-[16px] font-black text-navy">
                  Edit · <span className="font-urdu font-normal text-[14px] opacity-45">ترمیم</span>
                </p>
                <p className="text-[11px] mt-0.5 text-muted">
                  {categories.find(c => c.id === sel.category_id)?.name_en || sel.type} · {formatDate(sel.date)}
                </p>
              </div>
              <button onClick={closeSheet}
                className="w-8 h-8 rounded-xl flex items-center justify-center bg-surface border border-border">
                <X size={14} className="text-muted" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Amount */}
              <div>
                <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider mb-2 text-muted">Amount · رقم</label>
                <div className="flex items-center gap-2 px-4 h-14 rounded-2xl"
                  style={{
                    background: editErr ? 'rgba(255,92,92,0.08)' : 'var(--t-page-bg)',
                    border: `1px solid ${editErr ? 'rgba(255,92,92,0.38)' : 'var(--t-card-border)'}`,
                  }}>
                  <span className="text-[16px] font-bold opacity-30" style={{ color: 'var(--t-text)' }}>Rs.</span>
                  <input type="text" inputMode="decimal" value={editAmt}
                    onChange={e => { setEditAmt(e.target.value); setEditErr('') }}
                    className="flex-1 bg-transparent text-[22px] font-bold text-navy focus:outline-none" />
                </div>
                {editErr && <p className="text-[11px] mt-1.5" style={{ color: '#FF5C5C' }}>{editErr}</p>}
              </div>

              {/* Category */}
              {isFullEdit && editCats.length > 0 && (
                <div>
                  <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider mb-2 text-muted">
                    <Tag size={10} /> Category · قسم
                  </label>
                  <div className="flex gap-2 overflow-x-auto scrollbar-none pb-0.5">
                    {editCats.map(c => (
                      <button key={c.id} onClick={() => setEditCatId(c.id)}
                        className="flex-shrink-0 flex items-center gap-1.5 h-9 px-3.5 rounded-2xl text-[12px] font-semibold whitespace-nowrap transition-all"
                        style={{
                          background: editCatId === c.id ? `${tColor(sel.type)}1E` : 'var(--t-page-bg)',
                          border:     `1px solid ${editCatId === c.id ? `${tColor(sel.type)}40` : 'var(--t-card-border)'}`,
                          color:      editCatId === c.id ? tColor(sel.type) : 'var(--t-muted)',
                        }}>
                        {c.icon} {c.name_en}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Wallet */}
              {isFullEdit && (
                <div>
                  <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider mb-2 text-muted">
                    <WalletIcon size={10} /> Wallet · بٹوہ
                  </label>
                  <div className="flex gap-2 overflow-x-auto scrollbar-none pb-0.5">
                    {enabledWals.map(w => (
                      <button key={w.id} onClick={() => setEditWalId(w.id)}
                        className="flex-shrink-0 flex items-center gap-2 h-10 px-3.5 rounded-2xl transition-all"
                        style={{
                          background: editWalId === w.id ? `${tColor(sel.type)}1E` : 'var(--t-page-bg)',
                          border:     `1.5px solid ${editWalId === w.id ? `${tColor(sel.type)}40` : 'var(--t-card-border)'}`,
                        }}>
                        <span className="text-base">{w.icon}</span>
                        <span className="text-[12px] font-bold"
                          style={{ color: editWalId === w.id ? tColor(sel.type) : 'var(--t-muted)' }}>
                          {w.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Note */}
              <div>
                <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider mb-2 text-muted">
                  <StickyNote size={10} /> {t('transactions.note')}
                  <span className="text-[9px] normal-case opacity-40">({t('common.optional')})</span>
                </label>
                <input type="text" value={editNote} onChange={e => setEditNote(e.target.value)}
                  placeholder={t('placeholders.enterNote')}
                  className="w-full h-11 px-4 rounded-2xl bg-transparent text-[13px] text-navy placeholder:text-muted/40 focus:outline-none"
                  style={{ background: 'var(--t-page-bg)', border: '1px solid var(--t-card-border)' }} />
              </div>
            </div>

            <div className="flex gap-3 mt-5">
              <button onClick={closeSheet}
                className="flex-1 h-12 rounded-2xl text-[13px] font-semibold border border-border"
                style={{ background: 'var(--t-page-bg)', color: 'var(--t-muted)' }}>
                Cancel
              </button>
              <button onClick={handleSaveEdit}
                className="flex-[2] h-12 rounded-2xl text-[13px] font-bold text-white flex items-center justify-center gap-2"
                style={{
                  background: `linear-gradient(135deg,${tColor(sel.type)} 0%,${tColor(sel.type)}CC 100%)`,
                  boxShadow:  `0 4px 18px ${tColor(sel.type)}35`,
                }}>
                <Check size={15} strokeWidth={2.5} />
                Save · <span className="font-urdu font-normal text-[12px]">محفوظ</span>
              </button>
            </div>
          </div>
        </Sheet>
      )}

      {/* ══ DELETE CONFIRM SHEET ══ */}
      {sheet === 'delete' && sel && (
        <Sheet>
          <div className="px-5 pb-8">
            <div className="flex flex-col items-center text-center py-3 mb-4">
              <div className="w-14 h-14 rounded-[20px] flex items-center justify-center mb-4"
                style={{ background: 'rgba(255,92,92,0.15)', border: '1px solid rgba(255,92,92,0.22)' }}>
                <Trash2 size={24} style={{ color: '#FF5C5C' }} />
              </div>
              <p className="text-[17px] font-black text-navy">Delete Record?</p>
              <p className="font-urdu text-[14px] mt-0.5 text-muted">ریکارڈ حذف کریں؟</p>
              <p className="text-[12px] mt-3 leading-relaxed text-muted opacity-80">
                This record will be hidden from your list.
              </p>
              <p className="text-[10px] mt-1 text-muted opacity-50">
                Your data is kept safely — nothing is permanently lost.
              </p>
            </div>

            <div className="flex items-center gap-3 px-4 py-3 rounded-2xl mb-5"
              style={{ background: 'var(--t-page-bg)', border: '1px solid var(--t-card-border)' }}>
              <span className="text-xl">{categories.find(c => c.id === sel.category_id)?.icon || '💱'}</span>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-navy truncate">
                  {categories.find(c => c.id === sel.category_id)?.name_en || sel.type}
                </p>
                <p className="text-[11px] text-muted">{formatDate(sel.date)}</p>
              </div>
              <p className="font-bold text-[14px] flex-shrink-0" style={{ color: tColor(sel.type) }}>
                {amtPrefix(sel.type)}{formatCurrency(sel.amount)}
              </p>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setSheet('action')}
                className="flex-1 h-12 rounded-2xl text-[13px] font-semibold border border-border"
                style={{ background: 'var(--t-page-bg)', color: 'var(--t-muted)' }}>
                Cancel
              </button>
              <button onClick={handleDelete}
                className="flex-[2] h-12 rounded-2xl text-[13px] font-bold flex items-center justify-center gap-2"
                style={{ background: 'rgba(255,92,92,0.22)', border: '1px solid rgba(255,92,92,0.38)', color: '#FF5C5C' }}>
                <Trash2 size={15} strokeWidth={2.5} />
                Delete · <span className="font-urdu font-normal text-[12px]">حذف</span>
              </button>
            </div>
          </div>
        </Sheet>
      )}

      {/* ══ REVERSE CONFIRM SHEET ══ */}
      {sheet === 'reverse' && sel && (
        <Sheet>
          <div className="px-5 pb-8">
            <div className="flex flex-col items-center text-center py-3 mb-4">
              <div className="w-14 h-14 rounded-[20px] flex items-center justify-center mb-4"
                style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.22)' }}>
                <RotateCcw size={24} style={{ color: '#F59E0B' }} />
              </div>
              <p className="text-[17px] font-black text-navy">Reverse Entry?</p>
              <p className="font-urdu text-[14px] mt-0.5 text-muted">اندراج واپس کریں؟</p>
              <p className="text-[12px] mt-3 leading-relaxed max-w-[260px] text-muted opacity-80">
                An opposite transaction will be created to cancel the effect of this entry.
              </p>
            </div>

            {/* Before → After */}
            <div className="flex items-center gap-2 mb-5">
              <div className="flex-1 px-3 py-2.5 rounded-xl text-center"
                style={{ background: 'var(--t-page-bg)', border: '1px solid var(--t-card-border)' }}>
                <p className="text-[9px] font-bold uppercase tracking-wide mb-1 text-muted opacity-50">Original</p>
                <p className="text-[14px] font-black" style={{ color: tColor(sel.type) }}>
                  {amtPrefix(sel.type)}{formatCurrency(sel.amount)}
                </p>
              </div>
              <RotateCcw size={14} className="text-muted opacity-30" style={{ flexShrink: 0 }} />
              <div className="flex-1 px-3 py-2.5 rounded-xl text-center"
                style={{ background: 'rgba(255,92,92,0.08)', border: '1px solid rgba(255,92,92,0.18)' }}>
                <p className="text-[9px] font-bold uppercase tracking-wide mb-1 text-muted opacity-50">Reversal</p>
                <p className="text-[14px] font-black" style={{ color: '#FF5C5C' }}>−{formatCurrency(sel.amount)}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setSheet('action')}
                className="flex-1 h-12 rounded-2xl text-[13px] font-semibold border border-border"
                style={{ background: 'var(--t-page-bg)', color: 'var(--t-muted)' }}>
                Cancel
              </button>
              <button onClick={handleReverse}
                className="flex-[2] h-12 rounded-2xl text-[13px] font-bold text-white flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg,#F59E0B 0%,#D97706 100%)', boxShadow: '0 4px 18px rgba(245,158,11,0.30)' }}>
                <RotateCcw size={15} strokeWidth={2.5} />
                Reverse · <span className="font-urdu font-normal text-[12px]">واپس کریں</span>
              </button>
            </div>
          </div>
        </Sheet>
      )}

    </div>
  )
}
