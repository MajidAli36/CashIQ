'use client'
import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, PieChart, Pie,
} from 'recharts'
import { useInventoryStore } from '@/lib/store/inventory.store'
import { formatAmount } from '@/lib/utils/currency'
import { downloadCSV, downloadExcel, downloadPDF } from './exportUtils'
import { ExportMenu } from './ExportMenu'
import { cn } from '@/lib/utils/cn'
import {
  Package, AlertTriangle, TrendingUp, DollarSign,
  ChevronDown, ChevronUp, Boxes, ArrowUpDown,
  ShoppingCart, Truck, RotateCcw, Search,
} from 'lucide-react'

interface Props { bid?: string }

const PIE_COLORS = ['#00F8B4', '#00C4FF', '#6366f1', '#f59e0b', '#ec4899', '#22d3ee', '#84cc16']

type SortKey = 'name' | 'stock' | 'value' | 'sold' | 'profit'
type StockFilter = 'all' | 'ok' | 'low' | 'out'

function getStockStatus(p: { is_active: boolean; stock_qty: number; low_stock_alert: number }): StockFilter {
  if (!p.is_active) return 'all'
  if (p.stock_qty === 0) return 'out'
  if (p.stock_qty <= p.low_stock_alert) return 'low'
  return 'ok'
}

function StatusBadge({ status }: { status: string }) {
  const cfg: Record<string, { label: string; bg: string; color: string }> = {
    ok:  { label: 'In Stock',  bg: 'rgba(76,175,80,0.12)',   color: '#4CAF50' },
    low: { label: 'Low Stock', bg: 'rgba(245,158,11,0.12)',  color: '#f59e0b' },
    out: { label: 'No Stock',  bg: 'rgba(255,92,92,0.12)',   color: '#FF5C5C' },
    all: { label: 'Inactive',  bg: 'rgba(107,114,128,0.12)', color: '#6b7280' },
  }
  const c = cfg[status] ?? cfg.all
  return (
    <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold" style={{ background: c.bg, color: c.color }}>
      {c.label}
    </span>
  )
}

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl px-3 py-2 text-xs shadow-xl"
      style={{ background: 'var(--t-card-bg)', border: '1px solid var(--t-card-border)' }}>
      <p className="font-bold mb-1" style={{ color: 'var(--t-text)' }}>{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} className="mb-0.5" style={{ color: p.color ?? p.fill }}>
          {p.name}: {typeof p.value === 'number' && p.value > 100 ? `Rs. ${formatAmount(p.value)}` : p.value}
        </p>
      ))}
    </div>
  )
}

