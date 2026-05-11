export type DateRangeOption = 'today' | 'yesterday' | 'last7' | 'last30' | 'thisMonth' | 'lastMonth' | 'thisYear' | 'fiscalYear' | 'custom'

export interface DateRange {
  from: string
  to: string
  label: string
  option: DateRangeOption
}

export interface PrevRange {
  from: string
  to: string
}
