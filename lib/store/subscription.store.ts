import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { SubscriptionState, PlanId, BillingCycle } from '../types'
import { PLANS } from '../config/plans.config'
import { addMonths, addYears, format, startOfMonth, startOfDay } from 'date-fns'

interface UsageStats {
  monthlyTransactions: number
  dailyVoiceUses: number
  lastVoiceResetDate: string
  graceUsedToday: number
  lastGraceResetDate: string
}

interface SubscriptionStore {
  subscription: SubscriptionState
  usage: UsageStats
  setPlan: (planId: PlanId, billing: BillingCycle) => void
  activatePlan: () => void
  isFeatureEnabled: (feature: string) => boolean
  isTransactionAllowed: (monthlyCount: number, todayCount: number) => { allowed: boolean; reason?: string; isGrace?: boolean }
  isVoiceAllowed: (voiceUsedToday: number) => { allowed: boolean; reason?: string }
  getTransactionLimitInfo: (monthlyCount: number) => { used: number; limit: number | typeof Infinity; isUnlimited: boolean; isStarter: boolean; isGraceMode: boolean; graceRemaining: number }
  getVoiceLimitInfo: (voiceUsedToday: number) => { used: number; limit: number; isUnlimited: boolean }
  getPlan: () => typeof PLANS[number] | undefined
  recordVoiceUse: () => void
  recordGraceUse: () => void
  resetDailyUsage: () => void
}

const defaultSubscription: SubscriptionState = {
  plan_id: 'starter',
  billing_cycle: 'monthly',
  status: 'active',
  start_date: format(new Date(), 'yyyy-MM-dd'),
  end_date: format(addMonths(new Date(), 1), 'yyyy-MM-dd'),
}

const defaultUsage: UsageStats = {
  monthlyTransactions: 0,
  dailyVoiceUses: 0,
  lastVoiceResetDate: format(startOfDay(new Date()), 'yyyy-MM-dd'),
  graceUsedToday: 0,
  lastGraceResetDate: format(startOfDay(new Date()), 'yyyy-MM-dd'),
}

