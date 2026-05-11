'use client'
import { useState, useMemo } from 'react'
import { Search, Filter, ChevronDown, TrendingUp, TrendingDown, DollarSign, Edit2, Trash2, X, Calendar, Download, FileText } from 'lucide-react'
import { useSettingsStore } from '@/lib/store/settings.store'
import { useTransactionStore } from '@/lib/store/transaction.store'
import { useBusinessStore } from '@/lib/store/business.store'
import { formatCurrency } from '@/lib/utils/currency'
import { cn } from '@/lib/utils/cn'
import { GradientPageHeader } from '@/components/layout/GradientPageHeader'

const ITEMS_PER_PAGE = 15

export default function RecordsPage() {
  const { categories, wallets } = useSettingsStore()
  const { transactions } = useTransactionStore()
  const { activeBusinessId } = useBusinessStore()
  const bid = activeBusinessId ?? undefined

  const [search, setSearch] = useState('')
  const [selectedType, setSelectedType] = useState('all')
  const [selectedWallet, setSelectedWallet] = useState('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [minAmount, setMinAmount] = useState('')
  const [maxAmount, setMaxAmount] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [showFilters, setShowFilters] = useState(false)
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  const enabledWallets = wallets.filter(w => w.is_enabled && (!bid || w.business_id === bid))

  const filteredTransactions = useMemo(() => {
    let filtered = transactions.filter(t => {
      if (bid && t.business_id && t.business_id !== bid) return false
      if (t.is_deleted || t.is_reversed) return false
      if (['reversal', 'advance_offset'].includes(t.type)) return false
      return true
    })

    if (search) {
      const q = search.toLowerCase()
      filtered = filtered.filter(t => {
        const cat = categories.find(c => c.id === t.category_id)
        return (
          cat?.name_en.toLowerCase().includes(q) ||
          t.note_en?.toLowerCase().includes(q)
        )
      })
    }

    if (selectedType !== 'all') {
      if (selectedType === 'income') {
        filtered = filtered.filter(t => ['income', 'advance_received'].includes(t.type))
      } else if (selectedType === 'expense') {
        filtered = filtered.filter(t => t.type === 'expense')
      } else if (selectedType === 'transfer') {
        filtered = filtered.filter(t => t.type === 'transfer')
      } else if (selectedType === 'loan') {
        filtered = filtered.filter(t => ['loan_given', 'loan_received'].includes(t.type))
      }
    }

    if (selectedWallet !== 'all') {
      filtered = filtered.filter(t => t.wallet_id === selectedWallet)
    }

    if (dateFrom) {
      filtered = filtered.filter(t => t.date >= dateFrom)
    }

    if (dateTo) {
      filtered = filtered.filter(t => t.date <= dateTo)
    }

    if (minAmount) {
      filtered = filtered.filter(t => Math.abs(t.amount) >= parseFloat(minAmount))
    }

    if (maxAmount) {
      filtered = filtered.filter(t => Math.abs(t.amount) <= parseFloat(maxAmount))
    }

    filtered.sort((a, b) => {
      if (sortBy === 'date') {
        const dateCompare = sortOrder === 'asc' 
          ? a.date.localeCompare(b.date)
          : b.date.localeCompare(a.date)
        if (dateCompare !== 0) return dateCompare
        return sortOrder === 'asc'
          ? a.time.localeCompare(b.time)
          : b.time.localeCompare(a.time)
      } else {
        return sortOrder === 'asc'
          ? Math.abs(a.amount) - Math.abs(b.amount)
          : Math.abs(b.amount) - Math.abs(a.amount)
      }
    })

    return filtered
  }, [transactions, search, selectedType, selectedWallet, dateFrom, dateTo, minAmount, maxAmount, sortBy, sortOrder, bid, categories])

  const summary = useMemo(() => {
    const income = filteredTransactions
      .filter(t => ['income', 'advance_received', 'loan_received'].includes(t.type))
      .reduce((sum, t) => sum + t.amount, 0)
    
    const expense = filteredTransactions
      .filter(t => ['expense', 'loan_given'].includes(t.type))
      .reduce((sum, t) => sum + t.amount, 0)

    return {
      income,
      expense: Math.abs(expense),
      net: income + expense
    }
  }, [filteredTransactions])

  const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const currentTransactions = filteredTransactions.slice(startIndex, endIndex)

  const handleSort = (field: 'date' | 'amount') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('desc')
    }
  }

  const clearFilters = () => {
    setSearch('')
    setSelectedType('all')
    setSelectedWallet('all')
    setDateFrom('')
    setDateTo('')
    setMinAmount('')
    setMaxAmount('')
    setCurrentPage(1)
  }

  const getTypeColor = (type: string) => {
    if (['income', 'advance_received', 'loan_received'].includes(type)) return 'text-emerald-600'
    if (['expense', 'loan_given'].includes(type)) return 'text-rose-600'
    return 'text-blue-600'
  }

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      income: 'Income',
      expense: 'Expense',
      transfer: 'Transfer',
      loan_given: 'Loan Given',
      loan_received: 'Loan Received',
      advance_received: 'Advance',
      opening_balance: 'Opening',
    }
    return labels[type] || type
  }

  const exportToExcel = () => {
    const headers = ['Date', 'Time', 'Category', 'Type', 'Payment Method', 'Amount', 'Note']
    const rows = filteredTransactions.map(t => {
      const category = categories.find(c => c.id === t.category_id)
      const wallet = wallets.find(w => w.id === t.wallet_id)
      return [
        t.date,
        t.time,
        category?.name_en || t.type,
        getTypeLabel(t.type),
        wallet?.name || '-',
        formatCurrency(Math.abs(t.amount)),
        t.note_en || '-'
      ]
    })

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  const exportToPDF = () => {
    const printWindow = window.open('', '', 'height=600,width=800')
    if (!printWindow) return

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Transaction Records Report</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { color: #1a1a2e; margin-bottom: 10px; }
          .summary { display: flex; gap: 20px; margin: 20px 0; }
          .summary-card { padding: 15px; border-radius: 8px; flex: 1; }
          .income { background: #10b981; color: white; }
          .expense { background: #ef4444; color: white; }
          .net { background: #3b82f6; color: white; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
          th { background-color: #f3f4f6; font-weight: bold; }
          .income-row { color: #10b981; font-weight: bold; }
          .expense-row { color: #ef4444; font-weight: bold; }
          @media print { button { display: none; } }
        </style>
      </head>
      <body>
        <h1>Transaction Records Report</h1>
        <p>Generated on: ${new Date().toLocaleDateString()}</p>
        <p>Total Transactions: ${filteredTransactions.length}</p>
        
        <div class="summary">
          <div class="summary-card income">
            <div>Income</div>
            <h2>${formatCurrency(summary.income)}</h2>
          </div>
          <div class="summary-card expense">
            <div>Expense</div>
            <h2>${formatCurrency(summary.expense)}</h2>
          </div>
          <div class="summary-card net">
            <div>Net Balance</div>
            <h2>${formatCurrency(Math.abs(summary.net))}</h2>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Time</th>
              <th>Category</th>
              <th>Type</th>
              <th>Payment</th>
              <th>Amount</th>
              <th>Note</th>
            </tr>
          </thead>
          <tbody>
            ${filteredTransactions.map(t => {
              const category = categories.find(c => c.id === t.category_id)
              const wallet = wallets.find(w => w.id === t.wallet_id)
              const isIncome = ['income', 'advance_received', 'loan_received'].includes(t.type)
              return `
                <tr>
                  <td>${t.date}</td>
                  <td>${t.time}</td>
                  <td>${category?.name_en || t.type}</td>
                  <td>${getTypeLabel(t.type)}</td>
                  <td>${wallet?.name || '-'}</td>
                  <td class="${isIncome ? 'income-row' : 'expense-row'}">
                    ${isIncome ? '+' : '-'}${formatCurrency(Math.abs(t.amount))}
                  </td>
                  <td>${t.note_en || '-'}</td>
                </tr>
              `
            }).join('')}
          </tbody>
        </table>
        
        <button onclick="window.print()" style="margin-top: 20px; padding: 10px 20px; background: #3b82f6; color: white; border: none; border-radius: 8px; cursor: pointer;">Print / Save as PDF</button>
      </body>
      </html>
    `

    printWindow.document.write(html)
    printWindow.document.close()
  }

  return (
    <div className="min-h-screen pb-20" style={{ background: 'var(--t-page-bg)' }}>
      
      <GradientPageHeader
        title="Records"
        titleUr="ریکارڈز"
        backTo="/dashboard"
        right={
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all active:scale-95"
            style={showFilters
              ? { background: 'var(--t-accent)', border: 'none' }
              : { background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.15)' }}
          >
            <Filter size={16} className={showFilters ? 'text-[#0B0F1A]' : 'text-white'} />
          </button>
        }
      />
      <div className="px-4 pt-3 pb-4">
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs font-semibold" style={{ color: 'var(--t-muted)' }}>
            {filteredTransactions.length} transactions found
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => exportToExcel()}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg font-semibold text-xs transition-all hover:opacity-80"
              style={{ background: 'var(--t-card-bg)', border: '1px solid var(--t-card-border)', color: 'var(--t-text)' }}>
              <Download size={13} />
              Excel
            </button>
            <button
              onClick={() => exportToPDF()}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg font-semibold text-xs transition-all hover:opacity-80"
              style={{ background: 'var(--t-card-bg)', border: '1px solid var(--t-card-border)', color: 'var(--t-text)' }}>
              <FileText size={13} />
              PDF
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="rounded-xl p-4" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)' }}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-emerald-100 text-xs font-semibold">Income</p>
              <TrendingUp size={16} className="text-emerald-200" />
            </div>
            <p className="text-white text-xl font-black">{formatCurrency(summary.income)}</p>
          </div>

          <div className="rounded-xl p-4" style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)' }}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-rose-100 text-xs font-semibold">Expense</p>
              <TrendingDown size={16} className="text-rose-200" />
            </div>
            <p className="text-white text-xl font-black">{formatCurrency(summary.expense)}</p>
          </div>

          <div className={cn("rounded-xl p-4")} style={{ 
            background: summary.net >= 0 
              ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' 
              : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            boxShadow: summary.net >= 0 
              ? '0 4px 12px rgba(59, 130, 246, 0.2)' 
              : '0 4px 12px rgba(245, 158, 11, 0.2)'
          }}>
            <div className="flex items-center justify-between mb-2">
              <p className={summary.net >= 0 ? 'text-blue-100' : 'text-amber-100'} style={{ fontSize: '12px', fontWeight: 600 }}>Net</p>
              <DollarSign size={16} className={summary.net >= 0 ? 'text-blue-200' : 'text-amber-200'} />
            </div>
            <p className="text-white text-xl font-black">{formatCurrency(Math.abs(summary.net))}</p>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="rounded-xl p-4 mb-4" style={{ background: 'var(--t-card-bg)', border: '1px solid var(--t-card-border)' }}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              
              {/* Search */}
              <div className="lg:col-span-3">
                <label className="block text-xs font-bold mb-2" style={{ color: 'var(--t-muted)' }}>Search</label>
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--t-muted)' }} />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by category or note..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{ background: 'var(--t-page-bg)', border: '1px solid var(--t-card-border)', color: 'var(--t-text)' }}
                  />
                </div>
              </div>

              {/* Type */}
              <div>
                <label className="block text-xs font-bold mb-2" style={{ color: 'var(--t-muted)' }}>Type</label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{ background: 'var(--t-page-bg)', border: '1px solid var(--t-card-border)', color: 'var(--t-text)' }}>
                  <option value="all">All Types</option>
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                  <option value="transfer">Transfer</option>
                  <option value="loan">Loans</option>
                </select>
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-xs font-bold mb-2" style={{ color: 'var(--t-muted)' }}>Payment Method</label>
                <select
                  value={selectedWallet}
                  onChange={(e) => setSelectedWallet(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{ background: 'var(--t-page-bg)', border: '1px solid var(--t-card-border)', color: 'var(--t-text)' }}>
                  <option value="all">All Methods</option>
                  {enabledWallets.map(w => (
                    <option key={w.id} value={w.id}>{w.name}</option>
                  ))}
                </select>
              </div>

              {/* Date From */}
              <div>
                <label className="block text-xs font-bold mb-2" style={{ color: 'var(--t-muted)' }}>Date From</label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{ background: 'var(--t-page-bg)', border: '1px solid var(--t-card-border)', color: 'var(--t-text)' }}
                />
              </div>

              {/* Date To */}
              <div>
                <label className="block text-xs font-bold mb-2" style={{ color: 'var(--t-muted)' }}>Date To</label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{ background: 'var(--t-page-bg)', border: '1px solid var(--t-card-border)', color: 'var(--t-text)' }}
                />
              </div>

              {/* Min Amount */}
              <div>
                <label className="block text-xs font-bold mb-2" style={{ color: 'var(--t-muted)' }}>Min Amount</label>
                <input
                  type="number"
                  value={minAmount}
                  onChange={(e) => setMinAmount(e.target.value)}
                  placeholder="0"
                  className="w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{ background: 'var(--t-page-bg)', border: '1px solid var(--t-card-border)', color: 'var(--t-text)' }}
                />
              </div>

              {/* Max Amount */}
              <div>
                <label className="block text-xs font-bold mb-2" style={{ color: 'var(--t-muted)' }}>Max Amount</label>
                <input
                  type="number"
                  value={maxAmount}
                  onChange={(e) => setMaxAmount(e.target.value)}
                  placeholder="999999"
                  className="w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{ background: 'var(--t-page-bg)', border: '1px solid var(--t-card-border)', color: 'var(--t-text)' }}
                />
              </div>

              {/* Clear Filters */}
              <div className="lg:col-span-3 flex justify-end">
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-80 transition-opacity"
                  style={{ background: 'var(--t-page-bg)', border: '1px solid var(--t-card-border)', color: 'var(--t-muted)' }}>
                  Clear All Filters
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="px-4">
        <div className="rounded-xl overflow-hidden" style={{ background: 'var(--t-card-bg)', border: '1px solid var(--t-card-border)' }}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead style={{ background: 'var(--t-page-bg)', borderBottom: '1px solid var(--t-card-border)' }}>
                <tr>
                  <th 
                    onClick={() => handleSort('date')}
                    className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider cursor-pointer hover:opacity-70 transition-opacity"
                    style={{ color: 'var(--t-muted)' }}>
                    Date {sortBy === 'date' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--t-muted)' }}>
                    Category
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--t-muted)' }}>
                    Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--t-muted)' }}>
                    Payment
                  </th>
                  <th 
                    onClick={() => handleSort('amount')}
                    className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider cursor-pointer hover:opacity-70 transition-opacity"
                    style={{ color: 'var(--t-muted)' }}>
                    Amount {sortBy === 'amount' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--t-muted)' }}>
                    Note
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center">
                        <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ background: 'var(--t-page-bg)' }}>
                          <Search size={24} style={{ color: 'var(--t-muted)' }} />
                        </div>
                        <p className="text-lg font-bold mb-1" style={{ color: 'var(--t-text)' }}>No transactions found</p>
                        <p className="text-sm" style={{ color: 'var(--t-muted)' }}>Try adjusting your filters</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  currentTransactions.map((transaction, idx) => {
                    const category = categories.find(c => c.id === transaction.category_id)
                    const wallet = wallets.find(w => w.id === transaction.wallet_id)
                    
                    return (
                      <tr 
                        key={transaction.id} 
                        className="hover:opacity-70 transition-opacity"
                        style={{ borderTop: idx > 0 ? '1px solid var(--t-card-border)' : 'none' }}>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold" style={{ color: 'var(--t-text)' }}>
                          {new Date(transaction.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          <span className="block text-xs mt-0.5" style={{ color: 'var(--t-muted)' }}>{transaction.time}</span>
                        </td>
                        <td className="px-4 py-3 text-sm font-medium" style={{ color: 'var(--t-text)' }}>
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{category?.icon || '💱'}</span>
                            <span>{category?.name_en || transaction.type}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={cn('text-xs font-semibold', getTypeColor(transaction.type))}>
                            {getTypeLabel(transaction.type)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm capitalize" style={{ color: 'var(--t-text)' }}>
                          {wallet?.name || '-'}
                        </td>
                        <td className={cn('px-4 py-3 text-right text-sm font-bold whitespace-nowrap', getTypeColor(transaction.type))}>
                          {['income', 'advance_received', 'loan_received'].includes(transaction.type) ? '+' : '-'}
                          Rs. {formatCurrency(Math.abs(transaction.amount))}
                        </td>
                        <td className="px-4 py-3 text-sm max-w-xs truncate" style={{ color: 'var(--t-muted)' }}>
                          {transaction.note_en || '-'}
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filteredTransactions.length > 0 && (
            <div className="px-4 py-3 flex items-center justify-between" style={{ borderTop: '1px solid var(--t-card-border)' }}>
              <div className="text-sm" style={{ color: 'var(--t-muted)' }}>
                Showing <span className="font-semibold" style={{ color: 'var(--t-text)' }}>{startIndex + 1}</span> to{' '}
                <span className="font-semibold" style={{ color: 'var(--t-text)' }}>{Math.min(endIndex, filteredTransactions.length)}</span> of{' '}
                <span className="font-semibold" style={{ color: 'var(--t-text)' }}>{filteredTransactions.length}</span> results
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 rounded-lg text-sm font-semibold disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-70 transition-opacity"
                  style={{ background: 'var(--t-page-bg)', border: '1px solid var(--t-card-border)', color: 'var(--t-text)' }}>
                  Previous
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum
                    if (totalPages <= 5) {
                      pageNum = i + 1
                    } else if (currentPage <= 3) {
                      pageNum = i + 1
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i
                    } else {
                      pageNum = currentPage - 2 + i
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={cn(
                          'w-8 h-8 rounded-lg text-sm font-semibold transition-all',
                          currentPage === pageNum ? 'bg-blue-500 text-white' : ''
                        )}
                        style={currentPage !== pageNum ? { background: 'var(--t-page-bg)', border: '1px solid var(--t-card-border)', color: 'var(--t-text)' } : {}}>
                        {pageNum}
                      </button>
                    )
                  })}
                </div>

                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 rounded-lg text-sm font-semibold disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-70 transition-opacity"
                  style={{ background: 'var(--t-page-bg)', border: '1px solid var(--t-card-border)', color: 'var(--t-text)' }}>
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
