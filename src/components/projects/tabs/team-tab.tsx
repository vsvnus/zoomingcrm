'use client'

import {
  Users,
  Plus,
  Trash2,
  Check,
} from 'lucide-react'
import { type ProjectWithRelations } from '@/types/projects'

export interface TeamTabProps {
  project: ProjectWithRelations
  formatCurrency: (value: number) => string
  onConfirmMember: (memberId: string) => void
  onRemoveMember: (memberId: string) => void
  onAddTeamMember: () => void
}

export function TeamTab({
  project,
  formatCurrency,
  onConfirmMember,
  onRemoveMember,
  onAddTeamMember,
}: TeamTabProps) {
  return (
    <div className="rounded-xl border border-border bg-card backdrop-blur-sm">
      <div className="border-b border-border p-4 md:p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-text-primary">
              Equipe do Projeto
            </h3>
            <p className="mt-1 text-sm text-text-secondary">
              Freelancers e membros alocados neste projeto
            </p>
          </div>
          <button
            onClick={onAddTeamMember}
            className="flex items-center gap-2 rounded-lg bg-text-primary px-3 py-2 md:px-4 text-sm font-medium text-bg-primary transition-all hover:bg-text-secondary"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden md:inline">Adicionar Membro</span>
            <span className="md:hidden">Adicionar</span>
          </button>
        </div>
      </div>

      <div className="p-4 md:p-6">
        {project.project_members && project.project_members.length > 0 ? (
          <div className="space-y-3">
            {project.project_members.map((member) => (
              <div
                key={member.id}
                className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between rounded-lg border border-border bg-card p-3 md:p-4"
              >
                <div className="flex items-center gap-3 md:gap-4">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-secondary text-text-primary">
                    {member.freelancers.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-text-primary">
                      {member.freelancers.name}
                    </p>
                    <p className="text-sm text-text-secondary">{member.role}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 md:gap-4 flex-wrap">
                  {member.agreed_fee && (
                    <p className="text-sm font-medium text-text-primary">
                      {formatCurrency(member.agreed_fee)}
                    </p>
                  )}
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${member.status === 'CONFIRMED'
                      ? 'bg-green-500/10 text-green-400'
                      : member.status === 'INVITED'
                        ? 'bg-yellow-500/10 text-yellow-400'
                        : 'bg-red-500/10 text-red-400'
                      }`}
                  >
                    {member.status === 'CONFIRMED'
                      ? 'Confirmado'
                      : member.status === 'INVITED'
                        ? 'Convidado'
                        : member.status === 'DECLINED'
                          ? 'Recusou'
                          : 'Removido'}
                  </span>

                  {/* Action Buttons */}
                  <div className="flex gap-2 ml-auto md:ml-0">
                    {member.status === 'INVITED' && (
                      <button
                        onClick={() => onConfirmMember(member.id)}
                        className="rounded-lg border border-green-500/20 bg-green-500/10 p-2 text-green-400 transition-all hover:bg-green-500/20"
                        title="Confirmar"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={() => onRemoveMember(member.id)}
                      className="rounded-lg border border-red-500/20 bg-red-500/10 p-2 text-red-400 transition-all hover:bg-red-500/20"
                      title="Remover"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center">
            <Users className="mx-auto mb-4 h-12 w-12 text-text-tertiary" />
            <p className="mb-2 text-lg font-medium text-text-primary">
              Nenhum membro na equipe
            </p>
            <p className="text-sm text-text-secondary">
              Adicione freelancers e membros ao projeto
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
