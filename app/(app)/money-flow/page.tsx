'use client'
import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns'
import { useTransactionStore } from '@/lib/store/transaction.store'
import { useSettingsStore } from '@/lib/store/settings.store'
import { getAllWalletsFlow, getCategoryFlow } from '@/lib/utils/money-flow'
import { formatAmount } from '@/lib/utils/currency'
import { cn } from '@/lib/utils/cn'
import { ArrowRight, TrendingUp, TrendingDown, Calendar } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { TransferSummary } from '@/components/dashboard/TransferSummary'

type Period = 'this-month' | 'last-month' | 'last-3-months'

export default function MoneyFlowPage() {
  const transactions = useTransactionStore(s => s.transactions)
  const { wallets, categories } = useSettingsStore()
  const [period, setPeriod] = useState<Period>('this-month')

  const { startDate, endDate } = useMemo(() => {
    const now = new Date()
    switch (period) {
      case 'this-month':
        return {
          startDate: format(startOfMonth(now), 'yyyy-MM-dd'),
          endDate: format(endOfMonth(now), 'yyyy-MM-dd'),
        }
      case 'last-month':
        const lastMonth = subMonths(now, 1)
        return {
          startDate: format(startOfMonth(lastMonth), 'yyyy-MM-dd'),
          endDate: format(endOfMonth(lastMonth), 'yyyy-MM-dd'),
        }
      case 'last-3-months':
        return {
          startDate: format(subMonths(now, 3), 'yyyy-MM-dd'),
          endDate: format(now, 'yyyy-MM-dd'),
        }
    }
  }, [period])

  const walletsFlow = useMemo(() => 
    getAllWalletsFlow(transactions, wallets, startDate, endDate),
    [transactions, wallets, startDate, endDate]
  )

  const incomeFlow = useMemo(() =>
    getCategoryFlow(transactions, categories, 'income', startDate, endDate),
    [transactions, categories, startDate, endDate]
  )

  const expenseFlow = useMemo(() =>
    getCategoryFlow(transactions, categories, 'expense', startDate, endDate),
    [transactions, categories, startDate, endDate]
  )

  const totalIncome = incomeFlow.reduce((sum, c) => sum + c.amount, 0)
  const totalExpense = expenseFlow.reduce((sum, c) => sum + c.amount, 0)
  const netFlow = totalIncome - totalExpense

  return (
    <div className="min-h-screen pb-24" style={{ background: 'var(--t-page-bg)' }}>
      <PageHeader title="Money Flow" titleUr="پیسے کی نقل و حرکت" backTo="/dashboard" />
      <div className="px-4 pt-4 pb-4">

        {/* Period Selector */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {[
            { value: 'this-month' as Period, label: 'This Month', labelUr: 'اس ماہ' },
            { value: 'last-month' as Period, label: 'Last Month', labelUr: 'پچھلا ماہ' },
            { value: 'last-3-months' as Period, label: 'Last 3 Months', labelUr: '3 ماہ' },
          ].map(p => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={cn(
                'px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all',
                period === p.value
                  ? 'bg-gradient-to-r from-teal to-cyan-400 text-navy'
                  : 'bg-white/5 border border-white/10'
              )}
              style={period !== p.value ? { color: 'var(--t-text-secondary)' } : {}}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl p-4 border"
            style={{ background: 'var(--t-card-bg)', borderColor: 'var(--t-card-border)' }}
          >
            <div className="flex items-center gap-1 mb-2">
              <TrendingUp size={14} className="text-income" />
              <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--t-muted)' }}>
                In
              </p>
            </div>
            <p className="text-lg font-black text-income">
              Rs. {formatAmount(totalIncome)}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="rounded-2xl p-4 border"
            style={{ background: 'var(--t-card-bg)', borderColor: 'var(--t-card-border)' }}
          >
            <div className="flex items-center gap-1 mb-2">
              <TrendingDown size={14} className="text-expense" />
              <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--t-muted)' }}>
                Out
              </p>
            </div>
            <p className="text-lg font-black text-expense">
              Rs. {formatAmount(totalExpense)}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-2xl p-4 border"
            style={{ background: 'var(--t-card-bg)', borderColor: 'var(--t-card-border)' }}
          >
            <div className="flex items-center gap-1 mb-2">
              <Calendar size={14} className="text-teal" />
              <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--t-muted)' }}>
                Net
              </p>
            </div>
            <p className={cn('text-lg font-black', netFlow >= 0 ? 'text-income' : 'text-expense')}>
              Rs. {formatAmount(Math.abs(netFlow))}
            </p>
          </motion.div>
        </div>

        {/* Wallet Flow Cards */}
        <div className="space-y-4 mb-6">
          <h2 className="text-lg font-bold" style={{ color: 'var(--t-text)' }}>
            Wallet Activity
          </h2>
          {walletsFlow.map((flow, i) => (
            <motion.div
              key={flow.walletId}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.05 }}
              className="rounded-2xl p-4 border"
              style={{ background: 'var(--t-card-bg)', borderColor: 'var(--t-card-border)' }}
            >
              <h3 className="text-base font-bold mb-3" style={{ color: 'var(--t-text)' }}>
                {flow.walletName}
              </h3>

              <div className="grid grid-cols-3 gap-3 mb-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--t-muted)' }}>
                    Money In
                  </p>
                  <p className="text-sm font-bold text-income">
                    Rs. {formatAmount(flow.totalIn)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--t-muted)' }}>
                    Money Out
                  </p>
                  <p className="text-sm font-bold text-expense">
                    Rs. {formatAmount(flow.totalOut)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--t-muted)' }}>
                    Net Flow
                  </p>
                  <p className={cn('text-sm font-bold', flow.netFlow >= 0 ? 'text-income' : 'text-expense')}>
                    Rs. {formatAmount(Math.abs(flow.netFlow))}
                  </p>
                </div>
              </div>

              {/* Transfers */}
              {flow.transfers.length > 0 && (
                <div className="pt-3 border-t" style={{ borderColor: 'var(--t-card-border)' }}>
                  <p className="text-xs font-bold mb-2" style={{ color: 'var(--t-text-secondary)' }}>
                    Recent Transfers ({flow.transfers.length})
                  </p>
                  <div className="space-y-2">
                    {flow.transfers.slice(0, 3).map((transfer) => (
                      <div
                        key={transfer.id}
                        className="flex items-center justify-between py-2 px-3 rounded-lg"
                        style={{ background: 'var(--t-page-bg)' }}
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <span className="text-xs font-semibold truncate" style={{ color: 'var(--t-text)' }}>
                            {transfer.from}
                          </span>
                          <ArrowRight size={12} style={{ color: 'var(--t-muted)' }} className="flex-shrink-0" />
                          <span className="text-xs font-semibold truncate" style={{ color: 'var(--t-text)' }}>
                            {transfer.to}
                          </span>
                        </div>
                        <span className="text-sm font-bold text-teal ml-2">
                          Rs. {formatAmount(transfer.amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Transfer Summary */}
        <div className="mb-6">
          <TransferSummary />
        </div>

        {/* Category Breakdown */}
        <div className="space-y-4">
          {/* Income Categories */}
          {incomeFlow.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="rounded-2xl p-4 border"
              style={{ background: 'var(--t-card-bg)', borderColor: 'var(--t-card-border)' }}
            >
              <h3 className="text-base font-bold mb-3" style={{ color: 'var(--t-text)' }}>
                Income Sources
              </h3>
              <div className="space-y-2">
                {incomeFlow.slice(0, 5).map((cat) => (
                  <div key={cat.categoryId} className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-semibold" style={{ color: 'var(--t-text)' }}>
                        {cat.categoryName}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--t-muted)' }}>
                        {cat.count} transactions
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-income">
                        Rs. {formatAmount(cat.amount)}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--t-muted)' }}>
                        {cat.percentage.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Expense Categories */}
          {expenseFlow.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 }}
              className="rounded-2xl p-4 border"
              style={{ background: 'var(--t-card-bg)', borderColor: 'var(--t-card-border)' }}
            >
              <h3 className="text-base font-bold mb-3" style={{ color: 'var(--t-text)' }}>
                Expense Breakdown
              </h3>
              <div className="space-y-2">
                {expenseFlow.slice(0, 5).map((cat) => (
                  <div key={cat.categoryId} className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-semibold" style={{ color: 'var(--t-text)' }}>
                        {cat.categoryName}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--t-muted)' }}>
                        {cat.count} transactions
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-expense">
                        Rs. {formatAmount(cat.amount)}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--t-muted)' }}>
                        {cat.percentage.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
