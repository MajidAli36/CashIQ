'use client'
import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { useLoanStore }       from '@/lib/store/loan.store'
import { useInventoryStore }  from '@/lib/store/inventory.store'
import { useTransactionStore } from '@/lib/store/transaction.store'
import { formatAmount }       from '@/lib/utils/currency'
import { downloadCSV, downloadExcel, downloadPDF } from './exportUtils'
import { ExportMenu }         from './ExportMenu'
import { cn }                 from '@/lib/utils/cn'
import {
  Users, Building2, Search, ArrowUpRight, ArrowDownRight,
  Phone, Clock, X, TrendingUp, Package, CreditCard, ChevronRight,
} from 'lucide-react'
import type { DateRange } from './types'

interface Props { range: DateRange; bid?: string }

type EntityView = 'customers' | 'suppliers'
type BalanceFilter = 'all' | 'positive' | 'negative' | 'zero'

function Avatar({ name, gradient }: { name: string; gradient: string }) {
  return (
    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 font-black text-sm text-white"
      style={{ background: gradient }}>
      {name.charAt(0).toUpperCase()}
    </div>
  )
}

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl px-3 py-2 text-xs shadow-xl"
      style={{ background: 'var(--t-card-bg)', border: '1px solid var(--t-card-border)' }}>
      <p className="font-bold mb-1" style={{ color: 'var(--t-text)' }}>{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.fill ?? p.color }}>
          {p.name}: Rs. {formatAmount(p.value)}
        </p>
      ))}
    </div>
  )
}

