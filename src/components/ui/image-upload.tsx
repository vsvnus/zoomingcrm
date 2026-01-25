'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import Image from 'next/image'

interface ImageUploadProps {
    value?: string | null
    onChange: (url: string) => void
    onRemove: () => void
    bucket?: string
    path?: string
    className?: string
    label?: string
}

export function ImageUpload({
    value,
    onChange,
    onRemove,
    bucket = 'public', // Default bucket, typically needs to be created in Supabase
    path = 'uploads',
    className,
    label = 'Upload de Imagem'
}: ImageUploadProps) {
    const [isUploading, setIsUploading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const supabase = createClient()

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setIsUploading(true)
        try {
            const fileExt = file.name.split('.').pop()
            const fileName = `${path}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`

            const { data, error } = await supabase.storage
                .from(bucket)
                .upload(fileName, file)

            if (error) {
                throw new Error(error.message)
            }

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from(bucket)
                .getPublicUrl(fileName)

            onChange(publicUrl)
        } catch (error) {
            console.error('Error uploading image:', error)
            alert('Erro ao fazer upload da imagem. Verifique se o bucket existe.')
        } finally {
            setIsUploading(false)
        }
    }

    return (
        <div className={cn("flex flex-col gap-4", className)}>
            {value ? (
                <div className="relative aspect-video w-40 overflow-hidden rounded-lg border bg-muted">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={value}
                        alt="Upload"
                        className="h-full w-full object-cover"
                    />
                    <button
                        onClick={onRemove}
                        className="absolute right-1 top-1 rounded-full bg-rose-500 p-1 text-white shadow-sm hover:bg-rose-600"
                        type="button"
                    >
                        <X className="h-3 w-3" />
                    </button>
                </div>
            ) : (
                <div
                    onClick={() => fileInputRef.current?.click()}
                    className="flex aspect-video w-40 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-muted-foreground/25 hover:bg-muted/50 transition-colors"
                >
                    {isUploading ? (
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    ) : (
                        <>
                            <ImageIcon className="h-6 w-6 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground text-center px-2">{label}</span>
                        </>
                    )}
                </div>
            )}
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleUpload}
                className="hidden"
                accept="image/*"
                disabled={isUploading}
            />
        </div>
    )
}
