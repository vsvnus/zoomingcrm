# 🔧 Instalação Manual - SPRINT 0

Como o psql não está instalado localmente, vamos executar a migration via **Supabase Dashboard**.

---

## ✅ Passo 1: Gerar Cliente Prisma (Concluído)

```bash
✅ npx prisma generate
```

**Status**: Cliente Prisma gerado com sucesso!

---

## 📝 Passo 2: Executar Migration SQL via Supabase Dashboard

### ⚠️ IMPORTANTE: Use o arquivo correto!

**Use APENAS o arquivo**: `sprint-0-final.sql` (Versão 1.2 FINAL)

Os outros arquivos (sprint-0-financial-foundation-safe.sql, sprint-0-financial-foundation-fixed.sql) NÃO devem ser usados, pois têm erros corrigidos na versão final.

### Opção A: Via Dashboard (Recomendado)

1. **Acesse o Supabase Dashboard**: https://supabase.com/dashboard

2. **Vá para SQL Editor**:
   - No menu lateral, clique em **"SQL Editor"**
   - Clique em **"New query"**

3. **Copie todo o conteúdo do arquivo**: `sprint-0-final.sql` ⬅️ **USE ESTE ARQUIVO!**

4. **Cole no SQL Editor** e clique em **"Run"** (▶️)

5. **Aguarde a execução** - Deve levar ~5-10 segundos

6. **Verificar sucesso**: No final da execução você verá 4 mensagens:
   ```
   ✅ SPRINT 0 instalado com sucesso!
   ✅ Tabela financial_transactions criada
   ✅ Função calculate_current_balance criada
   ✅ View financial_summary criada
   ```

### Opção B: Via Terminal (se tiver psql instalado)

Se você quiser instalar o psql:

```bash
# macOS
brew install postgresql

# Depois executar
psql "postgresql://postgres.xdpkszwqltvwraanvodh:Zooming2025\!@aws-0-sa-east-1.pooler.supabase.com:5432/postgres" -f sprint-0-financial-foundation.sql
```

---

## 🔍 Passo 3: Verificar Instalação

Execute estas queries no SQL Editor do Supabase para verificar:

### Verificar tabela criada

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_name = 'financial_transactions';
```

**Resultado esperado**: Uma linha com `financial_transactions`

### Verificar ENUMs criados

```sql
SELECT typname
FROM pg_type
WHERE typname IN ('transaction_type', 'transaction_origin', 'transaction_status');
```

**Resultado esperado**: 3 linhas (transaction_type, transaction_origin, transaction_status)

### Verificar função criada

```sql
SELECT proname
FROM pg_proc
WHERE proname = 'calculate_current_balance';
```

**Resultado esperado**: Uma linha com `calculate_current_balance`

### Verificar view criada

```sql
SELECT table_name
FROM information_schema.views
WHERE table_name = 'financial_summary';
```

**Resultado esperado**: Uma linha com `financial_summary`

---

## 🧪 Passo 4: Criar Dados de Teste (Opcional)

Execute no SQL Editor do Supabase:

```sql
-- 1. Criar capital inicial
SELECT * FROM create_initial_capital_transaction('org_demo', 100000.00, NULL);

-- 2. Criar algumas transações de teste
INSERT INTO financial_transactions (
  organization_id, type, origin, status, valor, description
) VALUES
  ('org_demo', 'RECEITA', 'MANUAL', 'CONFIRMADO', 15000, 'Projeto Teste ABC'),
  ('org_demo', 'DESPESA', 'MANUAL', 'CONFIRMADO', 4500, 'Freelancer Editor'),
  ('org_demo', 'RECEITA', 'MANUAL', 'AGENDADO', 8000, 'Projeto XYZ - Parcela 1'),
  ('org_demo', 'DESPESA', 'MANUAL', 'PENDENTE', 2000, 'Aluguel Estúdio');

-- 3. Ver resumo financeiro
SELECT * FROM financial_summary WHERE organization_id = 'org_demo';

