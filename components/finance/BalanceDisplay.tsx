'use client'
import { formatAmount } from '@/lib/utils/currency'
import { formatDate } from '@/lib/utils/date'

/* ─── StatPill ─────────────────────────────────────────────────────────── */
interface StatPillProps {
  label: string
  value: number
  hex: string
}
export function StatPill({ label, value, hex }: StatPillProps) {
  return (
    <div
      className="flex-shrink-0 flex flex-col rounded-xl px-2.5 py-1.5"
      style={{
        background: `${hex}10`,
        border:     `1px solid ${hex}22`,
      }}>
      <p
        className="text-[8px] font-bold uppercase tracking-[0.12em] leading-none mb-0.5"
        style={{ color: `${hex}88` }}>
        {label}
      </p>
      <p
        className="text-[11px] font-black leading-none tabular-nums"
        style={{ color: hex }}>
        {formatAmount(value)}
      </p>
    </div>
  )
}

/* ─── HeaderBalance ─ normal pages ─────────────────────────────────────── */
interface HeaderBalanceProps {
  totalBalance: number
  cashBalance:  number
  bankBalance:  number
  today:        string
}
export function HeaderBalance({ totalBalance, cashBalance, bankBalance, today }: HeaderBalanceProps) {
  return (
    <>
      <p
        className="text-[9px] font-bold uppercase tracking-[0.15em] mb-2"
        style={{ color: 'rgba(255,255,255,0.38)' }}>
        Total Balance
      </p>
      <div className="flex items-end gap-1.5 mb-1">
        <span className="text-white/35 text-sm font-semibold pb-0.5">Rs.</span>
        <span className="text-[28px] font-black text-white leading-none tracking-tight">
          {formatAmount(totalBalance)}
        </span>
      </div>
      <p className="text-[10px] mb-3" style={{ color: 'rgba(255,255,255,0.22)' }}>
        {formatDate(today)}
      </p>
      <div className="flex gap-2 flex-wrap">
        <StatPill label="Cash" value={cashBalance} hex="#00E87A" />
        <StatPill label="Bank" value={bankBalance} hex="#4F9EFF" />
      </div>
    </>
  )
}

/* ─── HeaderWealth ─ inventory pages ───────────────────────────────────── */
interface HeaderWealthProps {
  totalWealth:    number
  cashBalance:    number
  bankBalance:    number
  inventoryValue: number
  today:          string
}
export function HeaderWealth({ totalWealth, cashBalance, bankBalance, inventoryValue, today }: HeaderWealthProps) {
  const BREAKDOWN = [
    { label: 'Cash',      value: cashBalance,    hex: '#00E87A' },
    { label: 'Bank',      value: bankBalance,    hex: '#4F9EFF' },
    { label: 'Inventory', value: inventoryValue, hex: '#A78BFA' },
  ]

  return (
    <>
      {/* Label + tooltip trigger */}
      <div className="flex items-center justify-between mb-2">
        <p
          className="text-[9px] font-bold uppercase tracking-[0.15em]"
          style={{ color: 'rgba(255,255,255,0.38)' }}>
          Total Wealth
        </p>

        {/* hover tooltip */}
        <div className="group relative">
          <div
            className="w-[18px] h-[18px] rounded-full flex items-center justify-center cursor-default select-none"
            style={{ background: 'rgba(167,139,250,0.16)', border: '1px solid rgba(167,139,250,0.28)' }}>
            <span className="text-[9px] font-bold" style={{ color: 'rgba(167,139,250,0.80)' }}>i</span>
          </div>

          <div
            className="absolute right-0 top-6 w-44 rounded-2xl p-3 z-50 pointer-events-none
                        opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            style={{
              background:  'rgba(10,12,22,0.97)',
              border:      '1px solid rgba(255,255,255,0.10)',
              boxShadow:   '0 12px 32px rgba(0,0,0,0.50)',
              backdropFilter: 'blur(16px)',
            }}>
            <p
              className="text-[8px] font-bold uppercase tracking-[0.14em] mb-2.5"
              style={{ color: 'rgba(255,255,255,0.30)' }}>
              Breakdown
            </p>
            <div className="space-y-2">
              {BREAKDOWN.map(row => (
                <div key={row.label} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5">
                    <div
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ background: row.hex }} />
                    <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.45)' }}>
                      {row.label}
                    </span>
                  </div>
                  <span
                    className="text-[10px] font-black tabular-nums"
                    style={{ color: row.hex }}>
                    Rs.&nbsp;{formatAmount(row.value)}
                  </span>
                </div>
              ))}
              <div
                className="pt-2 mt-0.5 flex items-center justify-between gap-3"
                style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                <span className="text-[9px] font-bold" style={{ color: 'rgba(255,255,255,0.30)' }}>
                  Total
                </span>
                <span className="text-[11px] font-black text-white tabular-nums">
                  Rs.&nbsp;{formatAmount(totalWealth)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Amount */}
      <div className="flex items-end gap-1.5 mb-1">
        <span className="text-white/35 text-sm font-semibold pb-0.5">Rs.</span>
        <span className="text-[28px] font-black text-white leading-none tracking-tight">
          {formatAmount(totalWealth)}
        </span>
      </div>

      {/* subtitle */}
      <p className="text-[9px] font-semibold mb-2.5" style={{ color: 'rgba(167,139,250,0.65)' }}>
        ✦ Includes inventory value
      </p>
      <p className="text-[10px] mb-3" style={{ color: 'rgba(255,255,255,0.22)' }}>
        {formatDate(today)}
      </p>

      {/* pills */}
      <div className="flex gap-1.5 flex-wrap">
        <StatPill label="Cash"      value={cashBalance}    hex="#00E87A" />
        <StatPill label="Bank"      value={bankBalance}    hex="#4F9EFF" />
        <StatPill label="Inventory" value={inventoryValue} hex="#A78BFA" />
      </div>
    </>
  )
}
