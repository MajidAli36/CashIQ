'use client'
import { AlertTriangle, Zap, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils/cn'

interface GraceBannerProps {
  graceRemaining: number
  maxGrace: number
}

export function GraceBanner({ graceRemaining, maxGrace }: GraceBannerProps) {
  return (
    <div className="rounded-xl p-4 border bg-amber-500/10 border-amber-500/30">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center flex-shrink-0">
          <AlertTriangle size={20} className="text-amber-400" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-bold text-amber-400 mb-1">You've reached your monthly limit</h3>
          <p className="text-xs text-white/60 mb-3">
            Don't worry! You can use <span className="text-amber-400 font-bold">{graceRemaining}</span> extra transactions today via grace mode.
          </p>
          
          <div className="flex items-center gap-2 mb-3">
            <Zap size={12} className="text-amber-400" />
            <span className="text-[10px] text-white/50">Grace used: {maxGrace - graceRemaining} / {maxGrace} today</span>
          </div>

          <div className="flex gap-2">
            <button className="flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg text-xs font-bold bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 transition-colors">
              <Zap size={12} />
              Use extra entries
            </button>
            <Link 
              href="/settings/plans"
              className="flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg text-xs font-bold bg-teal text-navy hover:opacity-90 transition-opacity"
            >
              Upgrade Now
              <ArrowRight size={12} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
