'use client'

import { Phone, DollarSign, ArrowRight, Building2 } from 'lucide-react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { completeSetup } from '@/actions/auth'

export default function SetupPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    companyName: '',
    whatsapp: '',
    capitalInicial: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const capitalValue = formData.capitalInicial ? parseFloat(formData.capitalInicial) : undefined

      if (capitalValue !== undefined && (isNaN(capitalValue) || capitalValue < 0)) {
        alert('Capital inicial inválido. Informe um valor positivo.')
        setIsLoading(false)
        return
      }

      await completeSetup(
        formData.companyName,
        formData.whatsapp || undefined,
        capitalValue
      )

      router.push('/dashboard')
      router.refresh()
    } catch (error: any) {
      alert(error.message || 'Erro ao salvar dados')
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-primary p-4">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-bg-secondary via-bg-primary to-bg-primary opacity-50" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-bg-secondary/20 via-transparent to-transparent" />

      {/* Setup card */}
      <div className="relative w-full max-w-md">
        <div className="rounded-2xl border border-border bg-card/50 p-6 md:p-8 backdrop-blur-xl">
          {/* Logo */}
          <div className="mb-6 md:mb-8 flex items-center justify-center gap-3">
            <img src="/logo-icon.svg" alt="Clapper" className="h-12 w-12" />
            <h1 className="text-xl md:text-2xl font-bold text-text-primary">Clapper</h1>
          </div>

          {/* Title */}
          <div className="mb-6 text-center">
            <h2 className="text-xl md:text-2xl font-bold text-text-primary">
              Complete seu cadastro
            </h2>
            <p className="mt-2 text-sm text-text-tertiary">
              Só mais alguns dados para configurar sua conta
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-text-secondary">
                Nome da Empresa/Produtora
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-text-tertiary" />
                <input
                  type="text"
                  required
                  value={formData.companyName}
                  onChange={(e) =>
                    setFormData({ ...formData, companyName: e.target.value })
                  }
                  className="w-full rounded-lg border border-border bg-secondary py-3 pl-11 pr-4 text-text-primary placeholder-text-quaternary transition-all focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="Ex: Minha Produtora"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-text-secondary">
                Celular
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-text-tertiary" />
                <input
                  type="tel"
                  value={formData.whatsapp}
                  onChange={(e) =>
                    setFormData({ ...formData, whatsapp: e.target.value })
                  }
                  className="w-full rounded-lg border border-border bg-secondary py-3 pl-11 pr-4 text-text-primary placeholder-text-quaternary transition-all focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="(11) 99999-9999"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-text-secondary">
                Capital Inicial (R$) <span className="text-text-tertiary font-normal">- Opcional</span>
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-text-tertiary" />
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.capitalInicial}
                  onChange={(e) =>
                    setFormData({ ...formData, capitalInicial: e.target.value })
                  }
                  className="w-full rounded-lg border border-border bg-secondary py-3 pl-11 pr-4 text-text-primary placeholder-text-quaternary transition-all focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="50000.00"
                />
              </div>
              <p className="mt-2 text-xs text-text-tertiary">
                Informe o saldo atual da sua conta bancária empresarial
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full overflow-hidden rounded-lg bg-text-primary py-3 font-medium text-bg-primary transition-all hover:bg-text-secondary disabled:opacity-50"
            >
              <span className="flex items-center justify-center gap-2">
                {isLoading ? (
                  <>
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-bg-primary border-t-transparent" />
                    Salvando...
                  </>
                ) : (
                  <>
                    Começar a usar
                    <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </span>
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
