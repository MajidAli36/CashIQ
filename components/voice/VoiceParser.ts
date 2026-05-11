import type { VoiceIntent, VoiceIntentType, VoiceTxnType } from '@/lib/store/voice-prefill.store'

// ─── Urdu / Roman-Urdu number words ──────────────────────────────────────────
const WORD_NUMBERS: [RegExp, number][] = [
  [/\b(ek|aik|ایک)\b/i,        1],
  [/\b(do|دو)\b/i,             2],
  [/\b(teen|تین)\b/i,          3],
  [/\b(char|چار)\b/i,          4],
  [/\b(paanch|پانچ)\b/i,       5],
  [/\b(chhe|چھ)\b/i,           6],
  [/\b(saat|سات)\b/i,          7],
  [/\b(aath|آٹھ)\b/i,          8],
  [/\b(nau|نو)\b/i,            9],
  [/\b(das|دس)\b/i,            10],
  [/\b(bees|بیس)\b/i,          20],
  [/\b(pachees|پچیس)\b/i,      25],
  [/\b(pachaas|پچاس)\b/i,      50],
  [/\b(sau|سو)\b/i,            100],
  [/\b(paanch\s*sau)\b/i,      500],
  [/\b(hazaar|ہزار)\b/i,       1000],
  [/\b(do\s*hazaar)\b/i,       2000],
  [/\b(paanch\s*hazaar)\b/i,   5000],
  [/\b(das\s*hazaar)\b/i,      10000],
  [/\b(lakh|لاکھ)\b/i,         100000],
]

function extractAmount(text: string): number | undefined {
  // Numeric first: "500", "1,500", "Rs 2000", "2000 rupees"
  const numMatch = text.match(/(?:rs\.?\s*)?(\d[\d,]*(?:\.\d+)?)\s*(?:rupees?|روپے|روپیہ|pkr)?/i)
  if (numMatch) {
    const n = parseFloat(numMatch[1].replace(/,/g, ''))
    if (!isNaN(n) && n > 0) return n
  }
  // Word-based
  for (const [re, val] of WORD_NUMBERS) {
    if (re.test(text)) return val
  }
  return undefined
}

function extractIntent(text: string): VoiceIntentType {
  const t = text.toLowerCase()
  if (/new\s*customer|naya\s*customer|customer\s*(add|bana|create|register)|نیا\s*گاہک|گاہک\s*بناو/.test(t))
    return 'create_customer'
  if (/\b(loan|udhar|qarz|ادھار|قرض|advance|پیشگی)\b/.test(t))
    return 'add_loan'
  if (/\b(show|list|dikhao|kitna|total|report|دکھاو|کتنا|how\s*much|balance|history)\b/.test(t))
    return 'get_transactions'
  return 'add_transaction'
}

function extractType(text: string, intent: VoiceIntentType): VoiceTxnType | undefined {
  if (intent === 'add_loan') return 'loan'
  const t = text.toLowerCase()
  if (/\b(income|mila|received|aya|آیا|ملا|sale|becha|jama|جمع|payment\s*received)\b/.test(t)) return 'income'
  if (/\b(expense|kharch|kharcha|diya|spent|خرچ|دیا|payment\s*made|pay\s*kiya)\b/.test(t))     return 'expense'
  return undefined
}

function extractCustomer(text: string): string | undefined {
  // "from/to/of Arslan", "Arslan ka/ki/ne/se", "customer Arslan"
  const patterns: RegExp[] = [
    /\b(?:from|to|of|by|for)\s+([A-Z][a-z]{1,15}(?:\s+[A-Z][a-z]{1,15})?)\b/,
    /\b(?:ka|ki|ke|se|ko|ne)\s+([A-Z][a-z]{1,15}(?:\s+[A-Z][a-z]{1,15})?)\b/i,
    /\b([A-Z][a-z]{1,15}(?:\s+[A-Z][a-z]{1,15})?)\s+(?:ka|ki|ne|ko|se|ko)\b/i,
    /\bcustomer\s+([A-Za-z]{2,20}(?:\s+[A-Za-z]{2,15})?)\b/i,
    /\bgrahak\s+([A-Za-z]{2,20})\b/i,
  ]
  for (const p of patterns) {
    const m = text.match(p)
    if (m?.[1]) return m[1].trim()
  }
  return undefined
}

function extractNote(text: string): string | undefined {
  // "for milk", "ke liye doodh", "item: groceries"
  const m = text.match(/\b(?:for|ke\s*liye|لیے|about|item[:\s])\s+(.{2,40?}?)(?:\s+(?:from|to|ka|ki|ne|ko)|\s*$)/i)
  return m?.[1]?.trim()
}

function extractPhone(text: string): string | undefined {
  const m = text.match(/(?:0\d{10}|\+92\d{10}|\d{10,11})/)
  return m?.[0]
}

function extractDateRange(text: string): string | undefined {
  const t = text.toLowerCase()
  if (/\b(today|aaj|آج)\b/.test(t))                  return 'today'
  if (/\b(yesterday|kal|کل)\b/.test(t))              return 'yesterday'
  if (/\b(this\s*week|is\s*hafte)\b/.test(t))        return 'this_week'
  if (/\b(this\s*month|is\s*mahine)\b/.test(t))      return 'this_month'
  if (/\b(last\s*month|pichle\s*mahine)\b/.test(t))  return 'last_month'
  return undefined
}

/**
 * parseVoiceCommand
 *
 * Pure function — no side effects, no store access.
 * Parses English, Urdu (Nastaliq), and Roman Urdu.
 *
 * Future: replace body with OpenAI call:
 *   const res = await openai.chat.completions.create({
 *     model: 'gpt-4o-mini',
 *     messages: [{ role: 'user', content: PROMPT.replace('{{text}}', text) }],
 *     response_format: { type: 'json_object' },
 *   })
 *   return JSON.parse(res.choices[0].message.content!)
 */
export function parseVoiceCommand(text: string): VoiceIntent {
  const intent     = extractIntent(text)
  const amount     = extractAmount(text)
  const customer   = extractCustomer(text)
  const type       = extractType(text, intent)
  const note       = extractNote(text)
  const phone      = extractPhone(text)
  const date_range = extractDateRange(text)

  return { intent, ...(amount     !== undefined && { amount }),
                     ...(customer  !== undefined && { customer }),
                     ...(type      !== undefined && { type }),
                     ...(note      !== undefined && { note }),
                     ...(phone     !== undefined && { phone }),
                     ...(date_range !== undefined && { date_range }) }
}

/** Human-readable summary for the preview card */
export function describeIntent(intent: VoiceIntent): string {
  switch (intent.intent) {
    case 'create_customer':
      return `New customer: ${intent.customer ?? '—'}${intent.phone ? ` · ${intent.phone}` : ''}`
    case 'add_loan':
      return `Loan of Rs. ${intent.amount ?? '—'}${intent.customer ? ` with ${intent.customer}` : ''}`
    case 'get_transactions':
      return `Show transactions${intent.customer ? ` for ${intent.customer}` : ''}${intent.date_range ? ` · ${intent.date_range}` : ''}`
    default: {
      const dir = intent.type === 'income' ? 'Income' : intent.type === 'expense' ? 'Expense' : 'Transaction'
      return `${dir}: Rs. ${intent.amount ?? '—'}${intent.customer ? ` · ${intent.customer}` : ''}${intent.note ? ` · ${intent.note}` : ''}`
    }
  }
}
