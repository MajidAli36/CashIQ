import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Invoice } from '../types'
import { nanoid } from 'nanoid'
import { getActiveBusinessId } from './business.store'

type AddInvoiceInput = Omit<Invoice, 'id' | 'invoice_no' | 'created_at' | 'business_id'> & { business_id?: string }

interface InvoiceStore {
  invoices: Invoice[]
  addInvoice: (inv: AddInvoiceInput) => string
  getNextInvoiceNo: (businessId?: string) => string
  getBusinessInvoices: (businessId: string) => Invoice[]
  migrateToBusinessId: (businessId: string) => void
}

export const useInvoiceStore = create<InvoiceStore>()(
  persist(
    (set, get) => ({
      invoices: [],

      addInvoice: (inv) => {
        const id = nanoid()
        const business_id = inv.business_id || getActiveBusinessId()
        const invoice_no = get().getNextInvoiceNo(business_id)
        const invoice: Invoice = { ...inv, id, invoice_no, business_id, created_at: new Date().toISOString() }
        set(s => ({ invoices: [invoice, ...s.invoices] }))
        return id
      },

      getNextInvoiceNo: (businessId?) => {
        const bid = businessId || getActiveBusinessId()
        const count = get().invoices.filter(i => i.business_id === bid).length + 1
        return `INV-${String(count).padStart(3, '0')}`
      },

      getBusinessInvoices: (businessId) =>
        get().invoices.filter(i => !i.business_id || i.business_id === businessId),

      migrateToBusinessId: (businessId) => set(s => ({
        invoices: s.invoices.map(i =>
          (!i.business_id || i.business_id === 'default') ? { ...i, business_id: businessId } : i
        )
      })),
    }),
    { name: 'rozcash-invoices' }
  )
)
