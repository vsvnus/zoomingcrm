import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="relative min-h-screen bg-bg-primary">
      {/* Background gradiente sutil - adapta ao tema */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-accent-500/5 via-transparent to-transparent" />

      <Sidebar />

      <div className="pl-[280px]">
        <Header />

        <main className="relative min-h-[calc(100vh-4rem)] p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
