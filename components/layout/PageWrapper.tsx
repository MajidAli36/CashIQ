import { cn } from '@/lib/utils/cn'

interface PageWrapperProps {
  children: React.ReactNode
  className?: string
  noPadding?: boolean
}

export function PageWrapper({ children, className, noPadding }: PageWrapperProps) {
  return (
    <main className={cn(
      'min-h-screen bg-surface pb-20',
      !noPadding && 'px-4',
      className
    )}>
      {children}
    </main>
  )
}
