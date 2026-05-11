'use client'
import { useEffect } from 'react'
import { useSettingsStore } from '../store/settings.store'

export function useRTL() {
  const shopLang = useSettingsStore(s => s.shop.language)

  /* Resolve: store first, then localStorage fallback */
  const stored = typeof window !== 'undefined' ? (localStorage.getItem('language') ?? 'en') : 'en'
  const language = shopLang || stored

  const isRTL = language === 'ur'

  useEffect(() => {
    document.documentElement.dir  = isRTL ? 'rtl' : 'ltr'
    document.documentElement.lang = language
  }, [language, isRTL])

  return isRTL
}
