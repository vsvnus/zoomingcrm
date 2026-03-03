'use client'

import { Play, Lock, ArrowRight, Eye, EyeOff, CheckCircle } from 'lucide-react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updatePassword } from '@/actions/auth'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [success, setSuccess] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      alert('As senhas não coincidem.')
      return
    }
    if (password.length < 6) {
      alert('A senha deve ter no mínimo 6 caracteres.')
      return
    }

    setIsLoading(true)
    try {
      await updatePassword(password)
      setSuccess(true)
      setTimeout(() => {
        router.push('/dashboard')
        router.refresh()
      }, 2000)
    } catch (error: any) {
      alert(error.message || 'Erro ao atualizar senha.')
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-primary p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-bg-secondary via-bg-primary to-bg-primary opacity-50" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-bg-secondary/20 via-transparent to-transparent" />

      <div className="relative w-full max-w-md">
        <div className="rounded-2xl border border-border bg-card/50 p-8 backdrop-blur-xl">
          <div className="mb-8 flex items-center justify-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-bg-secondary to-bg-tertiary border border-border">
              <Play className="h-6 w-6 text-text-primary" fill="currentColor" />
            </div>
            <h1 className="text-2xl font-bold text-text-primary">Zooming</h1>
          </div>

          {success ? (
            <div className="text-center">
              <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
              <h2 className="text-2xl font-bold text-text-primary mb-2">Senha atualizada!</h2>
              <p className="text-sm text-text-tertiary">
                Redirecionando para o dashboard...
              </p>
            </div>
          ) : (
            <>
              <div className="mb-6 text-center">
                <h2 className="text-2xl font-bold text-text-primary">Nova Senha</h2>
                <p className="mt-2 text-sm text-text-tertiary">
                  Digite sua nova senha abaixo
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-text-secondary">
                    Nova Senha
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-text-tertiary" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full rounded-lg border border-border bg-secondary py-3 pl-11 pr-12 text-text-primary placeholder-text-quaternary transition-all focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
                      placeholder="Mínimo 6 caracteres"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-text-secondary">
                    Confirmar Senha
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-text-tertiary" />
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full rounded-lg border border-border bg-secondary py-3 pl-11 pr-12 text-text-primary placeholder-text-quaternary transition-all focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
                      placeholder="Repita a senha"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary transition-colors"
                    >
                      {showConfirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
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
                        Atualizando...
                      </>
                    ) : (
                      <>
                        Atualizar Senha
                        <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                      </>
                    )}
                  </span>
                </button>
              </form>
            </>
          )}

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => router.push('/login')}
              className="text-sm text-text-tertiary transition-colors hover:text-text-primary"
            >
              Voltar para o <span className="font-medium text-text-primary">login</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
