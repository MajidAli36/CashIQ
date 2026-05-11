'use client'
import { Mic } from 'lucide-react'
import { motion } from 'framer-motion'

interface VoiceButtonProps {
  onClick: () => void
  isListening?: boolean
}

export function VoiceButton({ onClick, isListening = false }: VoiceButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      aria-label="Voice assistant"
      className="fixed z-[55] flex items-center justify-center rounded-full shadow-2xl"
      style={{
        bottom:  isListening ? '88px' : '88px',
        right:   '18px',
        width:   '52px',
        height:  '52px',
        background: 'linear-gradient(135deg, #00F8B4 0%, #00C4FF 100%)',
        boxShadow: isListening
          ? '0 0 0 6px rgba(0,248,180,0.20), 0 8px 28px rgba(0,196,255,0.40)'
          : '0 6px 24px rgba(0,196,255,0.35)',
      }}
      whileHover={{ scale: 1.10 }}
      whileTap={{ scale: 0.92 }}
      transition={{ type: 'spring', stiffness: 400, damping: 22 }}
    >
      {/* Pulse ring when listening */}
      {isListening && (
        <motion.span
          className="absolute inset-0 rounded-full"
          style={{ border: '2px solid rgba(0,248,180,0.5)' }}
          animate={{ scale: [1, 1.6], opacity: [0.6, 0] }}
          transition={{ repeat: Infinity, duration: 1.1, ease: 'easeOut' }}
        />
      )}
      <Mic size={22} color="#fff" strokeWidth={2.5} />
    </motion.button>
  )
}
