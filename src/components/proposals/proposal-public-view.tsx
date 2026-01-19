'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, Check, ChevronRight, Download, Mail, Phone, Globe } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { toggleProposalOptional, acceptProposalPublic } from '@/actions/proposals'

type ProposalPublicData = {
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
  organizations?: {
    id: string
    name: string
    logo: string | null
    email: string | null
    phone: string | null
    website: string | null
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

interface ProposalPublicViewProps {
  proposal: ProposalPublicData
}

export function ProposalPublicView({ proposal: initialProposal }: ProposalPublicViewProps) {
  const [proposal, setProposal] = useState(initialProposal)
  const [isAccepting, setIsAccepting] = useState(false)
  const [isAccepted, setIsAccepted] = useState(proposal.status === 'ACCEPTED')

  // Calculations
  const baseValue = proposal.items.reduce((sum, item) => sum + Number(item.total), 0)
  const discountAmount = baseValue * (Number(proposal.discount) / 100)
  const optionalsValue = proposal.optionals
    .filter((opt) => opt.is_selected)
    .reduce((sum, opt) => sum + Number(opt.price), 0)
  const totalValue = baseValue + optionalsValue - discountAmount

  const handleToggleOptional = async (optionalId: string, isSelected: boolean) => {
    // Optimistic UI update
    setProposal({
      ...proposal,
      optionals: proposal.optionals.map((opt) =>
        opt.id === optionalId ? { ...opt, is_selected: isSelected } : opt
      ),
    })

    try {
      await toggleProposalOptional(proposal.id, optionalId, isSelected)
    } catch (error) {
      // Revert on error
      setProposal({
        ...proposal,
        optionals: proposal.optionals.map((opt) =>
          opt.id === optionalId ? { ...opt, is_selected: !isSelected } : opt
        ),
      })
      alert('Erro ao atualizar opcional')
    }
  }

  const handleAcceptProposal = async () => {
    if (!confirm('Confirmar aceitação desta proposta?')) return

    setIsAccepting(true)
    try {
      await acceptProposalPublic(proposal.token)
      setIsAccepted(true)
    } catch (error: any) {
      alert(error.message || 'Erro ao aceitar proposta')
    } finally {
      setIsAccepting(false)
    }
  }

  const handleDownloadPDF = () => {
    window.print()
  }

  // Extract video ID from URLs
  const getVideoEmbedUrl = (url: string) => {
    if (url.includes('vimeo.com')) {
      const videoId = url.split('/').pop()
      return `https://player.vimeo.com/video/${videoId}`
    }
    if (url.includes('youtube.com/watch')) {
      const videoId = url.split('v=')[1]?.split('&')[0]
      return `https://www.youtube.com/embed/${videoId}`
    }
    if (url.includes('youtu.be')) {
      const videoId = url.split('/').pop()
      return `https://www.youtube.com/embed/${videoId}`
    }
    return url
  }

  if (isAccepted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, duration: 0.3, type: 'spring' }}
            className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-neutral-900"
          >
            <CheckCircle className="h-10 w-10 text-white" />
          </motion.div>
          <h1 className="text-3xl font-semibold text-neutral-900 mb-3">
            Proposta aceita
          </h1>
          <p className="text-base text-neutral-600 leading-relaxed mb-8">
            Obrigado pela confiança. Entraremos em contato em breve para iniciar o projeto.
          </p>
          <div className="rounded-xl border border-neutral-200 bg-white p-8">
            <p className="text-xs font-medium uppercase tracking-wider text-neutral-500 mb-2">
              Valor acordado
            </p>
            <p className="text-4xl font-semibold text-neutral-900">
              {formatCurrency(totalValue)}
            </p>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <>
      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .no-print {
            display: none !important;
          }
          .print-break-before {
            page-break-before: always;
          }
          header {
            position: relative !important;
          }
          main {
            padding-top: 2rem !important;
          }
        }
      `}</style>

      <div className="min-h-screen bg-white">
        {/* Header */}
        <header className="sticky top-0 z-10 border-b border-neutral-100 bg-white/95 backdrop-blur-sm print:static print:bg-white">
          <div className="mx-auto max-w-3xl px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {proposal.organizations?.logo ? (
                  <img
                    src={proposal.organizations.logo}
                    alt={proposal.organizations.name}
                    className="h-8 w-auto"
                  />
                ) : (
                  <span className="text-lg font-semibold text-neutral-900">
                    {proposal.organizations?.name || 'Proposta'}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4">
                {proposal.organizations?.website && (
                  <a
                    href={proposal.organizations.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors no-print"
                  >
                    {proposal.organizations.website.replace(/^https?:\/\//, '')}
                  </a>
                )}
                <button
                  onClick={handleDownloadPDF}
                  className="no-print inline-flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 hover:border-neutral-300 transition-all"
                >
                  <Download className="h-4 w-4" />
                  <span>PDF</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="mx-auto max-w-3xl px-6 py-12">
          {/* Title Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12 pb-8 border-b border-neutral-100"
          >
            <p className="text-xs font-medium uppercase tracking-widest text-neutral-400 mb-4">
              Proposta Comercial
            </p>
            <h1 className="text-3xl md:text-4xl font-semibold text-neutral-900 mb-3 leading-tight">
              {proposal.title}
            </h1>
            {proposal.description && (
              <p className="text-base text-neutral-600 leading-relaxed max-w-2xl">
                {proposal.description}
              </p>
            )}
            {proposal.clients && (
              <div className="mt-6 flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-neutral-900 flex items-center justify-center text-white font-medium text-sm">
                  {proposal.clients.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-xs text-neutral-400">Preparado para</p>
                  <p className="text-sm font-medium text-neutral-900">{proposal.clients.name}</p>
                </div>
              </div>
            )}
          </motion.div>

          {/* Items */}
          {proposal.items.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-12"
            >
              <h2 className="text-xs font-medium uppercase tracking-widest text-neutral-400 mb-6">
                Escopo do Projeto
              </h2>
              <div className="space-y-1">
                {proposal.items
                  .sort((a, b) => a.order - b.order)
                  .map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + index * 0.03 }}
                      className="group flex items-center justify-between py-4 border-b border-neutral-100 last:border-0"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-base font-medium text-neutral-900">
                          {item.description}
                        </p>
                        <p className="text-sm text-neutral-400 mt-0.5">
                          {item.quantity} {item.quantity === 1 ? 'unidade' : 'unidades'} × {formatCurrency(Number(item.unit_price))}
                        </p>
                      </div>
                      <p className="text-base font-semibold text-neutral-900 tabular-nums">
                        {formatCurrency(Number(item.total))}
                      </p>
                    </motion.div>
                  ))}
              </div>
            </motion.section>
          )}

          {/* Optionals */}
          {proposal.optionals.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="mb-12 no-print"
            >
              <h2 className="text-xs font-medium uppercase tracking-widest text-neutral-400 mb-2">
                Itens Opcionais
              </h2>
              <p className="text-sm text-neutral-500 mb-6">
                Selecione os adicionais que deseja incluir
              </p>
              <div className="space-y-2">
                {proposal.optionals
                  .sort((a, b) => a.order - b.order)
                  .map((optional, index) => (
                    <motion.button
                      key={optional.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.15 + index * 0.03 }}
                      onClick={() => handleToggleOptional(optional.id, !optional.is_selected)}
                      className={`w-full rounded-lg border p-4 text-left transition-all duration-200 ${
                        optional.is_selected
                          ? 'border-neutral-900 bg-neutral-900 text-white'
                          : 'border-neutral-200 bg-white hover:border-neutral-300'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border transition-all ${
                            optional.is_selected
                              ? 'border-white bg-white'
                              : 'border-neutral-300 bg-white'
                          }`}
                        >
                          {optional.is_selected && <Check className="h-3 w-3 text-neutral-900" strokeWidth={3} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium ${optional.is_selected ? 'text-white' : 'text-neutral-900'}`}>
                            {optional.title}
                          </p>
                          {optional.description && (
                            <p className={`text-sm mt-0.5 ${optional.is_selected ? 'text-neutral-300' : 'text-neutral-500'}`}>
                              {optional.description}
                            </p>
                          )}
                        </div>
                        <p className={`text-sm font-semibold tabular-nums ${optional.is_selected ? 'text-white' : 'text-neutral-900'}`}>
                          +{formatCurrency(Number(optional.price))}
                        </p>
                      </div>
                    </motion.button>
                  ))}
              </div>
            </motion.section>
          )}

          {/* Selected Optionals for Print */}
          {proposal.optionals.filter(opt => opt.is_selected).length > 0 && (
            <section className="mb-12 hidden print:block">
              <h2 className="text-xs font-medium uppercase tracking-widest text-neutral-400 mb-6">
                Opcionais Selecionados
              </h2>
              <div className="space-y-1">
                {proposal.optionals
                  .filter(opt => opt.is_selected)
                  .sort((a, b) => a.order - b.order)
                  .map((optional) => (
                    <div
                      key={optional.id}
                      className="flex items-center justify-between py-4 border-b border-neutral-100 last:border-0"
                    >
                      <div className="flex-1">
                        <p className="text-base font-medium text-neutral-900">
                          {optional.title}
                        </p>
                        {optional.description && (
                          <p className="text-sm text-neutral-500 mt-0.5">
                            {optional.description}
                          </p>
                        )}
                      </div>
                      <p className="text-base font-semibold text-neutral-900 tabular-nums">
                        +{formatCurrency(Number(optional.price))}
                      </p>
                    </div>
                  ))}
              </div>
            </section>
          )}

          {/* Videos */}
          {proposal.videos.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-12 no-print"
            >
              <h2 className="text-xs font-medium uppercase tracking-widest text-neutral-400 mb-6">
                Portfolio
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {proposal.videos
                  .sort((a, b) => a.order - b.order)
                  .map((video, index) => (
                    <motion.div
                      key={video.id}
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2 + index * 0.05 }}
                      className="group rounded-lg border border-neutral-200 overflow-hidden bg-white hover:border-neutral-300 transition-all"
                    >
                      <div className="aspect-video bg-neutral-100 relative overflow-hidden">
                        <iframe
                          src={getVideoEmbedUrl(video.video_url)}
                          title={video.title}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          className="h-full w-full"
                        />
                      </div>
                      <div className="p-3 border-t border-neutral-100">
                        <p className="text-sm font-medium text-neutral-900">{video.title}</p>
                      </div>
                    </motion.div>
                  ))}
              </div>
            </motion.section>
          )}

          {/* Summary */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="pt-8 border-t border-neutral-200"
          >
            {/* Breakdown */}
            <div className="mb-6 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-600">Subtotal</span>
                <span className="font-medium text-neutral-900 tabular-nums">{formatCurrency(baseValue)}</span>
              </div>
              {proposal.discount > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-600">Desconto ({proposal.discount}%)</span>
                  <span className="font-medium text-neutral-900 tabular-nums">
                    -{formatCurrency(discountAmount)}
                  </span>
                </div>
              )}
              {optionalsValue > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-600">Opcionais</span>
                  <span className="font-medium text-neutral-900 tabular-nums">
                    +{formatCurrency(optionalsValue)}
                  </span>
                </div>
              )}
            </div>

            {/* Total */}
            <div className="rounded-lg bg-neutral-900 p-6 mb-6">
              <div className="flex items-baseline justify-between">
                <span className="text-sm font-medium text-neutral-400">
                  Total
                </span>
                <span className="text-3xl font-semibold text-white tabular-nums">
                  {formatCurrency(totalValue)}
                </span>
              </div>
              {proposal.valid_until && (
                <p className="text-sm text-neutral-400 mt-2">
                  Válido até {new Date(proposal.valid_until).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                </p>
              )}
            </div>

            {/* Accept Button */}
            <button
              onClick={handleAcceptProposal}
              disabled={isAccepting}
              className="no-print group w-full flex items-center justify-center gap-2 rounded-lg bg-neutral-900 px-6 py-3 text-sm font-medium text-white transition-all hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>{isAccepting ? 'Processando...' : 'Aceitar proposta'}</span>
              <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </button>

            {/* Contact Info */}
            {(proposal.organizations?.email || proposal.organizations?.phone || proposal.organizations?.website) && (
              <div className="mt-10 pt-8 border-t border-neutral-100">
                <p className="text-xs font-medium uppercase tracking-widest text-neutral-400 mb-4">
                  Contato
                </p>
                <div className="flex flex-wrap items-center gap-6">
                  {proposal.organizations.email && (
                    <a
                      href={`mailto:${proposal.organizations.email}`}
                      className="inline-flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
                    >
                      <Mail className="h-4 w-4" />
                      {proposal.organizations.email}
                    </a>
                  )}
                  {proposal.organizations.phone && (
                    <a
                      href={`tel:${proposal.organizations.phone}`}
                      className="inline-flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
                    >
                      <Phone className="h-4 w-4" />
                      {proposal.organizations.phone}
                    </a>
                  )}
                  {proposal.organizations.website && (
                    <a
                      href={proposal.organizations.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
                    >
                      <Globe className="h-4 w-4" />
                      {proposal.organizations.website.replace(/^https?:\/\//, '')}
                    </a>
                  )}
                </div>
              </div>
            )}
          </motion.section>
        </main>

        {/* Footer */}
        <footer className="border-t border-neutral-100 mt-12">
          <div className="mx-auto max-w-3xl px-6 py-6">
            <p className="text-xs text-neutral-400 text-center">
              {proposal.organizations?.name} &copy; {new Date().getFullYear()}
            </p>
          </div>
        </footer>
      </div>
    </>
  )
}
