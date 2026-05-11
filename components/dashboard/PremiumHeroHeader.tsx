'use client'
import { motion } from 'framer-motion'
import { formatAmount } from '@/lib/utils/currency'
import { cn } from '@/lib/utils/cn'

interface PremiumHeroHeaderProps {
  businessName: string
  totalBalance: number
  todayEarning: number
  todayIncome: number
  todayExpense: number
  sparklineData: number[]
}

export function PremiumHeroHeader({
  businessName,
  totalBalance,
  todayEarning,
  todayIncome,
  todayExpense,
  sparklineData,
}: PremiumHeroHeaderProps) {
  const maxValue = Math.max(...sparklineData, 1)
  const normalizedData = sparklineData.map(v => (v / maxValue) * 100)

  return (
    <div className="relative px-4 pt-6 pb-8 overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full blur-[120px]" style={{ background: 'rgba(0,196,180,0.15)' }} />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full blur-[120px]" style={{ background: 'rgba(0,196,180,0.08)' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10"
      >
        {/* Greeting */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="text-sm font-medium text-white/60 mb-2"
        >
          Welcome back, {businessName} 👋
        </motion.p>

        {/* Main Balance - Premium Typography */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.5 }}
          className="mb-8"
        >
          <p className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-1">Total Balance</p>
          <h1 className="text-6xl font-black text-white tracking-tight" style={{ letterSpacing: '-0.02em' }}>
            Rs. {formatAmount(totalBalance)}
          </h1>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="grid grid-cols-3 gap-3 mb-8"
        >
          {[
            { label: 'Today Income', value: todayIncome, color: 'from-income/20 to-income/5', textColor: 'text-income' },
            { label: 'Today Expense', value: todayExpense, color: 'from-expense/20 to-expense/5', textColor: 'text-expense' },
            { label: 'Net Earning', value: todayEarning, color: 'from-teal/20 to-teal/5', textColor: 'text-teal' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 + i * 0.05, duration: 0.4 }}
              className={cn(
                'rounded-2xl p-4 backdrop-blur-sm border border-white/10',
                `bg-gradient-to-br ${stat.color}`
              )}
            >
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/50 mb-2">{stat.label}</p>
              <p className={cn('text-lg font-black', stat.textColor)}>
                Rs. {formatAmount(stat.value)}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Mini Sparkline Chart */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="flex items-end justify-between gap-1 h-12 p-4 rounded-2xl bg-white/5 border border-white/10"
        >
          {normalizedData.map((value, i) => (
            <motion.div
              key={i}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: `${Math.max(value, 8)}%`, opacity: 1 }}
              transition={{ delay: 0.35 + i * 0.04, duration: 0.5, ease: 'easeOut' }}
              className="flex-1 rounded-t-sm bg-gradient-to-t from-teal to-cyan-400 min-h-1"
              style={{ boxShadow: '0 0 12px rgba(0,196,180,0.4)' }}
            />
          ))}
        </motion.div>
      </motion.div>
    </div>
  )
}
