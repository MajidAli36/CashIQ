import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Transaction } from '../types'
import { nanoid } from 'nanoid'
import { format } from 'date-fns'
import { getActiveBusinessId } from './business.store'

type AddTransactionInput = Omit<Transaction, 'id' | 'created_at' | 'updated_at' | 'business_id'> & { business_id?: string }

interface TransactionStore {
  transactions: Transaction[]
  addTransaction: (t: AddTransactionInput) => string
  editTransaction: (id: string, updates: Partial<Pick<Transaction, 'amount' | 'category_id' | 'wallet_id' | 'from_wallet_id' | 'to_wallet_id' | 'customer_id' | 'note_en' | 'note_ur'>>) => void
  softDeleteTransaction: (id: string) => void
  reverseTransaction: (id: string, createdBy: string) => void
  getByDateRange: (from: string, to: string, businessId?: string) => Transaction[]
  getByWallet: (walletId: string, businessId?: string) => Transaction[]
  getRealEarning: (from: string, to: string, businessId?: string) => number
  getTotalIncome: (from: string, to: string, businessId?: string) => number
  getTotalExpense: (from: string, to: string, businessId?: string) => number
  getWalletBalance: (walletId: string, businessId?: string) => number
  getMonthlyCount: (businessId?: string) => number
  getTodayCount: (businessId?: string) => number
  getRecent: (n: number, businessId?: string) => Transaction[]
  migrateToBusinessId: (businessId: string) => void
}

const EARNING_TYPES = new Set(['income', 'expense'])

function matchBusiness(t: Transaction, businessId?: string): boolean {
  if (!businessId) return true
  return !t.business_id || t.business_id === businessId
}

export const useTransactionStore = create<TransactionStore>()(
  persist(
    (set, get) => ({
      transactions: [],

      addTransaction: (t) => {
        const id = nanoid()
        const now = new Date().toISOString()
        const business_id = t.business_id || getActiveBusinessId()
        const txn: Transaction = { ...t, id, business_id, created_at: now, updated_at: now }
        set(s => ({ transactions: [txn, ...s.transactions] }))
        return id
      },

      editTransaction: (id, updates) => set(s => ({
        transactions: s.transactions.map(t =>
          t.id === id ? { ...t, ...updates, updated_at: new Date().toISOString() } : t
        ),
      })),

      softDeleteTransaction: (id) => set(s => ({
        transactions: s.transactions.map(t =>
          t.id === id
            ? { ...t, is_deleted: true, deleted_at: new Date().toISOString(), updated_at: new Date().toISOString() }
            : t
        ),
      })),

      reverseTransaction: (id, createdBy) => {
        const txn = get().transactions.find(t => t.id === id)
        if (!txn || txn.is_reversed) return
        const reversalId = nanoid()
        const now = new Date().toISOString()
        const reversal: Transaction = {
          ...txn,
          id: reversalId,
          type: 'reversal',
          reversal_id: id,
          is_reversed: false,
          created_by: createdBy,
          created_at: now,
          updated_at: now,
        }
        set(s => ({
          transactions: [
            reversal,
            ...s.transactions.map(t =>
              t.id === id ? { ...t, is_reversed: true, reversal_id: reversalId, updated_at: now } : t
            )
          ]
        }))
      },

      getByDateRange: (from, to, businessId?) =>
        get().transactions.filter(t =>
          t.date >= from && t.date <= to && matchBusiness(t, businessId)
        ),

      getByWallet: (walletId, businessId?) =>
        get().transactions.filter(t =>
          matchBusiness(t, businessId) &&
          (t.wallet_id === walletId || t.from_wallet_id === walletId || t.to_wallet_id === walletId)
        ),

      getRealEarning: (from, to, businessId?) => {
        const txns = get().getByDateRange(from, to, businessId)
          .filter(t => EARNING_TYPES.has(t.type) && !t.is_reversed && !t.is_deleted)
        return txns.reduce((sum, t) => t.type === 'income' ? sum + t.amount : sum - t.amount, 0)
      },

      getTotalIncome: (from, to, businessId?) =>
        get().getByDateRange(from, to, businessId)
          .filter(t => t.type === 'income' && !t.is_reversed && !t.is_deleted)
          .reduce((s, t) => s + t.amount, 0),

      getTotalExpense: (from, to, businessId?) =>
        get().getByDateRange(from, to, businessId)
          .filter(t => t.type === 'expense' && !t.is_reversed && !t.is_deleted)
          .reduce((s, t) => s + t.amount, 0),

      getWalletBalance: (walletId, businessId?) => {
        const txns = get().transactions.filter(t =>
          !t.is_reversed && !t.is_deleted && matchBusiness(t, businessId)
        )
        return txns.reduce((balance, t) => {
          if (t.type === 'opening_balance' && t.wallet_id === walletId) return balance + t.amount
          if (t.type === 'income'          && t.wallet_id === walletId) return balance + t.amount
          if (t.type === 'expense'         && t.wallet_id === walletId) return balance - t.amount
          if (t.type === 'loan_given'      && t.wallet_id === walletId) return balance - t.amount
          if (t.type === 'loan_received'   && t.wallet_id === walletId) return balance + t.amount
          if (t.type === 'transfer') {
            if (t.from_wallet_id === walletId) return balance - t.amount
            if (t.to_wallet_id   === walletId) return balance + t.amount
          }
          if (t.type === 'adjustment'       && t.wallet_id === walletId) return balance + t.amount
          if (t.type === 'advance_received' && t.wallet_id === walletId) return balance + t.amount
          if (t.type === 'advance_offset'   && t.wallet_id === walletId) return balance - t.amount
          if (t.type === 'reversal'         && t.wallet_id === walletId) return balance - t.amount
          return balance
        }, 0)
      },

      getMonthlyCount: (businessId?) => {
        const now = new Date()
        const month = format(now, 'yyyy-MM')
        return get().transactions.filter(t =>
          t.date.startsWith(month) &&
          !t.is_deleted &&
          matchBusiness(t, businessId) &&
          !['opening_balance', 'adjustment', 'reversal', 'transfer', 'advance_offset'].includes(t.type)
        ).length
      },

      getTodayCount: (businessId?) => {
        const today = format(new Date(), 'yyyy-MM-dd')
        return get().transactions.filter(t =>
          t.date === today &&
          !t.is_deleted &&
          matchBusiness(t, businessId) &&
          !['opening_balance', 'adjustment', 'reversal', 'transfer', 'advance_offset'].includes(t.type)
        ).length
      },

      getRecent: (n, businessId?) =>
        get().transactions
          .filter(t =>
            !t.is_reversed && !t.is_deleted &&
            t.type !== 'advance_offset' &&
            matchBusiness(t, businessId)
          )
          .slice(0, n),

      migrateToBusinessId: (businessId) => set(s => ({
        transactions: s.transactions.map(t =>
          (!t.business_id || t.business_id === 'default') ? { ...t, business_id: businessId } : t
        )
      })),
    }),
    { name: 'rozcash-transactions' }
  )
)
