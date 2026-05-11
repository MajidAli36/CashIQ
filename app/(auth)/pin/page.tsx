'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store/auth.store'
import { useSettingsStore } from '@/lib/store/settings.store'
import { useTranslation } from '@/lib/hooks/useTranslation'
import { verifyPin } from '@/lib/utils/pin'
import { NumericKeypad } from '@/components/auth/NumericKeypad'
import { PinDots } from '@/components/auth/PinDots'
import { cn } from '@/lib/utils/cn'
import { Sparkles, Fingerprint } from 'lucide-react'

const MAX_ATTEMPTS = 5

function maskPhone(raw: string) {
  if (!raw) return ''
  const local = raw.startsWith('92') ? '0' + raw.slice(2) : raw
  if (local.length < 7) return `+92 ${local}`
  return `+92 ${local.slice(0, 4)}-${local.slice(4, 7)}-XXXX`
}

export default function PinPage() {
  const { t } = useTranslation()
  const router   = useRouter()
  const { phone, pinHash, unlock, resetAuth, resetVerification, isAuthenticated } = useAuthStore()
  const shop     = useSettingsStore(s => s.shop)

  const [pin, setPin]         = useState('')
  const [error, setError]     = useState(false)
  const [attempts, setAttempts] = useState(0)
  const [locked, setLocked]   = useState(false)
  const [checking, setChecking] = useState(false)

  useEffect(() => {
    if (isAuthenticated) { router.replace('/dashboard'); return }
    if (!phone) { router.replace('/phone'); return }
    if (phone && !pinHash) { router.replace('/set-pin'); return }
  }, [isAuthenticated, phone, pinHash, router])

  const handleKey = async (key: string) => {
    if (locked || checking) return
    if (key === 'del') { setPin(p => p.slice(0, -1)); return }
    if (pin.length >= 4) return

    const newPin = pin + key
    setPin(newPin)
    if (newPin.length < 4) return

    setChecking(true)
    const ok = await verifyPin(phone, newPin, pinHash!)
    setChecking(false)

    if (ok) {
      unlock()
      router.replace('/dashboard')
    } else {
      const next = attempts + 1
      setAttempts(next)
      setError(true)
      if (next >= MAX_ATTEMPTS) setLocked(true)
      setTimeout(() => { setPin(''); setError(false) }, 800)
    }
  }

  const handleForgotPin = () => {
    resetVerification()
    router.push('/otp')
  }

  const handleChangeAccount = () => {
    resetAuth()
    router.replace('/phone')
  }

  const attemptsLeft = MAX_ATTEMPTS - attempts

  return (
    <div className="min-h-screen bg-navy flex flex-col overflow-hidden">

      {/* Ambient */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-20 w-96 h-96 rounded-full blur-[120px]"
          style={{ background: 'rgba(0,196,180,0.08)' }} />
        <div className="absolute bottom-0 -left-32 w-80 h-80 rounded-full blur-[100px]"
          style={{ background: 'rgba(0,196,180,0.05)' }} />
      </div>

      {/* App identity */}
      <div className="relative z-10 flex flex-col items-center pt-16 px-6">
        <div className="w-[72px] h-[72px] rounded-[22px] border border-teal/20 flex items-center justify-center mb-5 shadow-teal-glow"
          style={{ background: 'linear-gradient(135deg,rgba(0,196,180,0.22) 0%,rgba(0,196,180,0.06) 100%)' }}>
          <Sparkles size={28} className="text-teal" />
        </div>
        <p className="text-white font-black text-[22px] tracking-tight">
          {shop?.name || t('auth.appName')}
        </p>
        {shop?.name && (
          <p className="text-white/35 text-[13px] font-urdu mt-0.5">{t('auth.welcome')}</p>
        )}
      </div>

      {/* PIN section */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6">

        <p className="text-white/45 text-[13px] mb-1 font-medium tabular-nums">
          {maskPhone(phone)}
        </p>
        <h2 className={cn(
          'font-bold text-[18px] mb-10 transition-colors',
          locked ? 'text-expense' : 'text-white'
        )}>
          {locked ? t('auth.accountLocked') : t('auth.enterPin')}
        </h2>

        {/* Dots */}
        <div className="mb-12">
          <PinDots length={locked ? 4 : pin.length} error={error || locked} />
          {error && !locked && (
            <p className="text-expense text-[12px] text-center mt-5">
              {t('auth.incorrectPin')}
              {attemptsLeft > 0 && attemptsLeft <= 3 && (
                <span className="text-expense/60"> ({attemptsLeft} {t('auth.attemptsLeft')})</span>
              )}
            </p>
          )}
          {locked && (
            <p className="text-expense text-[12px] text-center mt-5 font-urdu">
              {t('auth.tooManyAttempts')}
            </p>
          )}
        </div>

        {/* Keypad or locked action */}
        {!locked ? (
          <NumericKeypad onKey={handleKey} disabled={checking} />
        ) : (
          <button
            onClick={handleForgotPin}
            className="px-6 py-3.5 rounded-2xl font-semibold text-[14px] transition-all active:scale-[0.97]"
            style={{ background: 'rgba(255,92,92,0.12)', border: '1px solid rgba(255,92,92,0.25)', color: '#FF5C5C' }}>
            {t('auth.verifyWithOtp')}
          </button>
        )}

        {/* Biometric (placeholder) */}
        {!locked && (
          <button className="mt-7 flex items-center gap-2 text-teal/45 text-[13px]">
            <Fingerprint size={18} strokeWidth={1.5} />
            <span>{t('auth.useBiometric')}</span>
          </button>
        )}

        {/* DEV bypass */}
        {!locked && (
          <button
            onClick={() => { unlock(); router.replace('/dashboard') }}
            className="mt-4 px-6 py-2.5 rounded-xl text-[13px] font-semibold text-white/50 border border-white/10 bg-white/5 active:bg-white/10 transition-all">
            Skip (Dev) →
          </button>
        )}

      </div>

      {/* Bottom row */}
      <div className="relative z-10 pb-10 px-6 flex items-center justify-between">
        <button onClick={handleChangeAccount} className="text-white/25 text-[12px]">
          {t('auth.changeAccount')}
        </button>
        {!locked && (
          <button onClick={handleForgotPin} className="text-teal/55 text-[12px] font-medium">
            {t('auth.forgotPin')}
          </button>
        )}
      </div>

    </div>
  )
}
