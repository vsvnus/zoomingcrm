import { getProposal } from '@/actions/proposals'
import { ProposalEditor } from '@/components/proposals/proposal-editor'
import { notFound } from 'next/navigation'

export default async function ProposalEditPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const proposal = await getProposal(id)

  if (!proposal) {
    notFound()
  }

  return <ProposalEditor proposal={proposal} />
}
