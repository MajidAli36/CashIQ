import Dexie from 'dexie'
import type { Transaction, Customer, LoanEntry, Invoice, DailyClose } from '../types'

export class CashIQDB extends Dexie {
  transactions!: Dexie.Table<Transaction, string>
  customers!: Dexie.Table<Customer, string>
  loan_entries!: Dexie.Table<LoanEntry, string>
  invoices!: Dexie.Table<Invoice, string>
  daily_closes!: Dexie.Table<DailyClose, string>
  receipt_photos!: Dexie.Table<{ id: string; blob: Blob; txn_id: string }, string>

  constructor() {
    super('rozcash')
    this.version(1).stores({
      transactions: 'id, type, wallet_id, date, customer_id, created_at',
      customers: 'id, name, phone',
      loan_entries: 'id, customer_id, direction, date, is_settled',
      invoices: 'id, invoice_no, customer_id, date',
      daily_closes: 'id, date, is_locked',
      receipt_photos: 'id, txn_id',
    })
  }
}

export const db = new CashIQDB()
