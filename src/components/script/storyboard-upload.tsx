'use client'

import { useState, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Upload, X, Loader2, Image as ImageIcon, Camera } from 'lucide-react'

interface StoryboardUploadProps {
  sceneId: string
  scriptId: string
  currentUrl?: string | null
  onUpload: (url: string) => void
  onRemove: () => void
  compact?: boolean
}

export function StoryboardUpload({
  sceneId,
  scriptId,
  currentUrl,
  onUpload,
  onRemove,
  compact = false,
}: StoryboardUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const [progress, setProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  const uploadFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Apenas imagens são aceitas')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('Imagem muito grande (máx. 10MB)')
      return
    }

    setIsUploading(true)
    setProgress(0)

    try {
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg'
      const fileName = `storyboards/${scriptId}/${sceneId}-${Date.now()}.${fileExt}`

      // If there's an existing image, try to delete it first
      if (currentUrl) {
        try {
          const oldPath = extractPathFromUrl(currentUrl)
          if (oldPath) {
            await supabase.storage.from('scripts').remove([oldPath])
          }
        } catch {
          // ignore removal errors
        }
      }

      setProgress(30)

      const { data, error } = await supabase.storage
        .from('scripts')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true,
        })

      if (error) throw error

      setProgress(80)

      const { data: { publicUrl } } = supabase.storage
        .from('scripts')
        .getPublicUrl(fileName)

      setProgress(100)
      onUpload(publicUrl)
    } catch (error: any) {
      console.error('Upload error:', error)
      alert('Erro ao fazer upload: ' + (error?.message || 'Tente novamente'))
    } finally {
      setIsUploading(false)
      setProgress(0)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) uploadFile(file)
    // Reset input so same file can be selected again
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) uploadFile(file)
  }, [scriptId, sceneId])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false)
  }, [])

  const handleRemove = async () => {
    if (currentUrl) {
      try {
        const path = extractPathFromUrl(currentUrl)
        if (path) {
          await supabase.storage.from('scripts').remove([path])
        }
      } catch {
        // ignore
      }
    }
    onRemove()
  }

  if (compact) {
    return (
      <div className="relative group">
        {currentUrl ? (
          <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-border">
            <img src={currentUrl} alt="Storyboard" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="rounded-lg bg-white/20 p-2 text-white hover:bg-white/30 backdrop-blur-sm transition-colors"
                title="Substituir imagem"
              >
                <Camera className="h-4 w-4" />
              </button>
              <button
                onClick={handleRemove}
                className="rounded-lg bg-red-500/50 p-2 text-white hover:bg-red-500/70 backdrop-blur-sm transition-colors"
                title="Remover imagem"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            className={`flex aspect-video w-full cursor-pointer items-center justify-center rounded-lg border-2 border-dashed transition-colors ${
              isDragOver
                ? 'border-accent-500 bg-accent-500/5'
                : 'border-border hover:border-text-tertiary hover:bg-bg-hover'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            {isUploading ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin text-accent-500" />
                <span className="text-xs text-text-tertiary">{progress}%</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-1.5 text-text-tertiary">
                <ImageIcon className="h-5 w-5 opacity-40" />
                <span className="text-[10px]">Storyboard</span>
              </div>
            )}
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          disabled={isUploading}
        />
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-xs font-medium text-text-tertiary uppercase tracking-wider">
        <Camera className="h-3.5 w-3.5" />
        Imagem do Storyboard
      </label>

      {currentUrl ? (
        <div className="relative group rounded-xl overflow-hidden border border-border">
          <img
            src={currentUrl}
            alt="Storyboard"
            className="w-full aspect-video object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="absolute bottom-3 right-3 flex gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 rounded-lg bg-white/20 px-3 py-1.5 text-xs font-medium text-white hover:bg-white/30 backdrop-blur-sm transition-colors"
              >
                <Camera className="h-3.5 w-3.5" />
                Substituir
              </button>
              <button
                onClick={handleRemove}
                className="flex items-center gap-1.5 rounded-lg bg-red-500/60 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-500/80 backdrop-blur-sm transition-colors"
              >
                <X className="h-3.5 w-3.5" />
                Remover
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`flex aspect-video w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed transition-all ${
            isDragOver
              ? 'border-accent-500 bg-accent-500/5 scale-[1.01]'
              : 'border-border hover:border-text-tertiary hover:bg-bg-hover'
          }`}
        >
          {isUploading ? (
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-accent-500" />
              <div className="w-32 h-1.5 rounded-full bg-bg-secondary overflow-hidden">
                <div
                  className="h-full bg-accent-500 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-xs text-text-tertiary">Enviando... {progress}%</span>
            </div>
          ) : (
            <>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-bg-secondary">
                <Upload className="h-5 w-5 text-text-tertiary" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-text-secondary">
                  Arraste uma imagem ou clique para enviar
                </p>
                <p className="text-xs text-text-tertiary mt-1">
                  PNG, JPG, WEBP (máx. 10MB)
                </p>
              </div>
            </>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        onChange={handleFileChange}
        className="hidden"
        disabled={isUploading}
      />
    </div>
  )
}

// Helper to extract storage path from public URL
function extractPathFromUrl(url: string): string | null {
  try {
    const match = url.match(/\/storage\/v1\/object\/public\/scripts\/(.+)$/)
    return match ? match[1] : null
  } catch {
    return null
  }
}
