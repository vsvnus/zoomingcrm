import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { getFreelancerWithDetails } from '@/actions/assignments'
import { FreelancerDetailTabs } from '@/components/freelancers/freelancer-detail-tabs'

interface PageProps {
    params: Promise<{ id: string }>
}

async function FreelancerData({ id }: { id: string }) {
    const freelancer = await getFreelancerWithDetails(id)

    if (!freelancer) {
        notFound()
    }

    return <FreelancerDetailTabs freelancer={freelancer} />
}

function FreelancerLoading() {
    return (
        <div className="flex items-center justify-center h-[60vh]">
            <div className="animate-spin h-8 w-8 border-2 border-accent-500 border-t-transparent rounded-full" />
        </div>
    )
}

export default async function FreelancerDetailPage({ params }: PageProps) {
    const { id } = await params

    return (
        <Suspense fallback={<FreelancerLoading />}>
            <FreelancerData id={id} />
        </Suspense>
    )
}
