'use client'
import { useState, useCallback, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, MicOff, Loader2, X, RotateCcw } from 'lucide-react'
import { useVoiceRecognition } from '@/hooks/useVoiceRecognition'
import { parseVoiceCommand } from './VoiceParser'
import { VoicePreview } from './VoicePreview'
import { useVoiceUIStore } from '@/lib/store/voice-ui.store'
import type { VoiceIntent } from '@/lib/store/voice-prefill.store'

type SheetState = 'idle' | 'listening' | 'processing' | 'preview' | 'error'

const EXAMPLE_PROMPTS = [
  'Add income 500 from Arslan for milk',
  '"Arslan ka 1000 ka udhar diya"',
  'New customer Ali 03001234567',
  'Show today\'s transactions',
]

export function VoiceSheet() {
  const [mounted,      setMounted]      = useState(false)
  const [sheetState,   setSheetState]   = useState<SheetState>('idle')
  const [parsedIntent, setParsedIntent] = useState<VoiceIntent | null>(null)

  const { isOpen, close } = useVoiceUIStore()

  useEffect(() => { setMounted(true) }, [])

  const handleFinal = useCallback(async (text: string) => {
    if (!text.trim()) { setSheetState('idle'); return }
    setSheetState('processing')
    // Small async tick lets the UI render "Processing..." before parsing
    await new Promise(r => setTimeout(r, 120))
    const intent = parseVoiceCommand(text)
    setParsedIntent(intent)
    setSheetState('preview')
  }, [])

  const { transcript, isListening, error, start, stop, reset } = useVoiceRecognition()

  // Reset sheet state whenever the sheet is opened from the store
  useEffect(() => {
    if (isOpen) {
      setSheetState('idle')
      setParsedIntent(null)
      reset()
    }
  }, [isOpen]) // eslint-disable-line react-hooks/exhaustive-deps

  const closeSheet = () => {
    stop()
    reset()
    close()
    setSheetState('idle')
    setParsedIntent(null)
  }

  const startListening = () => {
    setParsedIntent(null)
    setSheetState('listening')
    start(handleFinal)
  }

  const cancelListening = () => {
    stop()
    reset()
    setSheetState('idle')
  }

  // Reflect browser error back into UI
  useEffect(() => {
    if (error) setSheetState('error')
  }, [error])

  if (!mounted) return null

  return (
    <>
      {createPortal(
        <AnimatePresence>
          {isOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                className="fixed inset-0 z-[58] bg-black/50"
                style={{ backdropFilter: 'blur(3px)' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={closeSheet}
              />

              {/* Bottom Sheet */}
              <motion.div
                className="fixed bottom-0 left-0 right-0 z-[59] rounded-t-3xl overflow-hidden"
                style={{
                  background:    'var(--t-card-bg, #0F1923)',
                  boxShadow:     '0 -12px 60px rgba(0,0,0,0.35)',
                  paddingBottom: 'env(safe-area-inset-bottom, 16px)',
                }}
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', stiffness: 360, damping: 34 }}
              >
                {/* Handle */}
                <div className="flex justify-center pt-3 pb-1">
                  <div className="w-10 h-1 rounded-full" style={{ background: 'var(--t-border, rgba(255,255,255,0.12))' }} />
                </div>

                {/* Header */}
                <div className="flex items-center justify-between px-5 py-3">
                  <div>
                    <p className="text-base font-black" style={{ color: 'var(--t-white, #fff)' }}>
                      Voice Assistant
                    </p>
                    <p className="text-xs" style={{ color: 'var(--t-muted, #64748B)' }}>
                      English · اردو · Roman Urdu
                    </p>
                  </div>
                  <button
                    onClick={closeSheet}
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ background: 'rgba(255,255,255,0.08)' }}
                  >
                    <X size={16} style={{ color: 'var(--t-muted, #94A3B8)' }} />
                  </button>
                </div>

                <div className="px-5 pb-5 space-y-4">

                  {/* ── IDLE ── */}
                  {sheetState === 'idle' && (
                    <div className="space-y-4">
                      {/* Big mic button */}
                      <div className="flex flex-col items-center gap-3 py-4">
                        <motion.button
                          onClick={startListening}
                          className="w-20 h-20 rounded-full flex items-center justify-center"
                          style={{
                            background: 'linear-gradient(135deg, #00F8B4 0%, #00C4FF 100%)',
                            boxShadow:  '0 8px 32px rgba(0,196,255,0.40)',
                          }}
                          whileHover={{ scale: 1.07 }}
                          whileTap={{ scale: 0.93 }}
                          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                        >
                          <Mic size={32} color="#fff" strokeWidth={2} />
                        </motion.button>
                        <p className="text-sm font-semibold" style={{ color: 'var(--t-muted, #64748B)' }}>
                          Tap to speak
                        </p>
                      </div>

                      {/* Example prompts */}
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest mb-2"
                          style={{ color: 'var(--t-muted, #64748B)' }}>
                          Try saying
                        </p>
                        <div className="space-y-1.5">
                          {EXAMPLE_PROMPTS.map(p => (
                            <div key={p} className="flex items-center gap-2 px-3 py-2 rounded-xl"
                              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                              <Mic size={11} style={{ color: '#00C4B4', flexShrink: 0 }} />
                              <span className="text-xs italic" style={{ color: 'var(--t-muted, #94A3B8)' }}>{p}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ── LISTENING ── */}
                  {sheetState === 'listening' && (
                    <div className="flex flex-col items-center gap-4 py-4">
                      {/* Waveform bars */}
                      <div className="flex items-end gap-1 h-14">
                        {[0.4, 0.7, 1, 0.6, 0.9, 0.5, 0.8, 1, 0.4, 0.7].map((scale, i) => (
                          <motion.div
                            key={i}
                            className="w-1.5 rounded-full"
                            style={{ background: 'linear-gradient(to top, #00C4B4, #00C4FF)', minHeight: 4 }}
                            animate={{ height: ['8px', `${scale * 52}px`, '8px'] }}
                            transition={{
                              duration:   0.6 + i * 0.05,
                              repeat:     Infinity,
                              ease:       'easeInOut',
                              delay:      i * 0.07,
                            }}
                          />
                        ))}
                      </div>

                      <p className="text-base font-bold" style={{ color: 'var(--t-white, #fff)' }}>
                        🎤 Listening…
                      </p>

                      {/* Live transcript */}
                      {transcript && (
                        <p className="text-sm text-center px-2" style={{ color: 'var(--t-muted, #94A3B8)' }}>
                          {transcript}
                        </p>
                      )}

                      <button
                        onClick={cancelListening}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
                        style={{ background: 'rgba(255,92,92,0.12)', color: '#FF5C5C' }}
                      >
                        <MicOff size={14} />
                        Cancel
                      </button>
                    </div>
                  )}

                  {/* ── PROCESSING ── */}
                  {sheetState === 'processing' && (
                    <div className="flex flex-col items-center gap-3 py-8">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                      >
                        <Loader2 size={36} style={{ color: '#00C4B4' }} />
                      </motion.div>
                      <p className="text-sm font-semibold" style={{ color: 'var(--t-muted, #94A3B8)' }}>
                        Understanding your request…
                      </p>
                      {transcript && (
                        <p className="text-xs text-center italic px-4" style={{ color: 'var(--t-muted, #64748B)' }}>
                          "{transcript}"
                        </p>
                      )}
                    </div>
                  )}

                  {/* ── PREVIEW ── */}
                  {sheetState === 'preview' && parsedIntent && (
                    <div className="space-y-3">
                      {transcript && (
                        <p className="text-xs italic text-center" style={{ color: 'var(--t-muted, #64748B)' }}>
                          "{transcript}"
                        </p>
                      )}
                      <VoicePreview intent={parsedIntent} onClose={closeSheet} />
                      <button
                        onClick={() => { reset(); setSheetState('idle') }}
                        className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-semibold"
                        style={{ color: 'var(--t-muted, #64748B)' }}
                      >
                        <RotateCcw size={12} />
                        Try again
                      </button>
                    </div>
                  )}

                  {/* ── ERROR ── */}
                  {sheetState === 'error' && (
                    <div className="space-y-4 py-2">
                      <div className="flex flex-col items-center gap-2 py-4">
                        <div className="w-14 h-14 rounded-full flex items-center justify-center"
                          style={{ background: 'rgba(255,92,92,0.12)' }}>
                          <MicOff size={26} style={{ color: '#FF5C5C' }} />
                        </div>
                        <p className="text-sm font-semibold text-center px-4" style={{ color: '#FF5C5C' }}>
                          {error}
                        </p>
                      </div>
                      <button
                        onClick={() => { reset(); setSheetState('idle') }}
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm"
                        style={{ background: 'rgba(0,196,180,0.10)', color: '#00C4B4' }}
                      >
                        <RotateCcw size={15} />
                        Try Again
                      </button>
                    </div>
                  )}

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
