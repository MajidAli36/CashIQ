import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Business, BusinessTypeId } from '../types'
import { nanoid } from 'nanoid'

const BUSINESS_COLORS = ['#00C4B4', '#6366f1', '#f59e0b', '#ef4444', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899']

interface BusinessStore {
  businesses: Business[]
  activeBusinessId: string | null
  migrated: boolean

  addBusiness: (b: Omit<Business, 'id' | 'created_at'>) => string
  updateBusiness: (id: string, partial: Partial<Omit<Business, 'id' | 'created_at'>>) => void
  deleteBusiness: (id: string) => void
  setActiveBusiness: (id: string) => void
  getActiveBusiness: () => Business | null
  initDefault: (name: string, type: BusinessTypeId, ownerName?: string, phone?: string, city?: string) => string
  setMigrated: () => void
}

export const useBusinessStore = create<BusinessStore>()(
  persist(
    (set, get) => ({
      businesses: [],
      activeBusinessId: null,
      migrated: false,

      addBusiness: (b) => {
        const id = nanoid()
        const color = BUSINESS_COLORS[get().businesses.length % BUSINESS_COLORS.length]
        set(s => ({
          businesses: [...s.businesses, { ...b, id, color: b.color || color, created_at: new Date().toISOString() }]
        }))
        return id
      },

      updateBusiness: (id, partial) => set(s => ({
        businesses: s.businesses.map(b => b.id === id ? { ...b, ...partial } : b)
      })),

      deleteBusiness: (id) => {
        const { businesses, activeBusinessId } = get()
        if (businesses.length <= 1) return
        const remaining = businesses.filter(b => b.id !== id)
        set({
          businesses: remaining,
          activeBusinessId: activeBusinessId === id ? remaining[0].id : activeBusinessId,
        })
      },

      setActiveBusiness: (id) => set({ activeBusinessId: id }),

      getActiveBusiness: () => {
        const { businesses, activeBusinessId } = get()
        return businesses.find(b => b.id === activeBusinessId) ?? businesses[0] ?? null
      },

      initDefault: (name, type, ownerName = '', phone = '', city = '') => {
        const id = nanoid()
        const b: Business = {
          id,
          name: name || 'My Business',
          type,
          owner_name: ownerName,
          phone,
          city,
          currency: 'PKR',
          country_code: 'PK',
          color: BUSINESS_COLORS[0],
          created_at: new Date().toISOString(),
          is_default: true,
        }
        set({ businesses: [b], activeBusinessId: id })
        return id
      },

      setMigrated: () => set({ migrated: true }),
    }),
    { name: 'rozcash-businesses' }
  )
)

export function getActiveBusinessId(): string {
  const { activeBusinessId, businesses } = useBusinessStore.getState()
  return activeBusinessId ?? businesses[0]?.id ?? 'default'
}
