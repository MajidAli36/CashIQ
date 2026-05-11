'use client'
import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Palette, X, Check } from 'lucide-react'
import { useThemeStore } from '@/lib/store/theme.store'
import { THEMES } from '@/lib/config/themes.config'

export function ThemeSwitcher() {
  const { themeId, setTheme } = useThemeStore()
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-9 h-9 rounded-xl flex items-center justify-center border transition-all active:scale-95 hover:brightness-110"
        style={{
          background: 'rgba(255,255,255,0.15)',
          borderColor: 'rgba(255,255,255,0.2)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
        }}
        title="Change theme"
      >
        <Palette size={16} className="text-white" strokeWidth={2} />
      </button>

      {mounted && createPortal(
        <AnimatePresence>
          {open && (
            <>
              {/* Backdrop */}
              <motion.div
                key="theme-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
                className="fixed inset-0 z-[9998] bg-black/70 backdrop-blur-sm"
                onClick={() => setOpen(false)}
              />

              {/* Modal */}
              <motion.div
                key="theme-modal"
                initial={{ opacity: 0, scale: 0.94, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.94, y: 10 }}
                transition={{ type: 'spring', damping: 30, stiffness: 350 }}
                className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none"
              >
                <div
                  className="w-full max-w-sm pointer-events-auto rounded-2xl overflow-hidden"
                  style={{
                    background: 'rgba(11, 15, 26, 0.97)',
                    border: '1px solid rgba(255,255,255,0.09)',
                    boxShadow: '0 30px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(0,196,180,0.06)',
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Header */}
                  <div className="flex items-center justify-between px-5 pt-5 pb-4"
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <div>
                      <p className="text-[16px] font-black text-white">Theme</p>
                      <p className="font-urdu text-[11px] text-white/35 mt-0.5">تھیم منتخب کریں</p>
                    </div>
                    <button
                      onClick={() => setOpen(false)}
                      className="w-8 h-8 rounded-xl flex items-center justify-center transition-all active:scale-90"
                      style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.08)' }}
                    >
                      <X size={14} className="text-white/50" />
                    </button>
                  </div>

                  {/* Theme grid */}
                  <div className="grid grid-cols-2 gap-2.5 p-4">
                    {THEMES.map(t => {
                      const isActive = t.id === themeId
                      return (
                        <motion.button
                          key={t.id}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => { setTheme(t.id); setOpen(false) }}
                          className="relative flex items-center gap-3 p-3 rounded-xl text-left transition-all"
                          style={{
                            background: isActive
                              ? `linear-gradient(135deg, ${t.preview.heroFrom}50, ${t.preview.heroTo}30)`
                              : 'rgba(255,255,255,0.04)',
                            border: isActive
                              ? `1.5px solid ${t.preview.accent}70`
                              : '1px solid rgba(255,255,255,0.07)',
                          }}
                        >
                          <div
                            className="w-9 h-9 rounded-xl flex-shrink-0 overflow-hidden"
                            style={{
                              background: `linear-gradient(135deg, ${t.preview.heroFrom}, ${t.preview.heroTo})`,
                              border: `1.5px solid ${t.preview.accent}50`,
                            }}
                          >
                            <div className="w-full h-full flex items-end">
                              <div className="h-[45%] w-full" style={{ background: t.preview.accent, opacity: 0.75 }} />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[12px] font-bold text-white truncate">{t.name}</p>
                            <p className="font-urdu text-[10px] text-white/35 truncate mt-0.5">{t.nameUr}</p>
                          </div>
                          {isActive && (
                            <div
                              className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                              style={{ background: t.preview.accent }}
                            >
                              <Check size={10} className="text-white" strokeWidth={3} />
                            </div>
                          )}
                        </motion.button>
                      )
                    })}
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  )
}
