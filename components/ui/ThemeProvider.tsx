'use client'
import { useEffect } from 'react'
import { useThemeStore } from '@/lib/store/theme.store'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const themeId = useThemeStore(s => s.themeId)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', themeId)
  }, [themeId])

  return <>{children}</>
}
