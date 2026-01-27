'use client'

import { motion } from 'framer-motion'
import { Plus, Search, Mail, Phone, Building, MoreVertical, Trash2, Calendar, Edit, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { deleteClient } from '@/actions/clients'
import { ClientFormModal } from './client-form-modal'
import { ClientTransferModal } from './client-transfer-modal'
import { useRouter } from 'next/navigation'

type Client = {
  id: string
  name: string
  email: string
  phone?: string | null
  company?: string | null
  created_at: string
}

interface ClientsGridProps {
  initialClients: Client[]
}

export function ClientsGrid({ initialClients }: ClientsGridProps) {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [clients, setClients] = useState(initialClients)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [clientToTransfer, setClientToTransfer] = useState<Client | null>(null)

  const filteredClients = clients.filter(
    (client) =>
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.company?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleDelete = async (id: string) => {
    // Primeira tentativa: Deletar normal
    if (!confirm('Tem certeza que deseja deletar este cliente?')) return

    setIsDeleting(id)
    try {
      await deleteClient(id, false)
      setClients(clients.filter((c) => c.id !== id))
    } catch (error: any) {
      const message = error.message || ''

      // Se for erro de dependência (Projetos/Propostas vinculados)
      if (message.includes('DEPENDENCY_ERROR')) {
        // Perguntar ao usuário o que fazer
        const userChoice = confirm(
          'Este cliente possui PROJETOS, PROPOSTAS e FINANCEIROS vinculados.\n\n' +
          'O que deseja fazer?\n' +
          '[OK] -> EXCLUIR TUDO (O cliente e todos os seus dados vinculados serão apagados permanentemente)\n' +
          '[Cancelar] -> Manter tudo e apenas cancelar a operação'
        )

        if (userChoice) {
          // Usuário escolheu EXCLUIR TUDO
          try {
            await deleteClient(id, true) // Force delete
            setClients(clients.filter((c) => c.id !== id))
            alert('Cliente e todos os dados vinculados foram excluídos.')
          } catch (forceError: any) {
            alert('Erro ao excluir tudo: ' + forceError.message)
          }
        } else {
          // Opção de transferir (mantendo comportamento antigo ou sugerindo)
          const wantTransfer = confirm('Deseja então TRANSFERIR os dados para outro cliente antes de excluir este?')
          if (wantTransfer) {
            const client = clients.find((c) => c.id === id)
            if (client) {
              setClientToTransfer(client)
            }
          }
        }
      } else {
        alert(message || 'Erro ao deletar cliente')
      }
    } finally {
      setIsDeleting(null)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase()
  }

  const getAvatarColor = (name: string) => {
    const colors = [
      'from-neutral-500 to-neutral-700',
      'from-neutral-600 to-neutral-800',
      'from-neutral-400 to-neutral-600',
      'from-neutral-700 to-neutral-900',
      'from-neutral-500 to-neutral-700',
    ]
    const index = name.charCodeAt(0) % colors.length
    return colors[index]
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(date)
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
            Clientes
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-2 text-text-tertiary"
          >
            {clients.length} clientes cadastrados
          </motion.p>
        </div>

        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-all hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          Novo Cliente
        </motion.button>
      </div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex gap-4"
      >
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
          <input
            type="text"
            placeholder="Buscar clientes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-11 w-full rounded-xl border border-[rgb(var(--border))] bg-secondary pl-10 pr-4 text-sm text-text-primary placeholder-text-tertiary outline-none transition-all focus:border-primary/30 focus:bg-background focus:ring-2 focus:ring-primary/10"
          />
        </div>
      </motion.div>

      {/* Clients List */}
      {filteredClients.length > 0 ? (
        <div className="space-y-3">
          {filteredClients.map((client, index) => (
            <motion.div
              key={client.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.05 }}
              onClick={() => router.push(`/clients/${client.id}`)}
              className="group relative overflow-hidden rounded-2xl border border-[rgb(var(--border))] bg-card transition-all hover:shadow-3 hover:border-primary/20 cursor-pointer"
            >
              <div className="relative flex items-center gap-6 p-6">
                {/* Avatar */}
                <div
                  className={`flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${getAvatarColor(
                    client.name
                  )} text-2xl font-bold text-white shadow-lg transition-transform group-hover:scale-105`}
                >
                  {getInitials(client.name)}
                </div>

                {/* Info Section */}
                <div className="flex flex-1 flex-col gap-3">
                  {/* Name and Company */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-text-primary group-hover:text-primary transition-colors">
                        {client.name}
                      </h3>
                      {client.company && (
                        <div className="mt-1 flex items-center gap-2 text-sm text-text-tertiary">
                          <Building className="h-4 w-4" />
                          <span>{client.company}</span>
                        </div>
                      )}
                    </div>

                    {/* Date Badge */}
                    <div className="flex items-center gap-1.5 rounded-lg border border-[rgb(var(--border))] bg-secondary px-3 py-1.5 text-xs text-text-tertiary">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{formatDate(client.created_at)}</span>
                    </div>
                  </div>

                  {/* Contact Details */}
                  <div className="flex flex-wrap items-center gap-6">
                    <div className="flex items-center gap-2 text-sm text-text-tertiary">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[rgb(var(--border))] bg-secondary">
                        <Mail className="h-4 w-4 text-text-tertiary" />
                      </div>
                      <span>{client.email}</span>
                    </div>
                    {client.phone && (
                      <div className="flex items-center gap-2 text-sm text-text-tertiary">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[rgb(var(--border))] bg-secondary">
                          <Phone className="h-4 w-4 text-text-tertiary" />
                        </div>
                        <span>{client.phone}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Arrow indicator */}
                <div className="flex-shrink-0 text-text-tertiary group-hover:text-primary transition-colors">
                  <ChevronRight className="h-5 w-5" />
                </div>
              </div>

              {/* Actions - floating on hover */}
              <div className="absolute right-4 top-4 flex items-center gap-2 opacity-0 transition-all group-hover:opacity-100">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    router.push(`/clients/${client.id}`)
                  }}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-[rgb(var(--border))] bg-card text-text-tertiary transition-all hover:bg-bg-hover hover:text-text-primary shadow-sm"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDelete(client.id)
                  }}
                  disabled={isDeleting === client.id}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-[rgb(var(--border))] bg-card text-text-tertiary transition-all hover:border-error/20 hover:bg-error/10 hover:text-error disabled:opacity-50 shadow-sm"
                >
                  {isDeleting === client.id ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-text-tertiary border-t-transparent" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center rounded-2xl border border-[rgb(var(--border))] bg-card py-16 text-center"
        >
          <Building className="h-12 w-12 text-text-quaternary" />
          <p className="mt-4 text-lg font-medium text-text-primary">
            Nenhum cliente encontrado
          </p>
          <p className="mt-1 text-sm text-text-tertiary">
            Tente ajustar sua busca ou adicione um novo cliente
          </p>
        </motion.div>
      )}

      {/* Modal */}
      <ClientFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => router.refresh()}
      />

      <ClientTransferModal
        isOpen={!!clientToTransfer}
        onClose={() => setClientToTransfer(null)}
        sourceClient={clientToTransfer}
        clients={clients}
        onSuccess={() => {
          if (clientToTransfer) {
            setClients((prev) => prev.filter((c) => c.id !== clientToTransfer.id))
          }
          router.refresh()
        }}
      />
    </div>
  )
}
