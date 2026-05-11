'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useSettingsStore } from '@/lib/store/settings.store'
import { ALL_LANGUAGES, ENABLED_LANGUAGES, type LanguageOption } from '@/lib/config/languages.config'
import { cn } from '@/lib/utils/cn'
import {
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Search,
  Check,
  Globe,
  Clock,
} from 'lucide-react'

/* Step indicator */
const STEPS = ['Phone', 'Language', 'Verify']

export default function LanguagePage() {
  const router = useRouter()
  const { setLanguage } = useSettingsStore()

  const [selected,    setSelected]    = useState<string>('en')
  const [search,      setSearch]      = useState('')
  const [justToasted, setJustToasted] = useState<string | null>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  /* Restore previously saved language */
  useEffect(() => {
    const saved = localStorage.getItem('language')
    if (saved) setSelected(saved)
  }, [])

  const filtered = ALL_LANGUAGES.filter(l =>
    l.name.toLowerCase().includes(search.toLowerCase()) ||
    l.nativeName.toLowerCase().includes(search.toLowerCase()) ||
    l.region.toLowerCase().includes(search.toLowerCase())
  )

  const filteredEnabled  = filtered.filter(l => l.enabled)
  const filteredDisabled = filtered.filter(l => !l.enabled)

  const handleSelect = (lang: LanguageOption) => {
    if (!lang.enabled) {
      setJustToasted(lang.code)
      setTimeout(() => setJustToasted(null), 2000)
      return
    }
    setSelected(lang.code)
  }

  const handleContinue = () => {
    const lang = ENABLED_LANGUAGES.find(l => l.code === selected) ?? ENABLED_LANGUAGES[0]
    localStorage.setItem('language', lang.code)
    setLanguage(lang.code as 'en' | 'ur')
    router.push('/otp')
  }

  const currentLang = ALL_LANGUAGES.find(l => l.code === selected)

  return (
    <div className="min-h-screen flex flex-col bg-[#0B1120] overflow-x-hidden">

      {/* ── Background glows ── */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full blur-[180px] opacity-[0.06] bg-[#00F8B4]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full blur-[150px] opacity-[0.04] bg-[#00C4FF]" />
        {/* Subtle grid */}
        <div className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.08) 1px, transparent 1px)',
            backgroundSize:  '48px 48px',
          }} />
      </div>

      {/* ── Top bar ── */}
      <div className="relative z-20 flex-shrink-0 flex items-center justify-between px-6 sm:px-10 lg:px-16 pt-8">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#00F8B4] to-[#00C4FF] flex items-center justify-center shadow-md shadow-[#00F8B4]/20">
            <Sparkles size={16} className="text-white" />
          </div>
          <span className="text-white font-black text-lg tracking-tight">
            Cash<span className="text-[#00F8B4]">IQ</span>
          </span>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {STEPS.map((step, i) => {
            const done    = i < 1
            const current = i === 1
            return (
              <div key={step} className="flex items-center gap-1.5 sm:gap-2">
                <div className={cn(
                  'flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold transition-all',
                  done    && 'bg-[#00F8B4]/15 text-[#00F8B4]',
                  current && 'bg-white/[0.08] border border-white/[0.12] text-white',
                  !done && !current && 'text-white/20',
                )}>
                  {done && <Check size={10} />}
                  <span className="hidden sm:inline">{step}</span>
                  <span className="sm:hidden">{i + 1}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className="w-4 h-px bg-white/[0.08]" />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="relative z-10 flex-1 flex flex-col items-center px-4 sm:px-6 py-10">
        <div className="w-full max-w-2xl">

          {/* Heading */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[#00F8B4]/15 to-[#00C4FF]/15 border border-[#00F8B4]/20 mb-5">
              <Globe size={26} className="text-[#00F8B4]" />
            </div>
            <h1 className="text-[28px] sm:text-[34px] font-black text-white leading-tight tracking-tight mb-3">
              Choose your{' '}
              <span className="bg-gradient-to-r from-[#00F8B4] to-[#00C4FF] bg-clip-text text-transparent">
                language
              </span>
            </h1>
            <p className="text-[14px] text-white/35 font-light max-w-sm mx-auto">
              Pick the language you&apos;re most comfortable with. You can change this any time in settings.
            </p>
          </div>

          {/* Search */}
          <div className="relative mb-6">
            <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
            <input
              ref={searchRef}
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search language, region..."
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-2xl pl-10 pr-4 py-3.5 text-white/70 text-[14px] placeholder:text-white/20 focus:outline-none focus:border-[#00F8B4]/30 focus:bg-white/[0.06] transition-all"
            />
          </div>

          {/* ── AVAILABLE LANGUAGES ── */}
          {filteredEnabled.length > 0 && (
            <div className="mb-8">
              <p className="text-[11px] font-bold text-white/30 uppercase tracking-widest mb-3 px-1">
                Available now
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filteredEnabled.map(lang => {
                  const isSelected = selected === lang.code
                  return (
                    <button
                      key={lang.code}
                      onClick={() => handleSelect(lang)}
                      className={cn(
                        'relative flex items-center gap-4 p-4 sm:p-5 rounded-2xl text-left transition-all duration-200 group',
                        isSelected
                          ? 'bg-gradient-to-br from-[#00F8B4]/12 to-[#00C4FF]/8 border border-[#00F8B4]/35'
                          : 'bg-white/[0.03] border border-white/[0.07] hover:bg-white/[0.06] hover:border-white/[0.12]',
                      )}
                    >
                      {/* Flag */}
                      <div className={cn(
                        'w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 transition-all',
                        isSelected
                          ? 'bg-gradient-to-br from-[#00F8B4]/20 to-[#00C4FF]/15 shadow-lg shadow-[#00F8B4]/10'
                          : 'bg-white/[0.06] group-hover:bg-white/[0.09]',
                      )}>
                        <span className="select-none">{lang.flag}</span>
                      </div>

                      {/* Names */}
                      <div className="flex-1 min-w-0">
                        <p className={cn(
                          'font-bold text-[15px] leading-tight mb-0.5',
                          isSelected ? 'text-white' : 'text-white/70',
                        )}>
                          {lang.name}
                        </p>
                        <p className={cn(
                          'text-[13px]',
                          lang.rtl ? 'font-medium' : '',
                          isSelected ? 'text-[#00F8B4]/70' : 'text-white/30',
                        )}>
                          {lang.nativeName}
                        </p>
                        <p className="text-[11px] text-white/20 mt-0.5">{lang.region}</p>
                      </div>

                      {/* Check / radio */}
                      <div className={cn(
                        'w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all',
                        isSelected
                          ? 'border-[#00F8B4] bg-[#00F8B4]'
                          : 'border-white/20 group-hover:border-white/35',
                      )}>
                        {isSelected && <Check size={12} strokeWidth={3} className="text-[#0B1120]" />}
                      </div>

                      {/* Selected glow */}
                      {isSelected && (
                        <div className="absolute -inset-px rounded-2xl pointer-events-none"
                          style={{ boxShadow: '0 0 20px rgba(0,248,180,0.08)' }} />
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* ── COMING SOON ── */}
          {filteredDisabled.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-3 px-1">
                <Clock size={11} className="text-white/20" />
                <p className="text-[11px] font-bold text-white/20 uppercase tracking-widest">
                  Coming soon · {filteredDisabled.length} languages
                </p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {filteredDisabled.map(lang => {
                  const toasting = justToasted === lang.code
                  return (
                    <button
                      key={lang.code}
                      onClick={() => handleSelect(lang)}
                      className="relative flex items-center gap-3 p-3 rounded-xl text-left opacity-50 hover:opacity-70 transition-opacity bg-white/[0.02] border border-white/[0.05] cursor-not-allowed"
                    >
                      <span className="text-xl select-none flex-shrink-0">{lang.flag}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-white/50 text-[12px] font-semibold truncate">{lang.name}</p>
                        <p className="text-white/20 text-[10px] truncate">{lang.nativeName}</p>
                      </div>

                      {/* "Soon" badge or toast */}
                      <div className={cn(
                        'absolute top-2 right-2 px-1.5 py-0.5 rounded-md text-[9px] font-bold transition-all',
                        toasting
                          ? 'bg-amber-500/30 text-amber-400 border border-amber-500/30'
                          : 'bg-white/[0.06] text-white/25',
                      )}>
                        {toasting ? 'Soon!' : 'Soon'}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* No results */}
          {filtered.length === 0 && (
            <div className="text-center py-12">
              <Globe size={32} className="text-white/15 mx-auto mb-3" />
              <p className="text-white/25 text-[14px]">No languages match &ldquo;{search}&rdquo;</p>
            </div>
          )}

          {/* ── Actions ── */}
          <div className="flex gap-3 mt-2">
            {/* Back */}
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 px-5 h-[52px] rounded-2xl font-semibold text-[14px] text-white/35 bg-white/[0.04] border border-white/[0.07] hover:bg-white/[0.07] hover:text-white/50 transition-all flex-shrink-0"
            >
              <ArrowLeft size={16} />
              <span className="hidden sm:inline">Back</span>
            </button>

            {/* Continue */}
            <button
              onClick={handleContinue}
              className="relative flex-1 h-[52px] rounded-2xl font-bold text-[15px] flex items-center justify-center gap-2.5 overflow-hidden group text-[#0B1120] active:scale-[0.985] transition-transform"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#00F8B4] to-[#00C4FF]" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#00F8B4] to-[#00C4FF] opacity-0 group-hover:opacity-100 blur-xl transition-opacity"
                style={{ boxShadow: '0 0 40px rgba(0,248,180,0.35)' }} />
              <span className="relative z-10 flex items-center gap-2">
                Continue in {currentLang?.name}
                <ArrowRight size={17} strokeWidth={2.5} className="transition-transform group-hover:translate-x-1" />
              </span>
            </button>
          </div>

          {/* Skip link */}
          <p className="text-center mt-5 text-[12px] text-white/20">
            You can change this later in{' '}
            <button
              onClick={handleContinue}
              className="text-white/35 hover:text-white/50 underline underline-offset-2 transition-colors"
            >
              Settings
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
