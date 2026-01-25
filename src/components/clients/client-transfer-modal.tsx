'use client'

import { Modal } from '@/components/ui/modal'
import { useState } from 'react'
import { transferAndDeleteClient } from '@/actions/clients'
import { motion } from 'framer-motion'
import { AlertTriangle, ArrowRight } from 'lucide-react'

// Definindo o tipo Client localmente para evitar problemas de importação
type Client = {
    id: string
    name: string
    company?: string | null
}

interface ClientTransferModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
    sourceClient: Client | null
    clients: Client[]
}

export function ClientTransferModal({
    isOpen,
    onClose,
    onSuccess,
    sourceClient,
    clients,
}: ClientTransferModalProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [targetClientId, setTargetClientId] = useState('')

    // Filtrar clientes para não mostrar o próprio cliente que está sendo excluído
    const availableClients = clients.filter((c) => c.id !== sourceClient?.id)

    const handleTransfer = async () => {
        if (!sourceClient || !targetClientId) return

        setIsLoading(true)
        try {
            await transferAndDeleteClient(sourceClient.id, targetClientId)
            onSuccess()
            onClose()
        } catch (error) {
            alert(error instanceof Error ? error.message : 'Erro ao transferir dados')
        } finally {
            setIsLoading(false)
        }
    }

    if (!sourceClient) return null

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Transferir e Excluir">
            <div className="space-y-6">
                {/* Aviso */}
                <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-4">
                    <div className="flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-amber-500">
                                Atenção: Cliente possui vínculo com Projetos
                            </p>
                            <p className="text-sm text-amber-200/80">
                                Para excluir <strong>{sourceClient.name}</strong>, você precisa transferir seus
                                projetos, propostas e histórico financeiro para outro cliente.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Seleção */}
                <div className="space-y-4">
                    <div className="flex items-center gap-4 text-sm text-text-tertiary">
                        <div className="flex-1 rounded-lg border border-white/10 p-3 text-center bg-white/5">
                            <span className="block text-xs uppercase tracking-wider mb-1">De</span>
                            <strong className="text-text-primary block truncate">{sourceClient.name}</strong>
                        </div>
                        <ArrowRight className="h-4 w-4" />
                        <div className="flex-1 rounded-lg border border-white/10 p-3 text-center bg-white/5">
                            <span className="block text-xs uppercase tracking-wider mb-1">Para</span>
                            {targetClientId ? (
                                <strong className="text-text-primary block truncate">
                                    {availableClients.find(c => c.id === targetClientId)?.name}
                                </strong>
                            ) : (
                                <span className="text-text-tertiary italic">Selecione...</span>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-zinc-300">
                            Selecione o novo dono dos dados *
                        </label>
                        <select
                            value={targetClientId}
                            onChange={(e) => setTargetClientId(e.target.value)}
                            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white transition-all focus:border-white/20 focus:outline-none focus:ring-2 focus:ring-white/10"
                        >
                            <option value="" disabled className="bg-zinc-900 text-zinc-500">
                                Selecione um cliente...
                            </option>
                            {availableClients.map((client) => (
                                <option key={client.id} value={client.id} className="bg-zinc-900">
                                    {client.name} {client.company ? `(${client.company})` : ''}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Botões */}
                <div className="flex gap-3 pt-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-white/10"
                    >
                        Cancelar
                    </button>
                    <motion.button
                        onClick={handleTransfer}
                        disabled={!targetClientId || isLoading}
                        whileHover={{ scale: !targetClientId ? 1 : 1.02 }}
                        whileTap={{ scale: !targetClientId ? 1 : 0.98 }}
                        className="flex-1 rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-medium text-black transition-all hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Transferindo...' : 'Transferir e Excluir'}
                    </motion.button>
                </div>
            </div>
        </Modal>
    )
}
