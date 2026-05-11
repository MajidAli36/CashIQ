/**
 * Translation utility for accessing translations with type safety
 * Usage: t('dashboard.recentTransactions')
 */

import en from '@/en.json'
import ur from '@/ur.json'

export type Language = 'en' | 'ur'

const translations = { en, ur }

export function getTranslation(key: string, lang: Language = 'en'): string {
  const keys = key.split('.')
  let value: any = translations[lang]

  for (const k of keys) {
    value = value?.[k]
  }

  if (value === undefined) {
    console.warn(`Translation missing: ${key} for language ${lang}`)
    return key
  }

  return value
}

/**
 * Get both English and Urdu translations at once
 * Useful for displaying bilingual labels
 */
export function getBilingualTranslation(key: string): { en: string; ur: string } {
  return {
    en: getTranslation(key, 'en'),
    ur: getTranslation(key, 'ur'),
  }
}
