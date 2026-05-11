'use client'
import { useState, useEffect, useCallback } from 'react'
import { cn } from '@/lib/utils/cn'
import { Sparkles, User, Banknote, Wallet, CreditCard, Building2, Package, TrendingUp, TrendingDown, Lock, Zap, Shield, ChevronLeft, ChevronRight } from 'lucide-react'

const SLIDES = [
  {
    type: 'founder',
    content: {
      quote: "We built CashIQ to give you full control and transparency over your money.",
      name: "Majid Ali",
      title: "Founder & CEO",
    }
  },
  {
    type: 'moneyflow',
    content: {
      flows: [
        { icon: Banknote, label: 'Bank', amount: 120000, type: 'income', color: '#3B82F6' },
        { icon: Wallet, label: 'Cash', amount: 8500, type: 'expense', color: '#EF4444' },
        { icon: CreditCard, label: 'Cheque', amount: 25000, type: 'income', color: '#8B5CF6' },
      ],
      subtext: "Track every rupee across all channels"
    }
  },
  {
    type: 'business',
    content: {
      businesses: [
        { name: 'Mobile Shop', type: 'Retail', color: '#3B82F6' },
        { name: 'Garments', type: 'Wholesale', color: '#8B5CF6' },
      ],
      inventory: { items: 120, alerts: 3 },
      subtext: "Manage multiple businesses in one place"
    }
  },
  {
    type: 'transactions',
    content: {
      transactions: [
        { amount: 25000, label: 'Client Payment', time: '2 min ago', type: 'income' },
        { amount: 8500, label: 'Expense', time: '15 min ago', type: 'expense' },
      ]
    }
  },
  {
    type: 'features',
    content: {
      features: [
        { icon: Lock, label: 'Secure', desc: 'Bank-level security' },
        { icon: Zap, label: 'Instant', desc: 'Fast verification' },
        { icon: Shield, label: 'Private', desc: 'No data misuse' },
      ]
    }
  },
]

function formatAmount(amount: number) {
  return new Intl.NumberFormat('en-PK').format(amount)
}

