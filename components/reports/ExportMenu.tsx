'use client'
import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Download, ChevronDown } from 'lucide-react'

interface Props {
  onCSV:   () => void
  onExcel: () => void
  onPDF:   () => Promise<void> | void
  count?:  number
}

const OPTS = [
  { id: 'csv',   label: 'CSV',   hint: 'Opens in Excel'   },
  { id: 'excel', label: 'Excel', hint: '.xls spreadsheet' },
  { id: 'pdf',   label: 'PDF',   hint: 'Print-ready'      },
] as const

export function ExportMenu({ onCSV, onExcel, onPDF, count }: Props) {
  const [open,    setOpen]    = useState(false)
  const [loading, setLoading] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  async function handle(fn: () => Promise<void> | void) {
    setOpen(false)
    setLoading(true)
    try { await fn() } finally { setLoading(false) }
  }

  function actionFor(id: typeof OPTS[number]['id']) {
    if (id === 'csv')   return () => handle(onCSV)
    if (id === 'excel') return () => handle(onExcel)
    return () => handle(onPDF)
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(v => !v)}
        disabled={loading}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all active:scale-95 disabled:opacity-50"
        style={{ background: 'var(--t-accent)', color: '#0B0F1A' }}>
        <Download size={11} />
        {loading ? 'Preparing…' : `Export${count != null ? ` (${count})` : ''}`}
        {!loading && (
          <ChevronDown size={9} className={`transition-transform duration-150 ${open ? 'rotate-180' : ''}`} />
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0,  scale: 1    }}
            exit={{   opacity: 0, y: -6, scale: 0.96 }}
            transition={{ duration: 0.12 }}
            className="absolute right-0 top-full mt-2 z-50 w-40 rounded-2xl shadow-2xl overflow-hidden"
            style={{ background: 'var(--t-card-bg)', border: '1px solid var(--t-card-border)' }}>
            {OPTS.map(({ id, label, hint }, i) => (
              <button key={id}
                onClick={actionFor(id)}
                className="w-full px-4 py-3 text-left hover:bg-white/5 transition-colors"
                style={i < OPTS.length - 1 ? { borderBottom: '1px solid var(--t-card-border)' } : {}}>
                <p className="text-xs font-bold" style={{ color: 'var(--t-text)' }}>{label}</p>
                <p className="text-[10px] mt-0.5" style={{ color: 'var(--t-muted)' }}>{hint}</p>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
