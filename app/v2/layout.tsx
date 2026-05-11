'use client'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuthStore } from '@/lib/store/auth.store'
import { useBusinessStore } from '@/lib/store/business.store'
import { useSettingsStore } from '@/lib/store/settings.store'
import { useTransactionStore } from '@/lib/store/transaction.store'
import { useLoanStore } from '@/lib/store/loan.store'
import { useInvoiceStore } from '@/lib/store/invoice.store'
import { useAdvanceStore } from '@/lib/store/advance.store'
import { V2Shell } from '@/components/v2/V2Shell'

function runMigration() {
  const bizStore     = useBusinessStore.getState()
  const settings     = useSettingsStore.getState()
  const txnStore     = useTransactionStore.getState()
  const loanStore    = useLoanStore.getState()
  const invoiceStore = useInvoiceStore.getState()
  const advStore     = useAdvanceStore.getState()

  if (bizStore.migrated) return
  if (!settings.isOnboarded) return

  const { shop } = settings
  let defaultId = bizStore.businesses[0]?.id

  if (!defaultId) {
    defaultId = bizStore.initDefault(
      shop.name || 'My Business',
      shop.business_type,
      shop.owner_name,
      shop.phone,
      shop.city,
    )
  }

  settings.migrateToBusinessId(defaultId)
  txnStore.migrateToBusinessId(defaultId)
  loanStore.migrateToBusinessId(defaultId)
  invoiceStore.migrateToBusinessId(defaultId)
  advStore.migrateToBusinessId(defaultId)
  bizStore.setMigrated()
}

function V2LayoutInner({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { isAuthenticated, phone, isVerified, pinHash } = useAuthStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    if (!isAuthenticated) {
      if (!phone)           router.replace('/phone')
      else if (!isVerified) router.replace('/otp')
      else if (!pinHash)    router.replace('/set-pin')
      else                  router.replace('/pin')
    }
  }, [isAuthenticated, phone, isVerified, pinHash, router, pathname, mounted])

  useEffect(() => {
    if (mounted && isAuthenticated) runMigration()
  }, [isAuthenticated, mounted])

  if (!mounted) return null

  if (!isAuthenticated) return null

  return <V2Shell>{children}</V2Shell>
}

export default function V2Layout({ children }: { children: React.ReactNode }) {
  return <V2LayoutInner>{children}</V2LayoutInner>
}
