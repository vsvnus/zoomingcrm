'use client'

import { motion } from 'framer-motion'

interface CinematicTextProps {
  text: string
  className?: string
  delay?: number
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span'
}

const container = {
  hidden: { opacity: 0 },
  visible: (delay: number) => ({
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: delay },
  }),
}

const word = {
  hidden: { opacity: 0, y: 20, filter: 'blur(8px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { type: 'spring' as const, damping: 20, stiffness: 100 },
  },
}

export function CinematicText({ text, className = '', delay = 0, as: Tag = 'h1' }: CinematicTextProps) {
  const words = text.split(' ')

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="visible"
      custom={delay}
      className={className}
    >
      {words.map((w, i) => (
        <motion.span
          key={i}
          variants={word}
          className="inline-block mr-[0.25em]"
        >
          {w}
        </motion.span>
      ))}
    </motion.div>
  )
}
