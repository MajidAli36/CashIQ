'use client'
import { Delete } from 'lucide-react'

interface AmountInputProps {
  value: string
  onChange: (v: string) => void
  label?: string
}

function formatWithCommas(n: string): string {
  if (!n) return ''
  const num = parseInt(n.replace(/,/g, ''))
  if (isNaN(num)) return ''
  return num.toLocaleString('en-PK')
}

export function AmountInput({ value, onChange, label }: AmountInputProps) {
  const handleKey = (k: string) => {
    if (k === '⌫') {
      const raw = value.replace(/,/g, '')
      onChange(raw.length <= 1 ? '' : formatWithCommas(raw.slice(0, -1)))
    } else {
      const raw = (value.replace(/,/g, '') + k).slice(0, 9)
      onChange(formatWithCommas(raw))
    }
  }

  const numpad = ['1','2','3','4','5','6','7','8','9','000','0','⌫']

  return (
    <div className="flex flex-col items-center">
      {label && <p className="text-xs text-muted mb-2">{label}</p>}
      <div className="flex items-end gap-2 mb-6">
        <span className="text-2xl font-bold text-muted pb-1">Rs.</span>
        <span className="text-5xl font-bold text-navy min-w-[120px] text-center">{value || '0'}</span>
      </div>
      <div className="grid grid-cols-3 gap-2 w-full">
        {numpad.map(k => (
          <button key={k} onClick={() => handleKey(k)}
            className="h-14 bg-white border border-border rounded-xl text-lg font-semibold text-navy active:bg-surface">
            {k === '⌫' ? <Delete size={20} className="mx-auto" /> : k}
          </button>
        ))}
      </div>
    </div>
  )
}
