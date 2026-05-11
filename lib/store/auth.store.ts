import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthStore {
  phone: string           // full number with country code e.g. "923001234567"
  pinHash: string | null  // SHA-256(rozcash:phone:pin)
  isVerified: boolean     // OTP verified at least once
  isLoggedIn: boolean     // current session — NOT persisted
  isAuthenticated: boolean// alias for isLoggedIn — NOT persisted
  biometricEnabled: boolean

  setPhone: (phone: string) => void
  setPinHash: (hash: string) => void
  setVerified: () => void
  resetVerification: () => void  // used by "Forgot PIN" flow
  unlock: () => void
  logout: () => void
  resetAuth: () => void          // full reset — clears phone + PIN
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      phone: '',
      pinHash: null,
      isVerified: false,
      isLoggedIn: false,
      isAuthenticated: false,
      biometricEnabled: false,

      setPhone: (phone) => set({ phone, isVerified: false }),
      setPinHash: (hash) => set({ pinHash: hash }),
      setVerified: () => set({ isVerified: true }),
      resetVerification: () => set({ isVerified: false }),
      unlock: () => set({ isLoggedIn: true, isAuthenticated: true }),
      logout: () => set({ isLoggedIn: false, isAuthenticated: false }),
      resetAuth: () => set({
        phone: '',
        pinHash: null,
        isVerified: false,
        isLoggedIn: false,
        isAuthenticated: false,
      }),
    }),
    {
      name: 'rozcash-auth',
      // isLoggedIn + isAuthenticated excluded — app always starts locked
      partialize: (state) => ({
        phone: state.phone,
        pinHash: state.pinHash,
        isVerified: state.isVerified,
        biometricEnabled: state.biometricEnabled,
      }),
    }
  )
)
