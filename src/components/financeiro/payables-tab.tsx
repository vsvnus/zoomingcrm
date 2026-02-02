'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import {
  Plus,
  ExternalLink,
  AlertCircle,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  Clock,
  FileWarning,
  Edit,
  Repeat,
} from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { AddExpenseDialog } from './add-expense-dialog'
import { EditExpenseDialog } from './edit-expense-dialog'
import { markAsPaid, cancelTransaction, updateTransaction } from '@/actions/financeiro'

interface PayablesTabProps {
  data: any[]
  onUpdate: (data: any) => void
  organizationId: string
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

function getStatusBadge(status: string, isOverdue: boolean) {
  if (isOverdue) {
    return (
      <Badge variant="error" className="gap-1">
        <AlertCircle className="h-3 w-3" />
        Vencida
      </Badge>
    )
  }

  switch (status) {
    case 'PENDING':
      return <Badge variant="outline">Pendente</Badge>
    case 'SCHEDULED':
      return <Badge variant="warning">Agendado</Badge>
    case 'PAID':
      return <Badge variant="success" className="bg-green-600">Pago</Badge>
    case 'CANCELLED':
      return <Badge variant="default">Cancelado</Badge>
    default:
      return <Badge>{status}</Badge>
  }
}

function getCategoryLabel(category: string) {
  const labels: Record<string, string> = {
    CREW_TALENT: 'Equipe/Talento',
    EQUIPMENT_RENTAL: 'Aluguel Equip.',
    LOCATION: 'Locação',
    LOGISTICS: 'Logística',
    POST_PRODUCTION: 'Pós-produção',
    PRODUCTION: 'Produção',
    OFFICE_RENT: 'Aluguel Escritório',
    UTILITIES: 'Utilidades',
    SOFTWARE: 'Software',
    SALARY: 'Salário',
    INSURANCE: 'Seguro',
    MARKETING: 'Marketing',
    MAINTENANCE: 'Manutenção',
    OTHER_EXPENSE: 'Outros',
  }
  return labels[category] || category
}

export function PayablesTab({ data, onUpdate, organizationId }: PayablesTabProps) {
  const [payables, setPayables] = useState(data)

  // Sync local state with props when data changes
  useEffect(() => {
    setPayables(data)
  }, [data])
  const [isLoading, setIsLoading] = useState<string | null>(null)

  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<any>(null)

  const handleEdit = (transaction: any) => {
    if (transaction.status === 'PAID') {
      if (!confirm('Esta conta já foi PAGA. Alterar o valor ou data pode afetar o fechamento de caixa e relatórios financeiros. Deseja continuar?')) {
        return
      }
    }
    setEditingTransaction(transaction)
    setEditDialogOpen(true)
  }

  const handleMarkAsPaid = async (id: string) => {
    if (!confirm('Confirmar pagamento desta despesa?')) return

    setIsLoading(id)
    try {
      await markAsPaid(id)
      // Atualizar estado local mantendo na lista com status atualizado
      const updatedPayables = payables.map((p) =>
        p.id === id ? { ...p, status: 'PAID' } : p
      )
      setPayables(updatedPayables)
      onUpdate?.((prev: any) => ({
        ...prev,
        payables: updatedPayables,
      }))
    } catch (error: any) {
      alert(error.message || 'Erro ao marcar como pago')
    } finally {
      setIsLoading(null)
    }
  }

  const handleSchedule = async (id: string) => {
    setIsLoading(id)
    try {
      await updateTransaction(id, { status: 'SCHEDULED' })
      const updatedPayables = payables.map((p) => (p.id === id ? { ...p, status: 'SCHEDULED' } : p))
      setPayables(updatedPayables)
      onUpdate?.((prev: any) => ({
        ...prev,
        payables: updatedPayables,
      }))
    } catch (error: any) {
      alert(error.message || 'Erro ao agendar pagamento')
    } finally {
      setIsLoading(null)
    }
  }

  const handleCancel = async (id: string) => {
    if (!confirm('Cancelar esta despesa? Esta ação não pode ser desfeita.')) return

    setIsLoading(id)
    try {
      await cancelTransaction(id)
      // Atualizar estado local mantendo na lista com status atualizado
      const updatedPayables = payables.map((p) =>
        p.id === id ? { ...p, status: 'CANCELLED' } : p
      )
      setPayables(updatedPayables)
      onUpdate?.((prev: any) => ({
        ...prev,
        payables: updatedPayables,
      }))
    } catch (error: any) {
      alert(error.message || 'Erro ao cancelar despesa')
    } finally {
      setIsLoading(null)
    }
  }

  if (payables.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-full bg-muted p-3 mb-4">
          <AlertCircle className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Nenhuma conta a pagar</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Comece adicionando suas despesas e custos de projetos
        </p>
        <AddExpenseDialog organizationId={organizationId} />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Contas a Pagar</h3>
          <p className="text-sm text-muted-foreground">
            {payables.length} despesa{payables.length !== 1 ? 's' : ''} pendente{payables.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex gap-2">
          <AddExpenseDialog organizationId={organizationId} />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Descrição</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Origem</TableHead>
              <TableHead>Beneficiário</TableHead>
              <TableHead>Vencimento</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payables.map((payable) => {
              const isOverdue = payable.is_overdue || false
              const VARIABLE_CATEGORIES = ['CREW_TALENT', 'EQUIPMENT_RENTAL', 'LOCATION', 'LOGISTICS', 'POST_PRODUCTION', 'PRODUCTION']
              // Se a categoria for variável, NÃO é fixo, mesmo se não tiver projeto (isso é um erro)
              const isFixed = !VARIABLE_CATEGORIES.includes(payable.category)
              const isPending = payable.status === 'PENDING' || payable.status === 'SCHEDULED'
              const isPaid = payable.status === 'PAID'
              const hasValidProject = payable.project_id && payable.projects?.title

              return (
                <TableRow key={payable.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {payable.description}
                      {payable.is_recurring && (
                        <Repeat className="h-3 w-3 text-blue-500" title="Despesa Recorrente" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {getCategoryLabel(payable.category)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {isFixed ? (
                      <span className="text-sm text-muted-foreground">
                        Custo Fixo
                      </span>
                    ) : hasValidProject ? (
                      <Link
                        href={`/projects/${payable.project_id}`}
                        className="flex items-center gap-1 text-blue-600 hover:underline"
                      >
                        {payable.projects.title}
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                    ) : (
                      <span className="flex items-center gap-1 text-sm text-muted-foreground" title="Despesa sem projeto vinculado (Custo Geral)">
                        <span className="w-2 h-2 rounded-full bg-slate-400" />
                        Geral / Avulso
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {payable.freelancers?.name || (
                      <span className="text-sm text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {payable.due_date ? (
                      <span className={isOverdue ? 'text-red-600 font-medium' : ''}>
                        {format(new Date(payable.due_date), 'dd/MM/yyyy', {
                          locale: ptBR,
                        })}
                      </span>
                    ) : (
                      <span className="text-sm text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="font-semibold">
                    {formatCurrency(payable.amount)}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(payable.status, isOverdue)}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          disabled={isLoading === payable.id}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleEdit(payable)}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>

                        {isPending && (
                          <>
                            <DropdownMenuItem
                              onClick={() => handleMarkAsPaid(payable.id)}
                              className="text-green-600"
                            >
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Marcar como Pago
                            </DropdownMenuItem>
                            {payable.status === 'PENDING' && (
                              <DropdownMenuItem onClick={() => handleSchedule(payable.id)}>
                                <Clock className="mr-2 h-4 w-4" />
                                Agendar Pagamento
                              </DropdownMenuItem>
                            )}
                          </>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleCancel(payable.id)}
                          className="text-red-600"
                        >
                          <XCircle className="mr-2 h-4 w-4" />
                          Cancelar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      <EditExpenseDialog
        organizationId={organizationId}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        transaction={editingTransaction}
      />
    </div>
  )
}
