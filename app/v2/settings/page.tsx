'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function V2SettingsPage() {
  const router = useRouter()
  useEffect(() => { router.replace('/settings') }, [])
  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-gray-400 text-sm">Redirecting to settings...</p>
    </div>
  )
}
