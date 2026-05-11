'use client'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Bell, Building2 } from 'lucide-react'
import { AnimatedNumber } from './AnimatedNumber'
import { SparklineChart } from './SparklineChart'
import { ThemeSwitcher } from './ThemeSwitcher'
import { PlanBadge } from './PlanBadge'
import { cn } from '@/lib/utils/cn'
import Link from 'next/link'

interface WalletChip {
  id: string
  name: string
  type: string
  balance: number
  color: { bg: string; text: string; border: string }
}

interface BalanceCardProps {
  businessName: string
  plan?: 'starter' | 'growth' | 'business' | 'pro'
  totalBalance: number
  cashBalance?: number
  inventoryValue?: number
  hasInventory?: boolean
  todayEarning: number
  todayIncome: number
  todayExpense: number
  sparklineData: number[]
  wallets: WalletChip[]
  showBusinessSwitcher?: boolean
  businessCount?: number
  accentColor?: string
}

const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.4, ease: [0.16, 1, 0.3, 1] },
  }),
}

export function BalanceCard({
  businessName,
  plan = 'starter',
  totalBalance,
  cashBalance,
  inventoryValue = 0,
  hasInventory = false,
  todayEarning,
  todayIncome,
  todayExpense,
  sparklineData,
  wallets,
  showBusinessSwitcher = false,
  businessCount = 1,
  accentColor = '#00C4B4',
}: BalanceCardProps) {
  const isUp = todayEarning >= 0

  return (
    <div
      className="relative overflow-hidden"
      style={{
        background: `linear-gradient(160deg, var(--t-hero-from) 0%, var(--t-hero-mid) 55%, var(--t-hero-to) 100%)`,
      }}
    >
      {/* Ambient glow orbs */}
      <div
        className="absolute -top-20 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full pointer-events-none"
        style={{ background: `${accentColor}12`, filter: 'blur(80px)' }}
      />
      <div
        className="absolute bottom-0 -right-12 w-48 h-48 rounded-full pointer-events-none"
        style={{ background: `${accentColor}08`, filter: 'blur(60px)' }}
      />

      {/* Noise grain texture */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.025]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Top bar */}
      <motion.div
        className="relative z-10 flex items-center justify-between px-5 pt-12 pb-2"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        <div className="flex-1 min-w-0">
          <p className="text-white/35 text-[10px] font-bold tracking-[0.15em] uppercase mb-0.5">CashIQ</p>
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-white text-[15px] font-bold truncate max-w-[160px]">
              {businessName}
            </p>
            <PlanBadge plan={plan} />
          </div>
        </div>

        <div className="flex items-center gap-2">
          {showBusinessSwitcher && businessCount > 1 && (
            <Link href="/businesses"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl"
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}>
              <Building2 size={11} className="text-white/60" />
              <span className="text-[10px] font-bold text-white/60">Switch</span>
            </Link>
          )}
          <ThemeSwitcher />
          <button
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.10)' }}
          >
            <Bell size={16} className="text-white/65" />
          </button>
        </div>
      </motion.div>

      {/* Balance + chart row */}
      <motion.div
        className="relative z-10 px-5 pt-6 pb-3"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
      >
        <p className="text-white/35 text-[10px] font-semibold uppercase tracking-[0.12em] mb-2">
          {hasInventory ? 'Total Wealth · کل دولت' : 'Total Balance · کل پیسہ'}
        </p>
        <div className="flex items-end justify-between gap-4">
          <div>
            <div className="flex items-end gap-2 mb-1">
              <span className="text-white/45 text-lg font-semibold pb-0.5">Rs.</span>
              <AnimatedNumber
                value={totalBalance}
                duration={1.1}
                className="text-[42px] font-black text-white leading-none tracking-tight"
              />
            </div>
            {/* Wealth Breakdown */}
            {hasInventory && cashBalance !== undefined && (
              <div className="flex items-center gap-2 mb-1">
                <span className="text-white/40 text-[11px] font-medium">
                  Cash: Rs. {cashBalance.toLocaleString()}
                </span>
                <span className="text-white/20">•</span>
                <span className="text-white/40 text-[11px] font-medium">
                  Stock: Rs. {inventoryValue.toLocaleString()}
                </span>
              </div>
            )}
            {/* Today's change indicator */}
            <div className="flex items-center gap-1.5">
              <div className={cn(
                'flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold',
                isUp ? 'bg-income/20 text-income' : 'bg-expense/20 text-expense'
              )}>
                {isUp
                  ? <TrendingUp size={11} strokeWidth={2.5} />
                  : <TrendingDown size={11} strokeWidth={2.5} />}
                <AnimatedNumber
                  value={Math.abs(todayEarning)}
                  prefix={isUp ? '+Rs. ' : '-Rs. '}
                  className="font-bold"
                />
              </div>
              <span className="text-white/30 text-[10px]">today</span>
            </div>
          </div>

          {/* Mini sparkline */}
          {sparklineData.length > 1 && (
            <div className="w-28 h-12 opacity-70">
              <SparklineChart data={sparklineData} color={accentColor} height={48} />
            </div>
          )}
        </div>
      </motion.div>

      {/* Today breakdown */}
      {(todayIncome > 0 || todayExpense > 0) && (
        <motion.div
          className="relative z-10 mx-5 mb-3 px-3 py-2 rounded-xl flex gap-4"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-income flex-shrink-0" />
            <span className="text-[11px] text-white/50">In</span>
            <AnimatedNumber value={todayIncome} prefix="Rs. " className="text-[12px] font-bold text-income" />
          </div>
          <div className="w-px bg-white/10" />
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-expense flex-shrink-0" />
            <span className="text-[11px] text-white/50">Out</span>
            <AnimatedNumber value={todayExpense} prefix="Rs. " className="text-[12px] font-bold text-expense" />
          </div>
        </motion.div>
      )}

      {/* Wallet chips */}
      <div className="relative z-10 px-5 pb-6 flex gap-2.5 overflow-x-auto scrollbar-none">
        {wallets.map((w, i) => (
          <motion.div
            key={w.id}
            custom={i}
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            className="flex-shrink-0 rounded-[14px] px-3.5 py-2.5 min-w-[120px]"
            style={{ background: w.color.bg, border: `1px solid ${w.color.border}` }}
          >
            <p className="text-[10px] font-semibold mb-1.5" style={{ color: w.color.text, opacity: 0.65 }}>
              {w.name}
            </p>
            <p className="text-[14px] font-black" style={{ color: w.color.text }}>
              <AnimatedNumber value={w.balance} prefix="Rs. " />
            </p>
          </motion.div>
        ))}
        {wallets.length === 0 && (
          <p className="text-white/25 text-xs py-2">No wallets enabled</p>
        )}
      </div>
    </div>
  )
}
