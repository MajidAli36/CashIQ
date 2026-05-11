'use client'
import { Moon, Sun } from 'lucide-react'
import { useThemeStore } from '@/lib/store/theme.store'

export function ThemeToggle() {
  const { themeId, setTheme } = useThemeStore()

  const toggleTheme = () => {
    const isDark = themeId.includes('dark') || themeId === 'black-gold' || themeId === 'neon-modern'
    if (isDark) {
      setTheme('light-clean')
    } else {
      setTheme('dark-pro')
    }
  }

  return (
    <button
      onClick={toggleTheme}
      className="w-9 h-9 rounded-xl flex items-center justify-center transition-all active:scale-95"
      style={{
        background: 'rgba(255,255,255,0.08)',
        border: '1px solid rgba(255,255,255,0.12)',
      }}
      title={themeId.includes('dark') ? 'Light mode' : 'Dark mode'}
    >
      {themeId.includes('dark') || themeId === 'black-gold' || themeId === 'neon-modern' ? (
        <Sun size={16} className="text-white/70" />
      ) : (
        <Moon size={16} className="text-white/70" />
      )}
    </button>
  )
}