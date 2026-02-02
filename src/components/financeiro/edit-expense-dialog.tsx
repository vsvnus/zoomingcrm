'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'
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
import { updateTransaction } from '@/actions/financeiro'
import { useRouter } from 'next/navigation'
import { Transaction } from '@/actions/financeiro' // Add this export to actions/financeiro.ts if not present, otherwise generic any
import { format } from 'date-fns'
import { getProjects } from '@/actions/projects'

// Categorias de despesas (Same as AddExpenseDialog)
const EXPENSE_CATEGORIES = {
    variable: [
        { value: 'CREW_TALENT', label: 'Equipe/Talento', type: 'Variável' },
        { value: 'EQUIPMENT_RENTAL', label: 'Aluguel de Equipamento', type: 'Variável' },
        { value: 'LOCATION', label: 'Locação', type: 'Variável' },
        { value: 'LOGISTICS', label: 'Logística', type: 'Variável' },
        { value: 'POST_PRODUCTION', label: 'Pós-produção', type: 'Variável' },
        { value: 'PRODUCTION', label: 'Produção', type: 'Variável' },
    ],
    fixed: [
        { value: 'OFFICE_RENT', label: 'Aluguel Escritório', type: 'Fixo Mensal' },
        { value: 'UTILITIES', label: 'Contas (Água, Luz, Internet)', type: 'Fixo Mensal' },
        { value: 'SOFTWARE', label: 'Software/Assinaturas', type: 'Fixo Mensal' },
        { value: 'SALARY', label: 'Salários', type: 'Fixo Mensal' },
        { value: 'INSURANCE', label: 'Seguros', type: 'Fixo Mensal' },
        { value: 'MARKETING', label: 'Marketing', type: 'Fixo Mensal' },
        { value: 'MAINTENANCE', label: 'Manutenção', type: 'Fixo Mensal' },
        { value: 'OTHER_EXPENSE', label: 'Outros', type: 'Fixo Mensal' },
    ],
}

interface EditExpenseDialogProps {
    organizationId: string
    open: boolean
    onOpenChange: (open: boolean) => void
    transaction: any // Using any for now to avoid extensive type imports issues, ideally strict type
}

