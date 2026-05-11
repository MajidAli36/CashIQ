'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store/auth.store'
import { useSettingsStore } from '@/lib/store/settings.store'
import { hashPin } from '@/lib/utils/pin'
import { NumericKeypad } from '@/components/auth/NumericKeypad'
import { PinDots } from '@/components/auth/PinDots'
import { cn } from '@/lib/utils/cn'
import { ArrowLeft, Shield, ShieldCheck } from 'lucide-react'

type Step = 'enter' | 'confirm'

export default function SetPinPage() {
  const router = useRouter()
  const { phone, isVerified, pinHash: existingHash, setPinHash, unlock, isAuthenticated } = useAuthStore()
  const [step, setStep]       = useState<Step>('enter')
  const [firstPin, setFirstPin] = useState('')
  const [pin, setPin]         = useState('')
  const [error, setError]     = useState(false)
  const [saving, setSaving]   = useState(false)

  useEffect(() => {
    if (isAuthenticated) { router.replace('/dashboard'); return }
    if (!phone) { router.replace('/phone'); return }
    if (!isVerified) { router.replace('/otp'); return }
  }, [isAuthenticated, phone, isVerified, router])

  const handleKey = async (key: string) => {
    if (saving) return
    if (key === 'del') { setPin(p => p.slice(0, -1)); return }
    if (pin.length >= 4) return

    const newPin = pin + key
    setPin(newPin)

    if (newPin.length < 4) return

    if (step === 'enter') {
      setFirstPin(newPin)
      setTimeout(() => { setPin(''); setStep('confirm') }, 260)
    } else {
      if (newPin === firstPin) {
        setSaving(true)
        const hash = await hashPin(phone, newPin)
        setPinHash(hash)
        
        const { isOnboarded } = useSettingsStore.getState()
        if (!isOnboarded) {
          router.replace('/onboarding')
        } else {
          unlock()
          router.replace('/dashboard')
        }
      } else {
        setError(true)
        setTimeout(() => { setPin(''); setError(false) }, 800)
      }
    }
  }

  const goBack = () => { setStep('enter'); setPin(''); setError(false) }

  const isConfirm = step === 'confirm'

  return (
    <div className="min-h-screen bg-navy flex flex-col overflow-hidden">

      {/* Ambient */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-20 w-96 h-96 rounded-full blur-[120px]"
          style={{ background: isConfirm ? 'rgba(76,175,80,0.07)' : 'rgba(0,196,180,0.08)' }} />
      </div>

      {/* Header row */}
      <div className="relative z-10 flex items-center px-4 pt-14 pb-2 min-h-[80px]">
        {isConfirm && (
          <button onClick={goBack}
            className="w-10 h-10 rounded-xl bg-white/8 flex items-center justify-center">
            <ArrowLeft size={20} className="text-white" strokeWidth={2} />
          </button>
        )}
      </div>

      {/* Center content */}
      <div className="relative z-10 flex-1 flex flex-col items-center px-6 pt-4">

        {/* Step indicator */}
        <div className="flex gap-2 mb-8">
          <div className={cn('h-1 rounded-full transition-all duration-500 w-8',
            !isConfirm ? 'bg-teal' : 'bg-teal/40')} />
          <div className={cn('h-1 rounded-full transition-all duration-500 w-8',
            isConfirm ? 'bg-income' : 'bg-white/15')} />
        </div>

        {/* Icon */}
        <div className={cn(
          'w-[72px] h-[72px] rounded-[22px] flex items-center justify-center mb-6 transition-all duration-400',
          isConfirm
            ? 'border border-income/25'
            : 'border border-teal/20'
        )} style={{
          background: isConfirm
            ? 'linear-gradient(135deg,rgba(76,175,80,0.18) 0%,rgba(76,175,80,0.06) 100%)'
            : 'linear-gradient(135deg,rgba(0,196,180,0.22) 0%,rgba(0,196,180,0.06) 100%)'
        }}>
          {isConfirm
            ? <ShieldCheck size={30} className="text-income" />
            : <Shield size={30} className="text-teal" />}
        </div>

        <h1 className="text-[28px] font-black text-white tracking-tight text-center leading-tight mb-2">
          {isConfirm ? 'Confirm your PIN' : 'Create your PIN'}
        </h1>
        <p className="font-urdu text-white/40 text-sm text-center mb-2">
          {isConfirm ? 'پن دوبارہ درج کریں' : '4 ہندسہ پن بنائیں'}
        </p>
        <p className="text-white/25 text-[12px] text-center mb-12">
          {isConfirm
            ? error ? ' ' : 'Re-enter the same PIN'
            : 'This PIN unlocks the app every time'}
        </p>

        {/* Dots */}
        <div className="mb-12">
          <PinDots length={pin.length} error={error} />
          {error && (
            <p className="text-expense text-[12px] text-center mt-5 font-urdu">
              PINs don&apos;t match · پن میل نہیں کھاتے
            </p>
          )}
        </div>

        {/* Keypad */}
        <NumericKeypad onKey={handleKey} disabled={saving} />

        {!isConfirm && (
          <p className="text-white/18 text-[11px] text-center mt-8">
            🔒 Stored securely on your device · محفوظ طریقے سے محفوظ ہے
          </p>
        )}

        {existingHash && !isConfirm && (
          <button
            onClick={() => router.push('/pin')}
            className="mt-6 text-white/30 text-[12px]">
            Already have a PIN? Use it →
          </button>
        )}

      </div>
    </div>
  )
}
