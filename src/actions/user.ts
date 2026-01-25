'use server'

import { createClient, getUserOrganization } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const userProfileSchema = z.object({
    name: z.string().min(1, 'Nome é obrigatório'),
    email: z.string().email('Email inválido'),
    avatar: z.string().optional(),
    // Add more fields as needed (e.g. phone, bio, notification preferences)
})

export type UserProfileFormData = z.infer<typeof userProfileSchema>

export async function getUserProfile() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('Unauthorized')
    }

    // Fetch db user details
    const { data: dbUser, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', user.email)
        .single()

    if (error) {
        console.error("Error fetching user profile:", error)
        return null
    }

    return dbUser
}

export async function updateUserProfile(data: UserProfileFormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('Unauthorized')
    }

    const validatedData = userProfileSchema.parse(data)

    const { error } = await supabase
        .from('users')
        .update({
            name: validatedData.name,
            avatar: validatedData.avatar,
        })
        .eq('email', validatedData.email) // Assuming email is immutable key for linking auth to user table for now

    if (error) {
        throw new Error('Error updating profile: ' + error.message)
    }

    revalidatePath('/settings/profile')
}
