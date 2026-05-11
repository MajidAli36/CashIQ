'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function V2Root() {
  const router = useRouter()
  useEffect(() => { router.replace('/v2/dashboard') }, [router])
  return null
}
