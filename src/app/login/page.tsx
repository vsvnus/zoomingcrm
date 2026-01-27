'use client'

import { Play, Mail, Lock, ArrowRight, Phone, DollarSign, Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn, signUp } from '@/actions/auth'

export default function LoginPage() {
  const router = useRouter()
  const [isSignUp, setIsSignUp] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    companyName: '',
    whatsapp: '',

    capitalInicial: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (isSignUp) {
        // Validar capital inicial
        const capitalValue = formData.capitalInicial ? parseFloat(formData.capitalInicial) : undefined

        if (capitalValue !== undefined && (isNaN(capitalValue) || capitalValue < 0)) {
          alert('Capital inicial inválido. Informe um valor positivo.')
          setIsLoading(false)
          return
        }

        // Cadastro e redirect para dashboard
        await signUp(
          formData.email,
          formData.password,
          formData.name,
          formData.companyName,
          formData.whatsapp,
          capitalValue
        )

        // Redirect no cliente após sucesso
        router.push('/dashboard')
        router.refresh()
      } else {
        await signIn(formData.email, formData.password)

        // Redirect no cliente após sucesso
        router.push('/dashboard')
        router.refresh()
      }
    } catch (error: any) {
      alert(error.message || 'Erro ao fazer login')
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-black p-4" >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-black to-black opacity-50" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-zinc-800/20 via-transparent to-transparent" />

      {/* Login card */}
      <div className="relative w-full max-w-md">
        <div className="rounded-2xl border border-white/10 bg-zinc-900/50 p-8 backdrop-blur-xl">
          {/* Logo */}
          <div className="mb-8 flex items-center justify-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-zinc-100 to-zinc-400">
              <Play className="h-6 w-6 text-black" fill="black" />
            </div>
            <h1 className="text-2xl font-bold text-white">Zooming</h1>
          </div>

          {/* Title */}
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-bold text-white">
              {isSignUp ? 'Criar Conta' : 'Bem-vindo de volta'}
            </h2>
            <p className="mt-2 text-sm text-zinc-400">
              {isSignUp
                ? 'Preencha os dados para começar'
                : 'Entre na sua conta para continuar'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <>
                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-300">
                    Nome
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required={isSignUp}
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full rounded-lg border border-white/10 bg-white/5 py-3 pl-4 pr-4 text-white placeholder-zinc-500 transition-all focus:border-white/20 focus:outline-none focus:ring-2 focus:ring-white/10"
                      placeholder="Seu nome"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-300">
                    Nome da Empresa/Produtora
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required={isSignUp}
                      value={formData.companyName}
                      onChange={(e) =>
                        setFormData({ ...formData, companyName: e.target.value })
                      }
                      className="w-full rounded-lg border border-white/10 bg-white/5 py-3 pl-4 pr-4 text-white placeholder-zinc-500 transition-all focus:border-white/20 focus:outline-none focus:ring-2 focus:ring-white/10"
                      placeholder="Ex: Minha Produtora"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-300">
                    Celular
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-500" />
                    <input
                      type="tel"
                      required={isSignUp}
                      value={formData.whatsapp}
                      onChange={(e) =>
                        setFormData({ ...formData, whatsapp: e.target.value })
                      }
                      className="w-full rounded-lg border border-white/10 bg-white/5 py-3 pl-11 pr-4 text-white placeholder-zinc-500 transition-all focus:border-white/20 focus:outline-none focus:ring-2 focus:ring-white/10"
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-300">
                    Capital Inicial (R$) <span className="text-zinc-500 font-normal">- Opcional</span>
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-500" />
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.capitalInicial}
                      onChange={(e) =>
                        setFormData({ ...formData, capitalInicial: e.target.value })
                      }
                      className="w-full rounded-lg border border-white/10 bg-white/5 py-3 pl-11 pr-4 text-white placeholder-zinc-500 transition-all focus:border-white/20 focus:outline-none focus:ring-2 focus:ring-white/10"
                      placeholder="50000.00"
                    />
                  </div>
                  <p className="mt-2 text-xs text-zinc-500">
                    Informe o saldo atual da sua conta bancária empresarial
                  </p>
                </div>
              </>
            )}

            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-300">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-500" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full rounded-lg border border-white/10 bg-white/5 py-3 pl-11 pr-4 text-white placeholder-zinc-500 transition-all focus:border-white/20 focus:outline-none focus:ring-2 focus:ring-white/10"
                  placeholder="seu@email.com"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-300">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="w-full rounded-lg border border-white/10 bg-white/5 py-3 pl-11 pr-12 text-white placeholder-zinc-500 transition-all focus:border-white/20 focus:outline-none focus:ring-2 focus:ring-white/10"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full overflow-hidden rounded-lg bg-white py-3 font-medium text-black transition-all hover:bg-zinc-200 disabled:opacity-50"
            >
              <span className="flex items-center justify-center gap-2">
                {isLoading ? (
                  <>
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-black border-t-transparent" />
                    Carregando...
                  </>
                ) : (
                  <>
                    {isSignUp ? 'Criar Conta' : 'Entrar'}
                    <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </span>
            </button>
          </form>

          {/* Toggle sign up/sign in */}
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp)
                setFormData({ email: '', password: '', name: '', companyName: '', whatsapp: '', capitalInicial: '' })
              }}
              className="text-sm text-zinc-400 transition-colors hover:text-white"
            >
              {isSignUp ? (
                <>
                  Já tem uma conta?{' '}
                  <span className="font-medium text-white">Fazer login</span>
                </>
              ) : (
                <>
                  Não tem uma conta?{' '}
                  <span className="font-medium text-white">Criar conta</span>
                </>
              )}
            </button>
          </div>

          {/* Demo credentials */}
          {!isSignUp && (
            <div className="mt-6 rounded-lg border border-blue-500/20 bg-blue-500/10 p-4">
              <p className="text-xs font-medium text-blue-400">
                💡 Credenciais de teste
              </p>
              <p className="mt-1 text-xs text-zinc-400">
                Email: demo@zooming.com
                <br />
                Senha: demo123456
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
