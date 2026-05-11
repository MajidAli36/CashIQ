export function formatCurrency(amount: number | undefined | null): string {
  if (amount === undefined || amount === null) return 'Rs. 0'
  return `Rs. ${amount.toLocaleString('en-PK')}`
}

export function formatAmount(amount: number | undefined | null): string {
  if (amount === undefined || amount === null) return '0'
  return amount.toLocaleString('en-PK')
}
