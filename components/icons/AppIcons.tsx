'use client'

export type IconProps = {
  size?: number
  className?: string
}

/* ─────────────────────────────────────────────
   Money In  ·  arrow down into wallet  (green)
───────────────────────────────────────────── */
export function MoneyInIcon({ size = 24, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id="mi-fill" x1="3" y1="12" x2="21" y2="21" gradientUnits="userSpaceOnUse">
          <stop stopColor="#4CAF50" stopOpacity="0.14" />
          <stop offset="1" stopColor="#388E3C" stopOpacity="0.06" />
        </linearGradient>
        <linearGradient id="mi-stroke" x1="3" y1="12" x2="21" y2="21" gradientUnits="userSpaceOnUse">
          <stop stopColor="#4CAF50" />
          <stop offset="1" stopColor="#388E3C" />
        </linearGradient>
      </defs>
      {/* Wallet body */}
      <rect x="3" y="12" width="18" height="9" rx="2.5" fill="url(#mi-fill)" stroke="url(#mi-stroke)" strokeWidth="1.75" />
      {/* Divider */}
      <path d="M3 15.5h18" stroke="#4CAF50" strokeWidth="1.5" strokeLinecap="round" />
      {/* Coin pocket */}
      <rect x="15.5" y="17" width="4" height="2.5" rx="1" fill="rgba(76,175,80,0.35)" />
      {/* Arrow shaft (down = money IN) */}
      <path d="M12 3v9" stroke="#4CAF50" strokeWidth="2" strokeLinecap="round" />
      {/* Arrowhead */}
      <path d="M9.5 9L12 12L14.5 9" stroke="#4CAF50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/* ─────────────────────────────────────────────
   Money Out  ·  arrow up from wallet  (red)
───────────────────────────────────────────── */
export function MoneyOutIcon({ size = 24, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id="mo-fill" x1="3" y1="12" x2="21" y2="21" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FF5C5C" stopOpacity="0.14" />
          <stop offset="1" stopColor="#D32F2F" stopOpacity="0.06" />
        </linearGradient>
        <linearGradient id="mo-stroke" x1="3" y1="12" x2="21" y2="21" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FF5C5C" />
          <stop offset="1" stopColor="#D32F2F" />
        </linearGradient>
      </defs>
      {/* Wallet body */}
      <rect x="3" y="12" width="18" height="9" rx="2.5" fill="url(#mo-fill)" stroke="url(#mo-stroke)" strokeWidth="1.75" />
      {/* Divider */}
      <path d="M3 15.5h18" stroke="#FF5C5C" strokeWidth="1.5" strokeLinecap="round" />
      {/* Coin pocket */}
      <rect x="15.5" y="17" width="4" height="2.5" rx="1" fill="rgba(255,92,92,0.35)" />
      {/* Arrow shaft (up = money OUT) */}
      <path d="M12 12V3" stroke="#FF5C5C" strokeWidth="2" strokeLinecap="round" />
      {/* Arrowhead */}
      <path d="M9.5 6L12 3L14.5 6" stroke="#FF5C5C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/* ─────────────────────────────────────────────
   Transfer  ·  two-way arrows in circle  (teal)
───────────────────────────────────────────── */
export function TransferIcon({ size = 24, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Background circle */}
      <circle cx="12" cy="12" r="9.25" fill="rgba(0,196,180,0.07)" stroke="rgba(0,196,180,0.22)" strokeWidth="1.5" />
      {/* Right arrow (top row) */}
      <path d="M7 10h10" stroke="#00C4B4" strokeWidth="1.75" strokeLinecap="round" />
      <path d="M14.5 7.5L17 10L14.5 12.5" stroke="#00C4B4" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
      {/* Left arrow (bottom row) */}
      <path d="M17 14H7" stroke="#00C4B4" strokeWidth="1.75" strokeLinecap="round" />
      <path d="M9.5 11.5L7 14L9.5 16.5" stroke="#00C4B4" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/* ─────────────────────────────────────────────
   Loan  ·  coin with bidirectional arrows  (amber)
───────────────────────────────────────────── */
export function LoanIcon({ size = 24, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id="loan-fill" x1="7.5" y1="4.5" x2="16.5" y2="13.5" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F59E0B" stopOpacity="0.22" />
          <stop offset="1" stopColor="#B45309" stopOpacity="0.08" />
        </linearGradient>
      </defs>
      {/* Coin */}
      <circle cx="12" cy="9" r="4.5" fill="url(#loan-fill)" stroke="#F59E0B" strokeWidth="1.75" />
      {/* Coin cross mark (Rs. simplified) */}
      <path d="M12 7v4M10.5 9h3" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" />
      {/* Bidirectional arrow – give & receive */}
      <path d="M7 19h10" stroke="#F59E0B" strokeWidth="1.75" strokeLinecap="round" />
      <path d="M9.5 17L7 19L9.5 21" stroke="#F59E0B" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14.5 17L17 19L14.5 21" stroke="#F59E0B" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/* ─────────────────────────────────────────────
   Wallet  ·  bifold wallet with card slot  (teal)
───────────────────────────────────────────── */
export function WalletIcon({ size = 24, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id="w-fill" x1="2" y1="5" x2="22" y2="20" gradientUnits="userSpaceOnUse">
          <stop stopColor="#00C4B4" stopOpacity="0.12" />
          <stop offset="1" stopColor="#00A89A" stopOpacity="0.04" />
        </linearGradient>
      </defs>
      {/* Main body */}
      <rect x="2" y="6" width="20" height="14" rx="3" fill="url(#w-fill)" stroke="#00C4B4" strokeWidth="1.75" />
      {/* Top flap strap */}
      <path d="M6 6V4.5A1.5 1.5 0 0 1 7.5 3h9A1.5 1.5 0 0 1 18 4.5V6" stroke="#00C4B4" strokeWidth="1.5" strokeLinecap="round" />
      {/* Interior divider line */}
      <path d="M2 11h20" stroke="#00C4B4" strokeWidth="1.5" strokeLinecap="round" />
      {/* Card pocket */}
      <rect x="14" y="13" width="6" height="5" rx="1.5" fill="rgba(0,196,180,0.22)" stroke="#00C4B4" strokeWidth="1.25" />
      {/* Pocket coin indicator */}
      <circle cx="17" cy="15.5" r="1.1" fill="#00C4B4" fillOpacity="0.55" />
    </svg>
  )
}

/* ─────────────────────────────────────────────
   Bank  ·  pillared building  (navy)
───────────────────────────────────────────── */
export function BankIcon({ size = 24, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id="bank-fill" x1="2.5" y1="3.5" x2="21.5" y2="21" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0B0F1A" stopOpacity="0.12" />
          <stop offset="1" stopColor="#1a2235" stopOpacity="0.06" />
        </linearGradient>
      </defs>
      {/* Pediment / roof */}
      <path d="M2.5 9.5L12 3.5L21.5 9.5H2.5Z" fill="url(#bank-fill)" stroke="#0B0F1A" strokeWidth="1.75" strokeLinejoin="round" />
      {/* Three columns */}
      <rect x="4.5"  y="9.5" width="2.5" height="8.5" rx="0.75" fill="rgba(11,15,26,0.10)" stroke="#0B0F1A" strokeWidth="1.5" />
      <rect x="10.75" y="9.5" width="2.5" height="8.5" rx="0.75" fill="rgba(11,15,26,0.10)" stroke="#0B0F1A" strokeWidth="1.5" />
      <rect x="17"   y="9.5" width="2.5" height="8.5" rx="0.75" fill="rgba(11,15,26,0.10)" stroke="#0B0F1A" strokeWidth="1.5" />
      {/* Base platform */}
      <rect x="2.5" y="18" width="19" height="2.5" rx="0.75" fill="rgba(11,15,26,0.13)" stroke="#0B0F1A" strokeWidth="1.5" />
    </svg>
  )
}

/* ─────────────────────────────────────────────
   Invoice  ·  document with currency lines  (teal)
───────────────────────────────────────────── */
export function InvoiceIcon({ size = 24, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id="inv-fill" x1="4" y1="2" x2="20" y2="22" gradientUnits="userSpaceOnUse">
          <stop stopColor="#00C4B4" stopOpacity="0.12" />
          <stop offset="1" stopColor="#00A89A" stopOpacity="0.04" />
        </linearGradient>
      </defs>
      {/* Document body with dog-ear corner */}
      <path d="M5 2h10l4 4v16a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1Z"
        fill="url(#inv-fill)" stroke="#00C4B4" strokeWidth="1.75" strokeLinejoin="round" />
      {/* Dog-ear fold */}
      <path d="M15 2v4h4" stroke="#00C4B4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      {/* Content lines */}
      <path d="M8 10h8"   stroke="#00C4B4" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M8 13h5"   stroke="#00C4B4" strokeWidth="1.5" strokeLinecap="round" />
      {/* Rs. currency symbol (R + strikethrough) */}
      <path d="M8 17h5M8 19h3.5" stroke="#00C4B4" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M9.5 16.5v3" stroke="#00C4B4" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

/* ─────────────────────────────────────────────
   Reports  ·  rising bar chart  (green)
───────────────────────────────────────────── */
export function ReportsIcon({ size = 24, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Y-axis */}
      <path d="M4 3.5V20.5" stroke="#4CAF50" strokeWidth="1.75" strokeLinecap="round" />
      {/* X-axis */}
      <path d="M4 20.5h16.5" stroke="#4CAF50" strokeWidth="1.75" strokeLinecap="round" />
      {/* Bar 1 — short */}
      <rect x="6"    y="15.5" width="3"   height="5" rx="1"
        fill="rgba(76,175,80,0.20)" stroke="#4CAF50" strokeWidth="1.5" />
      {/* Bar 2 — medium */}
      <rect x="10.5" y="11.5" width="3"   height="9" rx="1"
        fill="rgba(76,175,80,0.33)" stroke="#4CAF50" strokeWidth="1.5" />
      {/* Bar 3 — tall */}
      <rect x="15"   y="7.5"  width="3"   height="13" rx="1"
        fill="rgba(76,175,80,0.48)" stroke="#4CAF50" strokeWidth="1.5" />
      {/* Trend dashed line connecting bar tops */}
      <path d="M7.5 15.5L12 11.5L16.5 7.5"
        stroke="#4CAF50" strokeWidth="1.25" strokeLinecap="round"
        strokeDasharray="1.5 1.5" />
      {/* Trend arrowhead */}
      <path d="M14.5 7L16.5 7.5L16 9.5"
        stroke="#4CAF50" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/* ─────────────────────────────────────────────
   Settings  ·  6-tooth gear  (slate)
───────────────────────────────────────────── */
export function SettingsIcon({ size = 24, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Gear body (Heroicons cog outline adapted) */}
      <path
        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066
           c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572
           c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573
           c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065
           c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066
           c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572
           c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573
           c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
        fill="rgba(100,116,139,0.09)"
        stroke="#64748B"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      {/* Center hub */}
      <circle cx="12" cy="12" r="3"
        fill="rgba(100,116,139,0.18)"
        stroke="#64748B"
        strokeWidth="1.75"
      />
    </svg>
  )
}

/* ─────────────────────────────────────────────
   Add  ·  premium rounded-square plus  (teal)
───────────────────────────────────────────── */
export function AddIcon({ size = 24, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id="add-fill" x1="2.5" y1="2.5" x2="21.5" y2="21.5" gradientUnits="userSpaceOnUse">
          <stop stopColor="#00C4B4" stopOpacity="0.18" />
          <stop offset="1" stopColor="#00A89A" stopOpacity="0.08" />
        </linearGradient>
        <linearGradient id="add-stroke" x1="2.5" y1="2.5" x2="21.5" y2="21.5" gradientUnits="userSpaceOnUse">
          <stop stopColor="#00C4B4" />
          <stop offset="1" stopColor="#00A89A" />
        </linearGradient>
      </defs>
      {/* Rounded square */}
      <rect x="2.5" y="2.5" width="19" height="19" rx="6"
        fill="url(#add-fill)"
        stroke="url(#add-stroke)"
        strokeWidth="1.75"
      />
      {/* Plus cross */}
      <path d="M12 7.5v9M7.5 12h9"
        stroke="#00C4B4"
        strokeWidth="2.25"
        strokeLinecap="round"
      />
    </svg>
  )
}
