'use client'
import { useState, useRef, useEffect } from 'react'
import { useBusinessStore } from '@/lib/store/business.store'
import type { Business } from '@/lib/types'
import { ChevronDown, Plus, Check, Building2 } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils/cn'

interface BusinessSwitcherProps {
  collapsed?: boolean
}

export function BusinessSwitcher({ collapsed = false }: BusinessSwitcherProps) {
  const { businesses, activeBusinessId, setActiveBusiness, getActiveBusiness } = useBusinessStore()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const active = getActiveBusiness()

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    if (open) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  if (!active) return null

  if (collapsed) {
    return (
      <button
        onClick={() => setOpen(o => !o)}
        title={active.name}
        className="relative w-9 h-9 rounded-xl flex items-center justify-center mx-auto transition-colors hover:bg-white/10"
        style={{ background: `${active.color}20`, border: `1px solid ${active.color}35` }}>
        <span className="text-xs font-black text-white">
          {active.name.slice(0, 2).toUpperCase()}
        </span>

        {/* Dropdown when collapsed */}
        {open && (
          <div
            ref={ref}
            className="absolute left-full top-0 ml-2 w-52 rounded-2xl z-[100] overflow-hidden shadow-2xl"
            style={{ background: 'var(--t-card-bg)', border: '1px solid var(--t-card-border)' }}>
            <DropdownContent
              businesses={businesses}
              activeBusinessId={activeBusinessId}
              active={active}
              onSelect={(id) => { setActiveBusiness(id); setOpen(false) }}
              onClose={() => setOpen(false)}
            />
          </div>
        )}
      </button>
    )
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-2.5 px-2 py-2 rounded-xl transition-colors hover:bg-white/10"
      >
        {/* Color dot */}
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-[10px] font-black text-white"
          style={{ background: `${active.color}25`, border: `1px solid ${active.color}40` }}>
          {active.name.slice(0, 2).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0 text-left">
          <p className="text-[12px] font-bold text-white truncate leading-tight">{active.name}</p>
          <p className="text-[10px] truncate leading-tight text-white/40">
            {active.type.replace(/_/g, ' ')}
          </p>
        </div>
        <ChevronDown
          size={13}
          className={cn('transition-transform duration-200 text-white/40', open && 'rotate-180')}
        />
      </button>

      {open && (
        <div
          className="absolute top-full left-0 right-0 mt-1 rounded-2xl z-[100] overflow-hidden shadow-2xl"
          style={{ background: 'var(--t-card-bg)', border: '1px solid var(--t-card-border)' }}>
          <DropdownContent
            businesses={businesses}
            activeBusinessId={activeBusinessId}
            active={active}
            onSelect={(id) => { setActiveBusiness(id); setOpen(false) }}
            onClose={() => setOpen(false)}
          />
        </div>
      )}
    </div>
  )
}

interface DropdownProps {
  businesses: Business[]
  activeBusinessId: string | null
  active: Business
  onSelect: (id: string) => void
  onClose: () => void
}

function DropdownContent({ businesses, activeBusinessId, active, onSelect, onClose }: DropdownProps) {
  return (
    <div className="py-1">
      <p className="text-[9px] font-bold uppercase tracking-widest px-3 pt-2 pb-1.5 text-muted opacity-50">
        Switch Business
      </p>
      {businesses.map(b => (
        <button
          key={b.id}
          onClick={() => onSelect(b.id)}
          className={cn(
            'w-full flex items-center gap-2.5 px-3 py-2.5 transition-colors hover:bg-surface/60',
            b.id === activeBusinessId && 'bg-surface'
          )}>
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black text-navy flex-shrink-0"
            style={{ background: `${b.color}25`, border: `1px solid ${b.color}40` }}>
            {b.name.slice(0, 2).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0 text-left">
            <p className="text-[12px] font-semibold text-navy truncate">{b.name}</p>
            <p className="text-[10px] truncate text-muted" style={{ opacity: 0.6 }}>
              {b.type.replace(/_/g, ' ')}
            </p>
          </div>
          {b.id === activeBusinessId && (
            <Check size={13} style={{ color: 'var(--t-accent)', flexShrink: 0 }} strokeWidth={2.5} />
          )}
        </button>
      ))}
      <div style={{ borderTop: '1px solid var(--t-card-border)' }} className="mt-1 pt-1">
        <Link
          href="/businesses"
          onClick={onClose}
          className="flex items-center gap-2.5 px-3 py-2.5 transition-colors hover:bg-surface/60">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(0,196,180,0.12)', border: '1px solid rgba(0,196,180,0.25)' }}>
            <Plus size={13} style={{ color: 'var(--t-accent)' }} />
          </div>
          <span className="text-[12px] font-semibold text-navy">Add Business</span>
        </Link>
        <Link
          href="/businesses"
          onClick={onClose}
          className="flex items-center gap-2.5 px-3 py-2.5 transition-colors hover:bg-surface/60">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 bg-surface border border-border">
            <Building2 size={13} className="text-muted" />
          </div>
          <span className="text-[12px] font-semibold text-muted">Manage All</span>
        </Link>
      </div>
    </div>
  )
}
