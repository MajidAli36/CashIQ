interface EmptyStateProps {
  icon?: string
  title: string
  titleUr?: string
  description?: string
  action?: React.ReactNode
}

export function EmptyState({ icon = '📭', title, titleUr, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-16 h-16 bg-surface-dark rounded-2xl flex items-center justify-center text-3xl mb-5 shadow-card">
        {icon}
      </div>
      <h3 className="text-[15px] font-bold text-navy tracking-tight">{title}</h3>
      {titleUr && <p className="font-urdu text-sm text-muted mt-1">{titleUr}</p>}
      {description && <p className="text-sm text-muted mt-2 text-balance">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}