export const useSubscriptionStore = create<SubscriptionStore>()(
  persist(
    (set, get) => ({
      subscription: defaultSubscription,
      usage: defaultUsage,

      setPlan: (planId, billing) => {
        const now = new Date()
        const end = billing === 'annual' ? addYears(now, 1) : addMonths(now, 1)
        set({
          subscription: {
            plan_id: planId,
            billing_cycle: billing,
            status: 'active',
            start_date: format(now, 'yyyy-MM-dd'),
            end_date: format(end, 'yyyy-MM-dd'),
          }
        })
      },

      activatePlan: () => {
        set(s => ({
          subscription: { ...s.subscription, status: 'active' }
        }))
      },

      isFeatureEnabled: (feature) => {
        const plan = get().getPlan()
        return (plan?.features as Record<string, boolean>)?.[feature] ?? false
      },

      isTransactionAllowed: (monthlyCount, todayCount) => {
        const plan = get().getPlan()
        const usage = get().usage
        if (!plan) return { allowed: false, reason: 'No plan found' }

        const today = format(startOfDay(new Date()), 'yyyy-MM-dd')
        
        // Reset daily usage if new day
        if (usage.lastGraceResetDate !== today) {
          set(s => ({ usage: { ...s.usage, graceUsedToday: 0, lastGraceResetDate: today } }))
        }

        const monthlyLimit = plan.transaction_limit_monthly
        const dailyLimit = plan.transaction_limit_daily_after
        const graceLimit = plan.grace_limit_daily ?? 0
        const isStarter = plan.id === 'starter'

        // Unlimited plans
        if (monthlyLimit === Infinity) return { allowed: true }

        // Under monthly limit
        if (monthlyCount < monthlyLimit) return { allowed: true }

        // Starter plan - check grace
        if (isStarter && graceLimit > 0) {
          const graceUsed = usage.graceUsedToday
          if (graceUsed < graceLimit) {
            return { allowed: true, reason: 'Using grace', isGrace: true }
          }
        }

        // Over limit
        return { allowed: false, reason: 'Limit reached. Upgrade to continue.' }
      },

      isVoiceAllowed: (voiceUsedToday) => {
        const plan = get().getPlan()
        const usage = get().usage
        if (!plan) return { allowed: false, reason: 'No plan found' }

        const today = format(startOfDay(new Date()), 'yyyy-MM-dd')
        
        // Reset daily voice if new day
        if (usage.lastVoiceResetDate !== today) {
          set(s => ({ usage: { ...s.usage, dailyVoiceUses: 0, lastVoiceResetDate: today } }))
        }

        const voiceLimit = plan.voice_limit_daily ?? Infinity
        
        if (voiceLimit === Infinity) return { allowed: true }
        
        if (voiceUsedToday >= voiceLimit) {
          return { allowed: false, reason: `Voice limit reached for today (${voiceUsedToday}/${voiceLimit})` }
        }
        
        return { allowed: true }
      },

      getTransactionLimitInfo: (monthlyCount) => {
        const plan = get().getPlan()
        const usage = get().usage
        // Fallback to starter plan limits if no plan found
        const limit = plan?.transaction_limit_monthly ?? 300
        const graceLimit = plan?.grace_limit_daily ?? 5
        const isStarter = !plan || plan.id === 'starter'
        
        const today = format(startOfDay(new Date()), 'yyyy-MM-dd')
        const graceUsed = usage?.lastGraceResetDate === today ? usage.graceUsedToday : 0
        
        return {
          used: monthlyCount || 0,
          limit,
          isUnlimited: limit === Infinity,
          isStarter,
          isGraceMode: isStarter && (monthlyCount || 0) >= limit,
          graceRemaining: Math.max(0, graceLimit - graceUsed),
        }
      },

      getVoiceLimitInfo: (voiceUsedToday) => {
        const plan = get().getPlan()
        // Fallback to starter plan voice limit if no plan found
        const limit = plan?.voice_limit_daily ?? 3
        return {
          used: voiceUsedToday || 0,
          limit,
          isUnlimited: limit === Infinity,
        }
      },

      getPlan: () => {
        const planId = get().subscription.plan_id
        // Handle old plan IDs from localStorage
        const validPlans: Record<string, string> = {
          'free': 'starter',
          'basic': 'growth',
        }
        const mappedId = validPlans[planId] || planId
        return PLANS.find(p => p.id === mappedId) as typeof PLANS[number] | undefined
      },

      recordVoiceUse: () => {
        const today = format(startOfDay(new Date()), 'yyyy-MM-dd')
        set(s => {
          const newUsage = { ...s.usage }
          if (s.usage.lastVoiceResetDate !== today) {
            newUsage.dailyVoiceUses = 1
            newUsage.lastVoiceResetDate = today
          } else {
            newUsage.dailyVoiceUses += 1
          }
          return { usage: newUsage }
        })
      },

      recordGraceUse: () => {
        const today = format(startOfDay(new Date()), 'yyyy-MM-dd')
        set(s => {
          const newUsage = { ...s.usage }
          if (s.usage.lastGraceResetDate !== today) {
            newUsage.graceUsedToday = 1
            newUsage.lastGraceResetDate = today
          } else {
            newUsage.graceUsedToday += 1
          }
          return { usage: newUsage }
        })
      },

      resetDailyUsage: () => {
        const today = format(startOfDay(new Date()), 'yyyy-MM-dd')
        set(s => ({
          usage: {
            ...s.usage,
            dailyVoiceUses: 0,
            lastVoiceResetDate: today,
            graceUsedToday: 0,
            lastGraceResetDate: today,
          }
        }))
      },
    }),
    { name: 'rozcash-subscription' }
  )
)
