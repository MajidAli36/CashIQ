'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store/auth.store'
import { useSettingsStore } from '@/lib/store/settings.store'
import { cn } from '@/lib/utils/cn'
import {
  ArrowRight,
  Phone,
  Sparkles,
  Lock,
  Zap,
  Shield,
  User,
  Banknote,
  Wallet,
  CreditCard,
  TrendingUp,
  TrendingDown,
  Building2,
  Package,
  ChevronDown,
  Check,
  Globe,
  Clock,
} from 'lucide-react'
import enJson from '@/en.json'
import urJson from '@/ur.json'
import { ALL_LANGUAGES, ENABLED_LANGUAGES, type LanguageOption } from '@/lib/config/languages.config'

/* ── Country definitions ── */
const COUNTRIES = [
  {
    code: 'PK', name: 'Pakistan',      dial: '+92',  flag: '🇵🇰',
    placeholder: '300-1234567',  maxDigits: 11,
    validate: (d: string) => d.length === 11 && d.startsWith('03'),
    normalize: (d: string) => '92' + d.slice(1),
  },
  {
    code: 'US', name: 'United States', dial: '+1',   flag: '🇺🇸',
    placeholder: '201-555-0123', maxDigits: 10,
    validate: (d: string) => d.length === 10,
    normalize: (d: string) => '1' + d,
  },
  {
    code: 'IN', name: 'India',         dial: '+91',  flag: '🇮🇳',
    placeholder: '98765-43210',  maxDigits: 10,
    validate: (d: string) => d.length === 10 && /^[6-9]/.test(d),
    normalize: (d: string) => '91' + d,
  },
  {
    code: 'AE', name: 'UAE',           dial: '+971', flag: '🇦🇪',
    placeholder: '50-123-4567',  maxDigits: 9,
    validate: (d: string) => d.length === 9,
    normalize: (d: string) => '971' + d,
  },
  {
    code: 'GB', name: 'UK',            dial: '+44',  flag: '🇬🇧',
    placeholder: '7911-123456',  maxDigits: 10,
    validate: (d: string) => d.length === 10,
    normalize: (d: string) => '44' + d,
  },
  {
    code: 'SA', name: 'Saudi Arabia',  dial: '+966', flag: '🇸🇦',
    placeholder: '51-234-5678',  maxDigits: 9,
    validate: (d: string) => d.length === 9,
    normalize: (d: string) => '966' + d,
  },
  {
    code: 'AU', name: 'Australia',     dial: '+61',  flag: '🇦🇺',
    placeholder: '412-345-678',  maxDigits: 9,
    validate: (d: string) => d.length === 9,
    normalize: (d: string) => '61' + d,
  },
  {
    code: 'CA', name: 'Canada',        dial: '+1',   flag: '🇨🇦',
    placeholder: '204-555-0123', maxDigits: 10,
    validate: (d: string) => d.length === 10,
    normalize: (d: string) => '1' + d,
  },
  {
    code: 'TR', name: 'Turkey',        dial: '+90',  flag: '🇹🇷',
    placeholder: '532-123-4567', maxDigits: 10,
    validate: (d: string) => d.length === 10,
    normalize: (d: string) => '90' + d,
  },
  {
    code: 'BD', name: 'Bangladesh',    dial: '+880', flag: '🇧🇩',
    placeholder: '1712-345678',  maxDigits: 10,
    validate: (d: string) => d.length === 10,
    normalize: (d: string) => '880' + d,
  },
] as const

type Country = typeof COUNTRIES[number]

