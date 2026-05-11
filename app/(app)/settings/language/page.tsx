'use client'
import { useSettingsStore } from '@/lib/store/settings.store'
import { useTranslation } from '@/lib/hooks/useTranslation'
import { PageHeader } from '@/components/layout/PageHeader'
import { cn } from '@/lib/utils/cn'
import { Check } from 'lucide-react'
import { showToast } from '@/components/ui/Toast'

export default function LanguagePage() {
  const { t } = useTranslation()
  const { shop, setLanguage } = useSettingsStore()

  const langs = [
    { id: 'en', label: 'settings.english', sub: 'settings.ltr', flag: '🇬🇧' },
    { id: 'ur', label: 'settings.urdu', sub: 'settings.rtl', flag: '🇵🇰' },
  ]

  return (
    <div className="min-h-screen bg-surface">
      <PageHeader title={t('settings.language')} backTo="/settings" />
      <div className="px-4 pt-4 space-y-3">
        {langs.map(l => (
          <button key={l.id} onClick={() => {
            setLanguage(l.id as 'en' | 'ur')
            localStorage.setItem('language', l.id)
            showToast({ type: 'success', message: t('settings.languageSet') })
          }}
            className={cn('w-full flex items-center gap-3 p-4 bg-white rounded-2xl border-2',
              shop.language === l.id ? 'border-navy' : 'border-border')}>
            <span className="text-2xl">{l.flag}</span>
            <div className="flex-1 text-left">
              <p className={cn('text-base font-bold', l.id === 'ur' ? 'font-urdu' : '', 'text-navy')}>{t(l.label)}</p>
              <p className={cn('text-xs text-muted', l.id === 'ur' && 'font-urdu')}>{t(l.sub)}</p>
            </div>
            {shop.language === l.id && <Check size={18} className="text-navy" />}
          </button>
        ))}
      </div>
    </div>
  )
}
