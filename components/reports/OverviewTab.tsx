'use client'
import { useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts'
import { format, eachDayOfInterval, parseISO, eachWeekOfInterval, startOfWeek, endOfWeek, eachMonthOfInterval, startOfMonth, endOfMonth } from 'date-fns'
import { useTransactionStore } from '@/lib/store/transaction.store'
import { useSettingsStore }    from '@/lib/store/settings.store'
import { useLoanStore }        from '@/lib/store/loan.store'
import { formatAmount }        from '@/lib/utils/currency'
import { getCategoryFlow }     from '@/lib/utils/money-flow'
import { cn }                  from '@/lib/utils/cn'
import {
  TrendingUp, TrendingDown, DollarSign, Wallet2,
  ArrowUpRight, ArrowDownRight, Lightbulb, AlertTriangle,
  CheckCircle2, Info, BarChart2,
} from 'lucide-react'
import Link from 'next/link'
import type { DateRange, PrevRange } from './types'

interface Props { range: DateRange; prevRange: PrevRange; bid?: string }

const PIE_COLORS = ['#00F8B4', '#00C4FF', '#6366f1', '#f59e0b', '#ec4899', '#22d3ee', '#84cc16']

function pct(value: number, prev: number) {
  if (prev === 0) return value > 0 ? 100 : 0
  return ((value - prev) / prev) * 100
}

function KPICard({ label, value, prevValue, Icon, accentColor, delay = 0 }: {
  label: string; value: number; prevValue: number
  Icon: any; accentColor: string; delay?: number
}) {
  const change = pct(value, prevValue)
  const isUp   = change >= 0
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.3 }}
      className="rounded-2xl p-4 relative overflow-hidden"
      style={{ background: 'var(--t-card-bg)', border: '1px solid var(--t-card-border)' }}
    >
      <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full blur-2xl opacity-20" style={{ background: accentColor }} />
      <div className="flex items-start justify-between mb-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: accentColor + '1A' }}>
          <Icon size={17} style={{ color: accentColor }} />
        </div>
        {prevValue > 0 && (
          <span className={cn(
            'flex items-center gap-0.5 px-1.5 py-0.5 rounded-lg text-[10px] font-bold',
            isUp ? 'text-emerald-600 bg-emerald-500/10' : 'text-red-500 bg-red-500/10'
          )}>
            {isUp ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
            {Math.abs(change).toFixed(1)}%
          </span>
        )}
      </div>
      <p className="text-[11px] font-semibold mb-1" style={{ color: 'var(--t-muted)' }}>{label}</p>
      <p className="text-lg font-black leading-tight" style={{ color: 'var(--t-text)' }}>
        Rs. {formatAmount(value)}
      </p>
      {prevValue > 0 && (
        <p className="text-[10px] mt-1" style={{ color: 'var(--t-muted)' }}>
          prev Rs. {formatAmount(prevValue)}
        </p>
      )}
    </motion.div>
  )
}

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl px-3 py-2 text-xs shadow-xl"
      style={{ background: 'var(--t-card-bg)', border: '1px solid var(--t-card-border)' }}>
      <p className="font-bold mb-1.5" style={{ color: 'var(--t-text)' }}>{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} className="mb-0.5" style={{ color: p.color }}>
          {p.name}: Rs. {formatAmount(p.value)}
        </p>
      ))}
    </div>
  )
}

