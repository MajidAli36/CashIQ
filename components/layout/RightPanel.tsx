'use client'
import Link from 'next/link'
import { TrendingUp, TrendingDown, ChevronRight, ArrowUpRight, ArrowDownRight, Plus, Lock, Package } from 'lucide-react'
import { useSettingsStore } from '@/lib/store/settings.store'
import { useTransactionStore } from '@/lib/store/transaction.store'
import { useLoanStore } from '@/lib/store/loan.store'
import { useBusinessStore } from '@/lib/store/business.store'
import { useInventoryStore } from '@/lib/store/inventory.store'
import { useSubscriptionStore } from '@/lib/store/subscription.store'
import { useTranslation } from '@/lib/hooks/useTranslation'
import { formatAmount } from '@/lib/utils/currency'
import { todayISO, formatDate } from '@/lib/utils/date'
import { cn } from '@/lib/utils/cn'
import type { WalletType } from '@/lib/types'

// Color per wallet type — add new types here as needed
const WALLET_HEX: Record<WalletType, string> = {
  cash:      '#00E87A',
  bank:      '#4F9EFF',
  jazzcash:  '#F5A623',
  easypaisa: '#00C4B4',
  custom:    '#A78BFA',
}

interface RightPanelProps {
  isInventoryPage: boolean
  /** When true the panel renders as a normal block (no h-full / no inner scroll).
   *  Use this when the panel is stacked inside the main scroll area on mobile. */
  stacked?: boolean
}

