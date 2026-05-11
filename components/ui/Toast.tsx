'use client'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils/cn'
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react'

export interface ToastMessage {
  id: string
  type: 'success' | 'error' | 'warning'
  message: string
  messageUr?: string
}

let toastListeners: ((msg: ToastMessage) => void)[] = []

export function showToast(msg: Omit<ToastMessage, 'id'>) {
  const id = Math.random().toString(36).slice(2)
  toastListeners.forEach(fn => fn({ ...msg, id }))
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  useEffect(() => {
    const handler = (msg: ToastMessage) => {
      setToasts(prev => [...prev, msg])
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== msg.id)), 3500)
    }
    toastListeners.push(handler)
    return () => { toastListeners = toastListeners.filter(fn => fn !== handler) }
  }, [])

  const configs = {
    success: { icon: CheckCircle2, bg: 'bg-navy', accent: 'bg-teal' },
    error:   { icon: XCircle,      bg: 'bg-navy', accent: 'bg-expense' },
    warning: { icon: AlertCircle,  bg: 'bg-navy', accent: 'bg-loan' },
  }

  return (
    <div className="fixed bottom-[88px] left-1/2 -translate-x-1/2 w-full max-w-[390px] px-4 z-50 space-y-2 pointer-events-none">
      {toasts.map(t => {
        const cfg = configs[t.type]
        const Icon = cfg.icon
        return (
          <div key={t.id} className={cn(
            'flex items-center gap-3 px-4 py-3.5 rounded-2xl shadow-card-lg pointer-events-auto',
            'animate-slide-up', cfg.bg
          )}>
            <div className={cn('w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0', cfg.accent)}>
              <Icon size={16} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{t.message}</p>
              {t.messageUr && <p className="font-urdu text-xs text-white/60">{t.messageUr}</p>}
            </div>
          </div>
        )
      })}
    </div>
  )
}
