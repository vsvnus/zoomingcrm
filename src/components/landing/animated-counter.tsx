'use client'

import { useMotionValue, useTransform, animate, type MotionValue } from 'framer-motion'
import { useEffect, useRef } from 'react'
import { useInView } from 'framer-motion'

interface AnimatedCounterProps {
  target: number
  prefix?: string
  suffix?: string
  duration?: number
  className?: string
}

export function AnimatedCounter({
  target,
  prefix = '',
  suffix = '',
  duration = 2,
  className = '',
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true, amount: 0.5 })
  const motionValue = useMotionValue(0)
  const rounded = useTransform(motionValue, (v: number) => {
    if (target >= 1000000) {
      return (v / 1000000).toFixed(1).replace('.', ',') + 'M'
    }
    if (target >= 1000) {
      return Math.round(v).toLocaleString('pt-BR')
    }
    return Math.round(v).toString()
  })

  useEffect(() => {
    if (isInView) {
      animate(motionValue, target, {
        duration,
        ease: 'easeOut',
      })
    }
  }, [isInView, motionValue, target, duration])

  return (
    <span ref={ref} className={`tabular-nums ${className}`}>
      {prefix}
      <span>{isInView ? '' : '0'}</span>
      {isInView && <MotionSpan value={rounded} />}
      {suffix}
    </span>
  )
}

function MotionSpan({ value }: { value: MotionValue<string> }) {
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const unsubscribe = value.on('change', (v: string) => {
      if (ref.current) ref.current.textContent = v
    })
    return unsubscribe
  }, [value])

  return <span ref={ref} />
}
