import { getFreelancers } from '@/actions/freelancers'
import { FreelancersGrid } from '@/components/freelancers/freelancers-grid'

export default async function FreelancersPage() {
  const freelancers = await getFreelancers()

  return <FreelancersGrid initialFreelancers={freelancers} />
}
