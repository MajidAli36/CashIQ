'use client'
import { useEffect, useRef, useState } from 'react'
import { animate } from 'framer-motion'

interface AnimatedNumberProps {
  value: number
  duration?: number
  decimals?: number
  prefix?: string
  suffix?: string
  className?: string
}

export function AnimatedNumber({
  value,
  duration = 1.0,
  decimals = 0,
  prefix = '',
  suffix = '',
  className,
}: AnimatedNumberProps) {
  const [display, setDisplay] = useState(value)
  const prevRef = useRef(value)
  const isFirstRender = useRef(true)

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      setDisplay(value)
      prevRef.current = value
      return
    }
    const from = prevRef.current
    prevRef.current = value
    const controls = animate(from, value, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setDisplay(v),
    })
    return controls.stop
  }, [value, duration])

  const rounded = Math.round(display * Math.pow(10, decimals)) / Math.pow(10, decimals)
  const parts = rounded.toFixed(decimals).split('.')
  const intPart = Number(parts[0]).toLocaleString('en-PK')
  const formatted = decimals > 0 ? `${intPart}.${parts[1]}` : intPart

  return (
    <span className={className}>
      {prefix}{formatted}{suffix}
    </span>
  )
}
