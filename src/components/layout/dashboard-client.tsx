'use client'

import { AIChatProvider } from '@/components/ai/ai-chat-context'
import { Header } from './header'
import { AIChatWidget } from '@/components/ai/ai-chat-widget'

export function DashboardClient({ children }: { children: React.ReactNode }) {
  return (
    <AIChatProvider>
      <div className="pl-[280px]">
        <Header />
        <main className="relative min-h-[calc(100vh-4rem)] p-8">
          {children}
        </main>
      </div>
      <AIChatWidget />
    </AIChatProvider>
  )
}
