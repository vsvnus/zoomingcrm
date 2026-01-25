import { getUserProfile } from '@/actions/user'
import { ProfileForm } from '@/components/settings/profile-form'

export default async function SettingsProfilePage() {
    const user = await getUserProfile()

    if (!user) {
        return <div>Erro ao carregar perfil.</div>
    }

    return (
        <div className="container mx-auto py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Configurações de Perfil</h1>
                <p className="text-muted-foreground">
                    Gerencie seus dados de acesso e preferências pessoais.
                </p>
            </div>
            <ProfileForm initialData={user} />
        </div>
    )
}
