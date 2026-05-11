import { format, parseISO } from 'date-fns'

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'dd/MM/yyyy')
}

export function formatTime(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'hh:mm a')
}

export function todayISO(): string {
  return new Date().toISOString().split('T')[0]
}

export function nowISO(): string {
  return new Date().toISOString()
}
