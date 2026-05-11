export type ThemeId =
  | 'dark-pro'
  | 'light-clean'
  | 'black-gold'
  | 'soft-pastel'
  | 'business-blue'
  | 'green-finance'
  | 'warm-beige'
  | 'high-contrast'
  | 'neon-modern'
  | 'minimal-gray'

export interface AppTheme {
  id: ThemeId
  name: string
  nameUr: string
  description: string
  isDark: boolean
  preview: {
    heroFrom: string
    heroTo: string
    accent: string
    pageBg: string
    cardBg: string
    cardBorder: string
    text: string
    muted: string
  }
}

export const THEMES: AppTheme[] = [
  {
    id: 'dark-pro',
    name: 'Dark Pro',
    nameUr: 'ڈارک پرو',
    description: 'Navy blue with teal accent — default',
    isDark: false,
    preview: {
      heroFrom: '#0B0F1A', heroTo: '#0d1a2e',
      accent: '#00C4B4', pageBg: '#F8FAFC',
      cardBg: '#FFFFFF', cardBorder: '#E2E8F0',
      text: '#0B0F1A', muted: '#64748B',
    },
  },
  {
    id: 'light-clean',
    name: 'Light Clean',
    nameUr: 'لائٹ کلین',
    description: 'Crisp white with sky blue',
    isDark: false,
    preview: {
      heroFrom: '#1E40AF', heroTo: '#2563EB',
      accent: '#3B82F6', pageBg: '#EFF6FF',
      cardBg: '#FFFFFF', cardBorder: '#BFDBFE',
      text: '#1E3A8A', muted: '#64748B',
    },
  },
  {
    id: 'black-gold',
    name: 'Elegant Black Gold',
    nameUr: 'بلیک گولڈ',
    description: 'Luxury dark with gold accent',
    isDark: true,
    preview: {
      heroFrom: '#1A1200', heroTo: '#0D0900',
      accent: '#D4AF37', pageBg: '#111110',
      cardBg: '#1C1C18', cardBorder: '#2A2A20',
      text: '#F5F0DC', muted: '#A8A090',
    },
  },
  {
    id: 'soft-pastel',
    name: 'Soft Pastel',
    nameUr: 'سافٹ پاسٹل',
    description: 'Gentle purples and pinks',
    isDark: false,
    preview: {
      heroFrom: '#7C6FAE', heroTo: '#9B8DD0',
      accent: '#EC8FAC', pageBg: '#FFF5FB',
      cardBg: '#FFFFFF', cardBorder: '#F0E6F6',
      text: '#4A3B5C', muted: '#8B7BA8',
    },
  },
  {
    id: 'business-blue',
    name: 'Business Blue',
    nameUr: 'بزنس بلیو',
    description: 'Corporate deep blue',
    isDark: false,
    preview: {
      heroFrom: '#0F2454', heroTo: '#1A3A8A',
      accent: '#1565C0', pageBg: '#F0F4FA',
      cardBg: '#FFFFFF', cardBorder: '#C5D4E8',
      text: '#0F2454', muted: '#546E8A',
    },
  },
  {
    id: 'green-finance',
    name: 'Green Finance',
    nameUr: 'گرین فنانس',
    description: 'Forest green prosperity',
    isDark: false,
    preview: {
      heroFrom: '#1B4332', heroTo: '#1B5E3E',
      accent: '#16A34A', pageBg: '#F0FDF4',
      cardBg: '#FFFFFF', cardBorder: '#BBF7D0',
      text: '#14532D', muted: '#6B8A72',
    },
  },
  {
    id: 'warm-beige',
    name: 'Warm Beige',
    nameUr: 'گرم بیج',
    description: 'Earthy tones for local shops',
    isDark: false,
    preview: {
      heroFrom: '#5C3D2E', heroTo: '#8B6353',
      accent: '#C97D4E', pageBg: '#FFF8F0',
      cardBg: '#FFFBF5', cardBorder: '#E8D5C0',
      text: '#3D1F0D', muted: '#7D6151',
    },
  },
  {
    id: 'high-contrast',
    name: 'High Contrast',
    nameUr: 'ہائی کانٹراسٹ',
    description: 'Maximum readability for all ages',
    isDark: false,
    preview: {
      heroFrom: '#000000', heroTo: '#141414',
      accent: '#0000CC', pageBg: '#FFFFFF',
      cardBg: '#FFFFFF', cardBorder: '#000000',
      text: '#000000', muted: '#222222',
    },
  },
  {
    id: 'neon-modern',
    name: 'Neon Modern',
    nameUr: 'نیون موڈرن',
    description: 'Dark background with neon green',
    isDark: true,
    preview: {
      heroFrom: '#0D0221', heroTo: '#1A0433',
      accent: '#00FF88', pageBg: '#080810',
      cardBg: '#10101E', cardBorder: '#1E1E35',
      text: '#E8E8FF', muted: '#9090B8',
    },
  },
  {
    id: 'minimal-gray',
    name: 'Minimal Gray',
    nameUr: 'مینیمل گرے',
    description: 'Clean neutral monochrome',
    isDark: false,
    preview: {
      heroFrom: '#374151', heroTo: '#4B5563',
      accent: '#4B5563', pageBg: '#F9FAFB',
      cardBg: '#FFFFFF', cardBorder: '#E5E7EB',
      text: '#111827', muted: '#6B7280',
    },
  },
]

export const DEFAULT_THEME_ID: ThemeId = 'dark-pro'

export function getTheme(id: ThemeId): AppTheme {
  return THEMES.find(t => t.id === id) ?? THEMES[0]
}
