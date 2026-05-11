import { create } from 'zustand'

export type VoiceIntentType = 'add_transaction' | 'add_loan' | 'create_customer' | 'get_transactions'
export type VoiceTxnType    = 'income' | 'expense' | 'loan'

export interface VoiceIntent {
  intent:      VoiceIntentType
  amount?:     number
  customer?:   string
  phone?:      string
  type?:       VoiceTxnType
  note?:       string
  date_range?: string
}

interface VoicePrefillStore {
  pending: VoiceIntent | null
  set:   (intent: VoiceIntent) => void
  clear: () => void
}

/**
 * Non-persisted one-shot bridge.
 * Voice system writes here → navigates to target page → target page
 * reads once on mount via useVoicePrefill() then clears.
 */
export const useVoicePrefillStore = create<VoicePrefillStore>()((set) => ({
  pending: null,
  set:   (intent) => set({ pending: intent }),
  clear: ()       => set({ pending: null }),
}))