export function EntitiesTab({ range, bid }: Props) {
  const { customers, entries, getCustomerBalance, getTotalToReceive, getTotalToGive } = useLoanStore()
  const { suppliers, movements } = useInventoryStore()
  const { transactions }         = useTransactionStore()

  const [view,          setView]          = useState<EntityView>('customers')
  const [search,        setSearch]        = useState('')
  const [balanceFilter, setBalanceFilter] = useState<BalanceFilter>('all')
  const [selected,      setSelected]      = useState<any>(null)

  const totalToReceive = getTotalToReceive(bid)
  const totalToGive    = getTotalToGive(bid)

  // ── Customer stats ──────────────────────────────────────────
  const bizCustomers = useMemo(() =>
    customers.filter(c => !bid || !c.business_id || c.business_id === bid),
    [customers, bid]
  )

  const customerStats = useMemo(() => bizCustomers.map(c => {
    const balance    = getCustomerBalance(c.id, bid)
    const cEntries   = entries.filter(e => e.customer_id === c.id && (!bid || !e.business_id || e.business_id === bid))
    const cTxns      = transactions.filter(t =>
      t.customer_id === c.id && !t.is_reversed && !t.is_deleted &&
      (!bid || !t.business_id || t.business_id === bid)
    )
    const rangeTxns  = cTxns.filter(t => t.date >= range.from && t.date <= range.to)
    const totalRevenue = rangeTxns.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
    const lastEntry  = [...cEntries].sort((a, b) => b.date.localeCompare(a.date))[0]
    const settled    = cEntries.filter(e => e.is_settled).length
    return {
      ...c,
      balance,
      totalEntries:    cEntries.length,
      settledEntries:  settled,
      pendingEntries:  cEntries.length - settled,
      totalRevenue,
      lastActivity:    lastEntry?.date ?? c.created_at.slice(0, 10),
      ledger:          [...cEntries].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 10),
    }
  }).sort((a, b) => Math.abs(b.balance) - Math.abs(a.balance)), [bizCustomers, entries, transactions, range, bid, getCustomerBalance])

  // ── Supplier stats ──────────────────────────────────────────
  const bizSuppliers = useMemo(() =>
    suppliers.filter(s => !bid || s.business_id === bid),
    [suppliers, bid]
  )

  const supplierStats = useMemo(() => bizSuppliers.map(s => {
    const sMoves     = movements.filter(m => m.supplier_id === s.id && m.type === 'stock_in')
    const purchased  = sMoves.reduce((sum, m) => sum + m.total_amount, 0)
    const units      = sMoves.reduce((sum, m) => sum + m.quantity, 0)
    const lastMove   = [...sMoves].sort((a, b) => b.date.localeCompare(a.date))[0]
    return {
      ...s,
      purchased,
      units,
      orderCount:   sMoves.length,
      lastActivity: lastMove?.date ?? s.created_at.slice(0, 10),
    }
  }).sort((a, b) => b.purchased - a.purchased), [bizSuppliers, movements])

  // ── Top customers chart data ────────────────────────────────
  const topCustomersChart = useMemo(() =>
    [...customerStats]
      .filter(c => c.totalRevenue > 0)
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, 6)
      .map(c => ({
        name:    c.name.length > 10 ? c.name.slice(0, 10) + '…' : c.name,
        revenue: c.totalRevenue,
      }))
  , [customerStats])

  // ── Filtered lists ──────────────────────────────────────────
  const filteredCustomers = useMemo(() => {
    let list = customerStats
    if (balanceFilter === 'positive') list = list.filter(c => c.balance > 0)
    if (balanceFilter === 'negative') list = list.filter(c => c.balance < 0)
    if (balanceFilter === 'zero')     list = list.filter(c => c.balance === 0)
    if (!search.trim()) return list
    const q = search.toLowerCase()
    return list.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.phone.includes(q) ||
      String(Math.abs(c.balance)).includes(q)
    )
  }, [customerStats, search, balanceFilter])

  const filteredSuppliers = useMemo(() => {
    if (!search.trim()) return supplierStats
    const q = search.toLowerCase()
    return supplierStats.filter(s =>
      s.name.toLowerCase().includes(q) ||
      (s.phone ?? '').includes(q) ||
      (s.city  ?? '').toLowerCase().includes(q) ||
      String(s.purchased).includes(q)
    )
  }, [supplierStats, search])

  // ── Export helpers ───────────────────────────────────────────
  const exportBase = `entities_${range.from}_to_${range.to}`

  function handleCustomerCSV()   {
    downloadCSV(exportBase + '_customers', ['Name','Phone','Balance (Rs)','Entries','Revenue (Rs)','Last Active'],
      filteredCustomers.map(c => [c.name, c.phone ?? '', c.balance, c.totalEntries, c.totalRevenue, c.lastActivity]))
  }
  function handleCustomerExcel() {
    downloadExcel(exportBase + '_customers', 'Customers', ['Name','Phone','Balance (Rs)','Entries','Revenue (Rs)','Last Active'],
      filteredCustomers.map(c => [c.name, c.phone ?? '', c.balance, c.totalEntries, c.totalRevenue, c.lastActivity]))
  }
  async function handleCustomerPDF() {
    await downloadPDF(exportBase + '_customers', 'Customer Report', `${range.label}  ·  ${range.from} → ${range.to}`,
      ['Name','Phone','Balance','Entries','Revenue','Last Active'],
      filteredCustomers.map(c => [c.name, c.phone ?? '', `Rs.${formatAmount(Math.abs(c.balance))}`, c.totalEntries, `Rs.${formatAmount(c.totalRevenue)}`, c.lastActivity]))
  }
  function handleSupplierCSV()   {
    downloadCSV(exportBase + '_suppliers', ['Name','Phone','City','Orders','Units','Purchased (Rs)','Outstanding (Rs)','Last Order'],
      filteredSuppliers.map(s => [s.name, s.phone ?? '', s.city ?? '', s.orderCount, s.units, s.purchased, s.balance, s.lastActivity]))
  }
  function handleSupplierExcel() {
    downloadExcel(exportBase + '_suppliers', 'Suppliers', ['Name','Phone','City','Orders','Units','Purchased (Rs)','Outstanding (Rs)','Last Order'],
      filteredSuppliers.map(s => [s.name, s.phone ?? '', s.city ?? '', s.orderCount, s.units, s.purchased, s.balance, s.lastActivity]))
  }
  async function handleSupplierPDF() {
    await downloadPDF(exportBase + '_suppliers', 'Supplier Report', `${range.label}  ·  ${range.from} → ${range.to}`,
      ['Name','Phone','City','Orders','Purchased','Outstanding','Last Order'],
      filteredSuppliers.map(s => [s.name, s.phone ?? '', s.city ?? '', s.orderCount, `Rs.${formatAmount(s.purchased)}`, `Rs.${formatAmount(s.balance)}`, s.lastActivity]))
  }

  return (
    <div className="px-4 pt-5 pb-8 space-y-5">

      {/* ── Summary cards ── */}
      <div className="grid grid-cols-2 gap-3">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="rounded-2xl p-4"
          style={{ background: 'rgba(76,175,80,0.08)', border: '1px solid rgba(76,175,80,0.2)' }}>
          <div className="flex items-center gap-1.5 mb-2">
            <ArrowUpRight size={14} className="text-emerald-500" />
            <p className="text-xs font-bold text-emerald-600">To Receive</p>
          </div>
          <p className="text-xl font-black text-emerald-500">Rs. {formatAmount(totalToReceive)}</p>
          <p className="text-[10px] mt-1" style={{ color: 'var(--t-muted)' }}>{bizCustomers.length} customers</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="rounded-2xl p-4"
          style={{ background: 'rgba(255,92,92,0.08)', border: '1px solid rgba(255,92,92,0.2)' }}>
          <div className="flex items-center gap-1.5 mb-2">
            <ArrowDownRight size={14} className="text-red-500" />
            <p className="text-xs font-bold text-red-500">To Give</p>
          </div>
          <p className="text-xl font-black text-red-500">Rs. {formatAmount(totalToGive)}</p>
          <p className="text-[10px] mt-1" style={{ color: 'var(--t-muted)' }}>{bizSuppliers.length} suppliers</p>
        </motion.div>
      </div>

      {/* ── Top customers revenue chart ── */}
      {topCustomersChart.length > 1 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}
          className="rounded-2xl p-4" style={{ background: 'var(--t-card-bg)', border: '1px solid var(--t-card-border)' }}>
          <p className="text-sm font-bold mb-4" style={{ color: 'var(--t-text)' }}>Top Customer Revenue</p>
          <ResponsiveContainer width="100%" height={150}>
            <BarChart data={topCustomersChart} margin={{ top: 4, right: 4, left: -22, bottom: 0 }} barSize={10}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--t-card-border)" strokeOpacity={0.5} />
              <XAxis dataKey="name" tick={{ fontSize: 8, fill: 'var(--t-muted)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 8, fill: 'var(--t-muted)' }} axisLine={false} tickLine={false}
                tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="revenue" name="Revenue" fill="#00F8B4" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {/* ── View switcher & search ── */}
      <div className="flex items-center gap-2">
        {([
          { id: 'customers' as EntityView, label: 'Customers', Icon: Users     },
          { id: 'suppliers' as EntityView, label: 'Suppliers', Icon: Building2 },
        ]).map(({ id, label, Icon }) => (
          <button key={id} onClick={() => { setView(id); setSearch(''); setBalanceFilter('all') }}
            className={cn(
              'flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold flex-shrink-0 transition-all active:scale-95',
              view === id ? 'text-[#0B0F1A]' : ''
            )}
            style={view === id
              ? { background: 'var(--t-accent)' }
              : { background: 'var(--t-card-bg)', border: '1px solid var(--t-card-border)', color: 'var(--t-text)' }}>
            <Icon size={13} />
            {label}
          </button>
        ))}
        <div className="ml-auto flex-shrink-0">
          {view === 'customers'
            ? <ExportMenu onCSV={handleCustomerCSV} onExcel={handleCustomerExcel} onPDF={handleCustomerPDF} count={filteredCustomers.length} />
            : <ExportMenu onCSV={handleSupplierCSV} onExcel={handleSupplierExcel} onPDF={handleSupplierPDF} count={filteredSuppliers.length} />
          }
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--t-muted)' }} />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder={view === 'customers' ? 'Search by name, phone, balance…' : 'Search by name, phone, city…'}
          className="w-full pl-9 pr-3 py-2.5 rounded-xl text-xs focus:outline-none"
          style={{ background: 'var(--t-card-bg)', border: '1px solid var(--t-card-border)', color: 'var(--t-text)' }} />
      </div>

      {/* Balance filter chips (customers only) */}
      {view === 'customers' && (
        <div className="flex gap-2 overflow-x-auto pb-0.5" style={{ scrollbarWidth: 'none' }}>
          {([
            { id: 'all' as BalanceFilter,      label: 'All'       },
            { id: 'positive' as BalanceFilter, label: 'To Receive' },
            { id: 'negative' as BalanceFilter, label: 'To Give'   },
            { id: 'zero' as BalanceFilter,     label: 'Settled'   },
          ]).map(f => (
            <button key={f.id} onClick={() => setBalanceFilter(f.id)}
              className={cn('px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap flex-shrink-0 transition-all active:scale-95', balanceFilter === f.id ? 'text-[#0B0F1A]' : '')}
              style={balanceFilter === f.id ? { background: 'var(--t-accent)' } : { background: 'var(--t-card-bg)', border: '1px solid var(--t-card-border)', color: 'var(--t-text)' }}>
              {f.label}
            </button>
          ))}
        </div>
      )}

      {/* ── Customer list ── */}
      {view === 'customers' && (
        <motion.div key="customers" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
          {filteredCustomers.length === 0 ? (
            <div className="rounded-2xl py-14 text-center"
              style={{ background: 'var(--t-card-bg)', border: '1px solid var(--t-card-border)' }}>
              <Users size={32} className="mx-auto mb-3" style={{ color: 'var(--t-muted)' }} />
              <p className="text-sm font-bold" style={{ color: 'var(--t-text)' }}>No customers found</p>
              <p className="text-xs mt-1" style={{ color: 'var(--t-muted)' }}>Add customers via the Loan section</p>
            </div>
          ) : filteredCustomers.map((c, i) => (
            <motion.div key={c.id}
              initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: Math.min(i * 0.04, 0.5) }}
              className="rounded-2xl p-4 cursor-pointer active:scale-[0.99] transition-transform"
              style={{ background: 'var(--t-card-bg)', border: '1px solid var(--t-card-border)' }}
              onClick={() => setSelected({ type: 'customer', data: c })}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar name={c.name} gradient="linear-gradient(135deg,#00F8B4,#00C4FF)" />
                  <div className="min-w-0">
                    <p className="text-sm font-bold truncate" style={{ color: 'var(--t-text)' }}>{c.name}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Phone size={9} style={{ color: 'var(--t-muted)' }} />
                      <p className="text-[10px]" style={{ color: 'var(--t-muted)' }}>{c.phone || '—'}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <div className="text-right">
                    <p className={cn('text-sm font-black',
                      c.balance > 0 ? 'text-emerald-500' : c.balance < 0 ? 'text-red-500' : '')}
                      style={c.balance === 0 ? { color: 'var(--t-muted)' } : {}}>
                      {c.balance > 0 ? '+' : c.balance < 0 ? '-' : ''}Rs. {formatAmount(Math.abs(c.balance))}
                    </p>
                    <p className="text-[10px]" style={{ color: 'var(--t-muted)' }}>
                      {c.balance > 0 ? 'to receive' : c.balance < 0 ? 'to give' : 'settled'}
                    </p>
                  </div>
                  <ChevronRight size={13} style={{ color: 'var(--t-muted)' }} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 pt-3" style={{ borderTop: '1px solid var(--t-card-border)' }}>
                <div>
                  <p className="text-[10px]" style={{ color: 'var(--t-muted)' }}>Entries</p>
                  <p className="text-xs font-bold" style={{ color: 'var(--t-text)' }}>{c.totalEntries}</p>
                </div>
                <div>
                  <p className="text-[10px]" style={{ color: 'var(--t-muted)' }}>Revenue</p>
                  <p className="text-xs font-bold text-emerald-500">Rs. {formatAmount(c.totalRevenue)}</p>
                </div>
                <div>
                  <p className="text-[10px]" style={{ color: 'var(--t-muted)' }}>Last Active</p>
                  <div className="flex items-center gap-1">
                    <Clock size={8} style={{ color: 'var(--t-muted)' }} />
                    <p className="text-[10px]" style={{ color: 'var(--t-text)' }}>{c.lastActivity}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* ── Supplier list ── */}
      {view === 'suppliers' && (
        <motion.div key="suppliers" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
          {filteredSuppliers.length === 0 ? (
            <div className="rounded-2xl py-14 text-center"
              style={{ background: 'var(--t-card-bg)', border: '1px solid var(--t-card-border)' }}>
              <Building2 size={32} className="mx-auto mb-3" style={{ color: 'var(--t-muted)' }} />
              <p className="text-sm font-bold" style={{ color: 'var(--t-text)' }}>No suppliers found</p>
              <p className="text-xs mt-1" style={{ color: 'var(--t-muted)' }}>Add suppliers via the Inventory section</p>
            </div>
          ) : filteredSuppliers.map((s, i) => (
            <motion.div key={s.id}
              initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: Math.min(i * 0.04, 0.5) }}
              className="rounded-2xl p-4 cursor-pointer active:scale-[0.99] transition-transform"
              style={{ background: 'var(--t-card-bg)', border: '1px solid var(--t-card-border)' }}
              onClick={() => setSelected({ type: 'supplier', data: s })}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar name={s.name} gradient="linear-gradient(135deg,#6366f1,#8b5cf6)" />
                  <div className="min-w-0">
                    <p className="text-sm font-bold truncate" style={{ color: 'var(--t-text)' }}>{s.name}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Phone size={9} style={{ color: 'var(--t-muted)' }} />
                      <p className="text-[10px]" style={{ color: 'var(--t-muted)' }}>{s.phone ?? '—'}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <div className="text-right">
                    <p className="text-sm font-black" style={{ color: s.balance > 0 ? '#FF5C5C' : 'var(--t-muted)' }}>
                      Rs. {formatAmount(Math.abs(s.balance))}
                    </p>
                    <p className="text-[10px]" style={{ color: 'var(--t-muted)' }}>
                      {s.balance > 0 ? 'outstanding' : 'cleared'}
                    </p>
                  </div>
                  <ChevronRight size={13} style={{ color: 'var(--t-muted)' }} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 pt-3" style={{ borderTop: '1px solid var(--t-card-border)' }}>
                <div>
                  <p className="text-[10px]" style={{ color: 'var(--t-muted)' }}>Orders</p>
                  <p className="text-xs font-bold" style={{ color: 'var(--t-text)' }}>{s.orderCount}</p>
                </div>
                <div>
                  <p className="text-[10px]" style={{ color: 'var(--t-muted)' }}>Purchased</p>
                  <p className="text-xs font-bold text-red-400">Rs. {formatAmount(s.purchased)}</p>
                </div>
                <div>
                  <p className="text-[10px]" style={{ color: 'var(--t-muted)' }}>Last Order</p>
                  <div className="flex items-center gap-1">
                    <Clock size={8} style={{ color: 'var(--t-muted)' }} />
                    <p className="text-[10px]" style={{ color: 'var(--t-text)' }}>{s.lastActivity}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* ── Entity Detail Drawer ── */}
      <AnimatePresence>
        {selected && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
              onClick={() => setSelected(null)} />
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl overflow-hidden"
              style={{ background: 'var(--t-card-bg)', border: '1px solid var(--t-card-border)', maxHeight: '85vh' }}>
              <div className="overflow-y-auto max-h-[85vh] pb-safe">
                <div className="px-5 pt-5 pb-6">

                  {/* Header */}
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                      <Avatar
                        name={selected.data.name}
                        gradient={selected.type === 'customer'
                          ? 'linear-gradient(135deg,#00F8B4,#00C4FF)'
                          : 'linear-gradient(135deg,#6366f1,#8b5cf6)'} />
                      <div>
                        <p className="text-base font-bold" style={{ color: 'var(--t-text)' }}>{selected.data.name}</p>
                        <p className="text-xs capitalize" style={{ color: 'var(--t-muted)' }}>{selected.type}</p>
                      </div>
                    </div>
                    <button onClick={() => setSelected(null)}
                      className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: 'var(--t-page-bg)', border: '1px solid var(--t-card-border)' }}>
                      <X size={14} style={{ color: 'var(--t-muted)' }} />
                    </button>
                  </div>

                  {/* Customer detail */}
                  {selected.type === 'customer' && (() => {
                    const c = selected.data
                    return (
                      <div className="space-y-4">
                        {/* Balance */}
                        <div className="rounded-2xl p-4 text-center"
                          style={{
                            background: c.balance > 0 ? 'rgba(76,175,80,0.08)' : c.balance < 0 ? 'rgba(255,92,92,0.08)' : 'var(--t-page-bg)',
                            border: `1px solid ${c.balance > 0 ? 'rgba(76,175,80,0.25)' : c.balance < 0 ? 'rgba(255,92,92,0.25)' : 'var(--t-card-border)'}`,
                          }}>
                          <p className="text-xs mb-1" style={{ color: 'var(--t-muted)' }}>Balance</p>
                          <p className={cn('text-2xl font-black', c.balance > 0 ? 'text-emerald-500' : c.balance < 0 ? 'text-red-500' : '')}
                            style={c.balance === 0 ? { color: 'var(--t-muted)' } : {}}>
                            Rs. {formatAmount(Math.abs(c.balance))}
                          </p>
                          <p className="text-xs mt-1" style={{ color: 'var(--t-muted)' }}>
                            {c.balance > 0 ? 'To receive from customer' : c.balance < 0 ? 'You owe to customer' : 'All settled'}
                          </p>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-3">
                          {[
                            { label: 'Total Entries',  value: c.totalEntries,   Icon: CreditCard,  color: '#00C4FF', fmt: false },
                            { label: 'Settled',        value: c.settledEntries, Icon: TrendingUp,  color: '#4CAF50', fmt: false },
                            { label: 'Revenue',        value: c.totalRevenue,   Icon: TrendingUp,  color: '#00F8B4', fmt: true  },
                          ].map(({ label, value, Icon, color, fmt }) => (
                            <div key={label} className="rounded-xl p-3 text-center"
                              style={{ background: 'var(--t-page-bg)', border: '1px solid var(--t-card-border)' }}>
                              <Icon size={14} className="mx-auto mb-1.5" style={{ color }} />
                              <p className="text-xs font-black" style={{ color: 'var(--t-text)' }}>
                                {fmt ? `Rs.${formatAmount(value as number)}` : value}
                              </p>
                              <p className="text-[10px] mt-0.5" style={{ color: 'var(--t-muted)' }}>{label}</p>
                            </div>
                          ))}
                        </div>

                        {/* Contact */}
                        <div className="flex items-center justify-between py-3"
                          style={{ borderBottom: '1px solid var(--t-card-border)' }}>
                          <p className="text-xs" style={{ color: 'var(--t-muted)' }}>Phone</p>
                          <p className="text-xs font-semibold" style={{ color: 'var(--t-text)' }}>{c.phone || '—'}</p>
                        </div>
                        <div className="flex items-center justify-between py-3"
                          style={{ borderBottom: '1px solid var(--t-card-border)' }}>
                          <p className="text-xs" style={{ color: 'var(--t-muted)' }}>Last Activity</p>
                          <p className="text-xs font-semibold" style={{ color: 'var(--t-text)' }}>{c.lastActivity}</p>
                        </div>

                        {/* Ledger */}
                        {c.ledger.length > 0 && (
                          <div>
                            <p className="text-xs font-bold mb-2" style={{ color: 'var(--t-muted)' }}>RECENT LEDGER</p>
                            <div className="space-y-2">
                              {c.ledger.map((e: any) => (
                                <div key={e.id} className="flex items-center justify-between py-2 text-xs"
                                  style={{ borderBottom: '1px solid var(--t-card-border)' }}>
                                  <div>
                                    <p className="font-semibold" style={{ color: 'var(--t-text)' }}>
                                      {e.direction === 'given' ? 'Given (Receive)' : 'Received (Give)'}
                                    </p>
                                    <p style={{ color: 'var(--t-muted)' }}>{e.date} · {e.is_settled ? 'Settled' : 'Pending'}</p>
                                  </div>
                                  <p className={cn('font-black', e.direction === 'given' ? 'text-emerald-500' : 'text-red-500')}>
                                    {e.direction === 'given' ? '+' : '-'}Rs. {formatAmount(e.amount)}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })()}

                  {/* Supplier detail */}
                  {selected.type === 'supplier' && (() => {
                    const s = selected.data
                    return (
                      <div className="space-y-4">
                        <div className="grid grid-cols-3 gap-3">
                          {[
                            { label: 'Orders',    value: s.orderCount,  Icon: Package,    color: '#00C4FF', fmt: false },
                            { label: 'Units In',  value: s.units,       Icon: TrendingUp, color: '#00F8B4', fmt: false },
                            { label: 'Purchased', value: s.purchased,   Icon: CreditCard, color: '#6366f1', fmt: true  },
                          ].map(({ label, value, Icon, color, fmt }) => (
                            <div key={label} className="rounded-xl p-3 text-center"
                              style={{ background: 'var(--t-page-bg)', border: '1px solid var(--t-card-border)' }}>
                              <Icon size={14} className="mx-auto mb-1.5" style={{ color }} />
                              <p className="text-xs font-black" style={{ color: 'var(--t-text)' }}>
                                {fmt ? `Rs.${formatAmount(value as number)}` : value}
                              </p>
                              <p className="text-[10px] mt-0.5" style={{ color: 'var(--t-muted)' }}>{label}</p>
                            </div>
                          ))}
                        </div>
                        {[
                          { label: 'Phone',        value: s.phone    ?? '—' },
                          { label: 'City',         value: s.city     ?? '—' },
                          { label: 'Outstanding',  value: `Rs. ${formatAmount(s.balance)}` },
                          { label: 'Last Order',   value: s.lastActivity },
                          { label: 'Status',       value: s.is_active ? 'Active' : 'Inactive' },
                        ].map(({ label, value }) => (
                          <div key={label} className="flex items-center justify-between py-3"
                            style={{ borderBottom: '1px solid var(--t-card-border)' }}>
                            <p className="text-xs" style={{ color: 'var(--t-muted)' }}>{label}</p>
                            <p className="text-xs font-semibold" style={{ color: 'var(--t-text)' }}>{value}</p>
                          </div>
                        ))}
                      </div>
                    )
                  })()}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
