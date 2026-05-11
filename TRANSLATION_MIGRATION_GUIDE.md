# Translation Migration Guide

## Problem
All pages have hardcoded English and Urdu labels mixed throughout the code. This is bad practice because:
- Labels are scattered across files
- Difficult to maintain and update
- Hard to ensure consistency
- Not scalable for adding new languages

## Solution
Use the centralized translation system with `en.json` and `ur.json` files.

## How to Fix Each Page

### Step 1: Import the translation hook
```typescript
import { useTranslation } from '@/lib/hooks/useTranslation'
```

### Step 2: Use the hook in your component
```typescript
export default function MyPage() {
  const { t } = useTranslation()
  
  return (
    <div>
      <h1>{t('dashboard.dashboard')}</h1>
      <label>{t('transactions.amount')}</label>
      <button>{t('common.save')}</button>
    </div>
  )
}
```

### Step 3: Replace all hardcoded strings

**BEFORE:**
```typescript
<label className="text-xs font-semibold text-muted mb-1 block">Owner Name</label>
<label className="text-xs font-semibold text-muted mb-1 block">Phone</label>
<label className="text-xs font-semibold text-muted mb-2 block">Business Type · کاروبار کی قسم</label>
```

**AFTER:**
```typescript
<label className="text-xs font-semibold text-muted mb-1 block">{t('businesses.ownerName')}</label>
<label className="text-xs font-semibold text-muted mb-1 block">{t('common.phone')}</label>
<label className="text-xs font-semibold text-muted mb-2 block">{t('businesses.businessType')}</label>
```

### Step 4: Update placeholders
**BEFORE:**
```typescript
placeholder="Owner name"
placeholder="03XX-XXXXXXX"
placeholder="Karachi, Lahore..."
```

**AFTER:**
```typescript
placeholder={t('businesses.ownerNamePlaceholder')}
placeholder={t('businesses.phonePlaceholder')}
placeholder={t('businesses.cityPlaceholder')}
```

## Translation Keys Structure

All keys are organized by feature:
- `common.*` - Common buttons and actions (Save, Cancel, Delete, etc.)
- `dashboard.*` - Dashboard page labels
- `transactions.*` - Transaction form labels
- `customers.*` - Customer management labels
- `categories.*` - Category labels
- `wallets.*` - Wallet labels
- `records.*` - Records page labels
- `reports.*` - Reports page labels
- `businesses.*` - Business labels
- `loans.*` - Loan labels
- `invoices.*` - Invoice labels
- `closeDay.*` - Close day labels
- `settings.*` - Settings labels
- `validation.*` - Validation messages

## Pages to Fix (Priority Order)

1. ✅ **Translation files created** (`en.json`, `ur.json`)
2. ✅ **useTranslation hook created**
3. ⏳ **businesses/page.tsx** - Add business form
4. ⏳ **add/page.tsx** - Transaction form
5. ⏳ **customers/page.tsx** - Customer management
6. ⏳ **close/page.tsx** - Close day page
7. ⏳ **loan/page.tsx** - Loan management
8. ⏳ **records/page.tsx** - Transaction records
9. ⏳ **invoice/page.tsx** - Invoice pages
10. ⏳ **reports/page.tsx** - Reports page
11. ⏳ **settings/** - All settings pages

## Example: Fixing businesses/page.tsx

### Current hardcoded strings:
- "Owner Name"
- "Phone"
- "City"
- "Business Type · کاروبار کی قسم"
- "Owner name"
- "03XX-XXXXXXX"
- "Karachi, Lahore..."
- "Delete this business?"
- "Create Your First Business"
- "Select a business to get started"

### Translation keys needed:
```json
{
  "businesses": {
    "ownerName": "Owner Name",
    "ownerNamePlaceholder": "Owner name",
    "businessType": "Business Type",
    "businessTypePlaceholder": "Select business type",
    "cityPlaceholder": "Karachi, Lahore...",
    "deleteBusiness": "Delete this business?",
    "createFirst": "Create Your First Business",
    "selectBusiness": "Select a business to get started"
  }
}
```

## Best Practices

1. **Always use translation keys** - Never hardcode strings
2. **Keep keys organized** - Group by feature/page
3. **Use descriptive names** - `ownerNamePlaceholder` not `placeholder1`
4. **Add to JSON first** - Update `en.json` and `ur.json` before using in code
5. **Test both languages** - Verify translations work in English and Urdu
6. **Use consistent patterns** - Follow the same structure across all pages

## Testing

After fixing a page:
1. Switch language in settings
2. Verify all labels change correctly
3. Check for any hardcoded strings remaining
4. Test form validation messages
5. Test placeholder text

## Automated Search

To find remaining hardcoded strings, search for:
- `"[A-Z][a-z]+ [A-Z]"` - Capitalized phrases (regex)
- `"·"` - Bilingual separators
- Common words like "Owner", "Phone", "City", "Delete", etc.

## Notes

- The `useTranslation` hook automatically detects the current language from `shop.language`
- If a translation key is missing, it will log a warning and return the key name
- You can add new translation keys anytime - just update `en.json` and `ur.json`
- The system supports nested keys (e.g., `"dashboard.recentTransactions"`)
