# 🚀 Guia Rápido - SPRINT 0 Financeiro

## ✅ O que foi implementado?

1. **Backend completo** do sistema financeiro base
2. **Campo de Capital Inicial** no formulário de cadastro
3. **Integração automática** - ao criar conta, o capital inicial vira transação financeira
4. **Exibição do saldo** no dashboard principal

---

## 📋 Checklist de Instalação

### 1. Executar Migration SQL

```bash
# Conectar ao banco Supabase
psql "sua-connection-string-aqui"

# Executar migration
\i sprint-0-financial-foundation.sql

# Verificar se foi criado
\dt financial_transactions
\dv financial_summary
```

### 2. Atualizar Schema Prisma

```bash
cd zooming-crm

# Gerar cliente Prisma
npx prisma generate

# Sincronizar com banco
npx prisma db push
```

### 3. Testar o Fluxo Completo

1. **Acessar página de cadastro**: `http://localhost:3000/login`
2. Clicar em "Criar conta"
3. Preencher:
   - Nome: "Teste"
   - Celular: "(11) 99999-9999"
   - Capital Inicial: "50000" (R$ 50.000,00)
   - Email: "teste@exemplo.com"
   - Senha: "senha123"
4. Criar conta
5. Fazer login
6. Ver no dashboard: **Saldo em Caixa: R$ 50.000,00** ✅

---

## 🧪 Como Testar Manualmente

### Teste 1: Verificar transação criada

```sql
-- Ver transação de capital inicial
SELECT
  id,
  type,
  origin,
  status,
  valor,
  description,
  transaction_date
FROM financial_transactions
WHERE type = 'CAPITAL_INICIAL';

-- Resultado esperado:
-- type: CAPITAL_INICIAL
-- origin: CADASTRO
-- status: CONFIRMADO
-- valor: 50000.00
```

### Teste 2: Calcular saldo

```sql
-- Calcular saldo atual
SELECT calculate_current_balance('org_demo');

-- Resultado esperado: 50000.00
```

### Teste 3: Ver resumo financeiro

```sql
-- Ver resumo completo
SELECT * FROM financial_summary WHERE organization_id = 'org_demo';

-- Campos importantes:
-- - capital_inicial_transaction: 50000
-- - total_receitas: 0
-- - total_despesas: 0
-- - saldo_atual: 50000
```

### Teste 4: Adicionar receita e despesa

```sql
-- Criar receita de teste
INSERT INTO financial_transactions (
  organization_id, type, origin, status, valor, description
) VALUES (
  'org_demo', 'RECEITA', 'MANUAL', 'CONFIRMADO', 15000, 'Projeto Teste XYZ'
);

-- Criar despesa de teste
INSERT INTO financial_transactions (
  organization_id, type, origin, status, valor, description
) VALUES (
  'org_demo', 'DESPESA', 'MANUAL', 'CONFIRMADO', 4500, 'Freelancer Editor'
);

-- Recalcular saldo
SELECT calculate_current_balance('org_demo');

-- Resultado esperado: 60500.00
-- (50000 + 15000 - 4500 = 60500)
```

---

## 🎯 Fluxo Completo do Sistema

```
┌─────────────────────────────────────────────────────────────┐
│ 1. CADASTRO                                                  │
│    • Usuário preenche formulário                            │
│    • Informa capital inicial: R$ 50.000,00                  │
│    • Clica em "Criar Conta"                                 │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. BACKEND - signUp()                                        │
│    • Cria autenticação Supabase                             │
│    • Cria registro em users                                 │
│    • Chama createInitialCapitalTransaction()                │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. TRANSAÇÃO FINANCEIRA                                      │
│    • Valida se já existe capital inicial                    │
│    • Cria registro em financial_transactions:               │
│      - type: CAPITAL_INICIAL                                │
│      - origin: CADASTRO                                     │
│      - status: CONFIRMADO                                   │
│      - valor: 50000.00                                      │
│    • Atualiza organizations.initial_capital                 │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. LOGIN E DASHBOARD                                         │
│    • Usuário faz login                                      │
│    • getDashboardStats() chama getCurrentBalance()          │
│    • Função calcula:                                        │
│      Saldo = 50000 + 0 (receitas) - 0 (despesas)           │
│    • Dashboard exibe: "Saldo em Caixa: R$ 50.000,00"       │
└─────────────────────────────────────────────────────────────┘
```

---

## 📂 Arquivos Modificados/Criados

### ✅ Criados

1. `sprint-0-financial-foundation.sql` - Migration SQL completa
2. `src/lib/financial.ts` - Helper functions
3. `SPRINT-0-FINANCIAL-IMPLEMENTATION.md` - Documentação detalhada
4. `QUICK-START-GUIDE.md` - Este arquivo

### ✅ Modificados

1. `prisma/schema.prisma` - Adicionado:
   - Model `FinancialTransaction`
   - ENUMs: `TransactionType`, `TransactionOrigin`, `TransactionStatus`
   - Campos em `Organization`: `initialCapital`, `initialCapitalSetAt`

2. `src/actions/auth.ts` - Modificado:
   - Função `signUp()` recebe parâmetro `capitalInicial`
   - Chama `createInitialCapitalTransaction()` após criar usuário

3. `src/actions/financeiro.ts` - Adicionado:
   - `createInitialCapitalTransaction()` - Criar transação de capital
   - `getCurrentBalance()` - Calcular saldo atual
   - `checkHasInitialCapital()` - Verificar se já existe
   - `getFinancialSummaryV2()` - Buscar resumo completo

4. `src/actions/dashboard.ts` - Modificado:
   - Adiciona `currentBalance` ao retorno
   - Chama `getCurrentBalance()` ao buscar stats

