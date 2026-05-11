'use client'
import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts'
import { format, eachDayOfInterval, parseISO, subMonths, startOfMonth, endOfMonth } from 'date-fns'
import { useTransactionStore } from '@/lib/store/transaction.store'
import { useSettingsStore }    from '@/lib/store/settings.store'
import { formatAmount }        from '@/lib/utils/currency'
import { getAllWalletsFlow, getCategoryFlow } from '@/lib/utils/money-flow'
import { cn }                  from '@/lib/utils/cn'
import { TrendingUp, TrendingDown, ArrowLeftRight, ArrowRight, Minus } from 'lucide-react'
import type { DateRange } from './types'

interface Props { range: DateRange; bid?: string }

type Period = 'thisMonth' | 'lastMonth' | 'last3'

const PERIODS: { id: Period; label: string }[] = [
  { id: 'thisMonth', label: 'This Month' },
  { id: 'lastMonth', label: 'Last Month' },
  { id: 'last3',     label: 'Last 3 Months' },
]

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl px-3 py-2 text-xs shadow-xl"
      style={{ background: 'var(--t-card-bg)', border: '1px solid var(--t-card-border)' }}>
      <p className="font-bold mb-1" style={{ color: 'var(--t-text)' }}>{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} className="mb-0.5" style={{ color: p.color ?? p.fill }}>
          {p.name}: Rs. {formatAmount(p.value)}
        </p>
      ))}
    </div>
  )
}

