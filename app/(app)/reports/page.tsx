'use client'
import { useState, useMemo, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  format, subDays, startOfMonth, endOfMonth,
  subMonths, startOfYear, endOfYear,
} from 'date-fns'
import { useBusinessStore } from '@/lib/store/business.store'
import { PageHeader }       from '@/components/layout/PageHeader'
import { cn }               from '@/lib/utils/cn'
import { BarChart2, ArrowLeftRight, Package, Users, List } from 'lucide-react'
import { OverviewTab }     from '@/components/reports/OverviewTab'
import { MoneyFlowTab }    from '@/components/reports/MoneyFlowTab'
import { InventoryTab }    from '@/components/reports/InventoryTab'
import { EntitiesTab }     from '@/components/reports/EntitiesTab'
import { TransactionsTab } from '@/components/reports/TransactionsTab'
import type { DateRange, DateRangeOption, PrevRange } from '@/components/reports/types'

// ── Date helpers ─────────────────────────────────────────────────────────────

function buildRange(option: DateRangeOption, customFrom = '', customTo = ''): DateRange {
  const now   = new Date()
  const today = format(now, 'yyyy-MM-dd')
  switch (option) {
    case 'today':      return { from: today, to: today, label: 'Today', option }
    case 'yesterday':  { const y = format(subDays(now, 1), 'yyyy-MM-dd'); return { from: y, to: y, label: 'Yesterday', option } }
    case 'last7':      return { from: format(subDays(now, 6), 'yyyy-MM-dd'), to: today, label: 'Last 7 Days', option }
    case 'last30':     return { from: format(subDays(now, 29), 'yyyy-MM-dd'), to: today, label: 'Last 30 Days', option }
    case 'thisMonth':  return { from: format(startOfMonth(now), 'yyyy-MM-dd'), to: format(endOfMonth(now), 'yyyy-MM-dd'), label: 'This Month', option }
    case 'lastMonth':  { const lm = subMonths(now, 1); return { from: format(startOfMonth(lm), 'yyyy-MM-dd'), to: format(endOfMonth(lm), 'yyyy-MM-dd'), label: 'Last Month', option } }
    case 'thisYear':   return { from: format(startOfYear(now), 'yyyy-MM-dd'), to: format(endOfYear(now), 'yyyy-MM-dd'), label: 'This Year', option }
    case 'fiscalYear': {
      // Pakistan fiscal year: Jul 1 – Jun 30
      const yr  = now.getMonth() >= 6 ? now.getFullYear() : now.getFullYear() - 1
      return { from: `${yr}-07-01`, to: `${yr + 1}-06-30`, label: 'Fiscal Year', option }
    }
    case 'custom':     return { from: customFrom || today, to: customTo || today, label: 'Custom Range', option }
    default:           return { from: today, to: today, label: 'Today', option: 'today' }
  }
}

function buildPrevRange(option: DateRangeOption, range: DateRange): PrevRange {
  const now = new Date()
  switch (option) {
    case 'today':     { const y = format(subDays(now, 1), 'yyyy-MM-dd'); return { from: y, to: y } }
    case 'yesterday': { const d = format(subDays(now, 2), 'yyyy-MM-dd'); return { from: d, to: d } }
    case 'last7':     return { from: format(subDays(now, 13), 'yyyy-MM-dd'), to: format(subDays(now, 7), 'yyyy-MM-dd') }
    case 'last30':    return { from: format(subDays(now, 59), 'yyyy-MM-dd'), to: format(subDays(now, 30), 'yyyy-MM-dd') }
    case 'thisMonth': { const lm = subMonths(now, 1); return { from: format(startOfMonth(lm), 'yyyy-MM-dd'), to: format(endOfMonth(lm), 'yyyy-MM-dd') } }
    case 'lastMonth': { const lm2 = subMonths(now, 2); return { from: format(startOfMonth(lm2), 'yyyy-MM-dd'), to: format(endOfMonth(lm2), 'yyyy-MM-dd') } }
    default:          return { from: range.from, to: range.to }
  }
}

// ── Tab config ───────────────────────────────────────────────────────────────

const TABS = [
  { id: 'overview',     label: 'Overview',     Icon: BarChart2      },
  { id: 'flow',         label: 'Money Flow',   Icon: ArrowLeftRight },
  { id: 'inventory',    label: 'Inventory',    Icon: Package        },
  { id: 'entities',     label: 'Entities',     Icon: Users          },
  { id: 'transactions', label: 'Transactions', Icon: List           },
] as const

type TabId = typeof TABS[number]['id']

// ── Inner page (uses searchParams) ──────────────────────────────────────────

function ReportsInner() {
  const router      = useRouter()
  const pathname    = usePathname()
  const searchParams = useSearchParams()
  const { activeBusinessId } = useBusinessStore()
  const bid = activeBusinessId ?? undefined

  const initTab = (searchParams.get('tab') as TabId) ?? 'overview'

  const [activeTab, setActiveTab] = useState<TabId>(initTab)

  const range     = useMemo(() => buildRange('thisMonth'), [])
  const prevRange = useMemo(() => buildPrevRange('thisMonth', range), [range])

  // Sync active tab to URL
  useEffect(() => {
    const params = new URLSearchParams()
    params.set('tab', activeTab)
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }, [activeTab, pathname, router])

  return (
    <div className="min-h-screen pb-[88px]" style={{ background: 'var(--t-page-bg)' }}>

      {/* ── Hero Header ── */}
      <div className="relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, var(--t-hero-from) 0%, var(--t-hero-mid) 55%, var(--t-hero-to) 100%)' }}>
        {/* Ambient orbs */}
        <div className="absolute -top-20 right-0 w-72 h-72 rounded-full blur-[90px] pointer-events-none"
          style={{ background: 'rgba(0,248,180,0.18)' }} />
        <div className="absolute bottom-0 left-0 w-52 h-52 rounded-full blur-[60px] pointer-events-none"
          style={{ background: 'rgba(0,196,255,0.10)' }} />

        <div className="relative z-10 px-4 pt-2 pb-4">
          <PageHeader title="Reports" titleUr="رپورٹس" backTo="/dashboard" transparent />

          {/* Tab bar */}
          <div className="flex gap-1 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
            {TABS.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 flex-shrink-0 active:scale-95',
                  activeTab === tab.id ? 'text-[#0B0F1A] shadow-sm' : 'text-white/60 hover:text-white'
                )}
                style={activeTab === tab.id
                  ? { background: 'var(--t-accent)' }
                  : { background: 'rgba(255,255,255,0.06)' }}>
                <tab.Icon size={13} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Tab Content ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.18 }}>
          {activeTab === 'overview'     && <OverviewTab     range={range} prevRange={prevRange} bid={bid} />}
          {activeTab === 'flow'         && <MoneyFlowTab    range={range} bid={bid} />}
          {activeTab === 'inventory'    && <InventoryTab    bid={bid} />}
          {activeTab === 'entities'     && <EntitiesTab     range={range} bid={bid} />}
          {activeTab === 'transactions' && <TransactionsTab range={range} bid={bid} />}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

// ── Page export wraps inner in Suspense (required for useSearchParams) ───────

export default function ReportsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--t-page-bg)' }}>
        <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: 'var(--t-accent)', borderTopColor: 'transparent' }} />
      </div>
    }>
      <ReportsInner />
    </Suspense>
  )
}
