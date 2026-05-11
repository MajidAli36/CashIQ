'use client'
import { useRouter } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface PageHeaderProps {
  title: string
  titleUr?: string
  showBack?: boolean
  backTo?: string          // explicit route; defaults to '/dashboard'
  onBack?: () => void      // overrides backTo when provided
  right?: React.ReactNode
  dark?: boolean
  transparent?: boolean
  className?: string
}

export function PageHeader({ title, titleUr, showBack = true, backTo = '/dashboard', onBack, right, dark, transparent, className }: PageHeaderProps) {
  const router = useRouter()
  const handleBack = () => {
    if (onBack) onBack()
    else router.push(backTo)
  }

  return (
    <div className={cn(
      'flex items-center justify-between px-4 h-14 relative',
      dark && !transparent ? 'bg-navy' : '',
      transparent ? 'bg-transparent' : !dark ? 'bg-card border-b border-border' : '',
      className
    )}>
      {showBack && (
        <button onClick={handleBack}
          className={cn(
            'w-9 h-9 rounded-xl flex items-center justify-center -ml-1 transition-all active:scale-95',
            dark || transparent ? 'bg-white/12 hover:bg-white/18' : 'bg-surface border border-border'
          )}>
          <ChevronLeft size={20} className={dark || transparent ? 'text-white' : 'text-navy'} strokeWidth={2} />
        </button>
      )}
      {!showBack && <div className="w-9" />}

      <div className="flex-1 px-3 text-center">
        <h1 className={cn(
          'text-[15px] font-bold tracking-tight leading-tight',
          dark || transparent ? 'text-white' : 'text-navy'
        )}>
          {title}
          {titleUr && <span className={cn('font-urdu text-[13px] ml-1', dark || transparent ? 'opacity-60' : 'text-muted opacity-80')}> · {titleUr}</span>}
        </h1>
      </div>

      <div className="w-9 flex justify-end">{right || null}</div>
    </div>
  )
}
