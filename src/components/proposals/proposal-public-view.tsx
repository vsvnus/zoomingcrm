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
  primary_color?: string | null
  cover_image?: string | null
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
    cnpj?: string | null
    address?: string | null
    bank_name?: string | null
    agency?: string | null
    account_number?: string | null
    pix_key?: string | null
    primary_color?: string | null
    show_bank_info?: boolean | null
    default_terms?: string | null
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

  // Theme Colors
  const primaryColor = proposal.primary_color || proposal.organizations?.primary_color || '#18181b' // Default zinc-900

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
            className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full"
            style={{ backgroundColor: primaryColor }}
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
            <p className="text-4xl font-semibold text-neutral-900" style={{ color: primaryColor }}>
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

      <div className="min-h-screen bg-neutral-50/50">
        {/* Cover Image */}
        {proposal.cover_image && (
          <div className="h-64 w-full md:h-80 relative overflow-hidden">
            <img
              src={proposal.cover_image}
              alt="Capa da Proposta"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/50 to-transparent" />
          </div>
        )}

        {/* Header */}
        <header className={`sticky top-0 z-10 border-b border-neutral-200/50 bg-white/80 backdrop-blur-md print:static print:bg-white ${proposal.cover_image ? '-mt-16 border-transparent bg-transparent text-white' : ''}`}>
          <div className="mx-auto max-w-4xl px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {proposal.organizations?.logo ? (
                  <img
                    src={proposal.organizations.logo}
                    alt={proposal.organizations.name}
                    className="h-10 w-auto rounded-md bg-white/10 p-1 backdrop-blur-sm"
                  />
                ) : (
                  <span className={`text-lg font-bold ${proposal.cover_image ? 'text-white drop-shadow-md' : 'text-neutral-900'}`}>
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
                    className={`text-sm hover:opacity-80 transition-opacity no-print ${proposal.cover_image ? 'text-white' : 'text-neutral-600'}`}
                  >
                    {proposal.organizations.website.replace(/^https?:\/\//, '')}
                  </a>
                )}
                <button
                  onClick={handleDownloadPDF}
                  className={`no-print inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-medium transition-all ${proposal.cover_image
                      ? 'border-white/30 bg-white/20 text-white hover:bg-white/30'
                      : 'border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50'
                    }`}
                >
                  <Download className="h-4 w-4" />
                  <span>PDF</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className={`mx-auto max-w-4xl px-6 py-12 ${proposal.cover_image ? 'pt-8' : ''}`}>
          {/* Paper Card Effect */}
          <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden">
            <div className="p-8 md:p-12">

              {/* Title Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-12 pb-8 border-b border-neutral-100"
              >
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-4">
                      Proposta Comercial
                    </p>
                    <h1 className="text-3xl md:text-5xl font-bold text-neutral-900 mb-4 leading-tight">
                      {proposal.title}
                    </h1>
                  </div>
                </div>

                {proposal.description && (
                  <p className="text-lg text-neutral-600 leading-relaxed max-w-2xl">
                    {proposal.description}
                  </p>
                )}

                {proposal.clients && (
                  <div className="mt-8 flex items-center gap-4 p-4 rounded-xl bg-neutral-50 border border-neutral-100 inline-flex">
                    <div className="h-10 w-10 rounded-full flex items-center justify-center text-white font-bold text-lg" style={{ backgroundColor: primaryColor }}>
                      {proposal.clients.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xs text-neutral-400 font-medium">Preparado para</p>
                      <p className="text-base font-semibold text-neutral-900">{proposal.clients.name}</p>
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
                  <div className="flex items-center gap-2 mb-6">
                    <div className="h-px bg-neutral-100 flex-1"></div>
                    <h2 className="text-sm font-bold uppercase tracking-widest text-neutral-400">
                      Escopo do Projeto
                    </h2>
                    <div className="h-px bg-neutral-100 flex-1"></div>
                  </div>

                  <div className="space-y-1">
                    {proposal.items
                      .sort((a, b) => a.order - b.order)
                      .map((item, index) => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 + index * 0.03 }}
                          className="group flex items-center justify-between py-5 border-b border-neutral-50 last:border-0 hover:bg-neutral-50/50 px-2 rounded-lg transition-colors"
                        >
                          <div className="flex-1 min-w-0 pr-4">
                            <p className="text-lg font-medium text-neutral-900">
                              {item.description}
                            </p>
                            <p className="text-sm text-neutral-400 mt-1">
                              {item.quantity} {item.quantity === 1 ? 'unidade' : 'unidades'} × {formatCurrency(Number(item.unit_price))}
                            </p>
                          </div>
                          <p className="text-lg font-bold text-neutral-900 tabular-nums">
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
                  <div className="flex items-center gap-2 mb-6">
                    <div className="h-px bg-neutral-100 flex-1"></div>
                    <h2 className="text-sm font-bold uppercase tracking-widest text-neutral-400">
                      Itens Opcionais
                    </h2>
                    <div className="h-px bg-neutral-100 flex-1"></div>
                  </div>

                  <div className="grid gap-3">
                    {proposal.optionals
                      .sort((a, b) => a.order - b.order)
                      .map((optional, index) => (
                        <motion.button
                          key={optional.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.15 + index * 0.03 }}
                          onClick={() => handleToggleOptional(optional.id, !optional.is_selected)}
                          className={`w-full rounded-xl border-2 p-5 text-left transition-all duration-200 ${optional.is_selected
                            ? 'border-transparent text-white shadow-lg transform scale-[1.01]'
                            : 'border-neutral-100 bg-white hover:border-neutral-200 text-neutral-900'
                            }`}
                          style={{ backgroundColor: optional.is_selected ? primaryColor : 'white' }}
                        >
                          <div className="flex items-start gap-4">
                            <div
                              className={`mt-1 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border-2 transition-all ${optional.is_selected
                                ? 'border-white bg-white'
                                : 'border-neutral-200 bg-transparent'
                                }`}
                            >
                              {optional.is_selected && <Check className="h-3.5 w-3.5" style={{ color: primaryColor }} strokeWidth={4} />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-base font-bold ${optional.is_selected ? 'text-white' : 'text-neutral-900'}`}>
                                {optional.title}
                              </p>
                              {optional.description && (
                                <p className={`text-sm mt-1 ${optional.is_selected ? 'text-white/80' : 'text-neutral-500'}`}>
                                  {optional.description}
                                </p>
                              )}
                            </div>
                            <p className={`text-lg font-bold tabular-nums ${optional.is_selected ? 'text-white' : 'text-neutral-900'}`}>
                              +{formatCurrency(Number(optional.price))}
                            </p>
                          </div>
                        </motion.button>
                      ))}
                  </div>
                </motion.section>
              )}

              {/* Videos */}
              {proposal.videos.length > 0 && (
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="mb-12 no-print"
                >
                  <div className="flex items-center gap-2 mb-6">
                    <div className="h-px bg-neutral-100 flex-1"></div>
                    <h2 className="text-sm font-bold uppercase tracking-widest text-neutral-400">
                      Portfolio
                    </h2>
                    <div className="h-px bg-neutral-100 flex-1"></div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-6">
                    {proposal.videos
                      .sort((a, b) => a.order - b.order)
                      .map((video, index) => (
                        <motion.div
                          key={video.id}
                          initial={{ opacity: 0, scale: 0.98 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.2 + index * 0.05 }}
                          className="group rounded-xl border border-neutral-200 overflow-hidden bg-white hover:shadow-md transition-all"
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
                          <div className="p-4 border-t border-neutral-100">
                            <p className="text-sm font-bold text-neutral-900">{video.title}</p>
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
                className="pt-10 border-t border-neutral-100"
              >
                <div className="flex flex-col md:flex-row gap-12">
                  {/* Left Col: Contact */}
                  <div className="flex-1 space-y-8">
                    {/* Contact Info */}
                    <div className="space-y-4">
                      <p className="text-xs font-bold uppercase tracking-widest text-neutral-400">
                        Contato & Endereço
                      </p>
                      <div className="space-y-3">
                        {proposal.organizations?.email && (
                          <a
                            href={`mailto:${proposal.organizations.email}`}
                            className="flex items-center gap-3 text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors"
                          >
                            <div className="h-8 w-8 rounded-full bg-neutral-100 flex items-center justify-center">
                              <Mail className="h-4 w-4 text-neutral-500" />
                            </div>
                            {proposal.organizations.email}
                          </a>
                        )}
                        {proposal.organizations?.phone && (
                          <a
                            href={`tel:${proposal.organizations.phone}`}
                            className="flex items-center gap-3 text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors"
                          >
                            <div className="h-8 w-8 rounded-full bg-neutral-100 flex items-center justify-center">
                              <Phone className="h-4 w-4 text-neutral-500" />
                            </div>
                            {proposal.organizations.phone}
                          </a>
                        )}
                        {proposal.organizations?.website && (
                          <a
                            href={proposal.organizations.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors"
                          >
                            <div className="h-8 w-8 rounded-full bg-neutral-100 flex items-center justify-center">
                              <Globe className="h-4 w-4 text-neutral-500" />
                            </div>
                            {proposal.organizations.website.replace(/^https?:\/\//, '')}
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Bank Info */}
                    {proposal.organizations?.show_bank_info && (proposal.organizations?.bank_name || proposal.organizations?.pix_key) && (
                      <div className="p-6 rounded-xl bg-neutral-50 border border-neutral-100">
                        <p className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-4">
                          Dados Bancários
                        </p>
                        <div className="space-y-3 text-sm">
                          {proposal.organizations.bank_name && (
                            <div className="flex justify-between border-b border-neutral-200/50 pb-2 last:border-0 last:pb-0">
                              <span className="text-neutral-500">Banco</span>
                              <span className="font-semibold text-neutral-900">{proposal.organizations.bank_name}</span>
                            </div>
                          )}
                          {proposal.organizations.agency && (
                            <div className="flex justify-between border-b border-neutral-200/50 pb-2 last:border-0 last:pb-0">
                              <span className="text-neutral-500">Agência</span>
                              <span className="font-semibold text-neutral-900">{proposal.organizations.agency}</span>
                            </div>
                          )}
                          {proposal.organizations.account_number && (
                            <div className="flex justify-between border-b border-neutral-200/50 pb-2 last:border-0 last:pb-0">
                              <span className="text-neutral-500">Conta</span>
                              <span className="font-semibold text-neutral-900">{proposal.organizations.account_number}</span>
                            </div>
                          )}
                          {proposal.organizations.pix_key && (
                            <div className="mt-4 pt-3 border-t border-neutral-200">
                              <span className="block text-xs font-medium text-neutral-500 mb-1">Chave PIX</span>
                              <div className="flex items-center gap-2 font-mono bg-white p-2.5 rounded border border-neutral-200 select-all text-neutral-900">
                                {proposal.organizations.pix_key}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right Col: Totals */}
                  <div className="flex-1">
                    <div className="bg-neutral-900 rounded-2xl p-8 text-white shadow-xl" style={{ backgroundColor: primaryColor }}>
                      {/* Breakdown */}
                      <div className="mb-8 space-y-3 border-b border-white/10 pb-8">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-white/70">Subtotal</span>
                          <span className="font-medium text-white tabular-nums">{formatCurrency(baseValue)}</span>
                        </div>
                        {proposal.discount > 0 && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-white/70">Desconto ({proposal.discount}%)</span>
                            <span className="font-medium text-white tabular-nums">
                              -{formatCurrency(discountAmount)}
                            </span>
                          </div>
                        )}
                        {optionalsValue > 0 && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-white/70">Opcionais</span>
                            <span className="font-medium text-white tabular-nums">
                              +{formatCurrency(optionalsValue)}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Total */}
                      <div className="mb-8">
                        <span className="text-white/60 text-sm font-medium uppercase tracking-wider">
                          Valor Total
                        </span>
                        <div className="flex items-baseline gap-1 mt-1">
                          <span className="text-5xl font-bold tracking-tight">
                            {formatCurrency(totalValue).replace('R$', '')}
                          </span>
                          <span className="text-xl font-medium text-white/60">BRL</span>
                        </div>
                        {proposal.valid_until && (
                          <p className="text-sm text-white/50 mt-4 bg-white/10 inline-block px-3 py-1 rounded-full">
                            Válido até {new Date(proposal.valid_until).toLocaleDateString('pt-BR')}
                          </p>
                        )}
                      </div>

                      {/* Accept Button */}
                      <button
                        onClick={handleAcceptProposal}
                        disabled={isAccepting}
                        className="no-print group w-full flex items-center justify-center gap-2 rounded-xl bg-white text-black px-6 py-4 text-base font-bold transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                      >
                        <span>{isAccepting ? 'Processando...' : 'Aceitar e Aprovar'}</span>
                        <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.section>

            </div>

            {/* Terms Footer */}
            {proposal.organizations?.default_terms && (
              <div className="bg-neutral-50 border-t border-neutral-200 px-8 py-8 md:px-12 print:break-inside-avoid">
                <p className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-4">
                  Termos e Condições
                </p>
                <div className="text-xs text-neutral-500 whitespace-pre-wrap leading-relaxed max-w-none prose prose-sm prose-neutral">
                  {proposal.organizations.default_terms}
                </div>
              </div>
            )}

            <div className="bg-neutral-100 border-t border-neutral-200 px-8 py-4 text-center">
              <p className="text-xs font-medium text-neutral-500">
                {proposal.organizations?.name} &copy; {new Date().getFullYear()} • Powered by Zooming
              </p>
            </div>
          </div>
        </main>
      </div>
    </>
  )
}
