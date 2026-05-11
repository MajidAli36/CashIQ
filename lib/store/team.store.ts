import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { UserRole } from '../types'

interface TeamStore {
  currentUserId: string
  currentUserRole: UserRole
  setCurrentUser: (id: string, role: UserRole) => void
}

export const useTeamStore = create<TeamStore>()(
  persist(
    (set) => ({
      currentUserId: 'owner',
      currentUserRole: 'owner',
      setCurrentUser: (id, role) => set({ currentUserId: id, currentUserRole: role }),
    }),
    { name: 'rozcash-team' }
  )
)
