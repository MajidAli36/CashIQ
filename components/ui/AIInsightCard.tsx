'use client'
import { motion } from 'framer-motion'
import { Sparkles, TrendingUp, TrendingDown, AlertTriangle, CheckCircle2 } from 'lucide-react'

type InsightLevel = 'positive' | 'warning' | 'neutral' | 'tip'

interface AIInsightCardProps {
  income7d: number
  expense7d: number
  income30d: number
  expense30d: number
  topExpenseCategory?: string
  loanOutstanding?: number
}

interface Insight {
  level: InsightLevel
  icon: React.ReactNode
  title: string
  titleUr: string
  body: string
  accent: string
  bg: string
}

function deriveInsight(props: AIInsightCardProps): Insight {
  const { income7d, expense7d, income30d, expense30d, topExpenseCategory, loanOutstanding } = props
  const savingsRate30d = income30d > 0 ? ((income30d - expense30d) / income30d) * 100 : 0
  const weekTrend = income7d - expense7d

  if (loanOutstanding && loanOutstanding > income30d * 0.5) {
    return {
      level: 'warning',
      icon: <AlertTriangle size={16} strokeWidth={2} />,
      title: 'High Loan Balance',
      titleUr: 'اُدھار زیادہ ہے',
      body: `Outstanding loans are ${Math.round((loanOutstanding / income30d) * 100)}% of monthly income. Consider collecting dues.`,
      accent: '#F59E0B',
      bg: 'rgba(245,158,11,0.08)',
    }
  }
  if (savingsRate30d > 30) {
    return {
      level: 'positive',
      icon: <CheckCircle2 size={16} strokeWidth={2} />,
      title: 'Great Savings Rate',
      titleUr: 'بچت اچھی ہے',
      body: `You're saving ${Math.round(savingsRate30d)}% of income this month. Keep it up!`,
      accent: '#4CAF50',
      bg: 'rgba(76,175,80,0.08)',
    }
  }
  if (weekTrend < 0 && expense7d > income7d * 1.2) {
    return {
      level: 'warning',
      icon: <TrendingDown size={16} strokeWidth={2} />,
      title: 'Expenses Spiked This Week',
      titleUr: 'اس ہفتے خرچہ زیادہ',
      body: `Expenses exceeded income by Rs. ${Math.abs(weekTrend).toLocaleString('en-PK')} this week${topExpenseCategory ? ` — mainly ${topExpenseCategory}` : ''}.`,
      accent: '#FF5C5C',
      bg: 'rgba(255,92,92,0.08)',
    }
  }
  if (weekTrend > 0) {
    return {
      level: 'positive',
      icon: <TrendingUp size={16} strokeWidth={2} />,
      title: 'Profitable Week',
      titleUr: 'فائدہ مند ہفتہ',
      body: `Net earning of Rs. ${weekTrend.toLocaleString('en-PK')} this week. Business is on track.`,
      accent: '#00C4B4',
      bg: 'rgba(0,196,180,0.08)',
    }
  }
  return {
    level: 'tip',
    icon: <Sparkles size={16} strokeWidth={2} />,
    title: 'Add More Records',
    titleUr: 'مزید ریکارڈ شامل کریں',
    body: 'Record all income and expenses daily to get accurate insights and reports.',
    accent: '#00C4B4',
    bg: 'rgba(0,196,180,0.06)',
  }
}

export function AIInsightCard(props: AIInsightCardProps) {
  const insight = deriveInsight(props)

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-2xl p-4 border"
      style={{
        background: insight.bg,
        borderColor: `${insight.accent}30`,
      }}
    >
      <div className="flex items-start gap-3">
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
          style={{ background: `${insight.accent}20`, color: insight.accent }}
        >
          {insight.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <Sparkles size={10} style={{ color: insight.accent }} />
            <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: insight.accent }}>
              AI Insight
            </p>
          </div>
          <p className="text-[13px] font-bold mb-0.5" style={{ color: 'var(--t-text)' }}>
            {insight.title}
          </p>
          <p className="font-urdu text-[11px] mb-1" style={{ color: 'var(--t-muted)' }}>
            {insight.titleUr}
          </p>
          <p className="text-[12px] leading-relaxed" style={{ color: 'var(--t-muted)' }}>
            {insight.body}
          </p>
        </div>
      </div>
    </motion.div>
  )
}
