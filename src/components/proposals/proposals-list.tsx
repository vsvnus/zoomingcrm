'use client'

import { motion } from 'framer-motion'
import { Plus, FileText, Eye, CheckCircle, XCircle, Clock, DollarSign, Edit } from 'lucide-react'
import { useState } from 'react'
import { formatCurrency } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import { addProposal } from '@/actions/proposals'

type Proposal = {
  id: string
  title: string
  status: string
  base_value: number
  total_value: number
  created_at: string
  clients?: {
    id: string
    name: string
  } | null
}

const statusMap: Record<string, { label: string; icon: any; color: string }> = {
  DRAFT: { label: 'Rascunho', icon: FileText, color: 'text-text-tertiary' },
  SENT: { label: 'Enviada', icon: Eye, color: 'text-info' },
  VIEWED: { label: 'Visualizada', icon: Eye, color: 'text-info' },
  ACCEPTED: { label: 'Aceita', icon: CheckCircle, color: 'text-success' },
  REJECTED: { label: 'Rejeitada', icon: XCircle, color: 'text-error' },
  EXPIRED: { label: 'Expirada', icon: Clock, color: 'text-warning' },
}

interface ProposalsListProps {
  initialProposals: Proposal[]
}

export function ProposalsList({ initialProposals }: ProposalsListProps) {
  const router = useRouter()
  const [proposals, setProposals] = useState(initialProposals)
  const [isCreating, setIsCreating] = useState(false)

  const handleCreateNewProposal = async () => {
    setIsCreating(true)
    try {
      // Criar proposta básica com cliente padrão (primeiro cliente da lista)
      const newProposal = await addProposal({
        title: 'Nova Proposta',
        client_id: proposals[0]?.clients?.id || '',
        base_value: 0,
        discount: 0,
        description: '',
      })

      // Redirecionar para a página de edição
      router.push(`/proposals/${newProposal.id}/edit`)
    } catch (error) {
      console.error('Erro ao criar proposta:', error)
      alert('Erro ao criar proposta. Por favor, tente novamente.')
      setIsCreating(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold text-text-primary"
          >
            Propostas
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-2 text-text-tertiary"
          >
            {proposals.length} propostas cadastradas
          </motion.p>
        </div>

        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleCreateNewProposal}
          disabled={isCreating}
          className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-all hover:opacity-90 disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
          {isCreating ? 'Criando...' : 'Nova Proposta'}
        </motion.button>
      </div>

      {/* Proposals List */}
      {proposals.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {proposals.map((proposal, index) => {
            const statusInfo = statusMap[proposal.status] || statusMap.DRAFT
            const StatusIcon = statusInfo.icon

            return (
              <motion.div
                key={proposal.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group relative overflow-hidden rounded-2xl border border-[rgb(var(--border))] bg-card p-6 transition-all hover:shadow-3 hover-lift"
              >
                {/* Status Badge */}
                <div className="absolute right-4 top-4">
                  <div className={`flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 ${statusInfo.color}`}>
                    <StatusIcon className="h-3 w-3" />
                    <span className="text-xs font-medium">{statusInfo.label}</span>
                  </div>
                </div>

                {/* Content */}
                <div className="mt-8">
                  <h3 className="text-lg font-bold text-text-primary line-clamp-2">
                    {proposal.title}
                  </h3>

                  {proposal.clients && (
                    <p className="mt-2 text-sm text-text-tertiary">
                      {proposal.clients.name}
                    </p>
                  )}

                  {/* Values */}
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-text-tertiary">Valor Base</span>
                      <span className="font-medium text-text-secondary">
                        {formatCurrency(Number(proposal.base_value))}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-text-tertiary">Valor Total</span>
                      <span className="text-lg font-bold text-success">
                        {formatCurrency(Number(proposal.total_value))}
                      </span>
                    </div>
                  </div>

                  {/* Date */}
                  <div className="mt-4 pt-4 border-t border-[rgb(var(--border))]">
                    <span className="text-xs text-text-tertiary">
                      Criada em{' '}
                      {new Date(proposal.created_at).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>

                  {/* Edit Button */}
                  <div className="mt-4">
                    <button
                      onClick={() => router.push(`/proposals/${proposal.id}/edit`)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-secondary border border-[rgb(var(--border))] text-text-primary hover:bg-bg-hover transition-all text-sm font-medium"
                    >
                      <Edit className="h-4 w-4" />
                      Editar Proposta
                    </button>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center rounded-2xl border border-[rgb(var(--border))] bg-card py-16 text-center"
        >
          <FileText className="h-12 w-12 text-text-quaternary" />
          <p className="mt-4 text-lg font-medium text-text-primary">
            Nenhuma proposta encontrada
          </p>
          <p className="mt-1 text-sm text-text-tertiary">
            Crie sua primeira proposta interativa
          </p>
        </motion.div>
      )}
    </div>
  )
}
