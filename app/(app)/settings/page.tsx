'use client'
import { useSettingsStore } from '@/lib/store/settings.store'
import { useSubscriptionStore } from '@/lib/store/subscription.store'
import { useTranslation } from '@/lib/hooks/useTranslation'
import { PlanBadge } from '@/components/ui/PlanBadge'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Toggle } from '@/components/ui/Toggle'
import { GradientPageHeader } from '@/components/layout/GradientPageHeader'
import { formatDate, todayISO } from '@/lib/utils/date'
import { useTransactionStore } from '@/lib/store/transaction.store'
import { ChevronRight, Copy, Gift, Users, Check, Zap, Crown, Sparkles, AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import { showToast } from '@/components/ui/Toast'
import { useReferralStore, REFERRAL_REWARDS } from '@/lib/store/referral.store'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils/cn'
import { UsageCard } from '@/components/ui/UsageCard'
import { GraceBanner } from '@/components/ui/GraceBanner'
import { UpgradeCard } from '@/components/ui/UpgradeCard'

export default function SettingsPage() {
  const { t } = useTranslation()
  const { shop, updateShop } = useSettingsStore()
  const { subscription } = useSubscriptionStore()
  const monthlyCount = useTransactionStore(s => s.getMonthlyCount())

  const sections = [
    { href: '/businesses', icon: '🏢', title: 'settings.myBusinesses', subtitle: 'settings.addSwitch' },
    { href: '/settings/business', icon: '🏪', title: 'settings.businessType', subtitle: shop.business_type.replace(/_/g, ' ') },
    { href: '/customers', icon: '🤝', title: 'customers.customers', subtitle: 'settings.manageCustomers' },
    { href: '/settings/wallets', icon: '👛', title: 'wallets.wallets', subtitle: 'settings.manageWallets' },
    { href: '/settings/theme', icon: '🎨', title: 'settings.appearance', subtitle: 'settings.colorsTheme' },
    { href: '/settings/plans', icon: '⭐', title: 'settings.subscription', subtitle: `${subscription.plan_id} plan` },
    { href: '/settings/team', icon: '👥', title: 'settings.team', subtitle: 'settings.manageStaff' },
    { href: '/settings/categories', icon: '🏷️', title: 'categories.manageCategories', subtitle: 'settings.incomeExpense' },
    { href: '/settings/language', icon: '🌐', title: 'settings.language', subtitle: shop.language === 'en' ? 'English' : 'اردو' },
  ]

  return (
    <div className="min-h-screen bg-surface pb-20">
      <GradientPageHeader title={t('settings.settings')} backTo="/dashboard" />

      <div className="px-4 pt-4 space-y-4">
        {/* Shop Profile */}
        <div className="bg-white rounded-2xl p-4 border border-border">
          <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-3">{t('settings.shopProfile')}</p>
          {[
            { key: 'name', label: 'settings.shopName' },
            { key: 'owner_name', label: 'settings.ownerName' },
            { key: 'phone', label: 'customers.phone' },
            { key: 'city', label: 'settings.shopCity' },
          ].map(({ key, label }) => (
            <div key={key} className="mb-3">
              <label className="text-xs text-muted">{t(label)}</label>
              <input
                value={(shop as any)[key] || ''}
                onChange={e => updateShop({ [key]: e.target.value } as any)}
                className="mt-1 w-full h-10 bg-surface border border-border rounded-xl px-3 text-sm focus:outline-none focus:border-navy"
              />
            </div>
          ))}
        </div>

        {/* Plan Usage - New System */}
        <UsageSection />

        {/* Refer & Earn */}
        <ReferAndEarn />

        {/* Navigation sections */}
        <div className="bg-white rounded-2xl border border-border overflow-hidden">
          {sections.map((s, i) => (
            <Link key={s.href} href={s.href}
              className={`flex items-center gap-3 px-4 py-3.5 card-tap ${i > 0 ? 'border-t border-border' : ''}`}>
              <span className="text-xl">{s.icon}</span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-navy">{t(s.title)}</p>
                <p className="text-xs text-muted">{t(s.subtitle)}</p>
              </div>
              <ChevronRight size={16} className="text-muted" />
            </Link>
          ))}
        </div>

        {/* Security */}
        <div className="bg-white rounded-2xl p-4 border border-border">
          <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-3">{t('settings.security')}</p>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-navy">{t('settings.pinLock')}</p>
              <p className="text-xs text-muted">{t('settings.requirePin')}</p>
            </div>
            <Toggle
              checked={shop.pin_enabled}
              onChange={v => updateShop({ pin_enabled: v })}
            />
          </div>
        </div>

        {/* Data */}
        <div className="bg-white rounded-2xl p-4 border border-border">
          <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-3">{t('settings.data')}</p>
          <button onClick={() => {
            const data = localStorage.getItem('rozcash-transactions')
            if (!data) return
            const blob = new Blob([data], { type: 'application/json' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `cashiq-backup-${todayISO()}.json`
            a.click()
            showToast({ type: 'success', message: t('settings.dataExported') })
          }}
            className="w-full h-11 border border-border rounded-xl text-sm font-semibold text-navy mb-2">
            {t('settings.exportBackup')}
          </button>
        </div>

        <p className="text-center text-xs text-muted pb-4">{t('settings.appVersion')}</p>
      </div>
    </div>
  )
}

function ReferAndEarn() {
  const { t } = useTranslation()
  const { referralCode, referralLink, referralCount, claimedRewards, freeTransactions, generateReferralCode } = useReferralStore()
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!referralCode) generateReferralCode()
  }, [referralCode, generateReferralCode])

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink)
    setCopied(true)
    showToast({ type: 'success', message: 'Link copied!' })
    setTimeout(() => setCopied(false), 2000)
  }

  const { reached, next, progress } = useReferralStore.getState().getCurrentMilestone()
  const nextReward = useReferralStore.getState().getNextReward()
  const invitesNeeded = next - referralCount

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(135deg, #0B0F1A 0%, #1a2332 100%)' }}>
      {/* Header */}
      <div className="p-4 pb-3">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #00C4B4 0%, #06B6D4 100%)' }}>
            <Gift size={16} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-white">Refer & Earn</p>
            <p className="text-[10px] text-white/50">Invite friends, unlock rewards</p>
          </div>
        </div>

        {/* Progress */}
        <div className="mt-3">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              <Users size={12} className="text-teal" />
              <span className="text-xs font-semibold text-white">{referralCount} / {next} invites</span>
            </div>
            <span className="text-[10px] text-white/40">{Math.round(progress)}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #00C4B4 0%, #06B6D4 100%)' }} />
          </div>
        </div>

        {/* Next Goal */}
        {nextReward && (
          <p className="text-[10px] text-white/50 mt-2">
            Invite <span className="text-teal font-semibold">{invitesNeeded}</span> more to unlock <span className="text-white font-semibold">{nextReward.description}</span>
          </p>
        )}

        {/* Free Transactions Badge */}
        {freeTransactions > 0 && (
          <div className="mt-2 inline-flex items-center gap-1 px-2 py-1 rounded-lg" style={{ background: 'rgba(0,196,180,0.15)', border: '1px solid rgba(0,196,180,0.3)' }}>
            <Zap size={10} className="text-teal" />
            <span className="text-[10px] font-bold text-teal">{freeTransactions} free transactions</span>
          </div>
        )}
      </div>

      {/* Referral Link */}
      <div className="px-4 pb-4">
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/5 border border-white/10">
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-white/40 uppercase tracking-wider mb-0.5">Your Referral Code</p>
            <p className="text-sm font-bold text-white truncate">{referralCode || 'Generating...'}</p>
          </div>
          <button onClick={handleCopy}
            className={cn('flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all',
              copied ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/10 text-white hover:bg-white/20')}>
            {copied ? <Check size={12} /> : <Copy size={12} />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>

      {/* Reward Cards */}
      <div className="px-4 pb-4">
        <p className="text-[10px] text-white/60 uppercase tracking-wider mb-2">Rewards</p>
        <div className="grid grid-cols-5 gap-1.5">
          {REFERRAL_REWARDS.map((reward, index) => {
            const isUnlocked = referralCount >= reward.invites
            const isClaimed = claimedRewards.includes(index)
            const isNext = nextReward?.invites === reward.invites

            const getRewardText = () => {
              if (reward.rewardType === 'transactions') {
                return `Get ${reward.rewardValue} free`
              } else if (reward.rewardType === 'business_plan') {
                return `Unlock ${reward.rewardValue}d Plan`
              } else {
                return `Unlock ${reward.rewardValue}d Pro`
              }
            }

            return (
              <div key={reward.invites}
                className={cn('relative p-2 rounded-xl border text-center transition-all backdrop-blur-sm',
                  isUnlocked 
                    ? 'border-emerald-500/50 bg-emerald-500/10' 
                    : isNext 
                      ? 'border-white/20 bg-white/5' 
                      : 'border-white/10 bg-white/5')}
              >
                {isUnlocked && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center">
                    <Check size={8} className="text-white" strokeWidth={3} />
                  </div>
                )}
                <div className={cn('w-6 h-6 rounded-lg mx-auto mb-1 flex items-center justify-center',
                  isUnlocked ? 'bg-emerald-500/20' : 'bg-white/10')}>
                  {reward.rewardType === 'transactions' ? (
                    <Zap size={12} className={isUnlocked ? 'text-emerald-400' : 'text-white/60'} />
                  ) : reward.rewardType === 'business_plan' ? (
                    <Crown size={12} className={isUnlocked ? 'text-amber-400' : 'text-white/60'} />
                  ) : (
                    <Sparkles size={12} className={isUnlocked ? 'text-purple-400' : 'text-white/60'} />
                  )}
                </div>
                <p className={cn('text-[9px] font-semibold leading-tight', isUnlocked ? 'text-white' : 'text-white/50')}>
                  Invite {reward.invites}
                </p>
                <p className={cn('text-[8px] leading-tight', isUnlocked ? 'text-emerald-400' : 'text-white/70')}>
                  {getRewardText()}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function UsageSection() {
  const { subscription, usage, getTransactionLimitInfo, getVoiceLimitInfo, getPlan } = useSubscriptionStore()
  const monthlyCount = useTransactionStore(s => s.getMonthlyCount())
  
  // Ensure we have valid data with fallbacks
  const currentPlan = getPlan()
  const planId = subscription?.plan_id || 'starter'
  const txInfo = getTransactionLimitInfo(monthlyCount || 0)
  const voiceInfo = getVoiceLimitInfo(usage?.dailyVoiceUses || 0)
  
  const isWarning = !txInfo.isUnlimited && txInfo.limit > 0 && (txInfo.used / txInfo.limit) >= 0.8
  
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-navy">Usage</p>
          <PlanBadge plan={planId} />
        </div>
        {planId !== 'starter' && (
          <Link href="/settings/plans" className="text-xs text-navy font-semibold">Upgrade ›</Link>
        )}
      </div>

      {/* Warning Banner */}
      {isWarning && !txInfo.isGraceMode && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-orange-500/10 border border-orange-500/30">
          <AlertTriangle size={16} className="text-orange-400 flex-shrink-0" />
          <p className="text-xs text-orange-400">
            You're close to your limit. <Link href="/settings/plans" className="underline font-semibold">Upgrade</Link> to avoid interruption.
          </p>
        </div>
      )}

      {/* Grace Banner - Starter only */}
      {txInfo.isGraceMode && (
        <GraceBanner graceRemaining={txInfo.graceRemaining} maxGrace={5} />
      )}

      {/* Usage Cards */}
      <div className="grid grid-cols-2 gap-3">
        <UsageCard 
          icon="transactions"
          label="Transactions"
          used={txInfo.used || 0}
          limit={txInfo.limit || 300}
          isUnlimited={txInfo.isUnlimited || false}
          isWarning={isWarning}
          isGraceMode={txInfo.isGraceMode || false}
          graceRemaining={txInfo.graceRemaining || 5}
        />
        <UsageCard 
          icon="voice"
          label="Voice"
          used={voiceInfo.used || 0}
          limit={voiceInfo.limit || (currentPlan?.voice_limit_daily || 3)}
          isUnlimited={voiceInfo.isUnlimited || false}
        />
      </div>

      {/* Upgrade CTA - Show for Starter plan */}
      {planId === 'starter' && (
        <UpgradeCard currentPlan={planId} />
      )}
    </div>
  )
}
