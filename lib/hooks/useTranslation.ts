import { useSettingsStore } from '@/lib/store/settings.store'
import en from '@/en.json'
import ur from '@/ur.json'

type TranslationKey = string
type NestedTranslations = Record<string, any>
type Params = Record<string, string | number>

const translations: Record<string, NestedTranslations> = { en, ur }

/* Supported language codes — add here when a new translation file is ready */
const SUPPORTED: string[] = ['en', 'ur']

export function useTranslation() {
  const shopLang = useSettingsStore(s => s.shop.language)

  /* Determine active language:
     1. Zustand store (authoritative, reactive)
     2. localStorage fallback (set by phone page / language page before store hydrates)
     Only accepts supported languages; everything else falls back to 'en'. */
  const stored = typeof window !== 'undefined' ? localStorage.getItem('language') : null
  const resolved = SUPPORTED.includes(shopLang)
    ? shopLang
    : SUPPORTED.includes(stored ?? '')
      ? (stored as string)
      : 'en'
  const lang = resolved === 'ur' ? 'ur' : 'en'

  const t = (key: TranslationKey, params?: Params): string => {
    const keys = key.split('.')
    let value: any = translations[lang]

    for (const k of keys) {
      value = value?.[k]
    }

    if (value === undefined) {
      console.warn(`Translation missing: ${key} for language ${lang}`)
      return key
    }

    if (params && typeof value === 'string') {
      Object.entries(params).forEach(([paramKey, paramValue]) => {
        value = value.replace(`{${paramKey}}`, String(paramValue))
      })
    }

    return value
  }

  return { t, lang }
}
