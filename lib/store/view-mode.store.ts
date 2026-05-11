import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ViewMode = 'simple' | 'full'

interface ViewModeStore {
  viewMode: ViewMode
  hasInitialized: boolean
  setViewMode: (mode: ViewMode) => void
}

export const useViewModeStore = create<ViewModeStore>()(
  persist(
    (set) => ({
      viewMode: 'simple',
      hasInitialized: false,
      setViewMode: (viewMode) => set({ viewMode, hasInitialized: true }),
    }),
    {
      name: 'rozcash-view-mode',
      partialize: (s) => ({ viewMode: s.viewMode, hasInitialized: s.hasInitialized }),
    }
  )
)
