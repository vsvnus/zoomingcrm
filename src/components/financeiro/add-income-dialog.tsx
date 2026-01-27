'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Plus } from 'lucide-react'
import { addTransaction } from '@/actions/financeiro'
import { useRouter } from 'next/navigation'

const INCOME_CATEGORIES = [
    { value: 'CLIENT_PAYMENT', label: 'Pagamento Cliente' },
    { value: 'ADDITIVE', label: 'Aditivo de Projeto' },
    { value: 'OTHER_INCOME', label: 'Outras Receitas' },
]

interface AddIncomeDialogProps {
    organizationId: string
    children?: React.ReactNode
}

export function AddIncomeDialog({ organizationId, children }: AddIncomeDialogProps) {
    const router = useRouter()
    const [open, setOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [formData, setFormData] = useState({
        description: '',
        category: '',
        amount: '',
        dueDate: '',
        notes: '',
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const amount = parseFloat(formData.amount)
            if (isNaN(amount) || amount <= 0) {
                alert('Valor inválido')
                setIsLoading(false)
                return
            }

            if (!formData.category) {
                alert('Selecione uma categoria')
                setIsLoading(false)
                return
            }

            await addTransaction({
                organization_id: organizationId,
                type: 'INCOME', // Fixed as INCOME
                category: formData.category as any,
                description: formData.description,
                amount: amount,
                status: 'PENDING',
                due_date: formData.dueDate || undefined,
                notes: formData.notes || undefined,
            })

            // Reset form
            setFormData({
                description: '',
                category: '',
                amount: '',
                dueDate: '',
                notes: '',
            })
            setOpen(false)
            router.refresh()
        } catch (error: any) {
            alert(error.message || 'Erro ao adicionar receita')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children || (
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Nova Receita
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Adicionar Nova Receita</DialogTitle>
                    <DialogDescription>
                        Registre uma nova receita manual (Para projetos, prefira usar o fluxo de propostas)
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">

                        {/* Categoria */}
                        <div className="grid gap-2">
                            <Label htmlFor="category">Categoria</Label>
                            <Select
                                value={formData.category}
                                onValueChange={(value) => setFormData({ ...formData, category: value })}
                                required
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione a categoria" />
                                </SelectTrigger>
                                <SelectContent>
                                    {INCOME_CATEGORIES.map((cat) => (
                                        <SelectItem key={cat.value} value={cat.value}>
                                            {cat.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Descrição */}
                        <div className="grid gap-2">
                            <Label htmlFor="description">Descrição</Label>
                            <Input
                                id="description"
                                placeholder="Ex: Venda de equipamento usado"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                required
                            />
                        </div>

                        {/* Valor */}
                        <div className="grid gap-2">
                            <Label htmlFor="amount">Valor (R$)</Label>
                            <Input
                                id="amount"
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="5000.00"
                                value={formData.amount}
                                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                required
                            />
                        </div>

                        {/* Data de Vencimento/Previsão */}
                        <div className="grid gap-2">
                            <Label htmlFor="dueDate">Data Prevista (Opcional)</Label>
                            <Input
                                id="dueDate"
                                type="date"
                                value={formData.dueDate}
                                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                            />
                        </div>

                        {/* Observações */}
                        <div className="grid gap-2">
                            <Label htmlFor="notes">Observações (Opcional)</Label>
                            <Textarea
                                id="notes"
                                placeholder="Informações adicionais..."
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                rows={3}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? 'Salvando...' : 'Adicionar Receita'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
