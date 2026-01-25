'use client'

import { Modal } from '@/components/ui/modal'
import { useState, useEffect } from 'react'
import { addProposal } from '@/actions/proposals'
import { getClients, addClient } from '@/actions/clients'
import { motion } from 'framer-motion'
import { Plus, X, ArrowRight, User } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface SelectClientModalProps {
  isOpen: boolean
  onClose: () => void
}

type Client = {
  id: string
  name: string
  company?: string | null
}

export function SelectClientModal({ isOpen, onClose }: SelectClientModalProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [clients, setClients] = useState<Client[]>([])
  const [showNewClientForm, setShowNewClientForm] = useState(false)
  const [selectedClientId, setSelectedClientId] = useState('')
  const [newClientData, setNewClientData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
  })

  useEffect(() => {
    if (isOpen) {
      setSelectedClientId('')
      setNewClientData({ name: '', email: '', phone: '', company: '' })
      loadClients()
    }
  }, [isOpen])

  const loadClients = async () => {
    const data = await getClients()
    setClients(data)
    if (data.length === 0) {
      setShowNewClientForm(true)
    } else {
      setShowNewClientForm(false)
    }
  }

  const handleCreateClient = async () => {
    if (!newClientData.name || !newClientData.email) {
      alert('Nome e email são obrigatórios')
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

      setClients([newClient, ...clients])
      setSelectedClientId(newClient.id)
      setNewClientData({ name: '', email: '', phone: '', company: '' })
      setShowNewClientForm(false)
    } catch (error) {
      alert('Erro ao criar cliente')
    } finally {
      setIsLoading(false)
    }
  }

  const handleContinue = async () => {
    if (!selectedClientId) {
      alert('Por favor, selecione um cliente.')
      return
    }

    setIsLoading(true)

    try {
      // Criar proposta - valores serão calculados pelos itens
      const newProposal = await addProposal({
        title: 'Nova Proposta',
        client_id: selectedClientId,
      })

      onClose()
      // Redirecionar para a página de edição
      router.push(`/proposals/${newProposal.id}/edit`)
    } catch (error: any) {
      alert(error?.message || 'Erro ao criar proposta.')
    } finally {
      setIsLoading(false)
    }
  }

  const selectedClient = clients.find(c => c.id === selectedClientId)

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nova Proposta">
      <div className="space-y-4">
        <p className="text-sm text-zinc-400">
          Selecione o cliente para esta proposta. Você poderá editar todos os detalhes na próxima tela.
        </p>

        {/* Cliente */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-zinc-300">
              Cliente
            </label>
            {clients.length > 0 && (
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
            )}
          </div>

          {/* Mostrar cliente selecionado */}
          {selectedClientId && !showNewClientForm && (
            <div className="mb-3 p-3 rounded-lg border border-green-500/30 bg-green-500/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                    <User className="h-5 w-5 text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-green-400">Cliente selecionado</p>
                    <p className="text-white font-medium">
                      {selectedClient?.name}
                      {selectedClient?.company && (
                        <span className="text-zinc-400 font-normal"> - {selectedClient.company}</span>
                      )}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedClientId('')}
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
          ) : !selectedClientId ? (
            <div className="space-y-2">
              {clients.length > 0 ? (
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {clients.map((client) => (
                    <button
                      key={client.id}
                      type="button"
                      onClick={() => setSelectedClientId(client.id)}
                      className="w-full flex items-center gap-3 p-3 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-colors text-left"
                    >
                      <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                        <User className="h-5 w-5 text-zinc-400" />
                      </div>
                      <div>
                        <p className="text-white font-medium">{client.name}</p>
                        {client.company && (
                          <p className="text-sm text-zinc-400">{client.company}</p>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-zinc-500 text-center py-4">
                  Nenhum cliente cadastrado.
                </p>
              )}
            </div>
          ) : null}
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
            type="button"
            onClick={handleContinue}
            disabled={isLoading || !selectedClientId}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-black transition-all hover:bg-zinc-200 disabled:opacity-50"
          >
            {isLoading ? 'Criando...' : (
              <>
                Continuar
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </motion.button>
        </div>
      </div>
    </Modal>
  )
}
