'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLoanStore } from '@/lib/store/loan.store'
import { useVoicePrefillStore } from '@/lib/store/voice-prefill.store'
import { useCheckGuaranteeStore } from '@/lib/store/check-guarantee.store'
import { useBusinessStore } from '@/lib/store/business.store'
import { useTranslation } from '@/lib/hooks/useTranslation'
import { GradientPageHeader } from '@/components/layout/GradientPageHeader'
import { formatAmount } from '@/lib/utils/currency'
import { Search, Plus, X, User, Phone, Check, ChevronRight, FileCheck } from 'lucide-react'
import Link from 'next/link'

const AVATAR_PALETTE = [
  ['#4CAF50', '#388E3C'], ['#00C4B4', '#00897B'], ['#F59E0B', '#D97706'],
  ['#FF5C5C', '#E53935'], ['#3B82F6', '#1D4ED8'], ['#8B5CF6', '#6D28D9'],
  ['#EC4899', '#BE185D'], ['#14B8A6', '#0F766E'], ['#F97316', '#C2410C'],
  ['#84CC16', '#4D7C0F'],
]

function getAvatarPalette(name: string) {
  let h = 0
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h)
  return AVATAR_PALETTE[Math.abs(h) % AVATAR_PALETTE.length]
}

export default function CustomersPage() {
  const { t } = useTranslation()
  const { customers, addCustomer, getCustomerBalance } = useLoanStore()
  const { getCustomerChecks } = useCheckGuaranteeStore()
  const { activeBusinessId } = useBusinessStore()
  const bid = activeBusinessId ?? undefined

  const [search, setSearch]   = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [newName, setNewName] = useState('')
  const [newPhone, setNewPhone] = useState('')
  const [nameErr, setNameErr]  = useState('')
  const [saved, setSaved]      = useState<string | null>(null)

  const voicePending = useVoicePrefillStore(s => s.pending)
  const voiceClear   = useVoicePrefillStore(s => s.clear)
  useEffect(() => {
    if (!voicePending) return
    if (voicePending.intent !== 'create_customer') return
    voiceClear()
    if (voicePending.customer) setNewName(voicePending.customer)
    if (voicePending.phone)    setNewPhone(voicePending.phone)
    setShowAdd(true)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const bizCustomers = bid
    ? customers.filter(c => !c.business_id || c.business_id === bid)
    : customers

  const filtered = search.trim()
    ? bizCustomers.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search)
      )
    : bizCustomers.slice().sort((a, b) => b.created_at.localeCompare(a.created_at))

  const totalOwed = bizCustomers.reduce((sum, c) => {
    const b = getCustomerBalance(c.id)
    return b > 0 ? sum + b : sum
  }, 0)

  const handleAdd = () => {
    if (!newName.trim()) { setNameErr(t('validation.nameRequired')); return }
    const id = addCustomer({ name: newName.trim(), phone: newPhone.trim(), notes: '', business_id: bid })
    setSaved(id)
    setTimeout(() => setSaved(null), 2000)
    setNewName(''); setNewPhone(''); setNameErr(''); setShowAdd(false)
  }

  return (
    <div className="min-h-screen pb-24" style={{ background: 'var(--t-page-bg)' }}>

      <GradientPageHeader
        title={t('customers.customers')}
        right={
          <button
            onClick={() => setShowAdd(true)}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all active:scale-95 hover:brightness-110"
            style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.22)' }}
          >
            <Plus size={18} className="text-white" strokeWidth={2.5} />
          </button>
        }
      />

      {/* Summary strip */}
      {bizCustomers.length > 0 && (
        <div className="px-4 pt-4 grid grid-cols-2 gap-3">
          <div
            className="rounded-2xl px-4 py-3.5"
            style={{ background: 'var(--t-card-bg)', border: '1px solid var(--t-card-border)', boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}
          >
            <p className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--t-muted)' }}>
              {t('customers.customers')}
            </p>
            <p className="text-2xl font-black" style={{ color: 'var(--t-text)' }}>{bizCustomers.length}</p>
          </div>
          <div
            className="rounded-2xl px-4 py-3.5"
            style={{ background: 'rgba(0,200,122,0.07)', border: '1px solid rgba(0,200,122,0.18)', boxShadow: '0 2px 10px rgba(0,200,122,0.05)' }}
          >
            <p className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: '#00C87A' }}>
              {t('dashboard.toReceive')}
            </p>
            <p className="text-2xl font-black" style={{ color: '#00C87A' }}>
              {formatAmount(totalOwed)}
            </p>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="px-4 pt-3">
        <div
          className="flex items-center gap-3 h-11 px-4 rounded-2xl transition-all"
          style={{ background: 'var(--t-card-bg)', border: '1px solid var(--t-card-border)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
        >
          <Search size={14} style={{ color: 'var(--t-muted)' }} className="flex-shrink-0" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={t('customers.searchNameOrPhone')}
            className="flex-1 bg-transparent text-[13px] font-medium placeholder:opacity-40 focus:outline-none"
            style={{ color: 'var(--t-text)' }}
          />
          {search && (
            <button onClick={() => setSearch('')} className="transition-opacity hover:opacity-60">
              <X size={13} style={{ color: 'var(--t-muted)' }} />
            </button>
          )}
        </div>
      </div>

      {/* Count label */}
      <div className="px-5 pt-2.5 pb-1">
        <p className="text-[11px] font-semibold" style={{ color: 'var(--t-muted)' }}>
          {filtered.length} {t('customers.customers')}
        </p>
      </div>

      {/* Customer list */}
      <div className="px-4 space-y-2 pb-4">

        {/* Empty state */}
        {filtered.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div
              className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl mb-5 shadow-sm"
              style={{ background: 'var(--t-card-bg)', border: '1px solid var(--t-card-border)' }}
            >
              🤝
            </div>
            <p className="text-[16px] font-bold mb-1" style={{ color: 'var(--t-text)' }}>
              {t('customers.noCustomers')}
            </p>
            <p className="text-[13px] mb-6 opacity-60" style={{ color: 'var(--t-muted)' }}>
              {t('customers.searchNameOrPhone')}
            </p>
            <button
              onClick={() => setShowAdd(true)}
              className="h-11 px-7 rounded-2xl text-white text-[13px] font-bold transition-all active:scale-95 hover:brightness-110"
              style={{ background: 'var(--t-accent)', boxShadow: '0 4px 16px rgba(0,196,180,0.35)' }}
            >
              {t('customers.addCustomer')}
            </button>
          </motion.div>
        )}

        {/* Cards */}
        {filtered.map((c, i) => {
          const bal          = getCustomerBalance(c.id)
          const checks       = getCustomerChecks(c.id)
          const activeChecks = checks.filter(ch => ch.status === 'active')
          const initials     = c.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
          const [from, to]   = getAvatarPalette(c.name)
          const isJustSaved  = saved === c.id

          return (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.035, duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -1, boxShadow: '0 6px 20px rgba(0,0,0,0.08)' }}
            >
              <Link
                href={`/customers/${c.id}`}
                className="flex items-center gap-3.5 px-4 py-3.5 rounded-2xl transition-all active:scale-[0.98]"
                style={{
                  background: 'var(--t-card-bg)',
                  border: '1px solid var(--t-card-border)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                }}
              >
                {/* Gradient avatar */}
                <div
                  className="w-11 h-11 rounded-2xl flex items-center justify-center text-[13px] font-black text-white flex-shrink-0"
                  style={{
                    background: `linear-gradient(135deg, ${from} 0%, ${to} 100%)`,
                    boxShadow: `0 4px 12px ${from}50`,
                  }}
                >
                  {isJustSaved
                    ? <Check size={16} className="text-white" strokeWidth={3} />
                    : initials}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-bold truncate leading-tight" style={{ color: 'var(--t-text)' }}>
                    {c.name}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className="text-[11px]" style={{ color: 'var(--t-muted)' }}>
                      {c.phone || <span className="italic opacity-50">{t('customers.noPhone')}</span>}
                    </p>
                    {activeChecks.length > 0 && (
                      <div
                        className="flex items-center gap-1 px-1.5 py-0.5 rounded-md"
                        style={{ background: 'rgba(59,130,246,0.10)' }}
                      >
                        <FileCheck size={9} className="text-blue-500" />
                        <span className="text-[9px] font-bold text-blue-500">{activeChecks.length}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Balance badge */}
                {bal !== 0 && (
                  <div
                    className="flex-shrink-0 px-3 py-1.5 rounded-xl text-[11px] font-bold"
                    style={{
                      background: bal > 0 ? 'rgba(0,200,122,0.10)' : 'rgba(255,59,92,0.10)',
                      color: bal > 0 ? '#00C87A' : '#FF3B5C',
                    }}
                  >
                    {bal > 0 ? '+' : '−'} {formatAmount(Math.abs(bal))}
                  </div>
                )}

                <ChevronRight size={14} style={{ color: 'var(--t-muted)', flexShrink: 0, opacity: 0.4 }} />
              </Link>
            </motion.div>
          )
        })}
      </div>

      {/* Premium FAB */}
      <motion.button
        onClick={() => setShowAdd(true)}
        className="fixed bottom-24 right-4 w-14 h-14 rounded-2xl flex items-center justify-center text-white"
        style={{ background: 'var(--t-accent)', boxShadow: '0 8px 28px rgba(0,196,180,0.45)' }}
        whileHover={{ scale: 1.08, boxShadow: '0 12px 36px rgba(0,196,180,0.55)' }}
        whileTap={{ scale: 0.92 }}
        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      >
        <Plus size={24} strokeWidth={2.5} />
      </motion.button>

      {/* Add Customer Bottom Sheet */}
      <AnimatePresence>
        {showAdd && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 z-50"
              style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAdd(false)}
            />

            {/* Sheet */}
            <motion.div
              className="fixed bottom-0 left-0 right-0 z-50 md:max-w-md md:mx-auto md:bottom-8 md:rounded-3xl rounded-t-[28px] overflow-hidden"
              style={{ background: 'var(--t-card-bg)', border: '1px solid var(--t-card-border)', boxShadow: '0 -8px 40px rgba(0,0,0,0.16)' }}
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 380, damping: 36 }}
            >
              {/* Drag handle */}
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 rounded-full opacity-25" style={{ background: 'var(--t-muted)' }} />
              </div>

              <div className="px-5 pt-2 pb-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-[17px] font-black" style={{ color: 'var(--t-text)' }}>
                      {t('customers.addCustomer')}
                    </p>
                    <p className="text-[12px] mt-0.5" style={{ color: 'var(--t-muted)' }}>
                      {t('customers.fullName')} · {t('common.phone')}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowAdd(false)}
                    className="w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:opacity-70"
                    style={{ background: 'var(--t-page-bg)', border: '1px solid var(--t-card-border)' }}
                  >
                    <X size={14} style={{ color: 'var(--t-muted)' }} />
                  </button>
                </div>

                {/* Name */}
                <div className="mb-4">
                  <label className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--t-muted)' }}>
                    <User size={10} />
                    {t('customers.fullName')}
                    <span className="font-medium normal-case opacity-50">*</span>
                  </label>
                  <input
                    value={newName}
                    onChange={e => { setNewName(e.target.value); setNameErr('') }}
                    placeholder={t('placeholders.enterName')}
                    autoFocus
                    className="w-full h-12 rounded-2xl px-4 text-[14px] font-medium focus:outline-none transition-all"
                    style={{
                      background: 'var(--t-page-bg)',
                      border: nameErr ? '2px solid #FF3B5C' : '1.5px solid var(--t-card-border)',
                      color: 'var(--t-text)',
                    }}
                  />
                  {nameErr && (
                    <p className="text-[11px] mt-1.5 font-semibold" style={{ color: '#FF3B5C' }}>{nameErr}</p>
                  )}
                </div>

                {/* Phone */}
                <div className="mb-6">
                  <label className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--t-muted)' }}>
                    <Phone size={10} />
                    {t('common.phone')}
                    <span className="font-medium normal-case opacity-40">({t('common.optional')})</span>
                  </label>
                  <input
                    value={newPhone}
                    onChange={e => setNewPhone(e.target.value)}
                    placeholder={t('businesses.phonePlaceholder')}
                    type="tel"
                    className="w-full h-12 rounded-2xl px-4 text-[14px] font-medium focus:outline-none transition-all"
                    style={{
                      background: 'var(--t-page-bg)',
                      border: '1.5px solid var(--t-card-border)',
                      color: 'var(--t-text)',
                    }}
                  />
                </div>

                {/* Save */}
                <button
                  onClick={handleAdd}
                  className="w-full h-[52px] rounded-2xl text-white text-[15px] font-black flex items-center justify-center gap-2 transition-all active:scale-[0.98] hover:brightness-110"
                  style={{ background: 'var(--t-accent)', boxShadow: '0 4px 18px rgba(0,196,180,0.35)' }}
                >
                  <Check size={17} strokeWidth={2.5} />
                  {t('common.save')}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
