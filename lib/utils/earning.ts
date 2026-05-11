import type { Transaction } from '../types'

const EARNING_TYPES = new Set(['income', 'expense'])

export function calculateRealEarning(transactions: Transaction[]): number {
  return transactions
    .filter(t => EARNING_TYPES.has(t.type) && !t.is_reversed)
    .reduce((sum, t) => t.type === 'income' ? sum + t.amount : sum - t.amount, 0)
}

export function calculateTotalIncome(transactions: Transaction[]): number {
  return transactions
    .filter(t => t.type === 'income' && !t.is_reversed)
    .reduce((sum, t) => sum + t.amount, 0)
}

export function calculateTotalExpense(transactions: Transaction[]): number {
  return transactions
    .filter(t => t.type === 'expense' && !t.is_reversed)
    .reduce((sum, t) => sum + t.amount, 0)
}