/* ── Slider data ── */
const SLIDES = [
  {
    type: 'founder',
    content: {
      quote: 'We built CashIQ to give you full control and transparency over your money.',
      name:  'Majid Ali',
      title: 'Founder & CEO',
    },
  },
  {
    type: 'moneyflow',
    content: {
      flows: [
        { icon: Banknote,    label: 'Bank',   amount: 120000, type: 'income'  as const },
        { icon: Wallet,      label: 'Cash',   amount: 8500,   type: 'expense' as const },
        { icon: CreditCard,  label: 'Cheque', amount: 25000,  type: 'income'  as const },
      ],
      subtext: 'Track every rupee across all channels',
    },
  },
  {
    type: 'business',
    content: {
      businesses: [
        { name: 'Mobile Shop', type: 'Retail',    color: '#3B82F6' },
        { name: 'Garments',    type: 'Wholesale', color: '#8B5CF6' },
      ],
      inventory: { items: 120, alerts: 3 },
      subtext: 'Manage multiple businesses in one place',
    },
  },
  {
    type: 'transactions',
    content: {
      transactions: [
        { amount: 25000, label: 'Client Payment', time: '2 min ago',  type: 'income'  as const },
        { amount: 8500,  label: 'Expense',         time: '15 min ago', type: 'expense' as const },
      ],
    },
  },
  {
    type: 'features',
    content: {
      features: [
        { icon: Lock,   label: 'Secure',  desc: 'Bank-level security' },
        { icon: Zap,    label: 'Instant', desc: 'Fast verification'   },
        { icon: Shield, label: 'Private', desc: 'No data misuse'      },
      ],
    },
  },
]

