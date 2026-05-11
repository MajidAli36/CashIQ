'use client'
import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTransactionStore }  from '@/lib/store/transaction.store'
import { useSettingsStore }     from '@/lib/store/settings.store'
import { useLoanStore }         from '@/lib/store/loan.store'
import { formatAmount }         from '@/lib/utils/currency'
import { downloadCSV, downloadExcel, downloadPDF } from './exportUtils'
import { ExportMenu }           from './ExportMenu'
import { cn }                   from '@/lib/utils/cn'
import {
  Search, List, TrendingUp, TrendingDown,
  ChevronDown, ChevronUp, X, ArrowUpDown,
  SlidersHorizontal, Calendar, Wallet2, Users, Tag, DollarSign, CircleCheck,
} from 'lucide-react'
import type { DateRange } from './types'
import type { TransactionType } from '@/lib/types'

interface Props { range: DateRange; bid?: string }

type SortKey     = 'date' | 'amount' | 'type'
type StatusFilter = 'all' | 'active' | 'reversed'

const TYPE_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  income:           { label: 'Income',      color: '#4CAF50',  bg: 'rgba(76,175,80,0.12)'   },
  expense:          { label: 'Expense',     color: '#FF5C5C',  bg: 'rgba(255,92,92,0.12)'   },
  transfer:         { label: 'Transfer',    color: '#00C4FF',  bg: 'rgba(0,196,255,0.12)'   },
  loan_given:       { label: 'Loan Out',    color: '#f59e0b',  bg: 'rgba(245,158,11,0.12)'  },
  loan_received:    { label: 'Loan In',     color: '#6366f1',  bg: 'rgba(99,102,241,0.12)'  },
  opening_balance:  { label: 'Opening Bal', color: '#22d3ee',  bg: 'rgba(34,211,238,0.12)'  },
  advance_received: { label: 'Advance In',  color: '#ec4899',  bg: 'rgba(236,72,153,0.12)'  },
  advance_offset:   { label: 'Advance Off', color: '#84cc16',  bg: 'rgba(132,204,22,0.12)'  },
  adjustment:       { label: 'Adjustment',  color: '#6b7280',  bg: 'rgba(107,114,128,0.12)' },
  reversal:         { label: 'Reversal',    color: '#ef4444',  bg: 'rgba(239,68,68,0.12)'   },
}

const SIGN_MAP: Record<string, string> = {
  income: '+', loan_received: '+', advance_received: '+',
  expense: '-', loan_given: '-', advance_offset: '-',
}

const TYPE_CHIPS: { id: TransactionType | 'all'; label: string }[] = [
  { id: 'all',        label: 'All'      },
  { id: 'income',     label: 'Income'   },
  { id: 'expense',    label: 'Expense'  },
  { id: 'transfer',   label: 'Transfer' },
  { id: 'loan_given', label: 'Loans'    },
]

const PER_PAGE = 25

function TypeBadge({ type }: { type: string }) {
  const cfg = TYPE_CONFIG[type] ?? { label: type, color: '#6b7280', bg: 'rgba(107,114,128,0.12)' }
  return (
    <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold whitespace-nowrap"
      style={{ background: cfg.bg, color: cfg.color }}>
      {cfg.label}
    </span>
  )
}

// ── Reusable chip row ────────────────────────────────────────────────────────
function ChipRow<T extends string>({
  value, options, onChange,
}: {
  value: T
  options: { id: T; label: string }[]
  onChange: (v: T) => void
}) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-0.5" style={{ scrollbarWidth: 'none' }}>
      {options.map(o => (
        <button key={o.id} onClick={() => onChange(o.id)}
          className={cn('px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap flex-shrink-0 transition-all active:scale-95', value === o.id ? 'text-[#0B0F1A]' : '')}
          style={value === o.id
            ? { background: 'var(--t-accent)' }
            : { background: 'var(--t-page-bg)', border: '1px solid var(--t-card-border)', color: 'var(--t-text)' }}>
          {o.label}
        </button>
      ))}
    </div>
  )
}

// ── Filter section wrapper ───────────────────────────────────────────────────
function FilterSection({ icon: Icon, label, children }: { icon: any; label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2.5">
        <Icon size={12} style={{ color: 'var(--t-accent)' }} />
        <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--t-muted)' }}>{label}</p>
      </div>
      {children}
    </div>
  )
}

