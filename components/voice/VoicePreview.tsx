'use client'
import { useRouter } from 'next/navigation'
import { useVoicePrefillStore } from '@/lib/store/voice-prefill.store'
import { useLoanStore } from '@/lib/store/loan.store'
import { useBusinessStore } from '@/lib/store/business.store'
import { describeIntent } from './VoiceParser'
import type { VoiceIntent } from '@/lib/store/voice-prefill.store'
import {
  TrendingUp, TrendingDown, Banknote, Users, Search,
  ArrowRight, UserPlus, X,
} from 'lucide-react'

interface VoicePreviewProps {
  intent:  VoiceIntent
  onClose: () => void
}

const INTENT_META = {
  add_transaction: { icon: TrendingUp,   label: 'Transaction',    color: '#00C4B4', bg: 'rgba(0,196,180,0.10)' },
  add_loan:        { icon: Banknote,     label: 'Loan',           color: '#F59E0B', bg: 'rgba(245,158,11,0.10)' },
  create_customer: { icon: Users,        label: 'New Customer',   color: '#8B5CF6', bg: 'rgba(139,92,246,0.10)' },
  get_transactions:{ icon: Search,       label: 'Search Records', color: '#3B82F6', bg: 'rgba(59,130,246,0.10)' },
}

export function VoicePreview({ intent, onClose }: VoicePreviewProps) {
  const router       = useRouter()
  const setPrefill   = useVoicePrefillStore(s => s.set)
  const customers    = useLoanStore(s => s.customers)
  const bid          = useBusinessStore(s => s.activeBusinessId) ?? undefined

  const bizCustomers = bid
    ? customers.filter(c => !c.business_id || c.business_id === bid)
    : customers

  const matchedCustomer = intent.customer
    ? bizCustomers.find(c => c.name.toLowerCase().includes(intent.customer!.toLowerCase()))
    : undefined

  const customerMissing = !!intent.customer && !matchedCustomer

  const meta = INTENT_META[intent.intent]
  const Icon = meta.icon

  // ── Continue handler ──────────────────────────────────────────────────────
  const handleContinue = (createCustomerFirst = false) => {
    setPrefill(intent)

    switch (intent.intent) {
      case 'create_customer':
        router.push('/customers?_voice=1')
        break

      case 'get_transactions':
        router.push(
          `/records${intent.customer ? `?customer=${encodeURIComponent(intent.customer)}` : ''}${
            intent.date_range ? `${intent.customer ? '&' : '?'}date=${intent.date_range}` : ''
          }`
        )
        break

      case 'add_loan':
        if (createCustomerFirst) router.push('/customers?_voice=1')
        else router.push('/add?type=loan')
        break

      default: {
        // add_transaction — always include ?type= so the /add page initialises
        // at step 2 without needing the voice-prefill effect to call setStep(2).
        const typeParam = intent.type === 'income'  ? 'income'
                        : intent.type === 'expense' ? 'expense'
                        : 'income'          // safe fallback
        router.push(`/add?type=${typeParam}`)
        break
      }
    }

    onClose()
  }

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ border: '1px solid var(--t-card-border, rgba(255,255,255,0.08))' }}
    >
      {/* Header strip */}
      <div
        className="flex items-center gap-2.5 px-4 py-3"
        style={{ background: meta.bg }}
      >
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: meta.color + '22' }}
        >
          <Icon size={16} style={{ color: meta.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: meta.color }}>
            {meta.label} detected
          </p>
          <p className="text-sm font-semibold truncate" style={{ color: 'var(--t-navy, #0B0F1A)' }}>
            {describeIntent(intent)}
          </p>
        </div>
      </div>

      {/* Detail rows */}
      <div className="px-4 py-3 space-y-2" style={{ background: 'var(--t-card-bg, #fff)' }}>
        {intent.amount !== undefined && (
          <Row label="Amount" value={`Rs. ${intent.amount.toLocaleString()}`}
            icon={<TrendingUp size={13} style={{ color: '#00C4B4' }} />} />
        )}
        {intent.customer && (
          <Row
            label="Customer"
            value={intent.customer}
            icon={<Users size={13} style={{ color: matchedCustomer ? '#4CAF50' : '#F59E0B' }} />}
            badge={matchedCustomer ? 'Found ✓' : 'Not found'}
            badgeColor={matchedCustomer ? '#4CAF50' : '#F59E0B'}
          />
        )}
        {intent.type && (
          <Row label="Type" value={intent.type}
            icon={intent.type === 'income'
              ? <TrendingUp size={13} style={{ color: '#4CAF50' }} />
              : <TrendingDown size={13} style={{ color: '#FF5C5C' }} />} />
        )}
        {intent.note && (
          <Row label="Note" value={intent.note}
            icon={<span className="text-[11px]">📝</span>} />
        )}
        {intent.date_range && (
          <Row label="Period" value={intent.date_range.replace('_', ' ')}
            icon={<span className="text-[11px]">📅</span>} />
        )}
        {intent.phone && (
          <Row label="Phone" value={intent.phone}
            icon={<span className="text-[11px]">📞</span>} />
        )}
      </div>

      {/* Customer not found banner */}
      {customerMissing && intent.intent !== 'create_customer' && (
        <div className="px-4 py-2.5 mx-3 mb-2 rounded-xl text-xs font-semibold flex items-center gap-2"
          style={{ background: 'rgba(245,158,11,0.10)', color: '#B45309' }}>
          <span>⚠️</span>
          <span>Customer &quot;{intent.customer}&quot; not found</span>
        </div>
      )}

      {/* Action buttons */}
      <div className="px-4 pb-4 space-y-2" style={{ background: 'var(--t-card-bg, #fff)' }}>
        {/* Primary: Continue */}
        <button
          onClick={() => handleContinue(false)}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-opacity active:opacity-80"
          style={{ background: meta.color, color: '#fff' }}
        >
          <ArrowRight size={16} />
          {intent.intent === 'get_transactions' ? 'Search Records' : 'Open Form & Confirm'}
        </button>

        {/* Customer missing: create first */}
        {customerMissing && intent.intent !== 'create_customer' && (
          <button
            onClick={() => handleContinue(true)}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm transition-opacity active:opacity-80"
            style={{ background: 'rgba(139,92,246,0.10)', color: '#8B5CF6', border: '1px solid rgba(139,92,246,0.20)' }}
          >
            <UserPlus size={14} />
            Create &quot;{intent.customer}&quot; first
          </button>
        )}

        {/* Cancel */}
        <button
          onClick={onClose}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-sm transition-opacity active:opacity-70"
          style={{ color: 'var(--t-muted, #64748B)' }}
        >
          <X size={13} />
          Cancel
        </button>
      </div>
    </div>
  )
}

// ── small helper ──────────────────────────────────────────────────────────────
function Row({ label, value, icon, badge, badgeColor }: {
  label: string; value: string; icon: React.ReactNode
  badge?: string; badgeColor?: string
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="flex-shrink-0 w-4 flex items-center justify-center">{icon}</span>
      <span className="text-xs text-muted flex-shrink-0" style={{ minWidth: 64, color: 'var(--t-muted, #64748B)' }}>{label}</span>
      <span className="text-xs font-semibold flex-1 truncate" style={{ color: 'var(--t-navy, #0B0F1A)' }}>{value}</span>
      {badge && (
        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0"
          style={{ background: badgeColor + '18', color: badgeColor }}>
          {badge}
        </span>
      )}
    </div>
  )
}
