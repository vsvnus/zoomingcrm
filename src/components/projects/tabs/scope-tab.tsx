'use client'

import {
  Calendar,
  FileText,
  Plus,
  Edit,
  Trash2,
  Check,
} from 'lucide-react'
import { type ProjectWithRelations } from '@/types/projects'

export interface ScopeTabProps {
  project: ProjectWithRelations
  formatCurrency: (value: number) => string
  onToggleItem: (itemId: string, status: 'PENDING' | 'DONE') => void
  onDeleteItem: (itemId: string) => void
  onEditItem: (item: any) => void
  onAddItem: () => void
}

export function ScopeTab({
  project,
  formatCurrency,
  onToggleItem,
  onDeleteItem,
  onEditItem,
  onAddItem,
}: ScopeTabProps) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm">
      <div className="border-b border-white/10 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-text-primary">Escopo do Projeto</h3>
            <p className="mt-1 text-sm text-text-secondary">
              Itens e entregáveis importados da proposta
            </p>
          </div>
          <button
            onClick={onAddItem}
            className="flex items-center gap-2 rounded-lg bg-text-primary px-4 py-2 text-sm font-medium text-bg-primary transition-all hover:bg-text-secondary"
          >
            <Plus className="h-4 w-4" />
            Adicionar Item
          </button>
        </div>
      </div>

      <div className="p-6">
        {project.items && project.items.length > 0 ? (
          <div className="space-y-3">
            {project.items.map((item) => (
              <div
                key={item.id}
                className={`flex items-start gap-4 rounded-lg border p-4 transition-all ${item.status === 'DONE'
                  ? 'border-green-500/20 bg-green-500/5'
                  : 'border-border bg-card'
                  }`}
              >
                <button
                  onClick={() =>
                    onToggleItem(
                      item.id,
                      item.status === 'DONE' ? 'PENDING' : 'DONE'
                    )
                  }
                  className={`mt-1 flex h-6 w-6 items-center justify-center rounded-full border transition-all ${item.status === 'DONE'
                    ? 'border-green-500 bg-green-500 text-white'
                    : 'border-text-tertiary bg-transparent text-transparent hover:border-text-primary'
                    }`}
                >
                  <Check className="h-4 w-4" />
                </button>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <p
                      className={`font-medium ${item.status === 'DONE'
                        ? 'text-text-tertiary line-through'
                        : 'text-text-primary'
                        }`}
                    >
                      {item.description}
                    </p>
                    <span className="text-sm font-medium text-text-primary">
                      {formatCurrency(Number(item.total_price))}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center gap-4 text-sm text-text-tertiary">
                    <span>
                      {item.quantity}x {formatCurrency(Number(item.unit_price))}
                    </span>
                    {item.due_date && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(item.due_date).toLocaleDateString('pt-BR')}
                      </span>
                    )}
                  </div>
                </div>

                <div className="ml-4 flex items-start gap-2">
                  <button
                    onClick={() => onEditItem(item)}
                    className="rounded-lg p-2 text-text-tertiary transition-all hover:bg-bg-hover hover:text-text-primary"
                    title="Editar"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onDeleteItem(item.id)}
                    className="rounded-lg p-2 text-text-tertiary transition-all hover:bg-red-500/10 hover:text-red-500"
                    title="Remover"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
            <div className="mt-6 flex justify-end border-t border-border pt-4">
              <div className="text-right">
                <p className="text-sm text-text-secondary">Total do Escopo</p>
                <p className="text-xl font-bold text-text-primary">
                  {formatCurrency(
                    project.items.reduce(
                      (acc, item) => acc + Number(item.total_price),
                      0
                    )
                  )}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-12 text-center">
            <FileText className="mx-auto mb-4 h-12 w-12 text-text-tertiary" />
            <p className="mb-2 text-lg font-medium text-text-primary">
              Nenhum item de escopo
            </p>
            <p className="text-sm text-text-secondary">
              Este projeto não possui itens vinculados da proposta
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
