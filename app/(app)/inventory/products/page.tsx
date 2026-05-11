'use client'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useInventoryStore } from '@/lib/store/inventory.store'
import { useBusinessStore } from '@/lib/store/business.store'
import { useSubscriptionStore } from '@/lib/store/subscription.store'
import { formatAmount } from '@/lib/utils/currency'
import { cn } from '@/lib/utils/cn'
import { Package, Plus, Search, X, Check, Truck } from 'lucide-react'
import type { ProductUnit } from '@/lib/types/inventory'

const UNITS: { value: ProductUnit; label: string; labelUr: string }[] = [
  { value: 'piece', label: 'Piece', labelUr: 'عدد' },
  { value: 'kg', label: 'Kg', labelUr: 'کلو' },
  { value: 'liter', label: 'Liter', labelUr: 'لیٹر' },
  { value: 'meter', label: 'Meter', labelUr: 'میٹر' },
  { value: 'box', label: 'Box', labelUr: 'باکس' },
  { value: 'dozen', label: 'Dozen', labelUr: 'درجن' },
  { value: 'gram', label: 'Gram', labelUr: 'گرام' },
  { value: 'pack', label: 'Pack', labelUr: 'پیک' },
]

export default function ProductsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const showAdd = searchParams?.get('action') === 'add'

  const { isFeatureEnabled, subscription } = useSubscriptionStore()
  const { activeBusinessId } = useBusinessStore()
  const { getActiveProducts, addProduct, getSuppliers, addSupplier } = useInventoryStore()

  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(showAdd)
  const [formData, setFormData] = useState({
    name: '',
    name_ur: '',
    sku: '',
    unit: 'piece' as ProductUnit,
    cost_price: '',
    sell_price: '',
    stock_qty: '',
    low_stock_alert: '',
    supplier_id: '',
  })
  const [showSupplierModal, setShowSupplierModal] = useState(false)
  const [supplierForm, setSupplierForm] = useState({ name: '', phone: '' })

  const hasInventory = isFeatureEnabled('inventory') && subscription.status === 'active'
  const bid = activeBusinessId || ''

  useEffect(() => {
    if (!hasInventory) {
      router.replace('/settings/plans')
    }
  }, [hasInventory, router])

  if (!hasInventory) return null

  const products = getActiveProducts(bid).filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku?.toLowerCase().includes(search.toLowerCase())
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    addProduct({
      business_id: bid,
      name: formData.name,
      name_ur: formData.name_ur || undefined,
      sku: formData.sku || undefined,
      unit: formData.unit,
      cost_price: parseFloat(formData.cost_price) || 0,
      sell_price: parseFloat(formData.sell_price) || 0,
      stock_qty: parseFloat(formData.stock_qty) || 0,
      low_stock_alert: parseFloat(formData.low_stock_alert) || 5,
      supplier_id: formData.supplier_id || undefined,
      is_active: true,
    })

    setShowModal(false)
    setFormData({
      name: '',
      name_ur: '',
      sku: '',
      unit: 'piece',
      cost_price: '',
      sell_price: '',
      stock_qty: '',
      low_stock_alert: '',
      supplier_id: '',
    })
  }

  const profitMargin = formData.sell_price && formData.cost_price
    ? ((parseFloat(formData.sell_price) - parseFloat(formData.cost_price)) / parseFloat(formData.sell_price) * 100).toFixed(1)
    : '0'

  return (
    <div className="min-h-screen pb-24" style={{ background: 'var(--t-page-bg)' }}>
      {/* Header */}
      <div className="px-4 pt-6 pb-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-black tracking-tight" style={{ color: 'var(--t-text)' }}>Products</h1>
            <p className="text-sm" style={{ color: 'var(--t-muted)' }}>مصنوعات</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowModal(true)}
            className="w-12 h-12 rounded-xl bg-gradient-to-r from-teal to-cyan-400 flex items-center justify-center shadow-lg shadow-teal/40"
          >
            <Plus size={24} className="text-navy" strokeWidth={2.5} />
          </motion.button>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--t-muted)' }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="w-full h-12 pl-12 pr-4 rounded-xl border focus:outline-none focus:border-teal/70"
            style={{ background: 'var(--t-card-bg)', borderColor: 'var(--t-card-border)', color: 'var(--t-text)' }}
          />
        </div>

        {/* Product List */}
        <div className="space-y-2">
          {products.map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-xl p-4 border"
              style={{ background: 'var(--t-card-bg)', borderColor: 'var(--t-card-border)' }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <p className="text-base font-bold" style={{ color: 'var(--t-text)' }}>{product.name}</p>
                  {product.name_ur && (
                    <p className="font-urdu text-sm mt-0.5" style={{ color: 'var(--t-muted)' }}>{product.name_ur}</p>
                  )}
                  {product.sku && (
                    <p className="text-xs mt-1" style={{ color: 'var(--t-muted)' }}>SKU: {product.sku}</p>
                  )}
                </div>
                <div className={cn(
                  'px-2 py-1 rounded-lg text-xs font-bold',
                  product.stock_qty === 0 ? 'bg-expense/20 text-expense' :
                  product.stock_qty <= product.low_stock_alert ? 'bg-loan/20 text-loan' :
                  'bg-income/20 text-income'
                )}>
                  {product.stock_qty} {product.unit}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--t-muted)' }}>Cost</p>
                  <p className="text-sm font-bold" style={{ color: 'var(--t-text)' }}>Rs. {formatAmount(product.cost_price)}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--t-muted)' }}>Sell</p>
                  <p className="text-sm font-bold text-income">Rs. {formatAmount(product.sell_price)}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--t-muted)' }}>Profit</p>
                  <p className="text-sm font-bold text-teal">Rs. {formatAmount(product.sell_price - product.cost_price)}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {products.length === 0 && (
          <div className="text-center py-12">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'var(--t-card-bg)' }}>
              <Package size={32} style={{ color: 'var(--t-muted)' }} />
            </div>
            <p className="text-lg font-bold mb-2" style={{ color: 'var(--t-text)' }}>
              {search ? 'No products found' : 'No products yet'}
            </p>
            <p className="text-sm" style={{ color: 'var(--t-muted)' }}>
              {search ? 'Try a different search term' : 'Add your first product to get started'}
            </p>
          </div>
        )}
      </div>

      {/* Add Product Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.8)' }}
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg rounded-t-3xl md:rounded-3xl p-6 max-h-[90vh] overflow-y-auto"
              style={{ background: 'var(--t-card-bg)' }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-black" style={{ color: 'var(--t-text)' }}>Add Product</h2>
                <button onClick={() => setShowModal(false)} className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                  <X size={20} style={{ color: 'var(--t-muted)' }} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Product Name */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider mb-2 block" style={{ color: 'var(--t-muted)' }}>Product Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Samsung Galaxy A54"
                    className="w-full h-12 px-4 rounded-xl border focus:outline-none focus:border-teal/70"
                    style={{ background: 'var(--t-card-bg)', borderColor: 'var(--t-card-border)', color: 'var(--t-text)' }}
                  />
                </div>

                {/* Urdu Name */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider mb-2 block" style={{ color: 'var(--t-muted)' }}>Urdu Name (Optional)</label>
                  <input
                    type="text"
                    value={formData.name_ur}
                    onChange={(e) => setFormData({ ...formData, name_ur: e.target.value })}
                    placeholder="سام سنگ گلیکسی"
                    className="w-full h-12 px-4 rounded-xl border focus:outline-none focus:border-teal/70 font-urdu"
                    style={{ background: 'var(--t-card-bg)', borderColor: 'var(--t-card-border)', color: 'var(--t-text)' }}
                  />
                </div>

                {/* SKU & Unit */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider mb-2 block" style={{ color: 'var(--t-muted)' }}>SKU</label>
                    <input
                      type="text"
                      value={formData.sku}
                      onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                      placeholder="Optional"
                      className="w-full h-12 px-4 rounded-xl border focus:outline-none focus:border-teal/70"
                      style={{ background: 'var(--t-card-bg)', borderColor: 'var(--t-card-border)', color: 'var(--t-text)' }}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider mb-2 block" style={{ color: 'var(--t-muted)' }}>Unit</label>
                    <select
                      value={formData.unit}
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value as ProductUnit })}
                      className="w-full h-12 px-4 rounded-xl border focus:outline-none focus:border-teal/70"
                      style={{ background: 'var(--t-card-bg)', borderColor: 'var(--t-card-border)', color: 'var(--t-text)', colorScheme: 'dark' }}
                    >
                      {UNITS.map(u => (
                        <option key={u.value} value={u.value} style={{ background: '#1a1a2e', color: 'white' }}>
                          {u.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Cost & Sell Price */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider mb-2 block" style={{ color: 'var(--t-muted)' }}>Cost Price</label>
                    <input
                      type="number"
                      required
                      value={formData.cost_price}
                      onChange={(e) => setFormData({ ...formData, cost_price: e.target.value })}
                      placeholder="0"
                      className="w-full h-12 px-4 rounded-xl border focus:outline-none focus:border-teal/70"
                      style={{ background: 'var(--t-card-bg)', borderColor: 'var(--t-card-border)', color: 'var(--t-text)' }}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider mb-2 block" style={{ color: 'var(--t-muted)' }}>Sell Price</label>
                    <input
                      type="number"
                      required
                      value={formData.sell_price}
                      onChange={(e) => setFormData({ ...formData, sell_price: e.target.value })}
                      placeholder="0"
                      className="w-full h-12 px-4 rounded-xl border focus:outline-none focus:border-teal/70"
                      style={{ background: 'var(--t-card-bg)', borderColor: 'var(--t-card-border)', color: 'var(--t-text)' }}
                    />
                  </div>
                </div>

                {/* Profit Margin Display */}
                {formData.sell_price && formData.cost_price && (
                  <div className="rounded-xl p-3 bg-income/10 border border-income/20">
                    <p className="text-xs font-bold text-income/70 mb-1">Profit Margin</p>
                    <p className="text-lg font-black text-income">{profitMargin}%</p>
                  </div>
                )}

                {/* Stock & Alert */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider mb-2 block" style={{ color: 'var(--t-muted)' }}>Opening Stock</label>
                    <input
                      type="number"
                      required
                      value={formData.stock_qty}
                      onChange={(e) => setFormData({ ...formData, stock_qty: e.target.value })}
                      placeholder="0"
                      className="w-full h-12 px-4 rounded-xl border focus:outline-none focus:border-teal/70"
                      style={{ background: 'var(--t-card-bg)', borderColor: 'var(--t-card-border)', color: 'var(--t-text)' }}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider mb-2 block" style={{ color: 'var(--t-muted)' }}>Low Stock Alert</label>
                    <input
                      type="number"
                      value={formData.low_stock_alert}
                      onChange={(e) => setFormData({ ...formData, low_stock_alert: e.target.value })}
                      placeholder="5"
                      className="w-full h-12 px-4 rounded-xl border focus:outline-none focus:border-teal/70"
                      style={{ background: 'var(--t-card-bg)', borderColor: 'var(--t-card-border)', color: 'var(--t-text)' }}
                    />
                  </div>
                </div>

                {/* Supplier (Optional) */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider mb-2 block" style={{ color: 'var(--t-muted)' }}>Supplier (Optional)</label>
                  <div className="flex gap-2">
                    <select
                      value={formData.supplier_id}
                      onChange={(e) => setFormData({ ...formData, supplier_id: e.target.value })}
                      className="flex-1 h-12 px-4 rounded-xl border focus:outline-none focus:border-teal/70"
                      style={{ background: 'var(--t-card-bg)', borderColor: 'var(--t-card-border)', color: 'var(--t-text)', colorScheme: 'dark' }}
                    >
                      <option value="" style={{ background: '#1a1a2e', color: 'white' }}>Select Supplier</option>
                      {getSuppliers(bid).map(sup => (
                        <option key={sup.id} value={sup.id} style={{ background: '#1a1a2e', color: 'white' }}>
                          {sup.name}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => setShowSupplierModal(true)}
                      className="w-12 h-12 rounded-xl border flex items-center justify-center hover:bg-white/5 transition-colors"
                      style={{ borderColor: 'var(--t-card-border)' }}
                    >
                      <Plus size={18} style={{ color: 'var(--t-muted)' }} />
                    </button>
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  className="w-full h-12 rounded-xl bg-gradient-to-r from-teal to-cyan-400 text-navy font-bold flex items-center justify-center gap-2"
                >
                  <Check size={20} strokeWidth={2.5} />
                  Add Product
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Supplier Modal */}
      <AnimatePresence>
        {showSupplierModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.8)' }}
            onClick={() => setShowSupplierModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-2xl p-6"
              style={{ background: 'var(--t-card-bg)' }}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal/20 flex items-center justify-center">
                    <Truck size={20} className="text-teal" />
                  </div>
                  <h2 className="text-xl font-bold" style={{ color: 'var(--t-text)' }}>Add Supplier</h2>
                </div>
                <button onClick={() => setShowSupplierModal(false)} className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                  <X size={20} style={{ color: 'var(--t-muted)' }} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider mb-2 block" style={{ color: 'var(--t-muted)' }}>Name *</label>
                  <input
                    type="text"
                    required
                    value={supplierForm.name}
                    onChange={(e) => setSupplierForm({ ...supplierForm, name: e.target.value })}
                    placeholder="Supplier name"
                    className="w-full h-12 px-4 rounded-xl border focus:outline-none focus:border-teal/70"
                    style={{ background: 'var(--t-card-bg)', borderColor: 'var(--t-card-border)', color: 'var(--t-text)' }}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider mb-2 block" style={{ color: 'var(--t-muted)' }}>Phone (Optional)</label>
                  <input
                    type="tel"
                    value={supplierForm.phone}
                    onChange={(e) => setSupplierForm({ ...supplierForm, phone: e.target.value })}
                    placeholder="03XX-XXXXXXX"
                    className="w-full h-12 px-4 rounded-xl border focus:outline-none focus:border-teal/70"
                    style={{ background: 'var(--t-card-bg)', borderColor: 'var(--t-card-border)', color: 'var(--t-text)' }}
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowSupplierModal(false)}
                    className="flex-1 h-12 rounded-xl border font-semibold"
                    style={{ borderColor: 'var(--t-card-border)', color: 'var(--t-muted)' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (supplierForm.name.trim()) {
                        const newSupplier = addSupplier({
                          business_id: bid,
                          name: supplierForm.name.trim(),
                          phone: supplierForm.phone.trim() || undefined,
                          balance: 0,
                          is_active: true,
                        })
                        setFormData({ ...formData, supplier_id: newSupplier })
                        setSupplierForm({ name: '', phone: '' })
                        setShowSupplierModal(false)
                      }
                    }}
                    className="flex-1 h-12 rounded-xl bg-gradient-to-r from-teal to-cyan-400 text-navy font-bold"
                  >
                    Save Supplier
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
