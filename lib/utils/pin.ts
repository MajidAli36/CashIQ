export async function hashPin(phone: string, pin: string): Promise<string> {
  const data = `rozcash:${phone}:${pin}`
  const encoded = new TextEncoder().encode(data)
  const buffer = await crypto.subtle.digest('SHA-256', encoded)
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

export async function verifyPin(phone: string, pin: string, hash: string): Promise<boolean> {
  return (await hashPin(phone, pin)) === hash
}
