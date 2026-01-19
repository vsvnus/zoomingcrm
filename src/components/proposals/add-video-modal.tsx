'use client'

import { useState, useRef } from 'react'
import { X, Video, Upload, FileVideo } from 'lucide-react'
import { uploadProposalVideo } from '@/actions/proposals'

interface AddVideoModalProps {
  proposalId: string
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function AddVideoModal({
  proposalId,
  isOpen,
  onClose,
  onSuccess,
}: AddVideoModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [formData, setFormData] = useState({
    title: '',
  })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!isOpen) return null

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validar tipo de arquivo
      const validTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm']
      if (!validTypes.includes(file.type)) {
        alert('Por favor, selecione um arquivo de vídeo válido (MP4, MOV, AVI, WEBM)')
        return
      }

      // Validar tamanho (max 500MB)
      const maxSize = 500 * 1024 * 1024 // 500MB em bytes
      if (file.size > maxSize) {
        alert('O arquivo é muito grande. O tamanho máximo é 500MB.')
        return
      }

      setSelectedFile(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedFile) {
      alert('Por favor, selecione um arquivo de vídeo')
      return
    }

    setIsLoading(true)
    setUploadProgress(0)

    try {
      await uploadProposalVideo(proposalId, {
        title: formData.title,
        file: selectedFile,
      })

      setFormData({ title: '' })
      setSelectedFile(null)
      onSuccess()
      onClose()
    } catch (error) {
      console.error('Erro ao fazer upload do vídeo:', error)
      alert('Erro ao fazer upload do vídeo. Por favor, tente novamente.')
    } finally {
      setIsLoading(false)
      setUploadProgress(0)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-zinc-900 p-6 shadow-xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Adicionar Vídeo</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-white/5 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Info Banner */}
        <div className="mb-4 flex gap-3 rounded-lg border border-blue-500/20 bg-blue-500/10 p-4">
          <Video className="h-5 w-5 flex-shrink-0 text-blue-400" />
          <div className="text-sm text-zinc-300">
            <p className="font-medium">Faça upload de vídeos do seu portfólio</p>
            <p className="mt-1 text-zinc-400">
              Formatos aceitos: MP4, MOV, AVI, WEBM (máx. 500MB)
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Título */}
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-300">
              Título do Vídeo *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-zinc-500 transition-all focus:border-white/20 focus:outline-none focus:ring-2 focus:ring-white/10"
              placeholder="Ex: Case - Empresa XYZ 2025"
            />
          </div>

          {/* Upload de Arquivo */}
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-300">
              Arquivo de Vídeo *
            </label>

            <input
              ref={fileInputRef}
              type="file"
              accept="video/mp4,video/quicktime,video/x-msvideo,video/webm"
              onChange={handleFileSelect}
              className="hidden"
            />

            {!selectedFile ? (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-white/10 bg-white/5 px-4 py-8 text-white transition-all hover:border-white/20 hover:bg-white/10"
              >
                <Upload className="h-8 w-8 text-zinc-400" />
                <div className="text-center">
                  <p className="text-sm font-medium">Clique para selecionar um vídeo</p>
                  <p className="mt-1 text-xs text-zinc-500">MP4, MOV, AVI, WEBM (máx. 500MB)</p>
                </div>
              </button>
            ) : (
              <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                <div className="flex items-center gap-3">
                  <FileVideo className="h-10 w-10 text-blue-400" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">{selectedFile.name}</p>
                    <p className="text-xs text-zinc-500">{formatFileSize(selectedFile.size)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedFile(null)}
                    className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-white/5 hover:text-red-400"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Progress Bar */}
          {isLoading && uploadProgress > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-400">Enviando...</span>
                <span className="text-white">{uploadProgress}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full bg-blue-500 transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-white/10 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading || !selectedFile}
              className="flex-1 rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-black transition-all hover:bg-zinc-200 disabled:opacity-50"
            >
              {isLoading ? 'Enviando...' : 'Adicionar Vídeo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
