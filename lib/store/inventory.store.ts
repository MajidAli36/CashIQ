import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { nanoid } from 'nanoid'
import { format } from 'date-fns'
import type {
  Product,
  StockMovement,
  Supplier,
  InventoryStats,
  ProductWithStats,
  StockMovementType,
  Sale,
  SaleItem,
  PaymentMethod,
} from '../types/inventory'
import { useTransactionStore } from './transaction.store'
import { useSettingsStore } from './settings.store'

interface InventoryStore {
  products: Product[]
  movements: StockMovement[]
  suppliers: Supplier[]
  sales: Sale[]

  // Product CRUD
  addProduct: (product: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => string
  updateProduct: (id: string, updates: Partial<Product>) => void
  deleteProduct: (id: string) => void
  toggleProduct: (id: string) => void
  getProduct: (id: string) => Product | undefined
  getProducts: (businessId: string) => Product[]
  getActiveProducts: (businessId: string) => Product[]
  getLowStockProducts: (businessId: string) => Product[]
  getOutOfStockProducts: (businessId: string) => Product[]

  // Stock Movement
  stockIn: (
    productId: string,
    quantity: number,
    unitPrice: number,
    walletId: string,
    businessId: string,
    supplierId?: string,
    note?: string
  ) => string
  stockOut: (
    productId: string,
    quantity: number,
    unitPrice: number,
    walletId: string,
    businessId: string,
    customerId?: string,
    invoiceId?: string,
    note?: string
  ) => string
  adjustStock: (
    productId: string,
    newQuantity: number,
    businessId: string,
    note?: string
  ) => string
  recordDamage: (
    productId: string,
    quantity: number,
    businessId: string,
    note?: string
  ) => string
  getMovements: (businessId: string, productId?: string) => StockMovement[]

  // Supplier CRUD
  addSupplier: (supplier: Omit<Supplier, 'id' | 'created_at'>) => string
  updateSupplier: (id: string, updates: Partial<Supplier>) => void
  deleteSupplier: (id: string) => void
  getSupplier: (id: string) => Supplier | undefined
  getSuppliers: (businessId: string) => Supplier[]

  // Sales
  createSale: (businessId: string, items: { product_id: string; product_name: string; quantity: number; price: number }[], paymentMethod: PaymentMethod) => Sale
  getSales: (businessId: string) => Sale[]
  getSale: (saleId: string) => Sale | undefined

  // Statistics & Calculations
  getInventoryStats: (businessId: string) => InventoryStats
  getProductWithStats: (productId: string, businessId: string) => ProductWithStats | undefined
  getTotalInventoryValue: (businessId: string) => number
  getPotentialRevenue: (businessId: string) => number
  getPotentialProfit: (businessId: string) => number
}

export const useInventoryStore = create<InventoryStore>()(
  persist(
    (set, get) => ({
      products: [],
      movements: [],
      suppliers: [],
      sales: [],

      // ────────────────────────────────────────────────────────────
      // PRODUCT CRUD
      // ────────────────────────────────────────────────────────────
      addProduct: (product) => {
        const id = nanoid()
        const now = new Date().toISOString()
        set((s) => ({
          products: [
            ...s.products,
            {
              ...product,
              id,
              created_at: now,
              updated_at: now,
            },
          ],
        }))
        return id
      },

      updateProduct: (id, updates) => {
        set((s) => ({
          products: s.products.map((p) =>
            p.id === id
              ? { ...p, ...updates, updated_at: new Date().toISOString() }
              : p
          ),
        }))
      },

      deleteProduct: (id) => {
        set((s) => ({
          products: s.products.filter((p) => p.id !== id),
          movements: s.movements.filter((m) => m.product_id !== id),
        }))
      },

      toggleProduct: (id) => {
        set((s) => ({
          products: s.products.map((p) =>
            p.id === id ? { ...p, is_active: !p.is_active } : p
          ),
        }))
      },

      getProduct: (id) => {
        return get().products.find((p) => p.id === id)
      },

      getProducts: (businessId) => {
        return get().products.filter((p) => p.business_id === businessId)
      },

      getActiveProducts: (businessId) => {
        return get().products.filter(
          (p) => p.business_id === businessId && p.is_active
        )
      },

      getLowStockProducts: (businessId) => {
        return get().products.filter(
          (p) =>
            p.business_id === businessId &&
            p.is_active &&
            p.stock_qty > 0 &&
            p.stock_qty <= p.low_stock_alert
        )
      },

      getOutOfStockProducts: (businessId) => {
        return get().products.filter(
          (p) => p.business_id === businessId && p.is_active && p.stock_qty === 0
        )
      },

      // ────────────────────────────────────────────────────────────
      // STOCK MOVEMENT (WITH AUTO TRANSACTION CREATION)
      // ────────────────────────────────────────────────────────────
      stockIn: (productId, quantity, unitPrice, walletId, businessId, supplierId, note) => {
        const product = get().getProduct(productId)
        if (!product) throw new Error('Product not found')

        const movementId = nanoid()
        const totalAmount = quantity * unitPrice
        const now = new Date()

        // 1. Create stock movement
        const movement: StockMovement = {
          id: movementId,
          business_id: businessId,
          product_id: productId,
          type: 'stock_in',
          quantity,
          unit_price: unitPrice,
          total_amount: totalAmount,
          wallet_id: walletId,
          supplier_id: supplierId,
          note,
          date: format(now, 'yyyy-MM-dd'),
          time: format(now, 'HH:mm'),
          created_by: 'owner',
          created_at: now.toISOString(),
        }

        // 2. Update product stock
        set((s) => ({
          movements: [...s.movements, movement],
          products: s.products.map((p) =>
            p.id === productId
              ? { ...p, stock_qty: p.stock_qty + quantity, updated_at: now.toISOString() }
              : p
          ),
        }))

        // 3. Auto-create expense transaction in main system
        const txnStore = useTransactionStore.getState()
        
        // Find inventory_purchase category or fallback to 'purchase'
        const categories = useSettingsStore.getState().categories
        const inventoryCat = categories.find(c => c.name_en === 'Inventory Purchase')
        const categoryId = inventoryCat?.id || categories.find(c => c.name_en === 'Purchase')?.id || 'purchase'
        
        const transactionId = txnStore.addTransaction({
          type: 'expense',
          category_id: categoryId,
          amount: totalAmount,
          wallet_id: walletId,
          business_id: businessId,
          date: format(now, 'yyyy-MM-dd'),
          time: format(now, 'HH:mm'),
          is_reversed: false,
          created_by: 'owner',
          note_en: `Stock In: ${product.name} × ${quantity}`,
          note_ur: `اسٹاک خریداری: ${product.name} × ${quantity}`,
        })

        // 4. Link transaction to movement
        set((s) => ({
          movements: s.movements.map((m) =>
            m.id === movementId ? { ...m, transaction_id: transactionId } : m
          ),
        }))

        return movementId
      },

      stockOut: (productId, quantity, unitPrice, walletId, businessId, customerId, invoiceId, note) => {
        const product = get().getProduct(productId)
        if (!product) throw new Error('Product not found')
        if (product.stock_qty < quantity) throw new Error('Insufficient stock')

        const movementId = nanoid()
        const totalAmount = quantity * unitPrice
        const now = new Date()

        // 1. Create stock movement
        const movement: StockMovement = {
          id: movementId,
          business_id: businessId,
          product_id: productId,
          type: 'stock_out',
          quantity: -quantity,
          unit_price: unitPrice,
          total_amount: totalAmount,
          wallet_id: walletId,
          customer_id: customerId,
          invoice_id: invoiceId,
          note,
          date: format(now, 'yyyy-MM-dd'),
          time: format(now, 'HH:mm'),
          created_by: 'owner',
          created_at: now.toISOString(),
        }

        // 2. Update product stock
        set((s) => ({
          movements: [...s.movements, movement],
          products: s.products.map((p) =>
            p.id === productId
              ? { ...p, stock_qty: p.stock_qty - quantity, updated_at: now.toISOString() }
              : p
          ),
        }))

        // 3. Auto-create income transaction in main system
        const txnStore = useTransactionStore.getState()
        
        // Find inventory_sale category or fallback to 'sale'
        const categories = useSettingsStore.getState().categories
        const inventoryCat = categories.find(c => c.name_en === 'Inventory Sale')
        const categoryId = inventoryCat?.id || categories.find(c => c.name_en === 'Sale')?.id || 'sale'
        
        const transactionId = txnStore.addTransaction({
          type: 'income',
          category_id: categoryId,
          amount: totalAmount,
          wallet_id: walletId,
          business_id: businessId,
          date: format(now, 'yyyy-MM-dd'),
          time: format(now, 'HH:mm'),
          is_reversed: false,
          created_by: 'owner',
          note_en: `Stock Sale: ${product.name} × ${quantity}`,
          note_ur: `اسٹاک فروخت: ${product.name} × ${quantity}`,
        })

        // 4. Link transaction to movement
        set((s) => ({
          movements: s.movements.map((m) =>
            m.id === movementId ? { ...m, transaction_id: transactionId } : m
          ),
        }))

        return movementId
      },

      adjustStock: (productId, newQuantity, businessId, note) => {
        const product = get().getProduct(productId)
        if (!product) throw new Error('Product not found')

        const movementId = nanoid()
        const difference = newQuantity - product.stock_qty
        const now = new Date()

        const movement: StockMovement = {
          id: movementId,
          business_id: businessId,
          product_id: productId,
          type: 'adjustment',
          quantity: difference,
          unit_price: 0,
          total_amount: 0,
          note,
          date: format(now, 'yyyy-MM-dd'),
          time: format(now, 'HH:mm'),
          created_by: 'owner',
          created_at: now.toISOString(),
        }

        set((s) => ({
          movements: [...s.movements, movement],
          products: s.products.map((p) =>
            p.id === productId
              ? { ...p, stock_qty: newQuantity, updated_at: now.toISOString() }
              : p
          ),
        }))

        return movementId
      },

      recordDamage: (productId, quantity, businessId, note) => {
        const product = get().getProduct(productId)
        if (!product) throw new Error('Product not found')
        if (product.stock_qty < quantity) throw new Error('Insufficient stock')

        const movementId = nanoid()
        const totalAmount = quantity * product.cost_price
        const now = new Date()

        const movement: StockMovement = {
          id: movementId,
          business_id: businessId,
          product_id: productId,
          type: 'damaged',
          quantity: -quantity,
          unit_price: product.cost_price,
          total_amount: totalAmount,
          note,
          date: format(now, 'yyyy-MM-dd'),
          time: format(now, 'HH:mm'),
          created_by: 'owner',
          created_at: now.toISOString(),
        }

        set((s) => ({
          movements: [...s.movements, movement],
          products: s.products.map((p) =>
            p.id === productId
              ? { ...p, stock_qty: p.stock_qty - quantity, updated_at: now.toISOString() }
              : p
          ),
        }))

        return movementId
      },

      getMovements: (businessId, productId) => {
        let movements = get().movements.filter((m) => m.business_id === businessId)
        if (productId) {
          movements = movements.filter((m) => m.product_id === productId)
        }
        return movements.sort((a, b) => b.created_at.localeCompare(a.created_at))
      },

      // ────────────────────────────────────────────────────────────
      // SUPPLIER CRUD
      // ────────────────────────────────────────────────────────────
      addSupplier: (supplier) => {
        const id = nanoid()
        set((s) => ({
          suppliers: [
            ...s.suppliers,
            {
              ...supplier,
              id,
              created_at: new Date().toISOString(),
            },
          ],
        }))
        return id
      },

      updateSupplier: (id, updates) => {
        set((s) => ({
          suppliers: s.suppliers.map((sup) =>
            sup.id === id ? { ...sup, ...updates } : sup
          ),
        }))
      },

      deleteSupplier: (id) => {
        set((s) => ({
          suppliers: s.suppliers.filter((sup) => sup.id !== id),
        }))
      },

      getSupplier: (id) => {
        return get().suppliers.find((sup) => sup.id === id)
      },

      getSuppliers: (businessId) => {
        return get().suppliers.filter((sup) => sup.business_id === businessId)
      },

      // ────────────────────────────────────────────────────────────
      // STATISTICS & CALCULATIONS
      // ────────────────────────────────────────────────────────────
      getInventoryStats: (businessId) => {
        const products = get().getProducts(businessId)
        const activeProducts = products.filter((p) => p.is_active)

        const total_inventory_value = activeProducts.reduce(
          (sum, p) => sum + p.stock_qty * p.cost_price,
          0
        )

        const potential_revenue = activeProducts.reduce(
          (sum, p) => sum + p.stock_qty * p.sell_price,
          0
        )

        const potential_profit = potential_revenue - total_inventory_value

        const low_stock_count = activeProducts.filter(
          (p) => p.stock_qty > 0 && p.stock_qty <= p.low_stock_alert
        ).length

        const out_of_stock_count = activeProducts.filter((p) => p.stock_qty === 0).length

        return {
          total_products: products.length,
          active_products: activeProducts.length,
          total_inventory_value,
          potential_revenue,
          potential_profit,
          low_stock_count,
          out_of_stock_count,
        }
      },

      getProductWithStats: (productId, businessId) => {
        const product = get().getProduct(productId)
        if (!product || product.business_id !== businessId) return undefined

        const movements = get().getMovements(businessId, productId)

        const total_stock_in = movements
          .filter((m) => m.type === 'stock_in')
          .reduce((sum, m) => sum + m.quantity, 0)

        const total_stock_out = Math.abs(
          movements
            .filter((m) => m.type === 'stock_out')
            .reduce((sum, m) => sum + m.quantity, 0)
        )

        const total_sold_value = movements
          .filter((m) => m.type === 'stock_out')
          .reduce((sum, m) => sum + Math.abs(m.total_amount), 0)

        const total_cost = movements
          .filter((m) => m.type === 'stock_out')
          .reduce((sum, m) => sum + Math.abs(m.quantity) * product.cost_price, 0)

        const total_profit = total_sold_value - total_cost

        const last_movement_date = movements[0]?.date

        return {
          ...product,
          total_stock_in,
          total_stock_out,
          total_sold_value,
          total_profit,
          last_movement_date,
        }
      },

      getTotalInventoryValue: (businessId) => {
        return get().getInventoryStats(businessId).total_inventory_value
      },

      getPotentialRevenue: (businessId) => {
        return get().getInventoryStats(businessId).potential_revenue
      },

      getPotentialProfit: (businessId) => {
        return get().getInventoryStats(businessId).potential_profit
      },

      // ────────────────────────────────────────────────────────────
      // SALES
      // ────────────────────────────────────────────────────────────
      createSale: (businessId: string, items: { product_id: string; product_name: string; quantity: number; price: number }[], paymentMethod: PaymentMethod) => {
        const now = new Date()
        const saleId = nanoid()
        const dateStr = format(now, 'yyyy-MM-dd')
        const timeStr = format(now, 'HH:mm')

        const saleItems: SaleItem[] = items.map((item) => ({
          id: nanoid(),
          sale_id: saleId,
          product_id: item.product_id,
          product_name: item.product_name,
          quantity: item.quantity,
          price: item.price,
          subtotal: item.quantity * item.price,
        }))

        const totalAmount = saleItems.reduce((sum, item) => sum + item.subtotal, 0)

        const sale: Sale = {
          id: saleId,
          business_id: businessId,
          date: dateStr,
          time: timeStr,
          total_amount: totalAmount,
          payment_method: paymentMethod,
          items: saleItems,
          created_at: now.toISOString(),
        }

        // Update product stock
        items.forEach((item) => {
          const product = get().getProduct(item.product_id)
          if (product) {
            get().updateProduct(item.product_id, {
              stock_qty: Math.max(0, product.stock_qty - item.quantity),
            })
          }
        })

        set((s) => ({
          sales: [...s.sales, sale],
        }))

        return sale
      },

      getSales: (businessId: string) => {
        return get().sales.filter(s => s.business_id === businessId)
      },

      getSale: (saleId: string) => {
        return get().sales.find(s => s.id === saleId)
      },
    }),
    { name: 'rozcash-inventory' }
  )
)
