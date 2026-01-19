import { Suspense } from 'react'
import { getProposals } from '@/actions/proposals'
import { ProposalsList } from '@/components/proposals/proposals-list'

async function ProposalsData() {
  const proposals = await getProposals()
  return <ProposalsList initialProposals={proposals} />
}

function ProposalsLoading() {
  return (
    <div className="flex items-center justify-center h-[60vh]">
      <div className="animate-spin h-8 w-8 border-2 border-accent-500 border-t-transparent rounded-full" />
    </div>
  )
}

export default function ProposalsPage() {
  return (
    <Suspense fallback={<ProposalsLoading />}>
      <ProposalsData />
    </Suspense>
  )
}
