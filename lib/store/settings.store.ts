import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ShopProfile, Wallet, Category, BusinessItem, TeamMember, Language } from '../types'
import { DEFAULT_WALLETS } from '../config/wallets.config'
import { DEFAULT_CATEGORIES } from '../config/categories.config'
import { nanoid } from 'nanoid'

interface SettingsStore {
  shop: ShopProfile
  wallets: Wallet[]
  categories: Category[]
  businessItems: BusinessItem[]
  teamMembers: TeamMember[]
  isOnboarded: boolean

  updateShop: (partial: Partial<ShopProfile>) => void
  setLanguage: (lang: Language) => void

  // Wallet ops (business-scoped)
  toggleWallet: (id: string) => void
  addWallet: (w: Omit<Wallet, 'id' | 'created_at'>) => string
  updateWallet: (id: string, partial: Partial<Omit<Wallet, 'id' | 'created_at'>>) => void
  deleteWallet: (id: string) => void
  updateWalletAccount: (id: string, account_number: string) => void
  getEnabledWallets: (businessId?: string) => Wallet[]
  getBusinessWallets: (businessId: string) => Wallet[]

  // Category ops (business-scoped)
  addCategory: (c: Omit<Category, 'id'>) => string
  updateCategory: (id: string, partial: Partial<Omit<Category, 'id'>>) => void
  deleteCategory: (id: string) => void
  toggleCategory: (id: string) => void
  getBusinessCategories: (businessId: string) => Category[]

  // Team ops (global, not per-business)
  addTeamMember: (m: Omit<TeamMember, 'id' | 'created_at'>) => void
  inviteTeamMember: (phone: string, role: 'manager' | 'staff', invitedBy: string) => void
  acceptInvitation: (phone: string) => void
  updateTeamMember: (id: string, partial: Partial<TeamMember>) => void
  deleteTeamMember: (id: string) => void

  addBusinessItem: (item: Omit<BusinessItem, 'id'>) => void
  toggleBusinessItem: (id: string) => void
  completeOnboarding: () => void

  // Migration / init
  initBusinessDefaults: (businessId: string) => void
  migrateToBusinessId: (businessId: string) => void
}

