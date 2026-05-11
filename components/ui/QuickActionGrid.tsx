'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { cn } from '@/lib/utils/cn'

interface QuickAction {
  href: string
  icon: React.ReactNode
  label: string
  labelUr: string
  accent: string
  bg: string
}

interface QuickActionGridProps {
  actions: QuickAction[]
}

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05 } },
}

const itemVariants = {
  hidden: { opacity: 0, scale: 0.92, y: 6 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } },
}

export function QuickActionGrid({ actions }: QuickActionGridProps) {
  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--t-muted)' }}>
        Quick Actions · فوری کام
      </p>
      <motion.div
        className="grid grid-cols-3 gap-3"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {actions.map(action => (
          <motion.div key={action.href} variants={itemVariants}>
            <Link href={action.href}>
              <motion.div
                className={cn(
                  'flex flex-col items-start p-3.5 min-h-[88px] rounded-2xl border cursor-pointer select-none',
                )}
                style={{
                  background: 'var(--t-card-bg)',
                  borderColor: 'var(--t-card-border)',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.06)',
                }}
                whileHover={{
                  scale: 1.03,
                  boxShadow: `0 4px 20px ${action.accent}28, 0 1px 3px rgba(0,0,0,0.06)`,
                  borderColor: `${action.accent}40`,
                }}
                whileTap={{ scale: 0.96 }}
                transition={{ duration: 0.15 }}
              >
                {/* Icon bubble */}
                <motion.div
                  className="w-10 h-10 rounded-[12px] flex items-center justify-center mb-2.5 flex-shrink-0"
                  style={{ background: action.bg }}
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.15 }}
                >
                  {action.icon}
                </motion.div>
                <p className="text-[12px] font-bold leading-tight" style={{ color: 'var(--t-text)' }}>
                  {action.label}
                </p>
                <p className="font-urdu text-[10px] mt-0.5" style={{ color: 'var(--t-muted)' }}>
                  {action.labelUr}
                </p>
              </motion.div>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}