export function MoneyFlowTab({ range, bid }: Props) {
  const { transactions, wallets: _wallets } = useTransactionStore() as any
  const { categories, wallets } = useSettingsStore()

  const [period, setPeriod] = useState<Period>('thisMonth')

  const { startDate, endDate } = useMemo(() => {
    const now = new Date()
    switch (period) {
      case 'thisMonth': return { startDate: format(startOfMonth(now), 'yyyy-MM-dd'), endDate: format(endOfMonth(now), 'yyyy-MM-dd') }
      case 'lastMonth': { const lm = subMonths(now, 1); return { startDate: format(startOfMonth(lm), 'yyyy-MM-dd'), endDate: format(endOfMonth(lm), 'yyyy-MM-dd') } }
      case 'last3':     return { startDate: format(startOfMonth(subMonths(now, 2)), 'yyyy-MM-dd'), endDate: format(endOfMonth(now), 'yyyy-MM-dd') }
    }
  }, [period])

  const walletsFlow = useMemo(() =>
    getAllWalletsFlow(transactions, wallets, startDate, endDate),
    [transactions, wallets, startDate, endDate]
  )

  const incFlow = useMemo(() =>
    getCategoryFlow(transactions, categories, 'income',  startDate, endDate),
    [transactions, categories, startDate, endDate]
  )
  const expFlow = useMemo(() =>
    getCategoryFlow(transactions, categories, 'expense', startDate, endDate),
    [transactions, categories, startDate, endDate]
  )

  const totalIn  = incFlow.reduce((s, c) => s + c.amount, 0)
  const totalOut = expFlow.reduce((s, c) => s + c.amount, 0)
  const netFlow  = totalIn - totalOut

  // Daily inflow/outflow area chart
  const dailyData = useMemo(() => {
    try {
      const start = parseISO(startDate)
      const end   = parseISO(endDate)
      const diffDays = (end.getTime() - start.getTime()) / 86400000 + 1
      if (diffDays > 93) return []
      const txns = transactions.filter((t: any) =>
        !t.is_reversed && !t.is_deleted &&
        t.date >= startDate && t.date <= endDate &&
        (!bid || !t.business_id || t.business_id === bid)
      )
      return eachDayOfInterval({ start, end })
        .filter((_, i) => diffDays <= 31 || i % 7 === 0)
        .map(d => {
          const key = format(d, 'yyyy-MM-dd')
          const lbl = diffDays <= 14 ? format(d, 'MMM d') : format(d, 'MMM d')
          return {
            label: lbl,
            inflow:  txns.filter((t: any) => t.type === 'income'  && t.date === key).reduce((s: number, t: any) => s + t.amount, 0),
            outflow: txns.filter((t: any) => t.type === 'expense' && t.date === key).reduce((s: number, t: any) => s + t.amount, 0),
          }
        })
    } catch { return [] }
  }, [transactions, startDate, endDate, bid])

  // Category bar data
  const catBarData = useMemo(() => {
    const top5Inc = incFlow.slice(0, 5).map(c => ({ name: c.categoryName, income: c.amount, expense: 0 }))
    const top5Exp = expFlow.slice(0, 5).map(c => ({ name: c.categoryName, income: 0, expense: c.amount }))
    const merged: Record<string, { name: string; income: number; expense: number }> = {}
    ;[...top5Inc, ...top5Exp].forEach(c => {
      if (!merged[c.name]) merged[c.name] = { name: c.name, income: 0, expense: 0 }
      merged[c.name].income  += c.income
      merged[c.name].expense += c.expense
    })
    return Object.values(merged).slice(0, 6)
  }, [incFlow, expFlow])

  return (
    <div className="px-4 pt-5 pb-8 space-y-5">

      {/* Period selector */}
      <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
        {PERIODS.map(p => (
          <button key={p.id} onClick={() => setPeriod(p.id)}
            className={cn(
              'px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex-shrink-0 transition-all active:scale-95',
              period === p.id ? 'text-[#0B0F1A]' : ''
            )}
            style={period === p.id
              ? { background: 'var(--t-accent)' }
              : { background: 'var(--t-card-bg)', border: '1px solid var(--t-card-border)', color: 'var(--t-text)' }}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'In',  value: totalIn,           color: '#4CAF50', Icon: TrendingUp     },
          { label: 'Out', value: totalOut,           color: '#FF5C5C', Icon: TrendingDown   },
          { label: 'Net', value: Math.abs(netFlow),  color: netFlow >= 0 ? '#00F8B4' : '#FF5C5C', Icon: netFlow >= 0 ? ArrowRight : Minus },
        ].map(({ label, value, color, Icon }, i) => (
          <motion.div key={label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
            className="rounded-2xl p-3 relative overflow-hidden"
            style={{ background: 'var(--t-card-bg)', border: `1px solid var(--t-card-border)`, borderLeft: `3px solid ${color}` }}>
            <div className="flex items-center gap-1.5 mb-2">
              <Icon size={13} style={{ color }} />
              <p className="text-xs" style={{ color: 'var(--t-muted)' }}>{label}</p>
            </div>
            <p className="text-base font-black leading-tight" style={{ color }}>Rs. {formatAmount(value)}</p>
          </motion.div>
        ))}
      </div>

      {/* Inflow/Outflow area chart */}
      {dailyData.length > 1 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="rounded-2xl p-4" style={{ background: 'var(--t-card-bg)', border: '1px solid var(--t-card-border)' }}>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-bold" style={{ color: 'var(--t-text)' }}>Cash Flow Trend</p>
            <div className="flex items-center gap-3 text-[10px]" style={{ color: 'var(--t-muted)' }}>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> In</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" /> Out</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={150}>
            <AreaChart data={dailyData} margin={{ top: 4, right: 4, left: -22, bottom: 0 }}>
              <defs>
                <linearGradient id="mfInGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="#4CAF50" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#4CAF50" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="mfOutGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="#FF5C5C" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#FF5C5C" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--t-card-border)" strokeOpacity={0.5} />
              <XAxis dataKey="label" tick={{ fontSize: 9, fill: 'var(--t-muted)' }}  axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 9, fill: 'var(--t-muted)' }} axisLine={false} tickLine={false}
                tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)} />
              <Tooltip content={<ChartTooltip />} />
              <Area type="monotone" dataKey="inflow"  name="Inflow"  stroke="#4CAF50" strokeWidth={2} fill="url(#mfInGrad)"  dot={false} />
              <Area type="monotone" dataKey="outflow" name="Outflow" stroke="#FF5C5C" strokeWidth={2} fill="url(#mfOutGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {/* Category comparison bar chart */}
      {catBarData.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="rounded-2xl p-4" style={{ background: 'var(--t-card-bg)', border: '1px solid var(--t-card-border)' }}>
          <p className="text-sm font-bold mb-4" style={{ color: 'var(--t-text)' }}>Income vs Expense by Category</p>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={catBarData} margin={{ top: 4, right: 4, left: -22, bottom: 0 }} barSize={8}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--t-card-border)" strokeOpacity={0.5} />
              <XAxis dataKey="name" tick={{ fontSize: 8, fill: 'var(--t-muted)' }}  axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 8, fill: 'var(--t-muted)' }} axisLine={false} tickLine={false}
                tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="income"  name="Income"  fill="#4CAF50" radius={[3, 3, 0, 0]} />
              <Bar dataKey="expense" name="Expense" fill="#FF5C5C" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {/* Wallet activity cards */}
      {walletsFlow.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <p className="text-[11px] font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--t-muted)' }}>Wallet Activity</p>
          <div className="space-y-3">
            {walletsFlow.map((flow, i) => (
              <motion.div key={flow.walletId}
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 + i * 0.05 }}
                className="rounded-2xl p-4"
                style={{ background: 'var(--t-card-bg)', border: '1px solid var(--t-card-border)' }}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{flow.walletIcon}</span>
                    <p className="text-sm font-bold" style={{ color: 'var(--t-text)' }}>{flow.walletName}</p>
                  </div>
                  <p className={cn('text-sm font-black', flow.netFlow >= 0 ? 'text-emerald-500' : 'text-red-500')}>
                    {flow.netFlow >= 0 ? '+' : '-'}Rs. {formatAmount(Math.abs(flow.netFlow))}
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div>
                    <p className="text-[10px] font-semibold mb-0.5" style={{ color: 'var(--t-muted)' }}>In</p>
                    <p className="text-xs font-bold text-emerald-500">Rs. {formatAmount(flow.totalIn)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold mb-0.5" style={{ color: 'var(--t-muted)' }}>Out</p>
                    <p className="text-xs font-bold text-red-500">Rs. {formatAmount(flow.totalOut)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold mb-0.5" style={{ color: 'var(--t-muted)' }}>Txns</p>
                    <p className="text-xs font-bold" style={{ color: 'var(--t-text)' }}>{flow.transfers?.length ?? 0}</p>
                  </div>
                </div>
                {(flow.transfers?.length ?? 0) > 0 && (
                  <div className="mt-3 pt-3 space-y-2" style={{ borderTop: '1px solid var(--t-card-border)' }}>
                    <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--t-muted)' }}>
                      Transfers ({flow.transfers.length})
                    </p>
                    {flow.transfers.slice(0, 3).map((tr: any) => (
                      <div key={tr.id} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="font-medium truncate" style={{ color: 'var(--t-text)' }}>{tr.from}</span>
                          <ArrowRight size={10} style={{ color: 'var(--t-muted)', flexShrink: 0 }} />
                          <span className="font-medium truncate" style={{ color: 'var(--t-text)' }}>{tr.to}</span>
                        </div>
                        <span className="font-bold flex-shrink-0 ml-2" style={{ color: 'var(--t-accent)' }}>
                          Rs. {formatAmount(tr.amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Income sources list */}
      {incFlow.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
          className="rounded-2xl p-4" style={{ background: 'var(--t-card-bg)', border: '1px solid var(--t-card-border)' }}>
          <p className="text-sm font-bold mb-3" style={{ color: 'var(--t-text)' }}>Income Sources</p>
          <div className="space-y-2.5">
            {incFlow.slice(0, 5).map(cat => (
              <div key={cat.categoryId} className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold" style={{ color: 'var(--t-text)' }}>{cat.categoryName}</p>
                  <p className="text-[10px]" style={{ color: 'var(--t-muted)' }}>{cat.count} transactions</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-emerald-500">Rs. {formatAmount(cat.amount)}</p>
                  <p className="text-[10px]" style={{ color: 'var(--t-muted)' }}>{cat.percentage.toFixed(1)}%</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Expense breakdown list */}
      {expFlow.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="rounded-2xl p-4" style={{ background: 'var(--t-card-bg)', border: '1px solid var(--t-card-border)' }}>
          <p className="text-sm font-bold mb-3" style={{ color: 'var(--t-text)' }}>Expense Breakdown</p>
          <div className="space-y-2.5">
            {expFlow.slice(0, 5).map(cat => (
              <div key={cat.categoryId} className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold" style={{ color: 'var(--t-text)' }}>{cat.categoryName}</p>
                  <p className="text-[10px]" style={{ color: 'var(--t-muted)' }}>{cat.count} transactions</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-red-500">Rs. {formatAmount(cat.amount)}</p>
                  <p className="text-[10px]" style={{ color: 'var(--t-muted)' }}>{cat.percentage.toFixed(1)}%</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {totalIn === 0 && totalOut === 0 && (
        <div className="text-center py-14">
          <div className="w-14 h-14 rounded-2xl mx-auto mb-3 flex items-center justify-center"
            style={{ background: 'var(--t-card-bg)', border: '1px solid var(--t-card-border)' }}>
            <ArrowLeftRight size={24} style={{ color: 'var(--t-muted)' }} />
          </div>
          <p className="text-sm font-bold" style={{ color: 'var(--t-text)' }}>No transactions this period</p>
          <p className="text-xs mt-1" style={{ color: 'var(--t-muted)' }}>Select a different period to see cash flow</p>
        </div>
      )}
    </div>
  )
}
