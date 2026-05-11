'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home, Plus, PieChart, MoreHorizontal,
  Users, BookOpen, FileCheck,
  Package, Building2, Settings, ChevronRight, X,
  Sparkles,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useViewModeStore } from '@/lib/store/view-mode.store'
import { useTranslation } from '@/lib/hooks/useTranslation'

export function BottomNav() {
  const pathname = usePathname()
  const [moreOpen, setMoreOpen] = useState(false)
  const { setViewMode } = useViewModeStore()
  const { t } = useTranslation()

  const PRIMARY_ITEMS = [
    { href: '/dashboard', icon: Home,     label: t('nav.home')        },
    { href: '/add',       icon: Plus,     label: '',        isFAB: true },
    { href: '/reports',   icon: PieChart, label: t('reports.reports') },
  ]

  const MORE_ITEMS = [
    { href: '/checks',     icon: FileCheck,  label: t('nav.checks'),                desc: t('nav.simplifiedView') },
    { href: '/loan',       icon: BookOpen,   label: t('loans.loans'),               desc: t('loans.noLoans') },
    { href: '/customers',  icon: Users,      label: t('customers.customers'),        desc: t('customers.searchNameOrPhone') },
    { href: '/inventory',  icon: Package,    label: t('nav.inventory'),             desc: t('dashboard.inventoryStock') },
    { href: '/businesses', icon: Building2,  label: t('businesses.businesses'),     desc: t('businesses.selectBusiness') },
    { href: '/settings',   icon: Settings,   label: t('settings.settings'),         desc: t('settings.shopProfile') },
  ]

  const isMoreActive = MORE_ITEMS.some(item => pathname.startsWith(item.href))

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 w-full z-50 md:hidden">
        <div className="absolute inset-0 bottom-nav-backdrop" />
        <div className="relative flex items-center justify-around h-[68px] px-2">

          {PRIMARY_ITEMS.map(item => {
            const Icon = item.icon
            const isActive = pathname.startsWith(item.href)

            if (item.isFAB) {
              return (
                <Link key={item.href} href={item.href} className="flex flex-col items-center -mt-8 relative z-10">
                  <motion.div
                    className="w-[56px] h-[56px] rounded-[18px] flex items-center justify-center"
                    style={{
                      backgroundColor: 'var(--t-accent, #00C4B4)',
                      boxShadow: '0 4px 20px rgba(0,196,180,0.5), 0 2px 8px rgba(0,0,0,0.2)',
                    }}
                    whileTap={{ scale: 0.91 }}
                    whileHover={{ scale: 1.06 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  >
                    <Plus size={26} className="text-white" strokeWidth={3} />
                  </motion.div>
                </Link>
              )
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center gap-0.5 px-3 py-1.5 min-w-[52px] min-h-[48px] justify-center"
              >
                <div className="relative flex items-center justify-center w-10 h-8">
                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        layoutId="nav-pill"
                        className="absolute inset-0 rounded-xl"
                        style={{ background: 'rgba(0,196,180,0.12)' }}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                      />
                    )}
                  </AnimatePresence>
                  <motion.div whileTap={{ scale: 0.85 }} transition={{ type: 'spring', stiffness: 500, damping: 25 }}>
                    <Icon
                      size={20}
                      strokeWidth={isActive ? 2.5 : 2}
                      style={{ color: isActive ? 'var(--t-accent, #00C4B4)' : 'rgba(255,255,255,0.65)' }}
                    />
                  </motion.div>
                </div>
                <span
                  className="text-[10px] font-semibold tracking-tight transition-colors"
                  style={{ color: isActive ? 'var(--t-accent, #00C4B4)' : 'rgba(255,255,255,0.65)' }}
                >
                  {item.label}
                </span>
              </Link>
            )
          })}

          {/* More tab */}
          <button
            onClick={() => setMoreOpen(true)}
            className="flex flex-col items-center gap-0.5 px-3 py-1.5 min-w-[52px] min-h-[48px] justify-center"
          >
            <div className="relative flex items-center justify-center w-10 h-8">
              <AnimatePresence>
                {isMoreActive && (
                  <motion.div
                    layoutId="nav-pill"
                    className="absolute inset-0 rounded-xl"
                    style={{ background: 'rgba(0,196,180,0.12)' }}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                  />
                )}
              </AnimatePresence>
              <motion.div whileTap={{ scale: 0.85 }} transition={{ type: 'spring', stiffness: 500, damping: 25 }}>
                <MoreHorizontal
                  size={20}
                  strokeWidth={isMoreActive ? 2.5 : 2}
                  style={{ color: isMoreActive ? 'var(--t-accent, #00C4B4)' : 'rgba(255,255,255,0.65)' }}
                />
              </motion.div>
            </div>
            <span
              className="text-[10px] font-semibold tracking-tight"
              style={{ color: isMoreActive ? 'var(--t-accent, #00C4B4)' : 'rgba(255,255,255,0.65)' }}
            >
              {t('nav.more')}
            </span>
          </button>

        </div>
        <div className="h-safe-area-inset-bottom" style={{ background: 'var(--t-nav-bg)' }} />
      </nav>

      {/* More bottom sheet */}
      <AnimatePresence>
        {moreOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-[60] md:hidden"
              style={{ background: 'rgba(0,0,0,0.52)', backdropFilter: 'blur(3px)' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMoreOpen(false)}
            />

            <motion.div
              className="fixed bottom-0 left-0 right-0 z-[61] md:hidden rounded-t-3xl overflow-hidden"
              style={{ background: 'var(--t-card-bg, #fff)', boxShadow: '0 -8px 40px rgba(0,0,0,0.15)' }}
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 380, damping: 36 }}
            >
              {/* Handle + header */}
              <div className="flex items-start justify-between px-5 pt-4 pb-3">
                <div>
                  <div className="w-10 h-1 rounded-full mb-3" style={{ background: 'var(--t-card-border, #E2E8F0)' }} />
                  <p className="text-[16px] font-black" style={{ color: 'var(--t-text, #0B0F1A)' }}>
                    {t('nav.allFeatures')}
                  </p>
                </div>
                <button
                  onClick={() => setMoreOpen(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center mt-1"
                  style={{ background: 'var(--t-page-bg, #F1F5F9)' }}
                >
                  <X size={15} style={{ color: 'var(--t-muted, #64748B)' }} />
                </button>
              </div>

              {/* Nav items */}
              <div className="px-4 pb-2" style={{ maxHeight: '65vh', overflowY: 'auto' }}>
                <div className="space-y-1">
                  {MORE_ITEMS.map(({ href, icon: Icon, label, desc }) => {
                    const active = pathname.startsWith(href)
                    return (
                      <Link
                        key={href}
                        href={href}
                        onClick={() => setMoreOpen(false)}
                        className="flex items-center gap-3 px-3 py-3 rounded-2xl transition-colors"
                        style={{
                          background: active ? 'rgba(0,196,180,0.08)' : 'transparent',
                          border: `1px solid ${active ? 'rgba(0,196,180,0.20)' : 'var(--t-card-border, #F1F5F9)'}`,
                        }}
                      >
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ background: active ? 'rgba(0,196,180,0.15)' : 'var(--t-page-bg, #F8FAFC)' }}
                        >
                          <Icon
                            size={18}
                            strokeWidth={active ? 2.5 : 1.8}
                            style={{ color: active ? 'var(--t-accent, #00C4B4)' : 'var(--t-muted, #64748B)' }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p
                            className="text-[14px] font-bold"
                            style={{ color: active ? 'var(--t-accent, #00C4B4)' : 'var(--t-text, #0B0F1A)' }}
                          >
                            {label}
                          </p>
                        </div>
                        <ChevronRight size={15} style={{ color: 'var(--t-muted, #CBD5E1)', flexShrink: 0, opacity: 0.5 }} />
                      </Link>
                    )
                  })}
                </div>

                {/* Basic mode switch */}
                <button
                  onClick={() => { setMoreOpen(false); setViewMode('simple') }}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-2xl mt-2 transition-opacity active:opacity-80"
                  style={{ background: 'var(--t-hero-from, #0B0F1A)' }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(0,196,180,0.15)' }}
                  >
                    <Sparkles size={18} style={{ color: '#00C4B4' }} />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-[14px] font-bold text-white">{t('nav.switchToBasic')}</p>
                    <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.40)' }}>
                      {t('nav.simplifiedView')}
                    </p>
                  </div>
                  <ChevronRight size={15} style={{ color: 'rgba(255,255,255,0.25)', flexShrink: 0 }} />
                </button>
              </div>

              <div style={{ paddingBottom: 'env(safe-area-inset-bottom, 16px)', minHeight: 16 }} />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
