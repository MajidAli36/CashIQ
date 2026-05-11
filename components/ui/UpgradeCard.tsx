'use client'
import { Sparkles, ArrowRight, Crown, Zap, Users, Package } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils/cn'

interface UpgradeCardProps {
  currentPlan: string
}

const PLAN_FEATURES = [
  { icon: Zap, label: 'Unlimited Transactions', plans: ['growth', 'business', 'pro'] },
  { icon: Users, label: 'Customers', plans: ['business', 'pro'] },
  { icon: Package, label: 'Inventory', plans: ['pro'] },
  { icon: Crown, label: 'Priority Support', plans: ['business', 'pro'] },
]

export function UpgradeCard({ currentPlan }: UpgradeCardProps) {
  return (
    <div className="rounded-xl overflow-hidden" style={{ background: 'linear-gradient(135deg, #0B0F1A 0%, #1a2332 100%)' }}>
      <div className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #00C4B4 0%, #06B6D4 100%)' }}>
            <Sparkles size={16} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-white">Upgrade to unlock more</p>
            <p className="text-[10px] text-white/50">Higher limits, more features</p>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          {PLAN_FEATURES.map((feature, i) => {
            const isUnlocked = feature.plans.includes(currentPlan)
            return (
              <div key={i} className={cn(
                'flex items-center gap-2 text-xs',
                isUnlocked ? 'text-teal' : 'text-white/40'
              )}>
                <feature.icon size={12} />
                <span>{feature.label}</span>
                {isUnlocked && (
                  <span className="ml-auto text-[10px]">✓</span>
                )}
              </div>
            )
          })}
        </div>

        <Link 
          href="/settings/plans"
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-bold text-navy transition-all hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, var(--t-accent, #00C4B4) 0%, #06B6D4 100%)' }}
        >
          Upgrade Plan
          <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  )
}
