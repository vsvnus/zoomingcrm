'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { updateOrganization, type OrganizationFormData } from '@/actions/organization'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { ImageUpload } from '@/components/ui/image-upload'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2, Save, Building2, Wallet, FileText, Palette } from 'lucide-react'

// Schema duplicate for client-side validation
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

interface CompanyFormProps {
    initialData: any // Using any to avoid complex Prisma types import for now
}

export function CompanyForm({ initialData }: CompanyFormProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)

    const form = useForm<OrganizationFormData>({
        resolver: zodResolver(organizationSchema),
        defaultValues: {
            name: initialData.name || '',
            email: initialData.email || '',
            phone: initialData.phone || '',
            website: initialData.website || '',
            cnpj: initialData.cnpj || '',
            address: initialData.address || '',
            bankName: initialData.bankName || '',
            agency: initialData.agency || '',
            accountNumber: initialData.accountNumber || '',
            pixKey: initialData.pixKey || '',
            primaryColor: initialData.primaryColor || '#000000',
            logo: initialData.logo || '',
            showBankInfo: initialData.show_bank_info ?? true,
            defaultTerms: initialData.defaultTerms || '',
        },
    })

    async function onSubmit(data: OrganizationFormData) {
        setIsLoading(true)
        try {
            await updateOrganization(data)
            // Show success toast (TODO: Add toast library)
            alert('Informações atualizadas com sucesso!')
            router.refresh()
        } catch (error) {
            console.error(error)
            alert('Erro ao atualizar informações.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Minha Empresa</h1>
                    <p className="text-muted-foreground">
                        Gerencie os dados da sua produtora para propostas e contratos.
                    </p>
                </div>
                <Button type="submit" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <Save className="mr-2 h-4 w-4" />
                    Salvar Alterações
                </Button>
            </div>

            <Tabs defaultValue="general" className="w-full">
                <TabsList className="w-full justify-start h-12 p-1 bg-muted/50 rounded-lg mb-6">
                    <TabsTrigger value="general" className="flex-1 max-w-[200px] gap-2">
                        <Building2 className="h-4 w-4" />
                        Geral
                    </TabsTrigger>
                    <TabsTrigger value="financial" className="flex-1 max-w-[200px] gap-2">
                        <Wallet className="h-4 w-4" />
                        Financeiro
                    </TabsTrigger>
                    <TabsTrigger value="branding" className="flex-1 max-w-[200px] gap-2">
                        <Palette className="h-4 w-4" />
                        Marca & Identidade
                    </TabsTrigger>
                    <TabsTrigger value="proposals" className="flex-1 max-w-[200px] gap-2">
                        <FileText className="h-4 w-4" />
                        Propostas
                    </TabsTrigger>
                </TabsList>

                {/* --- GERAL --- */}
                <TabsContent value="general">
                    <Card>
                        <CardHeader>
                            <CardTitle>Informações Básicas</CardTitle>
                            <CardDescription>
                                Dados principais de contato e identificação.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Nome da Produtora *</Label>
                                    <Input id="name" {...form.register('name')} placeholder="Ex: Studio Z Produções" />
                                    {form.formState.errors.name && (
                                        <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="cnpj">CNPJ</Label>
                                    <Input id="cnpj" {...form.register('cnpj')} placeholder="00.000.000/0000-00" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email de Contato *</Label>
                                    <Input id="email" type="email" {...form.register('email')} placeholder="contato@produtora.com" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Telefone / WhatsApp</Label>
                                    <Input id="phone" {...form.register('phone')} placeholder="(11) 99999-9999" />
                                </div>
                                <div className="col-span-2 space-y-2">
                                    <Label htmlFor="website">Site</Label>
                                    <Input id="website" {...form.register('website')} placeholder="https://www.produtora.com" />
                                </div>
                                <div className="col-span-2 space-y-2">
                                    <Label htmlFor="address">Endereço Completo</Label>
                                    <Textarea
                                        id="address"
                                        {...form.register('address')}
                                        placeholder="Rua, Número, Bairro, Cidade - UF, CEP"
                                        className="min-h-[80px]"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* --- FINANCEIRO --- */}
                <TabsContent value="financial">
                    <Card>
                        <CardHeader>
                            <CardTitle>Dados Bancários</CardTitle>
                            <CardDescription>
                                Informações que aparecerão nas propostas para pagamento.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="bankName">Banco</Label>
                                    <Input id="bankName" {...form.register('bankName')} placeholder="Ex: Nubank, Itaú" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="pixKey">Chave PIX (Principal)</Label>
                                    <Input id="pixKey" {...form.register('pixKey')} placeholder="CPF, Email ou Aleatória" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="agency">Agência</Label>
                                    <Input id="agency" {...form.register('agency')} placeholder="0000" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="accountNumber">Conta Corrente</Label>
                                    <Input id="accountNumber" {...form.register('accountNumber')} placeholder="00000-0" />
                                </div>
                            </div>

                            <div className="flex items-center space-x-2 pt-4 border-t">
                                <Switch
                                    id="showBankInfo"
                                    checked={form.watch('showBankInfo')}
                                    onCheckedChange={(checked) => form.setValue('showBankInfo', checked)}
                                />
                                <Label htmlFor="showBankInfo">Exibir dados bancários nas propostas?</Label>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* --- BRANDING --- */}
                <TabsContent value="branding">
                    <Card>
                        <CardHeader>
                            <CardTitle>Identidade Visual</CardTitle>
                            <CardDescription>
                                Personalize as cores e logotipo das suas propostas.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="primaryColor">Cor Principal (HEX)</Label>
                                    <div className="flex gap-3">
                                        <Input
                                            id="primaryColor"
                                            type="color"
                                            className="w-12 h-10 p-1 cursor-pointer"
                                            {...form.register('primaryColor')}
                                        />
                                        <Input
                                            type="text"
                                            {...form.register('primaryColor')}
                                            placeholder="#000000"
                                            className="font-mono uppercase"
                                        />
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Usada em botões e destaques nas propostas.
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label>Logotipo</Label>
                                    <ImageUpload
                                        value={form.watch('logo')}
                                        onChange={(url) => form.setValue('logo', url)}
                                        onRemove={() => form.setValue('logo', '')}
                                        bucket="logos" // Added bucket prop as per instruction
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* --- PROPOSTAS --- */}
                <TabsContent value="proposals">
                    <Card>
                        <CardHeader>
                            <CardTitle>Padrões de Proposta</CardTitle>
                            <CardDescription>
                                Textos padrão que serão inseridos em novas propostas.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="defaultTerms">Termos e Condições Padrão</Label>
                                <Textarea
                                    id="defaultTerms"
                                    {...form.register('defaultTerms')}
                                    placeholder="Ex: Pagamento 50% na aprovação e 50% na entrega. Prazo de validade da proposta: 7 dias..."
                                    className="min-h-[200px] font-mono text-sm leading-relaxed"
                                />
                                <p className="text-xs text-muted-foreground">
                                    Este texto aparecerá automaticamente no rodapé de novas propostas.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </form>
    )
}
