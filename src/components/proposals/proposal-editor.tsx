'use client'

import { useState, useEffect } from 'react'
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
  CheckCircle2,
  ArrowLeft,
  Palette,
  Image,
} from 'lucide-react'
import { ImageUpload } from '@/components/ui/image-upload'
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
  acceptProposalManual,
  deleteProposal,
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
  primary_color?: string | null
  cover_image?: string | null
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
    date?: string | null // SPRINT 2: Data opcional do item
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
  const [origin, setOrigin] = useState('')

  useEffect(() => {
    setOrigin(window.location.origin)
  }, [])

  // Sync local state with server data when it changes (e.g. after router.refresh())
  useEffect(() => {
    setProposal(initialProposal)
  }, [initialProposal])

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

  // SPRINT 2: Aceite Manual - cria projeto, eventos no calendário e transações financeiras
  const handleAcceptProposal = async () => {
    if (proposal.status === 'ACCEPTED') {
      alert('Esta proposta já foi aceita.')
      return
    }

    const confirmMessage = `Deseja aceitar esta proposta?\n\nIsso irá:\n• Mudar o status para "Aceita"\n• Criar um novo projeto\n• Criar eventos no calendário (itens com data)\n• Gerar lançamentos financeiros`

    if (!confirm(confirmMessage)) return

    try {
      const result = await acceptProposalManual(proposal.id)

      setProposal({
        ...proposal,
        status: 'ACCEPTED',
      })

      let message = 'Proposta aceita com sucesso!'
      if (result.projectId) {
        message += `\n\nProjeto criado.`
      }
      if (result.calendarEventsCreated > 0) {
        message += `\n${result.calendarEventsCreated} evento(s) criado(s) no calendário.`
      }
      if (result.financialTransactionsCreated > 0) {
        message += `\n${result.financialTransactionsCreated} transação(ões) financeira(s) criada(s).`
      }

      alert(message)

      // Redirecionar para o projeto criado se existir
      if (result.projectId) {
        router.push(`/projects/${result.projectId}`)
      }
    } catch (error: any) {
      alert(error?.message || 'Erro ao aceitar proposta')
    }
  }

  const handleDeleteProposal = async () => {
    if (!confirm('Tem certeza que deseja excluir esta proposta? Esta ação não pode ser desfeita.')) return

    try {
      await deleteProposal(proposal.id)
      router.push('/proposals')
    } catch (error: any) {
      alert(error?.message || 'Erro ao excluir proposta')
    }
  }

  const publicUrl = `${origin}/p/${proposal.token}`

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 p-8">
      <div className="mx-auto max-w-7xl">
        {/* Back Button */}
        <button
          onClick={() => router.push('/proposals')}
          className="mb-6 flex items-center gap-2 text-sm text-zinc-400 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para Propostas
        </button>

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
              onClick={() => {
                if (origin) window.open(publicUrl, '_blank')
              }}
              disabled={!origin}
              className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-white/10 disabled:opacity-50"
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
            {proposal.status !== 'ACCEPTED' && (
              <button
                onClick={handleSendProposal}
                className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-black transition-all hover:bg-zinc-200"
              >
                <Send className="h-4 w-4" />
                Enviar para Cliente
              </button>
            )}
            {/* SPRINT 2: Botão de Aceite Manual */}
            {proposal.status !== 'ACCEPTED' && (
              <button
                onClick={handleAcceptProposal}
                className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-green-700"
              >
                <CheckCircle2 className="h-4 w-4" />
                Aceitar Proposta
              </button>
            )}
            {proposal.status === 'ACCEPTED' && (
              <div className="flex items-center gap-2 rounded-lg bg-green-500/20 px-4 py-2 text-sm font-medium text-green-400">
                <CheckCircle2 className="h-4 w-4" />
                Proposta Aceita
              </div>
            )}

            {/* Delete Button */}
            <button
              onClick={handleDeleteProposal}
              className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-400 transition-all hover:bg-red-500/20"
              title="Excluir Proposta"
            >
              <Trash2 className="h-4 w-4" />
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
                          <div className="flex items-center gap-3 text-sm text-zinc-400">
                            <span>
                              {item.quantity}x {formatCurrency(Number(item.unit_price))} ={' '}
                              {formatCurrency(Number(item.total))}
                            </span>
                            {item.date && (
                              <span className="flex items-center gap-1 text-purple-400">
                                <Calendar className="h-3 w-3" />
                                {new Date(item.date).toLocaleDateString('pt-BR')}
                              </span>
                            )}
                          </div>
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

            {/* Branding Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl"
            >
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Palette className="h-5 w-5 text-pink-400" />
                  <h2 className="text-xl font-bold text-white">Design & Branding</h2>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-zinc-400">
                      Cor de Destaque
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={proposal.primary_color || '#000000'}
                        onChange={async (e) => {
                          const newColor = e.target.value
                          setProposal({ ...proposal, primary_color: newColor })
                          try {
                            await updateProposal(proposal.id, { primary_color: newColor })
                          } catch (err) {
                            console.error(err)
                          }
                        }}
                        className="h-10 w-20 cursor-pointer rounded bg-transparent p-1"
                      />
                      <span className="text-sm text-zinc-500">{proposal.primary_color || 'Padrão'}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="mb-2 block text-sm font-medium text-zinc-400">
                    Imagem de Capa
                  </label>
                  <ImageUpload
                    value={proposal.cover_image}
                    onChange={async (url) => {
                      setProposal({ ...proposal, cover_image: url })
                      await updateProposal(proposal.id, { cover_image: url })
                    }}
                    onRemove={async () => {
                      setProposal({ ...proposal, cover_image: null })
                      await updateProposal(proposal.id, { cover_image: '' })
                    }}
                    bucket="proposals"
                    label="Capa da Proposta"
                  />
                </div>
              </div>
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
