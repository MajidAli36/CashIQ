'use client'
import { useMemo, useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import {
  X, CreditCard, Building2, Calendar, User, FileText,
  TrendingUp, TrendingDown, Clock, CheckCircle2, AlertCircle,
  Camera, Image as ImageIcon, Trash2, ZoomIn
} from 'lucide-react'
import { useCheckGuaranteeStore } from '@/lib/store/check-guarantee.store'
import { formatCurrency } from '@/lib/utils/currency'
import { CheckStatusBadge } from './CheckStatusBadge'
import { cn } from '@/lib/utils/cn'
import type { CheckGuarantee } from '@/lib/types'

const CARD_BG = 'rgba(255,255,255,0.05)'
const CARD_BORDER = '1px solid rgba(255,255,255,0.08)'

function compressImage(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new window.Image()
      img.onload = () => {
        const maxW = 1200
        const scale = img.width > maxW ? maxW / img.width : 1
        const canvas = document.createElement('canvas')
        canvas.width = img.width * scale
        canvas.height = img.height * scale
        canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL('image/jpeg', 0.75))
      }
      img.src = e.target!.result as string
    }
    reader.readAsDataURL(file)
  })
}

interface CheckDetailModalProps {
  isOpen: boolean
  onClose: () => void
  check: CheckGuarantee
  customerName?: string
  onRecordPayment?: () => void
}

