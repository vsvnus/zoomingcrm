'use client'

import { useState } from 'react'
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
  TrendingUp,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  Clock,
  FileWarning,
} from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { markAsPaid, cancelTransaction, updateTransaction } from '@/actions/financeiro'

interface ReceivablesTabProps {
  data: any[]
  onUpdate: (data: any) => void
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
        Atrasado
      </Badge>
    )
  }

  switch (status) {
    case 'PENDING':
      return <Badge variant="outline">Pendente</Badge>
    case 'SCHEDULED':
      return <Badge variant="warning">Agendado</Badge>
    case 'PAID':
      return (
        <Badge variant="success" className="bg-green-600 gap-1">
          <TrendingUp className="h-3 w-3" />
          Recebido
        </Badge>
      )
    case 'CANCELLED':
      return <Badge variant="default">Cancelado</Badge>
    default:
      return <Badge>{status}</Badge>
  }
}

function getCategoryLabel(category: string) {
  const labels: Record<string, string> = {
    CLIENT_PAYMENT: 'Pagamento Cliente',
    ADDITIVE: 'Aditivo',
    OTHER_INCOME: 'Outras Receitas',
  }
  return labels[category] || category
}

export function ReceivablesTab({ data, onUpdate }: ReceivablesTabProps) {
  const [receivables, setReceivables] = useState(data)
  const [isLoading, setIsLoading] = useState<string | null>(null)

  const handleMarkAsReceived = async (id: string) => {
    if (!confirm('Confirmar recebimento desta receita?')) return

    setIsLoading(id)
    try {
      await markAsPaid(id)
      setReceivables(receivables.map((r) => (r.id === id ? { ...r, status: 'PAID' } : r)))
      onUpdate?.(receivables)
    } catch (error: any) {
      alert(error.message || 'Erro ao marcar como recebido')
    } finally {
      setIsLoading(null)
    }
  }

  const handleSchedule = async (id: string) => {
    setIsLoading(id)
    try {
      await updateTransaction(id, { status: 'SCHEDULED' })
      setReceivables(receivables.map((r) => (r.id === id ? { ...r, status: 'SCHEDULED' } : r)))
      onUpdate?.(receivables)
    } catch (error: any) {
      alert(error.message || 'Erro ao agendar recebimento')
    } finally {
      setIsLoading(null)
    }
  }

  const handleCancel = async (id: string) => {
    if (!confirm('Cancelar esta receita? Esta ação não pode ser desfeita.')) return

    setIsLoading(id)
    try {
      await cancelTransaction(id)
      setReceivables(receivables.map((r) => (r.id === id ? { ...r, status: 'CANCELLED' } : r)))
      onUpdate?.(receivables)
    } catch (error: any) {
      alert(error.message || 'Erro ao cancelar receita')
    } finally {
      setIsLoading(null)
    }
  }

  if (receivables.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-full bg-muted p-3 mb-4">
          <TrendingUp className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Nenhuma conta a receber</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Comece adicionando receitas de projetos e propostas aprovadas
        </p>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Adicionar Receita
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Contas a Receber</h3>
          <p className="text-sm text-muted-foreground">
            {receivables.length} receita{receivables.length !== 1 ? 's' : ''} pendente{receivables.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nova Receita
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Descrição</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Origem</TableHead>
              <TableHead>Vencimento</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {receivables.map((receivable) => {
              const isOverdue = receivable.is_overdue || false
              const isPending = receivable.status === 'PENDING' || receivable.status === 'SCHEDULED'
              const hasValidProject = receivable.project_id && receivable.projects?.title
              const hasValidProposal = receivable.proposal_id && receivable.proposals?.title

              return (
                <TableRow key={receivable.id}>
                  <TableCell className="font-medium">
                    {receivable.description}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      {getCategoryLabel(receivable.category)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {receivable.clients?.name || (
                      <span className="text-sm text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {receivable.project_id ? (
                      hasValidProject ? (
                        <Link
                          href={`/projects/${receivable.project_id}`}
                          className="flex items-center gap-1 text-blue-600 hover:underline"
                        >
                          {receivable.projects.title}
                          <ExternalLink className="h-3 w-3" />
                        </Link>
                      ) : (
                        <span className="flex items-center gap-1 text-sm text-amber-600">
                          <FileWarning className="h-3 w-3" />
                          Projeto removido
                        </span>
                      )
                    ) : receivable.proposal_id ? (
                      hasValidProposal ? (
                        <Link
                          href={`/proposals/${receivable.proposal_id}` as any}
                          className="flex items-center gap-1 text-blue-600 hover:underline"
                        >
                          {receivable.proposals.title}
                          <ExternalLink className="h-3 w-3" />
                        </Link>
                      ) : (
                        <span className="flex items-center gap-1 text-sm text-amber-600">
                          <FileWarning className="h-3 w-3" />
                          Proposta removida
                        </span>
                      )
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        Receita Direta
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {receivable.due_date ? (
                      <span className={isOverdue ? 'text-red-600 font-medium' : ''}>
                        {format(new Date(receivable.due_date), 'dd/MM/yyyy', {
                          locale: ptBR,
                        })}
                      </span>
                    ) : (
                      <span className="text-sm text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="font-semibold text-green-600">
                    {formatCurrency(receivable.amount)}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(receivable.status, isOverdue)}
                  </TableCell>
                  <TableCell>
                    {isPending && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            disabled={isLoading === receivable.id}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleMarkAsReceived(receivable.id)}
                            className="text-green-600"
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Marcar como Recebido
                          </DropdownMenuItem>
                          {receivable.status === 'PENDING' && (
                            <DropdownMenuItem onClick={() => handleSchedule(receivable.id)}>
                              <Clock className="mr-2 h-4 w-4" />
                              Agendar Recebimento
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleCancel(receivable.id)}
                            className="text-red-600"
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            Cancelar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
