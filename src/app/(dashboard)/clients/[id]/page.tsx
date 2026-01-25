import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { getClient, getClientProjects, getClientProposals, getClientFinancials } from '@/actions/clients'
import { ClientDetailTabs } from '@/components/clients/client-detail-tabs'

interface PageProps {
  params: Promise<{ id: string }>
}

async function ClientData({ id }: { id: string }) {
  const client = await getClient(id)

  if (!client) {
    notFound()
  }

  const [projects, proposals, financials] = await Promise.all([
    getClientProjects(id),
    getClientProposals(id),
    getClientFinancials(id),
  ])

  return (
    <ClientDetailTabs
      client={client}
      projects={projects}
      proposals={proposals}
      financials={financials}
    />
  )
}

function ClientLoading() {
  return (
    <div className="flex items-center justify-center h-[60vh]">
      <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
    </div>
  )
}

export default async function ClientDetailPage({ params }: PageProps) {
  const { id } = await params

  return (
    <Suspense fallback={<ClientLoading />}>
      <ClientData id={id} />
    </Suspense>
  )
}