-- 4. Calcular saldo
SELECT calculate_current_balance('org_demo');
```

**Resultado esperado do saldo**: 110500.00
```
100000 (capital) + 15000 (receita) - 4500 (despesa) = 110500
```

---

## 🚀 Passo 5: Iniciar Servidor

```bash
cd /Users/viniciuspimentel/ProjetosDev/CRM\ ZOOMER/zooming-crm
npm run dev
```

Acesse: http://localhost:3000/login

---

## ✅ Passo 6: Testar Fluxo Completo

1. **Criar nova conta**:
   - Nome: Seu Nome
   - Celular: (11) 99999-9999
   - **Capital Inicial: 50000** ⬅️ IMPORTANTE
   - Email: teste@exemplo.com
   - Senha: senha123

2. **Criar conta** - Deve aparecer: "Conta criada! Faça login para continuar."

3. **Fazer login** com as credenciais criadas

4. **Ver dashboard** - Deve exibir: **"Saldo em Caixa: R$ 50.000,00"** ✅

---

## 🔍 Debug: Verificar se Transação Foi Criada

Execute no SQL Editor do Supabase:

```sql
SELECT
  id,
  type,
  origin,
  status,
  valor,
  description,
  transaction_date,
  created_at
FROM financial_transactions
WHERE type = 'CAPITAL_INICIAL'
ORDER BY created_at DESC
LIMIT 5;
```

**Deve aparecer**: A transação de capital inicial que você criou no cadastro

---

## ⚠️ Problemas Comuns

### Problema 1: "Erro ao criar transação"

**Causa**: Migration SQL não foi executada

**Solução**:
1. Vá para SQL Editor no Supabase
2. Execute o arquivo `sprint-0-financial-foundation.sql`

### Problema 2: "Capital inicial já foi registrado"

**Causa**: Organização `org_demo` já tem capital inicial

**Solução**: Use outra organização ou delete a transação existente:
```sql
DELETE FROM financial_transactions
WHERE organization_id = 'org_demo'
AND type = 'CAPITAL_INICIAL';
```

### Problema 3: Dashboard não exibe saldo

**Causa**: Função `getCurrentBalance` não está retornando valor

**Solução**:
1. Verificar se migration foi executada
2. Verificar logs do servidor: `npm run dev`
3. Testar query manualmente:
```sql
SELECT calculate_current_balance('org_demo');
```

### Problema 4: "Type 'TransactionType' does not exist"

**Causa**: Prisma não sincronizou os ENUMs

**Solução**:
```bash
npx prisma generate
npm run dev
```

---

## 📊 Status da Instalação

### ✅ Concluído Automaticamente

- ✅ Cliente Prisma gerado
- ✅ Código TypeScript atualizado
- ✅ Componentes React modificados

### ⏳ Pendente (Você precisa fazer)

- ⏳ Executar migration SQL via Supabase Dashboard
- ⏳ Verificar tabelas/funções criadas
- ⏳ Testar fluxo de cadastro
- ⏳ Validar saldo no dashboard

---

## 📚 Links Úteis

- **Supabase Dashboard**: https://supabase.com/dashboard
- **SQL Editor**: https://supabase.com/dashboard/project/_/sql
- **Arquivo de Migration**: `sprint-0-financial-foundation.sql`
- **Documentação Completa**: `SPRINT-0-FINANCIAL-IMPLEMENTATION.md`
- **Guia Rápido**: `QUICK-START-GUIDE.md`

---

## 🎯 Checklist Final

Marque conforme concluir:

- [ ] Migration SQL executada no Supabase Dashboard
- [ ] Tabela `financial_transactions` existe
- [ ] ENUMs criados (transaction_type, transaction_origin, transaction_status)
- [ ] Função `calculate_current_balance` criada
- [ ] View `financial_summary` criada
- [ ] Servidor iniciado (`npm run dev`)
- [ ] Testado cadastro com capital inicial
- [ ] Dashboard exibe saldo correto
- [ ] Transação aparece no banco

---

## 🎉 Próximo Passo

Assim que executar a migration SQL no Supabase Dashboard, **tudo estará funcionando**!

Execute o passo 2 acima e depois teste o fluxo completo. 🚀

---

**Qualquer dúvida, consulte**: `QUICK-START-GUIDE.md`
