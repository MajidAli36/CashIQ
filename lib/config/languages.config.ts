export interface LanguageOption {
  code: string
  name: string
  nativeName: string
  flag: string
  enabled: boolean
  rtl: boolean
  region: string
}

/* ─────────────────────────────────────────────────────────────────
   Add new languages here. Set enabled: true when translation file
   is ready and the useTranslation hook supports the code.
───────────────────────────────────────────────────────────────── */
export const ALL_LANGUAGES: LanguageOption[] = [
  // ── Active ──────────────────────────────────────────────────────
  { code: 'en', name: 'English',    nativeName: 'English',          flag: '🇺🇸', enabled: true,  rtl: false, region: 'Global'       },
  { code: 'ur', name: 'Urdu',       nativeName: 'اردو',             flag: '🇵🇰', enabled: true,  rtl: true,  region: 'Pakistan'     },

  // ── Coming Soon ─────────────────────────────────────────────────
  { code: 'ar', name: 'Arabic',     nativeName: 'العربية',          flag: '🇸🇦', enabled: false, rtl: true,  region: 'Middle East'  },
  { code: 'hi', name: 'Hindi',      nativeName: 'हिन्दी',          flag: '🇮🇳', enabled: false, rtl: false, region: 'India'        },
  { code: 'bn', name: 'Bengali',    nativeName: 'বাংলা',           flag: '🇧🇩', enabled: false, rtl: false, region: 'Bangladesh'   },
  { code: 'ps', name: 'Pashto',     nativeName: 'پښتو',            flag: '🇦🇫', enabled: false, rtl: true,  region: 'Afghanistan'  },
  { code: 'fa', name: 'Persian',    nativeName: 'فارسی',           flag: '🇮🇷', enabled: false, rtl: true,  region: 'Iran'         },
  { code: 'tr', name: 'Turkish',    nativeName: 'Türkçe',          flag: '🇹🇷', enabled: false, rtl: false, region: 'Turkey'       },
  { code: 'zh', name: 'Chinese',    nativeName: '中文',             flag: '🇨🇳', enabled: false, rtl: false, region: 'China'        },
  { code: 'ms', name: 'Malay',      nativeName: 'Bahasa Melayu',   flag: '🇲🇾', enabled: false, rtl: false, region: 'Malaysia'     },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia', flag: '🇮🇩', enabled: false, rtl: false, region: 'Indonesia'    },
  { code: 'fr', name: 'French',     nativeName: 'Français',        flag: '🇫🇷', enabled: false, rtl: false, region: 'France'       },
  { code: 'de', name: 'German',     nativeName: 'Deutsch',         flag: '🇩🇪', enabled: false, rtl: false, region: 'Germany'      },
  { code: 'es', name: 'Spanish',    nativeName: 'Español',         flag: '🇪🇸', enabled: false, rtl: false, region: 'Spain'        },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português',       flag: '🇧🇷', enabled: false, rtl: false, region: 'Brazil'       },
  { code: 'ru', name: 'Russian',    nativeName: 'Русский',         flag: '🇷🇺', enabled: false, rtl: false, region: 'Russia'       },
  { code: 'ja', name: 'Japanese',   nativeName: '日本語',           flag: '🇯🇵', enabled: false, rtl: false, region: 'Japan'        },
  { code: 'ko', name: 'Korean',     nativeName: '한국어',           flag: '🇰🇷', enabled: false, rtl: false, region: 'South Korea'  },
  { code: 'sw', name: 'Swahili',    nativeName: 'Kiswahili',       flag: '🇰🇪', enabled: false, rtl: false, region: 'East Africa'  },
  { code: 'ha', name: 'Hausa',      nativeName: 'Hausa',           flag: '🇳🇬', enabled: false, rtl: false, region: 'Nigeria'      },
  { code: 'ta', name: 'Tamil',      nativeName: 'தமிழ்',           flag: '🇱🇰', enabled: false, rtl: false, region: 'Sri Lanka'    },
  { code: 'so', name: 'Somali',     nativeName: 'Soomaali',        flag: '🇸🇴', enabled: false, rtl: false, region: 'Somalia'      },
  { code: 'nl', name: 'Dutch',      nativeName: 'Nederlands',      flag: '🇳🇱', enabled: false, rtl: false, region: 'Netherlands'  },
  { code: 'it', name: 'Italian',    nativeName: 'Italiano',        flag: '🇮🇹', enabled: false, rtl: false, region: 'Italy'        },
  { code: 'th', name: 'Thai',       nativeName: 'ภาษาไทย',        flag: '🇹🇭', enabled: false, rtl: false, region: 'Thailand'     },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt',     flag: '🇻🇳', enabled: false, rtl: false, region: 'Vietnam'      },
  { code: 'pl', name: 'Polish',     nativeName: 'Polski',          flag: '🇵🇱', enabled: false, rtl: false, region: 'Poland'       },
  { code: 'uk', name: 'Ukrainian',  nativeName: 'Українська',      flag: '🇺🇦', enabled: false, rtl: false, region: 'Ukraine'      },
  { code: 'ro', name: 'Romanian',   nativeName: 'Română',          flag: '🇷🇴', enabled: false, rtl: false, region: 'Romania'      },
  { code: 'cs', name: 'Czech',      nativeName: 'Čeština',         flag: '🇨🇿', enabled: false, rtl: false, region: 'Czech Rep.'   },
]

export const ENABLED_LANGUAGES  = ALL_LANGUAGES.filter(l => l.enabled)
export const DISABLED_LANGUAGES = ALL_LANGUAGES.filter(l => !l.enabled)

export function getLanguageByCode(code: string): LanguageOption | undefined {
  return ALL_LANGUAGES.find(l => l.code === code)
}