export function EditExpenseDialog({ organizationId, open, onOpenChange, transaction }: EditExpenseDialogProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [expenseType, setExpenseType] = useState<'fixed' | 'variable'>('variable')
    const [isRecurring, setIsRecurring] = useState(false)
    const [projects, setProjects] = useState<any[]>([])
    const [formData, setFormData] = useState({
        description: '',
        category: '',
        amount: '',
        dueDate: '',
        notes: '',
        projectId: '',
    })

    // Fetch projects
    useEffect(() => {
        getProjects().then(setProjects)
    }, [])

    useEffect(() => {
        if (transaction) {
            // Determine if fixed or variable based on category logic or existing data
            // Simple heuristic: if category is in fixed list, set fixed.
            const isFixed = EXPENSE_CATEGORIES.fixed.some(c => c.value === transaction.category)
            setExpenseType(isFixed ? 'fixed' : 'variable')
            setIsRecurring(transaction.is_recurring || false)

            setFormData({
                description: transaction.description || '',
                category: transaction.category || '',
                amount: transaction.amount?.toString() || '',
                dueDate: transaction.due_date ? format(new Date(transaction.due_date), 'yyyy-MM-dd') : '',
                notes: transaction.notes || '',
                projectId: transaction.project_id || '',
            })
        }
    }, [transaction])

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

            if (expenseType === 'variable' && !formData.projectId) {
                alert('Selecione um projeto para despesa variável')
                setIsLoading(false)
                return
            }

            await updateTransaction(transaction.id, {
                category: formData.category as any,
                description: formData.description,
                amount: amount,
                due_date: formData.dueDate || undefined,
                notes: formData.notes || undefined,
                project_id: formData.projectId || undefined, // Allow clearing project if switching types
            })

            onOpenChange(false)
            router.refresh()
        } catch (error: any) {
            alert(error.message || 'Erro ao atualizar despesa')
        } finally {
            setIsLoading(false)
        }
    }

    const allCategories = [...EXPENSE_CATEGORIES.variable, ...EXPENSE_CATEGORIES.fixed]
    const filteredCategories =
        expenseType === 'variable' ? EXPENSE_CATEGORIES.variable : EXPENSE_CATEGORIES.fixed

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Editar Despesa</DialogTitle>
                    <DialogDescription>
                        Alterar detalhes da despesa.
                        {transaction?.status === 'PAID' && (
                            <span className="block mt-2 text-amber-600 font-medium bg-amber-50 p-2 rounded">
                                Atenção: Esta conta já está PAGA. Alterar o valor afetará o saldo atual.
                            </span>
                        )}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        {/* Tipo de Despesa */}
                        <div className="grid gap-2">
                            <Label htmlFor="edit-expenseType">Tipo de Despesa</Label>
                            <Select
                                value={expenseType}
                                onValueChange={(value: 'fixed' | 'variable') => {
                                    setExpenseType(value)
                                    setFormData({ ...formData, category: '', projectId: '' })
                                }}
                            >
                                <SelectTrigger id="edit-expenseType">
                                    <SelectValue placeholder="Selecione o tipo" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="variable">💼 Despesa Variável (Projeto)</SelectItem>
                                    <SelectItem value="fixed">📅 Custo Fixo Mensal</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Projeto (Apenas para Variável) */}
                        {expenseType === 'variable' && (
                            <div className="grid gap-2">
                                <Label htmlFor="edit-project">Projeto</Label>
                                <Select
                                    value={formData.projectId}
                                    onValueChange={(value) => setFormData({ ...formData, projectId: value })}
                                    required
                                >
                                    <SelectTrigger id="edit-project">
                                        <SelectValue placeholder="Selecione o projeto" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {projects.map((project) => (
                                            <SelectItem key={project.id} value={project.id}>
                                                {project.title}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {/* Categoria */}
                        <div className="grid gap-2">
                            <Label htmlFor="edit-category">Categoria</Label>
                            <Select
                                value={formData.category}
                                onValueChange={(value) => setFormData({ ...formData, category: value })}
                                required
                            >
                                <SelectTrigger id="edit-category">
                                    <SelectValue placeholder="Selecione a categoria" />
                                </SelectTrigger>
                                <SelectContent>
                                    {filteredCategories.map((cat) => (
                                        <SelectItem key={cat.value} value={cat.value}>
                                            {cat.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Descrição */}
                        <div className="grid gap-2">
                            <Label htmlFor="edit-description">Descrição</Label>
                            <Input
                                id="edit-description"
                                placeholder="Ex: Pagamento freelancer João"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                required
                            />
                        </div>

                        {/* Valor */}
                        <div className="grid gap-2">
                            <Label htmlFor="edit-amount">Valor (R$)</Label>
                            <Input
                                id="edit-amount"
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="1500.00"
                                value={formData.amount}
                                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                required
                            />
                        </div>

                        {/* Data de Vencimento */}
                        <div className="grid gap-2">
                            <Label htmlFor="edit-dueDate">Data de Vencimento (Opcional)</Label>
                            <Input
                                id="edit-dueDate"
                                type="date"
                                value={formData.dueDate}
                                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                            />
                        </div>

                        {/* Recorrência */}
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="edit-recurring"
                                checked={isRecurring}
                                onCheckedChange={(checked) => setIsRecurring(checked as boolean)}
                            />
                            <Label htmlFor="edit-recurring" className="cursor-pointer">
                                Despesa Recorrente (Mensal)
                            </Label>
                        </div>

                        {/* Observações */}
                        <div className="grid gap-2">
                            <Label htmlFor="edit-notes">Observações (Opcional)</Label>
                            <Textarea
                                id="edit-notes"
                                placeholder="Informações adicionais..."
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                rows={3}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? 'Salvando...' : 'Salvar Alterações'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
