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

      await addTransaction({
        organization_id: organizationId,
        type: 'EXPENSE',
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
      <DialogContent className="sm:max-w-[500px]">
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
                  setFormData({ ...formData, category: '' })
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
              <Label htmlFor="amount">Valor (R$)</Label>
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

            {/* Data de Vencimento */}
            <div className="grid gap-2">
              <Label htmlFor="dueDate">Data de Vencimento (Opcional)</Label>
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
              {isLoading ? 'Salvando...' : 'Adicionar Despesa'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
