'use client'

import { Modal } from '@/components/ui/modal'
import { useState, useEffect } from 'react'
import { addProposal } from '@/actions/proposals'
import { getClients, addClient } from '@/actions/clients'
import { motion } from 'framer-motion'
import { Plus, X, Info } from 'lucide-react'

interface ProposalFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (proposal: any) => void
}

type Client = {
  id: string
  name: string
  company?: string | null
}

export function ProposalFormModal({ isOpen, onClose, onSuccess }: ProposalFormModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [clients, setClients] = useState<Client[]>([])
  const [showNewClientForm, setShowNewClientForm] = useState(false)
  const [newClientData, setNewClientData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
  })
  const [formData, setFormData] = useState({
    title: '',
    client_id: '',
    description: '',
  })

  useEffect(() => {
    if (isOpen) {
      // Reset form quando abre o modal
      setFormData({ title: '', client_id: '', description: '' })
      setNewClientData({ name: '', email: '', phone: '', company: '' })
      loadClients()
    }
  }, [isOpen])

  const loadClients = async () => {
    const data = await getClients()
    setClients(data)
    // Se não tem clientes, mostrar formulário de criação automaticamente
    if (data.length === 0) {
      setShowNewClientForm(true)
    } else {
      setShowNewClientForm(false)
    }
  }

  const handleCreateClient = async () => {
    if (!newClientData.name || !newClientData.email) {
      alert('Nome e email sao obrigatorios')
      return
    }

    setIsLoading(true)
    try {
      const newClient = await addClient({
        name: newClientData.name,
        email: newClientData.email,
        phone: newClientData.phone || undefined,
        company: newClientData.company || undefined,
      })

      // Atualizar lista de clientes e selecionar o novo
      setClients([newClient, ...clients])
      setFormData({ ...formData, client_id: newClient.id })
      setNewClientData({ name: '', email: '', phone: '', company: '' })
      setShowNewClientForm(false)
    } catch (error) {
      alert('Erro ao criar cliente')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validação: precisa ter um cliente selecionado
    if (!formData.client_id) {
      alert('Por favor, selecione ou crie um cliente antes de criar a proposta.')
      return
    }

    setIsLoading(true)

    try {
      const newProposal = await addProposal({
        title: formData.title,
        client_id: formData.client_id,
        description: formData.description || undefined,
      })

      // Buscar dados do cliente para incluir na proposta
      const client = clients.find(c => c.id === formData.client_id)

      setFormData({
        title: '',
        client_id: '',
        description: '',
      })

      // Passar a proposta completa com dados do cliente
      onSuccess({ ...newProposal, clients: client })
      onClose()
    } catch (error: any) {
      alert(error?.message || 'Erro ao criar proposta. Verifique se o cliente foi criado corretamente.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nova Proposta">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Título */}
        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-300">
            Título da Proposta *
          </label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-zinc-500 transition-all focus:border-white/20 focus:outline-none focus:ring-2 focus:ring-white/10"
            placeholder="Proposta Comercial - Janeiro 2024"
          />
        </div>

        {/* Cliente */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-zinc-300">
              Cliente *
            </label>
            <button
              type="button"
              onClick={() => setShowNewClientForm(!showNewClientForm)}
              className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors"
            >
              {showNewClientForm ? (
                <>
                  <X className="h-3 w-3" />
                  Cancelar
                </>
              ) : (
                <>
                  <Plus className="h-3 w-3" />
                  Novo cliente
                </>
              )}
            </button>
          </div>

          {/* Mostrar cliente selecionado */}
          {formData.client_id && !showNewClientForm && (
            <div className="mb-3 p-3 rounded-lg border border-green-500/30 bg-green-500/10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-400">Cliente selecionado:</p>
                  <p className="text-white">
                    {clients.find(c => c.id === formData.client_id)?.name || 'Cliente'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, client_id: '' })}
                  className="text-xs text-zinc-400 hover:text-white"
                >
                  Alterar
                </button>
              </div>
            </div>
          )}

          {showNewClientForm ? (
            <div className="space-y-3 p-3 rounded-lg border border-blue-500/20 bg-blue-500/5">
              <input
                type="text"
                placeholder="Nome do cliente *"
                value={newClientData.name}
                onChange={(e) => setNewClientData({ ...newClientData, name: e.target.value })}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-zinc-500"
              />
              <input
                type="email"
                placeholder="Email *"
                value={newClientData.email}
                onChange={(e) => setNewClientData({ ...newClientData, email: e.target.value })}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-zinc-500"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Telefone"
                  value={newClientData.phone}
                  onChange={(e) => setNewClientData({ ...newClientData, phone: e.target.value })}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-zinc-500"
                />
                <input
                  type="text"
                  placeholder="Empresa"
                  value={newClientData.company}
                  onChange={(e) => setNewClientData({ ...newClientData, company: e.target.value })}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-zinc-500"
                />
              </div>
              <button
                type="button"
                onClick={handleCreateClient}
                disabled={isLoading}
                className="w-full rounded-lg bg-blue-500 px-3 py-2 text-sm font-medium text-white hover:bg-blue-600 disabled:opacity-50"
              >
                {isLoading ? 'Criando...' : 'Criar Cliente'}
              </button>
            </div>
          ) : !formData.client_id ? (
            <select
              value={formData.client_id}
              onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white transition-all focus:border-white/20 focus:outline-none focus:ring-2 focus:ring-white/10"
            >
              <option value="">Selecione um cliente</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id} className="bg-zinc-900">
                  {client.name} {client.company && `- ${client.company}`}
                </option>
              ))}
            </select>
          ) : null}
          {clients.length === 0 && !showNewClientForm && !formData.client_id && (
            <p className="mt-2 text-xs text-zinc-500">
              Nenhum cliente cadastrado. Clique em "Novo cliente" para adicionar.
            </p>
          )}
        </div>

        {/* Descrição */}
        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-300">
            Descrição
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-zinc-500 transition-all focus:border-white/20 focus:outline-none focus:ring-2 focus:ring-white/10"
            placeholder="Descreva brevemente o projeto..."
          />
        </div>

        {/* Info: Valor será calculado pelos itens */}
        <div className="rounded-lg border border-blue-500/20 bg-blue-500/10 p-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-blue-400">Valor Calculado Automaticamente</p>
              <p className="mt-1 text-xs text-zinc-400">
                O valor da proposta será calculado automaticamente pela soma dos itens adicionados.
                Após criar a proposta, adicione os itens no editor para definir o valor total.
              </p>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-white/10"
          >
            Cancelar
          </button>
          <motion.button
            type="submit"
            disabled={isLoading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1 rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-black transition-all hover:bg-zinc-200 disabled:opacity-50"
          >
            {isLoading ? 'Criando...' : 'Criar Proposta'}
          </motion.button>
        </div>
      </form>
    </Modal>
  )
}
