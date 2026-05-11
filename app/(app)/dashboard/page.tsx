'use client'
import { useMemo, useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useTransactionStore } from '@/lib/store/transaction.store'
import { useBusinessStore } from '@/lib/store/business.store'
import { useSettingsStore } from '@/lib/store/settings.store'
import { useLoanStore } from '@/lib/store/loan.store'
import { useCheckGuaranteeStore } from '@/lib/store/check-guarantee.store'
import { useViewModeStore } from '@/lib/store/view-mode.store'
import { useInventoryStore } from '@/lib/store/inventory.store'
import { useSubscriptionStore } from '@/lib/store/subscription.store'
import { formatAmount } from '@/lib/utils/currency'
import { todayISO } from '@/lib/utils/date'
import { cn } from '@/lib/utils/cn'
import {
  TrendingUp, TrendingDown, Wallet, ArrowRightLeft,
  FileText, Users, ShoppingBag, Calendar, ChevronRight,
  Sparkles, AlertCircle, CheckCircle, Info, ReceiptText, HandCoins,
  ArrowUpRight, ArrowDownRight, Lock, Package, Bell,
} from 'lucide-react'
import { ThemeSwitcher } from '@/components/ui/ThemeSwitcher'
import { ViewModeToggle } from '@/components/ui/ViewModeToggle'
import { SimpleDashboard } from '@/components/dashboard/SimpleDashboard'
import { useTranslation } from '@/lib/hooks/useTranslation'

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false)
  const { viewMode, hasInitialized, setViewMode } = useViewModeStore()
  const { t, lang } = useTranslation()
  const { shop, setLanguage } = useSettingsStore()

  const { transactions, getWalletBalance, getTotalIncome, getTotalExpense, getRealEarning } = useTransactionStore()
  const { businesses, activeBusinessId } = useBusinessStore()
  const { getEnabledWallets, categories } = useSettingsStore()
  const { getTotalToReceive, getTotalToGive } = useLoanStore()
  const { checkGuarantees } = useCheckGuaranteeStore()
  const { getInventoryStats } = useInventoryStore()
  const { isFeatureEnabled, subscription } = useSubscriptionStore()

  useEffect(() => {
    setMounted(true)
    // First ever visit: auto-detect mobile → default to Basic mode
    if (!hasInitialized) {
      const isMobile = window.innerWidth < 768
      setViewMode(isMobile ? 'simple' : 'full')
    }
  }, []) // intentionally run once

  // RTL support
  useEffect(() => {
    document.documentElement.dir = lang === 'ur' ? 'rtl' : 'ltr'
  }, [lang])

  const bid     = activeBusinessId ?? undefined
  const business = businesses.find(b => b.id === bid)
  const today    = todayISO()

  const hasInventory   = isFeatureEnabled('inventory')
  const inventoryStats = hasInventory ? getInventoryStats(bid ?? '') : null

  const now            = new Date()
  const thisMonthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
  const lastMonthDate  = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const lastMonthStart = `${lastMonthDate.getFullYear()}-${String(lastMonthDate.getMonth() + 1).padStart(2, '0')}-01`
  const lastMonthEnd   = `${lastMonthDate.getFullYear()}-${String(lastMonthDate.getMonth() + 1).padStart(2, '0')}-${new Date(lastMonthDate.getFullYear(), lastMonthDate.getMonth() + 1, 0).getDate()}`

  const enabledWallets = getEnabledWallets(bid)

  const stats = useMemo(() => {
    const totalBalance  = enabledWallets.reduce((s, w) => s + getWalletBalance(w.id, bid), 0)
    const thisIncome    = getTotalIncome(thisMonthStart, today, bid)
    const thisExpense   = getTotalExpense(thisMonthStart, today, bid)
    const lastIncome    = getTotalIncome(lastMonthStart, lastMonthEnd, bid)
    const lastExpense   = getTotalExpense(lastMonthStart, lastMonthEnd, bid)
    const todayEarning  = getRealEarning(today, today, bid)
    const incomeChange  = lastIncome  > 0 ? ((thisIncome  - lastIncome)  / lastIncome)  * 100 : null
    const expenseChange = lastExpense > 0 ? ((thisExpense - lastExpense) / lastExpense) * 100 : null
    return { totalBalance, income: thisIncome, expense: thisExpense, profit: thisIncome - thisExpense, lastIncome, incomeChange, expenseChange, todayEarning }
  }, [enabledWallets, bid, today, thisMonthStart, lastMonthStart, lastMonthEnd, getWalletBalance, getTotalIncome, getTotalExpense, getRealEarning])

  const loanToReceive = getTotalToReceive(bid)
  const loanToGive    = getTotalToGive(bid)

  const chequeStats = useMemo(() => {
    const active = checkGuarantees.filter(c => (!bid || c.business_id === bid) && c.status === 'active')
    return {
      count:     active.length,
      remaining: active.reduce((s, c) => s + c.remaining_balance, 0),
    }
  }, [checkGuarantees, bid])

  const walletBalances = useMemo(() =>
    enabledWallets.map(w => ({ ...w, balance: getWalletBalance(w.id, bid) })),
    [enabledWallets, bid, getWalletBalance]
  )

  const recentTransactions = useMemo(() =>
    transactions
      .filter(t => {
        if (bid && t.business_id !== bid) return false
        if (t.is_deleted || t.is_reversed) return false
        return !['reversal', 'advance_offset'].includes(t.type)
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5),
    [transactions, bid]
  )

  const insights = useMemo(() => {
    const msgs: { type: 'good' | 'warn' | 'info'; text: string }[] = []
    if (stats.incomeChange !== null) {
      if (stats.incomeChange > 0)
        msgs.push({ type: 'good', text: t('dashboard.salesUp', { percent: stats.incomeChange.toFixed(0) }) + ' 🚀' })
      else if (stats.incomeChange < -10)
        msgs.push({ type: 'warn', text: t('dashboard.salesDropped', { percent: Math.abs(stats.incomeChange).toFixed(0) }) })
    }
    if (stats.expenseChange !== null && stats.expenseChange > 20)
      msgs.push({ type: 'warn', text: t('dashboard.expensesRose', { percent: stats.expenseChange.toFixed(0) }) })
    if (stats.profit > 0 && stats.income > 0)
      msgs.push({ type: 'good', text: t('dashboard.profitMargin', { percent: ((stats.profit / stats.income) * 100).toFixed(1) }) })
    else if (stats.income > 0 && stats.profit < 0)
      msgs.push({ type: 'warn', text: t('dashboard.runningAtLoss') })
    if (loanToReceive > 0)
      msgs.push({ type: 'info', text: t('dashboard.pendingCollect', { amount: formatAmount(loanToReceive) }) })
    if (chequeStats.remaining > 0)
      msgs.push({ type: 'info', text: t('dashboard.chequesRemaining', { count: chequeStats.count, amount: formatAmount(chequeStats.remaining) }) })
    if (msgs.length === 0)
      msgs.push({ type: 'info', text: t('dashboard.addTransactionsInsight') })
    return msgs.slice(0, 3)
  }, [stats, loanToReceive, chequeStats, t])

  const getCategoryName = (catId: string) =>
    categories.find(c => c.id === catId)?.name_en || 'Transaction'

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-PK', { day: 'numeric', month: 'short' })

  const isPositiveDay = stats.todayEarning >= 0

  if (!mounted) return null

  // Basic mode — render the simplified shopkeeper dashboard (no sidebar)
  if (viewMode === 'simple') return <SimpleDashboard />

  return (
    <div className="min-h-screen pb-[88px] lg:pb-6 overflow-x-hidden" style={{ background: 'var(--t-page-bg, #F1F5F9)' }}>

      {/* ── DARK HERO — full-bleed bg, content capped at max-w ── */}
      <div className="bg-navy-gradient relative overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 pt-6 sm:pt-10 pb-6 relative overflow-hidden">
        <div className="absolute -top-20 right-0 w-56 h-56 bg-teal/8 rounded-full blur-[70px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-teal/4 rounded-full blur-[50px] pointer-events-none" />

        {/* ── HERO TOP: Welcome + action buttons ── */}
        <div className="relative z-10 mb-5">

          {/* Row 1: Welcome text  +  compact icon buttons (all screen sizes) */}
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-1">{t('dashboard.dashboard')}</p>
              <h1 className="text-2xl font-black text-white leading-tight">
                {t('dashboard.welcomeBack')}{business ? `,` : ''} 👋
              </h1>
              {business && (
                <p className="text-teal font-bold text-base mt-0.5">{business.name}</p>
              )}
            </div>

            {/* Icon-only controls — always visible in top-right */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <ViewModeToggle />
              <ThemeSwitcher />
              
              {/* Language Toggle */}
              <motion.button
                className="h-8 px-2 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-bold transition-all hover:brightness-110"
                style={{ 
                  background: lang === 'ur' ? 'rgba(0,196,180,0.3)' : 'rgba(255,255,255,0.15)', 
                  border: `1px solid ${lang === 'ur' ? 'rgba(0,196,180,0.5)' : 'rgba(255,255,255,0.2)'}`,
                  color: lang === 'ur' ? '#00C4B4' : '#fff',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                }}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.93 }}
                transition={{ duration: 0.15 }}
                onClick={() => setLanguage(lang === 'en' ? 'ur' : 'en')}
              >
                {lang === 'en' ? 'EN' : 'اردو'}
              </motion.button>

              {/* Notification Bell */}
              <motion.button
                className="relative w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 hover:brightness-110"
                style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.93 }}
                transition={{ duration: 0.15 }}
                title="Notifications"
              >
                <Bell size={14} className="text-white" strokeWidth={2} />
                <span
                  className="absolute top-1 right-1 w-[7px] h-[7px] rounded-full border-[1.5px]"
                  style={{ background: '#FF3B5C', borderColor: 'var(--t-hero-from, #0B0F1A)' }}
                />
              </motion.button>

              {/* Close Day + Add — desktop only (inline with icons) */}
              <Link
                href="/close"
                className="hidden lg:flex flex-shrink-0 items-center gap-1.5 px-3 py-2 rounded-xl font-bold text-xs"
                style={{ background: 'rgba(245,158,11,0.15)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.30)' }}
              >
                <Lock size={13} />
                {t('quickActions.closeDay')}
              </Link>
              <Link
                href="/add"
                className="hidden lg:flex flex-shrink-0 items-center gap-1.5 px-3 py-2 rounded-xl font-bold text-xs text-navy btn-teal"
              >
                <TrendingUp size={14} />
                {t('common.add')}
              </Link>
            </div>
          </div>

          {/* Row 2: Close Day + Add — mobile only, below welcome text */}
          <div className="flex lg:hidden items-center gap-2 justify-end">
            <Link
              href="/close"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold text-xs flex-shrink-0"
              style={{ background: 'rgba(245,158,11,0.15)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.30)' }}
            >
              <Lock size={12} />
              {t('quickActions.closeDay')}
            </Link>
            <Link
              href="/add"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold text-xs text-navy btn-teal flex-shrink-0"
            >
              <TrendingUp size={13} />
              {t('common.add')}
            </Link>
          </div>
        </div>

        {/* Total balance / Total wealth */}
        {(() => {
          const inventoryValue = inventoryStats?.total_inventory_value ?? 0
          const showWealth     = hasInventory && inventoryStats !== null
          const displayAmount  = showWealth ? stats.totalBalance + inventoryValue : stats.totalBalance
          return (
            <div className="relative z-10 mb-5">
              <p className="text-white/35 text-[11px] font-semibold uppercase tracking-widest mb-1">
                {showWealth ? t('dashboard.totalWealth') : t('dashboard.totalWealth')}
              </p>
              <div className="flex items-end gap-2">
                <span className="text-white/40 text-2xl font-bold pb-2">Rs.</span>
                <span className="text-6xl font-black text-white tracking-tight">
                  {formatAmount(displayAmount)}
                </span>
              </div>
              {/* Today stats */}
              <div className="flex items-center gap-4 mt-3">
                <div className="flex items-center gap-1.5">
                  {stats.todayEarning >= 0 ? (
                    <TrendingUp size={12} className="text-teal" />
                  ) : (
                    <TrendingDown size={12} className="text-expense" />
                  )}
                  <span className={cn('text-xs font-semibold', stats.todayEarning >= 0 ? 'text-teal' : 'text-expense')}>
                    {t('dashboard.todayEarning', { amount: formatAmount(Math.abs(stats.todayEarning)) })}
                  </span>
                </div>
                {stats.incomeChange !== null && (
                  <div className="flex items-center gap-1">
                    <span className={cn('text-xs font-semibold', stats.incomeChange >= 0 ? 'text-teal' : 'text-expense')}>
                      {stats.incomeChange >= 0 ? '+' : ''}{Math.abs(stats.incomeChange).toFixed(0)}% {t('dashboard.vsLastMonth')}
                    </span>
                  </div>
                )}
              </div>
              {showWealth && (
                <p className="text-[9px] font-semibold mt-2" style={{ color: 'rgba(167,139,250,0.65)' }}>
                  ✦ Balance Rs.{formatAmount(stats.totalBalance)} + Stock Rs.{formatAmount(inventoryValue)}
                </p>
              )}
            </div>
          )
        })()}

        {/* ── WALLET CHIPS ── */}
        {walletBalances.length > 0 && (
          <div className="relative z-10 flex gap-2 mb-5 overflow-x-auto pb-1 scrollbar-none">
            {walletBalances.map(w => (
              <motion.div
                key={w.id}
                className="flex-shrink-0 flex items-center gap-2.5 rounded-full px-4 py-2"
                style={{
                  background:          'rgba(255,255,255,0.07)',
                  border:              '1px solid rgba(255,255,255,0.12)',
                  backdropFilter:      'blur(12px)',
                  WebkitBackdropFilter:'blur(12px)',
                }}
                whileHover={{
                  scale:       1.05,
                  borderColor: 'rgba(0,232,122,0.45)',
                  boxShadow:   '0 4px 18px rgba(0,232,122,0.20)',
                }}
                transition={{ duration: 0.18, ease: [0.16,1,0.3,1] }}
              >
                <span className="text-sm leading-none">{w.icon}</span>
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.10em]"
                    style={{ color: 'rgba(255,255,255,0.32)' }}>
                    {w.name}
                  </p>
                  <p className="text-[13px] font-black leading-tight"
                    style={{ color: w.balance >= 0 ? '#fff' : '#FF3B5C' }}>
                    Rs. {formatAmount(w.balance)}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* ── INCOME / EXPENSE / PROFIT — premium stat cards ── */}
        <div className="relative z-10 grid grid-cols-3 gap-2.5">
          {/* Income */}
          <motion.div
            className="relative rounded-2xl overflow-hidden p-3"
            style={{
              background: 'linear-gradient(135deg, rgba(0,232,122,0.13) 0%, rgba(255,255,255,0.02) 100%)',
              border:     '1px solid rgba(0,232,122,0.26)',
              boxShadow:  '0 2px 12px rgba(0,232,122,0.08)',
            }}
            whileHover={{ y: -4, boxShadow: '0 14px 36px rgba(0,232,122,0.28)' }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.20, ease: [0.16,1,0.3,1] }}
          >
            <div className="absolute inset-0"
              style={{ background: 'radial-gradient(ellipse at 80% 10%, rgba(0,232,122,0.16) 0%, transparent 60%)' }} />
            <div className="relative w-7 h-7 rounded-xl flex items-center justify-center mb-2.5"
              style={{ background: 'rgba(0,232,122,0.18)', border: '1px solid rgba(0,232,122,0.35)' }}>
              <TrendingUp size={13} style={{ color: '#00E87A' }} strokeWidth={2.5} />
            </div>
            <p className="relative text-[9px] font-bold uppercase tracking-[0.12em] mb-1.5"
              style={{ color: 'rgba(255,255,255,0.32)' }}>{t('dashboard.income')}</p>
            <p className="relative text-[15px] font-black leading-none" style={{ color: '#00E87A' }}>
              {formatAmount(stats.income)}
            </p>
            {stats.incomeChange !== null && (
              <p className="relative text-[9px] font-bold mt-1.5"
                style={{ color: stats.incomeChange >= 0 ? '#00E87A' : '#FF3B5C', opacity: 0.78 }}>
                {stats.incomeChange >= 0 ? '▲' : '▼'} {Math.abs(stats.incomeChange).toFixed(0)}%
              </p>
            )}
          </motion.div>

          {/* Expense */}
          <motion.div
            className="relative rounded-2xl overflow-hidden p-3"
            style={{
              background: 'linear-gradient(135deg, rgba(255,59,92,0.13) 0%, rgba(255,255,255,0.02) 100%)',
              border:     '1px solid rgba(255,59,92,0.26)',
              boxShadow:  '0 2px 12px rgba(255,59,92,0.08)',
            }}
            whileHover={{ y: -4, boxShadow: '0 14px 36px rgba(255,59,92,0.26)' }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.20, ease: [0.16,1,0.3,1] }}
          >
            <div className="absolute inset-0"
              style={{ background: 'radial-gradient(ellipse at 80% 10%, rgba(255,59,92,0.16) 0%, transparent 60%)' }} />
            <div className="relative w-7 h-7 rounded-xl flex items-center justify-center mb-2.5"
              style={{ background: 'rgba(255,59,92,0.18)', border: '1px solid rgba(255,59,92,0.35)' }}>
              <TrendingDown size={13} style={{ color: '#FF3B5C' }} strokeWidth={2.5} />
            </div>
            <p className="relative text-[9px] font-bold uppercase tracking-[0.12em] mb-1.5"
              style={{ color: 'rgba(255,255,255,0.32)' }}>{t('dashboard.expense')}</p>
            <p className="relative text-[15px] font-black leading-none" style={{ color: '#FF3B5C' }}>
              {formatAmount(stats.expense)}
            </p>
            {stats.expenseChange !== null && (
              <p className="relative text-[9px] font-bold mt-1.5"
                style={{ color: stats.expenseChange <= 0 ? '#00E87A' : '#FF3B5C', opacity: 0.78 }}>
                {stats.expenseChange >= 0 ? '▲' : '▼'} {Math.abs(stats.expenseChange).toFixed(0)}%
              </p>
            )}
          </motion.div>

          {/* Profit */}
          {(() => {
            const profitHex  = stats.profit >= 0 ? '#00E87A' : '#FF3B5C'
            const profitGlow = stats.profit >= 0 ? 'rgba(0,232,122,' : 'rgba(255,59,92,'
            return (
              <motion.div
                className="relative rounded-2xl overflow-hidden p-3"
                style={{
                  background: `linear-gradient(135deg, ${profitHex}13 0%, rgba(255,255,255,0.02) 100%)`,
                  border:     `1px solid ${profitHex}26`,
                  boxShadow:  `0 2px 12px ${profitGlow}0.08)`,
                }}
                whileHover={{ y: -4, boxShadow: `0 14px 36px ${profitGlow}0.26)` }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.20, ease: [0.16,1,0.3,1] }}
              >
                <div className="absolute inset-0"
                  style={{ background: `radial-gradient(ellipse at 80% 10%, ${profitHex}16 0%, transparent 60%)` }} />
                <div className="relative w-7 h-7 rounded-xl flex items-center justify-center mb-2.5"
                  style={{ background: `${profitHex}18`, border: `1px solid ${profitHex}35` }}>
                  {stats.profit >= 0
                    ? <TrendingUp  size={13} style={{ color: profitHex }} strokeWidth={2.5} />
                    : <TrendingDown size={13} style={{ color: profitHex }} strokeWidth={2.5} />}
                </div>
                <p className="relative text-[9px] font-bold uppercase tracking-[0.12em] mb-1.5"
                  style={{ color: 'rgba(255,255,255,0.32)' }}>{t('dashboard.profit')}</p>
                <p className="relative text-[15px] font-black leading-none" style={{ color: profitHex }}>
                  {formatAmount(Math.abs(stats.profit))}
                </p>
              </motion.div>
            )
          })()}
        </div>
      </div>{/* /max-w inner */}
      </div>{/* /bg-navy-gradient outer */}

      {/* ── LIGHT CONTENT ── */}
      <div className="bg-[#F1F5F9] rounded-t-3xl -mt-4">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 pt-6 pb-10 space-y-6">

        {/* Section A: Financial Overview - Already in hero */}

        {/* Section B: Wallet Overview */}
        <div className="mt-6">
          <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-3">{t('dashboard.walletOverview')}</p>
          <div className="grid grid-cols-3 gap-2 sm:gap-4">

          {/* Loan In */}
          <Link href="/loan" className="block">
            <motion.div
              className="relative rounded-xl overflow-hidden p-3 sm:p-4 h-full cursor-pointer"
              style={{
                background: '#FFFFFF',
                border:     '1px solid #D1D5DB',
                boxShadow:  '0 1px 4px rgba(0,0,0,0.07), 0 4px 16px rgba(0,0,0,0.10)',
              }}
              whileHover={{ y: -2, scale: 1.01, boxShadow: '0 8px 24px rgba(0,0,0,0.14)' }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.20 }}
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-emerald-500/10">
                  <HandCoins size={14} className="text-emerald-500" />
                </div>
                <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">{t('dashboard.toReceive')}</p>
              </div>
              <p className="text-[16px] font-bold text-emerald-400">
                Rs. {formatAmount(loanToReceive)}
              </p>
              {loanToGive > 0 && (
                <p className="text-[10px] mt-1.5 text-red-400">
                  {t('dashboard.out')}: Rs. {formatAmount(loanToGive)}
                </p>
              )}
            </motion.div>
          </Link>

          {/* Cash */}
          <motion.div
            className="relative rounded-xl overflow-hidden p-3 sm:p-4"
            style={{
              background: '#FFFFFF',
              border:     '1px solid #D1D5DB',
              boxShadow:  '0 1px 4px rgba(0,0,0,0.07), 0 4px 16px rgba(0,0,0,0.10)',
            }}
            whileHover={{ y: -2, scale: 1.01, boxShadow: '0 8px 24px rgba(0,0,0,0.14)' }}
            transition={{ duration: 0.20 }}
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-blue-500/10">
                <Wallet size={14} className="text-blue-500" />
              </div>
              <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">{t('dashboard.cash')}</p>
            </div>
            {walletBalances.filter(w => w.type === 'cash').slice(0, 1).map(w => (
              <p key={w.id} className="text-[16px] font-bold" style={{ color: w.balance >= 0 ? '#1F2937' : '#FF3B5C' }}>
                Rs. {formatAmount(w.balance)}
              </p>
            ))}
            {walletBalances.filter(w => w.type === 'cash').length === 0 && (
              <p className="text-[16px] font-bold text-gray-900">Rs. 0</p>
            )}
          </motion.div>

          {/* Cheque */}
          <Link href="/checks" className="block">
            <motion.div
              className="relative rounded-xl overflow-hidden p-3 sm:p-4 h-full cursor-pointer"
              style={{
                background: '#FFFFFF',
                border:     '1px solid #D1D5DB',
                boxShadow:  '0 1px 4px rgba(0,0,0,0.07), 0 4px 16px rgba(0,0,0,0.10)',
              }}
              whileHover={{ y: -2, scale: 1.01, boxShadow: '0 8px 24px rgba(0,0,0,0.14)' }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.20 }}
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-amber-500/10">
                  <ReceiptText size={14} className="text-amber-500" />
                </div>
                <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">{t('dashboard.toGive')}</p>
              </div>
              <p className="text-[16px] font-bold text-amber-400">
                Rs. {formatAmount(chequeStats.remaining)}
              </p>
              {chequeStats.count > 0 && (
                <p className="text-[10px] mt-1.5 text-gray-500">
                  {chequeStats.count} {t('dashboard.active')}
                </p>
              )}
            </motion.div>
          </Link>
          </div>
        </div>

        {/* ── INVENTORY STOCK (pro) ── */}
        {hasInventory && inventoryStats && (
          <Link href="/inventory" className="block mt-6">
            <motion.div
              className="relative rounded-xl overflow-hidden p-5 cursor-pointer"
              style={{
                background: '#FFFFFF',
                border:     '1px solid #D1D5DB',
                boxShadow:  '0 1px 4px rgba(0,0,0,0.07), 0 4px 16px rgba(0,0,0,0.10)',
              }}
              whileHover={{ y: -2, scale: 1.01, boxShadow: '0 8px 24px rgba(0,0,0,0.14)' }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.20 }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-teal/10">
                    <Package size={18} className="text-teal" />
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">{t('dashboard.inventoryStock')}</p>
                    <p className="text-[15px] font-bold text-gray-900 mt-0.5">
                      Rs. {formatAmount(inventoryStats.total_inventory_value)}
                    </p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-gray-300" />
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-[12px] text-gray-500">
                    {inventoryStats.active_products} {t('dashboard.productsInStock')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] font-bold text-emerald-500">
                    +Rs. {formatAmount(inventoryStats.potential_profit)}
                  </p>
                  <p className="text-[9px] font-semibold text-gray-400">{t('dashboard.potentialProfit')}</p>
                </div>
              </div>
            </motion.div>
          </Link>
        )}

        {/* AI Insights - Only show if there are meaningful insights */}
        <div className="mt-6">
          <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-3">{t('dashboard.businessInsights')}</p>
          <div
            className="rounded-xl p-5"
            style={{ background: '#FFFFFF', border: '1px solid #D1D5DB', boxShadow: '0 1px 4px rgba(0,0,0,0.07), 0 4px 16px rgba(0,0,0,0.10)' }}
          >
            {insights.length === 1 && insights[0].text.includes('Add transactions') ? (
              <div className="text-center py-4">
                <div className="w-12 h-12 rounded-xl bg-teal/10 flex items-center justify-center mx-auto mb-3">
                  <Sparkles size={20} className="text-teal" />
                </div>
                <p className="text-[13px] text-gray-600 mb-3">{t('dashboard.startTracking')}</p>
                <Link 
                  href="/add" 
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold bg-teal text-navy hover:brightness-110 transition-all"
                >
                  <TrendingUp size={14} />
                  {t('dashboard.addFirstTransaction')}
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {insights.map((insight, i) => (
                  <div key={i} className="flex items-start gap-3">
                    {insight.type === 'good'
                      ? <CheckCircle size={14} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                      : insight.type === 'warn'
                        ? <AlertCircle size={14} className="text-amber-400 flex-shrink-0 mt-0.5" />
                        : <Info size={14} className="text-teal flex-shrink-0 mt-0.5" />}
                    <p className="text-[13px] text-gray-700 leading-snug">{insight.text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-6">
          <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-3">{t('dashboard.quickActions')}</p>
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {([
              /* ── Primary row ── */
              { href: '/add?type=income',   icon: TrendingUp,     label: t('dashboard.income'),    hex: '#00E87A', glow: 'rgba(0,232,122,0.35)',    primary: true,  prominent: true },
              { href: '/add?type=expense',  icon: TrendingDown,   label: t('dashboard.expense'),   hex: '#FF3B5C', glow: 'rgba(255,59,92,0.28)',    primary: true,  prominent: false },
              { href: '/add?type=transfer', icon: ArrowRightLeft, label: t('quickActions.transfer'),  hex: '#4F9EFF', glow: 'rgba(79,158,255,0.28)',   primary: true,  prominent: false },
              /* ── Secondary row ── */
              { href: '/records',           icon: FileText,       label: t('transactions.records'),   hex: '#64748B', glow: 'rgba(100,116,139,0.20)',  primary: false, prominent: false },
              { href: '/customers',         icon: Users,          label: t('customers.customers'), hex: '#8B5CF6', glow: 'rgba(139,92,246,0.24)',   primary: false, prominent: false },
              { href: '/checks',            icon: ShoppingBag,    label: t('dashboard.checks'),    hex: '#F5A623', glow: 'rgba(245,166,35,0.24)',   primary: false, prominent: false },
            ] as const).map((action, idx) => {
              const Icon = action.icon
              return (
                <Link key={idx} href={action.href}>
                  <motion.div
                    className="relative flex flex-col items-center overflow-hidden rounded-2xl cursor-pointer"
                    style={{
                      padding:    action.primary ? '18px 12px 15px' : '14px 10px 12px',
                      background: action.prominent
                        ? `linear-gradient(135deg, ${action.hex}18 0%, #FFFFFF 100%)`
                        : '#FFFFFF',
                      border:     action.prominent
                        ? `1px solid ${action.hex}45`
                        : '1px solid #D1D5DB',
                      boxShadow:  action.prominent
                        ? `0 2px 12px ${action.hex}25, 0 4px 16px rgba(0,0,0,0.10)`
                        : '0 1px 4px rgba(0,0,0,0.07), 0 4px 16px rgba(0,0,0,0.10)',
                      gap:        action.primary ? '12px' : '8px',
                    }}
                    whileHover={{
                      y:         -2,
                      scale:     1.02,
                      boxShadow: `0 8px 28px ${action.glow}, 0 4px 16px rgba(0,0,0,0.12)`,
                      borderColor: `${action.hex}60`,
                    }}
                    whileTap={{ scale: 0.97 }}
                    transition={{ duration: 0.20, ease: [0.16, 1, 0.3, 1] }}
                  >
                    {/* Top color bar */}
                    <div className="absolute top-0 left-0 right-0 h-[2.5px]"
                      style={{ background: `linear-gradient(90deg, transparent, ${action.hex}CC, transparent)` }} />

                    {/* Radial tint from top */}
                    <div className="absolute inset-0"
                      style={{ background: `radial-gradient(ellipse at 50% -20%, ${action.hex}12 0%, transparent 62%)` }} />

                    {/* Icon badge */}
                    <div
                      className="relative flex items-center justify-center rounded-xl flex-shrink-0"
                      style={{
                        width:      action.primary ? '40px' : '34px',
                        height:     action.primary ? '40px' : '34px',
                        background: `${action.hex}16`,
                        border:     `1px solid ${action.hex}30`,
                      }}>
                      <Icon
                        size={action.primary ? 20 : 16}
                        style={{ color: action.hex }}
                        strokeWidth={2.2}
                      />
                    </div>

                    {/* Label */}
                    <span
                      className="relative font-bold tracking-wide leading-none"
                      style={{
                        fontSize: action.primary ? '11px' : '10px',
                        color:    '#374151',
                      }}>
                      {action.label}
                    </span>
                  </motion.div>
                </Link>
              )
            })}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">{t('dashboard.recentTransactions')}</p>
            <Link href="/records" className="text-[10px] font-semibold text-teal flex items-center gap-0.5 hover:gap-1 transition-all">
              {t('dashboard.viewAll')} <ChevronRight size={10} />
            </Link>
          </div>
          <div
            className="rounded-xl overflow-hidden"
            style={{ background: '#FFFFFF', border: '1px solid #D1D5DB', boxShadow: '0 1px 4px rgba(0,0,0,0.07), 0 4px 16px rgba(0,0,0,0.10)' }}
          >
            {recentTransactions.length === 0 ? (
              <div className="py-10 text-center">
                <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center mx-auto mb-3">
                  <FileText size={24} className="text-gray-400" />
                </div>
                <p className="text-[13px] text-gray-500 mb-3">{t('dashboard.noTransactions')}</p>
                <Link href="/add" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold bg-teal text-navy hover:brightness-110 transition-all">
                  <TrendingUp size={14} />
                  {t('dashboard.addFirstTransaction')}
                </Link>
              </div>
            ) : (
              recentTransactions.map((tx, i) => {
                const isIncome  = ['income', 'advance_received'].includes(tx.type)
                const isExpense = tx.type === 'expense'
                return (
                  <motion.div
                    key={tx.id}
                    className={cn('flex items-center justify-between px-3 sm:px-5 py-3 sm:py-4 hover:bg-gray-50', i > 0 && 'border-t border-gray-100')}
                    whileHover={{ backgroundColor: 'rgba(0,0,0,0.02)' }}
                    transition={{ duration: 0.15 }}
                  >
                    <div className="flex items-center gap-3">
                      <motion.div
                        className={cn(
                          'w-10 h-10 rounded-xl flex items-center justify-center',
                          isIncome ? 'bg-emerald-500/10' : isExpense ? 'bg-red-500/10' : 'bg-teal/10'
                        )}
                        whileHover={{ scale: 1.08 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                      >
                        {isIncome
                          ? <TrendingUp  size={16} className="text-emerald-500"  />
                          : isExpense
                            ? <TrendingDown size={16} className="text-red-500" />
                            : <ArrowRightLeft size={16} className="text-teal" />}
                      </motion.div>
                      <div>
                        <p className="text-[14px] font-semibold text-gray-900">{getCategoryName(tx.category_id)}</p>
                        <p className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
                          <Calendar size={10} />
                          {formatDate(tx.date)}
                        </p>
                      </div>
                    </div>
                    <p className={cn('font-bold text-[15px]', isIncome ? 'text-emerald-500' : isExpense ? 'text-red-500' : 'text-teal')}>
                      {isIncome ? '+' : isExpense ? '−' : ''}Rs. {formatAmount(tx.amount)}
                    </p>
                  </motion.div>
                )
              })
            )}
          </div>
        </div>

      </div>
      </div>
    </div>
  )
}
