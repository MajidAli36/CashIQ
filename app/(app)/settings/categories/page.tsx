'use client'
import { useState } from 'react'
import { useSettingsStore } from '@/lib/store/settings.store'
import { useBusinessStore } from '@/lib/store/business.store'
import { useTranslation } from '@/lib/hooks/useTranslation'
import { PageHeader } from '@/components/layout/PageHeader'
import { Toggle } from '@/components/ui/Toggle'
import { Plus } from 'lucide-react'
import { showToast } from '@/components/ui/Toast'
import { cn } from '@/lib/utils/cn'

export default function CategoriesPage() {
  const { categories, addCategory, toggleCategory } = useSettingsStore()
  const { activeBusinessId } = useBusinessStore()
  const bid = activeBusinessId ?? 'default'

  const [tab, setTab] = useState<'income' | 'expense'>('income')
  const [newName, setNewName] = useState('')
  const [newIcon, setNewIcon] = useState('📦')

  const filtered = categories.filter(c =>
    c.type === tab && (!c.business_id || c.business_id === bid)
  )

  const handleAdd = () => {
    if (!newName.trim()) return
    addCategory({
      name_en: newName.trim(),
      name_ur: newName.trim(),
      type: tab,
      icon: newIcon,
      color: tab === 'income' ? '#3B6D11' : '#A32D2D',
      is_default: false,
      is_enabled: true,
      business_id: bid,
    })
    setNewName('')
    showToast({ type: 'success', message: 'Category added!', messageUr: 'قسم شامل ہوگئی' })
  }

  return (
    <div className="min-h-screen bg-surface">
      <PageHeader title="Categories" titleUr="اقسام" backTo="/settings" />
      <div className="px-4 pt-4">
        <div className="flex gap-2 mb-4">
          {(['income', 'expense'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={cn('flex-1 h-10 rounded-xl border text-sm font-semibold transition-all',
                tab === t ? 'text-white' : 'text-muted')}
              style={tab === t ? {
                background: 'var(--t-accent)',
                borderColor: 'var(--t-accent)',
              } : {
                background: 'var(--t-card-bg)',
                borderColor: 'var(--t-card-border)',
              }}>
              {t === 'income' ? 'Money In · آمدنی' : 'Money Out · خرچہ'}
            </button>
          ))}
        </div>

        <div className="space-y-2 mb-4">
          {filtered.map(c => (
            <div key={c.id} className="flex items-center gap-3 bg-white rounded-xl p-3 border border-border">
              <span className="text-xl">{c.icon}</span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-navy">{c.name_en}</p>
                <p className="font-urdu text-xs text-muted">{c.name_ur}</p>
              </div>
              {c.is_default && <span className="text-[10px] bg-surface text-muted px-2 py-0.5 rounded-full border border-border">Default</span>}
              <Toggle checked={c.is_enabled} onChange={() => toggleCategory(c.id)} />
            </div>
          ))}
        </div>

        {/* Add new */}
        <div className="bg-white rounded-2xl p-4 border border-border">
          <p className="text-sm font-bold text-navy mb-3">Add Category · قسم شامل کریں</p>
          <div className="flex gap-2 mb-3">
            <input value={newIcon} onChange={e => setNewIcon(e.target.value)}
              className="w-14 h-11 bg-surface border border-border rounded-xl text-center text-xl focus:outline-none"
              maxLength={2} />
            <input value={newName} onChange={e => setNewName(e.target.value)}
              placeholder="Category name"
              className="flex-1 h-11 bg-surface border border-border rounded-xl px-3 text-sm focus:outline-none" />
          </div>
          <button onClick={handleAdd}
            className="w-full h-11 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
            style={{ background: 'var(--t-accent)' }}>
            <Plus size={16} /> Add Category
          </button>
        </div>
      </div>
    </div>
  )
}
