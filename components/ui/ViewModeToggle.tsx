'use client'
import { useViewModeStore } from '@/lib/store/view-mode.store'
import { Sparkles, LayoutDashboard } from 'lucide-react'

interface ViewModeToggleProps {
  className?: string
}

/**
 * Pill toggle for Basic ↔ Pro mode.
 * Just updates the Zustand store — no routing. AppShell and
 * dashboard page react to the store change in-place.
 */
export function ViewModeToggle({ className = '' }: ViewModeToggleProps) {
  const { viewMode, setViewMode } = useViewModeStore()
  const isBasic = viewMode === 'simple'

  return (
    <div
      className={`flex items-center gap-0.5 p-0.5 rounded-xl ${className}`}
      style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.15)', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}
    >
      <button
        onClick={() => setViewMode('simple')}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all hover:brightness-110"
        style={{
          background: isBasic ? 'rgba(0,196,180,0.3)' : 'transparent',
          color: isBasic ? '#00C4B4' : 'rgba(255,255,255,0.5)',
        }}
      >
        <Sparkles size={11} strokeWidth={2.5} />
        Basic
      </button>
      <button
        onClick={() => setViewMode('full')}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all hover:brightness-110"
        style={{
          background: !isBasic ? 'rgba(255,255,255,0.2)' : 'transparent',
          color: !isBasic ? '#fff' : 'rgba(255,255,255,0.5)',
        }}
      >
        <LayoutDashboard size={11} strokeWidth={2.5} />
        Pro
      </button>
    </div>
  )
}
