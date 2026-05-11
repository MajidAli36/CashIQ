export const URDU_DICTIONARY: Record<string, string> = {
  samsung: 'سیمسنگ', iphone: 'آئی فون', repair: 'مرمت',
  screen: 'اسکرین', cable: 'کیبل', mobile: 'موبائل',
  charger: 'چارجر', sale: 'فروخت', cover: 'کور',
  glass: 'گلاس', payment: 'ادائیگی', electricity: 'بجلی',
  salary: 'تنخواہ', rent: 'کرایہ', shop: 'دکان',
  cash: 'نقد', purchase: 'خریداری', nokia: 'نوکیا',
  oppo: 'اوپو', vivo: 'ویوو', redmi: 'ریڈمی',
  xiaomi: 'شاومی', accessories: 'لوازمات', headphone: 'ہیڈفون',
  speaker: 'اسپیکر', battery: 'بیٹری', shirt: 'قمیص',
  trouser: 'پتلون', flour: 'آٹا', rice: 'چاول',
  sugar: 'چینی', oil: 'تیل', milk: 'دودھ',
  laptop: 'لیپ ٹاپ', computer: 'کمپیوٹر', internet: 'انٹرنیٹ',
  delivery: 'ڈیلیوری', transport: 'ٹرانسپورٹ', fuel: 'ایندھن',
  water: 'پانی', food: 'کھانا',
  medicine: 'دوائی', book: 'کتاب', pen: 'قلم',
  earphones: 'ائرفون', protector: 'پروٹیکٹر',
  replacement: 'تبدیلی', port: 'پورٹ', charging: 'چارجنگ',
  damage: 'نقصان', design: 'ڈیزائن', logo: 'لوگو',
  data: 'ڈیٹا', entry: 'انٹری', content: 'مواد',
  writing: 'لکھنا', software: 'سافٹ ویئر', equipment: 'سامان',
}

export function autoTranslate(text: string): string {
  return text
    .toLowerCase()
    .split(' ')
    .map(word => URDU_DICTIONARY[word] ?? word)
    .join(' ')
}
