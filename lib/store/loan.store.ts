import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Customer, LoanEntry } from '../types'
import { nanoid } from 'nanoid'
import { getActiveBusinessId } from './business.store'

type AddCustomerInput = Omit<Customer, 'id' | 'created_at' | 'business_id'> & { business_id?: string }
type AddEntryInput    = Omit<LoanEntry, 'id' | 'business_id'> & { business_id?: string }

interface LoanStore {
  customers: Customer[]
  entries: LoanEntry[]
  addCustomer: (c: AddCustomerInput) => string
  addEntry: (e: AddEntryInput) => void
  settleEntry: (entryId: string) => void
  getCustomerBalance: (customerId: string, businessId?: string) => number
  getTotalToReceive: (businessId?: string) => number
  getTotalToGive: (businessId?: string) => number
  getCustomerLedger: (customerId: string, businessId?: string) => LoanEntry[]
  searchCustomers: (query: string, businessId?: string) => Customer[]
  getBusinessCustomers: (businessId: string) => Customer[]
  migrateToBusinessId: (businessId: string) => void
}

function matchBusiness<T extends { business_id?: string }>(item: T, businessId?: string): boolean {
  if (!businessId) return true
  return !item.business_id || item.business_id === businessId
}

export const useLoanStore = create<LoanStore>()(
  persist(
    (set, get) => ({
      customers: [],
      entries: [],

      addCustomer: (c) => {
        const id = nanoid()
        const business_id = c.business_id || getActiveBusinessId()
        set(s => ({
          customers: [...s.customers, { ...c, id, business_id, created_at: new Date().toISOString() }]
        }))
        return id
      },

      addEntry: (e) => {
        const business_id = e.business_id || getActiveBusinessId()
        set(s => ({ entries: [...s.entries, { ...e, id: nanoid(), business_id }] }))
      },

      settleEntry: (entryId) => set(s => ({
        entries: s.entries.map(e =>
          e.id === entryId ? { ...e, is_settled: true, settled_at: new Date().toISOString() } : e
        )
      })),

      getCustomerBalance: (customerId, businessId?) => {
        const entries = get().entries.filter(e =>
          e.customer_id === customerId && !e.is_settled && matchBusiness(e, businessId)
        )
        return entries.reduce((sum, e) => e.direction === 'given' ? sum + e.amount : sum - e.amount, 0)
      },

      getTotalToReceive: (businessId?) =>
        get().entries
          .filter(e => e.direction === 'given' && !e.is_settled && matchBusiness(e, businessId))
          .reduce((sum, e) => sum + e.amount, 0),

      getTotalToGive: (businessId?) =>
        get().entries
          .filter(e => e.direction === 'received' && !e.is_settled && matchBusiness(e, businessId))
          .reduce((sum, e) => sum + e.amount, 0),

      getCustomerLedger: (customerId, businessId?) =>
        get().entries
          .filter(e => e.customer_id === customerId && matchBusiness(e, businessId))
          .sort((a, b) => b.date.localeCompare(a.date)),

      searchCustomers: (query, businessId?) => {
        const q = query.toLowerCase()
        return get().customers.filter(c =>
          matchBusiness(c, businessId) &&
          (c.name.toLowerCase().includes(q) || c.phone.includes(q))
        )
      },

      getBusinessCustomers: (businessId) =>
        get().customers
          .filter(c => matchBusiness(c, businessId))
          .sort((a, b) => b.created_at.localeCompare(a.created_at)),

      migrateToBusinessId: (businessId) => set(s => ({
        customers: s.customers.map(c =>
          (!c.business_id || c.business_id === 'default') ? { ...c, business_id: businessId } : c
        ),
        entries: s.entries.map(e =>
          (!e.business_id || e.business_id === 'default') ? { ...e, business_id: businessId } : e
        ),
      })),
    }),
    { name: 'rozcash-loans' }
  )
)
