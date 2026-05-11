'use client'
import { useState } from 'react'
import { useSettingsStore } from '@/lib/store/settings.store'
import { useTransactionStore } from '@/lib/store/transaction.store'
import { useTranslation } from '@/lib/hooks/useTranslation'
import { formatAmount } from '@/lib/utils/currency'
import { PageHeader } from '@/components/layout/PageHeader'
import { Toggle } from '@/components/ui/Toggle'
import { showToast } from '@/components/ui/Toast'
import { cn } from '@/lib/utils/cn'
import { Plus, Wallet, X, Check, TrendingUp, TrendingDown } from 'lucide-react'
import { useBusinessStore } from '@/lib/store/business.store'
import type { WalletType } from '@/lib/types'

/* ─── Wallet card styles by type ─── */
const WALLET_STYLE: Record<string, { gradient: string; glow: string }> = {
  cash:      { gradient: 'from-[#131929] to-[#0B0F1A]', glow: 'shadow-[0_4px_20px_rgba(11,15,26,0.5)]' },
  bank:      { gradient: 'from-[#074744] to-[#042e2c]',  glow: 'shadow-[0_4px_20px_rgba(0,196,180,0.20)]' },
  jazzcash:  { gradient: 'from-[#C8102E] to-[#8B0B1F]',  glow: 'shadow-[0_4px_20px_rgba(200,16,46,0.30)]' },
  easypaisa: { gradient: 'from-[#3a7a28] to-[#255219]',  glow: 'shadow-[0_4px_20px_rgba(58,122,40,0.30)]' },
  custom:    { gradient: 'from-[#1e2a40] to-[#131929]',  glow: 'shadow-[0_4px_20px_rgba(30,42,64,0.30)]' },
}

const WALLET_TYPE_OPTIONS: { type: WalletType; label: string; color: string }[] = [
  { type: 'cash',     label: 'Cash',      color: '#8a9bb5' },
  { type: 'bank',     label: 'Bank',      color: '#00C4B4' },
  { type: 'jazzcash', label: 'JazzCash',  color: '#C8102E' },
  { type: 'easypaisa',label: 'EasyPaisa', color: '#3a7a28' },
  { type: 'custom',   label: 'Other',     color: '#8a9bb5' },
]

const ICON_OPTIONS = ['🏦','💵','💳','💰','📱','💚','🟢','🔵','🟡','🏧','💎','🪙','📲','🤳','🛒']

