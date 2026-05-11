// Inventory Module Types - Completely Isolated
export type ProductUnit = 'piece' | 'kg' | 'liter' | 'meter' | 'box' | 'dozen' | 'gram' | 'pack'
export type StockMovementType = 'stock_in' | 'stock_out' | 'adjustment' | 'return' | 'damaged'

export interface Product {
  id: string
  business_id: string
  name: string
  name_ur?: string
  sku?: string
  barcode?: string
  category_id?: string
  unit: ProductUnit
  cost_price: number        // Purchase price per unit
  sell_price: number        // Selling price per unit
  stock_qty: number         // Current stock quantity
  low_stock_alert: number   // Alert threshold
  supplier_id?: string
  image?: string
  description?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface StockMovement {
  id: string
  business_id: string
  product_id: string
  type: StockMovementType
  quantity: number          // Positive for in, negative for out
  unit_price: number        // Price per unit at time of movement
  total_amount: number      // quantity × unit_price
  wallet_id?: string        // Payment wallet (for purchases/sales)
  transaction_id?: string   // Linked transaction in main system
  supplier_id?: string
  customer_id?: string
  invoice_id?: string       // If linked to invoice
  note?: string
  date: string
  time: string
  created_by: string
  created_at: string
}

export interface Supplier {
  id: string
  business_id: string
  name: string
  name_ur?: string
  phone?: string
  email?: string
  address?: string
  city?: string
  balance: number           // Outstanding amount (positive = we owe them)
  is_active: boolean
  created_at: string
}

export interface InventoryStats {
  total_products: number
  active_products: number
  total_inventory_value: number      // Σ (stock_qty × cost_price)
  potential_revenue: number          // Σ (stock_qty × sell_price)
  potential_profit: number           // potential_revenue - total_inventory_value
  low_stock_count: number
  out_of_stock_count: number
}

export interface ProductWithStats extends Product {
  total_stock_in: number
  total_stock_out: number
  total_sold_value: number
  total_profit: number
  last_movement_date?: string
}

export type PaymentMethod = 'cash' | 'bank' | 'mcb'

export interface Sale {
  id: string
  business_id: string
  date: string
  time: string
  total_amount: number
  payment_method: PaymentMethod
  items: SaleItem[]
  created_at: string
}

export interface SaleItem {
  id: string
  sale_id: string
  product_id: string
  product_name: string
  quantity: number
  price: number
  subtotal: number
}
