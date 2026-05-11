'use client'
import { useThemeStore } from '@/lib/store/theme.store'
import { useTranslation } from '@/lib/hooks/useTranslation'
import { THEMES } from '@/lib/config/themes.config'
import { PageHeader } from '@/components/layout/PageHeader'
import { showToast } from '@/components/ui/Toast'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

export default function ThemePage() {
  const { themeId, setTheme } = useThemeStore()

  const handleSelect = (id: typeof themeId) => {
    setTheme(id)
    const theme = THEMES.find(t => t.id === id)!
    showToast({ type: 'success', message: `${theme.name} applied`, messageUr: theme.nameUr })
  }

  return (
    <div className="min-h-screen pb-24" style={{ backgroundColor: 'var(--t-page-bg)' }}>
      <PageHeader title="Appearance" titleUr="ظاہری شکل" backTo="/settings" />

      <div className="px-4 pt-5">
        {/* Section heading */}
        <div className="mb-5">
          <p className="text-[11px] font-bold uppercase tracking-widest mb-1"
            style={{ color: 'var(--t-muted)' }}>
            Choose Theme · تھیم منتخب کریں
          </p>
          <p className="text-xs" style={{ color: 'var(--t-muted)' }}>
            Changes apply instantly across the entire app
          </p>
        </div>

        {/* Theme grid — 2 columns */}
        <div className="grid grid-cols-2 gap-3">
          {THEMES.map(theme => {
            const isActive = themeId === theme.id
            const p = theme.preview

            return (
              <button
                key={theme.id}
                onClick={() => handleSelect(theme.id)}
                className={cn(
                  'relative rounded-3xl overflow-hidden transition-all duration-200 text-left',
                  isActive
                    ? 'ring-2 ring-offset-2 scale-[1.02] shadow-lg'
                    : 'opacity-90 hover:opacity-100 hover:scale-[1.01]'
                )}
                style={{
                  ringColor: p.accent,
                  outlineColor: isActive ? p.accent : 'transparent',
                  outline: isActive ? `2.5px solid ${p.accent}` : '2px solid transparent',
                  outlineOffset: '2px',
                }}>

                {/* ── Mini phone preview ── */}
                <div className="h-[160px] flex flex-col overflow-hidden rounded-3xl border"
                  style={{ borderColor: p.cardBorder }}>

                  {/* Hero strip */}
                  <div className="h-[52px] flex-shrink-0 relative overflow-hidden"
                    style={{ background: `linear-gradient(135deg, ${p.heroFrom} 0%, ${p.heroTo} 100%)` }}>
                    {/* Ambient glow */}
                    <div className="absolute top-0 right-0 w-16 h-16 rounded-full blur-xl opacity-30"
                      style={{ backgroundColor: p.accent }} />
                    {/* Tiny balance text */}
                    <div className="absolute bottom-2 left-3">
                      <div className="h-1.5 w-8 rounded-full mb-1 opacity-40"
                        style={{ backgroundColor: p.accent }} />
                      <div className="h-2.5 w-14 rounded-full opacity-80"
                        style={{ backgroundColor: p.accent }} />
                    </div>
                    {/* Accent dot top-right */}
                    <div className="absolute top-2.5 right-3 w-4 h-4 rounded-full opacity-70"
                      style={{ backgroundColor: p.accent }} />
                  </div>

                  {/* Content area */}
                  <div className="flex-1 p-2.5" style={{ backgroundColor: p.pageBg }}>
                    {/* Mini card 1 */}
                    <div className="rounded-xl p-2 mb-1.5 border"
                      style={{ backgroundColor: p.cardBg, borderColor: p.cardBorder }}>
                      <div className="flex items-center gap-1.5 mb-1">
                        <div className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: p.accent }} />
                        <div className="h-1.5 rounded-full flex-1"
                          style={{ backgroundColor: p.muted, opacity: 0.3 }} />
                      </div>
                      <div className="h-2 w-12 rounded-full"
                        style={{ backgroundColor: p.text, opacity: 0.7 }} />
                    </div>
                    {/* Mini card 2 */}
                    <div className="rounded-xl px-2 py-1.5 border flex items-center gap-1.5"
                      style={{ backgroundColor: p.cardBg, borderColor: p.cardBorder }}>
                      <div className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: '#4CAF50', opacity: 0.8 }} />
                      <div className="h-1.5 rounded-full flex-1"
                        style={{ backgroundColor: p.muted, opacity: 0.25 }} />
                      <div className="h-1.5 w-6 rounded-full"
                        style={{ backgroundColor: '#4CAF50', opacity: 0.7 }} />
                    </div>
                  </div>

                  {/* Mini nav strip */}
                  <div className="h-[22px] flex-shrink-0 flex items-center justify-around px-3 border-t"
                    style={{ backgroundColor: theme.isDark ? p.cardBg : '#FAFAFA', borderColor: p.cardBorder }}>
                    {[0,1,2,3,4].map(i => (
                      <div key={i} className="rounded-sm"
                        style={{
                          width: i === 2 ? 14 : 8,
                          height: i === 2 ? 14 : 6,
                          borderRadius: i === 2 ? 4 : 3,
                          backgroundColor: i === 2 ? p.accent : p.muted,
                          opacity: i === 0 ? 0.7 : 0.3,
                        }} />
                    ))}
                  </div>
                </div>

                {/* ── Label below preview ── */}
                <div className="mt-2.5 px-0.5 pb-0.5">
                  <div className="flex items-center justify-between">
                    <p className="text-[13px] font-bold leading-tight"
                      style={{ color: 'var(--t-text)' }}>
                      {theme.name}
                    </p>
                    {isActive && (
                      <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: p.accent }}>
                        <Check size={11} className="text-white" strokeWidth={3} />
                      </div>
                    )}
                  </div>
                  <p className="font-urdu text-[11px] mt-0.5"
                    style={{ color: 'var(--t-muted)' }}>
                    {theme.nameUr}
                  </p>
                  {theme.isDark && (
                    <span className="inline-block mt-1 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full"
                      style={{ backgroundColor: `${p.accent}20`, color: p.accent }}>
                      Dark
                    </span>
                  )}
                </div>
              </button>
            )
          })}
        </div>

        {/* Current theme info card */}
        <div className="mt-6 rounded-2xl p-4 border"
          style={{ backgroundColor: 'var(--t-card-bg)', borderColor: 'var(--t-card-border)' }}>
          {(() => {
            const current = THEMES.find(t => t.id === themeId)!
            return (
              <div className="flex items-center gap-3">
                {/* Color swatches */}
                <div className="flex gap-1 flex-shrink-0">
                  {[current.preview.heroFrom, current.preview.accent, current.preview.cardBg].map((c, i) => (
                    <div key={i} className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                      style={{ backgroundColor: c, borderColor: current.preview.cardBorder }} />
                  ))}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate" style={{ color: 'var(--t-text)' }}>
                    {current.name} — Active
                  </p>
                  <p className="text-xs truncate" style={{ color: 'var(--t-muted)' }}>
                    {current.description}
                  </p>
                </div>
              </div>
            )
          })()}
        </div>

        <p className="text-center text-[11px] mt-4 mb-2" style={{ color: 'var(--t-muted)' }}>
          Theme preference is saved on this device
        </p>
      </div>
    </div>
  )
}
