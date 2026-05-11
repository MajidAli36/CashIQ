'use client'
import { useRouter } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'

interface GradientPageHeaderProps {
  title: string
  titleUr?: string
  showBack?: boolean
  backTo?: string
  onBack?: () => void
  right?: React.ReactNode
  children?: React.ReactNode
}

export function GradientPageHeader({
  title,
  titleUr,
  showBack = true,
  backTo = '/dashboard',
  onBack,
  right,
  children,
}: GradientPageHeaderProps) {
  const router = useRouter()
  const handleBack = () => {
    if (onBack) onBack()
    else router.push(backTo)
  }

  return (
    <div
      className="relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, var(--t-hero-from) 0%, var(--t-hero-mid) 55%, var(--t-hero-to) 100%)',
        borderRadius: '0 0 28px 28px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.22)',
      }}
    >
      {/* Ambient orbs */}
      <div
        className="absolute -top-20 right-0 w-72 h-72 rounded-full blur-[90px] pointer-events-none"
        style={{ background: 'rgba(0,248,180,0.18)' }}
      />
      <div
        className="absolute bottom-0 left-0 w-52 h-52 rounded-full blur-[60px] pointer-events-none"
        style={{ background: 'rgba(0,196,255,0.10)' }}
      />

      <div className="relative z-10 px-4 pt-2 pb-4">
        {/* Nav row */}
        <div className="flex items-center justify-between h-14">
          {showBack ? (
            <button
              onClick={handleBack}
              className="w-9 h-9 rounded-xl flex items-center justify-center -ml-1 transition-all active:scale-95"
              style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.15)' }}
            >
              <ChevronLeft size={20} className="text-white" strokeWidth={2} />
            </button>
          ) : (
            <div className="w-9" />
          )}

          <div className="flex-1 px-3 text-center">
            <h1 className="text-[15px] font-bold tracking-tight leading-tight text-white">
              {title}
              {titleUr && (
                <span className="font-urdu text-[13px] ml-1 opacity-60"> · {titleUr}</span>
              )}
            </h1>
          </div>

          <div className="w-9 flex justify-end">{right ?? null}</div>
        </div>

        {/* Slot for tabs, date pickers, toolbars, etc. */}
        {children}
      </div>
    </div>
  )
}
