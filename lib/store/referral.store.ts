import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { format, addDays } from 'date-fns'

export interface ReferralReward {
  invites: number
  rewardType: 'transactions' | 'business_plan' | 'pro_plan'
  rewardValue: number // transactions count or days
  description: string
  descriptionUr: string
}

export const REFERRAL_REWARDS: ReferralReward[] = [
  { invites: 1, rewardType: 'transactions', rewardValue: 20, description: '+20 Free Transactions', descriptionUr: '+20 مفت لین دین' },
  { invites: 3, rewardType: 'transactions', rewardValue: 100, description: '+100 Free Transactions', descriptionUr: '+100 مفت لین دین' },
  { invites: 5, rewardType: 'transactions', rewardValue: 300, description: '+300 Free Transactions', descriptionUr: '+300 مفت لین دین' },
  { invites: 10, rewardType: 'business_plan', rewardValue: 7, description: 'Business Plan (7 days)', descriptionUr: 'بزنس پلان (7 دن)' },
  { invites: 20, rewardType: 'pro_plan', rewardValue: 15, description: 'Pro Plan (15 days)', descriptionUr: 'پرو پلان (15 دن)' },
]

interface ReferralStore {
  referralCode: string
  referralLink: string
  referralCount: number
  claimedRewards: number[] // indices of claimed rewards
  freeTransactions: number
  bonusEndDate: string | null
  bonusPlanId: string | null
  
  // Actions
  generateReferralCode: () => void
  incrementReferral: () => void
  claimReward: (rewardIndex: number) => void
  useFreeTransaction: () => boolean
  getCurrentMilestone: () => { reached: number; next: number; progress: number }
  getNextReward: () => ReferralReward | null
}

const generateCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = 'RC'
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

export const useReferralStore = create<ReferralStore>()(
  persist(
    (set, get) => ({
      referralCode: '',
      referralLink: '',
      referralCount: 0,
      claimedRewards: [],
      freeTransactions: 0,
      bonusEndDate: null,
      bonusPlanId: null,

      generateReferralCode: () => {
        const code = generateCode()
        const link = `https://cashiq.app/register?ref=${code}`
        set({ referralCode: code, referralLink: link })
      },

      incrementReferral: () => {
        set(s => ({ referralCount: s.referralCount + 1 }))
        
        // Auto-check and claim rewards
        const state = get()
        REFERRAL_REWARDS.forEach((reward, index) => {
          if (state.referralCount + 1 >= reward.invites && !state.claimedRewards.includes(index)) {
            get().claimReward(index)
          }
        })
      },

      claimReward: (rewardIndex) => {
        const reward = REFERRAL_REWARDS[rewardIndex]
        if (!reward) return

        set(s => {
          const newState: any = { claimedRewards: [...s.claimedRewards, rewardIndex] }
          
          if (reward.rewardType === 'transactions') {
            newState.freeTransactions = s.freeTransactions + reward.rewardValue
          } else if (reward.rewardType === 'business_plan') {
            newState.bonusPlanId = 'basic'
            newState.bonusEndDate = format(addDays(new Date(), reward.rewardValue), 'yyyy-MM-dd')
          } else if (reward.rewardType === 'pro_plan') {
            newState.bonusPlanId = 'pro'
            newState.bonusEndDate = format(addDays(new Date(), reward.rewardValue), 'yyyy-MM-dd')
          }
          
          return newState
        })
      },

      useFreeTransaction: () => {
        const state = get()
        if (state.freeTransactions > 0) {
          set(s => ({ freeTransactions: s.freeTransactions - 1 }))
          return true
        }
        return false
      },

      getCurrentMilestone: () => {
        const count = get().referralCount
        let reached = 0
        for (const reward of REFERRAL_REWARDS) {
          if (count >= reward.invites) reached = reward.invites
        }
        
        const nextReward = REFERRAL_REWARDS.find(r => r.invites > count)
        const next = nextReward ? nextReward.invites : REFERRAL_REWARDS[REFERRAL_REWARDS.length - 1].invites
        const progress = next > 0 ? (count / next) * 100 : 0
        
        return { reached, next, progress }
      },

      getNextReward: () => {
        const count = get().referralCount
        return REFERRAL_REWARDS.find(r => r.invites > count) || null
      },
    }),
    { name: 'rozcash-referral' }
  )
)
