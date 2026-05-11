'use client'
import { useState } from 'react'
import { useSettingsStore } from '@/lib/store/settings.store'
import { useTranslation } from '@/lib/hooks/useTranslation'
import { PageHeader } from '@/components/layout/PageHeader'
import { RoleBadge } from '@/components/ui/RoleBadge'
import { Toggle } from '@/components/ui/Toggle'
import { PERMISSIONS } from '@/lib/config/permissions.config'
import { Check, X, Plus, UserPlus, Trash2, Clock } from 'lucide-react'
import { showToast } from '@/components/ui/Toast'
import { formatPhone, validatePhone, isPhoneAlreadyInTeam } from '@/lib/utils/phone'
import type { UserRole, TeamMember } from '@/lib/types'

export default function TeamPage() {
  const { shop, teamMembers, addTeamMember, updateTeamMember, deleteTeamMember, inviteTeamMember } = useSettingsStore()
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [role, setRole] = useState<'manager' | 'staff'>('staff')
  const [error, setError] = useState('')
  const [inviteMode, setInviteMode] = useState(false)

  const allMembers = [
    { id: 'owner', name: shop.owner_name || 'Owner', phone: shop.phone, role: 'owner' as UserRole, is_active: true },
    ...teamMembers,
  ]

  const permissionKeys = Object.keys(PERMISSIONS.owner) as (keyof typeof PERMISSIONS['owner'])[]
  const permissionLabels: Record<string, string> = {
    add_transaction: 'Add Transaction',
    view_reports: 'View Reports',
    manage_loan: 'Manage Loan',
    manage_team: 'Manage Team',
    manage_subscription: 'Subscription',
    daily_close: 'Close Day',
    export_pdf: 'Export PDF',
    edit_settings: 'Edit Settings',
    delete_transaction: 'Delete',
    view_all_records: 'All Records',
  }

  const handleAdd = () => {
    if (!name.trim()) return
    
    // Validate phone number
    if (!validatePhone(phone)) {
      setError('Phone must be 11 digits starting with 03')
      showToast({ type: 'error', message: 'Invalid phone number', messageUr: 'غلط فون نمبر' })
      return
    }
    
    // Check if phone already exists
    if (isPhoneAlreadyInTeam(phone, teamMembers)) {
      setError('Phone number already in team')
      showToast({ type: 'error', message: 'Phone already exists', messageUr: 'فون نمبر پہلے سے موجود ہے' })
      return
    }
    
    addTeamMember({
      name: name.trim(),
      phone,
      role,
      is_active: true,
      invitation_status: 'accepted'
    })
    setName(''); setPhone(''); setShowForm(false); setError('')
    showToast({ type: 'success', message: 'Staff added!', messageUr: 'ملازم شامل ہوگیا' })
  }

  const handleInvite = () => {
    if (!name.trim()) return
    
    // Validate phone number
    if (!validatePhone(phone)) {
      setError('Phone must be 11 digits starting with 03')
      showToast({ type: 'error', message: 'Invalid phone number', messageUr: 'غلط فون نمبر' })
      return
    }
    
    // Check if phone already exists
    if (isPhoneAlreadyInTeam(phone, teamMembers)) {
      setError('Phone number already in team')
      showToast({ type: 'error', message: 'Phone already exists', messageUr: 'فون نمبر پہلے سے موجود ہے' })
      return
    }
    
    inviteTeamMember(phone, role, shop.owner_name || 'Owner')
    setName(''); setPhone(''); setShowForm(false); setError('')
    showToast({ type: 'success', message: 'Invitation sent!', messageUr: 'دعوت نامہ بھیج دیا گیا' })
  }

  return (
    <div className="min-h-screen bg-surface pb-6">
      <PageHeader title="Team" titleUr="ٹیم" backTo="/settings"
        right={<button onClick={() => setShowForm(!showForm)} className="text-xs font-semibold px-3 py-1.5 rounded-xl" style={{ color: 'var(--t-muted)', background: 'var(--t-card-bg)', border: '1px solid var(--t-card-border)' }}>Add Staff</button>}
      />

      <div className="px-4 pt-4 space-y-4">
        {/* Members */}
        <div className="space-y-2">
          {allMembers.map(m => (
            <div key={m.id} className="bg-white rounded-2xl p-4 border border-border flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white"
                style={{ background: m.role === 'owner' ? 'var(--t-accent)' : m.role === 'manager' ? '#3B82F6' : 'var(--t-card-bg)', color: m.role === 'owner' || m.role === 'manager' ? 'white' : 'var(--t-muted)' }}>
                {m.name.slice(0,2).toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-navy">{m.name}</p>
                  <RoleBadge role={m.role} />
                </div>
                <p className="text-xs text-muted">{formatPhone(m.phone)}</p>
              </div>
              {m.id !== 'owner' && (
                <Toggle checked={m.is_active} onChange={v => updateTeamMember(m.id, { is_active: v })} />
              )}
            </div>
          ))}
        </div>

        {/* Add Form */}
        {showForm && (
          <div className="bg-white rounded-2xl p-4 border border-border">
            <p className="text-sm font-bold text-navy mb-3">Add Staff Member · ملازم شامل کریں</p>
            {[{v:'name',l:'Name',p:'Ahmad Raza'},{v:'phone',l:'Phone',p:'03XX-XXXXXXX'}].map(f => (
              <div key={f.v} className="mb-3">
                <label className="text-xs text-muted">{f.l}</label>
                <input value={f.v === 'name' ? name : phone} onChange={e => f.v === 'name' ? setName(e.target.value) : setPhone(e.target.value)}
                  placeholder={f.p}
                  className="mt-1 w-full h-10 bg-surface border border-border rounded-xl px-3 text-sm focus:outline-none" />
              </div>
            ))}
            <div className="mb-4">
              <label className="text-xs text-muted">Role</label>
              <div className="mt-1 flex gap-2">
                {(['manager', 'staff'] as const).map(r => (
                  <button key={r} onClick={() => setRole(r)}
                    className={`flex-1 h-10 rounded-xl border text-sm font-semibold capitalize transition-all ${role === r ? 'text-white' : 'text-muted'}`}
                    style={role === r ? {
                      background: 'var(--t-accent)',
                      borderColor: 'var(--t-accent)',
                    } : {
                      background: 'var(--t-card-bg)',
                      borderColor: 'var(--t-card-border)',
                    }}>
                    {r}
                  </button>
                ))}
              </div>
            </div>
            {error && (
              <p className="text-xs text-expense mb-3">{error}</p>
            )}
            
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setInviteMode(false)}
                className={`flex-1 h-10 rounded-xl border text-sm font-semibold transition-all ${!inviteMode ? 'text-white' : 'text-muted'}`}
                style={!inviteMode ? {
                  background: 'var(--t-accent)',
                  borderColor: 'var(--t-accent)',
                } : {
                  background: 'var(--t-card-bg)',
                  borderColor: 'var(--t-card-border)',
                }}
              >
                Add Directly
              </button>
              <button
                onClick={() => setInviteMode(true)}
                className={`flex-1 h-10 rounded-xl border text-sm font-semibold transition-all ${inviteMode ? 'text-white' : 'text-muted'}`}
                style={inviteMode ? {
                  background: 'var(--t-accent)',
                  borderColor: 'var(--t-accent)',
                } : {
                  background: 'var(--t-card-bg)',
                  borderColor: 'var(--t-card-border)',
                }}
              >
                Send Invite
              </button>
            </div>
            
            <button
              onClick={inviteMode ? handleInvite : handleAdd}
              className="w-full h-11 bg-income text-white rounded-xl text-sm font-semibold"
            >
              {inviteMode ? 'Send Invitation' : 'Save Staff Member'}
            </button>
          </div>
        )}

        {/* Permissions Table */}
        <div>
          <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">Permissions · اختیارات</p>
          <div className="bg-white rounded-2xl border border-border overflow-hidden">
            <div className="grid grid-cols-4 px-3 py-2 bg-surface border-b border-border">
              <span className="text-[10px] font-semibold text-muted col-span-1">Feature</span>
              <span className="text-[10px] font-semibold text-navy text-center">Owner</span>
              <span className="text-[10px] font-semibold text-blue-600 text-center">Manager</span>
              <span className="text-[10px] font-semibold text-muted text-center">Staff</span>
            </div>
            {permissionKeys.map((key, i) => (
              <div key={key} className={`grid grid-cols-4 px-3 py-2 items-center ${i > 0 ? 'border-t border-border' : ''}`}>
                <span className="text-[11px] font-medium text-navy col-span-1">{permissionLabels[key]}</span>
                {(['owner', 'manager', 'staff'] as UserRole[]).map(role => (
                  <div key={role} className="flex justify-center">
                    {PERMISSIONS[role][key] ? <Check size={14} className="text-income" /> : <X size={14} className="text-muted" />}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