const defaultShop: ShopProfile = {
  name: '',
  owner_name: '',
  phone: '',
  city: '',
  business_type: 'mobile_shop',
  language: 'en',
  currency: 'PKR',
  country_code: 'PK',
  pin_enabled: false,
  created_at: new Date().toISOString(),
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => ({
      shop: defaultShop,
      wallets: DEFAULT_WALLETS.map(w => ({ ...w, business_id: 'default', created_at: new Date().toISOString() })),
      categories: DEFAULT_CATEGORIES.map(c => ({ ...c, id: nanoid(), business_id: 'default' })),
      businessItems: [],
      teamMembers: [],
      isOnboarded: false,

      updateShop: (partial) => set(s => ({ shop: { ...s.shop, ...partial } })),

      setLanguage: (lang) => set(s => ({ shop: { ...s.shop, language: lang } })),

      // ── WALLETS ─────────────────────────────────────────────
      toggleWallet: (id) => set(s => ({
        wallets: s.wallets.map(w => w.id === id ? { ...w, is_enabled: !w.is_enabled } : w)
      })),

      addWallet: (w) => {
        const id = nanoid()
        set(s => ({ wallets: [...s.wallets, { ...w, id, created_at: new Date().toISOString() }] }))
        return id
      },

      updateWallet: (id, partial) => set(s => ({
        wallets: s.wallets.map(w => w.id === id ? { ...w, ...partial } : w)
      })),

      deleteWallet: (id) => set(s => ({
        wallets: s.wallets.filter(w => w.id !== id)
      })),

      updateWalletAccount: (id, account_number) => set(s => ({
        wallets: s.wallets.map(w => w.id === id ? { ...w, account_number } : w)
      })),

      getEnabledWallets: (businessId?) => {
        const wallets = get().wallets
        const filtered = businessId
          ? wallets.filter(w => w.business_id === businessId)
          : wallets
        return filtered.filter(w => w.is_enabled).sort((a, b) => a.sort_order - b.sort_order)
      },

      getBusinessWallets: (businessId) =>
        get().wallets.filter(w => w.business_id === businessId).sort((a, b) => a.sort_order - b.sort_order),

      // ── CATEGORIES ──────────────────────────────────────────
      addCategory: (c) => {
        const id = nanoid()
        set(s => ({ categories: [...s.categories, { ...c, id }] }))
        return id
      },

      updateCategory: (id, partial) => set(s => ({
        categories: s.categories.map(c => c.id === id ? { ...c, ...partial } : c)
      })),

      deleteCategory: (id) => set(s => ({
        categories: s.categories.filter(c => c.id !== id)
      })),

      toggleCategory: (id) => set(s => ({
        categories: s.categories.map(c => c.id === id ? { ...c, is_enabled: !c.is_enabled } : c)
      })),

      getBusinessCategories: (businessId) =>
        get().categories.filter(c => c.business_id === businessId && c.is_enabled),

      // ── TEAM ────────────────────────────────────────────────
      addTeamMember: (m) => set(s => ({
        teamMembers: [...s.teamMembers, {
          ...m,
          id: nanoid(),
          created_at: new Date().toISOString(),
          invitation_status: 'pending',
          invited_at: new Date().toISOString(),
          invited_by: s.shop.owner_name || 'Owner'
        }]
      })),

      inviteTeamMember: (phone, role, invitedBy) => set(s => ({
        teamMembers: [...s.teamMembers, {
          id: nanoid(),
          name: 'Invited User',
          phone,
          role,
          is_active: false,
          created_at: new Date().toISOString(),
          invitation_status: 'pending',
          invited_at: new Date().toISOString(),
          invited_by: invitedBy
        }]
      })),

      acceptInvitation: (phone) => set(s => ({
        teamMembers: s.teamMembers.map(m =>
          m.phone === phone ? {
            ...m,
            invitation_status: 'accepted',
            joined_at: new Date().toISOString(),
            is_active: true
          } : m
        )
      })),

      updateTeamMember: (id, partial) => set(s => ({
        teamMembers: s.teamMembers.map(m => m.id === id ? { ...m, ...partial } : m)
      })),

      deleteTeamMember: (id) => set(s => ({
        teamMembers: s.teamMembers.filter(m => m.id !== id)
      })),

      addBusinessItem: (item) => set(s => ({
        businessItems: [...s.businessItems, { ...item, id: nanoid() }]
      })),

      toggleBusinessItem: (id) => set(s => ({
        businessItems: s.businessItems.map(i => i.id === id ? { ...i, is_enabled: !i.is_enabled } : i)
      })),

      completeOnboarding: () => set({ isOnboarded: true }),

      // ── INIT / MIGRATION ────────────────────────────────────
      initBusinessDefaults: (businessId) => {
        const now = new Date().toISOString()
        const defaultWallets: Wallet[] = DEFAULT_WALLETS.map(w => ({
          ...w,
          id: nanoid(),           // always new IDs for additional businesses
          business_id: businessId,
          created_at: now,
        }))
        const defaultCats: Category[] = DEFAULT_CATEGORIES.map(c => ({
          ...c,
          id: nanoid(),
          business_id: businessId,
        }))
        set(s => ({
          wallets: [...s.wallets, ...defaultWallets],
          categories: [...s.categories, ...defaultCats],
        }))
      },

      migrateToBusinessId: (businessId) => set(s => ({
        wallets: s.wallets.map(w =>
          (w.business_id === 'default' || !w.business_id) ? { ...w, business_id: businessId } : w
        ),
        categories: s.categories.map(c =>
          (c.business_id === 'default' || !c.business_id) ? { ...c, business_id: businessId } : c
        ),
      })),
    }),
    { name: 'rozcash-settings' }
  )
)
