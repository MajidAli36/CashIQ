'use client'
import { AreaChart, Area, ResponsiveContainer } from 'recharts'

interface SparklineChartProps {
  data: number[]
  color?: string
  height?: number
  gradientId?: string
}

export function SparklineChart({
  data,
  color = '#00C4B4',
  height = 44,
  gradientId = 'sparkGrad',
}: SparklineChartProps) {
  const chartData = data.map((value, i) => ({ value, i }))

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={chartData} margin={{ top: 3, right: 3, left: 3, bottom: 3 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.35} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={1.8}
          fill={`url(#${gradientId})`}
          dot={false}
          animationDuration={1200}
          animationEasing="ease-out"
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
