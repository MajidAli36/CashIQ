'use client'
import { autoTranslate } from '../translation/urdu-dictionary'

export function useUrduTranslation(englishText: string): string {
  return autoTranslate(englishText)
}
