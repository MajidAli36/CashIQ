'use client'
import { cn } from '@/lib/utils/cn'
import type { LucideIcon } from 'lucide-react'

interface Tab<T extends string> {
  id: T
  label: string
  Icon?: LucideIcon
}

interface PageTabsProps<T extends string> {
  tabs: Tab<T>[]
  active: T
  onChange: (id: T) => void
}

export function PageTabs<T extends string>({ tabs, active, onChange }: PageTabsProps<T>) {
  return (
    <div className="flex gap-1 overflow-x-auto pb-1 mt-1" style={{ scrollbarWidth: 'none' }}>
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            'flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap',
            'transition-all duration-200 flex-shrink-0 active:scale-95',
            active === tab.id ? 'text-[#0B0F1A] shadow-sm' : 'text-white/60 hover:text-white',
          )}
          style={
            active === tab.id
              ? { background: 'var(--t-accent)' }
              : { background: 'rgba(255,255,255,0.06)' }
          }
        >
          {tab.Icon && <tab.Icon size={13} />}
          {tab.label}
        </button>
      ))}
    </div>
  )
}
