import Link from 'next/link'
import { Plus } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface FABProps {
  href?: string
  onClick?: () => void
  color?: string
  className?: string
}

export function FAB({ href, onClick, color = 'bg-navy', className }: FABProps) {
  const cls = cn('w-14 h-14 rounded-full flex items-center justify-center shadow-lg', color, className)
  if (href) return (
    <Link href={href} className={cn('fixed bottom-24 right-4', cls)}>
      <Plus size={24} className="text-white" />
    </Link>
  )
  return (
    <button onClick={onClick} className={cn('fixed bottom-24 right-4', cls)}>
      <Plus size={24} className="text-white" />
    </button>
  )
}
