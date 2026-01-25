'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { updateUserProfile, type UserProfileFormData } from '@/actions/user'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Save } from 'lucide-react'
import { ImageUpload } from '@/components/ui/image-upload'

const profileSchema = z.object({
    name: z.string().min(1, 'Nome é obrigatório'),
    email: z.string().email('Email inválido'),
    avatar: z.string().optional(),
})

interface ProfileFormProps {
    initialData: any
}

export function ProfileForm({ initialData }: ProfileFormProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)

    const form = useForm<UserProfileFormData>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            name: initialData.name || '',
            email: initialData.email || '',
            avatar: initialData.avatar || '',
        },
    })

    async function onSubmit(data: UserProfileFormData) {
        setIsLoading(true)
        try {
            await updateUserProfile(data)
            alert('Perfil atualizado com sucesso!')
            router.refresh()
        } catch (error) {
            console.error(error)
            alert('Erro ao atualizar perfil.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Meu Perfil</CardTitle>
                    <CardDescription>
                        Gerencie suas informações pessoais.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label>Foto de Perfil</Label>
                        <ImageUpload
                            value={form.watch('avatar')}
                            onChange={(url) => form.setValue('avatar', url)}
                            onRemove={() => form.setValue('avatar', '')}
                            bucket="avatars"
                            className="w-32"
                            label="Alterar Foto"
                        />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nome Completo</Label>
                            <Input id="name" {...form.register('name')} />
                            {form.formState.errors.name && (
                                <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" {...form.register('email')} disabled className="bg-muted" />
                            <p className="text-xs text-muted-foreground">O email não pode ser alterado.</p>
                        </div>
                    </div>
                </CardContent>
                <div className="flex justify-end p-6 border-t bg-muted/20">
                    <Button type="submit" disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        <Save className="mr-2 h-4 w-4" />
                        Salvar Perfil
                    </Button>
                </div>
            </Card>
        </form>
    )
}