export default function PhonePage() {
  const router = useRouter()
  const { setPhone: storeSetPhone, phone: storedPhone, pinHash, isAuthenticated } = useAuthStore()
  const { setLanguage: storeSetLanguage } = useSettingsStore()

  const [phone,           setPhone]           = useState('')
  const [error,           setError]           = useState('')
  const [loading,         setLoading]         = useState(false)
  const [language,        setLanguage]        = useState<'en' | 'ur'>('en')
  const [isFocused,       setIsFocused]       = useState(false)
  const [currentSlide,    setCurrentSlide]    = useState(0)
  const [isPaused,        setIsPaused]        = useState(false)
  const [selectedCountry,  setSelectedCountry]  = useState<Country>(COUNTRIES[0])
  const [dropdownOpen,     setDropdownOpen]     = useState(false)
  const [searchQuery,      setSearchQuery]      = useState('')
  const [langDropOpen,     setLangDropOpen]     = useState(false)
  const [langSearch,       setLangSearch]       = useState('')
  const [langToasted,      setLangToasted]      = useState<string | null>(null)

  const dropdownRef  = useRef<HTMLDivElement>(null)
  const searchRef    = useRef<HTMLInputElement>(null)
  const langDropRef  = useRef<HTMLDivElement>(null)

  const translations = language === 'en' ? enJson : urJson
  const isRTL        = language === 'ur'

  /* ── Auto-play slider ── */
  useEffect(() => {
    if (isPaused) return
    const timer = setInterval(() => setCurrentSlide(p => (p + 1) % SLIDES.length), 5000)
    return () => clearInterval(timer)
  }, [isPaused])

  /* ── Restore language preference ── */
  useEffect(() => {
    const saved = localStorage.getItem('language') as 'en' | 'ur' | null
    if (saved) setLanguage(saved)
  }, [])

  /* ── Auth redirect ── */
  useEffect(() => {
    if (isAuthenticated) router.replace('/')
    else if (storedPhone && pinHash) router.replace('/pin')
  }, [isAuthenticated, storedPhone, pinHash, router])

  /* ── Click-outside: country dropdown ── */
  useEffect(() => {
    if (!dropdownOpen) return
    const handle = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
        setSearchQuery('')
      }
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [dropdownOpen])

  /* ── Click-outside: language dropdown ── */
  useEffect(() => {
    if (!langDropOpen) return
    const handle = (e: MouseEvent) => {
      if (langDropRef.current && !langDropRef.current.contains(e.target as Node)) {
        setLangDropOpen(false)
        setLangSearch('')
      }
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [langDropOpen])

  const handleLangSelect = (lang: LanguageOption) => {
    if (!lang.enabled) {
      setLangToasted(lang.code)
      setTimeout(() => setLangToasted(null), 2000)
      return
    }
    handleLanguageChange(lang.code as 'en' | 'ur')
    setLangDropOpen(false)
    setLangSearch('')
  }

  /* ── Focus search when dropdown opens ── */
  useEffect(() => {
    if (dropdownOpen) setTimeout(() => searchRef.current?.focus(), 50)
  }, [dropdownOpen])

  const handleLanguageChange = (lang: 'en' | 'ur') => {
    setLanguage(lang)                  // local state (phone page display)
    localStorage.setItem('language', lang)
    storeSetLanguage(lang)             // Zustand store → propagates to whole app
  }

  const formatPhoneInput = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, selectedCountry.maxDigits)
    if (digits.length <= 3) return digits
    if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`
  }

  const isValidPhone = () => selectedCountry.validate(phone.replace(/\D/g, ''))

  const handleCountrySelect = (country: Country) => {
    setSelectedCountry(country)
    setPhone('')
    setError('')
    setDropdownOpen(false)
    setSearchQuery('')
  }

  const handleContinue = async () => {
    setError('')
    const digits = phone.replace(/\D/g, '')
    if (!selectedCountry.validate(digits)) {
      setError(translations.auth.validationError)
      return
    }
    setLoading(true)
    const normalized = selectedCountry.normalize(digits)
    setTimeout(() => {
      storeSetPhone(normalized)
      setLoading(false)
      router.push('/language')
    }, 600)
  }

  const formatAmount = (amount: number) => new Intl.NumberFormat('en-PK').format(amount)

  const nextSlide = useCallback(() => setCurrentSlide(p => (p + 1) % SLIDES.length), [])
  const prevSlide = useCallback(() => setCurrentSlide(p => (p - 1 + SLIDES.length) % SLIDES.length), [])

  const filteredCountries = COUNTRIES.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.dial.includes(searchQuery) ||
    c.code.toLowerCase().includes(searchQuery.toLowerCase())
  )

  /* ─────────────────────────────────────────────
     SLIDE RENDERER
  ───────────────────────────────────────────── */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderSlideContent = (slide: any) => {
    if (slide.type === 'founder') {
      return (
        <div className="flex flex-col items-center justify-center h-full p-8">
          <div className="relative mb-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#00F8B4] to-[#00C4FF] flex items-center justify-center shadow-lg shadow-[#00F8B4]/20">
              <User size={36} className="text-white" />
            </div>
            <div className="absolute -inset-2 rounded-full bg-gradient-to-br from-[#00F8B4]/20 to-[#00C4FF]/20 blur-md -z-10" />
          </div>
          <blockquote className="text-center max-w-xs mb-6">
            <p className="text-[15px] leading-relaxed text-slate-600 font-medium mb-4 italic">
              &ldquo;{slide.content.quote}&rdquo;
            </p>
            <footer className="not-italic">
              <p className="font-bold text-slate-800 text-sm">{slide.content.name}</p>
              <p className="text-xs text-slate-400 mt-0.5">{slide.content.title}</p>
            </footer>
          </blockquote>
        </div>
      )
    }

    if (slide.type === 'moneyflow') {
      return (
        <div className="flex flex-col items-center justify-center h-full p-8">
          <div className="flex items-end justify-center gap-5 mb-6">
            {slide.content.flows.map((flow, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className={cn(
                  'w-14 h-14 rounded-2xl flex items-center justify-center mb-2 shadow-md',
                  flow.type === 'income' ? 'bg-emerald-50 border border-emerald-100' : 'bg-rose-50 border border-rose-100',
                )}>
                  <flow.icon size={24} className={flow.type === 'income' ? 'text-emerald-500' : 'text-rose-500'} />
                </div>
                <span className="text-[11px] font-medium text-slate-400 mb-0.5">{flow.label}</span>
                <span className={cn('text-sm font-bold tabular-nums', flow.type === 'income' ? 'text-emerald-500' : 'text-rose-500')}>
                  {flow.type === 'income' ? '+' : '-'}Rs.{formatAmount(flow.amount)}
                </span>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-400">{slide.content.subtext}</p>
        </div>
      )
    }

    if (slide.type === 'business') {
      return (
        <div className="flex flex-col items-center justify-center h-full p-8">
          <div className="flex gap-4 mb-6">
            {slide.content.businesses.map((biz, i) => (
              <div key={i} className="w-32 p-4 rounded-2xl shadow-sm"
                style={{ background: `${biz.color}08`, border: `1px solid ${biz.color}20` }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-2 shadow-sm" style={{ background: biz.color }}>
                  <Building2 size={16} className="text-white" />
                </div>
                <p className="font-bold text-slate-800 text-[13px]">{biz.name}</p>
                <p className="text-[11px] text-slate-400">{biz.type}</p>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-100 mb-3">
            <Package size={15} className="text-slate-400" />
            <span className="text-xs font-medium text-slate-600">{slide.content.inventory.items} items in stock</span>
            <div className="w-px h-3 bg-slate-200" />
            <span className="text-[11px] text-rose-500 font-medium">{slide.content.inventory.alerts} low alerts</span>
          </div>
          <p className="text-xs text-slate-400">{slide.content.subtext}</p>
        </div>
      )
    }

    if (slide.type === 'transactions') {
      return (
        <div className="flex flex-col items-center justify-center h-full p-8">
          <div className="w-full max-w-xs space-y-3">
            {slide.content.transactions.map((tx, i) => (
              <div key={i} className="flex items-center justify-between p-3.5 rounded-xl bg-white/80 backdrop-blur-sm shadow-sm border border-slate-100/60">
                <div className="flex items-center gap-3">
                  <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center', tx.type === 'income' ? 'bg-emerald-50' : 'bg-rose-50')}>
                    {tx.type === 'income'
                      ? <TrendingUp   size={16} className="text-emerald-500" />
                      : <TrendingDown size={16} className="text-rose-500" />}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-700 text-[13px]">{tx.label}</p>
                    <p className="text-[11px] text-slate-400">{tx.time}</p>
                  </div>
                </div>
                <span className={cn('font-bold text-sm tabular-nums', tx.type === 'income' ? 'text-emerald-500' : 'text-rose-500')}>
                  {tx.type === 'income' ? '+' : '-'}Rs.{formatAmount(tx.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )
    }

    if (slide.type === 'features') {
      return (
        <div className="flex flex-col items-center justify-center h-full p-8">
          <div className="grid grid-cols-3 gap-5">
            {slide.content.features.map((feature, i) => (
              <div key={i} className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#00F8B4]/10 to-[#00C4FF]/10 flex items-center justify-center mb-2.5 border border-[#00F8B4]/15 shadow-sm">
                  <feature.icon size={20} className="text-[#00F8B4]" />
                </div>
                <p className="font-bold text-slate-700 text-[13px] mb-0.5">{feature.label}</p>
                <p className="text-[11px] text-slate-400 leading-snug">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )
    }

    return null
  }

  /* ─────────────────────────────────────────────
     RENDER
  ───────────────────────────────────────────── */
  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#0B1120] overflow-x-hidden">

      {/* ═══════════════════════════════════════
          LEFT PANEL — LIGHT BRANDING  (lg+)
      ═══════════════════════════════════════ */}
      <div className="hidden lg:flex lg:flex-col lg:w-1/2 xl:w-[55%] relative overflow-hidden bg-gradient-to-br from-white via-slate-50 to-emerald-50/30">
        {/* Mesh gradient blobs */}
        <div className="absolute top-16 -left-20 w-96 h-96 rounded-full blur-[120px] opacity-40 bg-gradient-to-br from-[#00F8B4]/30 to-[#00C4FF]/20 pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-80 h-80 rounded-full blur-[100px] opacity-30 bg-gradient-to-br from-[#00C4FF]/25 to-[#00F8B4]/15 pointer-events-none" />
        <div className="absolute top-1/2 left-1/3 w-64 h-64 rounded-full blur-[80px] opacity-20 bg-[#00F8B4]/20 pointer-events-none" />

        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: 'linear-gradient(rgba(0,0,0,.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,.05) 1px, transparent 1px)',
            backgroundSize:  '40px 40px',
          }} />

        {/* ── Logo ── */}
        <div className="relative z-20 flex-shrink-0 px-12 pt-10">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#00F8B4] to-[#00C4FF] flex items-center justify-center shadow-lg shadow-[#00F8B4]/25">
                <Sparkles size={20} className="text-white" />
              </div>
              <div className="absolute -inset-1.5 rounded-xl bg-gradient-to-br from-[#00F8B4]/20 to-[#00C4FF]/20 blur-lg -z-10" />
            </div>
            <span className="text-[22px] font-black tracking-tight text-slate-800">
              Cash<span className="text-[#00F8B4]">IQ</span>
            </span>
          </div>
        </div>

        {/* ── Center content ── */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-12 py-8">
          <div className="text-center mb-10">
            <h1 className="text-[38px] xl:text-[44px] font-black leading-[1.1] tracking-tight text-slate-800">
              Track Every{' '}
              <span className="bg-gradient-to-r from-[#00F8B4] to-[#00C4FF] bg-clip-text text-transparent">
                Transaction
              </span>
            </h1>
            <p className="mt-3 text-[15px] text-slate-400 font-medium">
              Real-time insights. Full control.
            </p>
          </div>

          {/* Slider */}
          <div
            className="relative w-full max-w-[420px]"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            {/* Glass card */}
            <div className="relative rounded-3xl overflow-hidden border border-white/60 shadow-xl shadow-slate-200/40">
              <div className="absolute inset-0 bg-white/40 backdrop-blur-xl -z-10" />
              <div className="absolute inset-0 bg-gradient-to-b from-white/60 to-white/20 -z-10" />

              {/* Slide viewport */}
              <div className="relative h-[280px] overflow-hidden">
                {SLIDES.map((slide, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      'absolute inset-0 transition-all duration-700 ease-in-out',
                      idx === currentSlide
                        ? 'opacity-100 translate-y-0 scale-100'
                        : idx < currentSlide
                          ? 'opacity-0 -translate-y-8 scale-95'
                          : 'opacity-0 translate-y-8 scale-95',
                    )}
                  >
                    {renderSlideContent(slide)}
                  </div>
                ))}
              </div>

              {/* Nav arrows */}
              <button onClick={prevSlide}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/70 backdrop-blur-sm border border-white/50 shadow-sm flex items-center justify-center hover:bg-white transition-colors group">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500 group-hover:text-slate-700">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
              <button onClick={nextSlide}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/70 backdrop-blur-sm border border-white/50 shadow-sm flex items-center justify-center hover:bg-white transition-colors group">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500 group-hover:text-slate-700">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>

              {/* Dots */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                {SLIDES.map((_, idx) => (
                  <button key={idx} onClick={() => setCurrentSlide(idx)}
                    className={cn(
                      'h-1.5 rounded-full transition-all duration-500',
                      idx === currentSlide
                        ? 'w-8 bg-gradient-to-r from-[#00F8B4] to-[#00C4FF] shadow-sm shadow-[#00F8B4]/30'
                        : 'w-1.5 bg-slate-300 hover:bg-slate-400',
                    )} />
                ))}
              </div>
            </div>

            {/* Glow behind card */}
            <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-[#00F8B4]/10 to-[#00C4FF]/10 blur-2xl -z-10 pointer-events-none" />
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="relative z-20 flex-shrink-0 px-12 pb-10">
          <div className="flex items-center justify-center gap-2">
            <span className="text-[13px] text-slate-400 font-medium">Powered by</span>
            <span className="text-[13px] font-bold bg-gradient-to-r from-[#00F8B4] to-[#00C4FF] bg-clip-text text-transparent">
              SyncOps
            </span>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════
          RIGHT PANEL — DARK AUTH FORM
      ═══════════════════════════════════════ */}
      <div className="flex-1 lg:w-1/2 xl:w-[45%] relative overflow-hidden flex flex-col min-h-screen lg:min-h-0">
        {/* Background layers */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#020617] via-[#071028] to-[#0B1120]" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full blur-[180px] opacity-[0.07] bg-[#00F8B4] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full blur-[150px] opacity-[0.05] bg-[#00C4FF] pointer-events-none" />

        {/* Subtle grid */}
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.08) 1px, transparent 1px)',
            backgroundSize:  '48px 48px',
          }} />

        {/* ── Top bar ── */}
        <div className={cn(
          'relative z-20 flex-shrink-0 flex items-center justify-between px-6 sm:px-10 lg:px-12 pt-8 lg:pt-10',
          isRTL ? 'flex-row-reverse' : '',
        )}>
          {/* Mobile-only logo */}
          <div className="lg:hidden flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#00F8B4] to-[#00C4FF] flex items-center justify-center shadow-md shadow-[#00F8B4]/20">
              <Sparkles size={16} className="text-white" />
            </div>
            <span className="text-white font-black text-lg tracking-tight">
              Cash<span className="text-[#00F8B4]">IQ</span>
            </span>
          </div>
          <div className="hidden lg:block" />

          {/* Language selector dropdown */}
          <div ref={langDropRef} className="relative">
            <button
              type="button"
              onClick={() => setLangDropOpen(o => !o)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.07] transition-all backdrop-blur-md"
            >
              <Globe size={13} className="text-[#00F8B4]/70 flex-shrink-0" />
              <span className="text-white/60 text-[12px] font-semibold">
                {ALL_LANGUAGES.find(l => l.code === language)?.flag}{' '}
                {language === 'ur' ? 'اردو' : language.toUpperCase()}
              </span>
              <ChevronDown size={11} className={cn('text-white/25 transition-transform duration-200', langDropOpen && 'rotate-180')} />
            </button>

            {/* Dropdown */}
            {langDropOpen && (
              <div
                className="absolute top-[calc(100%+8px)] right-0 w-72 rounded-2xl overflow-hidden z-[100] shadow-2xl"
                style={{ background: '#0D1B2E', border: '1px solid rgba(255,255,255,0.10)', boxShadow: '0 20px 60px rgba(0,0,0,0.6)' }}
              >
                {/* Search */}
                <div className="p-2 border-b border-white/[0.06]">
                  <div className="relative">
                    <input
                      type="text"
                      value={langSearch}
                      onChange={e => setLangSearch(e.target.value)}
                      placeholder="Search language..."
                      className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl pl-8 pr-3 py-2 text-white/70 text-[12px] placeholder:text-white/20 focus:outline-none focus:border-[#00F8B4]/30 transition-colors"
                    />
                    <Globe size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/20" />
                  </div>
                </div>

                <div className="max-h-72 overflow-y-auto">
                  {/* Enabled */}
                  {ENABLED_LANGUAGES.filter(l =>
                    !langSearch || l.name.toLowerCase().includes(langSearch.toLowerCase()) || l.nativeName.includes(langSearch)
                  ).length > 0 && (
                    <div>
                      <p className="px-3 pt-2.5 pb-1 text-[10px] font-bold text-[#00F8B4]/50 uppercase tracking-widest">Available</p>
                      {ENABLED_LANGUAGES.filter(l =>
                        !langSearch || l.name.toLowerCase().includes(langSearch.toLowerCase()) || l.nativeName.includes(langSearch)
                      ).map(lang => (
                        <button key={lang.code} type="button" onClick={() => handleLangSelect(lang)}
                          className={cn(
                            'w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-white/[0.06] transition-colors',
                            language === lang.code && 'bg-[#00F8B4]/[0.07]',
                          )}>
                          <span className="text-base select-none">{lang.flag}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-white/80 text-[13px] font-medium">{lang.name}</p>
                            <p className="text-white/30 text-[11px]">{lang.nativeName}</p>
                          </div>
                          {language === lang.code && <Check size={13} className="text-[#00F8B4]" />}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Disabled */}
                  {ALL_LANGUAGES.filter(l => !l.enabled && (
                    !langSearch || l.name.toLowerCase().includes(langSearch.toLowerCase()) || l.nativeName.includes(langSearch)
                  )).length > 0 && (
                    <div>
                      <div className="flex items-center gap-1.5 px-3 pt-2.5 pb-1">
                        <Clock size={10} className="text-white/20" />
                        <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Coming Soon</p>
                      </div>
                      {ALL_LANGUAGES.filter(l => !l.enabled && (
                        !langSearch || l.name.toLowerCase().includes(langSearch.toLowerCase()) || l.nativeName.includes(langSearch)
                      )).map(lang => {
                        const toasting = langToasted === lang.code
                        return (
                          <button key={lang.code} type="button" onClick={() => handleLangSelect(lang)}
                            className="w-full flex items-center gap-3 px-3 py-2 text-left opacity-40 hover:opacity-60 transition-opacity cursor-not-allowed">
                            <span className="text-base select-none">{lang.flag}</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-white/60 text-[12px] font-medium">{lang.name}</p>
                            </div>
                            <span className={cn(
                              'text-[9px] font-bold px-1.5 py-0.5 rounded',
                              toasting ? 'bg-amber-500/30 text-amber-400' : 'bg-white/[0.06] text-white/20',
                            )}>
                              {toasting ? 'Soon!' : 'Soon'}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>

                {/* Footer hint */}
                <div className="px-3 py-2.5 border-t border-white/[0.06] flex items-center justify-between">
                  <p className="text-[11px] text-white/20">More languages on next step</p>
                  <button
                    type="button"
                    onClick={() => { setLangDropOpen(false); router.push('/language') }}
                    className="text-[11px] text-[#00F8B4]/50 hover:text-[#00F8B4]/80 transition-colors font-semibold"
                  >
                    See all →
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Form area ── */}
        <div className="relative z-10 flex-1 flex flex-col justify-center px-6 sm:px-10 lg:px-12 py-10 lg:py-0 max-w-[540px] w-full mx-auto lg:max-w-none">

          {/* Heading */}
          <div className={cn('mb-8', isRTL ? 'text-right' : 'text-left')}>
            <h2 className="text-[28px] sm:text-[34px] lg:text-[38px] font-black text-white leading-[1.15] tracking-tight mb-3">
              Enter your{' '}
              <span className="bg-gradient-to-r from-[#00F8B4] to-[#00C4FF] bg-clip-text text-transparent">
                mobile number
              </span>
            </h2>
            <p className="text-[14px] text-white/35 font-light leading-relaxed">
              We&apos;ll send a secure OTP to verify your number instantly
            </p>
          </div>

          {/* ── Phone input ── */}
          <div className="mb-8 relative">
            <div className={cn(
              'relative flex items-stretch rounded-2xl overflow-visible transition-all duration-500 group',
              error
                ? 'bg-red-500/[0.06] border border-red-500/30'
                : isFocused
                  ? 'bg-white/[0.07] border border-[#00F8B4]/40'
                  : 'bg-white/[0.03] border border-white/[0.08] hover:border-white/[0.12]',
            )}>
              {/* Focus glow */}
              {isFocused && !error && (
                <div className="absolute -inset-px rounded-2xl pointer-events-none transition-opacity duration-500"
                  style={{ boxShadow: '0 0 40px rgba(0,248,180,0.15), 0 0 80px rgba(0,248,180,0.05), inset 0 0 30px rgba(0,248,180,0.03)' }} />
              )}

              {/* ── Country selector ── */}
              <div ref={dropdownRef} className="relative flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setDropdownOpen(o => !o)}
                  className={cn(
                    'flex items-center gap-2 px-4 sm:px-5 h-[60px] sm:h-16 hover:bg-white/[0.04] transition-colors rounded-l-2xl',
                    isRTL ? 'border-l border-white/[0.06]' : 'border-r border-white/[0.06]',
                  )}
                >
                  <span className="text-xl leading-none select-none">{selectedCountry.flag}</span>
                  <span className="text-white/55 font-semibold text-[12px] sm:text-[13px] tracking-wide hidden xs:inline min-w-[32px]">
                    {selectedCountry.dial}
                  </span>
                  <ChevronDown
                    size={12}
                    className={cn('text-white/25 transition-transform duration-200 flex-shrink-0', dropdownOpen && 'rotate-180')}
                  />
                </button>

                {/* Dropdown */}
                {dropdownOpen && (
                  <div
                    className="absolute top-[calc(100%+8px)] left-0 w-64 rounded-2xl overflow-hidden z-[100] shadow-2xl"
                    style={{
                      background:  '#0D1B2E',
                      border:      '1px solid rgba(255,255,255,0.10)',
                      boxShadow:   '0 20px 60px rgba(0,0,0,0.6), 0 4px 20px rgba(0,0,0,0.4)',
                    }}
                  >
                    {/* Search */}
                    <div className="p-2 border-b border-white/[0.06]">
                      <input
                        ref={searchRef}
                        type="text"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="Search country..."
                        className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-3 py-2 text-white/70 text-[13px] placeholder:text-white/20 focus:outline-none focus:border-[#00F8B4]/30 transition-colors"
                      />
                    </div>

                    {/* List */}
                    <div className="max-h-[260px] overflow-y-auto">
                      {filteredCountries.length === 0 ? (
                        <div className="px-4 py-6 text-center text-white/25 text-[13px]">No results</div>
                      ) : (
                        filteredCountries.map(country => (
                          <button
                            key={country.code}
                            type="button"
                            onClick={() => handleCountrySelect(country)}
                            className={cn(
                              'w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/[0.06] transition-colors',
                              selectedCountry.code === country.code && 'bg-[#00F8B4]/[0.06]',
                            )}
                          >
                            <span className="text-lg leading-none select-none flex-shrink-0">{country.flag}</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-white/75 text-[13px] font-medium truncate">{country.name}</p>
                            </div>
                            <span className="text-white/30 text-[12px] tabular-nums flex-shrink-0">{country.dial}</span>
                            {selectedCountry.code === country.code && (
                              <Check size={13} className="text-[#00F8B4] flex-shrink-0" />
                            )}
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Input field */}
              <div className={cn('flex items-center gap-2 sm:gap-3 flex-1 px-4 sm:px-5 h-[60px] sm:h-16 min-w-0', isRTL ? 'flex-row-reverse' : '')}>
                <Phone size={16} className={cn('flex-shrink-0 transition-colors', isFocused ? 'text-[#00F8B4]/60' : 'text-white/20')} />
                <input
                  type="tel"
                  value={phone}
                  onChange={e => {
                    setPhone(formatPhoneInput(e.target.value))
                    setError('')
                  }}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  onKeyDown={e => e.key === 'Enter' && !loading && handleContinue()}
                  placeholder={selectedCountry.placeholder}
                  inputMode="tel"
                  autoFocus
                  disabled={loading}
                  className={cn(
                    'flex-1 min-w-0 bg-transparent text-white text-[14px] sm:text-[15px] font-medium placeholder:text-white/15 focus:outline-none disabled:opacity-40 transition-colors',
                    isRTL ? 'text-right' : 'text-left',
                  )}
                />
              </div>
            </div>

            {/* Error */}
            {error && (
              <p className={cn('text-red-400/90 text-[13px] mt-3 font-medium flex items-center gap-1.5', isRTL ? 'justify-end' : '')}>
                <span className="w-1 h-1 rounded-full bg-red-400 flex-shrink-0" />
                {error}
              </p>
            )}
          </div>

          {/* ── Feature list ── */}
          <div className={cn('space-y-3 mb-8', isRTL ? 'text-right' : 'text-left')}>
            {[
              { icon: Lock,   label: 'Secure login',       color: '#00F8B4' },
              { icon: Zap,    label: 'Instant verification', color: '#00C4FF' },
              { icon: Shield, label: 'No spam guarantee',   color: '#00F8B4' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 text-white/30 text-[13px] font-medium">
                <item.icon size={15} className="text-white/20 flex-shrink-0" />
                <span>{item.label}</span>
              </div>
            ))}
          </div>

          {/* ── CTA Button ── */}
          <button
            onClick={handleContinue}
            disabled={!isValidPhone() || loading}
            className={cn(
              'relative w-full h-[52px] sm:h-14 rounded-2xl font-bold text-[15px] flex items-center justify-center gap-2.5 transition-all duration-500 overflow-hidden group',
              isValidPhone() && !loading
                ? 'text-[#0B1120] cursor-pointer active:scale-[0.985]'
                : 'bg-white/[0.04] text-white/20 cursor-not-allowed border border-white/[0.06]',
            )}
          >
            {isValidPhone() && !loading && (
              <>
                <div className="absolute inset-0 bg-gradient-to-r from-[#00F8B4] to-[#00C4FF] transition-opacity duration-500" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#00F8B4] to-[#00C4FF] opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"
                  style={{ boxShadow: '0 0 50px rgba(0,248,180,0.4), 0 0 100px rgba(0,196,255,0.2)' }} />
                <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </>
            )}
            <span className="relative z-10 flex items-center gap-2.5">
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Sending OTP...
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight size={18} strokeWidth={2.5} className="transition-transform duration-300 group-hover:translate-x-1" />
                </>
              )}
            </span>
          </button>

          {/* Existing account */}
          {storedPhone && pinHash && (
            <button
              onClick={() => router.push('/pin')}
              className={cn(
                'mt-7 text-center text-[13px] text-white/25 hover:text-white/40 transition-colors font-medium',
                isRTL ? 'flex flex-row-reverse justify-center' : '',
              )}
            >
              {translations.auth.alreadySetup}{' '}
              <span className="text-[#00F8B4]/70 font-semibold ml-1 hover:text-[#00F8B4] transition-colors">
                {translations.auth.enterPinButton} →
              </span>
            </button>
          )}
        </div>

        {/* ── Bottom bar ── */}
        <div className={cn(
          'relative z-10 flex-shrink-0 px-6 sm:px-10 lg:px-12 py-6 border-t border-white/[0.04]',
          isRTL ? 'text-right' : 'text-left',
        )}>
          <p className="text-white/15 text-[11px] font-medium tracking-wide">
            By continuing, you agree to our Terms of Service &amp; Privacy Policy
          </p>
        </div>
      </div>
    </div>
  )
}
