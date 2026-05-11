import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ThemeId } from '@/lib/config/themes.config'
import { DEFAULT_THEME_ID } from '@/lib/config/themes.config'

interface ThemeState {
  themeId: ThemeId
  setTheme: (id: ThemeId) => void
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      themeId: DEFAULT_THEME_ID,
      setTheme: (themeId) => set({ themeId }),
    }),
    { name: 'rozcash-theme' }
  )
)
