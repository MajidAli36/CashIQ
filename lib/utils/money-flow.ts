import type { Transaction, Wallet } from '@/lib/types'
import { formatAmount } from './currency'

export interface WalletFlow {
  walletId: string
  walletName: string
  totalIn: number
  totalOut: number
  netFlow: number
  transfers: TransferDetail[]
  incomeTransactions: Transaction[]
  expenseTransactions: Transaction[]
}

export interface TransferDetail {
  id: string
  from: string
  to: string
  fromWalletId: string
  toWalletId: string
  amount: number
  date: string
  time: string
  note?: string
}

export interface CategoryFlow {
  categoryId: string
  categoryName: string
  amount: number
  percentage: number
  count: number
}

export function getWalletFlow(
  transactions: Transaction[],
  wallets: Wallet[],
  walletId: string,
  startDate?: string,
  endDate?: string
): WalletFlow {
  const wallet = wallets.find(w => w.id === walletId)
  
  let filtered = transactions.filter(t => {
    const matchesWallet = t.wallet_id === walletId || t.to_wallet_id === walletId
    if (!startDate || !endDate) return matchesWallet
    return matchesWallet && t.date >= startDate && t.date <= endDate
  })

  const incomeTransactions = filtered.filter(t => 
    t.wallet_id === walletId && t.type === 'income'
  )
  
  const expenseTransactions = filtered.filter(t =>
    t.wallet_id === walletId && t.type === 'expense'
  )
  
  const transfersIn = filtered.filter(t =>
    t.type === 'transfer' && t.to_wallet_id === walletId
  )
  
  const transfersOut = filtered.filter(t =>
    t.type === 'transfer' && t.wallet_id === walletId
  )

  const totalIn = 
    incomeTransactions.reduce((sum, t) => sum + t.amount, 0) +
    transfersIn.reduce((sum, t) => sum + t.amount, 0)
  
  const totalOut = 
    expenseTransactions.reduce((sum, t) => sum + t.amount, 0) +
    transfersOut.reduce((sum, t) => sum + t.amount, 0)

  const transfers: TransferDetail[] = [
    ...transfersIn.map(t => ({
      id: t.id,
      from: wallets.find(w => w.id === t.wallet_id)?.name || 'Unknown',
      to: wallet?.name || 'Unknown',
      fromWalletId: t.wallet_id,
      toWalletId: walletId,
      amount: t.amount,
      date: t.date,
      time: t.time || '',
      note: t.note_en,
    })),
    ...transfersOut.map(t => ({
      id: t.id,
      from: wallet?.name || 'Unknown',
      to: wallets.find(w => w.id === t.to_wallet_id)?.name || 'Unknown',
      fromWalletId: walletId,
      toWalletId: t.to_wallet_id || '',
      amount: t.amount,
      date: t.date,
      time: t.time || '',
      note: t.note_en,
    })),
  ].sort((a, b) => {
    const dateCompare = b.date.localeCompare(a.date)
    if (dateCompare !== 0) return dateCompare
    return (b.time || '').localeCompare(a.time || '')
  })

  return {
    walletId,
    walletName: wallet?.name || 'Unknown',
    totalIn,
    totalOut,
    netFlow: totalIn - totalOut,
    transfers,
    incomeTransactions,
    expenseTransactions,
  }
}

export function getAllWalletsFlow(
  transactions: Transaction[],
  wallets: Wallet[],
  startDate?: string,
  endDate?: string
): WalletFlow[] {
  return wallets.map(wallet => 
    getWalletFlow(transactions, wallets, wallet.id, startDate, endDate)
  )
}

export function getCategoryFlow(
  transactions: Transaction[],
  categories: any[],
  type: 'income' | 'expense',
  startDate?: string,
  endDate?: string
): CategoryFlow[] {
  let filtered = transactions.filter(t => {
    const matchesType = t.type === type
    if (!startDate || !endDate) return matchesType
    return matchesType && t.date >= startDate && t.date <= endDate
  })

  const categoryMap = new Map<string, { amount: number; count: number }>()
  
  filtered.forEach(t => {
    const existing = categoryMap.get(t.category_id) || { amount: 0, count: 0 }
    categoryMap.set(t.category_id, {
      amount: existing.amount + t.amount,
      count: existing.count + 1,
    })
  })

  const total = filtered.reduce((sum, t) => sum + t.amount, 0)

  return Array.from(categoryMap.entries()).map(([categoryId, data]) => {
    const category = categories.find(c => c.id === categoryId)
    return {
      categoryId,
      categoryName: category?.name_en || 'Unknown',
      amount: data.amount,
      percentage: total > 0 ? (data.amount / total) * 100 : 0,
      count: data.count,
    }
  }).sort((a, b) => b.amount - a.amount)
}

