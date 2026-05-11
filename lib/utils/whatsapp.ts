export function generateLoanWhatsAppText(
  name: string,
  amount: number,
  lang: 'en' | 'ur' = 'en'
): string {
  if (lang === 'ur') {
    return `السلام علیکم ${name}، آپ کا اُدھار Rs. ${amount.toLocaleString('en-PK')} ہے۔ براہ کرم جلد ادائیگی کریں۔ - روز کیش`
  }
  return `Hello ${name}, your outstanding loan balance is Rs. ${amount.toLocaleString('en-PK')}. Please pay when possible. - CashIQ`
}

export function openWhatsApp(phone: string, message: string): void {
  const cleaned = phone.replace(/\D/g, '')
  const international = cleaned.startsWith('0') ? `92${cleaned.slice(1)}` : cleaned
  const url = `https://wa.me/${international}?text=${encodeURIComponent(message)}`
  window.open(url, '_blank')
}
