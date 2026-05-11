import type { Category } from '../types'

export const DEFAULT_CATEGORIES: Omit<Category, 'id' | 'business_id'>[] = [
  { name_en: 'Sale',               name_ur: 'فروخت',          type: 'income',  icon: '🛒', color: '#3B6D11', is_default: true, is_enabled: true },
  { name_en: 'Repair',             name_ur: 'مرمت',           type: 'income',  icon: '🔧', color: '#3B6D11', is_default: true, is_enabled: true },
  { name_en: 'Service',            name_ur: 'سروس',           type: 'income',  icon: '⚙️', color: '#3B6D11', is_default: true, is_enabled: true },
  { name_en: 'Commission',         name_ur: 'کمیشن',          type: 'income',  icon: '💰', color: '#3B6D11', is_default: true, is_enabled: true },
  { name_en: 'Inventory Sale',     name_ur: 'اسٹاک فروخت',    type: 'income',  icon: '📦', color: '#3B6D11', is_default: true, is_enabled: true },
  { name_en: 'Other Income',       name_ur: 'دیگر آمدنی',     type: 'income',  icon: '➕', color: '#3B6D11', is_default: true, is_enabled: true },
  { name_en: 'Purchase',           name_ur: 'خریداری',        type: 'expense', icon: '🛍️', color: '#A32D2D', is_default: true, is_enabled: true },
  { name_en: 'Inventory Purchase', name_ur: 'اسٹاک خریداری',  type: 'expense', icon: '📥', color: '#A32D2D', is_default: true, is_enabled: true },
  { name_en: 'Rent',               name_ur: 'کرایہ',          type: 'expense', icon: '🏠', color: '#A32D2D', is_default: true, is_enabled: true },
  { name_en: 'Electricity',        name_ur: 'بجلی',           type: 'expense', icon: '⚡', color: '#A32D2D', is_default: true, is_enabled: true },
  { name_en: 'Salary',             name_ur: 'تنخواہ',         type: 'expense', icon: '👤', color: '#A32D2D', is_default: true, is_enabled: true },
  { name_en: 'Transport',          name_ur: 'ٹرانسپورٹ',      type: 'expense', icon: '🚗', color: '#A32D2D', is_default: true, is_enabled: true },
  { name_en: 'Other Expense',      name_ur: 'دیگر خرچہ',      type: 'expense', icon: '➖', color: '#A32D2D', is_default: true, is_enabled: true },
]
