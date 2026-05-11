'use client'

interface PageToolbarProps {
  children: React.ReactNode
  className?: string
}

export function PageToolbar({ children, className }: PageToolbarProps) {
  return (
    <div className={`flex items-center gap-2 mt-2 ${className ?? ''}`}>
      {children}
    </div>
  )
}
