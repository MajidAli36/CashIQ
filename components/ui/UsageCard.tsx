'use client'
import { cn } from '@/lib/utils/cn'
import { Zap, FileText, AlertTriangle, Check } from 'lucide-react'

interface UsageCardProps {
  icon: 'transactions' | 'voice'
  label: string
  used: number
  limit: number
  isUnlimited?: boolean
  isWarning?: boolean
  isGraceMode?: boolean
  graceRemaining?: number
}

export function UsageCard({ 
  icon, 
  label, 
  used, 
  limit, 
  isUnlimited = false,
  isWarning = false,
  isGraceMode = false,
  graceRemaining = 0,
}: UsageCardProps) {
  const percentage = isUnlimited ? 0 : Math.min((used / limit) * 100, 100)
  const isDanger = percentage >= 100

  return (
    <div className={cn(
      'rounded-xl p-4 border transition-all',
      isGraceMode 
        ? 'bg-amber-500/10 border-amber-500/30' 
        : isDanger 
          ? 'bg-red-500/10 border-red-500/30'
          : isWarning 
            ? 'bg-orange-500/10 border-orange-500/30'
            : 'bg-surface border-border'
    )}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={cn(
            'w-8 h-8 rounded-lg flex items-center justify-center',
            isGraceMode ? 'bg-amber-500/20' : isDanger ? 'bg-red-500/20' : isWarning ? 'bg-orange-500/20' : 'bg-teal/20'
          )}>
            {icon === 'transactions' ? (
              <FileText size={16} className={isGraceMode ? 'text-amber-500' : isDanger ? 'text-red-500' : isWarning ? 'text-orange-500' : 'text-teal'} />
            ) : (
              <Zap size={16} className={isGraceMode ? 'text-amber-500' : isDanger ? 'text-red-500' : isWarning ? 'text-orange-500' : 'text-teal'} />
            )}
          </div>
          <span className="text-xs font-semibold text-navy uppercase tracking-wide">{label}</span>
        </div>
        {isGraceMode && (
          <span className="text-[10px] font-bold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">GRACE</span>
        )}
      </div>

      <div className="mb-2">
        <span className={cn(
          'text-xl font-black',
          isGraceMode ? 'text-amber-600' : isDanger ? 'text-red-500' : isWarning ? 'text-orange-500' : 'text-navy'
        )}>
          {isUnlimited ? '∞' : used}
          <span className="text-muted text-sm font-medium"> / {isUnlimited ? '∞' : limit}</span>
        </span>
        {!isUnlimited && (
          <span className="text-xs text-muted ml-1">used</span>
        )}
      </div>

      {!isUnlimited && (
        <div className="h-1.5 rounded-full bg-border overflow-hidden">
          <div 
            className={cn(
              'h-full rounded-full transition-all duration-500',
              isGraceMode ? 'bg-gradient-to-r from-amber-500 to-orange-500' : 
              isDanger ? 'bg-red-500' : isWarning ? 'bg-orange-500' : 'bg-teal'
            )}
            style={{ width: `${percentage}%` }}
          />
        </div>
      )}

      {isGraceMode && graceRemaining !== undefined && (
        <p className="text-[10px] text-amber-600 mt-2">
          Grace remaining: {graceRemaining} / 5 today
        </p>
      )}

      {isWarning && !isDanger && !isGraceMode && (
        <div className="flex items-center gap-1 mt-2 text-[10px] text-orange-500">
          <AlertTriangle size={10} />
          <span>Approaching limit</span>
        </div>
      )}
    </div>
  )
}