function buildTimeSeries(
  rangeTxns: any[],
  from: string,
  to: string
): { label: string; income: number; expense: number }[] {
  try {
    const start = parseISO(from)
    const end   = parseISO(to)
    const diffDays = (end.getTime() - start.getTime()) / 86400000 + 1

    if (diffDays <= 31) {
      // Daily
      return eachDayOfInterval({ start, end }).map(d => {
        const key = format(d, 'yyyy-MM-dd')
        const lbl = format(d, diffDays <= 7 ? 'EEE' : 'MMM d')
        return {
          label:   lbl,
          income:  rangeTxns.filter(t => t.type === 'income'  && t.date === key).reduce((s, t) => s + t.amount, 0),
          expense: rangeTxns.filter(t => t.type === 'expense' && t.date === key).reduce((s, t) => s + t.amount, 0),
        }
      })
    } else if (diffDays <= 120) {
      // Weekly
      return eachWeekOfInterval({ start, end }, { weekStartsOn: 1 }).map(wk => {
        const ws = format(wk, 'yyyy-MM-dd')
        const we = format(endOfWeek(wk, { weekStartsOn: 1 }), 'yyyy-MM-dd')
        return {
          label:   format(wk, 'MMM d'),
          income:  rangeTxns.filter(t => t.type === 'income'  && t.date >= ws && t.date <= we).reduce((s, t) => s + t.amount, 0),
          expense: rangeTxns.filter(t => t.type === 'expense' && t.date >= ws && t.date <= we).reduce((s, t) => s + t.amount, 0),
        }
      })
    } else {
      // Monthly
      return eachMonthOfInterval({ start, end }).map(mo => {
        const ms = format(startOfMonth(mo), 'yyyy-MM-dd')
        const me = format(endOfMonth(mo),   'yyyy-MM-dd')
        return {
          label:   format(mo, 'MMM yy'),
          income:  rangeTxns.filter(t => t.type === 'income'  && t.date >= ms && t.date <= me).reduce((s, t) => s + t.amount, 0),
          expense: rangeTxns.filter(t => t.type === 'expense' && t.date >= ms && t.date <= me).reduce((s, t) => s + t.amount, 0),
        }
      })
    }
  } catch { return [] }
}