export default function WalletsPage() {
  const { wallets, toggleWallet, updateWalletAccount, addWallet } = useSettingsStore()
  const getWalletBalance = useTransactionStore(s => s.getWalletBalance)
  const { activeBusinessId } = useBusinessStore()
  const bid = activeBusinessId ?? 'default'

  const businessWallets = wallets.filter(w => !w.business_id || w.business_id === bid)
  const totalBalance = businessWallets.filter(w => w.is_enabled).reduce((s, w) => s + getWalletBalance(w.id, bid), 0)

  /* ── Add wallet sheet state ── */
  const [showAdd, setShowAdd]   = useState(false)
  const [newName, setNewName]   = useState('')
  const [newType, setNewType]   = useState<WalletType>('bank')
  const [newIcon, setNewIcon]   = useState('🏦')
  const [nameErr, setNameErr]   = useState('')

  const handleAdd = () => {
    if (!newName.trim()) { setNameErr('Wallet name is required'); return }
    addWallet({
      name: newName.trim(),
      color: '#00C4B4',
      icon: newIcon,
      type: newType,
      business_id: bid,
      is_enabled: true,
      is_default: false,
      sort_order: businessWallets.length,
    })
    showToast({ type: 'success', message: 'Wallet added!', messageUr: 'بٹوہ شامل ہوگیا' })
    setNewName(''); setNewType('bank'); setNewIcon('🏦'); setNameErr(''); setShowAdd(false)
  }

  const walletTypeColor = (type: string) => {
    const found = WALLET_TYPE_OPTIONS.find(o => o.type === type)
    return found?.color || '#8a9bb5'
  }

  return (
    <div className="min-h-screen bg-surface pb-[88px]">
      {/* Hero */}
      <div className="bg-navy relative overflow-hidden">
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-48 h-48 bg-teal/8 rounded-full blur-[60px] pointer-events-none" />
        <PageHeader title="Wallets" titleUr="بٹوہ" backTo="/settings" />
        <div className="relative z-10 px-5 pt-2 pb-6">
          <p className="text-white/40 text-[11px] font-semibold uppercase tracking-widest mb-1">Total Across All Wallets</p>
          <p className="text-3xl font-black text-white">Rs. {formatAmount(totalBalance)}</p>
        </div>
      </div>

      <div className="px-4 pt-5 space-y-3">
        <p className="text-[11px] font-bold text-muted uppercase tracking-wider">Your Wallets · بٹوے</p>

        {businessWallets.map(w => {
          const style = WALLET_STYLE[w.type] || WALLET_STYLE.custom
          const balance = getWalletBalance(w.id, bid)
          const isEnabled = w.is_enabled
          const accentColor = walletTypeColor(w.type)

          return (
            <div key={w.id} className={cn('rounded-3xl overflow-hidden transition-opacity', !isEnabled && 'opacity-55')}>
              {/* Card */}
              <div className={cn(
                'bg-gradient-to-br p-5 relative overflow-hidden',
                style.gradient, style.glow
              )}>
                <div className="absolute -right-6 -top-6 w-28 h-28 bg-white/4 rounded-full" />
                <div className="absolute -right-2 -bottom-6 w-20 h-20 bg-white/3 rounded-full" />
                <div className="flex items-start justify-between relative z-10">
                  <div>
                    <div className="flex items-center gap-2.5 mb-4">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg"
                        style={{ background: `${accentColor}20` }}>
                        {w.icon}
                      </div>
                      <div>
                        <p className="text-white font-bold text-[15px] leading-tight">{w.name}</p>
                        {w.name_ur && <p className="font-urdu text-white/40 text-[10px]">{w.name_ur}</p>}
                      </div>
                    </div>
                    <p className="text-white/40 text-[11px] mb-1">Balance</p>
                    <p className="text-2xl font-black text-white">Rs. {formatAmount(balance)}</p>
                  </div>
                  <Toggle checked={isEnabled} onChange={() => toggleWallet(w.id)} />
                </div>
              </div>

              {/* Footer */}
              <div className="bg-white border border-border border-t-0 rounded-b-3xl px-5 py-4 space-y-3">
                {(w.type === 'jazzcash' || w.type === 'easypaisa') && (
                  <div>
                    <label className="text-[11px] font-semibold text-muted uppercase tracking-wider mb-1.5 block">
                      Account Number
                    </label>
                    <input
                      value={w.account_number || ''}
                      onChange={e => updateWalletAccount(w.id, e.target.value)}
                      placeholder="03XX-XXXXXXX"
                      className="w-full h-10 bg-surface border border-border rounded-xl px-3 text-sm focus:outline-none focus:border-teal transition-colors"
                    />
                  </div>
                )}
                {w.type === 'bank' && (
                  <div>
                    <label className="text-[11px] font-semibold text-muted uppercase tracking-wider mb-1.5 block">
                      Account / IBAN
                    </label>
                    <input
                      value={w.account_number || ''}
                      onChange={e => updateWalletAccount(w.id, e.target.value)}
                      placeholder="Enter account or IBAN number"
                      className="w-full h-10 bg-surface border border-border rounded-xl px-3 text-sm focus:outline-none focus:border-teal transition-colors"
                    />
                  </div>
                )}
                <p className="text-[11px] text-muted">
                  {w.type === 'cash'     ? 'Physical cash on hand · نقد رقم' :
                   w.type === 'bank'     ? 'Bank account balance · بینک بیلنس' :
                   w.type === 'jazzcash' ? 'JazzCash mobile account' :
                   w.type === 'easypaisa'? 'EasyPaisa mobile account' :
                   'Custom wallet · کسٹم بٹوہ'}
                </p>
              </div>
            </div>
          )
        })}

        {/* Add Wallet button */}
        <button
          onClick={() => setShowAdd(true)}
          className="w-full flex items-center gap-4 p-4 rounded-3xl border-2 border-dashed border-teal/30 bg-teal/5 active:opacity-70 transition-all">
          <div className="w-12 h-12 bg-teal/15 rounded-2xl flex items-center justify-center">
            <Plus size={22} className="text-teal" strokeWidth={2.5} />
          </div>
          <div className="text-left">
            <p className="text-sm font-bold text-teal">Add New Wallet</p>
            <p className="text-[11px] text-muted mt-0.5">Bank, custom, or mobile account</p>
          </div>
        </button>
      </div>

      {/* ── Add Wallet Bottom Sheet ── */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowAdd(false)} />
          <div className="relative w-full md:max-w-[480px] bg-white rounded-t-[28px] md:rounded-2xl">

            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-border" />
            </div>

            <div className="px-5 pb-8">
              {/* Header */}
              <div className="flex items-center justify-between mb-5 pt-2">
                <div>
                  <p className="text-[16px] font-black text-navy">Add Wallet</p>
                  <p className="font-urdu text-sm text-muted">نیا بٹوہ شامل کریں</p>
                </div>
                <button onClick={() => setShowAdd(false)}
                  className="w-8 h-8 rounded-xl bg-surface flex items-center justify-center">
                  <X size={14} className="text-muted" />
                </button>
              </div>

              {/* Wallet name */}
              <div className="mb-4">
                <label className="text-[11px] font-bold text-muted uppercase tracking-wider mb-2 block">
                  Wallet Name · نام *
                </label>
                <input
                  value={newName}
                  onChange={e => { setNewName(e.target.value); setNameErr('') }}
                  placeholder="e.g. HBL Bank, Savings Account…"
                  autoFocus
                  className={cn(
                    'w-full h-12 bg-surface border rounded-2xl px-4 text-sm text-navy placeholder:text-muted/50 focus:outline-none transition-all',
                    nameErr ? 'border-expense' : 'border-border focus:border-navy'
                  )}
                />
                {nameErr && <p className="text-expense text-xs mt-1">{nameErr}</p>}
              </div>

              {/* Wallet type */}
              <div className="mb-4">
                <label className="text-[11px] font-bold text-muted uppercase tracking-wider mb-2 block">
                  Type · قسم
                </label>
                <div className="flex gap-2 flex-wrap">
                  {WALLET_TYPE_OPTIONS.map(opt => (
                    <button key={opt.type}
                      onClick={() => setNewType(opt.type)}
                      className={cn(
                        'flex items-center gap-1.5 h-9 px-3.5 rounded-2xl text-[12px] font-semibold border transition-all',
                        newType === opt.type ? 'text-white' : 'text-muted'
                      )}
                      style={newType === opt.type ? {
                        background: 'var(--t-accent)',
                        borderColor: 'var(--t-accent)',
                      } : {
                        background: 'var(--t-page-bg)',
                        borderColor: 'var(--t-card-border)',
                      }}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Icon picker */}
              <div className="mb-6">
                <label className="text-[11px] font-bold text-muted uppercase tracking-wider mb-2 block">
                  Icon · آئیکن
                </label>
                <div className="flex gap-2 flex-wrap">
                  {ICON_OPTIONS.map(icon => (
                    <button key={icon}
                      onClick={() => setNewIcon(icon)}
                      className={cn(
                        'w-10 h-10 rounded-xl text-xl flex items-center justify-center border transition-all'
                      )}
                      style={newIcon === icon ? {
                        background: 'var(--t-accent)',
                        borderColor: 'var(--t-accent)',
                      } : {
                        background: 'var(--t-page-bg)',
                        borderColor: 'var(--t-card-border)',
                      }}>
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              {/* Save */}
              <button
                onClick={handleAdd}
                className="w-full h-13 rounded-2xl text-white text-[15px] font-black flex items-center justify-center gap-2"
                style={{ background: 'var(--t-accent)' }}>
                <Check size={17} strokeWidth={2.5} />
                Add Wallet · <span className="font-urdu font-normal text-sm">شامل کریں</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