5. `src/app/login/page.tsx` - Modificado:
   - Adiciona campo "Capital Inicial (R$)"
   - Validação de valor positivo
   - Passa valor para função `signUp()`

6. `src/components/dashboard/dashboard-content.tsx` - Modificado:
   - Adiciona `currentBalance` ao tipo `DashboardStats`
   - Exibe "Saldo em Caixa" no primeiro card
   - Formata valor com `formatCurrency()`

---

## 🔍 Como Debugar

### Ver logs no terminal

```bash
# Iniciar servidor em modo dev
npm run dev

# Ver logs quando usuário criar conta
# Deve aparecer:
# "Capital inicial registrado: <transaction_id>"
```

### Ver erros comuns

**Erro 1: "Capital inicial já foi registrado"**
```
Causa: Organização já possui transação de capital inicial
Solução: Usar outra organização ou deletar a transação existente
```

**Erro 2: "Erro ao criar transação: column 'organization_id' does not exist"**
```
Causa: Migration SQL não foi executada
Solução: Executar sprint-0-financial-foundation.sql
```

**Erro 3: "Type 'TransactionType' does not exist"**
```
Causa: Schema Prisma não foi sincronizado
Solução: npx prisma generate && npx prisma db push
```

---

## 📊 Visualizar Dados no Prisma Studio

```bash
npx prisma studio

# Abrir no navegador: http://localhost:5555
# Navegar para: financial_transactions
# Ver registros criados
```

---

## 🎨 Personalizar Capital Inicial

### Tornar obrigatório

```tsx
// src/app/login/page.tsx
<input
  type="number"
  required={isSignUp} // ✅ Adicionar required
  value={formData.capitalInicial}
  // ...
/>
```

### Definir valor mínimo

```tsx
// src/app/login/page.tsx
if (capitalValue !== undefined && capitalValue < 1000) {
  alert('Capital inicial mínimo: R$ 1.000,00')
  return
}
```

### Exibir modal de boas-vindas após cadastro

```tsx
// Após criar conta com sucesso
if (result.success) {
  showWelcomeModal({
    title: 'Conta criada com sucesso!',
    message: `Seu saldo inicial de ${formatCurrency(capitalValue)} foi registrado.`,
  })
}
```

---

## 🚀 Próximos Passos Recomendados

### Curto Prazo (esta semana)

1. **Testar em produção**
   - Executar migration no Supabase production
   - Testar cadastro real
   - Validar cálculo de saldo

2. **Adicionar validações extras**
   - Limite máximo de capital (ex: R$ 10 milhões)
   - Confirmação visual após cadastro
   - Tooltip explicativo no campo

3. **Melhorar UX**
   - Máscara de moeda no input (R$ 50.000,00)
   - Sugestões de valores (R$ 10k, R$ 50k, R$ 100k)
   - Preview do saldo antes de criar conta

### Médio Prazo (próximas 2 semanas)

4. **SPRINT 1: Contas a Pagar/Receber**
   - Adicionar despesas manualmente
   - Adicionar receitas manualmente
   - Sistema de parcelas

5. **SPRINT 2: Integração com Propostas**
   - Proposta aceita → gera receitas automaticamente
   - Vincular transações a projetos

### Longo Prazo (próximo mês)

6. **SPRINT 3: Fluxo de Caixa**
   - Dashboard financeiro completo
   - Gráficos de entrada/saída
   - Projeções futuras

7. **SPRINT 4: Relatórios**
   - DRE (Demonstração de Resultados)
   - Margem por projeto
   - Exportação CSV/PDF

---

## 💡 Dicas Importantes

### 1. Backup antes de executar migration

```bash
# Backup do banco antes da migration
pg_dump "sua-connection-string" > backup_antes_sprint0.sql
```

### 2. Testar em ambiente de desenvolvimento primeiro

```bash
# Não executar direto em produção!
# Testar localmente ou em banco de staging
```

### 3. Monitorar performance

```sql
-- Ver queries lentas
SELECT * FROM pg_stat_statements
WHERE query LIKE '%financial_transactions%'
ORDER BY total_time DESC
LIMIT 10;
```

### 4. Validar RLS está funcionando

```sql
-- Conectar como usuário específico
SET SESSION AUTHORIZATION 'user_id_aqui';

-- Deve retornar apenas transações da organização dele
SELECT * FROM financial_transactions;
```

---

## 📞 Suporte

### Problemas com Migration?

1. Verificar conexão com banco: `psql "connection-string"`
2. Ver erros detalhados: `\i sprint-0-financial-foundation.sql`
3. Verificar tabelas criadas: `\dt`
4. Ver enums: `\dT`
5. Ver views: `\dv`

### Problemas com Prisma?

1. Limpar cache: `rm -rf node_modules/.prisma`
2. Gerar novamente: `npx prisma generate`
3. Push forçado: `npx prisma db push --force-reset` (CUIDADO!)

### Problemas com TypeScript?

1. Reiniciar TS server: `Cmd+Shift+P` → "TypeScript: Restart TS Server"
2. Verificar imports: Todos os arquivos importam tipos corretos?
3. Rebuild: `npm run build`

---

## 🎉 Parabéns!

Se você chegou até aqui e tudo está funcionando, o **SPRINT 0** foi concluído com sucesso! 🎊

Seu sistema agora tem:
- ✅ Transações financeiras rastreáveis
- ✅ Capital inicial registrado corretamente
- ✅ Saldo calculado dinamicamente
- ✅ Dashboard exibindo valores reais
- ✅ Base sólida para próximos sprints

**Próximo passo**: Implementar contas a pagar/receber (SPRINT 1)

---

**Última atualização**: 2026-01-12
**Versão**: 1.0
**Status**: ✅ Pronto para uso