export function InventoryTab({ bid }: Props) {
  const { products, movements, suppliers } = useInventoryStore()

  const [search,      setSearch]      = useState('')
  const [sortBy,      setSortBy]      = useState<SortKey>('sold')
  const [sortDir,     setSortDir]     = useState<'asc' | 'desc'>('desc')
  const [stockFilter, setStockFilter] = useState<StockFilter>('all')

  const bizProducts  = useMemo(() => products.filter(p => !bid || p.business_id === bid),  [products, bid])
  const bizMovements = useMemo(() => movements.filter(m => !bid || m.business_id === bid), [movements, bid])
  const bizSuppliers = useMemo(() => suppliers.filter(s => !bid || s.business_id === bid), [suppliers, bid])

  const stats = useMemo(() => {
    const active = bizProducts.filter(p => p.is_active)
    return {
      total:        bizProducts.length,
      active:       active.length,
      lowStock:     active.filter(p => p.stock_qty > 0 && p.stock_qty <= p.low_stock_alert).length,
      outOfStock:   active.filter(p => p.stock_qty === 0).length,
      totalValue:   active.reduce((s, p) => s + p.stock_qty * p.cost_price, 0),
      potRevenue:   active.reduce((s, p) => s + p.stock_qty * p.sell_price, 0),
      potProfit:    active.reduce((s, p) => s + p.stock_qty * (p.sell_price - p.cost_price), 0),
      totalIn:      bizMovements.filter(m => m.type === 'stock_in').reduce((s, m) => s + m.quantity, 0),
      totalOut:     bizMovements.filter(m => m.type === 'stock_out').reduce((s, m) => s + Math.abs(m.quantity), 0),
    }
  }, [bizProducts, bizMovements])

  const productsWithStats = useMemo(() => bizProducts.map(p => {
    const pmovs     = bizMovements.filter(m => m.product_id === p.id)
    const totalSold = pmovs.filter(m => m.type === 'stock_out').reduce((s, m) => s + Math.abs(m.quantity), 0)
    const revenue   = pmovs.filter(m => m.type === 'stock_out').reduce((s, m) => s + Math.abs(m.total_amount), 0)
    const cost      = pmovs.filter(m => m.type === 'stock_out').reduce((s, m) => s + Math.abs(m.quantity) * p.cost_price, 0)
    const supplier  = bizSuppliers.find(s => s.id === p.supplier_id)
    return {
      ...p,
      totalSold,
      revenue,
      profit:       revenue - cost,
      stockValue:   p.stock_qty * p.cost_price,
      status:       getStockStatus(p),
      supplierName: supplier?.name ?? '—',
    }
  }), [bizProducts, bizMovements, bizSuppliers])

  const filtered = useMemo(() => {
    let list = productsWithStats
    if (stockFilter !== 'all') list = list.filter(p => p.status === stockFilter)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        (p.sku ?? '').toLowerCase().includes(q) ||
        (p.category_id ?? '').toLowerCase().includes(q) ||
        p.supplierName.toLowerCase().includes(q)
      )
    }
    return [...list].sort((a, b) => {
      const diff =
        sortBy === 'name'   ? a.name.localeCompare(b.name) :
        sortBy === 'stock'  ? a.stock_qty - b.stock_qty :
        sortBy === 'value'  ? a.stockValue - b.stockValue :
        sortBy === 'profit' ? a.profit - b.profit :
                              a.totalSold - b.totalSold
      return sortDir === 'asc' ? diff : -diff
    })
  }, [productsWithStats, search, stockFilter, sortBy, sortDir])

  const topSelling = useMemo(() =>
    [...productsWithStats]
      .sort((a, b) => b.totalSold - a.totalSold)
      .slice(0, 6)
      .map(p => ({
        name:    p.name.length > 11 ? p.name.slice(0, 11) + '…' : p.name,
        sold:    p.totalSold,
        revenue: p.revenue,
      }))
  , [productsWithStats])

  const categoryPieData = useMemo(() => {
    const map: Record<string, number> = {}
    bizProducts.forEach(p => {
      const key = p.category_id ?? 'Uncategorised'
      map[key] = (map[key] ?? 0) + p.stock_qty * p.cost_price
    })
    return Object.entries(map)
      .filter(([, v]) => v > 0)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 7)
  }, [bizProducts])

  function toggleSort(col: SortKey) {
    if (sortBy === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortBy(col); setSortDir('desc') }
  }

  const INV_HEADERS = ['Product', 'SKU', 'Category', 'Supplier', 'Stock', 'Cost (Rs)', 'Price (Rs)', 'Stock Value (Rs)', 'Total Sold', 'Revenue (Rs)', 'Profit (Rs)', 'Status']
  function exportRows() {
    return filtered.map(p => [
      p.name, p.sku ?? '', p.category_id ?? '', p.supplierName,
      p.stock_qty, p.cost_price, p.sell_price,
      p.stockValue, p.totalSold, p.revenue, p.profit,
      p.status === 'ok' ? 'In Stock' : p.status === 'low' ? 'Low Stock' : p.status === 'out' ? 'Out of Stock' : 'Inactive',
    ])
  }
  function handleInvCSV()   { downloadCSV('inventory', INV_HEADERS, exportRows()) }
  function handleInvExcel() { downloadExcel('inventory', 'Inventory', INV_HEADERS, exportRows()) }
  async function handleInvPDF() { await downloadPDF('inventory', 'Inventory Report', `All products  ·  ${filtered.length} items`, INV_HEADERS, exportRows()) }

  const isEmpty = bizProducts.length === 0

  return (
    <div className="px-4 pt-5 pb-8 space-y-5">

      {/* ── KPI Cards 2×2 ── */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Total Products',  raw: stats.total,      color: '#00C4FF', Icon: Boxes,         fmt: false },
          { label: 'Stock Value',     raw: stats.totalValue, color: '#6366f1', Icon: DollarSign,    fmt: true  },
          { label: 'Pot. Revenue',    raw: stats.potRevenue, color: '#00F8B4', Icon: TrendingUp,    fmt: true  },
          { label: 'Pot. Profit',     raw: stats.potProfit,  color: '#4CAF50', Icon: ShoppingCart,  fmt: true  },
        ].map(({ label, raw, color, Icon, fmt }, i) => (
          <motion.div key={label}
            initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
            className="rounded-2xl p-4 relative overflow-hidden"
            style={{ background: 'var(--t-card-bg)', border: '1px solid var(--t-card-border)' }}>
            <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full blur-2xl opacity-20" style={{ background: color }} />
            <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: color + '1A' }}>
              <Icon size={17} style={{ color }} />
            </div>
            <p className="text-[11px] font-semibold mb-1" style={{ color: 'var(--t-muted)' }}>{label}</p>
            <p className="text-lg font-black leading-tight" style={{ color: 'var(--t-text)' }}>
              {fmt ? `Rs. ${formatAmount(raw)}` : raw}
            </p>
          </motion.div>
        ))}
      </div>

      {/* ── Flow summary ── */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Stock In',    value: stats.totalIn,  color: '#4CAF50', Icon: ArrowUpDown },
          { label: 'Stock Out',   value: stats.totalOut, color: '#FF5C5C', Icon: ArrowUpDown },
          { label: 'Suppliers',   value: bizSuppliers.length, color: '#00C4FF', Icon: Truck },
        ].map(({ label, value, color, Icon }, i) => (
          <motion.div key={label}
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.06 }}
            className="rounded-2xl p-3"
            style={{ background: 'var(--t-card-bg)', border: `1px solid var(--t-card-border)`, borderLeft: `3px solid ${color}` }}>
            <div className="flex items-center gap-1.5 mb-1.5">
              <Icon size={12} style={{ color }} />
              <p className="text-[10px]" style={{ color: 'var(--t-muted)' }}>{label}</p>
            </div>
            <p className="text-sm font-black" style={{ color: 'var(--t-text)' }}>{value}</p>
          </motion.div>
        ))}
      </div>

      {/* ── Stock Alerts ── */}
      {(stats.lowStock > 0 || stats.outOfStock > 0) && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="grid grid-cols-2 gap-3">
          {stats.lowStock > 0 && (
            <button onClick={() => setStockFilter(f => f === 'low' ? 'all' : 'low')}
              className="rounded-2xl p-3 flex items-center gap-3 transition-all active:scale-95"
              style={{ background: 'rgba(245,158,11,0.08)', border: `1px solid ${stockFilter === 'low' ? '#f59e0b' : 'rgba(245,158,11,0.25)'}` }}>
              <AlertTriangle size={15} className="text-amber-500 flex-shrink-0" />
              <div className="text-left">
                <p className="text-xs font-bold text-amber-600">{stats.lowStock} Low Stock</p>
                <p className="text-[10px]" style={{ color: 'var(--t-muted)' }}>Tap to filter</p>
              </div>
            </button>
          )}
          {stats.outOfStock > 0 && (
            <button onClick={() => setStockFilter(f => f === 'out' ? 'all' : 'out')}
              className="rounded-2xl p-3 flex items-center gap-3 transition-all active:scale-95"
              style={{ background: 'rgba(255,92,92,0.08)', border: `1px solid ${stockFilter === 'out' ? '#FF5C5C' : 'rgba(255,92,92,0.25)'}` }}>
              <AlertTriangle size={15} className="text-red-500 flex-shrink-0" />
              <div className="text-left">
                <p className="text-xs font-bold text-red-500">{stats.outOfStock} Out of Stock</p>
                <p className="text-[10px]" style={{ color: 'var(--t-muted)' }}>Tap to filter</p>
              </div>
            </button>
          )}
        </motion.div>
      )}

      {/* ── Top Selling Bar Chart ── */}
      {topSelling.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="rounded-2xl p-4" style={{ background: 'var(--t-card-bg)', border: '1px solid var(--t-card-border)' }}>
          <p className="text-sm font-bold mb-4" style={{ color: 'var(--t-text)' }}>Top Selling Products</p>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={topSelling} margin={{ top: 4, right: 4, left: -22, bottom: 0 }} barSize={10}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--t-card-border)" strokeOpacity={0.5} />
              <XAxis dataKey="name" tick={{ fontSize: 8, fill: 'var(--t-muted)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 8, fill: 'var(--t-muted)' }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="sold" name="Units Sold" radius={[4, 4, 0, 0]}>
                {topSelling.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {/* ── Category Breakdown Pie ── */}
      {categoryPieData.length > 1 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
          className="rounded-2xl p-4" style={{ background: 'var(--t-card-bg)', border: '1px solid var(--t-card-border)' }}>
          <p className="text-sm font-bold mb-3" style={{ color: 'var(--t-text)' }}>Stock Value by Category</p>
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0">
              <ResponsiveContainer width={100} height={100}>
                <PieChart>
                  <Pie data={categoryPieData} cx="50%" cy="50%" innerRadius={26} outerRadius={48} dataKey="value" strokeWidth={0}>
                    {categoryPieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-2 min-w-0">
              {categoryPieData.slice(0, 5).map((item, i) => {
                const pct = stats.totalValue > 0 ? (item.value / stats.totalValue * 100).toFixed(0) : '0'
                return (
                  <div key={item.name} className="flex items-center justify-between gap-2 min-w-0">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                      <span className="text-[11px] font-medium truncate" style={{ color: 'var(--t-text)' }}>{item.name}</span>
                    </div>
                    <span className="text-[10px] font-bold flex-shrink-0" style={{ color: 'var(--t-muted)' }}>{pct}%</span>
                  </div>
                )
              })}
            </div>
          </div>
        </motion.div>
      )}

      {/* ── Inventory Table ── */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
        className="rounded-2xl overflow-hidden" style={{ background: 'var(--t-card-bg)', border: '1px solid var(--t-card-border)' }}>

        {/* Toolbar */}
        <div className="p-4 space-y-3" style={{ borderBottom: '1px solid var(--t-card-border)' }}>
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-bold" style={{ color: 'var(--t-text)' }}>
              All Products
              <span className="text-xs font-normal ml-2" style={{ color: 'var(--t-muted)' }}>{filtered.length} items</span>
            </p>
            <ExportMenu onCSV={handleInvCSV} onExcel={handleInvExcel} onPDF={handleInvPDF} count={filtered.length} />
          </div>
          <div className="relative">
            <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--t-muted)' }} />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, SKU, category, supplier…"
              className="w-full pl-8 pr-3 py-2 rounded-xl text-xs focus:outline-none"
              style={{ background: 'var(--t-page-bg)', border: '1px solid var(--t-card-border)', color: 'var(--t-text)' }} />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-0.5" style={{ scrollbarWidth: 'none' }}>
            {([
              { id: 'all' as StockFilter, label: 'All'              },
              { id: 'ok'  as StockFilter, label: 'In Stock'         },
              { id: 'low' as StockFilter, label: `Low (${stats.lowStock})`  },
              { id: 'out' as StockFilter, label: `Out (${stats.outOfStock})` },
            ]).map(f => (
              <button key={f.id} onClick={() => setStockFilter(f.id)}
                className={cn('px-3 py-1.5 rounded-xl text-xs font-bold flex-shrink-0 transition-all active:scale-95',
                  stockFilter === f.id ? 'text-[#0B0F1A]' : '')}
                style={stockFilter === f.id
                  ? { background: 'var(--t-accent)' }
                  : { background: 'var(--t-page-bg)', border: '1px solid var(--t-card-border)', color: 'var(--t-muted)' }}>
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {isEmpty ? (
          <div className="text-center py-14">
            <Package size={32} className="mx-auto mb-3" style={{ color: 'var(--t-muted)' }} />
            <p className="text-sm font-bold" style={{ color: 'var(--t-text)' }}>No inventory data</p>
            <p className="text-xs mt-1" style={{ color: 'var(--t-muted)' }}>Add products to see inventory reports</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-10">
            <RotateCcw size={24} className="mx-auto mb-3" style={{ color: 'var(--t-muted)' }} />
            <p className="text-sm font-bold" style={{ color: 'var(--t-text)' }}>No matching products</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs" style={{ minWidth: 540 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--t-card-border)' }}>
                  {([
                    { key: 'name',   label: 'Product' },
                    { key: 'stock',  label: 'Stock'   },
                    { key: 'sold',   label: 'Sold'    },
                    { key: 'value',  label: 'Value'   },
                    { key: 'profit', label: 'Profit'  },
                  ] as { key: SortKey; label: string }[]).map(col => (
                    <th key={col.key}
                      onClick={() => toggleSort(col.key)}
                      className="px-4 py-3 text-left font-bold cursor-pointer select-none"
                      style={{ color: sortBy === col.key ? 'var(--t-accent)' : 'var(--t-muted)' }}>
                      <span className="flex items-center gap-1">
                        {col.label}
                        {sortBy === col.key
                          ? sortDir === 'asc' ? <ChevronUp size={10} /> : <ChevronDown size={10} />
                          : <ArrowUpDown size={9} style={{ opacity: 0.3 }} />}
                      </span>
                    </th>
                  ))}
                  <th className="px-4 py-3 text-left font-bold" style={{ color: 'var(--t-muted)' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.slice(0, 50).map((p, i) => (
                  <motion.tr key={p.id}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: Math.min(i * 0.02, 0.4) }}
                    style={{ borderBottom: '1px solid var(--t-card-border)' }}
                    className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-semibold max-w-[110px] truncate" style={{ color: 'var(--t-text)' }}>{p.name}</p>
                      {p.sku && <p className="text-[10px]" style={{ color: 'var(--t-muted)' }}>{p.sku}</p>}
                    </td>
                    <td className="px-4 py-3 font-bold" style={{ color: 'var(--t-text)' }}>{p.stock_qty}</td>
                    <td className="px-4 py-3 font-bold" style={{ color: '#00F8B4' }}>{p.totalSold}</td>
                    <td className="px-4 py-3 font-bold" style={{ color: 'var(--t-text)' }}>
                      Rs.&nbsp;{formatAmount(p.stockValue)}
                    </td>
                    <td className="px-4 py-3 font-bold" style={{ color: p.profit >= 0 ? '#4CAF50' : '#FF5C5C' }}>
                      Rs.&nbsp;{formatAmount(p.profit)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={p.status} />
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
            {filtered.length > 50 && (
              <p className="text-center text-xs py-3" style={{ color: 'var(--t-muted)' }}>
                Showing 50 of {filtered.length} products
              </p>
            )}
          </div>
        )}
      </motion.div>

      {/* ── Supplier Summary ── */}
      {bizSuppliers.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}
          className="rounded-2xl p-4" style={{ background: 'var(--t-card-bg)', border: '1px solid var(--t-card-border)' }}>
          <p className="text-sm font-bold mb-3" style={{ color: 'var(--t-text)' }}>Suppliers</p>
          <div className="space-y-2.5">
            {bizSuppliers.slice(0, 5).map(s => {
              const purchased = movements
                .filter(m => m.supplier_id === s.id && m.type === 'stock_in')
                .reduce((sum, m) => sum + m.total_amount, 0)
              return (
                <div key={s.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold" style={{ color: 'var(--t-text)' }}>{s.name}</p>
                    <p className="text-[10px]" style={{ color: 'var(--t-muted)' }}>{s.phone ?? '—'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold" style={{ color: 'var(--t-text)' }}>
                      Rs. {formatAmount(purchased)}
                    </p>
                    {s.balance > 0 && (
                      <p className="text-[10px] text-red-500">Owe Rs. {formatAmount(s.balance)}</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </motion.div>
      )}
    </div>
  )
}
