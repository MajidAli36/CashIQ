'use client'
import { useSubscriptionStore } from '../store/subscription.store'
import { useTransactionStore } from '../store/transaction.store'

export function useTransactionLimit() {
  const monthlyCount = useTransactionStore(s => s.getMonthlyCount())
  const todayCount = useTransactionStore(s => s.getTodayCount())
  const { isTransactionAllowed, getTransactionLimitInfo } = useSubscriptionStore()
  const info = getTransactionLimitInfo(monthlyCount)
  return {
    isAllowed: isTransactionAllowed(monthlyCount, todayCount),
    ...info,
  }
}
