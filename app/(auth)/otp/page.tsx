'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store/auth.store'
import { cn } from '@/lib/utils/cn'
import { ArrowLeft, RefreshCw, CheckCircle2, Loader2 } from 'lucide-react'
import enJson from '@/en.json'
import urJson from '@/ur.json'

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

function maskPhone(phone: string) {
  if (phone.length < 5) return phone
  const local = phone.startsWith('92') ? '0' + phone.slice(2) : phone
  return `+92 ${local.slice(1, 4)}-${local.slice(4, 7)}-XXXX`
}

export default function OtpPage() {
  const router = useRouter()
  const { phone, isVerified, setVerified, isAuthenticated } = useAuthStore()
  const [digits, setDigits] = useState(['', '', '', '', '', ''])
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [countdown, setCountdown] = useState(60)
  const [demoOtp, setDemoOtp] = useState('')
  const [language, setLanguage] = useState<'en' | 'ur'>('en')
  const [verifying, setVerifying] = useState(false)
  const inputs = useRef<(HTMLInputElement | null)[]>([])

  const translations = language === 'en' ? enJson : urJson
  const isRTL = language === 'ur'

  // Load language from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('language') as 'en' | 'ur' | null
    if (saved) setLanguage(saved)
  }, [])

  useEffect(() => {
    if (isAuthenticated) { router.replace('/'); return }
    if (!phone) { router.replace('/phone'); return }
    if (isVerified) { router.replace('/set-pin'); return }
  }, [isAuthenticated, phone, isVerified, router])

  useEffect(() => {
    const code = generateOTP()
    setDemoOtp(code)
  }, [])

  useEffect(() => {
    if (countdown <= 0) return
    const t = setTimeout(() => setCountdown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [countdown])

  const focus = (i: number) => inputs.current[i]?.focus()

  const verify = useCallback((_code: string) => {
    setVerifying(true)
    setTimeout(() => {
      setVerified()
      setSuccess(true)
      setTimeout(() => router.replace('/set-pin'), 1200)
    }, 600)
  }, [setVerified, router])

  const handleChange = (i: number, val: string) => {
    const digit = val.replace(/\D/g, '').slice(-1)
    const next = [...digits]
    next[i] = digit
    setDigits(next)
    setError('')
    if (digit && i < 5) focus(i + 1)
    if (next.every(d => d) && digit) setTimeout(() => verify(next.join('')), 80)
  }

  const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) focus(i - 1)
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (text.length === 6) {
      setDigits(text.split(''))
      setTimeout(() => verify(text), 80)
    }
  }

  const resend = () => {
    const code = generateOTP()
    setDemoOtp(code)
    setDigits(['', '', '', '', '', ''])
    setCountdown(60)
    setError('')
    setTimeout(() => focus(0), 50)
  }

  const filled = digits.every(d => d)
  const handleLanguageChange = (lang: 'en' | 'ur') => {
    setLanguage(lang)
    localStorage.setItem('language', lang)
  }

  return (
    <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center px-4 overflow-hidden relative">

      {/* Ambient Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-20 w-96 h-96 rounded-full blur-[120px]" style={{ background: 'rgba(0,196,180,0.08)' }} />
        <div className="absolute -bottom-40 -left-20 w-96 h-96 rounded-full blur-[120px]" style={{ background: 'rgba(0,196,180,0.05)' }} />
      </div>

      {/* Success Overlay */}
      {success && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center animate-fade-in" style={{ background: 'rgba(11,15,26,0.98)' }}>
          <div className="relative mb-8">
            <div className="absolute inset-0 rounded-full blur-2xl animate-pulse" style={{ background: 'rgba(76,175,80,0.4)', width: '140px', height: '140px', left: '-30px', top: '-30px' }} />
            <div className="w-24 h-24 rounded-full flex items-center justify-center relative z-10" style={{ background: 'linear-gradient(135deg,rgba(76,175,80,0.3) 0%,rgba(76,175,80,0.15) 100%)', border: '2px solid rgba(76,175,80,0.6)' }}>
              <CheckCircle2 size={48} className="text-income" strokeWidth={1.5} />
            </div>
          </div>
          <p className="text-white font-black text-2xl tracking-tight">{translations.messages.success}</p>
          <p className="text-white/40 text-sm mt-2">تصدیق ہو گئی</p>
        </div>
      )}

      {/* Back Button - Top Left */}
      <div className="absolute top-6 left-6 z-10">
        <button onClick={() => router.back()} className="w-10 h-10 rounded-lg bg-white/8 hover:bg-white/12 flex items-center justify-center transition-all active:scale-95">
          <ArrowLeft size={20} className="text-white" strokeWidth={2} />
        </button>
      </div>

      {/* Language Toggle - Top Right */}
      <div className="absolute top-6 right-6 z-10">
        <div className="relative inline-flex gap-0 bg-white/5 border border-white/10 rounded-full p-1 backdrop-blur-sm" style={{ background: 'rgba(255,255,255,0.06)' }}>
          {(['en', 'ur'] as const).map(lang => (
            <button
              key={lang}
              onClick={() => handleLanguageChange(lang)}
              className={cn(
                'px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 relative',
                language === lang ? 'text-navy' : 'text-white/60 hover:text-white/80'
              )}
            >
              {language === lang && (
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-teal to-cyan-400 -z-10 shadow-lg shadow-teal/40" />
              )}
              {lang === 'en' ? 'EN' : 'اردو'}
            </button>
          ))}
        </div>
      </div>

      {/* Centered Container */}
      <div className="relative z-10 w-full max-w-md">

        {/* Heading */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-white mb-3 tracking-tight" style={{ letterSpacing: '-0.02em' }}>
            {isRTL ? 'نمبر کی تصدیق' : 'Verify your number'}
          </h1>
          <p className="text-white/50 text-sm">
            {isRTL ? 'کوڈ بھیجا گیا' : 'Code sent to'}{' '}
            <span className="text-white/75 font-semibold">{maskPhone(phone)}</span>
          </p>
        </div>

        {/* Demo OTP Banner */}
        {demoOtp && (
          <div className="mb-10 px-5 py-4 rounded-xl border transition-all" style={{ background: 'rgba(0,196,180,0.08)', borderColor: 'rgba(0,196,180,0.25)' }}>
            <p className="text-[11px] font-bold uppercase tracking-widest text-teal/70 mb-2">Demo OTP</p>
            <p className="text-3xl font-black text-teal tracking-[0.18em] leading-none font-mono">{demoOtp}</p>
          </div>
        )}

        {/* OTP Input Boxes - Centered, Small */}
        <div className="flex justify-center gap-2.5 mb-8" onPaste={handlePaste}>
          {digits.map((d, i) => (
            <input
              key={i}
              ref={el => { inputs.current[i] = el }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={d}
              onChange={e => handleChange(i, e.target.value)}
              onKeyDown={e => handleKeyDown(i, e)}
              onFocus={e => e.target.select()}
              autoFocus={i === 0}
              className={cn(
                'w-12 h-14 rounded-xl text-center text-xl font-black text-white',
                'border transition-all duration-250 focus:outline-none',
                error
                  ? 'border-red-500/50 bg-red-500/10'
                  : d
                  ? 'border-teal/60 bg-teal/12 shadow-md shadow-teal/20'
                  : 'border-white/20 bg-white/5 focus:border-teal/70 focus:bg-white/8 focus:shadow-lg focus:shadow-teal/30'
              )}
            />
          ))}
        </div>

        {/* Error Message */}
        {error && (
          <p className="text-red-400 text-sm font-medium text-center mb-6">✕ {error}</p>
        )}

        {/* Verify Button */}
        <button
          onClick={() => verify(digits.join(''))}
          disabled={!filled || verifying}
          className={cn(
            'w-full h-12 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-300 relative group overflow-hidden mb-6',
            filled && !verifying
              ? 'text-navy cursor-pointer'
              : 'bg-white/10 text-white/40 cursor-not-allowed'
          )}
        >
          {/* Gradient background */}
          {filled && !verifying && (
            <div className="absolute inset-0 bg-gradient-to-r from-teal to-cyan-400 -z-10 transition-all duration-300 group-hover:shadow-xl group-hover:shadow-teal/50" />
          )}

          {/* Hover glow */}
          {filled && !verifying && (
            <div className="absolute inset-0 -z-10 bg-gradient-to-r from-teal to-cyan-400 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity blur-lg" style={{ boxShadow: '0 0 20px rgba(0,196,180,0.3)' }} />
          )}

          <div className={cn('flex items-center gap-2 transition-transform duration-300', filled && !verifying && 'group-hover:scale-105')}>
            {verifying ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>{translations.common.loading}</span>
              </>
            ) : (
              translations.auth.continue || 'Verify'
            )}
          </div>
        </button>

        {/* Resend Timer */}
        <div className="text-center">
          {countdown > 0 ? (
            <p className="text-white/40 text-sm">
              {isRTL ? 'دوبارہ بھیجیں' : 'Resend in'}{' '}
              <span className="text-white/70 font-semibold tabular-nums">{countdown}s</span>
            </p>
          ) : (
            <button
              onClick={resend}
              className="inline-flex items-center gap-2 text-teal hover:text-cyan-400 font-semibold text-sm transition-colors"
            >
              <RefreshCw size={14} className="transition-transform hover:rotate-180" />
              {isRTL ? 'دوبارہ کوڈ بھیجیں' : 'Resend OTP'}
            </button>
          )}
        </div>

      </div>
    </div>
  )
}
