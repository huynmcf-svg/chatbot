export interface Country {
  code: string
  name: string
  dial: string
  flag: string
}

/** Danh sách quốc gia cho ô chọn mã vùng điện thoại (Việt Nam mặc định). */
export const COUNTRIES: Country[] = [
  { code: 'VN', name: 'Việt Nam', dial: '+84', flag: '🇻🇳' },
  { code: 'US', name: 'United States', dial: '+1', flag: '🇺🇸' },
  { code: 'GB', name: 'United Kingdom', dial: '+44', flag: '🇬🇧' },
  { code: 'AU', name: 'Australia', dial: '+61', flag: '🇦🇺' },
  { code: 'SG', name: 'Singapore', dial: '+65', flag: '🇸🇬' },
  { code: 'MY', name: 'Malaysia', dial: '+60', flag: '🇲🇾' },
  { code: 'TH', name: 'Thailand', dial: '+66', flag: '🇹🇭' },
  { code: 'ID', name: 'Indonesia', dial: '+62', flag: '🇮🇩' },
  { code: 'PH', name: 'Philippines', dial: '+63', flag: '🇵🇭' },
  { code: 'KH', name: 'Cambodia', dial: '+855', flag: '🇰🇭' },
  { code: 'LA', name: 'Laos', dial: '+856', flag: '🇱🇦' },
  { code: 'CN', name: 'China', dial: '+86', flag: '🇨🇳' },
  { code: 'HK', name: 'Hong Kong', dial: '+852', flag: '🇭🇰' },
  { code: 'TW', name: 'Taiwan', dial: '+886', flag: '🇹🇼' },
  { code: 'JP', name: 'Japan', dial: '+81', flag: '🇯🇵' },
  { code: 'KR', name: 'South Korea', dial: '+82', flag: '🇰🇷' },
  { code: 'IN', name: 'India', dial: '+91', flag: '🇮🇳' },
  { code: 'DE', name: 'Germany', dial: '+49', flag: '🇩🇪' },
  { code: 'FR', name: 'France', dial: '+33', flag: '🇫🇷' },
  { code: 'CA', name: 'Canada', dial: '+1', flag: '🇨🇦' },
]

export const DEFAULT_COUNTRY = COUNTRIES[0]
