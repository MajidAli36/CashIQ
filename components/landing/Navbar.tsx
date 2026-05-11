'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles, Menu, X, Mail, Phone, MessageCircle, Linkedin, Instagram,
  HeadphonesIcon, ChevronDown, ExternalLink, Calendar, Zap, Globe,
} from 'lucide-react'
import { useSettingsStore } from '@/lib/store/settings.store'

// ─── Constants ───────────────────────────────────────────────────────────────

const NAV_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Security', href: '#security' },
  { label: 'For Businesses', href: '#benefits' },
]

const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'ur', label: 'اردو', flag: '🇵🇰' },
] as const

const GRADIENT = 'linear-gradient(135deg, #00F8B4 0%, #00C4FF 100%)'
const SYNCOPS_GRADIENT = 'linear-gradient(135deg, #7C3AED 0%, #00C4FF 100%)'

const G_TEXT: React.CSSProperties = {
  background: GRADIENT,
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
}

// ─── Language Switcher ───────────────────────────────────────────────────────

function LanguageSwitcher({ variant = 'light' }: { variant?: 'light' | 'dark' }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const { shop, updateShop } = useSettingsStore()

  const [activeLang, setActiveLang] = useState<'en' | 'ur'>('en')

  // Sync from store/localStorage
  useEffect(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem('language') : null
    const resolved = (shop.language === 'en' || shop.language === 'ur')
      ? shop.language
      : (stored === 'en' || stored === 'ur')
        ? stored as 'en' | 'ur'
        : 'en'
    setActiveLang(resolved)
  }, [shop.language])

  // Close on outside click
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const handleSelect = (code: 'en' | 'ur') => {
    setActiveLang(code)
    localStorage.setItem('language', code)
    updateShop({ language: code })
    setOpen(false)
  }

  const active = LANGUAGES.find(l => l.code === activeLang) ?? LANGUAGES[0]

  const btnClass = variant === 'light'
    ? 'text-[#4B5563] hover:text-[#0B1729] hover:bg-gray-100 border border-gray-200 hover:border-gray-300'
    : 'text-white/70 hover:text-white hover:bg-white/[0.08] border border-white/[0.1]'

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[13px] font-semibold transition-all duration-200 ${btnClass}`}
      >
        <Globe size={13} />
        <span className="hidden sm:inline">{active.flag}</span>
        <span>{active.label}</span>
        <ChevronDown
          size={12}
          className="transition-transform duration-200"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            key="lang-dropdown"
            initial={{ opacity: 0, y: -6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.96 }}
            transition={{ duration: 0.14, ease: 'easeOut' }}
            className="absolute right-0 top-full mt-2 w-44 rounded-2xl overflow-hidden z-[100]"
            style={{
              background: 'rgba(8,12,28,0.97)',
              border: '1px solid rgba(255,255,255,0.1)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.4), 0 4px 16px rgba(0,0,0,0.2)',
            }}
          >
            {/* Header */}
            <div className="px-3.5 pt-3 pb-1.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-white/30">Language</p>
            </div>
            <div className="p-1.5 pt-0.5">
              {LANGUAGES.map(lang => {
                const isActive = lang.code === activeLang
                return (
                  <button
                    key={lang.code}
                    onClick={() => handleSelect(lang.code)}
                    className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-left transition-all duration-150"
                    style={{
                      background: isActive ? 'rgba(0,248,180,0.1)' : 'transparent',
                      border: isActive ? '1px solid rgba(0,248,180,0.2)' : '1px solid transparent',
                    }}
                    onMouseEnter={e => {
                      if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(0,255,200,0.06)'
                    }}
                    onMouseLeave={e => {
                      if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = 'transparent'
                    }}
                  >
                    <span className="text-xl leading-none">{lang.flag}</span>
                    <span className={`text-sm font-semibold flex-1 ${isActive ? 'text-white' : 'text-white/65'}`}>
                      {lang.label}
                    </span>
                    {isActive && (
                      <div className="w-4 h-4 rounded-full flex items-center justify-center"
                        style={{ background: GRADIENT }}>
                        <div className="w-1.5 h-1.5 rounded-full bg-white" />
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
            <div className="px-3.5 py-2.5 border-t border-white/[0.06]">
              <p className="text-[10px] text-white/25">More languages coming soon</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── SyncOps Drawer ──────────────────────────────────────────────────────────

function SyncOpsDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  const socialLinks = [
    { icon: MessageCircle, label: 'WhatsApp', color: '#25D366', bg: 'rgba(37,211,102,0.12)', href: '#' },
    { icon: Linkedin, label: 'LinkedIn', color: '#0077B5', bg: 'rgba(0,119,181,0.12)', href: '#' },
    { icon: Instagram, label: 'Instagram', color: '#E1306C', bg: 'rgba(225,48,108,0.12)', href: '#' },
    { icon: Globe, label: 'Website', color: '#00F8B4', bg: 'rgba(0,248,180,0.12)', href: '#' },
  ]

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="fixed inset-0 z-[200]"
            style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)' }}
            onClick={onClose}
          />
          <motion.aside
            key="drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="fixed top-0 right-0 bottom-0 z-[201] flex flex-col overflow-hidden"
            style={{
              width: 'min(420px, 100vw)',
              background: 'rgba(10,15,30,0.97)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              borderLeft: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '-24px 0 80px rgba(0,0,0,0.55)',
            }}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-all"
            >
              <X size={16} />
            </button>

            <div className="flex flex-col h-full overflow-y-auto p-7">
              <div className="mb-7">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-12 h-12 rounded-[14px] flex items-center justify-center flex-shrink-0"
                    style={{ background: SYNCOPS_GRADIENT, boxShadow: '0 0 28px rgba(124,58,237,0.4)' }}>
                    <Zap size={20} className="text-white" strokeWidth={2.5} />
                  </div>
                  <div>
                    <p className="text-white font-black text-xl tracking-tight leading-none mb-0.5">SyncOps</p>
                    <p className="text-white/40 text-xs">AI-Driven Software Solutions</p>
                  </div>
                </div>
                <div className="h-px bg-white/[0.06]" />
              </div>

              <p className="text-white/60 text-sm leading-relaxed mb-7">
                Built and powered by <span className="text-white font-semibold">SyncOps</span> — AI-driven
                software solutions for modern businesses. We build premium SaaS products that scale.
              </p>

              <div className="grid grid-cols-3 gap-2.5 mb-7">
                {[{ value: '12+', label: 'Products' }, { value: '50K+', label: 'Users' }, { value: '4.9★', label: 'Rating' }].map(
                  ({ value, label }) => (
                    <div key={label} className="py-3 px-2 rounded-xl text-center"
                      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                      <p className="font-black text-lg leading-none mb-1" style={G_TEXT}>{value}</p>
                      <p className="text-white/35 text-[10px]">{label}</p>
                    </div>
                  )
                )}
              </div>

              <div className="mb-7">
                <p className="text-white/30 text-[10px] uppercase tracking-wider font-bold mb-3">What We Build</p>
                <div className="space-y-2.5">
                  {['Fintech & ERP platforms', 'AI-powered business tools', 'Mobile & web applications', 'Custom SaaS solutions'].map(item => (
                    <div key={item} className="flex items-center gap-2.5">
                      <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: GRADIENT }} />
                      <p className="text-white/60 text-sm">{item}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2.5 mb-7">
                <a href="https://syncops.tech" target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 active:scale-[0.98]"
                  style={{ background: SYNCOPS_GRADIENT }}>
                  <Globe size={14} />Visit SyncOps<ExternalLink size={11} className="opacity-60" />
                </a>
                <a href="https://calendly.com/syncops" target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl text-sm font-semibold text-white/80 transition-all hover:bg-white/10 active:scale-[0.98]"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <Calendar size={14} />Schedule a Call
                </a>
              </div>

              <div className="mb-7">
                <p className="text-white/30 text-[10px] uppercase tracking-wider font-bold mb-3">Connect</p>
                <div className="flex items-center gap-2">
                  {socialLinks.map(({ icon: Icon, label, color, bg, href }) => (
                    <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
                      className="flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl transition-all hover:scale-105"
                      style={{ background: bg, border: `1px solid ${color}25` }}>
                      <Icon size={15} style={{ color }} />
                      <span className="text-[9px] text-white/40 font-medium">{label}</span>
                    </a>
                  ))}
                </div>
              </div>

              <div className="mt-auto pt-4 border-t border-white/[0.06]">
                <p className="text-center text-[11px] text-white/20">© 2025 SyncOps. All rights reserved.</p>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}

// ─── Main Navbar ─────────────────────────────────────────────────────────────

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [topbarVisible, setTopbarVisible] = useState(true)
  const [drawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY
      setScrolled(y > 20)
      setTopbarVisible(y < 60)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 1024) setMenuOpen(false) }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const navbarTop = topbarVisible ? 38 : 0
  const totalHeight = navbarTop + 78

  return (
    <>
      <SyncOpsDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />

      {/* ── Topbar (Dark) ── */}
      <AnimatePresence>
        {topbarVisible && (
          <motion.div
            key="topbar"
            initial={{ height: 38, opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="fixed top-0 left-0 right-0 z-[60] overflow-hidden"
            style={{ background: '#040816', borderBottom: '1px solid rgba(255,255,255,0.05)' }}
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 h-[38px] flex items-center">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <a href="mailto:support@cashiq.tech"
                  className="hidden sm:flex items-center gap-1.5 text-[11px] text-white/45 hover:text-white/80 transition-colors whitespace-nowrap">
                  <Mail size={10} />support@cashiq.tech
                </a>
                <span className="hidden sm:block w-px h-3 bg-white/10" />
                <a href="tel:+92XXXXXXXXXX"
                  className="hidden md:flex items-center gap-1.5 text-[11px] text-white/45 hover:text-white/80 transition-colors whitespace-nowrap">
                  <Phone size={10} />+92-XXX-XXXXXXX
                </a>
                <span className="hidden md:block w-px h-3 bg-white/10" />
                <span className="text-[11px] text-white/35 hidden sm:block truncate">
                  🇵🇰 Pakistan's Trusted Business Platform
                </span>
              </div>

              {/* Center — Powered by SyncOps */}
              <div className="absolute left-1/2 -translate-x-1/2 hidden sm:block">
                <button
                  onClick={() => setDrawerOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-[3px] rounded-full transition-all hover:scale-105"
                  style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(0,196,255,0.2)', boxShadow: '0 0 12px rgba(0,196,255,0.08)' }}
                >
                  <span className="text-[10px] text-white/50 font-medium">Powered by</span>
                  <span className="text-[10px] font-extrabold" style={G_TEXT}>SyncOps</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00F8B4] animate-pulse" />
                </button>
              </div>

              <div className="flex items-center gap-0.5 flex-shrink-0">
                {[
                  { icon: HeadphonesIcon, href: '#', label: 'Support', hover: '#00F8B4', bg: '#00F8B4' },
                  { icon: MessageCircle, href: 'https://wa.me/92XXXXXXXXXX', label: 'WhatsApp', hover: '#25D366', bg: '#25D366' },
                  { icon: Linkedin, href: '#', label: 'LinkedIn', hover: '#0077B5', bg: '#0077B5' },
                  { icon: Instagram, href: '#', label: 'Instagram', hover: '#E1306C', bg: '#E1306C' },
                ].map(({ icon: Icon, href, label, hover, bg }) => (
                  <a key={label} href={href} target={href !== '#' ? '_blank' : undefined}
                    rel="noopener noreferrer" aria-label={label}
                    className="w-6 h-6 flex items-center justify-center rounded-md text-white/35 transition-all"
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = hover; (e.currentTarget as HTMLElement).style.background = `${bg}18` }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = ''; (e.currentTarget as HTMLElement).style.background = '' }}>
                    <Icon size={11} />
                  </a>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Navbar (White / Light) ── */}
      <header
        className="fixed left-0 right-0 z-50"
        style={{
          top: navbarTop,
          height: 78,
          background: '#FFFFFF',
          borderBottom: '1px solid rgba(0,0,0,0.07)',
          boxShadow: scrolled ? '0 4px 24px rgba(0,0,0,0.07)' : 'none',
          transition: 'top 0.3s ease, box-shadow 0.3s ease',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 h-full flex items-center justify-between gap-4">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 flex-shrink-0 group">
            <div className="w-9 h-9 rounded-[11px] flex items-center justify-center transition-all group-hover:scale-105 group-hover:shadow-[0_4px_20px_rgba(0,196,255,0.4)]"
              style={{ background: GRADIENT, boxShadow: '0 2px 12px rgba(0,196,255,0.2)' }}>
              <Sparkles size={16} className="text-white" strokeWidth={2.5} />
            </div>
            <span className="font-black text-[22px] tracking-tight leading-none select-none">
              <span className="text-[#0B1729]">Cash</span>
              <span style={G_TEXT}>IQ</span>
            </span>
          </Link>

          {/* Center Nav Links */}
          <nav className="hidden lg:flex items-center flex-1 justify-center">
            {NAV_LINKS.map(({ label, href }) => (
              <a key={label} href={href}
                className="relative px-3.5 xl:px-4 py-2 text-[13.5px] font-medium text-[#4B5563] hover:text-[#0B1729] rounded-lg transition-all duration-200 whitespace-nowrap group">
                {label}
                <span className="absolute bottom-1 left-3.5 right-3.5 xl:left-4 xl:right-4 h-[2px] rounded-full origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-200"
                  style={{ background: GRADIENT }} />
              </a>
            ))}
          </nav>

          {/* Right — Language + CTA */}
          <div className="hidden lg:flex items-center gap-2 flex-shrink-0">
            <LanguageSwitcher variant="light" />
            <div className="w-px h-5 bg-gray-200 mx-1" />
            <Link href="/phone"
              className="px-4 py-2.5 text-[13.5px] font-semibold text-[#4B5563] hover:text-[#0B1729] rounded-xl hover:bg-gray-50 transition-all duration-200">
              Sign In
            </Link>
            <Link href="/phone"
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-[13.5px] font-bold text-white transition-all duration-200 hover:-translate-y-[2px] active:translate-y-0 active:scale-[0.98]"
              style={{ background: GRADIENT, boxShadow: '0 4px 16px rgba(0,196,255,0.25)' }}
              onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 8px 28px rgba(0,196,255,0.4)')}
              onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,196,255,0.25)')}>
              Start Free <span className="opacity-70">→</span>
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(v => !v)}
            className="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl text-[#4B5563] hover:text-[#0B1729] hover:bg-gray-100 transition-all"
            aria-label="Toggle navigation"
          >
            <motion.div animate={{ rotate: menuOpen ? 90 : 0 }} transition={{ duration: 0.2 }}>
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </motion.div>
          </button>
        </div>
      </header>

      {/* ── Mobile Menu (White) ── */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
            className="fixed left-0 right-0 z-40 lg:hidden"
            style={{
              top: totalHeight,
              background: '#FFFFFF',
              borderBottom: '1px solid rgba(0,0,0,0.08)',
              boxShadow: '0 16px 48px rgba(0,0,0,0.1)',
            }}
          >
            <div className="px-5 py-3">
              {NAV_LINKS.map(({ label, href }) => (
                <a key={label} href={href} onClick={() => setMenuOpen(false)}
                  className="flex items-center justify-between py-3.5 text-[15px] font-medium text-[#374151] hover:text-[#0B1729] border-b border-gray-100 last:border-0 transition-colors">
                  {label}
                  <ChevronDown size={14} className="text-gray-300 -rotate-90" />
                </a>
              ))}

              {/* Language + Auth in mobile */}
              <div className="pt-4 pb-1 flex items-center justify-between">
                <LanguageSwitcher variant="light" />
                <div className="h-4 w-px bg-gray-200" />
              </div>

              <div className="pt-2 pb-3 flex flex-col gap-2.5">
                <Link href="/phone" onClick={() => setMenuOpen(false)}
                  className="py-3 text-center text-sm font-semibold text-[#4B5563] hover:text-[#0B1729] border border-gray-200 rounded-xl transition-all hover:bg-gray-50">
                  Sign In
                </Link>
                <Link href="/phone" onClick={() => setMenuOpen(false)}
                  className="py-3.5 text-center text-sm font-bold text-white rounded-xl transition-all hover:opacity-90 active:scale-[0.98]"
                  style={{ background: GRADIENT, boxShadow: '0 4px 20px rgba(0,196,255,0.3)' }}>
                  Start Free — No Credit Card
                </Link>
              </div>

              <div className="pb-3 flex justify-center">
                <button onClick={() => { setMenuOpen(false); setDrawerOpen(true) }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all hover:scale-105"
                  style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(0,196,255,0.15)' }}>
                  <span className="text-[11px] text-gray-400">Powered by</span>
                  <span className="text-[11px] font-extrabold" style={G_TEXT}>SyncOps</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00F8B4] animate-pulse" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Page spacer */}
      <div className="transition-all duration-300" style={{ height: totalHeight }} />
    </>
  )
}
