'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuthStore } from '@/lib/store/auth.store'
import { useSettingsStore } from '@/lib/store/settings.store'
import { useTransactionStore } from '@/lib/store/transaction.store'
import { BUSINESS_TYPES } from '@/lib/config/business-types.config'
import { format } from 'date-fns'
import { ChevronRight, ArrowRight, Check, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

const detailsSchema = z.object({
  name: z.string().min(1),
  owner_name: z.string().min(1),
  phone: z.string().min(11),
  city: z.string().min(1),
})
type DetailsForm = z.infer<typeof detailsSchema>

const STEP_COUNT = 4

export default function OnboardingPage() {
  const router = useRouter()
  const { isVerified, isAuthenticated, unlock } = useAuthStore()
  const { isOnboarded, updateShop, completeOnboarding, wallets } = useSettingsStore()
  const addTransaction = useTransactionStore(s => s.addTransaction)
  const [isReady, setIsReady] = useState(false)
  const [isHydrated, setIsHydrated] = useState(false)
  const [step, setStep] = useState(1)
  const [selectedBusiness, setSelectedBusiness] = useState('')
  const [balances, setBalances] = useState({ cash: '', bank: '' })

  // Hydration check: wait for stores to load from localStorage
  useEffect(() => {
    setIsHydrated(true)
  }, [])

  // Auth guard: redirect if not verified or already onboarded
  useEffect(() => {
    if (!isHydrated) return

    if (!isVerified) {
      router.replace('/phone')
      return
    }
    if (isOnboarded) {
      router.replace('/dashboard')
      return
    }
    setIsReady(true)
  }, [isHydrated, isVerified, isOnboarded, router])

  const { register, handleSubmit, formState: { errors } } = useForm<DetailsForm>({
    resolver: zodResolver(detailsSchema)
  })

  const onDetails = (data: DetailsForm) => {
    updateShop({ ...data, business_type: selectedBusiness as any })
    setStep(4)
  }

  const finish = () => {
    const today = format(new Date(), 'yyyy-MM-dd')
    const time = format(new Date(), 'HH:mm')
    // Find cash and bank wallets by type (works with any wallet ID)
    const cashWallet = wallets.find(w => w.type === 'cash')
    const bankWallet = wallets.find(w => w.type === 'bank')
    const openingWallets = [
      { wallet: cashWallet, key: 'cash', label: 'Cash' },
      { wallet: bankWallet, key: 'bank', label: 'Bank' },
    ]
    openingWallets.forEach(({ wallet, key, label }) => {
      if (!wallet) return
      const amt = parseFloat((balances as any)[key] || '0')
      if (amt > 0) {
        addTransaction({
          type: 'opening_balance',
          category_id: 'opening',
          amount: amt,
          wallet_id: wallet.id,
          date: today,
          time,
          is_reversed: false,
          created_by: 'owner',
          note_en: `Opening balance - ${label}`,
        })
      }
    })
    completeOnboarding()
    unlock()
    router.replace('/dashboard')
  }

  // Show nothing while hydrating and checking auth (prevents flash)
  if (!isHydrated || !isReady) {
    return null
  }

  return (
    <div className="min-h-screen bg-navy flex flex-col overflow-hidden">
      {/* Ambient background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-80 h-80 bg-teal/10 rounded-full blur-[100px]" />
        <div className="absolute -bottom-40 -left-20 w-72 h-72 bg-teal/5 rounded-full blur-[80px]" />
      </div>

      {/* Progress bar */}
      <div className="relative z-10 px-6 pt-14 pb-4">
        <div className="flex items-center gap-2">
          {Array.from({ length: STEP_COUNT }, (_, i) => (
            <div key={i} className={cn(
              'h-1 rounded-full transition-all duration-500',
              i < step ? 'bg-teal flex-[2]' : i === step - 1 ? 'bg-teal flex-[2]' : 'bg-white/10 flex-1'
            )} />
          ))}
        </div>
        <p className="text-white/40 text-xs mt-3 font-medium">Step {step} of {STEP_COUNT}</p>
      </div>

      {/* STEP 1 — Welcome */}
      {step === 1 && (
        <div className="relative z-10 flex flex-col flex-1 px-6 pt-6 pb-10">
          <div className="flex-1 flex flex-col justify-center">
            <div className="w-16 h-16 rounded-[20px] bg-teal/15 border border-teal/20 flex items-center justify-center mb-8">
              <Sparkles size={28} className="text-teal" />
            </div>
            <h1 className="text-4xl font-black text-white tracking-tight leading-tight mb-3">
              Welcome to<br />
              <span className="text-gradient-teal">CashIQ</span>
            </h1>
            <p className="text-white/50 text-base leading-relaxed mb-2">روز کیش میں خوش آمدید</p>
            <p className="text-white/40 text-sm leading-relaxed">
              The smartest way to track your daily business income, expenses, and loans.
            </p>
          </div>
          <button onClick={() => setStep(2)}
            className="btn-teal w-full h-14 flex items-center justify-center gap-3 text-base font-bold">
            Get Started
            <ArrowRight size={20} strokeWidth={2.5} />
          </button>
        </div>
      )}

      {/* STEP 2 — Business Type */}
      {step === 2 && (
        <div className="relative z-10 flex flex-col flex-1 px-6 pt-4 pb-10">
          <h2 className="text-2xl font-black text-white tracking-tight mb-1">Your Business</h2>
          <p className="text-white/40 text-sm mb-6 font-urdu">آپ کا کاروبار کیا ہے؟</p>
          <div className="grid grid-cols-2 gap-3 mb-6 flex-1">
            {BUSINESS_TYPES.map(bt => (
              <button key={bt.id} onClick={() => setSelectedBusiness(bt.id)}
                className={cn(
                  'flex flex-col items-start p-4 rounded-2xl border transition-all duration-200 text-left',
                  selectedBusiness === bt.id
                    ? 'border-teal bg-teal/10 shadow-teal-glow'
                    : 'border-white/8 bg-white/5 hover:bg-white/8'
                )}>
                <div className={cn(
                  'w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-3',
                  selectedBusiness === bt.id ? 'bg-teal/20' : 'bg-white/8'
                )}>
                  {bt.icon}
                </div>
                <p className="text-sm font-bold text-white leading-tight">{bt.name_en}</p>
                <p className="font-urdu text-[11px] text-white/40 mt-0.5">{bt.name_ur}</p>
                {selectedBusiness === bt.id && (
                  <div className="absolute top-3 right-3 w-5 h-5 bg-teal rounded-full flex items-center justify-center">
                    <Check size={11} className="text-navy" strokeWidth={3} />
                  </div>
                )}
              </button>
            ))}
          </div>
          <button disabled={!selectedBusiness} onClick={() => setStep(3)}
            className={cn('w-full h-14 rounded-2xl font-bold text-base transition-all',
              selectedBusiness ? 'btn-teal' : 'bg-white/10 text-white/30 cursor-not-allowed')}>
            Continue
          </button>
        </div>
      )}

      {/* STEP 3 — Shop Details */}
      {step === 3 && (
        <form onSubmit={handleSubmit(onDetails)} className="relative z-10 flex flex-col flex-1 px-6 pt-4 pb-10">
          <h2 className="text-2xl font-black text-white tracking-tight mb-1">Shop Details</h2>
          <p className="text-white/40 text-sm mb-6 font-urdu">دکان کی معلومات</p>
          <div className="space-y-5 flex-1">
            {[
              { field: 'name' as const,       label: 'Shop Name',   labelUr: 'دکان کا نام',   placeholder: 'Ali Mobile Shop' },
              { field: 'owner_name' as const,  label: 'Owner Name',  labelUr: 'مالک کا نام',   placeholder: 'Muhammad Ali' },
              { field: 'phone' as const,       label: 'Phone',       labelUr: 'فون',           placeholder: '03XX-XXXXXXX' },
              { field: 'city' as const,        label: 'City',        labelUr: 'شہر',           placeholder: 'Gujranwala' },
            ].map(({ field, label, labelUr, placeholder }) => (
              <div key={field}>
                <label className="flex items-center gap-2 text-xs font-semibold text-white/50 mb-2.5 uppercase tracking-wider">
                  {label} <span className="font-urdu normal-case text-white/30">· {labelUr}</span>
                </label>
                <div className={cn(
                  'flex items-center rounded-xl overflow-hidden transition-all duration-300 relative group',
                  errors[field]
                    ? 'bg-red-500/10 border border-red-500/40'
                    : 'bg-white/5 border border-white/15 focus-within:border-teal/70 focus-within:bg-white/8'
                )}>
                  {/* Glow effect on focus */}
                  {!errors[field] && (
                    <div className="absolute inset-0 rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none" style={{ boxShadow: 'inset 0 0 15px rgba(0,196,180,0.12)' }} />
                  )}
                  <input
                    {...register(field)}
                    placeholder={placeholder}
                    className={cn(
                      'flex-1 h-12 bg-transparent text-white text-sm font-medium placeholder:text-white/25 focus:outline-none px-4 relative z-10 transition-colors',
                      errors[field] ? 'text-red-400' : ''
                    )}
                  />
                </div>
                {errors[field] && <p className="text-red-400 text-xs mt-2 font-medium">✕ Required</p>}
              </div>
            ))}
          </div>
          <button type="submit" className="btn-teal w-full h-14 text-base font-bold mt-6">Continue</button>
        </form>
      )}

      {/* STEP 4 — Opening Balance */}
      {step === 4 && (
        <div className="relative z-10 flex flex-col flex-1 px-6 pt-4 pb-10">
          <h2 className="text-2xl font-black text-white tracking-tight mb-1">Current Balance</h2>
          <p className="text-white/40 text-sm mb-6 font-urdu">ابھی آپ کے پاس کتنا پیسہ ہے؟</p>
          <div className="space-y-4 flex-1">
            {[
              { id: 'cash', label: 'Cash',  labelUr: 'نقد',  color: 'border-white/20',    dot: 'bg-white' },
              { id: 'bank', label: 'Bank',  labelUr: 'بینک', color: 'border-teal/40',      dot: 'bg-teal' },
            ].map(w => (
              <div key={w.id} className={cn('bg-white/5 border rounded-2xl px-4 py-4 flex items-center gap-3', w.color)}>
                <div className={cn('w-2.5 h-2.5 rounded-full flex-shrink-0', w.dot)} />
                <div className="flex-1">
                  <p className="text-xs font-semibold text-white/50 mb-0.5">{w.label} <span className="font-urdu">· {w.labelUr}</span></p>
                  <div className="flex items-center gap-2">
                    <span className="text-white/40 text-sm">Rs.</span>
                    <input
                      type="number"
                      value={(balances as any)[w.id]}
                      onChange={e => setBalances(prev => ({ ...prev, [w.id]: e.target.value }))}
                      placeholder="0"
                      className="flex-1 bg-transparent text-white text-lg font-bold focus:outline-none placeholder:text-white/20"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button onClick={finish} className="btn-teal w-full h-14 text-base font-bold mt-6 flex items-center justify-center gap-2">
            <Check size={20} strokeWidth={2.5} />
            Start Using CashIQ
          </button>
        </div>
      )}
    </div>
  )
}
