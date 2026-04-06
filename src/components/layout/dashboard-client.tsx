'use client'

import { AIChatProvider } from '@/components/ai/ai-chat-context'
import { Header } from './header'
import { AIChatWidget } from '@/components/ai/ai-chat-widget'
import { BottomTabBar } from './bottom-tab-bar'
import { OnboardingTour } from '@/components/onboarding/onboarding-tour'

interface DashboardClientProps {
  children: React.ReactNode
  showOnboarding?: boolean
  userName?: string
}

export function DashboardClient({ children, showOnboarding, userName }: DashboardClientProps) {
  return (
    <AIChatProvider>
      <div className="pl-0 md:pl-[280px]">
        <Header />
        <main className="relative min-h-[calc(100vh-4rem)] p-4 pb-20 md:p-8 md:pb-8">
          {children}
        </main>
      </div>
      <AIChatWidget />
      <BottomTabBar />
      {showOnboarding && <OnboardingTour userName={userName || 'Usuário'} />}
    </AIChatProvider>
  )
}
