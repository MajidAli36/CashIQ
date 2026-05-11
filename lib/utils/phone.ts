export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.length === 11) {
    return `${digits.slice(0, 4)}-${digits.slice(4)}`
  }
  return phone
}

export function validatePhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, '')
  return digits.length === 11 && digits.startsWith('03')
}

export function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, '')
}

export function isPhoneAlreadyInTeam(phone: string, teamMembers: any[]): boolean {
  const normalizedPhone = normalizePhone(phone)
  return teamMembers.some(member => normalizePhone(member.phone) === normalizedPhone)
}
