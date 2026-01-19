import { Suspense } from 'react'
import { getClients } from '@/actions/clients'
import { ClientsGrid } from '@/components/clients/clients-grid'

async function ClientsData() {
  const clients = await getClients()
  return <ClientsGrid initialClients={clients} />
}

function ClientsLoading() {
  return (
    <div className="flex items-center justify-center h-[60vh]">
      <div className="animate-spin h-8 w-8 border-2 border-accent-500 border-t-transparent rounded-full" />
    </div>
  )
}

export default function ClientsPage() {
  return (
    <Suspense fallback={<ClientsLoading />}>
      <ClientsData />
    </Suspense>
  )
}
