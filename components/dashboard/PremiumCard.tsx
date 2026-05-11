'use client'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils/cn'
import { ReactNode } from 'react'

interface PremiumCardProps {
  children: ReactNode
  className?: string
  hover?: boolean
  glowColor?: string
  delay?: number
}

export function PremiumCard({
  children,
  className,
  hover = true,
  glowColor = 'rgba(0,196,180,0.2)',
  delay = 0,
}: PremiumCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      whileHover={hover ? { scale: 1.02, y: -2 } : {}}
      className={cn(
        'rounded-2xl border backdrop-blur-sm transition-all duration-300',
        'bg-[#0f172a] border-white/10',
        hover && 'hover:border-white/20 hover:shadow-xl cursor-pointer',
        className
      )}
      style={hover ? {
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      } : {
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      }}
    >
      {children}
    </motion.div>
  )
}
