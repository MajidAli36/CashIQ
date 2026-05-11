'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSettingsStore } from '@/lib/store/settings.store'
import { BUSINESS_TYPES } from '@/lib/config/business-types.config'
import { autoTranslate } from '@/lib/translation/urdu-dictionary'
import { PageHeader } from '@/components/layout/PageHeader'
import { showToast } from '@/components/ui/Toast'
import { cn } from '@/lib/utils/cn'
import { Plus, X } from 'lucide-react'

export default function BusinessTypePage() {
  const router = useRouter()
  const { shop, businessItems, updateShop, addBusinessItem, toggleBusinessItem } = useSettingsStore()
  const [selected, setSelected] = useState(shop.business_type)
  const [newItem, setNewItem] = useState('')

  const currentBT = BUSINESS_TYPES.find(bt => bt.id === selected)
  const customItems = businessItems.filter(i => !i.is_default)

  const handleSave = () => {
    updateShop({ business_type: selected as any })
    showToast({ type: 'success', message: 'Business type saved!', messageUr: 'محفوظ ہوگیا' })
    router.back()
  }

  const handleAddItem = () => {
    if (!newItem.trim()) return
    addBusinessItem({ name_en: newItem.trim(), name_ur: autoTranslate(newItem.trim()), is_default: false, is_enabled: true })
    setNewItem('')
  }

  return (
    <div className="min-h-screen bg-surface pb-6">
      <PageHeader title="Business Type" titleUr="کاروبار کی قسم" backTo="/settings" />
      <div className="px-4 pt-4">
        <div className="grid grid-cols-2 gap-3 mb-5">
          {BUSINESS_TYPES.map(bt => (
            <button key={bt.id} onClick={() => setSelected(bt.id)}
              className={cn('flex flex-col items-center p-4 rounded-2xl border-2 transition-all',
                selected === bt.id ? 'text-white' : 'text-navy')}
              style={selected === bt.id ? {
                background: 'var(--t-accent)',
                borderColor: 'var(--t-accent)',
              } : {
                background: 'var(--t-card-bg)',
                borderColor: 'var(--t-card-border)',
              }}>
              <span className="text-3xl mb-2">{bt.icon}</span>
              <span className="text-sm font-semibold" style={{ color: selected === bt.id ? 'white' : 'var(--t-text)' }}>{bt.name_en}</span>
              <span className="font-urdu text-xs" style={{ color: 'var(--t-muted)' }}>{bt.name_ur}</span>
            </button>
          ))}
        </div>

        {/* Default items */}
        {currentBT && currentBT.default_items.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">Default Items · پہلے سے موجود</p>
            <div className="space-y-1.5">
              {currentBT.default_items.map(item => (
                <div key={item.id} className="flex items-center justify-between bg-white rounded-xl px-4 py-2.5 border border-border">
                  <span className="text-sm font-semibold text-navy">{item.name_en}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-urdu text-xs text-muted">{item.name_ur}</span>
                    <span className="text-[10px] bg-surface text-muted px-2 py-0.5 rounded-full border border-border">Default</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Custom items */}
        {customItems.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">Custom Items · اپنی اشیاء</p>
            <div className="space-y-1.5">
              {customItems.map(item => (
                <div key={item.id} className="flex items-center justify-between bg-white rounded-xl px-4 py-2.5 border border-border">
                  <span className="text-sm font-semibold text-navy">{item.name_en}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-urdu text-xs text-muted">{item.name_ur}</span>
                    <span className="text-[10px] bg-income-light text-income px-2 py-0.5 rounded-full">Custom</span>
                    <button onClick={() => toggleBusinessItem(item.id)} className="text-expense">
                      <X size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add custom item */}
        <div className="bg-white rounded-2xl p-4 border border-border mb-4">
          <p className="text-sm font-bold text-navy mb-3">Add Custom Item</p>
          <input value={newItem} onChange={e => setNewItem(e.target.value)}
            placeholder="Item name in English"
            className="w-full h-11 bg-surface border border-border rounded-xl px-3 text-sm focus:outline-none mb-2" />
          {newItem && (
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-semibold text-income px-2 py-0.5 bg-income-light rounded-full">Auto Urdu</span>
              <span className="font-urdu text-sm text-muted">{autoTranslate(newItem)}</span>
            </div>
          )}
          <button onClick={handleAddItem}
            className="w-full h-11 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
            style={{ background: 'var(--t-accent)' }}>
            <Plus size={16} /> Add Item · شامل کریں
          </button>
        </div>

        <button onClick={handleSave} className="w-full h-14 bg-income text-white rounded-2xl font-semibold text-base">
          Save · محفوظ کریں
        </button>
      </div>
    </div>
  )
}
