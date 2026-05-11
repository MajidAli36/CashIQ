import type { Wallet } from '../types'

// Fixed IDs only for the very first (default) business — migration preserves them.
// New businesses created via initBusinessDefaults get nanoid() IDs.
export const DEFAULT_WALLETS: Omit<Wallet, 'created_at' | 'business_id'>[] = [
  {
    id: 'cash',
    name: 'Cash',
    name_ur: 'نقد',
    color: '#1a1a2e',
    icon: '💵',
    type: 'cash',
    is_enabled: true,
    is_default: true,
    sort_order: 0,
  },
  {
    id: 'bank',
    name: 'Bank',
    name_ur: 'بینک',
    color: '#00C4B4',
    icon: '🏦',
    type: 'bank',
    is_enabled: true,
    is_default: false,
    sort_order: 1,
  },
  {
    id: 'jazzcash',
    name: 'JazzCash',
    name_ur: 'جاز کیش',
    color: '#C8102E',
    icon: '📱',
    type: 'jazzcash',
    is_enabled: false,
    is_default: false,
    sort_order: 2,
  },
  {
    id: 'easypaisa',
    name: 'EasyPaisa',
    name_ur: 'ایزی پیسہ',
    color: '#3a7a28',
    icon: '💚',
    type: 'easypaisa',
    is_enabled: false,
    is_default: false,
    sort_order: 3,
  },
]
