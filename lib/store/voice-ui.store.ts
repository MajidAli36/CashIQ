import { create } from 'zustand'

interface VoiceUIStore {
  isOpen: boolean
  open:   () => void
  close:  () => void
}

export const useVoiceUIStore = create<VoiceUIStore>(set => ({
  isOpen: false,
  open:   () => set({ isOpen: true }),
  close:  () => set({ isOpen: false }),
}))
