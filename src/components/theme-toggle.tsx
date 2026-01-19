'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Evitar hidratação mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <button
        className="relative flex h-10 w-10 items-center justify-center rounded-lg border border-[rgb(var(--glass-border))] bg-[rgb(var(--bg-secondary))] smooth-fast hover:bg-[rgb(var(--bg-hover))]"
        aria-label="Toggle theme"
      >
        <div className="h-5 w-5" />
      </button>
    )
  }

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="relative flex h-10 w-10 items-center justify-center rounded-lg border border-[rgb(var(--glass-border))] bg-[rgb(var(--bg-secondary))] smooth-fast hover:bg-[rgb(var(--bg-hover))]"
      aria-label="Toggle theme"
    >
      <Sun className="h-5 w-5 rotate-0 scale-100 text-[rgb(var(--text-secondary))] transition-transform dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 text-[rgb(var(--text-secondary))] transition-transform dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </button>
  )
}
