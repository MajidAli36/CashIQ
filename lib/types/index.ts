export type WalletType = 'cash' | 'jazzcash' | 'easypaisa' | 'bank' | 'custom'
export type TransactionType = 'income' | 'expense' | 'transfer' | 'loan_given' | 'loan_received' | 'opening_balance' | 'adjustment' | 'reversal' | 'advance_received' | 'advance_offset'
export type PlanId = 'starter' | 'growth' | 'business' | 'pro'
export type BillingCycle = 'monthly' | 'annual'
export type UserRole = 'owner' | 'manager' | 'staff'
export type LoanDirection = 'given' | 'received'
export type BusinessTypeId = 'mobile_shop' | 'repair_shop' | 'garments' | 'grocery' | 'freelancer' | 'manufacturer' | 'other'
export type Language = 'en' | 'ur'

export interface Business {
  id: string
  name: string
  type: BusinessTypeId
  owner_name: string
  phone: string
  city: string
  currency: string
  country_code: string
  color: string
  created_at: string
  is_default: boolean
}

export interface Wallet {
  id: string
  business_id: string
  name: string
  name_ur?: string
  color: string
  icon: string
  type: WalletType
  account_number?: string
  is_enabled: boolean
  is_default: boolean
  sort_order: number
  created_at: string
}

export interface Category {
  id: string
  business_id: string
  name_en: string
  name_ur: string
  type: 'income' | 'expense'
  icon: string
  color: string
  is_default: boolean
  is_enabled: boolean
}

export interface Transaction {
  id: string
  business_id: string
  type: TransactionType
  category_id: string
  amount: number
  wallet_id: string
  from_wallet_id?: string
  to_wallet_id?: string
  note_en?: string
  note_ur?: string
  photo_url?: string
  customer_id?: string
  invoice_id?: string
  date: string
  time: string
  is_reversed: boolean
  reversal_id?: string
  is_deleted?: boolean
  deleted_at?: string
  created_by: string
  created_at: string
  updated_at: string
}

export interface Customer {
  id: string
  business_id: string
  name: string
  phone: string
  notes?: string
  created_at: string
}

export interface LoanEntry {
  id: string
  business_id: string
  customer_id: string
  transaction_id: string
  amount: number
  direction: LoanDirection
  wallet_id: string
  date: string
  note_en?: string
  note_ur?: string
  is_settled: boolean
  settled_at?: string
}

export interface InvoiceItem {
  id: string
  name_en: string
  name_ur: string
  quantity: number
  price: number
  total: number
}

export interface Invoice {
  id: string
  business_id: string
  invoice_no: string
  customer_id?: string
  customer_name?: string
  items: InvoiceItem[]
  subtotal: number
  discount: number
  total: number
  wallet_id: string
  is_loan: boolean
  date: string
  note?: string
  created_at: string
}

export interface WalletClose {
  wallet_id: string
  wallet_name: string
  expected_balance: number
  actual_balance: number
  difference: number
  adjustment_created: boolean
}

export interface DailyClose {
  id: string
  business_id: string
  date: string
  total_income: number
  total_expense: number
  real_earning: number
  wallets: WalletClose[]
  is_locked: boolean
  closed_at: string
}

export interface TeamMember {
  id: string
  name: string
  phone: string
  role: UserRole
  pin?: string
  is_active: boolean
  created_at: string
  invited_at?: string
  joined_at?: string
  invitation_status: 'pending' | 'accepted' | 'rejected'
  invited_by?: string
  last_active_at?: string
  permissions?: Record<string, boolean>
}

export interface ShopProfile {
  name: string
  owner_name: string
  phone: string
  city: string
  business_type: BusinessTypeId
  language: Language
  currency: string
  country_code: string
  pin_enabled: boolean
  pin_hash?: string
  created_at: string
}

export interface BusinessItem {
  id: string
  name_en: string
  name_ur: string
  is_default: boolean
  is_enabled: boolean
}

export interface AdvanceEntry {
  id: string
  business_id: string
  customer_id: string
  transaction_id: string
  amount: number
  wallet_id: string
  date: string
  note?: string
  used_amount: number
  created_at: string
}

export interface SubscriptionState {
  plan_id: PlanId
  billing_cycle: BillingCycle
  status: 'active' | 'pending' | 'expired'
  start_date: string
  end_date: string
  payment_method?: string
  screenshot_url?: string
}

export type CheckStatus = 'active' | 'cleared' | 'bounced' | 'returned' | 'cancelled'

export interface CheckGuarantee {
  id: string
  business_id: string
  customer_id: string
  
  // Check Details
  check_number: string
  bank_name: string
  check_date: string
  check_amount: number
  
  // Status Tracking
  status: CheckStatus
  
  // Payment Tracking
  total_paid: number
  remaining_balance: number
  
  // Metadata
  note?: string
  photo_url?: string
  created_at: string
  updated_at: string
}

export interface InstallmentPayment {
  id: string
  business_id: string
  customer_id: string
  check_guarantee_id: string
  
  // Payment Details
  amount: number
  payment_method: WalletType
  wallet_id: string
  
  // Transaction Link
  transaction_id: string
  
  // Metadata
  date: string
  note?: string
  created_at: string
}

export interface PaymentSchedule {
  id: string
  check_guarantee_id: string
  
  // Schedule Details
  installment_number: number
  due_date: string
  expected_amount: number
  
  // Status
  is_paid: boolean
  paid_amount?: number
  paid_date?: string
  installment_payment_id?: string
}
