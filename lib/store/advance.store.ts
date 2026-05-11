import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AdvanceEntry } from '../types'
import { nanoid } from 'nanoid'
import { getActiveBusinessId } from './business.store'

type AddAdvanceInput = Omit<AdvanceEntry, 'id' | 'used_amount' | 'created_at' | 'business_id'> & { business_id?: string }

interface AdvanceStore {
  entries: AdvanceEntry[]
  addAdvance: (e: AddAdvanceInput) => void
  applyAdvance: (customerId: string, amount: number, businessId?: string) => void
  getCustomerBalance: (customerId: string, businessId?: string) => number
  getCustomerEntries: (customerId: string, businessId?: string) => AdvanceEntry[]
  getTotalAdvanceBalance: (businessId?: string) => number
  migrateToBusinessId: (businessId: string) => void
}

function matchBusiness<T extends { business_id?: string }>(item: T, businessId?: string): boolean {
  if (!businessId) return true
  return !item.business_id || item.business_id === businessId
}

export const useAdvanceStore = create<AdvanceStore>()(
  persist(
    (set, get) => ({
      entries: [],

      addAdvance: (e) => {
        const business_id = e.business_id || getActiveBusinessId()
        set(s => ({
          entries: [...s.entries, { ...e, id: nanoid(), business_id, used_amount: 0, created_at: new Date().toISOString() }],
        }))
      },

      // Greedy: consume oldest entries first
      applyAdvance: (customerId, amount, businessId?) => {
        let remaining = amount
        const updated = get().entries.map(entry => {
          if (entry.customer_id !== customerId || remaining <= 0) return entry
          if (!matchBusiness(entry, businessId)) return entry
          const available = entry.amount - entry.used_amount
          if (available <= 0) return entry
          const consume = Math.min(available, remaining)
          remaining -= consume
          return { ...entry, used_amount: entry.used_amount + consume }
        })
        set({ entries: updated })
      },

      getCustomerBalance: (customerId, businessId?) =>
        get().entries
          .filter(e => e.customer_id === customerId && matchBusiness(e, businessId))
          .reduce((sum, e) => sum + (e.amount - e.used_amount), 0),

      getCustomerEntries: (customerId, businessId?) =>
        get().entries
          .filter(e => e.customer_id === customerId && matchBusiness(e, businessId))
          .sort((a, b) => b.date.localeCompare(a.date)),

      getTotalAdvanceBalance: (businessId?) =>
        get().entries
          .filter(e => matchBusiness(e, businessId))
          .reduce((sum, e) => sum + (e.amount - e.used_amount), 0),

      migrateToBusinessId: (businessId) => set(s => ({
        entries: s.entries.map(e =>
          (!e.business_id || e.business_id === 'default') ? { ...e, business_id: businessId } : e
        )
      })),
    }),
    { name: 'rozcash-advances' }
  )
)
