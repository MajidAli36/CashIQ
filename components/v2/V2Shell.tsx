'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Home, ArrowLeftRight, Users, Plus, LayoutDashboard,
  BookOpen, PieChart, FileCheck, Package, Building2, Settings,
  ChevronRight, X, MoreHorizontal,
} from 'lucide-react'
import { ToastContainer } from '@/components/ui/Toast'
import { useSettingsStore } from '@/lib/store/settings.store'
import { useViewModeStore } from '@/lib/store/view-mode.store'

const NAV_ITEMS = [
  { href: '/v2/dashboard',    icon: Home,           label: 'Home' },
  { href: '/v2/transactions', icon: ArrowLeftRight, label: 'Transactions' },
  { href: '/v2/people',       icon: Users,          label: 'People' },
]

const MORE_ITEMS = [
  { href: '/loan',       icon: BookOpen,   label: 'Loans',      desc: 'Track money lent & borrowed', color: '#F59E0B', bg: '#FEF3C7' },
  { href: '/reports',    icon: PieChart,   label: 'Reports',    desc: 'Sales & expense analytics',   color: '#8B5CF6', bg: '#EDE9FE' },
  { href: '/checks',     icon: FileCheck,  label: 'Checks',     desc: 'Cheque / guarantee tracking', color: '#06B6D4', bg: '#CFFAFE' },
  { href: '/customers',  icon: Users,      label: 'Customers',  desc: 'Full customer management',    color: '#10B981', bg: '#D1FAE5' },
  { href: '/inventory',  icon: Package,    label: 'Inventory',  desc: 'Stock & product tracking',    color: '#F97316', bg: '#FFEDD5' },
  { href: '/businesses', icon: Building2,  label: 'Businesses', desc: 'Manage multiple businesses',  color: '#3B82F6', bg: '#DBEAFE' },
  { href: '/settings',   icon: Settings,   label: 'Settings',   desc: 'App preferences & wallets',  color: '#64748B', bg: '#F1F5F9' },
]

