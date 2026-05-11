'use client'
import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X, CreditCard, Building2, Calendar, DollarSign, FileText, Users, Camera, Image as ImageIcon, Trash2 } from 'lucide-react'
import { useCheckGuaranteeStore } from '@/lib/store/check-guarantee.store'
import { useLoanStore } from '@/lib/store/loan.store'
import { useBusinessStore } from '@/lib/store/business.store'
import { showToast } from '@/components/ui/Toast'

const MODAL_BG = 'rgba(11, 15, 26, 0.97)'
const MODAL_BORDER = '1px solid rgba(255,255,255,0.09)'
const INPUT_BG = 'rgba(255,255,255,0.06)'
const INPUT_BORDER = 'rgba(255,255,255,0.10)'
const INPUT_BORDER_ERROR = 'rgba(255,92,92,0.5)'
const SECTION_BG = 'rgba(255,255,255,0.04)'

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

interface AddCheckModalProps {
  isOpen: boolean
  onClose: () => void
  preselectedCustomerId?: string
}

export function AddCheckModal({ isOpen, onClose, preselectedCustomerId }: AddCheckModalProps) {
  const { addCheckGuarantee } = useCheckGuaranteeStore()
  const { customers } = useLoanStore()
  const { activeBusinessId } = useBusinessStore()
  const bid = activeBusinessId ?? undefined

  const [customerId, setCustomerId] = useState(preselectedCustomerId || '')
  const [checkNumber, setCheckNumber] = useState('')
  const [bankName, setBankName] = useState('')
  const [checkDate, setCheckDate] = useState('')
  const [checkAmount, setCheckAmount] = useState('')
  const [note, setNote] = useState('')
  const [photoUrl, setPhotoUrl] = useState<string | undefined>(undefined)
  const [photoLoading, setPhotoLoading] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoLoading(true)
    const compressed = await compressImage(file)
    setPhotoUrl(compressed)
    setPhotoLoading(false)
    e.target.value = ''
  }

  const bizCustomers = bid
    ? customers.filter(c => !c.business_id || c.business_id === bid)
    : customers

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!customerId) newErrors.customerId = 'Customer is required'
    if (!checkNumber.trim()) newErrors.checkNumber = 'Check number is required'
    if (!bankName.trim()) newErrors.bankName = 'Bank name is required'
    if (!checkDate) newErrors.checkDate = 'Check date is required'
    if (!checkAmount || parseFloat(checkAmount) <= 0) newErrors.checkAmount = 'Valid amount is required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (!validate()) return
    addCheckGuarantee({
      business_id: bid || '',
      customer_id: customerId,
      check_number: checkNumber.trim(),
      bank_name: bankName.trim(),
      check_date: checkDate,
      check_amount: parseFloat(checkAmount),
      status: 'active',
      note: note.trim() || undefined,
      photo_url: photoUrl,
    })
    showToast({ type: 'success', message: 'Check guarantee added successfully!' })
    onClose()
    resetForm()
  }

  const resetForm = () => {
    setCustomerId(preselectedCustomerId || '')
    setCheckNumber('')
    setBankName('')
    setCheckDate('')
    setCheckAmount('')
    setNote('')
    setPhotoUrl(undefined)
    setErrors({})
  }

  if (!isOpen || !mounted) return null

  const inputStyle = (hasError: boolean) => ({
    background: INPUT_BG,
    borderColor: hasError ? INPUT_BORDER_ERROR : INPUT_BORDER,
    color: 'white',
  })

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}
    >
      <div
        className="w-full max-w-md rounded-2xl max-h-[90vh] overflow-y-auto"
        style={{ background: MODAL_BG, border: MODAL_BORDER, boxShadow: '0 30px 60px rgba(0,0,0,0.6)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <h2 className="text-lg font-black text-white">Add Check Guarantee</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center transition-all active:scale-90"
            style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <X size={14} className="text-white/50" />
          </button>
        </div>

        {/* Form */}
        <div className="p-5 space-y-4">

          {/* Customer */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-white/50 mb-2 uppercase tracking-wide">
              <Users size={12} /> Customer
            </label>
            <select
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border focus:outline-none text-sm"
              style={inputStyle(!!errors.customerId)}
              disabled={!!preselectedCustomerId}
            >
              <option value="" style={{ background: '#0B0F1A' }}>Select Customer</option>
              {bizCustomers.map((c) => (
                <option key={c.id} value={c.id} style={{ background: '#0B0F1A' }}>{c.name}</option>
              ))}
            </select>
            {errors.customerId && <p className="text-xs text-expense mt-1">{errors.customerId}</p>}
          </div>

          {/* Check Number */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-white/50 mb-2 uppercase tracking-wide">
              <CreditCard size={12} /> Check Number
            </label>
            <input
              type="text"
              value={checkNumber}
              onChange={(e) => setCheckNumber(e.target.value)}
              placeholder="e.g., 123456"
              className="w-full px-4 py-2.5 rounded-xl border focus:outline-none text-sm placeholder:text-white/25"
              style={inputStyle(!!errors.checkNumber)}
            />
            {errors.checkNumber && <p className="text-xs text-expense mt-1">{errors.checkNumber}</p>}
          </div>

          {/* Bank Name */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-white/50 mb-2 uppercase tracking-wide">
              <Building2 size={12} /> Bank Name
            </label>
            <input
              type="text"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              placeholder="e.g., HBL, MCB, UBL"
              className="w-full px-4 py-2.5 rounded-xl border focus:outline-none text-sm placeholder:text-white/25"
              style={inputStyle(!!errors.bankName)}
            />
            {errors.bankName && <p className="text-xs text-expense mt-1">{errors.bankName}</p>}
          </div>

          {/* Check Date */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-white/50 mb-2 uppercase tracking-wide">
              <Calendar size={12} /> Check Date
            </label>
            <input
              type="date"
              value={checkDate}
              onChange={(e) => setCheckDate(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border focus:outline-none text-sm"
              style={inputStyle(!!errors.checkDate)}
            />
            {errors.checkDate && <p className="text-xs text-expense mt-1">{errors.checkDate}</p>}
          </div>

          {/* Check Amount */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-white/50 mb-2 uppercase tracking-wide">
              <DollarSign size={12} /> Check Amount (Rs.)
            </label>
            <input
              type="number"
              value={checkAmount}
              onChange={(e) => setCheckAmount(e.target.value)}
              placeholder="e.g., 100000"
              className="w-full px-4 py-2.5 rounded-xl border focus:outline-none text-sm placeholder:text-white/25"
              style={inputStyle(!!errors.checkAmount)}
            />
            {errors.checkAmount && <p className="text-xs text-expense mt-1">{errors.checkAmount}</p>}
          </div>

          {/* Photo Evidence */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-white/50 mb-2 uppercase tracking-wide">
              <Camera size={12} /> Photo / Evidence (Optional)
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handlePhotoSelect}
            />
            {photoUrl ? (
              <div className="relative rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.10)' }}>
                <img src={photoUrl} alt="Check evidence" className="w-full max-h-48 object-cover" />
                <button
                  type="button"
                  onClick={() => setPhotoUrl(undefined)}
                  className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 flex items-center justify-center"
                >
                  <Trash2 size={14} className="text-white" />
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-2 right-2 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 text-white text-xs font-semibold"
                >
                  <Camera size={12} /> Change
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={photoLoading}
                className="w-full py-8 rounded-xl border-2 border-dashed flex flex-col items-center gap-2 text-white/40 transition-colors hover:text-white/60"
                style={{ borderColor: 'rgba(255,255,255,0.12)' }}
              >
                {photoLoading ? (
                  <span className="text-sm">Compressing...</span>
                ) : (
                  <>
                    <ImageIcon size={28} />
                    <span className="text-sm font-semibold">Tap to add check photo</span>
                    <span className="text-xs">Camera or gallery</span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* Note */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-white/50 mb-2 uppercase tracking-wide">
              <FileText size={12} /> Note (Optional)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add any additional notes..."
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl border focus:outline-none text-sm resize-none placeholder:text-white/25"
              style={{ background: INPUT_BG, borderColor: INPUT_BORDER, color: 'white' }}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-xl font-semibold text-sm text-white/70 transition-all active:scale-95"
              style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.09)' }}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 py-3 rounded-xl font-semibold text-sm text-white transition-all active:scale-95"
              style={{ background: 'rgba(0,196,180,0.85)' }}
            >
              Add Check
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}
