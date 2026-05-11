'use client'
import { useState, useCallback, useEffect, useRef, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useSettingsStore } from '@/lib/store/settings.store'
import { useTransactionStore } from '@/lib/store/transaction.store'
import { useLoanStore } from '@/lib/store/loan.store'
import { useAdvanceStore } from '@/lib/store/advance.store'
import { useBusinessStore } from '@/lib/store/business.store'
import { useVoicePrefillStore } from '@/lib/store/voice-prefill.store'
import { useTranslation } from '@/lib/hooks/useTranslation'
import { formatAmount } from '@/lib/utils/currency'
import { todayISO } from '@/lib/utils/date'
import { autoTranslate } from '@/lib/translation/urdu-dictionary'
import { showToast } from '@/components/ui/Toast'
import { cn } from '@/lib/utils/cn'
import { format } from 'date-fns'
import Link from 'next/link'
import {
  Delete, Check, ChevronLeft, Sparkles, ChevronDown, ChevronUp,
  Calendar, User, Phone, Wallet as WalletIcon, Tag, StickyNote,
  RefreshCw, ArrowRight, Search, X, Plus, Camera, ChevronRight,
  Settings2, Trash2, ImageIcon, MoreHorizontal, Users, FileCheck,
} from 'lucide-react'
import { MoneyInIcon, MoneyOutIcon, TransferIcon, LoanIcon } from '@/components/icons/AppIcons'
import type { TransactionType, WalletType, Category, Wallet } from '@/lib/types'

/* ─────────────────────────────────────────────
   Config & Constants
───────────────────────────────────────────── */
type TxnFormType = 'income' | 'expense' | 'transfer' | 'loan'

const TYPES = [
  {
    id: 'income' as TxnFormType,
    label: 'Income', labelUr: 'آمدنی',
    desc: 'Money received',
    color: '#00E87A', colorBg: 'rgba(0,232,122,0.13)', colorBorder: 'rgba(0,232,122,0.30)',
    Icon: MoneyInIcon,
    heroGrad: 'linear-gradient(160deg, var(--t-hero-from) 0%, var(--t-hero-mid) 60%, var(--t-hero-to) 100%)',
    cardGrad: 'linear-gradient(145deg,rgba(0,232,122,0.12) 0%,rgba(0,180,80,0.04) 100%)',
  },
  {
    id: 'expense' as TxnFormType,
    label: 'Expense', labelUr: 'خرچ',
    desc: 'Money spent',
    color: '#FF3B5C', colorBg: 'rgba(255,59,92,0.13)', colorBorder: 'rgba(255,59,92,0.30)',
    Icon: MoneyOutIcon,
    heroGrad: 'linear-gradient(160deg, var(--t-hero-from) 0%, var(--t-hero-mid) 60%, var(--t-hero-to) 100%)',
    cardGrad: 'linear-gradient(145deg,rgba(255,59,92,0.12) 0%,rgba(200,30,50,0.04) 100%)',
  },
  {
    id: 'transfer' as TxnFormType,
    label: 'Transfer', labelUr: 'منتقلی',
    desc: 'Between wallets',
    color: '#4F9EFF', colorBg: 'rgba(79,158,255,0.13)', colorBorder: 'rgba(79,158,255,0.30)',
    Icon: TransferIcon,
    heroGrad: 'linear-gradient(160deg, var(--t-hero-from) 0%, var(--t-hero-mid) 60%, var(--t-hero-to) 100%)',
    cardGrad: 'linear-gradient(145deg,rgba(79,158,255,0.12) 0%,rgba(40,100,220,0.04) 100%)',
  },
  {
    id: 'loan' as TxnFormType,
    label: 'Loan', labelUr: 'قرض / ادھار',
    desc: 'Give or take credit',
    color: '#F5A623', colorBg: 'rgba(245,166,35,0.13)', colorBorder: 'rgba(245,166,35,0.30)',
    Icon: LoanIcon,
    heroGrad: 'linear-gradient(160deg, var(--t-hero-from) 0%, var(--t-hero-mid) 60%, var(--t-hero-to) 100%)',
    cardGrad: 'linear-gradient(145deg,rgba(245,166,35,0.12) 0%,rgba(180,100,0,0.04) 100%)',
  },
] as const;

const NUMPAD = ['1','2','3','4','5','6','7','8','9','000','0','⌫']
const KEYPAD_HEIGHT = 368
const VISIBLE_CATS = 5

const WALLET_TYPES: { id: WalletType; label: string; icon: string; color: string }[] = [
  { id: 'cash',      label: 'Cash',      icon: '💵', color: '#22c55e' },
  { id: 'bank',      label: 'Bank',      icon: '🏦', color: '#00C4B4' },
  { id: 'jazzcash',  label: 'JazzCash',  icon: '📱', color: '#C8102E' },
  { id: 'easypaisa', label: 'EasyPaisa', icon: '💚', color: '#3a7a28' },
  { id: 'custom',    label: 'Other',     icon: '💳', color: '#6366f1' },
]

const CAT_ICONS  = ['🛒','🔧','⚙️','💰','➕','🛍️','🏠','⚡','👤','🚗','📦','🍕','💊','✂️','🖥️','📱','🎁','✈️','🔑','🏭']
const WALLET_ICONS = ['💵','💴','💶','💷','🏦','📱','💳','👛','💰','🏧','💎','🪙','🔐','🏪','💼']

const FORM_PREFS_KEY = 'rozcash-form-prefs'
interface FormPrefs {
  showCustomer: boolean
  showCategory: boolean
  showWallet: boolean
  showProof: boolean
  showNotes: boolean
}
const DEFAULT_FORM_PREFS: FormPrefs = {
  showCustomer: true, showCategory: true,
  showWallet: true, showProof: true, showNotes: true,
}

function fmt(n: string): string {
  if (!n) return ''
  const num = parseInt(n.replace(/,/g, ''))
  return isNaN(num) ? '' : num.toLocaleString('en-PK')
}

/* ─────────────────────────────────────────────
   Customer Picker Sheet
───────────────────────────────────────────── */
interface CustomerPickerProps {
  visible: boolean
  selectedId: string | null
  accentColor: string
  label: string
  hideWalkIn?: boolean
  onClose: () => void
  onSelect: (id: string | null, name: string) => void
}

