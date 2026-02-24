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
  DialogTrigger,
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
import { Plus } from 'lucide-react'
import { addTransaction, addInstallmentTransactions } from '@/actions/financeiro'
import { useRouter } from 'next/navigation'
import { getProjects } from '@/actions/projects'

// SPRINT 1: Categorias de despesas - Fixo e Variável
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

interface AddExpenseDialogProps {
  organizationId: string
  children?: React.ReactNode
}

export function AddExpenseDialog({ organizationId, children }: AddExpenseDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [expenseType, setExpenseType] = useState<'fixed' | 'variable'>('variable')
  const [isRecurring, setIsRecurring] = useState(false)
  const [isInstallment, setIsInstallment] = useState(false)
  const [installmentsCount, setInstallmentsCount] = useState(2)
  const [installments, setInstallments] = useState<{ date: string; amount: number }[]>([])

  const [projects, setProjects] = useState<any[]>([])
  const [formData, setFormData] = useState({
    description: '',
    category: '',
    amount: '',
    dueDate: '',
    notes: '',
    projectId: '',
  })

  // Fetch projects on mount
  useEffect(() => {
    getProjects().then(setProjects)
  }, [])

  // Generate installment DATES only when enabling installments, changing count, or first due date
  // User-selected dates for each installment are preserved when only the amount changes
  useEffect(() => {
    if (isInstallment && formData.dueDate) {
      const total = parseFloat(formData.amount) || 0
      const count = Math.max(2, installmentsCount)
      const baseAmount = total > 0 ? Math.floor((total / count) * 100) / 100 : 0
      const remainder = total > 0 ? Math.round((total - baseAmount * count) * 100) / 100 : 0

      const newInstallments = []
      const [y, m, d] = formData.dueDate.split('-').map(Number)

      for (let i = 0; i < count; i++) {
        const date = new Date(y, m - 1 + i, d)
        if (date.getDate() !== d) {
          date.setDate(0)
        }

        let amount = baseAmount
        if (i === 0) amount += remainder

        newInstallments.push({
          date: date.toISOString().split('T')[0],
          amount
        })
      }
      setInstallments(newInstallments)
    }
  }, [isInstallment, formData.dueDate, installmentsCount])

  // Recalculate only AMOUNTS when total changes — preserve user-set dates
  useEffect(() => {
    if (isInstallment && installments.length > 0 && formData.amount) {
      const total = parseFloat(formData.amount)
      if (isNaN(total) || total <= 0) return

      const count = installments.length
      const baseAmount = Math.floor((total / count) * 100) / 100
      const remainder = Math.round((total - baseAmount * count) * 100) / 100

      setInstallments(prev => prev.map((inst, i) => ({
        ...inst,
        amount: i === 0 ? baseAmount + remainder : baseAmount
      })))
    }
  }, [formData.amount])

  const handleInstallmentChange = (index: number, field: 'date' | 'amount', value: string) => {
    const newInstallments = [...installments]
    if (field === 'date') {
      newInstallments[index].date = value
    } else {
      newInstallments[index].amount = parseFloat(value) || 0
    }
    setInstallments(newInstallments)
  }

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

      if (isInstallment) {
        // Validation for installments totals
        const installmentTotal = installments.reduce((sum, item) => sum + item.amount, 0)
        if (Math.abs(installmentTotal - amount) > 0.05) {
          if (!confirm(`O total das parcelas (R$ ${installmentTotal.toFixed(2)}) é diferente do valor total (R$ ${amount.toFixed(2)}). Deseja continuar mesmo assim?`)) {
            setIsLoading(false)
            return
          }
        }

        const transactions = installments.map((inst, index) => ({
          organization_id: organizationId,
          type: 'EXPENSE' as const, // Cast needed for TS
          category: formData.category as any,
          description: `${formData.description} (${index + 1}/${installments.length})`,
          amount: inst.amount,
          status: 'PENDING' as const, // Cast needed
          due_date: inst.date,
          notes: formData.notes || undefined,
          project_id: formData.projectId || undefined,
          is_recurring: false, // Installments are NOT recurring in the infinite sense
        }))

        await addInstallmentTransactions(transactions)
      } else {
        await addTransaction({
          organization_id: organizationId,
          type: 'EXPENSE',
          category: formData.category as any,
          description: formData.description,
          amount: amount,
          status: 'PENDING',
          due_date: formData.dueDate || undefined,
          notes: formData.notes || undefined,
          project_id: formData.projectId || undefined,
          is_recurring: isRecurring,
          recurrence_period: isRecurring ? 'MONTHLY' : undefined,
        })
      }

      // Reset form
      setFormData({
        description: '',
        category: '',
        amount: '',
        dueDate: '',
        notes: '',
        projectId: '',
      })
      setIsRecurring(false)
      setIsInstallment(false)
      setInstallmentsCount(2)
      setOpen(false)
      router.refresh()
    } catch (error: any) {
      alert(error.message || 'Erro ao adicionar despesa')
    } finally {
      setIsLoading(false)
    }
  }

  const allCategories = [...EXPENSE_CATEGORIES.variable, ...EXPENSE_CATEGORIES.fixed]
  const filteredCategories =
    expenseType === 'variable' ? EXPENSE_CATEGORIES.variable : EXPENSE_CATEGORIES.fixed

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nova Despesa
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Adicionar Nova Despesa</DialogTitle>
          <DialogDescription>
            Registre uma nova despesa fixa (mensal) ou variável (projeto)
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* Tipo de Despesa */}
            <div className="grid gap-2">
              <Label htmlFor="expenseType">Tipo de Despesa</Label>
              <Select
                value={expenseType}
                onValueChange={(value: 'fixed' | 'variable') => {
                  setExpenseType(value)
                  setFormData({ ...formData, category: '', projectId: '' })
                }}
              >
                <SelectTrigger>
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
                <Label htmlFor="project">Projeto (Opcional)</Label>
                <Select
                  value={formData.projectId}
                  onValueChange={(value) => setFormData({ ...formData, projectId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o projeto (ou deixe em branco)" />
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
              <Label htmlFor="description">Descrição</Label>
              <Input
                id="description"
                placeholder="Ex: Pagamento freelancer João"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
            </div>

            {/* Valor */}
            <div className="grid gap-2">
              <Label htmlFor="amount">Valor Total (R$)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="1500.00"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                required
              />
            </div>

            {/* Data de Vencimento (1ª Parcela) */}
            <div className="grid gap-2">
              <Label htmlFor="dueDate">
                {isInstallment ? 'Vencimento da 1ª Parcela' : 'Data de Vencimento (Opcional)'}
              </Label>
              <Input
                id="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                required={isInstallment}
              />
            </div>

            {/* Opções de Repetição: Recorrência ou Parcelamento */}
            <div className="flex gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="recurring"
                  checked={isRecurring}
                  onCheckedChange={(checked) => {
                    setIsRecurring(checked as boolean)
                    if (checked) setIsInstallment(false)
                  }}
                  disabled={isInstallment}
                />
                <Label htmlFor="recurring" className="cursor-pointer">
                  Recorrente (Mensal)
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="installment"
                  checked={isInstallment}
                  onCheckedChange={(checked) => {
                    setIsInstallment(checked as boolean)
                    if (checked) setIsRecurring(false)
                  }}
                  disabled={isRecurring}
                />
                <Label htmlFor="installment" className="cursor-pointer">
                  Parcelado
                </Label>
              </div>
            </div>

            {/* Área de Parcelamento */}
            {isInstallment && (
              <div className="space-y-4 rounded-md border p-4 bg-muted/20">
                <div className="grid gap-2">
                  <Label htmlFor="installmentsCount">Número de Parcelas</Label>
                  <Select
                    value={String(installmentsCount)}
                    onValueChange={(val) => setInstallmentsCount(parseInt(val))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[2, 3, 4, 5, 6, 9, 10, 12, 18, 24, 36, 48].map((n) => (
                        <SelectItem key={n} value={String(n)}>{n}x</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Simulação de Parcelas</Label>
                  {installments.map((inst, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <span className="text-xs text-muted-foreground w-6">{idx + 1}x</span>
                      <Input
                        type="date"
                        value={inst.date}
                        onChange={(e) => handleInstallmentChange(idx, 'date', e.target.value)}
                        className="flex-1 h-8"
                      />
                      <div className="relative w-32">
                        <span className="absolute left-2 top-1.5 text-xs">R$</span>
                        <Input
                          type="number"
                          value={inst.amount}
                          onChange={(e) => handleInstallmentChange(idx, 'amount', e.target.value)}
                          className="w-full h-8 pl-6"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

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
              {isLoading ? 'Salvando...' : 'Adicionar Despesa'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
