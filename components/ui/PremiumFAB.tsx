'use client'
import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, Plus, ArrowRightLeft, BarChart2, Lock, X } from 'lucide-react'
import { useVoiceUIStore } from '@/lib/store/voice-ui.store'

interface MenuItem {
  icon:    React.ElementType
  label:   string
  color:   string
  type?:   'voice'
  href?:   string
}

const MENU_ITEMS: MenuItem[] = [
  { icon: Mic,            label: 'Voice Entry',  color: '#00C4FF',  type: 'voice' },
  { icon: Plus,           label: 'Add Entry',    color: '#4CAF50',  href: '/add' },
  { icon: ArrowRightLeft, label: 'Transfer',     color: '#00C4B4',  href: '/add?type=transfer' },
  { icon: BarChart2,      label: 'Summary',      color: '#7C3AED',  href: '/reports' },
  { icon: Lock,           label: 'Daily Close',  color: '#F59E0B',  href: '/close' },
]

export function PremiumFAB() {
  const [fabOpen, setFabOpen] = useState(false)
  const openVoice = useVoiceUIStore(s => s.open)

  const toggle = () => setFabOpen(v => !v)
  const close  = () => setFabOpen(false)

  const handleVoice = () => {
    close()
    openVoice()
  }

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {fabOpen && (
          <motion.div
            className="fixed inset-0 z-[53]"
            style={{ background: 'rgba(0,0,0,0.50)', backdropFilter: 'blur(4px)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={close}
          />
        )}
      </AnimatePresence>

      {/* Menu items */}
      <AnimatePresence>
        {fabOpen && MENU_ITEMS.map((item, i) => {
          const Icon      = item.icon
          const bottomPos = 88 + (MENU_ITEMS.length - i) * 68
          const isVoice   = item.type === 'voice'
          const delay     = (MENU_ITEMS.length - 1 - i) * 0.055

          const content = (
            <motion.div
              className="flex items-center gap-3 justify-end"
              initial={{ opacity: 0, x: 28, scale: 0.80 }}
              animate={{ opacity: 1, x: 0,  scale: 1    }}
              exit={{    opacity: 0, x: 28, scale: 0.80 }}
              transition={{ delay, type: 'spring', stiffness: 400, damping: 28 }}
            >
              {/* ── Label pill ── */}
              <motion.div
                className="px-3.5 py-2 rounded-2xl"
                style={isVoice ? {
                  background:     'linear-gradient(135deg, rgba(0,248,180,0.18) 0%, rgba(0,196,255,0.18) 100%)',
                  border:         '1px solid rgba(0,248,180,0.35)',
                  backdropFilter: 'blur(12px)',
                } : {
                  background:     'rgba(11,15,26,0.92)',
                  border:         '1px solid rgba(255,255,255,0.10)',
                  backdropFilter: 'blur(8px)',
                }}
                whileHover={{ scale: 1.04 }}
              >
                <p
                  className="text-[12px] font-black whitespace-nowrap tracking-wide"
                  style={{ color: isVoice ? '#00F8B4' : '#fff' }}
                >
                  {item.label}
                </p>
              </motion.div>

              {/* ── Icon bubble ── */}
              {isVoice ? (
                /* Voice Entry — larger bubble + pulse ring */
                <div className="relative flex items-center justify-center flex-shrink-0">
                  {/* Pulse rings */}
                  <motion.div
                    className="absolute rounded-full"
                    style={{ width: 60, height: 60, background: 'rgba(0,248,180,0.18)' }}
                    animate={{ scale: [1, 1.45, 1], opacity: [0.6, 0, 0.6] }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                  />
                  <motion.div
                    className="absolute rounded-full"
                    style={{ width: 60, height: 60, background: 'rgba(0,196,255,0.12)' }}
                    animate={{ scale: [1, 1.75, 1], opacity: [0.4, 0, 0.4] }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
                  />
                  {/* Main bubble */}
                  <motion.div
                    className="w-[56px] h-[56px] rounded-full flex items-center justify-center relative z-10"
                    style={{
                      background: 'linear-gradient(135deg, #00F8B4 0%, #00C4FF 100%)',
                      boxShadow:  '0 0 0 3px rgba(0,248,180,0.25), 0 6px 28px rgba(0,196,255,0.55)',
                    }}
                    whileHover={{ scale: 1.12 }}
                    whileTap={  { scale: 0.90 }}
                    transition={{ type: 'spring', stiffness: 460, damping: 22 }}
                  >
                    <Mic size={26} color="#0B0F1A" strokeWidth={2.8} />
                  </motion.div>
                </div>
              ) : (
                /* Regular items */
                <motion.div
                  className="w-[46px] h-[46px] rounded-full flex items-center justify-center flex-shrink-0"
                  style={{
                    background: `${item.color}1E`,
                    border:     `1.5px solid ${item.color}50`,
                    boxShadow:  `0 4px 16px ${item.color}30`,
                  }}
                  whileHover={{ scale: 1.10 }}
                  whileTap={  { scale: 0.92 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 26 }}
                >
                  <Icon size={20} color={item.color} strokeWidth={2.2} />
                </motion.div>
              )}
            </motion.div>
          )

          return (
            <div
              key={item.label}
              className="fixed z-[54]"
              style={{ bottom: bottomPos, right: 18 }}
            >
              {isVoice
                ? <button onClick={handleVoice}>{content}</button>
                : <Link href={item.href!} onClick={close}>{content}</Link>
              }
            </div>
          )
        })}
      </AnimatePresence>

      {/* ── Main FAB ── */}
      <div className="fixed z-[55]" style={{ bottom: '88px', right: '18px' }}>
        {/* Breathing glow ring — only when closed */}
        {!fabOpen && (
          <motion.div
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{ background: 'linear-gradient(135deg, #00F8B4, #00C4FF)' }}
            animate={{ scale: [1, 1.40, 1], opacity: [0.30, 0, 0.30] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}

        <motion.button
          onClick={toggle}
          aria-label="Quick actions"
          className="relative flex items-center justify-center rounded-full"
          style={{
            width:      '60px',
            height:     '60px',
            background: 'linear-gradient(135deg, #00F8B4 0%, #00C4FF 100%)',
            boxShadow: fabOpen
              ? '0 0 0 6px rgba(0,248,180,0.15), 0 0 0 14px rgba(0,196,255,0.07), 0 8px 32px rgba(0,196,255,0.55)'
              : '0 4px 24px rgba(0,196,255,0.50), 0 2px 8px rgba(0,0,0,0.22)',
          }}
          whileHover={{ scale: 1.08 }}
          whileTap={  { scale: 0.90 }}
          transition={{ type: 'spring', stiffness: 420, damping: 22 }}
        >
          <motion.div
            animate={{ rotate: fabOpen ? 135 : 0 }}
            transition={{ type: 'spring', stiffness: 520, damping: 30 }}
          >
            {fabOpen
              ? <X   size={26} color="#0B0F1A" strokeWidth={3.0} />
              : <Mic size={28} color="#0B0F1A" strokeWidth={2.6} />
            }
          </motion.div>
        </motion.button>
      </div>
    </>
  )
}
