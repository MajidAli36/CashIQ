'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { cn } from '@/lib/utils/cn'
import { ReactNode } from 'react'

interface QuickAction {
  href: string
  icon: ReactNode
  label: string
  labelUr: string
  accent: string
  bg: string
}

interface PremiumQuickActionsProps {
  actions: QuickAction[]
}

export function PremiumQuickActions({ actions }: PremiumQuickActionsProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
    },
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-3 gap-3"
    >
      {actions.map((action, i) => (
        <motion.div key={action.href} variants={itemVariants}>
          <Link href={action.href}>
            <motion.div
              whileHover={{ scale: 1.05, y: -4 }}
              whileTap={{ scale: 0.98 }}
              className={cn(
                'rounded-2xl p-4 border border-white/10 transition-all duration-300',
                'flex flex-col items-center justify-center text-center gap-2',
                'hover:border-white/20 hover:shadow-lg'
              )}
              style={{
                background: action.bg,
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              }}
            >
              {/* Icon with bounce animation */}
              <motion.div
                whileHover={{ rotate: 12, scale: 1.1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="text-2xl"
              >
                {action.icon}
              </motion.div>

              {/* Label */}
              <div>
                <p className="text-xs font-bold text-white leading-tight">{action.label}</p>
                <p className="font-urdu text-[10px] text-white/60">{action.labelUr}</p>
              </div>
            </motion.div>
          </Link>
        </motion.div>
      ))}
    </motion.div>
  )
}
