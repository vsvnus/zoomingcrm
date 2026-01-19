import { getProposalByToken } from '@/actions/proposals'
import { ProposalPublicView } from '@/components/proposals/proposal-public-view'
import { notFound } from 'next/navigation'

export default async function PublicProposalPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  const proposal = await getProposalByToken(token)

  if (!proposal) {
    notFound()
  }

  return <ProposalPublicView proposal={proposal} />
}