export function OverviewTab({ range, prevRange, bid }: Props) {
  const { transactions }                        = useTransactionStore()
  const { categories, getEnabledWallets }       = useSettingsStore()
  const { getTotalToReceive, getTotalToGive }   = useLoanStore()

  const enabledWallets = getEnabledWallets(bid)

  const rangeTxns = useMemo(() => transactions.filter(t =>
    !t.is_reversed && !t.is_deleted &&
    t.date >= range.from && t.date <= range.to &&
    (!bid || !t.business_id || t.business_id === bid)
  ), [transactions, range, bid])

  const prevTxns = useMemo(() => transactions.filter(t =>
    !t.is_reversed && !t.is_deleted &&
    t.date >= prevRange.from && t.date <= prevRange.to &&
    (!bid || !t.business_id || t.business_id === bid)
  ), [transactions, prevRange, bid])

  const income      = useMemo(() => rangeTxns.filter(t => t.type === 'income' ).reduce((s, t) => s + t.amount, 0), [rangeTxns])
  const expense     = useMemo(() => rangeTxns.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0), [rangeTxns])
  const net         = income - expense
  const prevIncome  = useMemo(() => prevTxns.filter(t => t.type === 'income' ).reduce((s, t) => s + t.amount, 0), [prevTxns])
  const prevExpense = useMemo(() => prevTxns.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0), [prevTxns])

  const chartData = useMemo(() => buildTimeSeries(rangeTxns, range.from, range.to), [rangeTxns, range])

  const incCatFlow = useMemo(() => getCategoryFlow(transactions, categories, 'income',  range.from, range.to), [transactions, categories, range])
  const expCatFlow = useMemo(() => getCategoryFlow(transactions, categories, 'expense', range.from, range.to), [transactions, categories, range])

  const walletPieData = useMemo(() => {
    const allTxns = transactions.filter(t => !t.is_reversed && !t.is_deleted && (!bid || !t.business_id || t.business_id === bid))
    return enabledWallets.map(w => {
      const bal = allTxns.reduce((b, t) => {
        if (t.type === 'opening_balance' && t.wallet_id === w.id) return b + t.amount
        if (t.type === 'income'          && t.wallet_id === w.id) return b + t.amount
        if (t.type === 'expense'         && t.wallet_id === w.id) return b - t.amount
        if (['loan_given', 'advance_offset'].includes(t.type) && t.wallet_id === w.id) return b - t.amount
        if (['loan_received', 'advance_received'].includes(t.type) && t.wallet_id === w.id) return b + t.amount
        if (t.type === 'transfer') {
          if (t.from_wallet_id === w.id) return b - t.amount
          if (t.to_wallet_id   === w.id) return b + t.amount
        }
        return b
      }, 0)
      return { name: w.name, value: Math.max(bal, 0) }
    }).filter(w => w.value > 0)
  }, [enabledWallets, transactions, bid])

  const cashOnHand = walletPieData.reduce((s, w) => s + w.value, 0)
  const toReceive  = getTotalToReceive(bid)
  const toGive     = getTotalToGive(bid)

  const insights = useMemo(() => {
    const list: { type: 'good' | 'warn' | 'info'; text: string }[] = []
    if (income > 0 && expense > 0) {
      const margin = ((income - expense) / income) * 100
      if (margin > 30) list.push({ type: 'good', text: `Strong ${margin.toFixed(0)}% profit margin this period.` })
      else if (margin < 5) list.push({ type: 'warn', text: `Low ${margin.toFixed(0)}% margin — expenses nearly equal income.` })
    }
    if (income > prevIncome && prevIncome > 0) list.push({ type: 'good', text: `Income up ${pct(income, prevIncome).toFixed(0)}% vs previous period.` })
    if (expense > prevExpense && prevExpense > 0) list.push({ type: 'warn', text: `Expenses up ${pct(expense, prevExpense).toFixed(0)}% vs previous period.` })
    if (incCatFlow[0])  list.push({ type: 'info', text: `Top income: ${incCatFlow[0].categoryName} — Rs. ${formatAmount(incCatFlow[0].amount)}` })
    if (expCatFlow[0])  list.push({ type: 'warn', text: `Biggest expense: ${expCatFlow[0].categoryName} — Rs. ${formatAmount(expCatFlow[0].amount)}` })
    if (toReceive > 0)  list.push({ type: 'info', text: `Rs. ${formatAmount(toReceive)} outstanding receivables pending.` })
    return list.slice(0, 4)
  }, [income, expense, prevIncome, prevExpense, incCatFlow, expCatFlow, toReceive])

  const isEmpty = income === 0 && expense === 0

  return (
    <div className="px-4 pt-5 pb-8 space-y-5">

      {/* KPI Cards 2×2 */}
      <div className="grid grid-cols-2 gap-3">
        <KPICard label="Total Income"  value={income}       prevValue={prevIncome}  Icon={TrendingUp}   accentColor="#4CAF50" delay={0.05} />
        <KPICard label="Total Expense" value={expense}      prevValue={prevExpense} Icon={TrendingDown} accentColor="#FF5C5C" delay={0.1}  />
        <KPICard label="Net Earnings"  value={Math.abs(net)} prevValue={Math.abs(prevIncome - prevExpense)} Icon={DollarSign} accentColor={net >= 0 ? '#00F8B4' : '#FF5C5C'} delay={0.15} />
        <KPICard label="Cash On Hand"  value={cashOnHand}   prevValue={0}           Icon={Wallet2}      accentColor="#00C4FF" delay={0.2} />
      </div>

      {/* Revenue vs Expense chart */}
      {chartData.length > 1 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="rounded-2xl p-4" style={{ background: 'var(--t-card-bg)', border: '1px solid var(--t-card-border)' }}>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-bold" style={{ color: 'var(--t-text)' }}>Revenue vs Expenses</p>
            <div className="flex items-center gap-3 text-[10px]">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Income</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" /> Expense</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -22, bottom: 0 }}>
              <defs>
                <linearGradient id="ovIncGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="#4CAF50" stopOpacity={0.28} />
                  <stop offset="100%" stopColor="#4CAF50" stopOpacity={0}    />
                </linearGradient>
                <linearGradient id="ovExpGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="#FF5C5C" stopOpacity={0.28} />
                  <stop offset="100%" stopColor="#FF5C5C" stopOpacity={0}    />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--t-card-border)" strokeOpacity={0.6} />
              <XAxis dataKey="label" tick={{ fontSize: 9, fill: 'var(--t-muted)' }}  axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 9, fill: 'var(--t-muted)' }} axisLine={false} tickLine={false}
                tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)} />
              <Tooltip content={<ChartTooltip />} />
              <Area type="monotone" dataKey="income"  name="Income"  stroke="#4CAF50" strokeWidth={2} fill="url(#ovIncGrad)" dot={false} />
              <Area type="monotone" dataKey="expense" name="Expense" stroke="#FF5C5C" strokeWidth={2} fill="url(#ovExpGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {/* Wallet distribution donut */}
      {walletPieData.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="rounded-2xl p-4" style={{ background: 'var(--t-card-bg)', border: '1px solid var(--t-card-border)' }}>
          <p className="text-sm font-bold mb-3" style={{ color: 'var(--t-text)' }}>Wallet Distribution</p>
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0">
              <ResponsiveContainer width={110} height={110}>
                <PieChart>
                  <Pie data={walletPieData} cx="50%" cy="50%" innerRadius={30} outerRadius={52} dataKey="value" strokeWidth={0}>
                    {walletPieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip content={({ active, payload }) => active && payload?.[0] ? (
                    <div className="rounded-xl px-3 py-2 text-xs shadow-xl" style={{ background: 'var(--t-card-bg)', border: '1px solid var(--t-card-border)' }}>
                      <p style={{ color: 'var(--t-text)' }}>{payload[0].name}</p>
                      <p style={{ color: (payload[0] as any).payload.fill ?? '#00F8B4' }}>Rs. {formatAmount(payload[0].value as number)}</p>
                    </div>
                  ) : null} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-2 min-w-0">
              {walletPieData.map((w, i) => {
                const p = cashOnHand > 0 ? (w.value / cashOnHand * 100).toFixed(0) : '0'
                return (
                  <div key={w.name} className="flex items-center justify-between gap-2 min-w-0">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                      <span className="text-xs font-medium truncate" style={{ color: 'var(--t-text)' }}>{w.name}</span>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <span className="text-xs font-bold" style={{ color: 'var(--t-text)' }}>Rs. {formatAmount(w.value)}</span>
                      <span className="text-[10px]" style={{ color: 'var(--t-muted)' }}>{p}%</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </motion.div>
      )}

      {/* Income breakdown */}
      {incCatFlow.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="rounded-2xl p-4" style={{ background: 'var(--t-card-bg)', border: '1px solid var(--t-card-border)' }}>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-bold" style={{ color: 'var(--t-text)' }}>Income Breakdown</p>
            <span className="text-xs font-semibold text-emerald-500">Rs. {formatAmount(income)}</span>
          </div>
          <div className="space-y-3">
            {incCatFlow.slice(0, 5).map((cat, i) => (
              <div key={cat.categoryId}>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="font-semibold" style={{ color: 'var(--t-text)' }}>{cat.categoryName}</span>
                  <span className="font-bold text-emerald-500">Rs. {formatAmount(cat.amount)}</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--t-page-bg)' }}>
                  <motion.div initial={{ width: 0 }} animate={{ width: `${cat.percentage}%` }}
                    transition={{ duration: 0.9, delay: 0.35 + i * 0.07 }}
                    className="h-full rounded-full" style={{ background: 'linear-gradient(90deg,#4CAF50,#22d3ee)' }} />
                </div>
                <p className="text-[10px] mt-0.5" style={{ color: 'var(--t-muted)' }}>
                  {cat.count} txns · {cat.percentage.toFixed(1)}%
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Expense breakdown */}
      {expCatFlow.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="rounded-2xl p-4" style={{ background: 'var(--t-card-bg)', border: '1px solid var(--t-card-border)' }}>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-bold" style={{ color: 'var(--t-text)' }}>Expense Breakdown</p>
            <span className="text-xs font-semibold text-red-500">Rs. {formatAmount(expense)}</span>
          </div>
          <div className="space-y-3">
            {expCatFlow.slice(0, 5).map((cat, i) => (
              <div key={cat.categoryId}>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="font-semibold" style={{ color: 'var(--t-text)' }}>{cat.categoryName}</span>
                  <span className="font-bold text-red-500">Rs. {formatAmount(cat.amount)}</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--t-page-bg)' }}>
                  <motion.div initial={{ width: 0 }} animate={{ width: `${cat.percentage}%` }}
                    transition={{ duration: 0.9, delay: 0.4 + i * 0.07 }}
                    className="h-full rounded-full" style={{ background: 'linear-gradient(90deg,#FF5C5C,#f97316)' }} />
                </div>
                <p className="text-[10px] mt-0.5" style={{ color: 'var(--t-muted)' }}>
                  {cat.count} txns · {cat.percentage.toFixed(1)}%
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Loans / Receivables */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
        className="grid grid-cols-2 gap-3">
        <Link href="/loan" className="rounded-2xl p-4 flex flex-col gap-2 active:scale-95 transition-transform"
          style={{ background: 'rgba(76,175,80,0.08)', border: '1px solid rgba(76,175,80,0.2)' }}>
          <div className="flex items-center gap-1.5">
            <ArrowUpRight size={14} className="text-emerald-500" />
            <p className="text-xs font-bold text-emerald-600">To Receive</p>
          </div>
          <p className="text-xl font-black text-emerald-500">Rs. {formatAmount(toReceive)}</p>
        </Link>
        <Link href="/loan" className="rounded-2xl p-4 flex flex-col gap-2 active:scale-95 transition-transform"
          style={{ background: 'rgba(255,92,92,0.08)', border: '1px solid rgba(255,92,92,0.2)' }}>
          <div className="flex items-center gap-1.5">
            <ArrowDownRight size={14} className="text-red-500" />
            <p className="text-xs font-bold text-red-500">To Give</p>
          </div>
          <p className="text-xl font-black text-red-500">Rs. {formatAmount(toGive)}</p>
        </Link>
      </motion.div>

      {/* AI Insights */}
      {insights.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="rounded-2xl p-4" style={{ background: 'var(--t-card-bg)', border: '1px solid var(--t-card-border)' }}>
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb size={14} style={{ color: 'var(--t-accent)' }} />
            <p className="text-sm font-bold" style={{ color: 'var(--t-text)' }}>Business Insights</p>
          </div>
          <div className="space-y-2">
            {insights.map((ins, i) => {
              const Icon   = ins.type === 'good' ? CheckCircle2 : ins.type === 'warn' ? AlertTriangle : Info
              const color  = ins.type === 'good' ? '#4CAF50'    : ins.type === 'warn' ? '#f59e0b'      : '#00C4FF'
              const bgOpacity = '0D'
              return (
                <div key={i} className="flex items-start gap-2.5 px-3 py-2.5 rounded-xl text-xs"
                  style={{ background: color + bgOpacity }}>
                  <Icon size={13} style={{ color, flexShrink: 0, marginTop: 1 }} />
                  <span className="font-medium leading-relaxed" style={{ color: 'var(--t-text)' }}>{ins.text}</span>
                </div>
              )
            })}
          </div>
        </motion.div>
      )}

      {/* Empty state */}
      {isEmpty && (
        <div className="text-center py-14">
          <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
            style={{ background: 'var(--t-card-bg)', border: '1px solid var(--t-card-border)' }}>
            <BarChart2 size={28} style={{ color: 'var(--t-muted)' }} />
          </div>
          <p className="text-base font-bold mb-1" style={{ color: 'var(--t-text)' }}>No data for this period</p>
          <p className="text-sm" style={{ color: 'var(--t-muted)' }}>Add transactions or select a different date range</p>
        </div>
      )}
    </div>
  )
}
