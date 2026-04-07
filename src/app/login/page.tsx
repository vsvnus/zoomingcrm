'use client'

import { Mail, Lock, ArrowRight, ArrowLeft, Phone, DollarSign, Eye, EyeOff, CheckCircle } from 'lucide-react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn, signUp, resetPassword } from '@/actions/auth'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [isSignUp, setIsSignUp] = useState(false)
  const [isForgotPassword, setIsForgotPassword] = useState(false)
  const [resetEmailSent, setResetEmailSent] = useState(false)
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
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      })
      if (error) {
        alert('Erro ao conectar com Google. Tente novamente.')
        setIsGoogleLoading(false)
      }
    } catch {
      alert('Erro ao conectar com Google. Tente novamente.')
      setIsGoogleLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (isForgotPassword) {
        await resetPassword(formData.email)
        setResetEmailSent(true)
        setIsLoading(false)
        return
      }

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
    <div className="flex min-h-screen items-center justify-center bg-bg-primary p-4" >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-bg-secondary via-bg-primary to-bg-primary opacity-50" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-bg-secondary/20 via-transparent to-transparent" />

      {/* Login card */}
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
              {isForgotPassword ? 'Recuperar Senha' : isSignUp ? 'Criar Conta' : 'Bem-vindo de volta'}
            </h2>
            <p className="mt-2 text-sm text-text-tertiary">
              {isForgotPassword
                ? 'Informe seu email para receber o link de recuperação'
                : isSignUp
                  ? 'Preencha os dados para começar'
                  : 'Entre na sua conta para continuar'}
            </p>
          </div>

          {/* Reset email sent success */}
          {resetEmailSent ? (
            <div className="text-center py-4">
              <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
              <h3 className="text-lg font-semibold text-text-primary mb-2">Email enviado!</h3>
              <p className="text-sm text-text-tertiary mb-6">
                Verifique sua caixa de entrada e clique no link para redefinir sua senha.
              </p>
              <button
                type="button"
                onClick={() => {
                  setIsForgotPassword(false)
                  setResetEmailSent(false)
                }}
                className="text-sm text-text-tertiary transition-colors hover:text-text-primary"
              >
                <span className="font-medium text-text-primary">Voltar ao login</span>
              </button>
            </div>
          ) : (
            <>
              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {isSignUp && !isForgotPassword && (
                  <>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-text-secondary">
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
                          className="w-full rounded-lg border border-border bg-secondary py-3 pl-4 pr-4 text-text-primary placeholder-text-quaternary transition-all focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
                          placeholder="Seu nome"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-text-secondary">
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
                          className="w-full rounded-lg border border-border bg-secondary py-3 pl-4 pr-4 text-text-primary placeholder-text-quaternary transition-all focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
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
                          required={isSignUp}
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
                  </>
                )}

                <div>
                  <label className="mb-2 block text-sm font-medium text-text-secondary">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-text-tertiary" />
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="w-full rounded-lg border border-border bg-secondary py-3 pl-11 pr-4 text-text-primary placeholder-text-quaternary transition-all focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
                      placeholder="seu@email.com"
                    />
                  </div>
                </div>

                {!isForgotPassword && (
                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <label className="block text-sm font-medium text-text-secondary">
                        Senha
                      </label>
                      {!isSignUp && (
                        <button
                          type="button"
                          onClick={() => setIsForgotPassword(true)}
                          className="text-xs text-text-tertiary transition-colors hover:text-text-primary"
                        >
                          Esqueceu a senha?
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-text-tertiary" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={formData.password}
                        onChange={(e) =>
                          setFormData({ ...formData, password: e.target.value })
                        }
                        className="w-full rounded-lg border border-border bg-secondary py-3 pl-11 pr-12 text-text-primary placeholder-text-quaternary transition-all focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="group relative w-full overflow-hidden rounded-lg bg-text-primary py-3 font-medium text-bg-primary transition-all hover:bg-text-secondary disabled:opacity-50"
                >
                  <span className="flex items-center justify-center gap-2">
                    {isLoading ? (
                      <>
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-bg-primary border-t-transparent" />
                        {isForgotPassword ? 'Enviando...' : 'Carregando...'}
                      </>
                    ) : (
                      <>
                        {isForgotPassword ? 'Enviar Link' : isSignUp ? 'Criar Conta' : 'Entrar'}
                        <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                      </>
                    )}
                  </span>
                </button>
              </form>

              {/* Separador e botão Google (apenas no login e sign up, não no forgot password) */}
              {!isForgotPassword && (
                <>
                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-border" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card/50 px-2 text-text-tertiary backdrop-blur-xl">ou</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={isGoogleLoading || isLoading}
                    className="flex w-full items-center justify-center gap-3 rounded-lg border border-border bg-secondary py-3 font-medium text-text-primary transition-all hover:bg-bg-tertiary disabled:opacity-50"
                  >
                    {isGoogleLoading ? (
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-text-primary border-t-transparent" />
                    ) : (
                      <svg className="h-5 w-5" viewBox="0 0 24 24">
                        <path
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                          fill="#4285F4"
                        />
                        <path
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          fill="#34A853"
                        />
                        <path
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          fill="#FBBC05"
                        />
                        <path
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          fill="#EA4335"
                        />
                      </svg>
                    )}
                    {isGoogleLoading ? 'Conectando...' : 'Continuar com Google'}
                  </button>
                </>
              )}

              {/* Toggle sign up/sign in / back from forgot password */}
              <div className="mt-6 text-center">
                {isForgotPassword ? (
                  <button
                    type="button"
                    onClick={() => setIsForgotPassword(false)}
                    className="inline-flex items-center gap-1 text-sm text-text-tertiary transition-colors hover:text-text-primary"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Voltar ao <span className="font-medium text-text-primary">login</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignUp(!isSignUp)
                      setFormData({ email: '', password: '', name: '', companyName: '', whatsapp: '', capitalInicial: '' })
                    }}
                    className="text-sm text-text-tertiary transition-colors hover:text-text-primary"
                  >
                    {isSignUp ? (
                      <>
                        Já tem uma conta?{' '}
                        <span className="font-medium text-text-primary">Fazer login</span>
                      </>
                    ) : (
                      <>
                        Não tem uma conta?{' '}
                        <span className="font-medium text-text-primary">Criar conta</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </>
          )}


        </div>
      </div>
    </div>
  )
}