export function RightPanel({ isInventoryPage, stacked = false }: RightPanelProps) {
  const { t, lang } = useTranslation()
  const { getEnabledWallets, categories } = useSettingsStore()
  const {
    getWalletBalance, getRealEarning, getRecent,
    getTotalIncome, getTotalExpense,
  } = useTransactionStore()
  const { getTotalToReceive, getTotalToGive } = useLoanStore()
  const { activeBusinessId } = useBusinessStore()
  const { getInventoryStats } = useInventoryStore()
  const { isFeatureEnabled } = useSubscriptionStore()
  const bid = activeBusinessId ?? undefined

  const today          = todayISO()
  const enabledWallets = getEnabledWallets(bid)
  const totalBalance   = enabledWallets.reduce((s, w) => s + getWalletBalance(w.id, bid), 0)
  const todayEarning   = getRealEarning(today, today, bid)
  const todayIncome    = getTotalIncome(today, today, bid)
  const todayExpense   = getTotalExpense(today, today, bid)
  const loanReceive    = getTotalToReceive(bid)
  const loanGive       = getTotalToGive(bid)
  const recent         = getRecent(6, bid)
  const isPositiveDay  = todayEarning >= 0

  // Inventory — computed whenever the feature is on (not just on the inventory page)
  const hasInventory   = isFeatureEnabled('inventory')
  const inventoryStats = (hasInventory || isInventoryPage) ? getInventoryStats(bid ?? '') : null
  const inventoryValue = inventoryStats?.total_inventory_value ?? 0
  const showWealth     = hasInventory && inventoryStats !== null
  const totalWealth    = totalBalance + inventoryValue

  return (
    <div className={cn(
      'flex flex-col overflow-x-hidden',
      stacked ? 'h-auto' : 'h-full panel-scroll overflow-y-auto',
    )}>

      {/* ── HEADER ── */}
      <div
        className="flex-shrink-0 flex items-center justify-between px-4 h-[60px]"
        style={{ borderBottom: '1px solid var(--t-card-border)' }}>
        <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: 'var(--t-muted)' }}>
          {t('panel.overview')}
        </p>
        <Link
          href="/reports"
          className="text-[10px] font-semibold flex items-center gap-0.5"
          style={{ color: 'var(--t-accent, #00C4B4)' }}>
          {t('panel.fullReport')} <ChevronRight size={10} />
        </Link>
      </div>

      <div className="flex-1 px-4 py-5 space-y-5 overflow-y-auto panel-scroll">

        {/* ── BALANCE / WEALTH CARD ── */}
        <div
          className="rounded-2xl p-4 relative overflow-hidden shadow-md"
          style={{ background: 'linear-gradient(140deg, var(--t-hero-from) 0%, var(--t-hero-mid) 100%)' }}>

          {/* glow blob — purple when showing wealth, teal otherwise */}
          <div
            className="absolute -top-8 -right-8 w-28 h-28 rounded-full pointer-events-none"
            style={{
              background: showWealth ? '#A78BFA' : 'var(--t-accent, #00C4B4)',
              opacity:    0.09,
              filter:     'blur(24px)',
            }}
          />

          {/* Label */}
          <p
            className="relative text-[9px] font-bold uppercase tracking-[0.15em] mb-2"
            style={{ color: 'rgba(255,255,255,0.38)' }}>
            {showWealth ? t('panel.totalWealth') : t('panel.totalBalance')}
          </p>

          {/* Amount */}
          <div className="relative flex items-end gap-1.5 mb-1">
            <span className="text-white/35 text-sm font-semibold pb-0.5">Rs.</span>
            <span className="text-[28px] font-black text-white leading-none tracking-tight">
              {formatAmount(showWealth ? totalWealth : totalBalance)}
            </span>
          </div>

          {/* "Includes inventory" subtitle — whenever inventory is on */}
          {showWealth && (
            <p className="relative text-[9px] font-semibold mb-1.5" style={{ color: 'rgba(167,139,250,0.72)' }}>
              ✦ {t('panel.includesInventory')}
            </p>
          )}

          {/* Date */}
          <p className="relative text-[10px] mb-3" style={{ color: 'rgba(255,255,255,0.22)' }}>
            {formatDate(today)}
          </p>

          {/* ── WALLET PILLS — one per wallet, auto-expands as user adds wallets ── */}
          <div className="relative flex gap-1.5 flex-wrap">
            {enabledWallets.map(w => {
              const bal = getWalletBalance(w.id, bid)
              const hex = WALLET_HEX[w.type] ?? '#A78BFA'
              return (
                <div
                  key={w.id}
                  className="flex flex-col rounded-xl px-2.5 py-1.5 flex-shrink-0"
                  style={{
                    background: `${hex}12`,
                    border:     `1px solid ${hex}28`,
                  }}>
                  <p
                    className="text-[8px] font-bold uppercase tracking-[0.10em] leading-none mb-0.5"
                    style={{ color: `${hex}90` }}>
                    {w.name}
                  </p>
                  <p
                    className="text-[11px] font-black leading-none tabular-nums"
                    style={{ color: hex }}>
                    {formatAmount(bal)}
                  </p>
                </div>
              )
            })}

            {/* Stock pill — whenever inventory feature is on */}
            {showWealth && (
              <div
                className="flex flex-col rounded-xl px-2.5 py-1.5 flex-shrink-0"
                style={{
                  background: 'rgba(167,139,250,0.12)',
                  border:     '1px solid rgba(167,139,250,0.28)',
                }}>
                <p
                  className="text-[8px] font-bold uppercase tracking-[0.10em] leading-none mb-0.5"
                  style={{ color: 'rgba(167,139,250,0.60)' }}>
                  {t('panel.stock')}
                </p>
                <p
                  className="text-[11px] font-black leading-none tabular-nums"
                  style={{ color: '#A78BFA' }}>
                  {formatAmount(inventoryValue)}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ── WALLETS ── */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--t-muted)' }}>
              {t('wallets.wallets')}
            </p>
            <Link
              href="/settings/wallets"
              className="text-[10px] font-semibold"
              style={{ color: 'var(--t-accent, #00C4B4)' }}>
              {t('common.manage')}
            </Link>
          </div>
          <div className="space-y-1.5">
            {enabledWallets.map(w => {
              const bal = getWalletBalance(w.id)
              return (
                <div
                  key={w.id}
                  className="flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer transition-all hover:bg-gray-50"
                  style={{ background: '#FFFFFF', border: '1px solid #D1D5DB', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                  <span className="text-base flex-shrink-0">{w.icon}</span>
                  <p
                    className="flex-1 text-[12px] font-semibold min-w-0 truncate text-gray-700">
                    {w.name}
                  </p>
                  <p
                    className="text-[12px] font-bold flex-shrink-0 tabular-nums"
                    style={{ color: bal >= 0 ? '#22C55E' : '#EF4444' }}>
                    Rs.&nbsp;{formatAmount(bal)}
                  </p>
                </div>
              )
            })}
            {enabledWallets.length === 0 && (
              <p className="text-[11px] text-center py-3" style={{ color: 'var(--t-muted)' }}>{t('wallets.noWallets')}</p>
            )}
          </div>
        </div>

        {/* ── TODAY'S P&L ── */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--t-muted)' }}>
            {t('panel.today')}
          </p>
          <div className="grid grid-cols-2 gap-2 mb-2">
            <div
              className="rounded-xl p-3"
              style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.15)' }}>
              <div className="flex items-center gap-1 mb-1.5">
                <ArrowUpRight size={11} style={{ color: '#22C55E' }} />
                <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: '#22C55E' }}>{t('panel.moneyIn')}</span>
              </div>
              <p className="text-[14px] font-black tabular-nums" style={{ color: '#22C55E' }}>
                {formatAmount(todayIncome)}
              </p>
            </div>
            <div
              className="rounded-xl p-3"
              style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)' }}>
              <div className="flex items-center gap-1 mb-1.5">
                <ArrowDownRight size={11} style={{ color: '#EF4444' }} />
                <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: '#EF4444' }}>{t('panel.moneyOut')}</span>
              </div>
              <p className="text-[14px] font-black tabular-nums" style={{ color: '#EF4444' }}>
                {formatAmount(todayExpense)}
              </p>
            </div>
          </div>
          {/* Net */}
          <div
            className="flex items-center justify-between px-3 py-3 rounded-xl"
            style={{ background: '#FFFFFF', border: '1px solid #D1D5DB', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <div className="flex items-center gap-2">
              {isPositiveDay
                ? <TrendingUp size={13} style={{ color: '#22C55E' }} />
                : <TrendingDown size={13} style={{ color: '#EF4444' }} />}
              <span className="text-[11px] font-semibold text-gray-500">{t('panel.net')}</span>
            </div>
            <span
              className="text-[13px] font-black tabular-nums"
              style={{ color: isPositiveDay ? '#22C55E' : '#EF4444' }}>
              {isPositiveDay ? '+' : '−'}Rs.&nbsp;{formatAmount(Math.abs(todayEarning))}
            </span>
          </div>
        </div>

        {/* ── INVENTORY VALUE CARD (inventory page only) ── */}
        {isInventoryPage && inventoryStats && (
          <Link href="/inventory" className="block">
            <div
              className="rounded-2xl p-3.5 relative overflow-hidden transition-all hover:brightness-110 active:scale-[0.98]"
              style={{
                background: 'linear-gradient(135deg, rgba(167,139,250,0.14) 0%, rgba(79,158,255,0.07) 100%)',
                border:     '1px solid rgba(167,139,250,0.28)',
                borderLeft: '3px solid #A78BFA',
                boxShadow:  '0 2px 12px rgba(167,139,250,0.08)',
              }}>
              <div className="absolute inset-0"
                style={{ background: 'radial-gradient(ellipse at 80% 10%, rgba(167,139,250,0.12) 0%, transparent 60%)' }} />
              <div className="relative flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2">
                  <div
                    className="w-[22px] h-[22px] rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(167,139,250,0.14)', border: '1px solid rgba(167,139,250,0.28)' }}>
                    <Package size={11} style={{ color: '#A78BFA' }} strokeWidth={2.2} />
                  </div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.12em]"
                    style={{ color: 'rgba(167,139,250,0.70)' }}>
                    {t('panel.inventoryValue')}
                  </p>
                </div>
                <ChevronRight size={12} style={{ color: 'rgba(167,139,250,0.45)' }} />
              </div>
              <div className="relative flex items-end justify-between gap-2">
                <div>
                  <p className="text-[20px] font-black leading-none tabular-nums" style={{ color: '#A78BFA' }}>
                    Rs.&nbsp;{formatAmount(inventoryValue)}
                  </p>
                  <p className="text-[9px] font-semibold mt-1.5" style={{ color: 'rgba(167,139,250,0.52)' }}>
                    {t('panel.includedInWealth')}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-[10px] font-bold" style={{ color: '#00E87A' }}>
                    +{formatAmount(inventoryStats.potential_profit)}
                  </p>
                  <p className="text-[8px] font-semibold" style={{ color: 'rgba(255,255,255,0.25)' }}>
                    {t('panel.potential')}
                  </p>
                </div>
              </div>
            </div>
          </Link>
        )}

        {/* ── DAILY CLOSE ── */}
        <Link
          href="/close"
          className="flex items-center justify-between px-3 py-3 rounded-xl transition-all duration-200 active:scale-95 hover:scale-[1.02] hover:shadow-md"
          style={{
            background: 'linear-gradient(135deg, rgba(245,158,11,0.12) 0%, rgba(245,158,11,0.05) 100%)',
            border:     '1px solid rgba(245,158,11,0.25)',
            borderLeft: '4px solid #F59E0B',
            boxShadow:  '0 2px 8px rgba(245,158,11,0.08)',
          }}>
          <div className="flex items-center gap-2.5">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(245,158,11,0.15)' }}>
              <Lock size={13} style={{ color: '#F59E0B' }} />
            </div>
            <div>
              <p className="text-[12px] font-black" style={{ color: '#F59E0B' }}>{t('quickActions.closeDay')}</p>
              <p className="text-[10px]" style={{ color: 'rgba(245,158,11,0.6)' }}>{t('panel.endOfDay')}</p>
            </div>
          </div>
          <ChevronRight size={14} style={{ color: '#F59E0B', opacity: 0.7 }} />
        </Link>

        {/* ── LOAN OUTSTANDING ── */}
        {(loanReceive > 0 || loanGive > 0) && (
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--t-muted)' }}>
              {t('loans.loans')}
            </p>
            <Link
              href="/loan"
              className="block rounded-xl overflow-hidden"
              style={{ background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.12)', borderLeft: '3px solid #F59E0B' }}>
              <div className="px-3 py-3 space-y-1.5">
                {loanReceive > 0 && (
                  <div className="flex justify-between text-[12px]">
                    <span style={{ color: 'var(--t-muted)' }}>{t('dashboard.toReceive')}</span>
                    <span className="font-bold" style={{ color: '#22C55E' }}>Rs.&nbsp;{formatAmount(loanReceive)}</span>
                  </div>
                )}
                {loanGive > 0 && (
                  <div className="flex justify-between text-[12px]">
                    <span style={{ color: 'var(--t-muted)' }}>{t('dashboard.toGive')}</span>
                    <span className="font-bold" style={{ color: '#EF4444' }}>Rs.&nbsp;{formatAmount(loanGive)}</span>
                  </div>
                )}
              </div>
            </Link>
          </div>
        )}


        {/* ── QUICK ACTIONS ── */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--t-muted)' }}>
            {t('panel.quickAdd')}
          </p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { href: '/add?type=income',   label: t('dashboard.income'),          color: '#22C55E',                  bg: 'rgba(34,197,94,0.06)',   primary: true },
              { href: '/add?type=expense',  label: t('dashboard.expense'),         color: '#EF4444',                  bg: 'rgba(239,68,68,0.06)',   primary: false },
              { href: '/add?type=transfer', label: t('quickActions.transfer'),     color: 'var(--t-accent,#00C4B4)',  bg: 'rgba(0,196,180,0.06)',   primary: false },
              { href: '/add?type=loan',     label: t('loans.loans'),               color: '#F59E0B',                  bg: 'rgba(245,158,11,0.06)',  primary: false },
            ].map(a => (
              <Link
                key={a.href}
                href={a.href}
                className={cn('flex items-center gap-2 h-10 px-3 rounded-xl transition-all duration-200 active:scale-95 hover:scale-105 hover:shadow-md', a.primary && 'ring-1 ring-teal-300')}
                style={{ background: a.bg, border: `1px solid ${a.color}20` }}>
                <Plus size={14} style={{ color: a.color }} strokeWidth={2.5} />
                <span className="text-[11px] font-semibold" style={{ color: a.color }}>{a.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* ── RECENT TRANSACTIONS ── */}
        <div className="pb-2">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--t-muted)' }}>
              {t('panel.recent')}
            </p>
            <Link
              href="/records"
              className="text-[10px] font-semibold flex items-center gap-0.5"
              style={{ color: 'var(--t-accent, #00C4B4)' }}>
              {t('panel.viewAll')} <ChevronRight size={10} />
            </Link>
          </div>
          <div
            className="rounded-xl overflow-hidden"
            style={{ background: '#FFFFFF', border: '1px solid #D1D5DB', boxShadow: '0 1px 4px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.08)' }}>
            {recent.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-[11px]" style={{ color: 'var(--t-muted)' }}>{t('panel.noTransactionsYet')}</p>
              </div>
            ) : (
              recent.map((txn, i) => {
                const cat    = categories.find(c => c.id === txn.category_id)
                const isPos  = ['income', 'loan_received', 'opening_balance', 'advance_received'].includes(txn.type)
                const isXfer = txn.type === 'transfer'
                const catName = lang === 'ur' ? (cat?.name_ur || cat?.name_en) : cat?.name_en
                return (
                  <div
                    key={txn.id}
                    className={cn('flex items-center gap-2.5 px-3 py-3.5 hover:bg-gray-50 transition-colors cursor-pointer', i > 0 && 'border-t border-gray-100')}
                  >
                    <div className={cn(
                      'w-7 h-7 rounded-lg flex items-center justify-center text-sm flex-shrink-0',
                      isXfer ? 'bg-teal/10' : isPos ? 'bg-emerald-500/10' : 'bg-red-500/10',
                    )}>
                      {cat?.icon || '💱'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-semibold truncate text-gray-700">
                        {catName || txn.type}
                      </p>
                      <p className="text-[10px] text-gray-400">{txn.time}</p>
                    </div>
                    <p className={cn(
                      'text-[11px] font-bold flex-shrink-0 tabular-nums',
                      isXfer ? 'text-teal' : isPos ? 'text-emerald-500' : 'text-red-500',
                    )}>
                      {isXfer ? '⇄' : isPos ? '+' : '−'}Rs.&nbsp;{formatAmount(txn.amount)}
                    </p>
                  </div>
                )
              })
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
