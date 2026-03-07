'use client'

import { createContext, useContext, useState } from 'react'

interface AIChatContextType {
  isOpen: boolean
  setIsOpen: (v: boolean) => void
}

const AIChatContext = createContext<AIChatContextType>({
  isOpen: false,
  setIsOpen: () => {},
})

export function AIChatProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <AIChatContext.Provider value={{ isOpen, setIsOpen }}>
      {children}
    </AIChatContext.Provider>
  )
}

export const useAIChat = () => useContext(AIChatContext)
