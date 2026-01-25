import { getOrganization } from '@/actions/organization'
import { CompanyForm } from '@/components/settings/company-form'

export default async function SettingsCompanyPage() {
    const organization = await getOrganization()

    return (
        <div className="container mx-auto py-8">
            <CompanyForm initialData={organization} />
        </div>
    )
}
