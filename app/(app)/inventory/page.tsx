'use client'
import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useSubscriptionStore } from '@/lib/store/subscription.store'
import { useInventoryStore } from '@/lib/store/inventory.store'
import { useBusinessStore } from '@/lib/store/business.store'
import { useSettingsStore } from '@/lib/store/settings.store'
import { useTransactionStore } from '@/lib/store/transaction.store'
import { formatAmount } from '@/lib/utils/currency'
import { cn } from '@/lib/utils/cn'
import { Package, AlertTriangle, TrendingUp, Plus, ArrowRight, Lock, LayoutGrid, ShoppingCart, FileText, BarChart3, X, Check, Search, Trash2, Printer, Download, Share2, Wallet } from 'lucide-react'
import { GradientPageHeader } from '@/components/layout/GradientPageHeader'
import { format } from 'date-fns'

export default function InventoryDashboard() {
  const router = useRouter()
  const { isFeatureEnabled, subscription } = useSubscriptionStore()
  const { activeBusinessId } = useBusinessStore()
  const { getInventoryStats, getLowStockProducts, getOutOfStockProducts, getActiveProducts, getProducts, createSale, getSales, getSale } = useInventoryStore()
  const { getEnabledWallets, getBusinessWallets } = useSettingsStore()
  const { getWalletBalance } = useTransactionStore()

  const hasInventory = isFeatureEnabled('inventory') && subscription.status === 'active'
  const bid = activeBusinessId || ''

  // Tab state
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'sales' | 'transactions' | 'reports'>('overview')
  const [cart, setCart] = useState<{ product_id: string; product_name: string; quantity: number; price: number; cost_price: number }[]>([])
  const [selectedWalletId, setSelectedWalletId] = useState<string>('')
  const [showInvoice, setShowInvoice] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [saleDateFilter, setSaleDateFilter] = useState<'today' | 'week' | 'month' | 'all'>('today')
  const [discount, setDiscount] = useState(0)
  const [invoiceData, setInvoiceData] = useState<any>(null)

  useEffect(() => {
    if (!hasInventory) {
      router.replace('/settings/plans')
    }
  }, [hasInventory, router])

  if (!hasInventory) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ background: 'var(--t-page-bg)' }}>
        <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
          <Lock size={32} className="text-white/40" />
        </div>
        <h1 className="text-2xl font-black text-white mb-2">Inventory Module Locked</h1>
        <p className="text-white/50 text-sm text-center mb-6">Upgrade to Pro plan to access inventory management</p>
        <Link href="/settings/plans" className="px-6 py-3 rounded-xl bg-gradient-to-r from-teal to-cyan-400 text-navy font-bold">
          View Plans
        </Link>
      </div>
    )
  }

  // Computed values
  const stats = getInventoryStats(bid)
  const lowStock = getLowStockProducts(bid)
  const outOfStock = getOutOfStockProducts(bid)
  const activeProducts = getActiveProducts(bid)
  const allProducts = getProducts(bid)
  const sales = getSales(bid)

  // Filter products for search
  const filteredProducts = useMemo(() => {
    if (!searchQuery) return allProducts.filter(p => p.is_active && p.stock_qty > 0)
    return allProducts.filter(p => 
      p.is_active && 
      p.stock_qty > 0 &&
      (p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.sku?.toLowerCase().includes(searchQuery.toLowerCase()))
    )
  }, [allProducts, searchQuery])

  // Cart calculations
  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const cartProfit = cart.reduce((sum, item) => sum + ((item.price - item.cost_price) * item.quantity), 0)

  // Filter sales by date
  const filteredSales = useMemo(() => {
    const today = new Date().toISOString().split('T')[0]
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    
    return sales.filter(s => {
      if (saleDateFilter === 'all') return true
      if (saleDateFilter === 'today') return s.date === today
      if (saleDateFilter === 'week') return s.date >= weekAgo
      if (saleDateFilter === 'month') return s.date >= monthAgo
      return true
    }).sort((a, b) => b.created_at.localeCompare(a.created_at))
  }, [sales, saleDateFilter])

  // Add to cart
  const addToCart = (product: any) => {
    const existing = cart.find(item => item.product_id === product.id)
    if (existing) {
      if (existing.quantity < product.stock_qty) {
        setCart(cart.map(item => 
          item.product_id === product.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ))
      }
    } else {
      setCart([...cart, {
        product_id: product.id,
        product_name: product.name,
        quantity: 1,
        price: product.sell_price,
        cost_price: product.cost_price,
      }])
    }
  }

  // Update cart quantity
  const updateCartQty = (productId: string, qty: number) => {
    if (qty <= 0) {
      setCart(cart.filter(item => item.product_id !== productId))
    } else {
      const product = allProducts.find(p => p.id === productId)
      if (product && qty <= product.stock_qty) {
        setCart(cart.map(item => 
          item.product_id === productId ? { ...item, quantity: qty } : item
        ))
      }
    }
  }

  // Remove from cart
  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.product_id !== productId))
  }

  // Complete sale
  const completeSale = () => {
    if (cart.length === 0 || !selectedWalletId) return
    
    const selectedWallet = wallets.find(w => w.id === selectedWalletId)
    const sale = createSale(bid, cart, selectedWallet?.name?.toLowerCase() as any || 'cash')
    
    // Create invoice data
    const invoice = {
      id: sale.id,
      invoiceNumber: `INV-${sale.id.slice(-6).toUpperCase()}`,
      date: sale.date,
      time: sale.time,
      items: cart.map(item => ({
        name: item.product_name,
        quantity: item.quantity,
        price: item.price,
        subtotal: item.price * item.quantity,
      })),
      subtotal: cartTotal,
      discount: discount,
      total: cartTotal - discount,
      paymentMethod: selectedWallet?.name || 'Cash',
      shopName: 'CashIQ Store',
      footerMessage: 'Thank you for your purchase!',
    }
    
    setInvoiceData(invoice)
    setShowInvoice(sale)
    setCart([])
    setDiscount(0)
    setSelectedWalletId('')
  }

  const wallets = getBusinessWallets(bid)
  const enabledWallets = getEnabledWallets(bid)
  const totalBalance = enabledWallets.reduce((sum, w) => sum + getWalletBalance(w.id, bid), 0)
  const totalWealth = totalBalance + stats.total_inventory_value

  return (
    <div className="min-h-screen pb-24" style={{ background: 'var(--t-page-bg)' }}>
      <GradientPageHeader
        title="Inventory"
        titleUr="اسٹاک مینجمنٹ"
        backTo="/dashboard"
      >
        <div className="flex gap-1 p-1 rounded-xl mt-1" style={{ background: 'rgba(255,255,255,0.08)' }}>
          {[
            { id: 'overview', label: 'Overview', icon: LayoutGrid },
            { id: 'products', label: 'Products', icon: Package },
            { id: 'sales', label: 'Sales', icon: ShoppingCart },
            { id: 'transactions', label: 'Transactions', icon: FileText },
            { id: 'reports', label: 'Reports', icon: BarChart3 },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={cn(
                'flex-1 h-9 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5',
                activeTab === tab.id
                  ? 'bg-teal-500/20 text-teal-400 ring-1 ring-teal-400/30'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              )}
            >
              <tab.icon size={14} />
              {tab.label}
            </button>
          ))}
        </div>
      </GradientPageHeader>

      <AnimatePresence mode="wait">
      
      {/* ==================== OVERVIEW TAB ==================== */}
      {activeTab === 'overview' && (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="px-4 pt-3 pb-4">

        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 mb-6"
        >
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Inventory Value</p>
          <p className="text-4xl font-black text-gray-900">Rs. {formatAmount(stats.total_inventory_value)}</p>
          {stats.potential_profit > 0 && (
            <p className="text-sm text-emerald-600 font-medium mt-2">
              + Rs. {formatAmount(stats.potential_profit)} potential profit
            </p>
          )}
        </motion.div>

        {/* Metric Cards */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <Link href="/inventory/products" className="block">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl p-4 shadow-md border border-gray-100 cursor-pointer hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200"
            >
              <Package size={18} className="text-teal mb-2" />
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Active</p>
              <p className="text-2xl font-bold text-gray-900">{stats.active_products}</p>
            </motion.div>
          </Link>

          <Link href="/inventory/products?filter=low-stock" className="block">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-white rounded-xl p-4 shadow-md border border-gray-100 cursor-pointer hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200"
            >
              <AlertTriangle size={18} className="text-amber-500 mb-2" />
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Low Stock</p>
              <p className="text-2xl font-bold text-gray-900">{stats.low_stock_count}</p>
            </motion.div>
          </Link>

          <Link href="/inventory/products" className="block">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl p-4 shadow-md border border-gray-100 cursor-pointer hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200"
            >
              <TrendingUp size={18} className="text-emerald-500 mb-2" />
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Profit</p>
              <p className="text-2xl font-bold text-emerald-600">Rs. {formatAmount(stats.potential_profit)}</p>
            </motion.div>
          </Link>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Link href="/inventory/products?action=add">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="bg-gradient-to-r from-teal to-cyan-400 rounded-xl p-4 shadow-md cursor-pointer hover:shadow-lg hover:brightness-105 transition-all duration-200"
            >
              <div className="flex items-center gap-2">
                <Plus size={20} className="text-navy" />
                <span className="text-navy font-bold">Add Product</span>
              </div>
            </motion.div>
          </Link>

          <Link href="/inventory/products">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl p-4 shadow-md border border-gray-100 cursor-pointer hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200"
            >
              <div className="flex items-center gap-2">
                <Package size={18} className="text-gray-400" />
                <span className="text-gray-700 font-semibold">Manage Products</span>
              </div>
            </motion.div>
          </Link>
        </div>

        {/* Alerts */}
        {(lowStock.length > 0 || outOfStock.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="bg-amber-50 rounded-xl p-4 border border-amber-200 mb-6"
          >
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle size={16} className="text-amber-500" />
              <p className="text-xs font-bold text-amber-600 uppercase tracking-wider">Stock Alerts</p>
            </div>
            {outOfStock.length > 0 && (
              <p className="text-sm text-gray-700">
                <span className="font-bold text-red-500">{outOfStock.length}</span> products out of stock
              </p>
            )}
            {lowStock.length > 0 && (
              <p className="text-sm text-gray-700">
                <span className="font-bold text-amber-500">{lowStock.length}</span> products running low
              </p>
            )}
          </motion.div>
        )}
      </div>

      {/* Products List or Empty State */}
      {activeProducts.length > 0 ? (
        <div className="px-4 mt-6">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Recent Products</p>
            <Link href="/inventory/products" className="text-xs font-semibold text-teal">
              View All
            </Link>
          </div>

          <div className="space-y-2">
            {activeProducts.slice(0, 5).map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.05 }}
              >
                <Link href={`/inventory/products/${product.id}`}>
                  <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-bold text-gray-900">{product.name}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          Stock: <span className={cn('font-semibold', product.stock_qty <= product.low_stock_alert ? 'text-amber-500' : 'text-gray-500')}>{product.stock_qty}</span> {product.unit}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-emerald-600">Rs. {formatAmount(product.sell_price)}</p>
                        <p className="text-xs text-gray-400">Cost: {formatAmount(product.cost_price)}</p>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      ) : (
        <div className="px-4 mt-12 text-center">
          <div className="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <Package size={36} className="text-gray-300" />
          </div>
          <p className="text-xl font-bold text-gray-800 mb-2">No products yet</p>
          <p className="text-sm text-gray-500 mb-6 max-w-xs mx-auto">
            Start building your inventory. Track stock, profit, and performance in one place.
          </p>
          <Link href="/inventory/products?action=add">
            <button className="px-6 py-3 rounded-xl bg-gradient-to-r from-teal to-cyan-400 text-navy font-bold shadow-md hover:shadow-lg hover:brightness-105 transition-all">
              + Add your first product
            </button>
          </Link>
        </div>
      )}
      </motion.div>
      )}

      {/* ==================== PRODUCTS TAB ==================== */}
      {activeTab === 'products' && (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="px-4 pt-3 pb-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase">Products</p>
            <p className="text-sm text-gray-500">{activeProducts.length} products</p>
          </div>
          <Link href="/inventory/products?action=add">
            <button className="px-4 py-2 rounded-xl bg-gradient-to-r from-teal to-cyan-400 text-navy font-bold text-sm flex items-center gap-2">
              <Plus size={16} /> Add Product
            </button>
          </Link>
        </div>
        
        {activeProducts.length > 0 ? (
          <div className="space-y-2">
            {activeProducts.slice(0, 10).map(product => (
              <div key={product.id} className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                    <Package size={18} className="text-gray-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{product.name}</p>
                    <p className="text-xs text-gray-400">Rs. {formatAmount(product.sell_price)} • {product.stock_qty} {product.unit}</p>
                  </div>
                </div>
                {product.stock_qty <= product.low_stock_alert && (
                  <span className="px-2 py-1 rounded-lg bg-amber-100 text-amber-600 text-xs font-bold">Low Stock</span>
                )}
              </div>
            ))}
            {activeProducts.length > 10 && (
              <Link href="/inventory/products" className="block">
                <button className="w-full py-3 text-sm text-teal font-bold">View all {activeProducts.length} products →</button>
              </Link>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <Package size={40} className="text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">No products yet</p>
          </div>
        )}
      </div>
      </motion.div>
      )}

      {/* ==================== SALES TAB (POS) ==================== */}
      {activeTab === 'sales' && (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="flex h-[calc(100vh-180px)] gap-3 px-4 pt-3">
        
        {/* LEFT PANEL - Products */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Search */}
          <div className="mb-3">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-9 pr-4 rounded-xl border bg-white text-gray-900 text-sm focus:outline-none focus:border-teal"
              />
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1 overflow-y-auto">
            <div className="grid grid-cols-2 gap-2">
              {filteredProducts.map(product => (
                <button
                  key={product.id}
                  onClick={() => addToCart(product)}
                  className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 text-left hover:border-teal hover:shadow-md transition-all"
                >
                  <p className="text-sm font-semibold text-gray-900 truncate">{product.name}</p>
                  <p className="text-xs text-gray-400 mb-2">{product.stock_qty} in stock</p>
                  <p className="text-sm font-bold text-teal">Rs. {formatAmount(product.sell_price)}</p>
                </button>
              ))}
              {filteredProducts.length === 0 && (
                <div className="col-span-2 text-center py-12">
                  <Package size={40} className="text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">No products available</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT PANEL - Invoice/Cart */}
        <div className="w-80 flex flex-col bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Invoice Header */}
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
            <p className="text-sm font-bold text-gray-900">New Sale</p>
            <p className="text-xs text-gray-400">{format(new Date(), 'MMM dd, yyyy HH:mm')}</p>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-3">
            {cart.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingCart size={32} className="text-gray-300 mx-auto mb-2" />
                <p className="text-xs text-gray-400">Cart is empty</p>
                <p className="text-[10px] text-gray-300">Click products to add</p>
              </div>
            ) : (
              <div className="space-y-2">
                {cart.map(item => {
                  const product = allProducts.find(p => p.id === item.product_id)
                  const maxQty = product?.stock_qty || 0
                  
                  return (
                    <div key={item.product_id} className="bg-gray-50 rounded-lg p-2">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">{item.product_name}</p>
                          <p className="text-xs text-gray-400">Rs. {formatAmount(item.price)} each</p>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.product_id)}
                          className="w-6 h-6 rounded-lg bg-red-100 flex items-center justify-center hover:bg-red-200 transition-colors"
                        >
                          <Trash2 size={12} className="text-red-500" />
                        </button>
                      </div>
                      
                      {/* Quantity Controls */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => updateCartQty(item.product_id, item.quantity - 1)}
                            className="w-7 h-7 rounded-lg bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-100"
                          >
                            <span className="text-gray-600 font-bold">−</span>
                          </button>
                          <span className="w-8 text-center text-sm font-bold text-gray-900">{item.quantity}</span>
                          <button
                            onClick={() => updateCartQty(item.product_id, item.quantity + 1)}
                            disabled={item.quantity >= maxQty}
                            className={cn(
                              'w-7 h-7 rounded-lg flex items-center justify-center transition-colors',
                              item.quantity >= maxQty 
                                ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                                : 'bg-white border border-gray-200 hover:bg-gray-100'
                            )}
                          >
                            <span className="text-gray-600 font-bold">+</span>
                          </button>
                        </div>
                        <p className="text-sm font-bold text-gray-900">Rs. {formatAmount(item.price * item.quantity)}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Invoice Summary */}
          {cart.length > 0 && (
            <div className="border-t border-gray-100 p-3 space-y-2 bg-gray-50">
              {/* Subtotal */}
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span className="text-gray-900 font-medium">Rs. {formatAmount(cartTotal)}</span>
              </div>
              
              {/* Discount */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Discount</span>
                <div className="flex items-center gap-1">
                  <span className="text-sm text-red-500 font-medium">{discount > 0 ? `- Rs. ${formatAmount(discount)}` : 'Rs. 0'}</span>
                </div>
              </div>
              
              {/* Discount Input */}
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Discount"
                  value={discount || ''}
                  onChange={(e) => setDiscount(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="flex-1 h-8 px-2 rounded-lg border border-gray-200 text-sm text-right"
                />
              </div>

              {/* Total */}
              <div className="flex justify-between pt-2 border-t border-gray-200">
                <span className="text-sm font-bold text-gray-900">Total</span>
                <span className="text-lg font-black text-teal">Rs. {formatAmount(cartTotal - discount)}</span>
              </div>

              {/* Payment Method - Dynamic Wallets */}
              <div className="pt-2">
                <p className="text-xs font-bold text-gray-400 uppercase mb-2">Select Payment</p>
                <div className="grid grid-cols-2 gap-2">
                  {wallets.length > 0 ? wallets.map(wallet => (
                    <button
                      key={wallet.id}
                      onClick={() => setSelectedWalletId(wallet.id)}
                      className={cn(
                        'py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1',
                        selectedWalletId === wallet.id 
                          ? 'bg-teal text-navy' 
                          : 'bg-white border border-gray-200 text-gray-500 hover:border-teal'
                      )}
                    >
                      <Wallet size={12} />
                      {wallet.name}
                    </button>
                  )) : (
                    <button
                      onClick={() => setSelectedWalletId('cash')}
                      className={cn(
                        'py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1',
                        selectedWalletId === 'cash' 
                          ? 'bg-teal text-navy' 
                          : 'bg-white border border-gray-200 text-gray-500'
                      )}
                    >
                      💵 Cash
                    </button>
                  )}
                </div>
              </div>
              
              {/* Complete Sale Button */}
              <button
                onClick={() => {
                  setDiscount(0)
                  completeSale()
                }}
                disabled={cartTotal - discount <= 0 || !selectedWalletId}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-teal to-cyan-400 text-navy font-bold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Check size={18} /> Complete Sale
              </button>
            </div>
          )}
        </div>
        </div>
      </motion.div>
      )}

      {/* ==================== TRANSACTIONS TAB ==================== */}
      {activeTab === 'transactions' && (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="px-4 pt-3 pb-4">
        {/* Date Filter */}
        <div className="flex gap-2 mb-4">
          {(['today', 'week', 'month', 'all'] as const).map(filter => (
            <button
              key={filter}
              onClick={() => setSaleDateFilter(filter)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
                saleDateFilter === filter ? 'bg-teal text-navy' : 'bg-white text-gray-500 border border-gray-200'
              )}
            >
              {filter === 'today' ? 'Today' : filter === 'week' ? 'This Week' : filter === 'month' ? 'This Month' : 'All'}
            </button>
          ))}
        </div>

        {/* Sales List */}
        {filteredSales.length > 0 ? (
          <div className="space-y-2">
            {filteredSales.map(sale => (
              <div 
                key={sale.id} 
                onClick={() => setShowInvoice(sale)}
                className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 cursor-pointer hover:border-teal transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-sm font-bold text-gray-900">#{sale.id.slice(-6).toUpperCase()}</p>
                    <p className="text-xs text-gray-400">{sale.date} • {sale.time}</p>
                  </div>
                  <span className={cn(
                    'px-2 py-1 rounded-lg text-xs font-bold',
                    sale.payment_method === 'cash' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
                  )}>
                    {sale.payment_method}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-500">{sale.items.length} items</p>
                  <p className="text-lg font-black text-gray-900">Rs. {formatAmount(sale.total_amount)}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <FileText size={40} className="text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">No sales yet</p>
          </div>
        )}
      </div>
      </motion.div>
      )}

      {/* ==================== REPORTS TAB ==================== */}
      {activeTab === 'reports' && bid && (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="px-4 pt-3 pb-4 space-y-4">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <p className="text-xs font-bold text-gray-400 uppercase">Total Sales</p>
            <p className="text-2xl font-black text-gray-900">{filteredSales.length}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <p className="text-xs font-bold text-gray-400 uppercase">Revenue</p>
            <p className="text-2xl font-black text-teal">Rs. {formatAmount(filteredSales.reduce((sum, s) => sum + s.total_amount, 0))}</p>
          </div>
        </div>

        {/* Inventory Stats */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-xs font-bold text-gray-400 uppercase mb-3">Inventory Summary</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center py-2">
              <p className="text-xl font-bold text-gray-900">Rs. {formatAmount(stats.total_inventory_value)}</p>
              <p className="text-[10px] text-gray-400 uppercase">Value</p>
            </div>
            <div className="text-center py-2">
              <p className="text-xl font-bold text-amber-600">{stats.low_stock_count}</p>
              <p className="text-[10px] text-gray-400 uppercase">Low Stock</p>
            </div>
          </div>
        </div>

        {/* Low Stock Alert */}
        {lowStock.length > 0 && (
          <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
            <p className="text-xs font-bold text-amber-600 uppercase mb-2">⚠️ Low Stock Alert</p>
            <div className="space-y-1">
              {lowStock.slice(0, 5).map(p => (
                <div key={p.id} className="flex justify-between text-sm">
                  <span className="text-gray-700">{p.name}</span>
                  <span className="font-bold text-amber-600">{p.stock_qty} left</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      </motion.div>
      )}
      </AnimatePresence>

      {/* Invoice Modal - Outside tabs */}
      {invoiceData && (
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setInvoiceData(null)}
        >
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            {/* Invoice Header */}
            <div className="bg-gradient-to-r from-teal to-cyan-400 p-6 text-navy rounded-t-2xl">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-bold opacity-70">{invoiceData.shopName}</p>
                <button 
                  onClick={() => setInvoiceData(null)}
                  className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center"
                >
                  <X size={16} />
                </button>
              </div>
              <p className="text-2xl font-black">INVOICE</p>
              <p className="text-sm font-bold opacity-80">{invoiceData.invoiceNumber}</p>
            </div>

            {/* Invoice Details */}
            <div className="p-6">
              <div className="flex justify-between text-sm mb-4 pb-4 border-b border-gray-100">
                <div>
                  <p className="text-gray-400 text-xs">Date</p>
                  <p className="font-semibold">{invoiceData.date}</p>
                </div>
                <div className="text-right">
                  <p className="text-gray-400 text-xs">Time</p>
                  <p className="font-semibold">{invoiceData.time}</p>
                </div>
              </div>

              {/* Items */}
              <div className="space-y-3 mb-4">
                {invoiceData.items.map((item: any, i: number) => (
                  <div key={i} className="flex justify-between text-sm">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{item.name}</p>
                      <p className="text-gray-400 text-xs">{item.quantity} × Rs. {formatAmount(item.price)}</p>
                    </div>
                    <p className="font-bold text-gray-900">Rs. {formatAmount(item.subtotal)}</p>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="border-t border-gray-100 pt-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-medium">Rs. {formatAmount(invoiceData.subtotal)}</span>
                </div>
                {invoiceData.discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Discount</span>
                    <span className="font-medium text-red-500">- Rs. {formatAmount(invoiceData.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t border-gray-100">
                  <span className="font-bold text-gray-900">Total</span>
                  <span className="text-xl font-black text-teal">Rs. {formatAmount(invoiceData.total)}</span>
                </div>
              </div>

              {/* Payment Method */}
              <div className="mt-4 p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-400 uppercase">Payment</span>
                  <span className="px-3 py-1 bg-teal text-navy rounded-lg text-xs font-bold">
                    {invoiceData.paymentMethod}
                  </span>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-500">{invoiceData.footerMessage}</p>
              </div>

              {/* Actions */}
              <div className="flex gap-2 mt-6">
                <button 
                  onClick={() => window.print()}
                  className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-700 font-bold text-sm flex items-center justify-center gap-2 hover:bg-gray-200"
                >
                  <Printer size={16} /> Print
                </button>
                <button 
                  onClick={() => {
                    const text = `Invoice: ${invoiceData.invoiceNumber}\nDate: ${invoiceData.date}\nTotal: Rs. ${formatAmount(invoiceData.total)}\nPayment: ${invoiceData.paymentMethod}`
                    navigator.clipboard.writeText(text)
                  }}
                  className="flex-1 py-3 rounded-xl bg-teal text-navy font-bold text-sm flex items-center justify-center gap-2"
                >
                  <Share2 size={16} /> Share
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}
