'use client'
import { useTeamStore } from '../store/team.store'
import { PERMISSIONS } from '../config/permissions.config'

export function usePermission(action: keyof typeof PERMISSIONS['owner']): boolean {
  const role = useTeamStore(s => s.currentUserRole)
  return PERMISSIONS[role]?.[action] ?? false
}
