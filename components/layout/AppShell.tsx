'use client'
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, Sparkles } from 'lucide-react'
import { Sidebar } from './Sidebar'
import { RightPanel } from './RightPanel'
import { BottomNav } from './BottomNav'
import { ToastContainer } from '@/components/ui/Toast'
import { useRTL } from '@/lib/hooks/useRTL'
import { useViewModeStore } from '@/lib/store/view-mode.store'
import { VoiceSheet } from '@/components/voice/VoiceSheet'
import { PremiumFAB } from '@/components/ui/PremiumFAB'
import { cn } from '@/lib/utils/cn'

const COLLAPSED_KEY = 'rozcash-sidebar-collapsed'

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  useRTL()

  const [collapsed, setCollapsed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false
    return localStorage.getItem(COLLAPSED_KEY) === 'true'
  })

  const [drawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => {
    localStorage.setItem(COLLAPSED_KEY, String(collapsed))
  }, [collapsed])

  // Close drawer on route change
  useEffect(() => {
    setDrawerOpen(false)
  }, [pathname])

  const { viewMode } = useViewModeStore()
  const isBasic = viewMode === 'simple'

  const isAddPage       = pathname === '/add' || pathname.startsWith('/add?')
  const isInventoryPage = pathname.startsWith('/inventory')
  const hideRightPanel  = isBasic

  return (
    <div className="flex flex-col lg:flex-row lg:h-screen lg:overflow-hidden">

      {/* ────────────────────────────────────────────────────────────────────
          MOBILE DRAWER OVERLAY
      ──────────────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {!isBasic && drawerOpen && (
          <motion.div
            className="fixed inset-0 z-[60] lg:hidden"
            style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(3px)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={() => setDrawerOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* ────────────────────────────────────────────────────────────────────
          MOBILE DRAWER SIDEBAR  (slides from left, z-above overlay)
      ──────────────────────────────────────────────────────────────────── */}
      {!isBasic && (
        <motion.div
          className="fixed inset-y-0 left-0 z-[61] lg:hidden flex flex-col w-[280px] max-w-[85vw]"
          style={{
            background:  'var(--t-hero-from, #0B0F1A)',
            boxShadow:   '8px 0 40px rgba(0,0,0,0.35)',
          }}
          initial={false}
          animate={{ x: drawerOpen ? 0 : '-100%' }}
          transition={{ type: 'spring', stiffness: 360, damping: 36 }}
        >
          <Sidebar collapsed={false} onToggle={() => setDrawerOpen(false)} />
        </motion.div>
      )}

      {/* ────────────────────────────────────────────────────────────────────
          DESKTOP SIDEBAR
          • md (768-1023px): icon-only strip  w-16
          • lg+ (1024px+):   collapsible      w-16 ↔ w-[240px]
      ──────────────────────────────────────────────────────────────────── */}
      {!isBasic && (
        <>
          {/* Tablet: icon-only */}
          <div
            className="hidden md:flex lg:hidden flex-col flex-shrink-0 w-16"
            style={{ background: 'var(--t-hero-from, #0B0F1A)' }}>
            <Sidebar collapsed={true} onToggle={() => {}} />
          </div>

          {/* Desktop: collapsible */}
          <div
            className={cn(
              'hidden lg:flex flex-col flex-shrink-0 transition-[width] duration-300 ease-in-out',
              collapsed ? 'w-16' : 'w-[240px]'
            )}
            style={{ background: 'var(--t-hero-from, #0B0F1A)' }}>
            <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(c => !c)} />
          </div>
        </>
      )}

      {/* ────────────────────────────────────────────────────────────────────
          MAIN CONTENT COLUMN  (fills remaining space)
      ──────────────────────────────────────────────────────────────────── */}
      <main
        className="flex-1 min-w-0 flex flex-col overflow-y-auto overflow-x-hidden main-scroll"
        style={{ background: 'var(--t-page-bg, #F1F5F9)' }}
      >

        {/* ── Mobile top-bar with hamburger (full mode only) ── */}
        {!isBasic && (
          <div
            className="flex-shrink-0 flex items-center gap-3 h-[52px] px-4 md:hidden sticky top-0 z-30"
            style={{
              background:   'var(--t-hero-from, #0B0F1A)',
              borderBottom: '1px solid rgba(255,255,255,0.09)',
            }}
          >
            <button
              onClick={() => setDrawerOpen(true)}
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all active:scale-90 hover:bg-white/10"
              style={{ border: '1px solid rgba(255,255,255,0.14)' }}
              aria-label="Open menu"
            >
              <Menu size={18} style={{ color: 'rgba(255,255,255,0.80)' }} />
            </button>

            <div className="flex items-center gap-2">
              <div
                className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(255,255,255,0.12)' }}>
                <Sparkles size={13} style={{ color: 'var(--t-accent, #00C4B4)' }} />
              </div>
              <span className="text-white font-black text-[15px] tracking-tight">CashIQ</span>
            </div>
          </div>
        )}

        {/* ── Page content ── */}
        <div className="flex-1 min-w-0 min-h-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ── Right panel stacked below content on mobile / tablet ── */}
        {!hideRightPanel && (
          <div
            className="flex-shrink-0 lg:hidden"
            style={{ borderTop: '1px solid var(--t-card-border, #D1D5DB)' }}
          >
            {/* pb-[88px] = clear the fixed bottom nav */}
            <div className="pb-[88px] md:pb-4">
              <RightPanel isInventoryPage={isInventoryPage} stacked />
            </div>
          </div>
        )}
      </main>

      {/* ────────────────────────────────────────────────────────────────────
          RIGHT OVERVIEW PANEL  — desktop side column (lg+)
      ──────────────────────────────────────────────────────────────────── */}
      {!hideRightPanel && (
        <div
          className="hidden lg:flex flex-col flex-shrink-0 overflow-hidden"
          style={{
            width:       'clamp(260px, 22vw, 320px)',
            background:  'var(--t-card-bg, #FFFFFF)',
            borderLeft:  '1px solid var(--t-card-border, #D1D5DB)',
          }}>
          <RightPanel isInventoryPage={isInventoryPage} />
        </div>
      )}

      {/* ── Bottom nav (mobile only) ── */}
      {!isAddPage && <BottomNav />}

      {/* ── Premium FAB ── */}
      <PremiumFAB />

      {/* ── Voice Sheet ── */}
      <VoiceSheet />

      <ToastContainer />
    </div>
  )
}
