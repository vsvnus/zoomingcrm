'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Plus,
  Trash2,
  GripVertical,
  Eye,
  Send,
  Copy,
  DollarSign,
  Package,
  Video,
  Edit,
  Calendar,
  FileText,
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { AddItemModal } from './add-item-modal'
import { AddOptionalModal } from './add-optional-modal'
import { AddVideoModal } from './add-video-modal'
import {
  deleteProposalItem,
  deleteProposalOptional,
  deleteProposalVideo,
  sendProposal,
  duplicateProposal,
  updateProposal,
} from '@/actions/proposals'
import { useRouter } from 'next/navigation'

type ProposalData = {
  id: string
  token: string
  title: string
  description: string | null
  discount: number
  valid_until: string | null
  status: string
  clients?: {
    id: string
    name: string
    email: string
  } | null
  items: Array<{
    id: string
    description: string
    quantity: number
    unit_price: number
    total: number
    order: number
  }>
  optionals: Array<{
    id: string
    title: string
    description: string | null
    price: number
    is_selected: boolean
    order: number
  }>
  videos: Array<{
    id: string
    title: string
    video_url: string
    order: number
  }>
}

interface ProposalEditorProps {
  proposal: ProposalData
}

export function ProposalEditor({ proposal: initialProposal }: ProposalEditorProps) {
  const router = useRouter()
  const [proposal, setProposal] = useState(initialProposal)
  const [isItemModalOpen, setIsItemModalOpen] = useState(false)
  const [isOptionalModalOpen, setIsOptionalModalOpen] = useState(false)
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    title: proposal.title,
    description: proposal.description || '',
    discount: proposal.discount,
    valid_until: proposal.valid_until
      ? new Date(proposal.valid_until).toISOString().split('T')[0]
      : '',
  })

  // Calculations
  const baseValue = proposal.items.reduce((sum, item) => sum + Number(item.total), 0)
  const discountAmount = baseValue * (Number(proposal.discount) / 100)
  const optionalsValue = proposal.optionals
    .filter((opt) => opt.is_selected)
    .reduce((sum, opt) => sum + Number(opt.price), 0)
  const totalValue = baseValue + optionalsValue - discountAmount

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm('Deseja remover este item?')) return

    try {
      await deleteProposalItem(itemId)
      setProposal({
        ...proposal,
        items: proposal.items.filter((item) => item.id !== itemId),
      })
    } catch (error) {
      alert('Erro ao remover item')
    }
  }

  const handleDeleteOptional = async (optionalId: string) => {
    if (!confirm('Deseja remover este opcional?')) return

    try {
      await deleteProposalOptional(optionalId)
      setProposal({
        ...proposal,
        optionals: proposal.optionals.filter((opt) => opt.id !== optionalId),
      })
    } catch (error) {
      alert('Erro ao remover opcional')
    }
  }

  const handleDeleteVideo = async (videoId: string) => {
    if (!confirm('Deseja remover este vídeo?')) return

    try {
      await deleteProposalVideo(videoId)
      setProposal({
        ...proposal,
        videos: proposal.videos.filter((video) => video.id !== videoId),
      })
    } catch (error) {
      alert('Erro ao remover vídeo')
    }
  }

  const handleSendProposal = async () => {
    if (!confirm('Deseja enviar esta proposta para o cliente?')) return

    try {
      await sendProposal(proposal.id)
      alert('Proposta enviada com sucesso!')
      router.push('/proposals')
    } catch (error) {
      alert('Erro ao enviar proposta')
    }
  }

  const handleDuplicate = async () => {
    try {
      const newProposal = await duplicateProposal(proposal.id)
      router.push(`/proposals/${newProposal.id}/edit`)
    } catch (error) {
      alert('Erro ao duplicar proposta')
    }
  }

  const handleSaveEdit = async () => {
    try {
      await updateProposal(proposal.id, {
        title: editForm.title,
        description: editForm.description,
        discount: editForm.discount,
        valid_until: editForm.valid_until || undefined,
      })
      setProposal({
        ...proposal,
        title: editForm.title,
        description: editForm.description,
        discount: editForm.discount,
        valid_until: editForm.valid_until || null,
      })
      setIsEditing(false)
      alert('Proposta atualizada!')
    } catch (error) {
      alert('Erro ao atualizar proposta')
    }
  }

  const publicUrl = `${window.location.origin}/p/${proposal.token}`

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div className="flex-1">
            {isEditing ? (
              <div className="space-y-4">
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-3xl font-bold text-white placeholder-zinc-500 focus:border-white/20 focus:outline-none"
                />
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-zinc-300 placeholder-zinc-500 focus:border-white/20 focus:outline-none"
                  rows={3}
                  placeholder="Descrição da proposta..."
                />
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="mb-1 block text-sm text-zinc-400">Desconto (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={editForm.discount}
                      onChange={(e) =>
                        setEditForm({ ...editForm, discount: parseFloat(e.target.value) || 0 })
                      }
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white focus:border-white/20 focus:outline-none"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="mb-1 block text-sm text-zinc-400">Válido até</label>
                    <input
                      type="date"
                      value={editForm.valid_until}
                      onChange={(e) => setEditForm({ ...editForm, valid_until: e.target.value })}
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white focus:border-white/20 focus:outline-none"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveEdit}
                    className="rounded-lg bg-green-500 px-4 py-2 text-sm font-medium text-white hover:bg-green-600"
                  >
                    Salvar
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/20"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3">
                  <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-3xl font-bold text-white"
                  >
                    {proposal.title}
                  </motion.h1>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="rounded-lg p-2 text-zinc-400 hover:bg-white/5 hover:text-white"
                  >
                    <Edit className="h-5 w-5" />
                  </button>
                </div>
                {proposal.description && (
                  <p className="mt-2 text-zinc-400">{proposal.description}</p>
                )}
                {proposal.clients && (
                  <p className="mt-1 text-sm text-zinc-500">
                    Cliente: <span className="text-zinc-300">{proposal.clients.name}</span>
                  </p>
                )}
              </>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => window.open(publicUrl, '_blank')}
              className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-white/10"
            >
              <Eye className="h-4 w-4" />
              Preview
            </button>
            <button
              onClick={handleDuplicate}
              className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-white/10"
            >
              <Copy className="h-4 w-4" />
              Duplicar
            </button>
            <button
              onClick={handleSendProposal}
              className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-black transition-all hover:bg-zinc-200"
            >
              <Send className="h-4 w-4" />
              Enviar para Cliente
            </button>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content - 2/3 width */}
          <div className="space-y-8 lg:col-span-2">
            {/* Items Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl"
            >
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Package className="h-5 w-5 text-green-400" />
                  <h2 className="text-xl font-bold text-white">Itens da Proposta</h2>
                </div>
                <button
                  onClick={() => setIsItemModalOpen(true)}
                  className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-black hover:bg-zinc-200"
                >
                  <Plus className="h-4 w-4" />
                  Adicionar Item
                </button>
              </div>

              {proposal.items.length > 0 ? (
                <div className="space-y-3">
                  {proposal.items
                    .sort((a, b) => a.order - b.order)
                    .map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 rounded-lg border border-white/5 bg-white/5 p-4"
                      >
                        <GripVertical className="h-5 w-5 cursor-grab text-zinc-500" />
                        <div className="flex-1">
                          <p className="font-medium text-white">{item.description}</p>
                          <p className="text-sm text-zinc-400">
                            {item.quantity}x {formatCurrency(Number(item.unit_price))} ={' '}
                            {formatCurrency(Number(item.total))}
                          </p>
                        </div>
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="rounded-lg p-2 text-zinc-400 hover:bg-red-500/10 hover:text-red-400"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="rounded-lg border border-white/5 bg-white/5 p-8 text-center">
                  <Package className="mx-auto h-12 w-12 text-zinc-600" />
                  <p className="mt-2 text-sm text-zinc-500">Nenhum item adicionado</p>
                </div>
              )}
            </motion.div>

            {/* Optionals Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl"
            >
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <DollarSign className="h-5 w-5 text-purple-400" />
                  <h2 className="text-xl font-bold text-white">Opcionais</h2>
                </div>
                <button
                  onClick={() => setIsOptionalModalOpen(true)}
                  className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-black hover:bg-zinc-200"
                >
                  <Plus className="h-4 w-4" />
                  Adicionar Opcional
                </button>
              </div>

              {proposal.optionals.length > 0 ? (
                <div className="space-y-3">
                  {proposal.optionals
                    .sort((a, b) => a.order - b.order)
                    .map((optional) => (
                      <div
                        key={optional.id}
                        className="flex items-center gap-3 rounded-lg border border-white/5 bg-white/5 p-4"
                      >
                        <GripVertical className="h-5 w-5 cursor-grab text-zinc-500" />
                        <div className="flex-1">
                          <p className="font-medium text-white">{optional.title}</p>
                          {optional.description && (
                            <p className="text-sm text-zinc-400">{optional.description}</p>
                          )}
                          <p className="mt-1 text-sm font-medium text-purple-400">
                            {formatCurrency(Number(optional.price))}
                          </p>
                        </div>
                        <button
                          onClick={() => handleDeleteOptional(optional.id)}
                          className="rounded-lg p-2 text-zinc-400 hover:bg-red-500/10 hover:text-red-400"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="rounded-lg border border-white/5 bg-white/5 p-8 text-center">
                  <DollarSign className="mx-auto h-12 w-12 text-zinc-600" />
                  <p className="mt-2 text-sm text-zinc-500">Nenhum opcional adicionado</p>
                </div>
              )}
            </motion.div>

            {/* Videos Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl"
            >
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Video className="h-5 w-5 text-blue-400" />
                  <h2 className="text-xl font-bold text-white">Vídeos Portfolio</h2>
                </div>
                <button
                  onClick={() => setIsVideoModalOpen(true)}
                  className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-black hover:bg-zinc-200"
                >
                  <Plus className="h-4 w-4" />
                  Adicionar Vídeo
                </button>
              </div>

              {proposal.videos.length > 0 ? (
                <div className="space-y-3">
                  {proposal.videos
                    .sort((a, b) => a.order - b.order)
                    .map((video) => (
                      <div
                        key={video.id}
                        className="flex items-center gap-3 rounded-lg border border-white/5 bg-white/5 p-4"
                      >
                        <GripVertical className="h-5 w-5 cursor-grab text-zinc-500" />
                        <div className="flex-1">
                          <p className="font-medium text-white">{video.title}</p>
                          <a
                            href={video.video_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-400 hover:underline"
                          >
                            {video.video_url}
                          </a>
                        </div>
                        <button
                          onClick={() => handleDeleteVideo(video.id)}
                          className="rounded-lg p-2 text-zinc-400 hover:bg-red-500/10 hover:text-red-400"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="rounded-lg border border-white/5 bg-white/5 p-8 text-center">
                  <Video className="mx-auto h-12 w-12 text-zinc-600" />
                  <p className="mt-2 text-sm text-zinc-500">Nenhum vídeo adicionado</p>
                </div>
              )}
            </motion.div>
          </div>

          {/* Sidebar - Financial Summary - 1/3 width */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="sticky top-8 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl"
            >
              <div className="mb-4 flex items-center gap-3">
                <FileText className="h-5 w-5 text-green-400" />
                <h2 className="text-xl font-bold text-white">Resumo Financeiro</h2>
              </div>

              <div className="space-y-4">
                {/* Base Value */}
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <span className="text-sm text-zinc-400">Valor Base</span>
                  <span className="font-medium text-white">{formatCurrency(baseValue)}</span>
                </div>

                {/* Discount */}
                {proposal.discount > 0 && (
                  <div className="flex items-center justify-between border-b border-white/5 pb-3">
                    <span className="text-sm text-zinc-400">
                      Desconto ({proposal.discount}%)
                    </span>
                    <span className="font-medium text-red-400">
                      - {formatCurrency(discountAmount)}
                    </span>
                  </div>
                )}

                {/* Optionals */}
                {optionalsValue > 0 && (
                  <div className="flex items-center justify-between border-b border-white/5 pb-3">
                    <span className="text-sm text-zinc-400">Opcionais Selecionados</span>
                    <span className="font-medium text-purple-400">
                      + {formatCurrency(optionalsValue)}
                    </span>
                  </div>
                )}

                {/* Total */}
                <div className="rounded-lg bg-green-500/10 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-zinc-300">Valor Total</span>
                    <span className="text-2xl font-bold text-green-400">
                      {formatCurrency(totalValue)}
                    </span>
                  </div>
                </div>

                {/* Info cards */}
                <div className="mt-6 space-y-3">
                  <div className="rounded-lg border border-white/5 bg-white/5 p-3">
                    <p className="text-xs text-zinc-500">Status</p>
                    <p className="mt-1 font-medium text-white">
                      {proposal.status === 'DRAFT'
                        ? 'Rascunho'
                        : proposal.status === 'SENT'
                          ? 'Enviada'
                          : proposal.status === 'VIEWED'
                            ? 'Visualizada'
                            : proposal.status === 'ACCEPTED'
                              ? 'Aceita'
                              : 'Rejeitada'}
                    </p>
                  </div>

                  {proposal.valid_until && (
                    <div className="rounded-lg border border-white/5 bg-white/5 p-3">
                      <p className="text-xs text-zinc-500">Válido até</p>
                      <p className="mt-1 font-medium text-white">
                        {new Date(proposal.valid_until).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  )}

                  <div className="rounded-lg border border-white/5 bg-white/5 p-3">
                    <p className="text-xs text-zinc-500">Link Público</p>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(publicUrl)
                        alert('Link copiado!')
                      }}
                      className="mt-1 w-full truncate text-left text-sm font-medium text-blue-400 hover:underline"
                    >
                      {publicUrl}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AddItemModal
        proposalId={proposal.id}
        isOpen={isItemModalOpen}
        onClose={() => setIsItemModalOpen(false)}
        onSuccess={() => router.refresh()}
      />
      <AddOptionalModal
        proposalId={proposal.id}
        isOpen={isOptionalModalOpen}
        onClose={() => setIsOptionalModalOpen(false)}
        onSuccess={() => router.refresh()}
      />
      <AddVideoModal
        proposalId={proposal.id}
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        onSuccess={() => router.refresh()}
      />
    </div>
  )
}