export function getTransferSummary(
  transactions: Transaction[],
  wallets: Wallet[],
  startDate?: string,
  endDate?: string
) {
  let transfers = transactions.filter(t => {
    const isTransfer = t.type === 'transfer'
    if (!startDate || !endDate) return isTransfer
    return isTransfer && t.date >= startDate && t.date <= endDate
  })

  const totalTransferred = transfers.reduce((sum, t) => sum + t.amount, 0)
  const transferCount = transfers.length

  const byRoute = new Map<string, { amount: number; count: number }>()
  
  transfers.forEach(t => {
    const fromWallet = wallets.find(w => w.id === t.wallet_id)
    const toWallet = wallets.find(w => w.id === t.to_wallet_id)
    const route = `${fromWallet?.name || 'Unknown'} → ${toWallet?.name || 'Unknown'}`
    
    const existing = byRoute.get(route) || { amount: 0, count: 0 }
    byRoute.set(route, {
      amount: existing.amount + t.amount,
      count: existing.count + 1,
    })
  })

  const topRoutes = Array.from(byRoute.entries())
    .map(([route, data]) => ({ route, ...data }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5)

  return {
    totalTransferred,
    transferCount,
    topRoutes,
    recentTransfers: transfers.slice(0, 10).map(t => ({
      id: t.id,
      from: wallets.find(w => w.id === t.wallet_id)?.name || 'Unknown',
      to: wallets.find(w => w.id === t.to_wallet_id)?.name || 'Unknown',
      amount: t.amount,
      date: t.date,
      time: t.time || '',
    })),
  }
}

export function getSankeyData(
  transactions: Transaction[],
  wallets: Wallet[],
  categories: any[],
  startDate?: string,
  endDate?: string
) {
  let filtered = transactions
  if (startDate && endDate) {
    filtered = transactions.filter(t => t.date >= startDate && t.date <= endDate)
  }

  const nodes: { id: string; label: string }[] = []
  const links: { source: string; target: string; value: number }[] = []

  const nodeSet = new Set<string>()
  const linkMap = new Map<string, number>()

  const addNode = (id: string, label: string) => {
    if (!nodeSet.has(id)) {
      nodes.push({ id, label })
      nodeSet.add(id)
    }
  }

  const addLink = (source: string, target: string, value: number) => {
    const key = `${source}-${target}`
    const existing = linkMap.get(key) || 0
    linkMap.set(key, existing + value)
  }

  filtered.forEach(t => {
    if (t.type === 'income') {
      const category = categories.find(c => c.id === t.category_id)
      const wallet = wallets.find(w => w.id === t.wallet_id)
      
      if (category && wallet) {
        addNode(`income-${t.category_id}`, category.name_en)
        addNode(`wallet-${t.wallet_id}`, wallet.name)
        addLink(`income-${t.category_id}`, `wallet-${t.wallet_id}`, t.amount)
      }
    } else if (t.type === 'expense') {
      const category = categories.find(c => c.id === t.category_id)
      const wallet = wallets.find(w => w.id === t.wallet_id)
      
      if (category && wallet) {
        addNode(`wallet-${t.wallet_id}`, wallet.name)
        addNode(`expense-${t.category_id}`, category.name_en)
        addLink(`wallet-${t.wallet_id}`, `expense-${t.category_id}`, t.amount)
      }
    } else if (t.type === 'transfer' && t.to_wallet_id) {
      const fromWallet = wallets.find(w => w.id === t.wallet_id)
      const toWallet = wallets.find(w => w.id === t.to_wallet_id)
      
      if (fromWallet && toWallet) {
        addNode(`wallet-${t.wallet_id}`, fromWallet.name)
        addNode(`wallet-${t.to_wallet_id}`, toWallet.name)
        addLink(`wallet-${t.wallet_id}`, `wallet-${t.to_wallet_id}`, t.amount)
      }
    }
  })

  linkMap.forEach((value, key) => {
    const [source, target] = key.split('-').slice(0, 2)
    const fullSource = key.substring(0, key.lastIndexOf('-' + target))
    const fullTarget = key.substring(key.indexOf('-' + target) + 1)
    links.push({ source: fullSource, target: fullTarget, value })
  })

  return { nodes, links }
}