function CustomerPickerSheet({ visible, selectedId, accentColor, label, hideWalkIn, onClose, onSelect }: CustomerPickerProps) {
  const { t } = useTranslation()
  const { customers, addCustomer, searchCustomers } = useLoanStore()
  const [q, setQ]             = useState('')
  const [adding, setAdding]   = useState(false)
  const [newName, setNewName] = useState('')
  const [newPhone, setNewPhone] = useState('')
  const [nameErr, setNameErr] = useState('')

  const recent  = customers.slice().sort((a, b) => b.created_at.localeCompare(a.created_at))
  const results = q.trim() ? searchCustomers(q.trim()) : recent.slice(0, 40)

  const reset = () => { setAdding(false); setQ(''); setNewName(''); setNewPhone(''); setNameErr('') }
  const handleClose = () => { reset(); onClose() }

  const handleSaveNew = () => {
    if (!newName.trim()) { setNameErr('Name required · نام ضروری ہے'); return }
    const id = addCustomer({ name: newName.trim(), phone: newPhone.trim(), notes: '' })
    onSelect(id, newName.trim())
    reset(); onClose()
  }

  if (!visible) return null
  return (
    <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center">
      <div className="absolute inset-0 bg-black/65 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative w-full md:max-w-[480px] rounded-t-[28px] md:rounded-2xl flex flex-col overflow-hidden"
        style={{ background: 'var(--t-card-bg)', border: '1px solid var(--t-card-border)', maxHeight: '90vh' }}>
        <div className="flex-shrink-0 pt-3 px-5 pb-4">
          <div className="w-10 h-1 rounded-full mx-auto mb-4" style={{ background: 'var(--t-card-border)', opacity: 0.3 }} />
          <div className="flex items-center justify-between mb-2">
            <p className="text-[15px] font-bold text-navy">{label}</p>
            <button onClick={handleClose} className="flex-shrink-0 p-1">
              <X size={18} style={{ color: 'var(--t-muted)' }} />
            </button>
          </div>
          <Link href="/customers" onClick={handleClose} className="text-[11px] font-bold" style={{ color: accentColor }}>Manage All →</Link>
        </div>
        <div className="flex-shrink-0 px-4 pb-3">
          <div className="flex items-center gap-2.5 h-11 px-4 rounded-2xl"
            style={{ background: 'var(--t-page-bg)', border: '1px solid var(--t-card-border)' }}>
            <Search size={14} style={{ color: 'var(--t-muted)' }} />
            <input value={q} onChange={e => setQ(e.target.value)} placeholder={t('add.searchNameOrPhone')}
              autoFocus className="flex-1 bg-transparent text-[13px] text-navy placeholder:text-muted focus:outline-none" />
            {q && <button onClick={() => setQ('')}><X size={12} style={{ color: 'var(--t-muted)' }} /></button>}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-none px-4">
          {!q && !hideWalkIn && (
            <button onClick={() => { onSelect(null, t('add.walkInCustomer')); handleClose() }}
              className="w-full flex items-center gap-3 py-3.5 border-b" style={{ borderColor: 'var(--t-card-border)' }}>
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-base flex-shrink-0"
                style={{ background: 'var(--t-page-bg)' }}>👤</div>
              <div className="flex-1 text-left">
                <p className="text-[13px] font-semibold text-navy">{t('add.walkInCustomer')}</p>
                <p className="font-urdu text-[11px] mt-0.5 text-muted">{t('add.walkInCustomerUr')}</p>
              </div>
              {selectedId === null && (
                <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: accentColor }}>
                  <Check size={10} className="text-white" strokeWidth={3} />
                </div>
              )}
            </button>
          )}
          {results.map(c => {
            const initials   = c.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
            const isSelected = selectedId === c.id
            return (
              <button key={c.id} onClick={() => { onSelect(c.id, c.name); handleClose() }}
                className="w-full flex items-center gap-3 py-3.5 border-b" style={{ borderColor: 'var(--t-card-border)' }}>
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-[12px] font-bold text-navy flex-shrink-0"
                  style={{ background: isSelected ? `${accentColor}25` : 'var(--t-page-bg)', border: isSelected ? `1px solid ${accentColor}45` : 'none' }}>
                  {initials}
                </div>
                <div className="flex-1 text-left min-w-0">
                  <p className="text-[13px] font-semibold text-navy truncate">{c.name}</p>
                  {c.phone && <p className="text-[11px] truncate mt-0.5 text-muted">{c.phone}</p>}
                </div>
                {isSelected && (
                  <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: accentColor }}>
                    <Check size={10} className="text-white" strokeWidth={3} />
                  </div>
                )}
              </button>
            )
          })}
          {results.length === 0 && q && (
            <p className="text-center py-8 text-[12px] text-muted">{t('add.noMatch')}</p>
          )}
          <div className="h-2" />
        </div>
        <div className="flex-shrink-0 px-4 pt-2 pb-6">
          {!adding ? (
            <button onClick={() => setAdding(true)} className="w-full flex items-center justify-center gap-2 h-11 rounded-2xl"
              style={{ background: `${accentColor}18`, border: `1px solid ${accentColor}35` }}>
              <Plus size={14} style={{ color: accentColor }} />
              <span className="text-[13px] font-bold" style={{ color: accentColor }}>+ {t('add.addNewCustomer')}</span>
            </button>
          ) : (
            <div className="rounded-2xl overflow-hidden"
              style={{ background: 'var(--t-page-bg)', border: '1px solid var(--t-card-border)' }}>
              <input value={newName} onChange={e => { setNewName(e.target.value); setNameErr('') }}
                placeholder={t('add.fullName')} autoFocus
                className="w-full px-4 py-3.5 bg-transparent text-[13px] text-navy placeholder:text-muted focus:outline-none border-b"
                style={{ borderColor: 'var(--t-card-border)' }} />
              {nameErr && <p className="text-[11px] px-4 pt-1.5" style={{ color: '#FF5C5C' }}>{nameErr}</p>}
              <input value={newPhone} onChange={e => setNewPhone(e.target.value)}
                placeholder={t('add.phone')} type="tel"
                className="w-full px-4 py-3.5 bg-transparent text-[13px] text-navy placeholder:text-muted focus:outline-none" />
              <div className="flex gap-2 px-3 pb-3">
                <button onClick={() => { setAdding(false); setNewName(''); setNewPhone(''); setNameErr('') }}
                  className="flex-1 h-10 rounded-xl text-[12px] font-semibold"
                  style={{ background: 'var(--t-card-border)', opacity: 0.5, color: 'var(--t-muted)' }}>{t('add.cancel')}</button>
                <button onClick={handleSaveNew} className="flex-[2] h-10 rounded-xl text-[12px] font-bold"
                  style={{ background: `${accentColor}22`, border: `1px solid ${accentColor}40`, color: accentColor }}>{t('add.saveCustomer')}</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   Customer Field Button
───────────────────────────────────────────── */
interface CustomerFieldProps {
  label: string
  required?: boolean
  customerId: string | null
  customerName: string
  accentColor: string
  error?: string
  onTap: () => void
}

function CustomerField({ label, required, customerId, customerName, accentColor, error, onTap }: CustomerFieldProps) {
  const initials = customerId
    ? customerName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : null
  return (
    <div>
      <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider mb-2 px-0.5"
        style={{ color: 'var(--t-muted)' }}>
        <User size={10} /> {label}
        {required && <span className="text-[9px] normal-case" style={{ color: '#FF5C5C' }}>*</span>}
      </label>
      <button onClick={onTap} className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-left transition-all"
        style={{ background: error ? 'rgba(255,92,92,0.07)' : 'rgba(255,255,255,0.05)', border: `1px solid ${error ? 'rgba(255,92,92,0.35)' : 'rgba(255,255,255,0.08)'}` }}>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-[12px] font-bold text-white flex-shrink-0"
          style={{ background: customerId ? `${accentColor}22` : 'var(--t-page-bg)' }}>
          {initials || '👤'}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-semibold" style={{ color: 'var(--t-text)' }}>{customerName}</p>
          <p className="text-[10px] mt-0.5" style={{ color: 'var(--t-muted)' }}>
            {customerId ? 'Tap to change · تبدیل کریں' : 'Tap to select or add new'}
          </p>
        </div>
        <ChevronRight size={14} style={{ color: 'var(--t-muted)' }} />
      </button>
      {error && <p className="text-[11px] mt-1 pl-0.5" style={{ color: '#FF5C5C' }}>{error}</p>}
    </div>
  )
}

/* ─────────────────────────────────────────────
   Add Category Sheet
───────────────────────────────────────────── */
interface AddCategorySheetProps {
  visible: boolean
  catType: 'income' | 'expense'
  accentColor: string
  onClose: () => void
  onAdded: (id: string) => void
}

function AddCategorySheet({ visible, catType, accentColor, onClose, onAdded }: AddCategorySheetProps) {
  const { addCategory } = useSettingsStore()
  const [name, setName]     = useState('')
  const [icon, setIcon]     = useState('🛒')
  const [nameErr, setNameErr] = useState('')

  const reset = () => { setName(''); setIcon('🛒'); setNameErr('') }
  const handleClose = () => { reset(); onClose() }

  const handleSave = () => {
    if (!name.trim()) { setNameErr('Category name required'); return }
    const id = addCategory({
      name_en: name.trim(),
      name_ur: autoTranslate(name.trim()),
      type: catType,
      icon,
      color: catType === 'income' ? '#3B6D11' : '#A32D2D',
      is_default: false,
      is_enabled: true,
    })
    onAdded(id)
    reset(); onClose()
  }

  if (!visible) return null
  return (
    <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative w-full md:max-w-[480px] rounded-t-[24px] md:rounded-2xl overflow-hidden"
        style={{ background: 'var(--t-card-bg)', border: '1px solid var(--t-card-border)' }}>
        <div className="pt-3 px-5 pb-2">
          <div className="w-10 h-1 rounded-full mx-auto mb-4" style={{ background: 'var(--t-card-border)', opacity: 0.3 }} />
          <div className="flex items-center justify-between mb-4">
            <p className="text-[15px] font-bold text-navy">New Category · نئی قسم</p>
            <button onClick={handleClose}><X size={18} style={{ color: 'var(--t-muted)' }} /></button>
          </div>
          <div className="mb-4">
            <label className="text-[10px] font-bold uppercase tracking-wider mb-2 block text-muted">Category Name</label>
            <input value={name} onChange={e => { setName(e.target.value); setNameErr('') }}
              placeholder="e.g. Consulting, Freelance..." autoFocus
              className="w-full h-12 bg-surface border rounded-2xl px-4 text-[14px] text-navy placeholder:text-muted/40 focus:outline-none transition-all"
              style={{ borderColor: nameErr ? 'rgba(255,92,92,0.50)' : 'var(--t-card-border)' }} />
            {nameErr && <p className="text-[11px] mt-1" style={{ color: '#FF5C5C' }}>{nameErr}</p>}
          </div>
          <div className="mb-5">
            <label className="text-[10px] font-bold uppercase tracking-wider mb-2 block text-muted">Icon</label>
            <div className="grid grid-cols-10 gap-1.5">
              {CAT_ICONS.map(e => (
                <button key={e} onClick={() => setIcon(e)}
                  className="h-9 rounded-xl flex items-center justify-center text-lg transition-all"
                  style={{ background: icon === e ? `${accentColor}25` : 'var(--t-page-bg)', border: icon === e ? `1.5px solid ${accentColor}50` : '1px solid transparent' }}>
                  {e}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-3 pb-6">
            <button onClick={handleClose} className="flex-1 h-12 rounded-2xl text-[13px] font-semibold border border-border"
              style={{ background: 'var(--t-page-bg)', color: 'var(--t-muted)' }}>Cancel</button>
            <button onClick={handleSave} className="flex-[2] h-12 rounded-2xl text-[13px] font-bold"
              style={{ background: `linear-gradient(135deg,${accentColor} 0%,${accentColor}CC 100%)`, color: '#fff' }}>
              Add Category
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   Manage Categories Sheet
───────────────────────────────────────────── */
interface ManageCategoriesSheetProps {
  visible: boolean
  catType: 'income' | 'expense'
  accentColor: string
  onClose: () => void
}

function ManageCategoriesSheet({ visible, catType, accentColor, onClose }: ManageCategoriesSheetProps) {
  const { categories, toggleCategory, deleteCategory } = useSettingsStore()
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  const typeCats = categories.filter(c => c.type === catType)

  if (!visible) return null
  return (
    <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full md:max-w-[480px] rounded-t-[24px] md:rounded-2xl flex flex-col overflow-hidden"
        style={{ background: 'var(--t-card-bg)', border: '1px solid var(--t-card-border)', maxHeight: '75vh' }}>
        <div className="flex-shrink-0 pt-3 px-5 pb-4">
          <div className="w-10 h-1 rounded-full mx-auto mb-4" style={{ background: 'var(--t-card-border)', opacity: 0.3 }} />
          <div className="flex items-center justify-between">
            <p className="text-[15px] font-bold text-navy">Manage Categories</p>
            <button onClick={onClose}><X size={18} style={{ color: 'var(--t-muted)' }} /></button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-none px-4 pb-6">
          {typeCats.map(c => (
            <div key={c.id} className="flex items-center gap-3 py-3 border-b" style={{ borderColor: 'var(--t-card-border)' }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0"
                style={{ background: c.is_enabled ? `${accentColor}18` : 'var(--t-page-bg)' }}>
                {c.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold truncate" style={{ color: c.is_enabled ? 'var(--t-text)' : 'var(--t-muted)' }}>{c.name_en}</p>
                <p className="font-urdu text-[11px] mt-0.5 text-muted opacity-60">{c.name_ur}</p>
              </div>
              <button onClick={() => toggleCategory(c.id)}
                className="h-7 px-2.5 rounded-xl text-[10px] font-bold transition-all flex-shrink-0"
                style={c.is_enabled
                  ? { background: `${accentColor}18`, color: accentColor, border: `1px solid ${accentColor}30` }
                  : { background: 'var(--t-page-bg)', color: 'var(--t-muted)', border: '1px solid var(--t-card-border)' }}>
                {c.is_enabled ? 'Visible' : 'Hidden'}
              </button>
              {confirmDelete === c.id ? (
                <div className="flex gap-1.5 flex-shrink-0">
                  <button onClick={() => setConfirmDelete(null)}
                    className="h-7 w-7 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.07)' }}>
                    <X size={12} style={{ color: 'rgba(255,255,255,0.40)' }} />
                  </button>
                  <button onClick={() => { deleteCategory(c.id); setConfirmDelete(null) }}
                    className="h-7 px-2 rounded-xl text-[10px] font-bold" style={{ background: 'rgba(255,80,80,0.18)', color: '#FF5C5C' }}>
                    Delete
                  </button>
                </div>
              ) : (
                <button onClick={() => setConfirmDelete(c.id)} className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(255,80,80,0.08)' }}>
                  <Trash2 size={13} style={{ color: 'rgba(255,80,80,0.55)' }} />
                </button>
              )}
            </div>
          ))}
          {typeCats.length === 0 && (
            <p className="text-center py-10 text-[12px]" style={{ color: 'rgba(255,255,255,0.25)' }}>No categories yet</p>
          )}
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   Add Wallet Sheet
───────────────────────────────────────────── */
interface AddWalletSheetProps {
  visible: boolean
  accentColor: string
  currentCount: number
  onClose: () => void
  onAdded: (id: string) => void
}

function AddWalletSheet({ visible, accentColor, currentCount, onClose, onAdded }: AddWalletSheetProps) {
  const { addWallet } = useSettingsStore()
  const [name, setName]         = useState('')
  const [wType, setWType]       = useState<WalletType>('custom')
  const [icon, setIcon]         = useState('💳')
  const [nameErr, setNameErr]   = useState('')

  const reset = () => { setName(''); setWType('custom'); setIcon('💳'); setNameErr('') }
  const handleClose = () => { reset(); onClose() }

  const handleSave = () => {
    if (!name.trim()) { setNameErr('Wallet name required'); return }
    const wt = WALLET_TYPES.find(t => t.id === wType)!
    const id = addWallet({
      name: name.trim(),
      icon,
      color: wt.color,
      type: wType,
      is_enabled: true,
      is_default: false,
      sort_order: currentCount,
    })
    onAdded(id)
    showToast({ type: 'success', message: `${name} wallet added!`, messageUr: 'بٹوہ شامل ہوگیا' })
    reset(); onClose()
  }

  if (!visible) return null
  return (
    <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative w-full md:max-w-[480px] rounded-t-[24px] md:rounded-2xl overflow-hidden"
        style={{ background: 'var(--t-card-bg)', border: '1px solid var(--t-card-border)' }}>
        <div className="pt-3 px-5 pb-2">
          <div className="w-10 h-1 rounded-full mx-auto mb-4" style={{ background: 'var(--t-card-border)', opacity: 0.3 }} />
          <div className="flex items-center justify-between mb-4">
            <p className="text-[15px] font-bold text-navy">New Wallet · نیا بٹوہ</p>
            <button onClick={handleClose}><X size={18} style={{ color: 'var(--t-muted)' }} /></button>
          </div>
          <div className="mb-4">
            <label className="text-[10px] font-bold uppercase tracking-wider mb-2 block text-muted">Wallet Name</label>
            <input value={name} onChange={e => { setName(e.target.value); setNameErr('') }}
              placeholder="e.g. Savings Account, PayPal..." autoFocus
              className="w-full h-12 bg-surface border rounded-2xl px-4 text-[14px] text-navy placeholder:text-muted/40 focus:outline-none transition-all"
              style={{ borderColor: nameErr ? 'rgba(255,92,92,0.50)' : 'var(--t-card-border)' }} />
            {nameErr && <p className="text-[11px] mt-1" style={{ color: '#FF5C5C' }}>{nameErr}</p>}
          </div>
          <div className="mb-4">
            <label className="text-[10px] font-bold uppercase tracking-wider mb-2 block text-muted">Type</label>
            <div className="grid grid-cols-5 gap-2">
              {WALLET_TYPES.map(wt => (
                <button key={wt.id} onClick={() => { setWType(wt.id); setIcon(wt.icon) }}
                  className="flex flex-col items-center gap-1 py-2.5 rounded-2xl transition-all"
                  style={{ background: wType === wt.id ? `${wt.color}20` : 'var(--t-page-bg)', border: wType === wt.id ? `1.5px solid ${wt.color}50` : '1px solid var(--t-card-border)' }}>
                  <span className="text-xl">{wt.icon}</span>
                  <span className="text-[9px] font-semibold" style={{ color: wType === wt.id ? wt.color : 'var(--t-muted)' }}>{wt.label}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="mb-5">
            <label className="text-[10px] font-bold uppercase tracking-wider mb-2 block text-muted">Icon</label>
            <div className="grid grid-cols-8 gap-1.5">
              {WALLET_ICONS.map(e => (
                <button key={e} onClick={() => setIcon(e)}
                  className="h-9 rounded-xl flex items-center justify-center text-lg transition-all"
                  style={{ background: icon === e ? `${accentColor}25` : 'var(--t-page-bg)', border: icon === e ? `1.5px solid ${accentColor}50` : '1px solid transparent' }}>
                  {e}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-3 pb-6">
            <button onClick={handleClose} className="flex-1 h-12 rounded-2xl text-[13px] font-semibold border border-border"
              style={{ background: 'var(--t-page-bg)', color: 'var(--t-muted)' }}>Cancel</button>
            <button onClick={handleSave} className="flex-[2] h-12 rounded-2xl text-[13px] font-bold"
              style={{ background: `linear-gradient(135deg,${accentColor} 0%,${accentColor}CC 100%)`, color: '#fff' }}>
              Add Wallet
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   Customize Form Sheet
───────────────────────────────────────────── */
interface CustomizeFormSheetProps {
  visible: boolean
  prefs: FormPrefs
  accentColor: string
  onClose: () => void
  onChange: (prefs: FormPrefs) => void
}

function CustomizeFormSheet({ visible, prefs, accentColor, onClose, onChange }: CustomizeFormSheetProps) {
  const togglePref = (key: keyof FormPrefs) => onChange({ ...prefs, [key]: !prefs[key] })

  const fields: { key: keyof FormPrefs; label: string; labelUr: string }[] = [
    { key: 'showCustomer', label: 'Customer / Person', labelUr: 'گاہک / شخص' },
    { key: 'showCategory', label: 'Category',          labelUr: 'قسم' },
    { key: 'showWallet',   label: 'Wallet',             labelUr: 'بٹوہ' },
    { key: 'showProof',    label: 'Proof / Receipt',    labelUr: 'رسید' },
    { key: 'showNotes',    label: 'Notes & Date',       labelUr: 'نوٹ اور تاریخ' },
  ]

  if (!visible) return null
  return (
    <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full md:max-w-[480px] rounded-t-[24px] md:rounded-2xl overflow-hidden"
        style={{ background: 'var(--t-card-bg)', border: '1px solid var(--t-card-border)' }}>
        <div className="pt-3 px-5 pb-6">
          <div className="w-10 h-1 rounded-full mx-auto mb-4" style={{ background: 'var(--t-card-border)', opacity: 0.3 }} />
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-[15px] font-black text-navy">Customize Form</p>
              <p className="text-[11px] mt-0.5 text-muted">Show or hide form sections</p>
            </div>
            <button onClick={onClose}><X size={18} style={{ color: 'var(--t-muted)' }} /></button>
          </div>
          <div className="space-y-2">
            {fields.map(f => (
              <div key={f.key}
                className="flex items-center justify-between px-4 py-3.5 rounded-2xl"
                style={{ background: 'var(--t-page-bg)', border: '1px solid var(--t-card-border)' }}>
                <div>
                  <p className="text-[13px] font-semibold text-navy">{f.label}</p>
                  <p className="font-urdu text-[11px] mt-0.5 text-muted opacity-60">{f.labelUr}</p>
                </div>
                <button onClick={() => togglePref(f.key)}
                  className="w-12 h-6.5 rounded-full relative transition-all flex-shrink-0"
                  style={{ background: prefs[f.key] ? accentColor : 'var(--t-card-border)', padding: '2px' }}>
                  <div className="w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200"
                    style={{ transform: prefs[f.key] ? 'translateX(22px)' : 'translateX(0px)' }} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   Photo Upload Field
───────────────────────────────────────────── */
interface PhotoFieldProps {
  image: string | null
  onCamera: () => void
  onGallery: () => void
  onRemove: () => void
}

function PhotoField({ image, onCamera, onGallery, onRemove }: PhotoFieldProps) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider mb-2.5 px-0.5"
        style={{ color: 'var(--t-muted)' }}>
        <Camera size={10} /> Proof / Receipt · رسید
        <span className="text-[9px] normal-case" style={{ color: 'var(--t-muted)' }}>(optional)</span>
      </label>
      {!image ? (
        <div className="flex gap-2">
          <button onClick={onCamera}
            className="flex-1 flex flex-col items-center justify-center gap-1.5 h-16 rounded-2xl transition-all active:opacity-70"
            style={{ background: 'var(--t-page-bg)', border: '1px dashed var(--t-card-border)' }}>
            <Camera size={18} style={{ color: 'var(--t-muted)' }} />
            <span className="text-[10px] font-semibold" style={{ color: 'var(--t-muted)' }}>Camera</span>
          </button>
          <button onClick={onGallery}
            className="flex-1 flex flex-col items-center justify-center gap-1.5 h-16 rounded-2xl transition-all active:opacity-70"
            style={{ background: 'var(--t-page-bg)', border: '1px dashed var(--t-card-border)' }}>
            <ImageIcon size={18} style={{ color: 'var(--t-muted)' }} />
            <span className="text-[10px] font-semibold" style={{ color: 'var(--t-muted)' }}>Gallery</span>
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-3 px-3 py-3 rounded-2xl"
          style={{ background: 'var(--t-page-bg)', border: '1px solid var(--t-card-border)' }}>
          <div className="relative flex-shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={image} alt="receipt" className="w-14 h-14 rounded-xl object-cover" />
            <button onClick={onRemove}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center"
              style={{ background: '#FF5C5C' }}>
              <X size={9} className="text-white" />
            </button>
          </div>
          <div className="flex-1">
            <p className="text-[12px] font-semibold" style={{ color: 'var(--t-text)' }}>Receipt attached ✓</p>
            <p className="font-urdu text-[11px] mt-0.5" style={{ color: 'var(--t-muted)' }}>رسید منسلک ہے</p>
            <div className="flex gap-2 mt-2">
              <button onClick={onCamera} className="text-[10px] font-semibold" style={{ color: 'var(--t-muted)' }}>Camera</button>
              <span style={{ color: 'var(--t-muted)' }}>·</span>
              <button onClick={onGallery} className="text-[10px] font-semibold" style={{ color: 'var(--t-muted)' }}>Gallery</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ─────────────────────────────────────────────
   Category Section
───────────────────────────────────────────── */
interface CategorySectionProps {
  cats: Category[]
  activeId: string
  accentColor: string
  colorBg: string
  colorBorder: string
  onSelect: (id: string) => void
  onAdd: () => void
  onManage: () => void
}

function CategorySection({ cats, activeId, accentColor, colorBg, colorBorder, onSelect, onAdd, onManage }: CategorySectionProps) {
  const [expanded, setExpanded] = useState(false)
  const visible  = expanded ? cats : cats.slice(0, VISIBLE_CATS)
  const hasMore  = cats.length > VISIBLE_CATS
  const moreCount = cats.length - VISIBLE_CATS

  return (
    <div>
      <div className="flex items-center justify-between mb-2.5 px-0.5">
        <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider"
          style={{ color: 'var(--t-muted)' }}>
          <Tag size={10} /> Category · قسم
        </label>
        <button onClick={onManage} className="flex items-center gap-1 text-[10px] font-bold"
          style={{ color: 'var(--t-muted)' }}>
          <Settings2 size={10} /> Manage
        </button>
      </div>
      <div className="flex gap-2 overflow-x-auto scrollbar-none -mx-0.5 px-0.5 pb-0.5">
        {visible.map(c => {
          const act = activeId === c.id
          return (
            <button key={c.id} onClick={() => onSelect(c.id)}
              className="flex-shrink-0 flex items-center gap-1.5 h-9 px-3.5 rounded-2xl text-[12px] font-semibold whitespace-nowrap transition-all"
              style={{
                background: act ? colorBg : 'var(--t-page-bg)',
                border: `1px solid ${act ? colorBorder : 'var(--t-card-border)'}`,
                color: act ? accentColor : 'var(--t-muted)',
              }}>
              {c.icon && <span className="text-sm leading-none">{c.icon}</span>}
              {c.name_en}
            </button>
          )
        })}
        {hasMore && (
          <button onClick={() => setExpanded(e => !e)}
            className="flex-shrink-0 flex items-center gap-1 h-9 px-3 rounded-2xl text-[11px] font-bold whitespace-nowrap"
            style={{ background: 'var(--t-page-bg)', border: '1px solid var(--t-card-border)', color: 'var(--t-muted)' }}>
            {expanded ? <ChevronUp size={11} /> : <MoreHorizontal size={11} />}
            {expanded ? 'Less' : `+${moreCount} More`}
          </button>
        )}
        <button onClick={onAdd}
          className="flex-shrink-0 flex items-center gap-1 h-9 px-3 rounded-2xl text-[11px] font-bold whitespace-nowrap"
          style={{ background: `${accentColor}0E`, border: `1px dashed ${accentColor}35`, color: `${accentColor}90` }}>
          <Plus size={11} style={{ color: `${accentColor}90` }} /> Add
        </button>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   Wallet Section
───────────────────────────────────────────── */
interface WalletSectionProps {
  label: string
  wallets: Wallet[]
  activeId: string
  accentColor: string
  colorBg: string
  colorBorder: string
  excludeId?: string
  error?: string
  totalWallets: number
  onSelect: (id: string) => void
  getBalance: (id: string) => string
  onAdd: () => void
}

function WalletSection({ label, wallets, activeId, accentColor, colorBg, colorBorder, excludeId, error, totalWallets, onSelect, getBalance, onAdd }: WalletSectionProps) {
  const filtered = excludeId ? wallets.filter(w => w.id !== excludeId) : wallets
  return (
    <div>
      <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider mb-2.5 px-0.5"
        style={{ color: 'var(--t-muted)' }}>
        <WalletIcon size={10} /> {label}
      </label>
      <div className="flex gap-2 overflow-x-auto scrollbar-none -mx-0.5 px-0.5 pb-0.5">
        {filtered.map(w => {
          const active = activeId === w.id
          return (
            <button key={w.id} onClick={() => onSelect(w.id)}
              className="flex-shrink-0 flex items-center gap-2 h-10 px-3.5 rounded-2xl transition-all"
              style={{
                background: active ? colorBg : 'var(--t-page-bg)',
                border: `1.5px solid ${active ? colorBorder : 'var(--t-card-border)'}`,
              }}>
              <span className="text-base leading-none">{w.icon}</span>
              <div className="text-left">
                <p className="text-[12px] font-bold leading-tight" style={{ color: active ? accentColor : 'var(--t-text)' }}>{w.name}</p>
                <p className="text-[10px]" style={{ color: 'var(--t-muted)' }}>{getBalance(w.id)}</p>
              </div>
              {active && <div className="w-1.5 h-1.5 rounded-full ml-0.5" style={{ backgroundColor: accentColor }} />}
            </button>
          )
        })}
        <button onClick={onAdd}
          className="flex-shrink-0 flex items-center gap-1.5 h-10 px-3.5 rounded-2xl whitespace-nowrap"
          style={{ background: 'var(--t-page-bg)', border: '1px dashed var(--t-card-border)' }}>
          <Plus size={12} style={{ color: 'var(--t-muted)' }} />
          <span className="text-[11px] font-semibold" style={{ color: 'var(--t-muted)' }}>Add Wallet</span>
        </button>
      </div>
      {error && <p className="text-[11px] mt-1 pl-0.5" style={{ color: '#FF5C5C' }}>{error}</p>}
    </div>
  )
}

/* ─────────────────────────────────────────────
   Main Component
───────────────────────────────────────────── */
function AddTransactionInner() {
  const router   = useRouter()
  const sp       = useSearchParams()
  const initType = (sp.get('type') as TxnFormType) || null

  const [selected, setSelected]   = useState<TxnFormType | null>(initType)
  const [step, setStep]           = useState<1|2>(initType ? 2 : 1)
  const [type, setType]           = useState<TxnFormType>(initType || 'income')
  const [amount, setAmount]       = useState('')
  const [walletId, setWalletId]   = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [noteEn, setNoteEn]       = useState('')
  const [date, setDate]           = useState(todayISO())
  const [proofImage, setProofImage] = useState<string | null>(null)
  const [customerId, setCustomerId]     = useState<string | null>(null)
  const [customerName, setCustomerName] = useState('Walk-in Customer')
  const [showPicker, setShowPicker]     = useState(false)
  const [toWalletId, setToWalletId]     = useState('')
  const [loanDir, setLoanDir]           = useState<'given' | 'received'>('given')
  const [personPhone, setPersonPhone]   = useState('')
  const [returnDate, setReturnDate]     = useState('')
  const [showDetails, setShowDetails]   = useState(false)
  const [errors, setErrors]             = useState<Record<string, string>>({})
  const [success, setSuccess]           = useState(false)

  // Sheets
  const [showAddCat, setShowAddCat]           = useState(false)
  const [showManageCats, setShowManageCats]   = useState(false)
  const [showAddWallet, setShowAddWallet]     = useState(false)
  const [showCustomizeForm, setShowCustomizeForm] = useState(false)
  const [incomeSubType, setIncomeSubType]   = useState<'sale' | 'advance'>('sale')
  const [useAdvanceMode, setUseAdvanceMode] = useState(false)
  const [advApplied, setAdvApplied]         = useState(0)

  // Keypad
  const [keypadOpen, setKeypadOpen] = useState(false)

  // Form preferences (persisted to localStorage)
  const [formPrefs, setFormPrefs] = useState<FormPrefs>(() => {
    if (typeof window === 'undefined') return DEFAULT_FORM_PREFS
    try {
      const saved = localStorage.getItem(FORM_PREFS_KEY)
      return saved ? { ...DEFAULT_FORM_PREFS, ...JSON.parse(saved) } : DEFAULT_FORM_PREFS
    } catch { return DEFAULT_FORM_PREFS }
  })

  useEffect(() => {
    try { localStorage.setItem(FORM_PREFS_KEY, JSON.stringify(formPrefs)) } catch { /* noop */ }
  }, [formPrefs])

  // Refs
  const cameraInputRef  = useRef<HTMLInputElement>(null)
  const galleryInputRef = useRef<HTMLInputElement>(null)
  const keypadPanelRef  = useRef<HTMLDivElement>(null)
  const scrollAreaRef   = useRef<HTMLDivElement>(null)
  const inactivityRef   = useRef<ReturnType<typeof setTimeout> | null>(null)

  const {
    categories, getEnabledWallets, wallets: allWallets,
  } = useSettingsStore()
  const addTransaction   = useTransactionStore(s => s.addTransaction)
  const getWalletBalance = useTransactionStore(s => s.getWalletBalance)
  const { addEntry }     = useLoanStore()
  const { addAdvance, applyAdvance, getCustomerBalance: getAdvanceBalance } = useAdvanceStore()
  const { activeBusinessId } = useBusinessStore()
  const bid = activeBusinessId ?? undefined

  const enabledWallets = getEnabledWallets(bid)
  const cfg            = TYPES.find(t => t.id === type)!

  // Autofill last-used wallet
  useEffect(() => {
    if (!walletId && enabledWallets.length > 0) {
      try {
        const last = localStorage.getItem('rozcash-last-wallet')
        const found = last ? enabledWallets.find(w => w.id === last) : null
        setWalletId(found?.id || enabledWallets[0].id)
      } catch {
        setWalletId(enabledWallets[0].id)
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step])

  // ── Voice prefill bridge (runs once on mount) ─────────────────────────────
  // Reads from the voice-prefill store via getState() — NOT from the reactive
  // hook — so the closure always sees the live store value even in React 18
  // StrictMode where effects are double-invoked (first run clears the store,
  // second run would find null via a closure but finds null via getState too,
  // which is correct — we only want to apply prefill once). NEVER auto-submits.
  useEffect(() => {
    const { pending: v, clear } = useVoicePrefillStore.getState()
    if (!v) return
    clear()

    const formType: TxnFormType =
      v.type === 'income'  ? 'income'  :
      v.type === 'expense' ? 'expense' :
      v.type === 'loan'    ? 'loan'    : 'income'

    setSelected(formType)
    setType(formType)
    setStep(2)
    if (v.amount !== undefined) setAmount(String(v.amount))
    if (v.note)     setNoteEn(v.note)
    if (v.customer) setCustomerName(v.customer)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const activeWallet  = walletId || enabledWallets[0]?.id || 'cash'
  const amt           = parseFloat(amount.replace(/,/g, '') || '0')
  const filteredCats  = categories.filter(c =>
    c.is_enabled &&
    (!bid || !c.business_id || c.business_id === bid) &&
    (type === 'income' ? c.type === 'income' : type === 'expense' ? c.type === 'expense' : true)
  )
  const currentBal    = getWalletBalance(activeWallet, bid)
  const afterBal      = type === 'income' ? currentBal + amt : currentBal - amt
  const walletBal          = (id: string) => formatAmount(Math.abs(getWalletBalance(id, bid)))
  const customerAdvanceBal = type === 'income' && customerId ? getAdvanceBalance(customerId) : 0

  // Deselect category if it gets deleted
  useEffect(() => {
    if (categoryId && !filteredCats.find(c => c.id === categoryId)) {
      setCategoryId('')
    }
  }, [filteredCats, categoryId])

  /* ── Keypad helpers ── */
  const closeKeypad = useCallback(() => {
    setKeypadOpen(false)
    if (inactivityRef.current) { clearTimeout(inactivityRef.current); inactivityRef.current = null }
  }, [])

  const resetInactivity = useCallback(() => {
    if (inactivityRef.current) clearTimeout(inactivityRef.current)
    inactivityRef.current = setTimeout(() => setKeypadOpen(false), 2500)
  }, [])

  const openKeypad = useCallback(() => {
    setKeypadOpen(true)
    if (inactivityRef.current) clearTimeout(inactivityRef.current)
    inactivityRef.current = setTimeout(() => setKeypadOpen(false), 2500)
    requestAnimationFrame(() => {
      scrollAreaRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
    })
  }, [])

  // Close keypad on tap outside
  useEffect(() => {
    if (!keypadOpen) return
    const handler = (e: TouchEvent | MouseEvent) => {
      if (keypadPanelRef.current && !keypadPanelRef.current.contains(e.target as Node)) {
        closeKeypad()
      }
    }
    document.addEventListener('touchstart', handler, { passive: true })
    document.addEventListener('mousedown', handler)
    return () => {
      document.removeEventListener('touchstart', handler)
      document.removeEventListener('mousedown', handler)
    }
  }, [keypadOpen, closeKeypad])

  // Cleanup timer on unmount
  useEffect(() => {
    return () => { if (inactivityRef.current) clearTimeout(inactivityRef.current) }
  }, [])

  /* ── File handlers ── */
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => setProofImage(ev.target?.result as string)
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const handleNumpad = useCallback((k: string) => {
    resetInactivity()
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try { navigator.vibrate(6) } catch { /* noop */ }
    }
    if (k === '⌫') {
      setAmount(p => { const r = p.replace(/,/g, ''); return r.length <= 1 ? '' : fmt(r.slice(0, -1)) })
    } else {
      setAmount(p => { const r = (p.replace(/,/g, '') + k).slice(0, 9); return fmt(r) })
    }
    setErrors(e => ({ ...e, amount: '' }))
  }, [resetInactivity])

  const goToStep2 = (t: TxnFormType) => {
    setType(t); setSelected(t); setStep(2)
    setIncomeSubType('sale'); setUseAdvanceMode(false); setAdvApplied(0)
  }

  const validate = () => {
    const e: Record<string, string> = {}
    if (!amt || amt <= 0) e.amount = 'Enter amount · رقم درج کریں'
    if (type === 'loan' && !customerId) e.customer = 'Select a person · شخص منتخب کریں'
    if (type === 'transfer' && !toWalletId) e.toWallet = 'Select destination wallet'
    if (type === 'transfer' && toWalletId === activeWallet) e.toWallet = 'Choose a different wallet'
    if (type === 'income' && incomeSubType === 'advance' && !customerId)
      e.customer = 'Select customer for advance · پیشگی کیلئے گاہک ضروری ہے'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSave = () => {
    if (!validate()) {
      if (!amt) openKeypad()
      return
    }
    const time    = format(new Date(), 'HH:mm')
    const txnType: TransactionType =
      type === 'loan'   ? (loanDir === 'given' ? 'loan_given' : 'loan_received') :
      type === 'income' && incomeSubType === 'advance' ? 'advance_received' :
      type as TransactionType

    const txnId = addTransaction({
      type: txnType,
      category_id: categoryId || filteredCats[0]?.id || 'other',
      amount: amt,
      wallet_id: activeWallet,
      customer_id: customerId || undefined,
      from_wallet_id: type === 'transfer' ? activeWallet : undefined,
      to_wallet_id:   type === 'transfer' ? toWalletId   : undefined,
      note_en: noteEn || (type === 'loan' ? `Loan - ${customerName}` : undefined),
      note_ur: noteEn ? autoTranslate(noteEn) : undefined,
      photo_url: proofImage || undefined,
      date, time,
      is_reversed: false,
      created_by: 'owner',
    })

    if (type === 'loan') {
      addEntry({
        customer_id: customerId || txnId,
        transaction_id: txnId,
        amount: amt,
        direction: loanDir,
        wallet_id: activeWallet,
        date,
        is_settled: false,
        note_en: customerName,
      })
    }

    if (type === 'income' && incomeSubType === 'advance' && customerId) {
      addAdvance({
        customer_id: customerId,
        transaction_id: txnId,
        amount: amt,
        wallet_id: activeWallet,
        date,
        note: noteEn || undefined,
      })
    }

    if (type === 'income' && incomeSubType === 'sale' && useAdvanceMode && customerId && customerAdvanceBal > 0) {
      const applied = Math.min(customerAdvanceBal, amt)
      setAdvApplied(applied)
      applyAdvance(customerId, applied)
      addTransaction({
        type: 'advance_offset',
        category_id: categoryId || '',
        amount: applied,
        wallet_id: activeWallet,
        customer_id: customerId,
        note_en: `Advance applied · ${customerName}`,
        date, time,
        is_reversed: false,
        created_by: 'owner',
      })
    }

    try { localStorage.setItem('rozcash-last-wallet', activeWallet) } catch { /* noop */ }
    showToast({ type: 'success', message: 'Saved!', messageUr: 'محفوظ ہوگیا' })
    closeKeypad()
    setSuccess(true)
  }

  const resetForm = () => {
    setStep(1); setSelected(null); setAmount(''); setNoteEn('')
    setCustomerName('Walk-in Customer'); setCustomerId(null)
    setPersonPhone(''); setReturnDate(''); setProofImage(null)
    setCategoryId(''); setWalletId(''); setToWalletId('')
    setDate(todayISO()); setErrors({}); setShowDetails(false)
    setSuccess(false); closeKeypad()
    setIncomeSubType('sale'); setUseAdvanceMode(false); setAdvApplied(0)
  }

  /* ══════════════════════════════
     SUCCESS SCREEN
  ══════════════════════════════ */
  if (success) return (
    <div className="h-[100dvh] flex flex-col items-center justify-center px-6 text-center relative overflow-hidden"
      style={{ background: cfg.heroGrad }}>
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-80 h-80 rounded-full blur-[120px]" style={{ backgroundColor: cfg.color, opacity: 0.08 }} />
      </div>
      <div className="relative z-10 animate-scale-in mb-6">
        <div className="w-[80px] h-[80px] rounded-[26px] flex items-center justify-center mx-auto"
          style={{ background: `${cfg.color}1C`, border: `1.5px solid ${cfg.color}40` }}>
          <Check size={36} strokeWidth={2.5} style={{ color: cfg.color }} />
        </div>
      </div>
      <div className="relative z-10">
        <p className="text-[13px] font-semibold mb-1.5" style={{ color: 'var(--t-text)' }}>
          {type === 'income' && incomeSubType === 'advance'
            ? <>Advance Payment · <span className="font-urdu">پیشگی رقم</span></>
            : <>{cfg.label} · <span className="font-urdu">{cfg.labelUr}</span></>}
        </p>
        <p className="text-[38px] font-black text-white leading-none tracking-tight mb-1">Rs. {amount || '0'}</p>
        {type === 'income' && incomeSubType === 'advance' && (
          <div className="mt-2 mb-2 inline-flex items-center gap-2 px-3 py-1.5 rounded-xl"
            style={{ background: 'rgba(59,130,246,0.20)', border: '1px solid rgba(59,130,246,0.35)' }}>
            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#60a5fa' }} />
            <span className="text-[11px] font-bold" style={{ color: '#60a5fa' }}>Advance Saved · پیشگی محفوظ</span>
          </div>
        )}
        {type === 'income' && incomeSubType === 'sale' && advApplied > 0 && (
          <div className="mt-2 mb-2 inline-flex items-center gap-2 px-3 py-1.5 rounded-xl"
            style={{ background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.28)' }}>
            <span className="text-[11px] font-semibold" style={{ color: '#60a5fa' }}>
              ⚡ Advance Applied: Rs. {formatAmount(advApplied)}
            </span>
          </div>
        )}
        {customerName !== 'Walk-in Customer' && (
          <p className="text-[13px] font-semibold mb-1" style={{ color: `${cfg.color}CC` }}>{customerName}</p>
        )}
        <p className="text-[12px] mb-6 font-urdu" style={{ color: 'var(--t-muted)' }}>
          محفوظ ہوگیا · {format(new Date(), 'dd/MM/yyyy')}
        </p>
        {proofImage && (
          <div className="mb-5 flex justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={proofImage} alt="receipt" className="w-20 h-20 rounded-2xl object-cover border-2 border-white/10" />
          </div>
        )}
        {type !== 'transfer' && type !== 'loan' && (
          <div className="mb-7 inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl"
            style={{ background: 'var(--t-page-bg)', border: '1px solid var(--t-card-border)' }}>
            <span className="text-[11px]" style={{ color: 'var(--t-muted)' }}>
              {enabledWallets.find(w => w.id === activeWallet)?.name} →
            </span>
            <span className="text-[13px] font-bold" style={{ color: afterBal >= 0 ? '#4CAF50' : '#FF5C5C' }}>
              Rs. {formatAmount(Math.abs(afterBal))}
            </span>
          </div>
        )}
        <div className="flex gap-3 w-full">
          <button onClick={resetForm}
            className="flex-1 h-12 rounded-2xl text-[13px] font-bold flex items-center justify-center gap-2"
            style={{ background: 'var(--t-page-bg)', border: '1px solid var(--t-card-border)', color: 'var(--t-muted)' }}>
            <RefreshCw size={14} strokeWidth={2} /> Add Another
          </button>
          <button onClick={() => router.replace('/')}
            className="flex-1 h-12 rounded-2xl text-[13px] font-bold text-white flex items-center justify-center gap-2"
            style={{ background: `linear-gradient(135deg,${cfg.color} 0%,${cfg.color}CC 100%)`, boxShadow: `0 6px 20px ${cfg.color}35` }}>
            <Check size={15} strokeWidth={2.5} /> Done
          </button>
        </div>
      </div>
    </div>
  )

  /* ══════════════════════════════
     STEP 1 — SELECT TYPE
  ══════════════════════════════ */
  if (step === 1) {
    const selCfg = selected ? TYPES.find(t => t.id === selected) : null
    return (
      <div className="min-h-[100dvh] flex flex-col" style={{ background: 'var(--t-page-bg)' }}>

        {/* ── HEADER ── */}
        <div
          className="flex items-center justify-between px-4 flex-shrink-0"
          style={{
            paddingTop: 'max(48px, env(safe-area-inset-top, 12px))',
            paddingBottom: '12px',
            borderBottom: '1px solid var(--t-card-border)',
            background: 'var(--t-card-bg)',
          }}>
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-2xl flex items-center justify-center transition-all active:scale-90"
            style={{ background: 'var(--t-page-bg)', border: '1px solid var(--t-card-border)' }}>
            <ChevronLeft size={19} style={{ color: 'var(--t-muted)' }} strokeWidth={2.2} />
          </button>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full"
            style={{ background: 'var(--t-page-bg)', border: '1px solid var(--t-card-border)' }}>
            <div className="w-1.5 h-1.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: '#00E87A', boxShadow: '0 0 5px rgba(0,232,122,0.6)' }} />
            <span className="text-[10px] font-bold tracking-[0.12em] uppercase"
              style={{ color: 'var(--t-muted)' }}>Step 1 / 2</span>
          </div>

          <div className="w-10" />
        </div>

        {/* ── TITLE ── */}
        <div className="flex items-end justify-between px-5 pt-5 pb-4 flex-shrink-0">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.16em] mb-1.5"
              style={{ color: 'var(--t-muted)', opacity: 0.55 }}>
              New Transaction
            </p>
            <h1 className="text-[24px] font-black leading-none"
              style={{ color: 'var(--t-text)', letterSpacing: '-0.02em' }}>
              Select Type
            </h1>
          </div>
          <p className="font-urdu text-[15px] leading-none pb-0.5"
            style={{ color: 'var(--t-muted)' }} dir="rtl">
            فیصلہ کریں
          </p>
        </div>

        {/* ── 2×2 CARD GRID ── */}
        <div className="flex-1 px-4 pb-3">
          <div className="grid grid-cols-2 gap-3">
            {TYPES.map((t, i) => {
              const Icon  = t.Icon
              const isSel = selected === t.id
              return (
                <button
                  key={t.id}
                  onClick={() => setSelected(isSel ? null : t.id)}
                  className="relative flex flex-col text-left rounded-2xl overflow-hidden transition-all duration-200 active:scale-[0.96]"
                  style={{
                    background: isSel ? t.colorBg : 'var(--t-card-bg)',
                    border: `1px solid ${isSel ? t.colorBorder : 'var(--t-card-border)'}`,
                    boxShadow: isSel
                      ? `0 4px 20px ${t.color}18, 0 1px 4px ${t.color}10`
                      : '0 1px 3px rgba(0,0,0,0.04), 0 4px 8px rgba(0,0,0,0.04)',
                    opacity: selected && !isSel ? 0.42 : 1,
                    transform: isSel ? 'translateY(-2px)' : 'translateY(0)',
                    animation: `cardSlideIn 0.40s cubic-bezier(0.16,1,0.3,1) ${i * 60}ms both`,
                    minHeight: '162px',
                  }}>

                  {/* Left 3px color bar */}
                  <div className="absolute left-0 top-0 bottom-0 w-[3px] transition-opacity duration-200"
                    style={{ backgroundColor: t.color, opacity: isSel ? 1 : 0.30 }} />

                  {/* Content */}
                  <div className="flex flex-col flex-1 pl-5 pr-4 pt-4 pb-4">

                    {/* Row 1: labels + icon */}
                    <div className="flex items-start justify-between gap-2 flex-1">
                      <div className="flex-1 min-w-0">
                        <p className="text-[17px] font-black leading-none"
                          style={{ color: 'var(--t-text)', letterSpacing: '-0.015em' }}>
                          {t.label}
                        </p>
                        <p className="font-urdu text-[12px] mt-2 leading-none"
                          style={{ color: t.color, opacity: 0.88 }}>
                          {t.labelUr}
                        </p>
                      </div>
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{
                          background: t.colorBg,
                          border: `1px solid ${t.colorBorder}`,
                        }}>
                        <Icon size={18} style={{ color: t.color }} />
                      </div>
                    </div>

                    {/* Row 2: desc + arrow */}
                    <div className="flex items-end justify-between mt-3">
                      <p className="text-[10px] font-medium leading-snug"
                        style={{ color: 'var(--t-muted)' }}>
                        {t.desc}
                      </p>
                      <span className="text-[13px] font-bold transition-transform duration-150"
                        style={{ color: t.color, opacity: isSel ? 1 : 0.35 }}>
                        →
                      </span>
                    </div>
                  </div>

                  {/* Selected check */}
                  {isSel && (
                    <div
                      className="absolute top-3.5 left-[18px] w-[18px] h-[18px] rounded-full flex items-center justify-center"
                      style={{ background: t.color }}>
                      <Check size={9} className="text-white" strokeWidth={3.5} />
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* ── QUICK ACCESS ── */}
        <div className="flex-shrink-0 px-4 pb-3">
          <p className="text-[9px] font-bold uppercase tracking-[0.16em] mb-2"
            style={{ color: 'var(--t-muted)', opacity: 0.50 }}>
            Quick Access
          </p>
          <div className="flex gap-2.5">
            <Link
              href="/customers"
              className="flex-1 flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl transition-all active:scale-[0.96]"
              style={{ background: 'var(--t-card-bg)', border: '1px solid var(--t-card-border)' }}>
              <div className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.20)' }}>
                <Users size={13} style={{ color: '#8B5CF6' }} strokeWidth={2} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-bold leading-none" style={{ color: 'var(--t-text)' }}>Customers</p>
                <p className="text-[9px] mt-0.5" style={{ color: 'var(--t-muted)' }}>Contacts & ledger</p>
              </div>
              <ChevronRight size={11} style={{ color: 'var(--t-muted)', opacity: 0.5, flexShrink: 0 }} />
            </Link>
            <Link
              href="/checks"
              className="flex-1 flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl transition-all active:scale-[0.96]"
              style={{ background: 'var(--t-card-bg)', border: '1px solid var(--t-card-border)' }}>
              <div className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(79,158,255,0.12)', border: '1px solid rgba(79,158,255,0.20)' }}>
                <FileCheck size={13} style={{ color: '#4F9EFF' }} strokeWidth={2} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-bold leading-none" style={{ color: 'var(--t-text)' }}>Checks</p>
                <p className="text-[9px] mt-0.5" style={{ color: 'var(--t-muted)' }}>Cheque records</p>
              </div>
              <ChevronRight size={11} style={{ color: 'var(--t-muted)', opacity: 0.5, flexShrink: 0 }} />
            </Link>
          </div>
        </div>

        {/* ── CTA BAR ── */}
        <div
          className="flex-shrink-0 px-4 pt-3"
          style={{
            paddingBottom: 'max(20px, env(safe-area-inset-bottom, 20px))',
            background: 'var(--t-card-bg)',
            borderTop: '1px solid var(--t-card-border)',
          }}>
          <button
            onClick={() => selected && goToStep2(selected)}
            disabled={!selected}
            className="w-full h-[54px] rounded-2xl font-black text-[15px] flex items-center justify-center gap-2.5 transition-all duration-200 active:scale-[0.97]"
            style={selected && selCfg ? {
              background: `linear-gradient(135deg, ${selCfg.color} 0%, ${selCfg.color}DD 100%)`,
              color: '#fff',
              boxShadow: `0 6px 24px ${selCfg.color}38`,
              letterSpacing: '-0.01em',
            } : {
              background: 'var(--t-page-bg)',
              color: 'var(--t-muted)',
              border: '1px solid var(--t-card-border)',
              letterSpacing: '-0.01em',
            }}>
            {selected && selCfg
              ? <>Continue with {selCfg.label} <ArrowRight size={17} strokeWidth={2.5} /></>
              : <>Select a type to continue <ArrowRight size={16} strokeWidth={1.8} /></>}
          </button>
        </div>
      </div>
    )
  }

  /* ══════════════════════════════
     STEP 2 — TRANSACTION FORM
  ══════════════════════════════ */

  const catType = (type === 'income' ? 'income' : 'expense') as 'income' | 'expense'

  return (
    <>
      {/* Hidden file inputs */}
      <input ref={cameraInputRef}  type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileSelect} />
      <input ref={galleryInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />

      {/* Sheets */}
      <CustomerPickerSheet
        visible={showPicker}
        selectedId={customerId}
        accentColor={type === 'income' && incomeSubType === 'advance' ? '#3B82F6' : cfg.color}
        label={
          type === 'income' && incomeSubType === 'advance' ? 'Select Customer · گاہک منتخب کریں' :
          type === 'income' ? 'Received From · سے ملا' :
          type === 'expense' ? 'Paid To · کو دیا' : 'Select Person · شخص'
        }
        hideWalkIn={type === 'income' && incomeSubType === 'advance'}
        onClose={() => setShowPicker(false)}
        onSelect={(id, name) => { setCustomerId(id); setCustomerName(name); setErrors(er => ({ ...er, customer: '' })) }}
      />
      <AddCategorySheet
        visible={showAddCat}
        catType={catType}
        accentColor={cfg.color}
        onClose={() => setShowAddCat(false)}
        onAdded={id => setCategoryId(id)}
      />
      <ManageCategoriesSheet
        visible={showManageCats}
        catType={catType}
        accentColor={cfg.color}
        onClose={() => setShowManageCats(false)}
      />
      <AddWalletSheet
        visible={showAddWallet}
        accentColor={cfg.color}
        currentCount={allWallets.length}
        onClose={() => setShowAddWallet(false)}
        onAdded={id => setWalletId(id)}
      />
      <CustomizeFormSheet
        visible={showCustomizeForm}
        prefs={formPrefs}
        accentColor={cfg.color}
        onClose={() => setShowCustomizeForm(false)}
        onChange={setFormPrefs}
      />

      {/* ── OUTER CONTAINER ── */}
      <div className="h-[100dvh] flex flex-col relative overflow-hidden" style={{ background: cfg.heroGrad }}>

        {/* ── HEADER ── */}
        <div className="flex-shrink-0 flex items-center justify-between px-4 pt-11 pb-2">
          <button onClick={() => setStep(1)}
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.18)' }}>
            <ChevronLeft size={20} className="text-white" strokeWidth={2} />
          </button>
          <button onClick={() => setStep(1)}
            className="flex items-center gap-2 h-8 px-3.5 rounded-full active:opacity-70"
            style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.20)' }}>
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cfg.color }} />
            <span className="text-[12px] font-bold text-white">{cfg.label}</span>
            <span className="font-urdu text-[11px] text-white/70">{cfg.labelUr}</span>
          </button>
          <button onClick={() => setShowCustomizeForm(true)}
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.18)' }}>
            <Settings2 size={15} className="text-white" />
          </button>
        </div>

        {/* ── SCROLLABLE CONTENT ── */}
        <div
          ref={scrollAreaRef}
          className="flex-1 overflow-y-auto scrollbar-none"
          onScroll={() => { if (keypadOpen) closeKeypad() }}
        >

          {/* ── AMOUNT TAP AREA ── */}
          <button
            onClick={openKeypad}
            className="w-full flex flex-col items-center px-4 pt-2 pb-4 transition-all duration-300 active:opacity-80"
            style={{ background: keypadOpen ? `linear-gradient(180deg,${cfg.color}15 0%,transparent 100%)` : 'transparent' }}>
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] mb-2 transition-colors duration-200"
              style={{ color: keypadOpen ? 'var(--t-text)' : 'var(--t-muted)' }}>
              Amount · رقم
            </p>
            <div className="flex items-end gap-2.5 relative">
              <span className="text-[20px] font-bold pb-2.5" style={{ color: 'var(--t-muted)' }}>Rs.</span>
              <span
                className={cn('text-[56px] font-black leading-none tracking-tight transition-colors duration-150', amt > 0 ? '' : 'opacity-30')}
                style={{ color: amt > 0 ? '#ffffff' : '#ffffff' }}>
                {amount || '0'}
              </span>
              <div
                className={cn('absolute right-[-12px] bottom-[13px] w-0.5 h-7 rounded-full', keypadOpen ? 'animate-pulse' : 'opacity-20')}
                style={{ backgroundColor: '#ffffff' }}
              />
            </div>
            {amt > 0 && type !== 'transfer' && type !== 'loan' && (
              <div className="mt-2 flex items-center gap-1.5 px-3 py-1.5 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.15)' }}>
                <span className="text-[11px] text-white/60">
                  {enabledWallets.find(w => w.id === activeWallet)?.name} →
                </span>
                <span className="text-[12px] font-bold" style={{ color: afterBal >= 0 ? '#4CAF50' : '#FF5C5C' }}>
                  Rs. {formatAmount(Math.abs(afterBal))}
                </span>
              </div>
            )}
            {keypadOpen ? (
              <div className="mt-2 w-14 h-0.5 rounded-full" style={{ backgroundColor: '#fff', opacity: 0.3 }} />
            ) : (
              <p className="mt-2 text-[11px]" style={{ color: 'var(--t-muted)' }}>
                {amount ? '↑ Tap to edit' : 'Tap here to enter amount · رقم ڈالیں'}
              </p>
            )}
          </button>

          {/* Divider */}
          <div className="mx-4 mb-4" style={{ height: '1px', background: 'rgba(255,255,255,0.12)' }} />

          {/* ── FORM FIELDS ── */}
          <div className="flex-1 bg-surface rounded-t-[32px] pt-6 pb-20 px-4 space-y-4">

            {/* ═══ INCOME ═══ */}
            {type === 'income' && <>

              {/* ── Sub-type: Sale | Advance Payment ── */}
              <div className="flex gap-1 p-1 rounded-2xl bg-surface border border-border">
                {([
                  { id: 'sale',    label: 'Sale',            labelUr: 'بکری',       color: '#4CAF50' },
                  { id: 'advance', label: 'Advance Payment', labelUr: 'پیشگی رقم', color: '#3B82F6' },
                ] as const).map(opt => {
                  const active = incomeSubType === opt.id
                  return (
                    <button key={opt.id}
                      onClick={() => { setIncomeSubType(opt.id); setUseAdvanceMode(false) }}
                      className="flex-1 flex flex-col items-center py-2.5 rounded-xl transition-all"
                      style={{
                        background: active ? `${opt.color}1E` : 'transparent',
                        border: `1px solid ${active ? `${opt.color}40` : 'transparent'}`,
                      }}>
                      <span className="text-[12px] font-bold leading-tight"
                        style={{ color: active ? opt.color : 'var(--t-muted)' }}>
                        {opt.label}
                      </span>
                      <span className="font-urdu text-[10px] mt-0.5"
                        style={{ color: active ? `${opt.color}80` : 'var(--t-muted)', opacity: 0.5 }}>
                        {opt.labelUr}
                      </span>
                    </button>
                  )
                })}
              </div>

              {/* ── Customer (required for advance, optional for sale) ── */}
              {(formPrefs.showCustomer || incomeSubType === 'advance') && (
                <CustomerField
                  label={incomeSubType === 'advance' ? 'Customer · گاہک' : 'Received From · سے ملا'}
                  required={incomeSubType === 'advance'}
                  customerId={customerId} customerName={customerName}
                  accentColor={incomeSubType === 'advance' ? '#3B82F6' : cfg.color}
                  error={errors.customer}
                  onTap={() => setShowPicker(true)} />
              )}

              {/* ── Advance Available Banner (sale mode + customer has advance) ── */}
              {incomeSubType === 'sale' && customerId && customerAdvanceBal > 0 && (
                <div className="rounded-2xl overflow-hidden"
                  style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.28)' }}>
                  <div className="px-4 py-3">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ background: 'rgba(59,130,246,0.15)' }}>
                          <Sparkles size={14} style={{ color: '#3B82F6' }} />
                        </div>
                        <div>
                          <p className="text-[12px] font-bold" style={{ color: '#2563EB' }}>
                            Advance Available · پیشگی دستیاب
                          </p>
                          <p className="text-[10px] mt-0.5 text-muted opacity-70">
                            {customerName} · Rs. {formatAmount(customerAdvanceBal)} available
                          </p>
                        </div>
                      </div>
                      <span className="text-[13px] font-black flex-shrink-0" style={{ color: '#2563EB' }}>
                        Rs. {formatAmount(customerAdvanceBal)}
                      </span>
                    </div>
                    {/* Toggle */}
                    <button onClick={() => setUseAdvanceMode(u => !u)}
                      className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all"
                      style={{
                        background: useAdvanceMode ? 'rgba(59,130,246,0.15)' : 'var(--t-page-bg)',
                        border: `1px solid ${useAdvanceMode ? 'rgba(59,130,246,0.40)' : 'var(--t-card-border)'}`,
                      }}>
                      <div>
                        <p className="text-[12px] font-bold"
                          style={{ color: useAdvanceMode ? '#2563EB' : 'var(--t-text)' }}>
                          {useAdvanceMode
                            ? `✓ Using Rs. ${formatAmount(Math.min(customerAdvanceBal, amt || 0))} advance`
                            : 'Apply advance to this sale?'}
                        </p>
                        <p className="font-urdu text-[10px] mt-0.5 text-muted opacity-50">
                          {useAdvanceMode ? 'پیشگی لگائی جا رہی ہے' : 'اس بکری پر پیشگی لگائیں؟'}
                        </p>
                      </div>
                      <div className="w-11 h-6 rounded-full flex items-center px-0.5 transition-all flex-shrink-0"
                        style={{ background: useAdvanceMode ? '#3B82F6' : 'var(--t-card-border)' }}>
                        <div className="w-5 h-5 rounded-full bg-white shadow-sm transition-all duration-200"
                          style={{ transform: useAdvanceMode ? 'translateX(20px)' : 'translateX(0)' }} />
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {/* ── Category (hidden for advance payments) ── */}
              {incomeSubType !== 'advance' && formPrefs.showCategory && filteredCats.length > 0 && (
                <CategorySection cats={filteredCats} activeId={categoryId}
                  accentColor={cfg.color} colorBg={cfg.colorBg} colorBorder={cfg.colorBorder}
                  onSelect={id => setCategoryId(id)}
                  onAdd={() => setShowAddCat(true)}
                  onManage={() => setShowManageCats(true)} />
              )}

              {/* ── Wallet ── */}
              {formPrefs.showWallet && (
                <WalletSection label="Wallet · بٹوہ" wallets={enabledWallets} activeId={activeWallet}
                  accentColor={incomeSubType === 'advance' ? '#3B82F6' : cfg.color}
                  colorBg={incomeSubType === 'advance' ? 'rgba(59,130,246,0.13)' : cfg.colorBg}
                  colorBorder={incomeSubType === 'advance' ? 'rgba(59,130,246,0.30)' : cfg.colorBorder}
                  totalWallets={allWallets.length}
                  onSelect={id => setWalletId(id)} getBalance={walletBal}
                  onAdd={() => setShowAddWallet(true)} />
              )}

              {/* ── Proof ── */}
              {formPrefs.showProof && (
                <PhotoField image={proofImage}
                  onCamera={() => cameraInputRef.current?.click()}
                  onGallery={() => galleryInputRef.current?.click()}
                  onRemove={() => setProofImage(null)} />
              )}

              {/* ── Inline Note for Advance (always shown) ── */}
              {incomeSubType === 'advance' && (
                <div className="rounded-2xl px-4 py-3.5 bg-surface border border-border">
                  <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider mb-2 text-muted">
                    <StickyNote size={10} /> Note · نوٹ
                    <span className="text-[9px] normal-case opacity-50">(optional)</span>
                  </label>
                  <input value={noteEn} onChange={e => setNoteEn(e.target.value)}
                    placeholder="e.g. Mobile repair advance, delivery on hold..."
                    className="w-full bg-transparent text-[13px] text-navy placeholder:text-muted/40 focus:outline-none" />
                  {noteEn && (
                    <div className="mt-2.5 flex items-start gap-2 pt-2.5 border-t border-border">
                      <Sparkles size={10} className="text-teal flex-shrink-0 mt-0.5" />
                      <span className="font-urdu text-[12px] text-teal leading-relaxed opacity-80">{autoTranslate(noteEn)}</span>
                    </div>
                  )}
                </div>
              )}
            </>}

            {/* ═══ EXPENSE ═══ */}
            {type === 'expense' && <>
              {formPrefs.showCustomer && (
                <CustomerField label="Paid To · کو دیا"
                  customerId={customerId} customerName={customerName}
                  accentColor={cfg.color} error={errors.customer}
                  onTap={() => setShowPicker(true)} />
              )}
              {formPrefs.showCategory && filteredCats.length > 0 && (
                <CategorySection cats={filteredCats} activeId={categoryId}
                  accentColor={cfg.color} colorBg={cfg.colorBg} colorBorder={cfg.colorBorder}
                  onSelect={id => setCategoryId(id)}
                  onAdd={() => setShowAddCat(true)}
                  onManage={() => setShowManageCats(true)} />
              )}
              {formPrefs.showWallet && (
                <WalletSection label="Wallet · بٹوہ" wallets={enabledWallets} activeId={activeWallet}
                  accentColor={cfg.color} colorBg={cfg.colorBg} colorBorder={cfg.colorBorder}
                  totalWallets={allWallets.length}
                  onSelect={id => setWalletId(id)} getBalance={walletBal}
                  onAdd={() => setShowAddWallet(true)} />
              )}
              {formPrefs.showProof && (
                <PhotoField image={proofImage}
                  onCamera={() => cameraInputRef.current?.click()}
                  onGallery={() => galleryInputRef.current?.click()}
                  onRemove={() => setProofImage(null)} />
              )}
            </>}

            {/* ═══ TRANSFER ═══ */}
            {type === 'transfer' && <>
              <WalletSection label="From Wallet · سے" wallets={enabledWallets} activeId={activeWallet}
                accentColor={cfg.color} colorBg={cfg.colorBg} colorBorder={cfg.colorBorder}
                totalWallets={allWallets.length}
                onSelect={id => { setWalletId(id); if (toWalletId === id) setToWalletId('') }}
                getBalance={walletBal} onAdd={() => setShowAddWallet(true)} />
              <WalletSection label="To Wallet · کو" wallets={enabledWallets} activeId={toWalletId}
                accentColor={cfg.color} colorBg={cfg.colorBg} colorBorder={cfg.colorBorder}
                excludeId={activeWallet} error={errors.toWallet}
                totalWallets={allWallets.length}
                onSelect={id => { setToWalletId(id); setErrors(er => ({ ...er, toWallet: '' })) }}
                getBalance={walletBal} onAdd={() => setShowAddWallet(true)} />
              {formPrefs.showNotes && (
                <div className="rounded-2xl px-4 py-3.5 bg-surface border border-border">
                  <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider mb-2 text-muted">
                    <StickyNote size={10} /> Note · نوٹ
                    <span className="text-[9px] normal-case opacity-50">(optional)</span>
                  </label>
                  <input value={noteEn} onChange={e => setNoteEn(e.target.value)}
                    placeholder="e.g. Moving funds to bank account..."
                    className="w-full bg-transparent text-[13px] text-navy placeholder:text-muted/40 focus:outline-none" />
                  {noteEn && (
                    <div className="mt-2.5 flex items-start gap-2 pt-2.5 border-t border-border">
                      <Sparkles size={10} className="text-teal flex-shrink-0 mt-0.5" />
                      <span className="font-urdu text-[12px] text-teal leading-relaxed opacity-80">{autoTranslate(noteEn)}</span>
                    </div>
                  )}
                </div>
              )}
              {formPrefs.showProof && (
                <PhotoField image={proofImage}
                  onCamera={() => cameraInputRef.current?.click()}
                  onGallery={() => galleryInputRef.current?.click()}
                  onRemove={() => setProofImage(null)} />
              )}
            </>}

            {/* ═══ LOAN ═══ */}
            {type === 'loan' && <>
              <div className="rounded-2xl overflow-hidden bg-surface border border-border">
                <div className="grid grid-cols-2">
                  {[
                    { v: 'given',    l: 'I Gave', u: 'میں نے دیا', badge: 'They owe you' },
                    { v: 'received', l: 'I Took', u: 'میں نے لیا', badge: 'You owe them' },
                  ].map((d, i) => (
                    <button key={d.v} onClick={() => setLoanDir(d.v as 'given' | 'received')}
                      className="flex flex-col items-start px-4 py-3.5 relative"
                      style={{
                        borderRight: i === 0 ? '1px solid var(--t-card-border)' : undefined,
                        background: loanDir === d.v ? `${cfg.color}15` : 'transparent',
                      }}>
                      {loanDir === d.v && <div className="absolute top-0 left-0 right-0 h-[2.5px]" style={{ backgroundColor: cfg.color }} />}
                      <div className="w-5 h-5 rounded-full border-2 mb-2.5 flex items-center justify-center"
                        style={{ borderColor: loanDir === d.v ? cfg.color : 'var(--t-card-border)', background: loanDir === d.v ? `${cfg.color}25` : 'transparent' }}>
                        {loanDir === d.v && <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cfg.color }} />}
                      </div>
                      <p className="text-[13px] font-bold" style={{ color: loanDir === d.v ? cfg.color : 'var(--t-muted)' }}>{d.l}</p>
                      <p className="font-urdu text-[11px] mt-0.5" style={{ color: loanDir === d.v ? `${cfg.color}CC` : 'var(--t-muted)', opacity: 0.6 }}>{d.u}</p>
                      <p className="text-[10px] mt-1 text-muted opacity-50">{d.badge}</p>
                    </button>
                  ))}
                </div>
              </div>
              {formPrefs.showCustomer && (
                <CustomerField label="Person · شخص" required
                  customerId={customerId} customerName={customerName}
                  accentColor={cfg.color} error={errors.customer}
                  onTap={() => setShowPicker(true)} />
              )}
              <div className="rounded-2xl overflow-hidden bg-surface border border-border">
                <div className="px-4 pt-3.5 pb-3 border-b border-border">
                  <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider mb-2 text-muted">
                    <Phone size={10} /> Phone · فون
                    <span className="text-[9px] normal-case opacity-50">(optional)</span>
                  </label>
                  <input value={personPhone} onChange={e => setPersonPhone(e.target.value)}
                    placeholder="03XX-XXXXXXX" type="tel"
                    className="w-full bg-transparent text-[14px] text-navy placeholder:text-muted/40 focus:outline-none" />
                </div>
                <div className="px-4 pt-3.5 pb-3.5">
                  <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider mb-2 text-muted">
                    <Calendar size={10} /> Return Date · واپسی کی تاریخ
                    <span className="text-[9px] normal-case opacity-50">(optional)</span>
                  </label>
                  <input type="date" value={returnDate} onChange={e => setReturnDate(e.target.value)}
                    className="w-full bg-transparent text-[13px] text-navy/70 focus:outline-none" />
                </div>
              </div>
              {formPrefs.showWallet && (
                <WalletSection label="Wallet · بٹوہ" wallets={enabledWallets} activeId={activeWallet}
                  accentColor={cfg.color} colorBg={cfg.colorBg} colorBorder={cfg.colorBorder}
                  totalWallets={allWallets.length}
                  onSelect={id => setWalletId(id)} getBalance={walletBal}
                  onAdd={() => setShowAddWallet(true)} />
              )}
              {formPrefs.showProof && (
                <PhotoField image={proofImage}
                  onCamera={() => cameraInputRef.current?.click()}
                  onGallery={() => galleryInputRef.current?.click()}
                  onRemove={() => setProofImage(null)} />
              )}
            </>}

            {/* ── MORE DETAILS (Notes + Date) ── */}
            {formPrefs.showNotes && type !== 'transfer' && (
              <>
                <button onClick={() => setShowDetails(s => !s)}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-2xl"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <span className="text-[11px] font-bold uppercase tracking-wider"
                    style={{ color: 'rgba(255,255,255,0.26)' }}>
                    {showDetails ? 'Less Details' : 'More Details'} · {showDetails ? 'کم' : 'مزید'}
                  </span>
                  {showDetails
                    ? <ChevronUp size={13} style={{ color: 'rgba(255,255,255,0.22)' }} />
                    : <ChevronDown size={13} style={{ color: 'rgba(255,255,255,0.22)' }} />}
                </button>
                {showDetails && (
                  <div className="space-y-3">
                    <div className="rounded-2xl px-4 py-3.5"
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                      <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider mb-2"
                        style={{ color: 'rgba(255,255,255,0.30)' }}>
                        <StickyNote size={10} /> Note · نوٹ
                        <span className="text-[9px] normal-case" style={{ color: 'rgba(255,255,255,0.18)' }}>(optional)</span>
                      </label>
                      <input value={noteEn} onChange={e => setNoteEn(e.target.value)}
                        placeholder="e.g. Screen repair, Samsung A15..."
                        className="w-full bg-transparent text-[13px] text-white placeholder:text-white/20 focus:outline-none" />
                      {noteEn && (
                        <div className="mt-2.5 flex items-start gap-2 pt-2.5 border-t" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
                          <Sparkles size={10} className="text-teal flex-shrink-0 mt-0.5" />
                          <span className="font-urdu text-[12px] text-teal/65 leading-relaxed">{autoTranslate(noteEn)}</span>
                        </div>
                      )}
                    </div>
                    <div className="rounded-2xl px-4 py-3.5"
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                      <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider mb-2"
                        style={{ color: 'rgba(255,255,255,0.30)' }}>
                        <Calendar size={10} /> Date · تاریخ
                      </label>
                      <input type="date" value={date} onChange={e => setDate(e.target.value)}
                        className="w-full bg-transparent text-[13px] text-white/70 focus:outline-none" />
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Spacer — grows to push content above keypad */}
          <div style={{
            height: keypadOpen ? `${KEYPAD_HEIGHT}px` : '12px',
            transition: 'height 0.32s cubic-bezier(0.16,1,0.3,1)',
          }} />
        </div>

        {/* ── STICKY SAVE BUTTON ── */}
        <div className="flex-shrink-0 px-4 pt-3 pb-5 transition-all duration-200"
          style={{
            opacity: keypadOpen ? 0 : 1,
            pointerEvents: keypadOpen ? 'none' : 'auto',
            transform: keypadOpen ? 'translateY(6px)' : 'translateY(0)',
            background: 'linear-gradient(to top, rgba(0,0,0,0.3) 0%, transparent 100%)',
          }}>
          <button onClick={handleSave}
            className="w-full h-[54px] rounded-2xl font-black text-[15px] flex items-center justify-center gap-2.5 transition-all"
            style={amt > 0 ? {
              background: `linear-gradient(135deg,${cfg.color} 0%,${cfg.color}DD 100%)`,
              color: '#fff',
              boxShadow: `0 4px 28px ${cfg.color}42`,
            } : {
              background: 'rgba(255,255,255,0.07)',
              color: 'rgba(255,255,255,0.25)',
              border: '1px solid rgba(255,255,255,0.07)',
            }}>
            {amt > 0 && <Check size={17} strokeWidth={2.5} />}
            <span>Save{amt > 0 ? ` · Rs. ${amount}` : ''}</span>
            <span className="font-urdu font-normal text-[13px] opacity-70">محفوظ کریں</span>
          </button>
        </div>

        {/* ══ KEYPAD BOTTOM SHEET ══ */}
        <div
          ref={keypadPanelRef}
          className="absolute bottom-0 left-0 right-0 z-20"
          style={{
            transform: keypadOpen ? 'translateY(0)' : 'translateY(110%)',
            transition: 'transform 0.32s cubic-bezier(0.16,1,0.3,1)',
            background: 'rgba(8,12,22,0.97)',
            backdropFilter: 'blur(32px)',
            WebkitBackdropFilter: 'blur(32px)',
            borderTop: '1px solid rgba(255,255,255,0.09)',
            borderTopLeftRadius: '20px',
            borderTopRightRadius: '20px',
            boxShadow: '0 -8px 48px rgba(0,0,0,0.50)',
          }}>
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.15)' }} />
          </div>
          <div className="flex items-center justify-between px-5 pt-1 pb-3">
            <div className="flex items-baseline gap-1.5">
              <span className="text-[15px] font-bold" style={{ color: 'rgba(255,255,255,0.22)' }}>Rs.</span>
              <span className="text-[40px] font-black tracking-tight leading-none transition-colors duration-150"
                style={{ color: amt > 0 ? cfg.color : 'rgba(255,255,255,0.15)' }}>
                {amount || '0'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {errors.amount && (
                <span className="text-[11px] font-semibold" style={{ color: '#FF5C5C' }}>{errors.amount}</span>
              )}
              <div className="flex items-center gap-1.5 h-7 px-2.5 rounded-xl"
                style={{ background: `${cfg.color}15`, border: `1px solid ${cfg.color}28` }}>
                <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: cfg.color }} />
                <span className="text-[11px] font-bold" style={{ color: cfg.color }}>{cfg.label}</span>
              </div>
            </div>
          </div>
          <div className="px-3 pb-2.5">
            <div className="grid grid-cols-3 gap-1.5">
              {NUMPAD.map((k, i) => (
                <button key={i} onClick={() => handleNumpad(k)}
                  className="h-[48px] rounded-[14px] flex items-center justify-center select-none transition-transform duration-75 active:scale-[0.90] active:opacity-70"
                  style={{
                    background: k === '⌫' ? 'rgba(255,80,80,0.08)' : 'rgba(255,255,255,0.07)',
                    border: `1px solid rgba(255,255,255,${k === '⌫' ? '0.06' : '0.09'})`,
                    fontSize: k === '000' ? '14px' : '20px',
                    fontWeight: 700,
                    color: k === '⌫' ? '#FF6B6B' : 'rgba(255,255,255,0.90)',
                  }}>
                  {k === '⌫' ? <Delete size={20} strokeWidth={1.8} /> : k}
                </button>
              ))}
            </div>
          </div>
          <div className="px-3 pb-5">
            <button onClick={handleSave}
              className="w-full h-[52px] rounded-2xl font-black text-[15px] flex items-center justify-center gap-2 transition-all"
              style={amt > 0 ? {
                background: `linear-gradient(135deg,${cfg.color} 0%,${cfg.color}CC 100%)`,
                color: '#fff',
                boxShadow: `0 4px 24px ${cfg.color}40`,
              } : {
                background: 'rgba(255,255,255,0.07)',
                color: 'rgba(255,255,255,0.20)',
                border: '1px solid rgba(255,255,255,0.06)',
              }}>
              {amt > 0 && <Check size={16} strokeWidth={2.5} />}
              <span>Save{amt > 0 ? ` · Rs. ${amount}` : ''}</span>
              <span className="font-urdu font-normal text-[13px] opacity-70">محفوظ کریں</span>
            </button>
          </div>
        </div>

      </div>
    </>
  )
}

export default function AddTransactionPage() {
  return (
    <Suspense>
      <AddTransactionInner />
    </Suspense>
  )
}
