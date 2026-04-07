'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'

interface FilmCountdownProps {
  onComplete: () => void
}

export function FilmCountdown({ onComplete }: FilmCountdownProps) {
  const [count, setCount] = useState(3)
  const [showCountdown, setShowCountdown] = useState(true)

  useEffect(() => {
    // Skip if already seen this session
    if (sessionStorage.getItem('clapper-countdown-seen')) {
      setShowCountdown(false)
      onComplete()
      return
    }

    if (count === 0) {
      const timer = setTimeout(() => {
        sessionStorage.setItem('clapper-countdown-seen', '1')
        setShowCountdown(false)
        onComplete()
      }, 400)
      return () => clearTimeout(timer)
    }

    const timer = setTimeout(() => setCount(count - 1), 800)
    return () => clearTimeout(timer)
  }, [count, onComplete])

  return (
    <AnimatePresence>
      {showCountdown && (
        <motion.div
          key="countdown-overlay"
          className="fixed inset-0 z-[100] bg-black flex items-center justify-center"
          exit={{ opacity: 0, transition: { duration: 0.6, ease: 'easeInOut' } }}
        >
          {/* Film grain overlay */}
          <div className="absolute inset-0 opacity-[0.06] mix-blend-overlay pointer-events-none">
            <svg className="w-full h-full">
              <filter id="countdown-grain">
                <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" stitchTiles="stitch" />
                <feColorMatrix type="saturate" values="0" />
              </filter>
              <rect width="100%" height="100%" filter="url(#countdown-grain)" />
            </svg>
          </div>

          {/* Crosshair lines */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-px h-full bg-white/10" />
            <div className="absolute w-full h-px bg-white/10" />
            {/* Corner marks */}
            <div className="absolute top-[20%] left-[20%] w-8 h-8 border-l border-t border-white/20" />
            <div className="absolute top-[20%] right-[20%] w-8 h-8 border-r border-t border-white/20" />
            <div className="absolute bottom-[20%] left-[20%] w-8 h-8 border-l border-b border-white/20" />
            <div className="absolute bottom-[20%] right-[20%] w-8 h-8 border-r border-b border-white/20" />
          </div>

          {/* Countdown circle */}
          <svg viewBox="0 0 100 100" className="w-40 h-40 md:w-56 md:h-56 -rotate-90">
            <circle
              cx="50" cy="50" r="42"
              fill="none"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="1"
            />
            <motion.circle
              cx="50" cy="50" r="42"
              fill="none"
              stroke="rgba(255,255,255,0.6)"
              strokeWidth="1.5"
              strokeLinecap="round"
              initial={{ pathLength: 1 }}
              animate={{ pathLength: 0 }}
              transition={{ duration: 0.8, ease: 'linear' }}
              key={count}
            />
          </svg>

          {/* Number */}
          <AnimatePresence mode="wait">
            <motion.span
              key={count}
              className="absolute text-7xl md:text-9xl font-bold text-white font-mono tabular-nums"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.8, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              {count > 0 ? count : ''}
            </motion.span>
          </AnimatePresence>

          {/* Bottom text */}
          <div className="absolute bottom-[15%] text-center">
            <div className="text-[10px] tracking-[0.3em] text-white/30 uppercase font-mono">
              Clapper CRM
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
