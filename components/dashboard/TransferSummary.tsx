'use client'
import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, TrendingUp } from 'lucide-react'
import { useTransactionStore } from '@/lib/store/transaction.store'
import { useSettingsStore } from '@/lib/store/settings.store'
import { getTransferSummary } from '@/lib/utils/money-flow'
import { formatAmount } from '@/lib/utils/currency'
import { format, startOfMonth, endOfMonth } from 'date-fns'

export function TransferSummary() {
  const transactions = useTransactionStore(s => s.transactions)
  const wallets = useSettingsStore(s => s.wallets)

  const summary = useMemo(() => {
    const now = new Date()
    const start = format(startOfMonth(now), 'yyyy-MM-dd')
    const end = format(endOfMonth(now), 'yyyy-MM-dd')
    return getTransferSummary(transactions, wallets, start, end)
  }, [transactions, wallets])

  if (summary.transferCount === 0) {
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="rounded-2xl p-4 border"
      style={{ background: 'var(--t-card-bg)', borderColor: 'var(--t-card-border)' }}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--t-muted)' }}>
            Transfers This Month
          </p>
          <p className="font-urdu text-[10px] mt-0.5" style={{ color: 'var(--t-muted)' }}>
            اس ماہ کی منتقلی
          </p>
        </div>
        <div className="flex items-center gap-2">
          <TrendingUp size={16} className="text-teal" />
          <span className="text-xs font-bold" style={{ color: 'var(--t-text-secondary)' }}>
            {summary.transferCount} transfers
          </span>
        </div>
      </div>

      {/* Total Transferred */}
      <div className="mb-4">
        <p className="text-2xl font-black text-teal">
          Rs. {formatAmount(summary.totalTransferred)}
        </p>
        <p className="text-xs" style={{ color: 'var(--t-muted)' }}>
          Total amount moved between wallets
        </p>
      </div>

      {/* Top Routes */}
      {summary.topRoutes.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-bold" style={{ color: 'var(--t-text-secondary)' }}>
            Top Transfer Routes
          </p>
          {summary.topRoutes.slice(0, 3).map((route, i) => (
            <motion.div
              key={route.route}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + i * 0.05 }}
              className="flex items-center justify-between py-2 px-3 rounded-lg"
              style={{ background: 'var(--t-page-bg)' }}
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <span className="text-xs font-semibold truncate" style={{ color: 'var(--t-text)' }}>
                  {route.route.split(' → ')[0]}
                </span>
                <ArrowRight size={12} style={{ color: 'var(--t-muted)' }} className="flex-shrink-0" />
                <span className="text-xs font-semibold truncate" style={{ color: 'var(--t-text)' }}>
                  {route.route.split(' → ')[1]}
                </span>
              </div>
              <div className="text-right ml-2">
                <p className="text-sm font-bold text-teal">
                  Rs. {formatAmount(route.amount)}
                </p>
                <p className="text-[10px]" style={{ color: 'var(--t-muted)' }}>
                  {route.count}x
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* View All Link */}
      <div className="mt-4 pt-3 border-t" style={{ borderColor: 'var(--t-card-border)' }}>
        <a
          href="/money-flow"
          className="text-xs font-semibold text-teal hover:text-cyan-400 transition-colors flex items-center gap-1"
        >
          View detailed money flow
          <ArrowRight size={12} />
        </a>
      </div>
    </motion.div>
  )
}