export function CheckDetailModal({ isOpen, onClose, check, customerName, onRecordPayment }: CheckDetailModalProps) {
  const { getCheckPayments, getCheckSchedule, updateCheckGuarantee } = useCheckGuaranteeStore()
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [photoLoading, setPhotoLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  useEffect(() => { setMounted(true) }, [])

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoLoading(true)
    const compressed = await compressImage(file)
    updateCheckGuarantee(check.id, { photo_url: compressed })
    setPhotoLoading(false)
    e.target.value = ''
  }

  const handleRemovePhoto = () => {
    updateCheckGuarantee(check.id, { photo_url: undefined })
  }

  const payments = useMemo(() => getCheckPayments(check.id), [check.id, getCheckPayments])
  const schedule = useMemo(() => getCheckSchedule(check.id), [check.id, getCheckSchedule])
  const percentage = check.check_amount > 0 ? (check.total_paid / check.check_amount) * 100 : 0

  if (!isOpen || !mounted) return null

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="relative w-full sm:max-w-lg max-h-[92vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl shadow-2xl"
        style={{
          background: 'rgba(11, 15, 26, 0.98)',
          border: '1px solid rgba(255,255,255,0.09)',
          boxShadow: '0 30px 60px rgba(0,0,0,0.7)',
        }}
      >
        {/* Handle (mobile) */}
        <div className="flex justify-center pt-3 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-white/15" />
        </div>

        {/* Header */}
        <div
          className="sticky top-0 z-10 flex items-center justify-between px-5 py-4"
          style={{
            background: 'rgba(11, 15, 26, 0.98)',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(59,130,246,0.15)' }}>
              <CreditCard size={20} className="text-blue-400" />
            </div>
            <div>
              <p className="text-xs font-medium text-white/40">Check Guarantee</p>
              <h2 className="font-black text-base text-white">#{check.check_number}</h2>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <CheckStatusBadge status={check.status} />
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'rgba(255,255,255,0.07)' }}
            >
              <X size={18} className="text-white/50" />
            </button>
          </div>
        </div>

        <div className="px-5 py-4 space-y-4">

          {/* Info Row */}
          <div className="rounded-xl p-4 grid grid-cols-2 gap-3" style={{ background: CARD_BG, border: CARD_BORDER }}>
            <InfoItem icon={<User size={13} />} label="Customer" value={customerName || '—'} />
            <InfoItem icon={<Building2 size={13} />} label="Bank" value={check.bank_name} />
            <InfoItem
              icon={<Calendar size={13} />}
              label="Check Date"
              value={new Date(check.check_date).toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' })}
            />
            <InfoItem
              icon={<Clock size={13} />}
              label="Added On"
              value={new Date(check.created_at).toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' })}
            />
            {check.note && (
              <div className="col-span-2">
                <InfoItem icon={<FileText size={13} />} label="Note" value={check.note} />
              </div>
            )}
          </div>

          {/* Amount Summary */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="rounded-xl p-3 text-center" style={{ background: CARD_BG, border: CARD_BORDER }}>
              <p className="text-[10px] font-medium text-white/40 mb-1">Total</p>
              <p className="text-sm font-black text-white">{formatCurrency(check.check_amount)}</p>
            </div>
            <div className="rounded-xl p-3 text-center" style={{ background: 'rgba(76,175,80,0.10)', border: '1px solid rgba(76,175,80,0.25)' }}>
              <p className="text-[10px] font-medium text-income/70 mb-1">Paid</p>
              <p className="text-sm font-black text-income">{formatCurrency(check.total_paid)}</p>
            </div>
            <div className="rounded-xl p-3 text-center" style={{ background: 'rgba(255,92,92,0.10)', border: '1px solid rgba(255,92,92,0.25)' }}>
              <p className="text-[10px] font-medium text-expense/70 mb-1">Left</p>
              <p className="text-sm font-black text-expense">{formatCurrency(check.remaining_balance)}</p>
            </div>
          </div>

          {/* Progress */}
          <div className="rounded-xl p-4" style={{ background: CARD_BG, border: CARD_BORDER }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-white/70">Payment Progress</span>
              <span className={cn('text-sm font-black', percentage >= 100 ? 'text-income' : 'text-blue-400')}>
                {percentage.toFixed(1)}%
              </span>
            </div>
            <div className="h-2.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
              <div
                className={cn('h-full rounded-full transition-all', percentage >= 100 ? 'bg-income' : 'bg-blue-500')}
                style={{ width: `${Math.min(percentage, 100)}%` }}
              />
            </div>
            <p className="text-xs mt-2 text-white/35">
              {formatCurrency(check.total_paid)} collected of {formatCurrency(check.check_amount)}
            </p>
          </div>

          {/* Photo Evidence */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white/70">Check Photo / Evidence</h3>
              {check.photo_url && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs font-semibold text-blue-400 flex items-center gap-1"
                >
                  <Camera size={12} /> Change
                </button>
              )}
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhotoSelect} />
            {check.photo_url ? (
              <div className="relative rounded-xl overflow-hidden" style={{ border: CARD_BORDER }}>
                <img src={check.photo_url} alt="Check evidence" className="w-full max-h-56 object-cover cursor-pointer" onClick={() => setLightboxOpen(true)} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />
                <button onClick={() => setLightboxOpen(true)} className="absolute bottom-3 left-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/50 text-white text-xs font-semibold">
                  <ZoomIn size={12} /> View Full
                </button>
                <button onClick={handleRemovePhoto} className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 flex items-center justify-center">
                  <Trash2 size={14} className="text-white" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={photoLoading}
                className="w-full py-8 rounded-xl border-2 border-dashed flex flex-col items-center gap-2 text-white/35 transition-colors hover:text-white/55"
                style={{ borderColor: 'rgba(255,255,255,0.12)' }}
              >
                {photoLoading ? <span className="text-sm">Compressing...</span> : (
                  <>
                    <ImageIcon size={28} />
                    <span className="text-sm font-semibold">Add check photo</span>
                    <span className="text-xs">Tap to use camera or gallery</span>
                  </>
                )}
              </button>
            )}
          </section>

          {/* Payment Schedule */}
          {schedule.length > 0 && (
            <section>
              <h3 className="text-sm font-bold text-white/70 mb-3">Payment Schedule</h3>
              <div className="space-y-2">
                {schedule.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between rounded-xl px-4 py-3"
                    style={{
                      background: s.is_paid ? 'rgba(76,175,80,0.10)' : CARD_BG,
                      border: s.is_paid ? '1px solid rgba(76,175,80,0.25)' : CARD_BORDER,
                    }}
                  >
                    <div className="flex items-center gap-3">
                      {s.is_paid
                        ? <CheckCircle2 size={16} className="text-income shrink-0" />
                        : <AlertCircle size={16} className="text-loan shrink-0" />
                      }
                      <div>
                        <p className="text-xs font-semibold text-white/80">Installment #{s.installment_number}</p>
                        <p className="text-xs text-white/40">
                          Due: {new Date(s.due_date).toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-white">{formatCurrency(s.expected_amount)}</p>
                      {s.is_paid && s.paid_amount != null && (
                        <p className="text-xs text-income font-semibold">Paid {formatCurrency(s.paid_amount)}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Payment History */}
          <section>
            <h3 className="text-sm font-bold text-white/70 mb-3">Payment History</h3>
            {payments.length === 0 ? (
              <div className="rounded-xl py-8 text-center" style={{ background: CARD_BG, border: CARD_BORDER }}>
                <TrendingDown size={28} className="mx-auto mb-2 text-white/25" />
                <p className="text-sm text-white/35">No payments recorded yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {payments.map((p, i) => (
                  <div key={p.id} className="flex items-center justify-between rounded-xl px-4 py-3" style={{ background: CARD_BG, border: CARD_BORDER }}>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(76,175,80,0.12)' }}>
                        <TrendingUp size={14} className="text-income" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-white/80">Payment #{payments.length - i}</p>
                        <p className="text-xs text-white/40">
                          {new Date(p.date).toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' })}
                          {p.note ? ` · ${p.note}` : ''}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm font-bold text-income">+{formatCurrency(p.amount)}</p>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Action */}
          {check.status === 'active' && onRecordPayment && (
            <button
              onClick={() => { onClose(); onRecordPayment() }}
              className="w-full py-3.5 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
              style={{ background: 'rgba(76,175,80,0.85)' }}
            >
              <TrendingUp size={16} />
              Record Payment
            </button>
          )}
        </div>

        <div className="h-4" />
      </div>

      {/* Lightbox */}
      {lightboxOpen && check.photo_url && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/95" onClick={() => setLightboxOpen(false)}>
          <button onClick={() => setLightboxOpen(false)} className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
            <X size={20} className="text-white" />
          </button>
          <img src={check.photo_url} alt="Check evidence fullscreen" className="max-w-full max-h-full object-contain p-4" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </div>,
    document.body
  )
}

function InfoItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div>
      <div className="flex items-center gap-1 mb-0.5 text-white/40">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <p className="text-sm font-semibold text-white/85">{value}</p>
    </div>
  )
}
