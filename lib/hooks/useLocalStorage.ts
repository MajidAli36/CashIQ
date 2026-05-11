'use client'
import { useState, useEffect } from 'react'

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch {
      return initialValue
    }
  })

  const setStoredValue = (newValue: T) => {
    setValue(newValue)
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, JSON.stringify(newValue))
    }
  }

  return [value, setStoredValue] as const
}
