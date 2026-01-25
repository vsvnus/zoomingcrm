'use server'

import { createClient, getUserOrganization } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const organizationSchema = z.object({
    name: z.string().min(1, 'Nome é obrigatório'),
    email: z.string().email('Email inválido'),
    phone: z.string().optional(),
    website: z.string().optional(),
    cnpj: z.string().optional(),
    address: z.string().optional(),
    bankName: z.string().optional(),
    agency: z.string().optional(),
    accountNumber: z.string().optional(),
    pixKey: z.string().optional(),
    primaryColor: z.string().optional(),
    logo: z.string().optional(),
    showBankInfo: z.boolean().optional(),
    defaultTerms: z.string().optional(),
})

export type OrganizationFormData = z.infer<typeof organizationSchema>

export async function getOrganization() {
    const supabase = await createClient()
    const organizationId = await getUserOrganization()

    const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', organizationId)
        .single()

    if (error) {
        console.error('Error fetching organization:', error)
        return null
    }

    return data
}

export async function updateOrganization(data: OrganizationFormData) {
    const supabase = await createClient()
    const organizationId = await getUserOrganization()

    const validatedData = organizationSchema.parse(data)

    const { error } = await supabase
        .from('organizations')
        .update({
            name: validatedData.name,
            email: validatedData.email,
            phone: validatedData.phone,
            website: validatedData.website,
            cnpj: validatedData.cnpj,
            address: validatedData.address,
            bank_name: validatedData.bankName,           // Map to snake_case column
            agency: validatedData.agency,
            account_number: validatedData.accountNumber, // Map to snake_case column
            pix_key: validatedData.pixKey,               // Map to snake_case column
            primary_color: validatedData.primaryColor,   // Map to snake_case column
            logo: validatedData.logo,
            show_bank_info: validatedData.showBankInfo,  // Map to snake_case column
            default_terms: validatedData.defaultTerms,   // Map to snake_case column
        })
        .eq('id', organizationId)

    if (error) {
        throw new Error('Error updating organization: ' + error.message)
    }

    revalidatePath('/settings/company')
    revalidatePath('/proposals')
}