export function V2Shell({ children }: { children: React.ReactNode }) {
  const pathname        = usePathname()
  const router          = useRouter()
  const shop            = useSettingsStore(s => s.shop)
  const { setViewMode } = useViewModeStore()
  const [moreOpen, setMoreOpen] = useState(false)

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')
  const hideFAB  = pathname === '/add'

  const switchToFull = () => {
    setViewMode('full')
    router.push('/dashboard')
  }

  return (
    /*
     * Layout strategy:
     * mobile  → flex-col, h-dvh:  [top-bar][main (scroll)][bottom-nav]
     * desktop → flex-row, h-dvh:  [sidebar][main (scroll)]
     *
     * min-h-0 on flex children prevents them growing past h-dvh,
     * which lets overflow-y:auto on <main> actually create a scroll container.
     * sticky top-0 inside <main> then sticks to the top of that container,
     * which on mobile is exactly below the top bar.
     */
    <div
      className="flex flex-col lg:flex-row bg-[#F8FAFC]"
      style={{ height: '100dvh' }}
    >

      {/* ── DESKTOP SIDEBAR ── */}
      <aside
        className="hidden lg:flex flex-col flex-shrink-0 w-[220px] overflow-y-auto sidebar-scroll"
        style={{ background: '#0B0F1A' }}
      >
        {/* Logo */}
        <div className="px-6 py-7 flex-shrink-0">
          <span className="text-white font-black text-[22px] tracking-tight">
            Roz<span style={{ color: '#00C4B4' }}>.</span>Cash
          </span>
          <p className="text-white/25 text-[10px] font-semibold uppercase tracking-widest mt-0.5">
            Simple View
          </p>
        </div>

        {/* Main nav */}
        <nav className="flex-1 px-3 space-y-1">
          {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
            const active = isActive(href)
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-150 ${
                  active
                    ? 'bg-[#00C4B4]/15 text-[#00C4B4] font-bold'
                    : 'text-white/50 hover:text-white/80 hover:bg-white/5 font-medium'
                }`}
                style={{ height: '48px' }}
              >
                <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
                <span className="text-[14px]">{label}</span>
              </Link>
            )
          })}

          {/* Advanced features */}
          <p className="text-white/20 text-[10px] font-bold uppercase tracking-widest px-4 pt-4 pb-1">
            More Features
          </p>
          {MORE_ITEMS.map(({ href, icon: Icon, label, color }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-white/40 hover:text-white/70 hover:bg-white/5 transition-all"
              style={{ height: '40px' }}
            >
              <Icon size={16} strokeWidth={1.8} style={{ color }} />
              <span className="text-[13px] font-medium">{label}</span>
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div
          className="px-4 py-4 flex-shrink-0 space-y-2"
          style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}
        >
          {shop.name ? (
            <div>
              <p className="text-white/25 text-[10px] font-semibold uppercase tracking-widest mb-0.5">
                Business
              </p>
              <p className="text-white/60 text-sm font-semibold truncate">{shop.name}</p>
            </div>
          ) : null}
          <button
            onClick={switchToFull}
            className="flex items-center gap-2 px-3 py-2 rounded-xl w-full text-[12px] font-semibold transition-colors hover:bg-white/8"
            style={{ color: 'rgba(255,255,255,0.35)' }}
          >
            <LayoutDashboard size={14} />
            Switch to Full App
          </button>
        </div>
      </aside>

      {/* ── MAIN COLUMN (fills remaining space, flex-col) ── */}
      {/* min-h-0 is required: flex children default to min-height:auto which
          prevents overflow-y:auto from activating on <main> */}
      <div className="flex-1 flex flex-col min-h-0">

        {/* Mobile top bar */}
        <div
          className="lg:hidden flex-shrink-0 h-10 flex items-center justify-between px-4"
          style={{ background: '#ffffff', borderBottom: '1px solid #F1F5F9' }}
        >
          <span className="text-[13px] font-black" style={{ color: '#00C4B4' }}>
            {shop.name || 'CashIQ'}
          </span>
          <button
            onClick={switchToFull}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold"
            style={{ background: '#F1F5F9', color: '#64748B' }}
          >
            <LayoutDashboard size={11} />
            Full App
          </button>
        </div>

        {/* Scrollable content — THIS is the scroll container */}
        <main className="flex-1 overflow-y-auto min-h-0">
          {children}
        </main>

        {/* Mobile bottom nav */}
        <nav
          className="lg:hidden flex-shrink-0 bg-white border-t border-gray-100"
          style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
        >
          <div className="flex items-center">
            {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
              const active = isActive(href)
              return (
                <Link
                  key={href}
                  href={href}
                  className="flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5"
                >
                  <Icon
                    size={22}
                    strokeWidth={active ? 2.5 : 1.8}
                    style={{ color: active ? '#00C4B4' : '#94A3B8' }}
                  />
                  <span
                    className="text-[10px] font-semibold"
                    style={{ color: active ? '#00C4B4' : '#94A3B8' }}
                  >
                    {label}
                  </span>
                </Link>
              )
            })}

            {/* More tab */}
            <button
              onClick={() => setMoreOpen(true)}
              className="flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5"
            >
              <MoreHorizontal size={22} strokeWidth={1.8} style={{ color: '#94A3B8' }} />
              <span className="text-[10px] font-semibold" style={{ color: '#94A3B8' }}>More</span>
            </button>
          </div>
        </nav>
      </div>

      {/* ── MOBILE FAB — fixed to viewport, above bottom nav ── */}
      {!hideFAB && (
        <Link
          href="/add"
          className="lg:hidden fixed z-40 flex items-center justify-center rounded-full shadow-lg"
          style={{
            bottom: 'calc(env(safe-area-inset-bottom, 0px) + 72px)',
            right: '16px',
            width: '56px',
            height: '56px',
            background: '#00C4B4',
          }}
        >
          <Plus size={24} color="#fff" strokeWidth={2.5} />
        </Link>
      )}

      {/* ── MORE BOTTOM SHEET ── */}
      {moreOpen && (
        <>
          {/* Backdrop */}
          <div
            className="lg:hidden fixed inset-0 z-50 bg-black/40"
            style={{ backdropFilter: 'blur(2px)' }}
            onClick={() => setMoreOpen(false)}
          />

          {/* Sheet */}
          <div
            className="lg:hidden fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl"
            style={{ background: '#fff', boxShadow: '0 -8px 40px rgba(0,0,0,0.12)' }}
          >
            {/* Handle + header */}
            <div className="flex items-start justify-between px-5 pt-4 pb-2">
              <div>
                <div className="w-10 h-1 rounded-full bg-gray-200 mb-3" />
                <p className="text-base font-black" style={{ color: '#0B0F1A' }}>More Features</p>
                <p className="text-xs mt-0.5" style={{ color: '#94A3B8' }}>
                  Advanced tools for your business
                </p>
              </div>
              <button
                onClick={() => setMoreOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center mt-1"
                style={{ background: '#F1F5F9' }}
              >
                <X size={16} style={{ color: '#64748B' }} />
              </button>
            </div>

            {/* Feature list */}
            <div
              className="px-4 pb-2 space-y-1.5"
              style={{ maxHeight: '60vh', overflowY: 'auto' }}
            >
              {MORE_ITEMS.map(({ href, icon: Icon, label, desc, color, bg }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMoreOpen(false)}
                  className="flex items-center gap-3 px-3 py-3 rounded-2xl active:bg-gray-50 transition-colors"
                  style={{ border: '1px solid #F1F5F9' }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: bg }}
                  >
                    <Icon size={18} style={{ color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold" style={{ color: '#0B0F1A' }}>{label}</p>
                    <p className="text-xs" style={{ color: '#94A3B8' }}>{desc}</p>
                  </div>
                  <ChevronRight size={16} style={{ color: '#CBD5E1' }} />
                </Link>
              ))}

              {/* Switch to full app */}
              <button
                onClick={() => { setMoreOpen(false); switchToFull() }}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-2xl active:opacity-80 transition-opacity"
                style={{ background: '#0B0F1A' }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(255,255,255,0.10)' }}
                >
                  <LayoutDashboard size={18} color="#fff" />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-bold text-white">Switch to Full App</p>
                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.40)' }}>
                    Access all features & analytics
                  </p>
                </div>
                <ChevronRight size={16} style={{ color: 'rgba(255,255,255,0.25)' }} />
              </button>
            </div>

            <div style={{ paddingBottom: 'env(safe-area-inset-bottom, 16px)', minHeight: 16 }} />
          </div>
        </>
      )}

      <ToastContainer />
    </div>
  )
}