export function TransactionsTab({ range, bid }: Props) {
  const { transactions }                   = useTransactionStore()
  const { categories, getEnabledWallets }  = useSettingsStore()
  const { customers }                      = useLoanStore()

  // ── Quick filter state ───────────────────────────────────────────────────────
  const [search,       setSearch]       = useState('')
  const [typeFilter,   setTypeFilter]   = useState<TransactionType | 'all'>('all')

  // ── Advanced filter panel state ──────────────────────────────────────────────
  const [showFilter,   setShowFilter]   = useState(false)
  const [filterFrom,   setFilterFrom]   = useState('')
  const [filterTo,     setFilterTo]     = useState('')
  const [walletFilter, setWalletFilter] = useState('all')
  const [custFilter,   setCustFilter]   = useState('all')
  const [catFilter,    setCatFilter]    = useState('all')
  const [amtMin,       setAmtMin]       = useState('')
  const [amtMax,       setAmtMax]       = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')

  // ── Sort / pagination ────────────────────────────────────────────────────────
  const [sortBy,    setSortBy]    = useState<SortKey>('date')
  const [sortDir,   setSortDir]   = useState<'asc' | 'desc'>('desc')
  const [page,      setPage]      = useState(1)
  const [selected,  setSelected]  = useState<any>(null)

  const wallets = getEnabledWallets(bid)

  // ── Lookup maps ──────────────────────────────────────────────────────────────
  const catMap      = useMemo(() => Object.fromEntries(categories.map(c => [c.id, c.name_en])),  [categories])
  const walletMap   = useMemo(() => Object.fromEntries(wallets.map(w => [w.id, w])),             [wallets])
  const customerMap = useMemo(() => Object.fromEntries(customers.map(c => [c.id, c.name])),      [customers])

  // ── Biz customers list (for filter dropdown) ─────────────────────────────────
  const bizCustomers = useMemo(() =>
    customers.filter(c => !bid || !c.business_id || c.business_id === bid)
      .sort((a, b) => a.name.localeCompare(b.name)),
    [customers, bid]
  )

  // ── Base: date-range filtered ────────────────────────────────────────────────
  const rangeTxns = useMemo(() =>
    transactions.filter(t =>
      !t.is_deleted &&
      t.date >= range.from && t.date <= range.to &&
      (!bid || !t.business_id || t.business_id === bid)
    ),
    [transactions, range, bid]
  )

  // ── Main filter pipeline ─────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let list = rangeTxns

    // Additional date narrowing (within page range)
    if (filterFrom) list = list.filter(t => t.date >= filterFrom)
    if (filterTo)   list = list.filter(t => t.date <= filterTo)

    // Type
    if (typeFilter !== 'all') {
      list = typeFilter === 'loan_given'
        ? list.filter(t => t.type === 'loan_given' || t.type === 'loan_received')
        : list.filter(t => t.type === typeFilter)
    }

    // Wallet
    if (walletFilter !== 'all') {
      list = list.filter(t =>
        t.wallet_id === walletFilter ||
        t.from_wallet_id === walletFilter ||
        t.to_wallet_id   === walletFilter
      )
    }

    // Customer
    if (custFilter !== 'all') {
      list = list.filter(t => t.customer_id === custFilter)
    }

    // Category
    if (catFilter !== 'all') {
      list = list.filter(t => t.category_id === catFilter)
    }

    // Amount range
    if (amtMin !== '') list = list.filter(t => t.amount >= Number(amtMin))
    if (amtMax !== '') list = list.filter(t => t.amount <= Number(amtMax))

    // Status
    if (statusFilter === 'active')   list = list.filter(t => !t.is_reversed)
    if (statusFilter === 'reversed') list = list.filter(t => t.is_reversed)

    // All-field search
    if (search.trim()) {
      const q = search.toLowerCase().trim()
      list = list.filter(t => {
        const custName  = customerMap[t.customer_id ?? '']       ?? ''
        const wName     = walletMap[t.wallet_id]?.name            ?? ''
        const fromWName = walletMap[t.from_wallet_id ?? '']?.name ?? ''
        const toWName   = walletMap[t.to_wallet_id   ?? '']?.name ?? ''
        const typeLbl   = TYPE_CONFIG[t.type]?.label              ?? t.type
        const catName   = catMap[t.category_id]                   ?? ''
        return (
          t.date.includes(q) ||
          (t.note_en ?? '').toLowerCase().includes(q) ||
          (t.note_ur ?? '').includes(q) ||
          String(t.amount).includes(q) ||
          catName.toLowerCase().includes(q) ||
          custName.toLowerCase().includes(q) ||
          wName.toLowerCase().includes(q) ||
          fromWName.toLowerCase().includes(q) ||
          toWName.toLowerCase().includes(q) ||
          typeLbl.toLowerCase().includes(q)
        )
      })
    }

    return [...list].sort((a, b) => {
      const diff =
        sortBy === 'amount' ? a.amount - b.amount :
        sortBy === 'type'   ? a.type.localeCompare(b.type) :
                              (a.date + a.time).localeCompare(b.date + b.time)
      return sortDir === 'asc' ? diff : -diff
    })
  }, [rangeTxns, typeFilter, walletFilter, custFilter, catFilter, amtMin, amtMax, filterFrom, filterTo, statusFilter, search, sortBy, sortDir, catMap, walletMap, customerMap])

  // ── Summary stats (full page range, no advanced filters) ─────────────────────
  const stats = useMemo(() => {
    const active = rangeTxns.filter(t => !t.is_reversed)
    return {
      income:  active.filter(t => t.type === 'income' ).reduce((s, t) => s + t.amount, 0),
      expense: active.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
      count:   active.filter(t => !['opening_balance', 'adjustment', 'reversal', 'advance_offset'].includes(t.type)).length,
    }
  }, [rangeTxns])

  // ── Active filter count (badge) ───────────────────────────────────────────────
  const activeFilterCount = [
    !!filterFrom, !!filterTo,
    walletFilter !== 'all', custFilter !== 'all', catFilter !== 'all',
    !!amtMin, !!amtMax, statusFilter !== 'all',
  ].filter(Boolean).length

  const hasFilters = !!(search || typeFilter !== 'all' || activeFilterCount > 0)

  const totalPages = Math.ceil(filtered.length / PER_PAGE)
  const pageItems  = filtered.slice(0, page * PER_PAGE)

  function toggleSort(col: SortKey) {
    if (sortBy === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortBy(col); setSortDir('desc') }
  }

  function resetFilters() {
    setSearch(''); setTypeFilter('all')
    setFilterFrom(''); setFilterTo(''); setWalletFilter('all')
    setCustFilter('all'); setCatFilter('all')
    setAmtMin(''); setAmtMax(''); setStatusFilter('all')
    setPage(1)
  }

  function resetAdvanced() {
    setFilterFrom(''); setFilterTo(''); setWalletFilter('all')
    setCustFilter('all'); setCatFilter('all')
    setAmtMin(''); setAmtMax(''); setStatusFilter('all')
    setPage(1)
  }

  // ── Export ────────────────────────────────────────────────────────────────────
  const EXPORT_HEADERS = ['Date', 'Time', 'Type', 'Category', 'Wallet', 'Customer', 'Amount (Rs)', 'Status', 'Note']
  function exportRows() {
    return filtered.map(t => [
      t.date, t.time,
      TYPE_CONFIG[t.type]?.label ?? t.type,
      catMap[t.category_id] ?? t.category_id,
      walletMap[t.wallet_id]?.name ?? t.wallet_id ?? '',
      customerMap[t.customer_id ?? ''] ?? '',
      t.amount,
      t.is_reversed ? 'Reversed' : 'Active',
      t.note_en ?? '',
    ])
  }
  const exportBase = `transactions_${range.from}_to_${range.to}`
  function handleCSV()   { downloadCSV(exportBase, EXPORT_HEADERS, exportRows()) }
  function handleExcel() { downloadExcel(exportBase, 'Transactions', EXPORT_HEADERS, exportRows()) }
  async function handlePDF() {
    await downloadPDF(exportBase, 'Transactions Report', `${range.label}  ·  ${range.from} → ${range.to}`, EXPORT_HEADERS, exportRows())
  }

  // ── Build filter options ──────────────────────────────────────────────────────
  const custOptions = [
    { id: 'all', label: 'All Customers' },
    ...bizCustomers.map(c => ({ id: c.id, label: c.name })),
  ]
  const catOptions = [
    { id: 'all', label: 'All' },
    ...categories
      .filter(c => !bid || !c.business_id || c.business_id === bid)
      .sort((a, b) => a.name_en.localeCompare(b.name_en))
      .map(c => ({ id: c.id, label: c.name_en })),
  ]
  const walletOptions = [
    { id: 'all', label: 'All Wallets' },
    ...wallets.map(w => ({ id: w.id, label: `${w.icon} ${w.name}` })),
  ]
  const statusOptions: { id: StatusFilter; label: string }[] = [
    { id: 'all',      label: 'All'      },
    { id: 'active',   label: 'Active'   },
    { id: 'reversed', label: 'Reversed' },
  ]

  return (
    <div className="px-4 pt-5 pb-8 space-y-4">

      {/* ── Summary cards ── */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Income',  value: stats.income,  color: '#4CAF50', Icon: TrendingUp,   fmt: true  },
          { label: 'Expense', value: stats.expense, color: '#FF5C5C', Icon: TrendingDown, fmt: true  },
          { label: 'Count',   value: stats.count,   color: '#00C4FF', Icon: List,         fmt: false },
        ].map(({ label, value, color, Icon, fmt }, i) => (
          <motion.div key={label}
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
            className="rounded-2xl p-3"
            style={{ background: 'var(--t-card-bg)', border: `1px solid var(--t-card-border)`, borderLeft: `3px solid ${color}` }}>
            <div className="flex items-center gap-1.5 mb-1.5">
              <Icon size={11} style={{ color }} />
              <p className="text-[10px]" style={{ color: 'var(--t-muted)' }}>{label}</p>
            </div>
            <p className="text-[13px] font-black leading-tight" style={{ color }}>
              {fmt ? `Rs. ${formatAmount(value)}` : value}
            </p>
          </motion.div>
        ))}
      </div>

      {/* ── Search bar ── */}
      <div className="relative">
        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--t-muted)' }} />
        <input
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1) }}
          placeholder="Search note, amount, category, customer, wallet, type, date…"
          className="w-full pl-9 pr-3 py-2.5 rounded-xl text-xs focus:outline-none"
          style={{ background: 'var(--t-card-bg)', border: '1px solid var(--t-card-border)', color: 'var(--t-text)' }}
        />
      </div>

      {/* ── Quick type chips ── */}
      <div className="flex gap-2 overflow-x-auto pb-0.5" style={{ scrollbarWidth: 'none' }}>
        {TYPE_CHIPS.map(f => (
          <button key={f.id} onClick={() => { setTypeFilter(f.id); setPage(1) }}
            className={cn('px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap flex-shrink-0 transition-all active:scale-95', typeFilter === f.id ? 'text-[#0B0F1A]' : '')}
            style={typeFilter === f.id ? { background: 'var(--t-accent)' } : { background: 'var(--t-card-bg)', border: '1px solid var(--t-card-border)', color: 'var(--t-text)' }}>
            {f.label}
          </button>
        ))}
      </div>

      {/* ── Advanced filter toggle button — SEPARATE ROW ── */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setShowFilter(v => !v)}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold flex-1 transition-all active:scale-[0.98]',
            showFilter || activeFilterCount > 0 ? 'text-[#0B0F1A]' : ''
          )}
          style={showFilter || activeFilterCount > 0
            ? { background: 'var(--t-accent)' }
            : { background: 'var(--t-card-bg)', border: '1px solid var(--t-card-border)', color: 'var(--t-text)' }}>
          <SlidersHorizontal size={13} />
          <span>Advanced Filters</span>
          {activeFilterCount > 0 && (
            <span className="ml-auto px-2 py-0.5 rounded-full text-[10px] font-black"
              style={{ background: showFilter ? 'rgba(0,0,0,0.2)' : 'rgba(0,248,180,0.2)', color: showFilter ? '#0B0F1A' : 'var(--t-accent)' }}>
              {activeFilterCount} active
            </span>
          )}
          <ChevronDown size={12} className={`ml-auto transition-transform duration-200 ${showFilter ? 'rotate-180' : ''}`}
            style={activeFilterCount > 0 && !showFilter ? { marginLeft: '0px' } : {}} />
        </button>
      </div>

      {/* ── Advanced filter panel ── */}
      <AnimatePresence>
        {showFilter && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: 'auto', marginTop: 0 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            className="overflow-hidden">
            <div className="rounded-2xl overflow-hidden"
              style={{ background: 'var(--t-card-bg)', border: '1px solid var(--t-card-border)' }}>

              {/* Panel header */}
              <div className="flex items-center justify-between px-4 py-3"
                style={{ borderBottom: '1px solid var(--t-card-border)', background: 'var(--t-page-bg)' }}>
                <p className="text-xs font-bold" style={{ color: 'var(--t-text)' }}>Filter Transactions</p>
                {activeFilterCount > 0 && (
                  <button onClick={resetAdvanced}
                    className="flex items-center gap-1 text-xs font-semibold transition-all active:scale-95"
                    style={{ color: '#FF5C5C' }}>
                    <X size={11} /> Clear all filters
                  </button>
                )}
              </div>

              <div className="p-4 space-y-5">

                {/* 1. Date Range */}
                <FilterSection icon={Calendar} label="Date Range">
                  <div className="flex gap-2 items-center">
                    <input type="date"
                      value={filterFrom}
                      min={range.from} max={filterTo || range.to}
                      onChange={e => { setFilterFrom(e.target.value); setPage(1) }}
                      className="flex-1 px-3 py-2 rounded-xl text-xs focus:outline-none"
                      style={{ background: 'var(--t-page-bg)', border: `1px solid ${filterFrom ? 'var(--t-accent)' : 'var(--t-card-border)'}`, color: 'var(--t-text)' }}
                    />
                    <span className="text-xs font-bold" style={{ color: 'var(--t-muted)' }}>to</span>
                    <input type="date"
                      value={filterTo}
                      min={filterFrom || range.from} max={range.to}
                      onChange={e => { setFilterTo(e.target.value); setPage(1) }}
                      className="flex-1 px-3 py-2 rounded-xl text-xs focus:outline-none"
                      style={{ background: 'var(--t-page-bg)', border: `1px solid ${filterTo ? 'var(--t-accent)' : 'var(--t-card-border)'}`, color: 'var(--t-text)' }}
                    />
                    {(filterFrom || filterTo) && (
                      <button onClick={() => { setFilterFrom(''); setFilterTo(''); setPage(1) }}
                        className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: 'var(--t-page-bg)', border: '1px solid var(--t-card-border)' }}>
                        <X size={11} style={{ color: 'var(--t-muted)' }} />
                      </button>
                    )}
                  </div>
                  <p className="text-[10px] mt-1.5" style={{ color: 'var(--t-muted)' }}>
                    Refine within: {range.from} → {range.to}
                  </p>
                </FilterSection>

                <div style={{ borderTop: '1px solid var(--t-card-border)' }} />

                {/* 2. Wallet */}
                <FilterSection icon={Wallet2} label="Wallet">
                  <ChipRow value={walletFilter} options={walletOptions} onChange={v => { setWalletFilter(v); setPage(1) }} />
                </FilterSection>

                <div style={{ borderTop: '1px solid var(--t-card-border)' }} />

                {/* 3. Customer */}
                <FilterSection icon={Users} label="Customer">
                  {bizCustomers.length === 0 ? (
                    <p className="text-xs" style={{ color: 'var(--t-muted)' }}>No customers found. Add customers via the Loans section.</p>
                  ) : (
                    <ChipRow value={custFilter} options={custOptions} onChange={v => { setCustFilter(v); setPage(1) }} />
                  )}
                </FilterSection>

                <div style={{ borderTop: '1px solid var(--t-card-border)' }} />

                {/* 4. Category */}
                <FilterSection icon={Tag} label="Category">
                  {categories.length === 0 ? (
                    <p className="text-xs" style={{ color: 'var(--t-muted)' }}>No categories found.</p>
                  ) : (
                    <ChipRow value={catFilter} options={catOptions} onChange={v => { setCatFilter(v); setPage(1) }} />
                  )}
                </FilterSection>

                <div style={{ borderTop: '1px solid var(--t-card-border)' }} />

                {/* 5. Amount Range */}
                <FilterSection icon={DollarSign} label="Amount Range (Rs)">
                  <div className="flex gap-2 items-center">
                    <input type="number" value={amtMin}
                      onChange={e => { setAmtMin(e.target.value); setPage(1) }}
                      placeholder="Min amount"
                      className="flex-1 px-3 py-2 rounded-xl text-xs focus:outline-none"
                      style={{ background: 'var(--t-page-bg)', border: `1px solid ${amtMin ? 'var(--t-accent)' : 'var(--t-card-border)'}`, color: 'var(--t-text)' }} />
                    <span className="text-xs font-bold" style={{ color: 'var(--t-muted)' }}>–</span>
                    <input type="number" value={amtMax}
                      onChange={e => { setAmtMax(e.target.value); setPage(1) }}
                      placeholder="Max amount"
                      className="flex-1 px-3 py-2 rounded-xl text-xs focus:outline-none"
                      style={{ background: 'var(--t-page-bg)', border: `1px solid ${amtMax ? 'var(--t-accent)' : 'var(--t-card-border)'}`, color: 'var(--t-text)' }} />
                  </div>
                </FilterSection>

                <div style={{ borderTop: '1px solid var(--t-card-border)' }} />

                {/* 6. Status */}
                <FilterSection icon={CircleCheck} label="Status">
                  <ChipRow value={statusFilter} options={statusOptions} onChange={v => { setStatusFilter(v); setPage(1) }} />
                </FilterSection>

              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Results info + export + clear ── */}
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs flex-1 min-w-0" style={{ color: 'var(--t-muted)' }}>
          {filtered.length} transaction{filtered.length !== 1 ? 's' : ''}
          {hasFilters && <span style={{ color: 'var(--t-accent)' }}> · filtered</span>}
        </p>
        <div className="flex items-center gap-2 flex-shrink-0">
          <ExportMenu onCSV={handleCSV} onExcel={handleExcel} onPDF={handlePDF} count={filtered.length} />
          {hasFilters && (
            <button onClick={resetFilters}
              className="flex items-center gap-1 text-xs font-semibold transition-all active:scale-95"
              style={{ color: '#FF5C5C' }}>
              <X size={11} /> Clear
            </button>
          )}
        </div>
      </div>

      {/* ── Transaction table / empty ── */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl py-14 text-center"
          style={{ background: 'var(--t-card-bg)', border: '1px solid var(--t-card-border)' }}>
          <List size={32} className="mx-auto mb-3" style={{ color: 'var(--t-muted)' }} />
          <p className="text-sm font-bold" style={{ color: 'var(--t-text)' }}>No transactions found</p>
          <p className="text-xs mt-1" style={{ color: 'var(--t-muted)' }}>
            {hasFilters ? 'Try adjusting your filters or search term' : 'No transactions in this date range'}
          </p>
          {hasFilters && (
            <button onClick={resetFilters}
              className="mt-4 px-5 py-2 rounded-xl text-xs font-bold transition-all active:scale-95"
              style={{ background: 'var(--t-accent)', color: '#0B0F1A' }}>
              Clear All Filters
            </button>
          )}
        </div>
      ) : (
        <motion.div className="rounded-2xl overflow-hidden"
          style={{ background: 'var(--t-card-bg)', border: '1px solid var(--t-card-border)' }}>
          <div className="overflow-x-auto">
            <table className="w-full text-xs" style={{ minWidth: 520 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--t-card-border)' }}>
                  {([
                    { key: 'date',   label: 'Date & Time' },
                    { key: null,     label: 'Type'        },
                    { key: null,     label: 'Category'    },
                    { key: 'amount', label: 'Amount'      },
                  ] as { key: SortKey | null; label: string }[]).map((col, i) => (
                    <th key={i}
                      onClick={() => col.key && toggleSort(col.key)}
                      className={cn('px-4 py-3 text-left font-bold', col.key ? 'cursor-pointer select-none' : '')}
                      style={{ color: sortBy === col.key ? 'var(--t-accent)' : 'var(--t-muted)' }}>
                      <span className="flex items-center gap-1">
                        {col.label}
                        {col.key && (sortBy === col.key
                          ? sortDir === 'asc' ? <ChevronUp size={10} /> : <ChevronDown size={10} />
                          : <ArrowUpDown size={9} style={{ opacity: 0.3 }} />
                        )}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pageItems.map((t, i) => {
                  const cfg      = TYPE_CONFIG[t.type] ?? TYPE_CONFIG.income
                  const sign     = SIGN_MAP[t.type] ?? ''
                  const custName = customerMap[t.customer_id ?? '']
                  return (
                    <motion.tr key={t.id}
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      transition={{ delay: Math.min(i * 0.012, 0.25) }}
                      onClick={() => setSelected(t)}
                      className="cursor-pointer hover:bg-white/5 transition-colors"
                      style={{ borderBottom: '1px solid var(--t-card-border)' }}>
                      <td className="px-4 py-3">
                        <p className="font-semibold" style={{ color: 'var(--t-text)' }}>{t.date}</p>
                        <p className="text-[10px]" style={{ color: 'var(--t-muted)' }}>{t.time}</p>
                      </td>
                      <td className="px-4 py-3"><TypeBadge type={t.type} /></td>
                      <td className="px-4 py-3 max-w-[140px]">
                        <p className="font-semibold truncate" style={{ color: 'var(--t-text)' }}>
                          {catMap[t.category_id] ?? t.category_id}
                        </p>
                        {custName
                          ? <p className="text-[10px] truncate" style={{ color: 'var(--t-accent)' }}>{custName}</p>
                          : t.note_en && <p className="text-[10px] truncate" style={{ color: 'var(--t-muted)' }}>{t.note_en}</p>
                        }
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-black" style={{ color: cfg.color }}>
                          {sign}Rs. {formatAmount(t.amount)}
                        </p>
                        {t.is_reversed && <p className="text-[9px] text-red-400">Reversed</p>}
                      </td>
                    </motion.tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {page < totalPages && (
            <div className="p-4 text-center" style={{ borderTop: '1px solid var(--t-card-border)' }}>
              <button onClick={() => setPage(p => p + 1)}
                className="px-6 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95"
                style={{ background: 'var(--t-page-bg)', border: '1px solid var(--t-card-border)', color: 'var(--t-text)' }}>
                Load more · {filtered.length - page * PER_PAGE} remaining
              </button>
            </div>
          )}
        </motion.div>
      )}

      {/* ── Transaction Detail Drawer ── */}
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
              className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl"
              style={{ background: 'var(--t-card-bg)', border: '1px solid var(--t-card-border)', maxHeight: '85vh' }}>
              {(() => {
                const cfg         = TYPE_CONFIG[selected.type] ?? TYPE_CONFIG.income
                const sign        = SIGN_MAP[selected.type] ?? ''
                const walletEntry = walletMap[selected.wallet_id]
                const fromWallet  = walletMap[selected.from_wallet_id ?? '']
                const toWallet    = walletMap[selected.to_wallet_id   ?? '']
                const categoryName = catMap[selected.category_id] ?? selected.category_id
                const custName    = customerMap[selected.customer_id ?? '']
                return (
                  <div className="px-5 pt-5 pb-10 overflow-y-auto max-h-[85vh]">
                    <div className="flex items-center justify-between mb-5">
                      <p className="text-base font-bold" style={{ color: 'var(--t-text)' }}>Transaction Details</p>
                      <button onClick={() => setSelected(null)}
                        className="w-8 h-8 rounded-xl flex items-center justify-center"
                        style={{ background: 'var(--t-page-bg)', border: '1px solid var(--t-card-border)' }}>
                        <X size={14} style={{ color: 'var(--t-muted)' }} />
                      </button>
                    </div>

                    <div className="rounded-2xl p-5 text-center mb-4" style={{ background: cfg.bg }}>
                      <p className="text-3xl font-black mb-1.5" style={{ color: cfg.color }}>
                        {sign}Rs. {formatAmount(selected.amount)}
                      </p>
                      <TypeBadge type={selected.type} />
                    </div>

                    <div className="space-y-0">
                      {[
                        { label: 'Date & Time', value: `${selected.date}  ${selected.time}` },
                        { label: 'Category',    value: categoryName },
                        { label: 'Wallet',      value: walletEntry ? `${walletEntry.icon} ${walletEntry.name}` : (selected.wallet_id ?? '—') },
                        ...(fromWallet && toWallet ? [{ label: 'Transfer', value: `${fromWallet.name} → ${toWallet.name}` }] : []),
                        ...(custName ? [{ label: 'Customer', value: custName }] : []),
                        { label: 'Note',       value: selected.note_en || selected.note_ur || '—' },
                        { label: 'Created By', value: selected.created_by },
                        { label: 'Status',     value: selected.is_reversed ? '⚠️ Reversed' : selected.is_deleted ? '🗑 Deleted' : '✅ Active' },
                      ].map(({ label, value }) => (
                        <div key={label} className="flex items-center justify-between py-3"
                          style={{ borderBottom: '1px solid var(--t-card-border)' }}>
                          <p className="text-xs" style={{ color: 'var(--t-muted)' }}>{label}</p>
                          <p className="text-xs font-semibold max-w-[60%] text-right" style={{ color: 'var(--t-text)' }}>{value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })()}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
