'use client'

import { motion } from 'framer-motion'

interface ClapperboardProps {
  animate?: boolean
  className?: string
}

export function Clapperboard({ animate: shouldAnimate = true, className = '' }: ClapperboardProps) {
  return (
    <div className={`relative ${className}`}>
      <svg
        viewBox="0 0 200 160"
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Board body */}
        <rect x="10" y="50" width="180" height="100" rx="6" fill="#18181b" stroke="#3f3f46" strokeWidth="1.5" />

        {/* Text on board */}
        <text x="30" y="80" fill="#a1a1aa" fontSize="10" fontFamily="monospace" fontWeight="bold">PROD</text>
        <text x="30" y="95" fill="#71717a" fontSize="8" fontFamily="monospace">CLAPPER CRM</text>
        <line x1="30" y1="103" x2="170" y2="103" stroke="#27272a" strokeWidth="0.5" />
        <text x="30" y="118" fill="#71717a" fontSize="8" fontFamily="monospace">SCENE</text>
        <text x="80" y="118" fill="#e4e4e7" fontSize="10" fontFamily="monospace" fontWeight="bold">001</text>
        <text x="120" y="118" fill="#71717a" fontSize="8" fontFamily="monospace">TAKE</text>
        <text x="155" y="118" fill="#e4e4e7" fontSize="10" fontFamily="monospace" fontWeight="bold">01</text>
        <line x1="30" y1="125" x2="170" y2="125" stroke="#27272a" strokeWidth="0.5" />
        <text x="30" y="140" fill="#71717a" fontSize="8" fontFamily="monospace">DATE</text>
        <text x="70" y="140" fill="#a1a1aa" fontSize="8" fontFamily="monospace">2026</text>

        {/* Stripes on clapper stick (top part) */}
        <motion.g
          style={{ originX: '10px', originY: '50px' }}
          initial={shouldAnimate ? { rotate: -30 } : { rotate: 0 }}
          animate={{ rotate: 0 }}
          transition={shouldAnimate ? {
            type: 'spring' as const,
            stiffness: 400,
            damping: 10,
            mass: 0.8,
            delay: 0.2,
          } : { duration: 0 }}
        >
          {/* Clapper stick */}
          <rect x="10" y="20" width="180" height="32" rx="4" fill="#09090b" stroke="#3f3f46" strokeWidth="1.5" />
          {/* Diagonal stripes */}
          {[0, 1, 2, 3, 4].map((i) => (
            <rect
              key={i}
              x={20 + i * 36}
              y="20"
              width="18"
              height="32"
              fill={i % 2 === 0 ? '#fafafa' : '#09090b'}
              rx="1"
              clipPath="inset(0 round 4px)"
            />
          ))}
          {/* Clapper stick overlay for stripe clipping */}
          <rect x="10" y="20" width="180" height="32" rx="4" fill="none" stroke="#3f3f46" strokeWidth="1.5" />
        </motion.g>

        {/* Hinge circle */}
        <circle cx="20" cy="50" r="5" fill="#27272a" stroke="#52525b" strokeWidth="1" />
        <circle cx="20" cy="50" r="2" fill="#52525b" />
      </svg>
    </div>
  )
}
