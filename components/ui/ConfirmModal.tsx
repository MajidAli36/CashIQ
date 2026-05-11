'use client'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

interface ConfirmModalProps {
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
  danger?: boolean
}

export function ConfirmModal({ title, message, confirmLabel = 'Confirm', cancelLabel = 'Cancel', onConfirm, onCancel, danger }: ConfirmModalProps) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])
  if (!mounted) return null

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-end md:items-center justify-center px-4 pb-0 md:pb-0"
      style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}>
      <div
        className="w-full max-w-md rounded-b-none md:rounded-2xl rounded-t-2xl p-6 shadow-2xl"
        style={{
          background: 'rgba(11, 15, 26, 0.97)',
          border: '1px solid rgba(255,255,255,0.09)',
          boxShadow: '0 30px 60px rgba(0,0,0,0.6)',
        }}
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-bold text-white">{title}</h3>
          <button
            onClick={onCancel}
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.07)' }}
          >
            <X size={14} className="text-white/50" />
          </button>
        </div>
        <p className="text-sm text-white/50 mb-6">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 h-12 rounded-xl text-sm font-semibold text-white/70 transition-all active:scale-95"
            style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.09)' }}
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 h-12 rounded-xl text-sm font-semibold text-white transition-all active:scale-95 ${danger ? 'bg-expense' : 'bg-teal'}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
