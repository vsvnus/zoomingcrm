'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Wallet, CheckCircle } from 'lucide-react'
import { createInitialCapitalTransaction, checkHasInitialCapital } from '@/actions/financeiro'
import { useRouter } from 'next/navigation'

interface InitialCapitalDialogProps {
  organizationId: string
  children?: React.ReactNode
}

export function InitialCapitalDialog({ organizationId, children }: InitialCapitalDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [hasCapital, setHasCapital] = useState<boolean | null>(null)
  const [amount, setAmount] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (open) {
      checkHasInitialCapital(organizationId).then(setHasCapital)
    }
  }, [open, organizationId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const valor = parseFloat(amount)
      if (isNaN(valor) || valor < 0) {
        alert('Valor inválido')
        setIsLoading(false)
        return
      }

      const result = await createInitialCapitalTransaction(organizationId, valor)

      if (result.success) {
        setSuccess(true)
        setTimeout(() => {
          setOpen(false)
          setSuccess(false)
          setAmount('')
          router.refresh()
        }, 1500)
      } else {
        alert(result.message)
      }
    } catch (error: any) {
      alert(error.message || 'Erro ao registrar capital inicial')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="secondary">
            <Wallet className="mr-2 h-4 w-4" />
            Capital Inicial
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Capital Inicial
          </DialogTitle>
          <DialogDescription>
            Informe o capital inicial da sua produtora para calcular o saldo corretamente.
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="flex flex-col items-center justify-center py-8">
            <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
            <p className="text-lg font-medium text-green-500">Capital registrado com sucesso!</p>
          </div>
        ) : hasCapital ? (
          <div className="py-6 text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
            <p className="text-muted-foreground">
              O capital inicial ja foi registrado para esta organizacao.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Para alterar, entre em contato com o suporte.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="amount">Valor do Capital Inicial (R$)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="50000.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  autoFocus
                />
                <p className="text-xs text-muted-foreground">
                  Este valor sera usado como ponto de partida para calcular seu saldo atual.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Salvando...' : 'Registrar Capital'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