export function LeftSlider() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  // Auto-play with robust loop
  useEffect(() => {
    if (isPaused) return

    const slideLength = SLIDES.length
    
    const timer = setInterval(() => {
      setCurrentSlide(prev => {
        const next = prev + 1
        // Reset to 0 when reaching the last slide (index 4)
        if (next >= slideLength) {
          return 0
        }
        return next
      })
    }, 4000)

    return () => clearInterval(timer)
  }, [isPaused])

  const nextSlide = useCallback(() => {
    setCurrentSlide(prev => (prev + 1) % SLIDES.length)
  }, [])

  const prevSlide = useCallback(() => {
    setCurrentSlide(prev => (prev - 1 + SLIDES.length) % SLIDES.length)
  }, [])

  const renderSlide = (slide: typeof SLIDES[0], idx: number) => {
    const isActive = idx === currentSlide

    if (slide.type === 'founder') {
      return (
        <div className={cn(
          'absolute inset-0 flex flex-col items-center justify-center p-6 transition-all duration-500',
          isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        )}>
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#00F8B4] to-[#00C4FF] flex items-center justify-center mb-6 shadow-xl shadow-[#00F8B4]/20">
              <User size={40} className="text-white" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-lg">
              <Sparkles size={14} className="text-[#00F8B4]" />
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-navy/5 max-w-sm">
            <blockquote className="text-center">
              <p className="text-navy/80 text-base font-medium leading-relaxed mb-4">
                "{slide.content.quote}"
              </p>
              <cite className="not-italic">
                <p className="font-bold text-navy">{slide.content.name}</p>
                <p className="text-sm text-navy/50">{slide.content.title}</p>
              </cite>
            </blockquote>
          </div>
          <div className="mt-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-navy/5">
            <Sparkles size={12} className="text-[#00F8B4]" />
            <span className="text-xs font-medium text-navy/70">Powered by SyncOps</span>
          </div>
        </div>
      )
    }

    if (slide.type === 'moneyflow' && slide.content.flows) {
      return (
        <div className={cn(
          'absolute inset-0 flex flex-col items-center justify-center p-6 transition-all duration-500',
          isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        )}>
          <div className="flex items-center justify-center gap-6 mb-6">
            {slide.content.flows.map((flow, i) => (
              <div 
                key={i} 
                className="group relative bg-white rounded-2xl p-5 shadow-lg border border-navy/5 hover:shadow-xl hover:scale-105 transition-all duration-300"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className={cn(
                  'w-14 h-14 rounded-2xl flex items-center justify-center mb-3 shadow-md',
                  flow.type === 'income' ? 'bg-emerald-50' : 'bg-rose-50'
                )}>
                  <flow.icon size={26} className={flow.type === 'income' ? 'text-emerald-600' : 'text-rose-600'} />
                </div>
                <span className="text-xs font-semibold text-navy/60 block mb-1">{flow.label}</span>
                <span className={cn(
                  'text-lg font-black',
                  flow.type === 'income' ? 'text-emerald-600' : 'text-rose-600'
                )}>
                  {flow.type === 'income' ? '+' : '-'}Rs. {formatAmount(flow.amount)}
                </span>
              </div>
            ))}
          </div>
          <p className="text-sm text-navy/50 font-medium">{slide.content.subtext}</p>
        </div>
      )
    }

    if (slide.type === 'business' && slide.content.businesses && slide.content.inventory) {
      return (
        <div className={cn(
          'absolute inset-0 flex flex-col items-center justify-center p-6 transition-all duration-500',
          isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        )}>
          <div className="flex gap-4 mb-6">
            {slide.content.businesses.map((biz, i) => (
              <div 
                key={i} 
                className="group bg-white rounded-2xl p-5 shadow-lg border border-navy/5 hover:shadow-xl hover:scale-105 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-3 shadow-md" style={{ background: biz.color }}>
                  <Building2 size={20} className="text-white" />
                </div>
                <p className="font-bold text-navy text-sm">{biz.name}</p>
                <p className="text-xs text-navy/50">{biz.type}</p>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-navy/5 mb-4">
            <div className="flex items-center gap-2">
              <Package size={18} className="text-navy/60" />
              <span className="text-sm font-semibold text-navy">{slide.content.inventory.items} items in stock</span>
            </div>
            <div className="w-px h-4 bg-navy/20" />
            <span className="text-xs font-bold text-rose-600">{slide.content.inventory.alerts} low stock alerts</span>
          </div>
          <p className="text-sm text-navy/50 font-medium">{slide.content.subtext}</p>
        </div>
      )
    }

    if (slide.type === 'transactions' && slide.content.transactions) {
      return (
        <div className={cn(
          'absolute inset-0 flex flex-col items-center justify-center p-6 transition-all duration-500',
          isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        )}>
          <div className="w-full max-w-sm space-y-3">
            {slide.content.transactions.map((tx, i) => (
              <div 
                key={i} 
                className="flex items-center justify-between p-4 rounded-2xl bg-white shadow-md border border-navy/5 hover:shadow-lg hover:scale-[1.02] transition-all duration-300"
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    'w-12 h-12 rounded-xl flex items-center justify-center',
                    tx.type === 'income' ? 'bg-emerald-50' : 'bg-rose-50'
                  )}>
                    {tx.type === 'income' 
                      ? <TrendingUp size={22} className="text-emerald-600" />
                      : <TrendingDown size={22} className="text-rose-600" />
                    }
                  </div>
                  <div>
                    <p className="font-bold text-navy text-sm">{tx.label}</p>
                    <p className="text-xs text-navy/50">{tx.time}</p>
                  </div>
                </div>
                <span className={cn(
                  'text-lg font-black',
                  tx.type === 'income' ? 'text-emerald-600' : 'text-rose-600'
                )}>
                  {tx.type === 'income' ? '+' : '-'}Rs. {formatAmount(tx.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )
    }

    if (slide.type === 'features' && slide.content.features) {
      return (
        <div className={cn(
          'absolute inset-0 flex flex-col items-center justify-center p-6 transition-all duration-500',
          isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        )}>
          <div className="grid grid-cols-3 gap-4">
            {slide.content.features.map((feature, i) => (
              <div 
                key={i} 
                className="flex flex-col items-center text-center p-5 bg-white rounded-2xl shadow-lg border border-navy/5 hover:shadow-xl hover:scale-105 transition-all duration-300"
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#00F8B4]/10 to-[#00C4FF]/10 flex items-center justify-center mb-3 border border-[#00F8B4]/20 shadow-md">
                  <feature.icon size={28} className="text-[#00F8B4]" />
                </div>
                <p className="font-bold text-navy mb-1">{feature.label}</p>
                <p className="text-xs text-navy/50">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )
    }

    return null
  }

  return (
    <div 
      className="relative w-full max-w-md h-72 mx-auto"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {SLIDES.map((slide, idx) => renderSlide(slide, idx))}

      {/* Slider Controls */}
      <div className="absolute -bottom-14 left-1/2 -translate-x-1/2 flex items-center gap-3">
        <button 
          onClick={prevSlide}
          className="w-9 h-9 rounded-full bg-navy/5 hover:bg-navy/10 flex items-center justify-center transition-all duration-200 hover:scale-110"
        >
          <ChevronLeft size={18} className="text-navy/60" />
        </button>
        
        <div className="flex gap-2">
          {SLIDES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={cn(
                'h-2 rounded-full transition-all duration-300',
                idx === currentSlide 
                  ? 'w-8 bg-gradient-to-r from-[#00F8B4] to-[#00C4FF] shadow-lg shadow-[#00F8B4]/30' 
                  : 'w-2 bg-navy/20 hover:bg-navy/40'
              )}
            />
          ))}
        </div>

        <button 
          onClick={nextSlide}
          className="w-9 h-9 rounded-full bg-navy/5 hover:bg-navy/10 flex items-center justify-center transition-all duration-200 hover:scale-110"
        >
          <ChevronRight size={18} className="text-navy/60" />
        </button>
      </div>
    </div>
  )
}
