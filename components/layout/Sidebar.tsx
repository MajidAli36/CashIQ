'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect, useCallback } from 'react'
import {
  Home, PieChart, Settings, Plus, Sparkles,
  ChevronLeft, ChevronRight, Package, Lock,
} from 'lucide-react'
import { useSettingsStore } from '@/lib/store/settings.store'
import { useBusinessStore } from '@/lib/store/business.store'
import { useSubscriptionStore } from '@/lib/store/subscription.store'
import { useViewModeStore } from '@/lib/store/view-mode.store'
import { useTranslation } from '@/lib/hooks/useTranslation'
import { BusinessSwitcher } from '@/components/ui/BusinessSwitcher'
import { cn } from '@/lib/utils/cn'

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname()
  const { shop }  = useSettingsStore()
  const { businesses } = useBusinessStore()
  const { isFeatureEnabled, subscription } = useSubscriptionStore()
  const { setViewMode } = useViewModeStore()
  const { t } = useTranslation()

  const NAV_ITEMS = [
    { href: '/dashboard', icon: Home,     label: t('nav.home'),            exact: true,  proOnly: false },
    { href: '/reports',   icon: PieChart, label: t('reports.reports'),     exact: false, proOnly: false },
    { href: '/inventory', icon: Package,  label: t('nav.inventory'),       exact: false, proOnly: true  },
    { href: '/settings',  icon: Settings, label: t('settings.settings'),   exact: false, proOnly: false },
  ]

  const hasInventory = isFeatureEnabled('inventory') && subscription.status === 'active'

  // Pulse animation state - pauses after click, resumes after 10s idle
  const [isPulsing, setIsPulsing] = useState(true)
  const [lastInteraction, setLastInteraction] = useState(Date.now())

  const handlePulseClick = useCallback(() => {
    setIsPulsing(false)
    setLastInteraction(Date.now())
  }, [])

  useEffect(() => {
    if (!isPulsing) {
      const timer = setTimeout(() => setIsPulsing(true), 10000)
      return () => clearTimeout(timer)
    }
  }, [isPulsing, lastInteraction])

  return (
    <div className="flex flex-col h-full sidebar-scroll overflow-y-auto overflow-x-hidden select-none" style={{ color: 'white' }}>

      {/* ── LOGO ROW ── */}
      <div
        className="flex items-center gap-3 flex-shrink-0 px-3 h-[60px]"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.12)' }}>
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.20)' }}>
          <Sparkles size={17} style={{ color: 'var(--t-accent, #00C4B4)' }} />
        </div>

        {!collapsed && (
          <div className="flex-1 min-w-0">
            <p className="text-white font-black text-[14px] tracking-tight truncate leading-tight">CashIQ</p>
            {shop.name && (
              <p className="text-[11px] truncate leading-tight mt-0.5 opacity-40">
                {shop.name}
              </p>
            )}
          </div>
        )}

        {!collapsed && (
          <button
            onClick={onToggle}
            title="Collapse sidebar"
            className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors hover:bg-white/10">
            <ChevronLeft size={14} className="opacity-40" />
          </button>
        )}
      </div>

      {collapsed && (
        <div
          className="flex justify-center py-2.5 flex-shrink-0"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.12)' }}>
          <button
            onClick={onToggle}
            title="Expand sidebar"
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors hover:bg-white/10">
            <ChevronRight size={14} className="opacity-40" />
          </button>
        </div>
      )}

      {/* ── BUSINESS SWITCHER ── */}
      {businesses.length > 0 && (
        <div className={cn('flex-shrink-0 px-2 pt-3 pb-2', collapsed && 'flex justify-center')}>
          <BusinessSwitcher collapsed={collapsed} />
        </div>
      )}

      {/* ── ADD TRANSACTION BUTTON ── */}
      <div className={cn('flex-shrink-0 px-2.5 pt-1 pb-1', collapsed && 'flex justify-center')}>
        <Link
          href="/add"
          onClick={handlePulseClick}
          className={cn(
            'flex items-center justify-center gap-2 rounded-2xl transition-all duration-200 active:scale-95 hover:scale-105',
            collapsed ? 'w-10 h-10' : 'w-full h-10',
            // Pulse animation - smooth scale + glow
            isPulsing && 'animate-pulse-soft',
          )}
          style={{
            background: 'linear-gradient(135deg, var(--t-accent, #00C4B4) 0%, #06B6D4 100%)',
            boxShadow: '0 4px 16px rgba(0,196,180,0.28)',
          }}>
          <Plus size={collapsed ? 19 : 16} className="text-white flex-shrink-0" strokeWidth={2.5} />
          {!collapsed && (
            <span className="text-[12px] font-bold text-white tracking-wide">{t('transactions.addTransaction')}</span>
          )}
        </Link>
      </div>

      {/* ── NAVIGATION ── */}
      <nav className="flex-1 px-2 py-2 space-y-0.5 overflow-y-auto sidebar-scroll">
        {NAV_ITEMS.map(item => {
          const Icon     = item.icon
          const isActive = item.exact
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(item.href + '/')
          
          const isLocked = item.proOnly && !hasInventory
          const targetHref = isLocked ? '/settings/plans' : item.href

          return (
            <Link
              key={item.href}
              href={targetHref}
              title={collapsed ? (isLocked ? `${item.label} (Pro)` : item.label) : undefined}
              className={cn(
                'flex items-center gap-3 rounded-xl transition-all duration-200',
                collapsed ? 'justify-center h-10 w-10 mx-auto' : 'h-10 px-3',
                isActive ? 'bg-white/12' : 'hover:bg-white/7',
                isLocked && 'opacity-60',
              )}>
              <Icon
                size={17}
                strokeWidth={isActive ? 2.5 : 1.8}
                style={{
                  color: isActive ? 'var(--t-accent, #00C4B4)' : 'rgba(255,255,255,0.60)',
                  flexShrink: 0,
                }}
              />
              {!collapsed && (
                <span
                  className={cn(
                    'text-[13px] font-semibold flex-1 truncate',
                    isActive ? 'text-white' : 'text-white/60',
                  )}>
                  {item.label}
                </span>
              )}
              {isLocked && !collapsed && (
                <Lock size={12} className="text-white/40 flex-shrink-0" />
              )}
              {isActive && !collapsed && !isLocked && (
                <div
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: 'var(--t-accent, #00C4B4)' }}
                />
              )}
            </Link>
          )
        })}
      </nav>

      {/* ── FOOTER ── */}
      {!collapsed && (
        <div
          className="flex-shrink-0 px-3 py-3 space-y-2"
          style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <button
            onClick={() => setViewMode('simple')}
            className="flex items-center justify-center gap-1.5 w-full py-1.5 rounded-lg text-[11px] font-semibold transition-colors hover:bg-white/10"
            style={{ color: 'rgba(0,196,180,0.8)' }}>
            <Sparkles size={11} />
            {t('nav.switchToBasic')}
          </button>
          <p className="text-[10px] text-center" style={{ color: 'rgba(255,255,255,0.18)' }}>
            {t('settings.appVersion')}
          </p>
        </div>
      )}
    </div>
  )
}
