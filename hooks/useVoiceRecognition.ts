'use client'
import { useState, useRef, useCallback } from 'react'

export interface UseVoiceRecognitionReturn {
  transcript:  string
  isListening: boolean
  error:       string | null
  start:  (onFinal: (text: string) => void) => void
  stop:   () => void
  reset:  () => void
}

// ─── Web Speech API shim types ────────────────────────────────────────────────
interface SpeechRecognitionEvent {
  results: { length: number; [i: number]: { isFinal: boolean; [j: number]: { transcript: string } } }
}
interface SpeechRecognitionErrorEvent { error: string }
interface SpeechRecognition {
  continuous: boolean
  interimResults: boolean
  lang: string
  onstart:  (() => void) | null
  onend:    (() => void) | null
  onerror:  ((e: SpeechRecognitionErrorEvent) => void) | null
  onresult: ((e: SpeechRecognitionEvent) => void) | null
  start: () => void
  stop:  () => void
}

/**
 * useVoiceRecognition
 *
 * Uses window.webkitSpeechRecognition (Chrome / Edge).
 * Lang is set to 'ur-PK' — this engine accepts mixed Urdu + Roman Urdu + English.
 *
 * Whisper API upgrade path:
 *   Replace the SpeechRecognition block with a MediaRecorder that POSTs audio
 *   to /api/whisper, which calls openai.audio.transcriptions.create().
 *   The rest of the hook interface stays identical.
 *
 * Requires: HTTPS or localhost (browser security requirement for mic access).
 */
export function useVoiceRecognition(): UseVoiceRecognitionReturn {
  const [transcript,  setTranscript]  = useState('')
  const [isListening, setIsListening] = useState(false)
  const [error,       setError]       = useState<string | null>(null)
  const recRef = useRef<SpeechRecognition | null>(null)

  const stop = useCallback(() => {
    recRef.current?.stop()
    setIsListening(false)
  }, [])

  const reset = useCallback(() => {
    stop()
    setTranscript('')
    setError(null)
  }, [stop])

  const start = useCallback((onFinal: (text: string) => void) => {
    if (typeof window === 'undefined') return

    const SR =
      (window as unknown as { SpeechRecognition?: new () => SpeechRecognition }).SpeechRecognition ??
      (window as unknown as { webkitSpeechRecognition?: new () => SpeechRecognition }).webkitSpeechRecognition

    if (!SR) {
      setError('Voice input is not supported in this browser. Try Chrome or Edge.')
      return
    }

    // Clean up any previous session
    recRef.current?.stop()

    const rec = new SR()
    rec.continuous      = false
    rec.interimResults  = true
    rec.lang            = 'ur-PK'  // Accepts Urdu script + Roman Urdu + English words

    rec.onstart  = () => { setIsListening(true); setError(null); setTranscript('') }
    rec.onend    = () => setIsListening(false)
    rec.onerror  = (e) => {
      const msg: Record<string, string> = {
        'not-allowed': 'Microphone permission denied. Please allow mic access.',
        'network':     'Network error — check your connection.',
        'no-speech':   'No speech detected. Please try again.',
      }
      setError(msg[e.error] ?? `Error: ${e.error}`)
      setIsListening(false)
    }
    rec.onresult = (e) => {
      let interim = ''
      for (let i = 0; i < e.results.length; i++) {
        interim += e.results[i][0].transcript
      }
      setTranscript(interim)
      const last = e.results[e.results.length - 1]
      if (last.isFinal) {
        const finalText = interim.trim()
        setTranscript(finalText)
        onFinal(finalText)
      }
    }

    rec.start()
    recRef.current = rec
  }, [])

  return { transcript, isListening, error, start, stop, reset }
}
