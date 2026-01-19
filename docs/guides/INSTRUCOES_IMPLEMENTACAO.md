# 🚀 INSTRUÇÕES DE IMPLEMENTAÇÃO
## Módulo de Propostas Completo - CRM Zoomer

**Data:** 12 de Janeiro de 2026
**Status:** Pronto para Aplicar

---

## 📋 O QUE FOI CRIADO

Criei **TODOS OS ARQUIVOS** necessários para implementar o módulo de propostas completo:

### ✅ Arquivos Criados

1. **[migrations-propostas-completo.sql](zooming-crm/migrations-propostas-completo.sql)** ⭐
   - Adiciona novos campos nas tabelas
   - Cria triggers SQL automáticos
   - Cria índices de performance
   - Cria view agregada
   - Cria funções helper

2. **[schema.prisma](prisma/schema.prisma)** ✅ ATUALIZADO
   - Adicionados campos: `discountAmount`, `sentAt`, `viewedAt`, `emailNotificationSent`, `allowClientEdits`
   - Adicionado campo `order` em `ProposalOptional`

3. **[proposals-complete.ts](zooming-crm/src/actions/proposals-complete.ts)** ⭐
   - 30+ funções para CRUD completo
   - Gerenciamento de itens, opcionais e vídeos
   - Página pública (busca por token)
   - Duplicação de propostas
   - Reordenação (drag and drop)

---

## 🎯 COMO APLICAR (PASSO A PASSO)

### PASSO 1: Executar Migrations SQL ⚙️

1. Abra o **Supabase Dashboard** (https://app.supabase.com)
2. Selecione seu projeto
3. Vá em **SQL Editor** (no menu lateral)
4. Clique em **New Query**
5. Copie TODO o conteúdo do arquivo [migrations-propostas-completo.sql](zooming-crm/migrations-propostas-completo.sql)
6. Cole no editor SQL
7. Clique em **Run** (ou pressione Ctrl+Enter)
8. Aguarde a execução (deve mostrar ✅ sucesso)

**Resultado esperado:**
```
✅ Migrations de Propostas instaladas com sucesso!
2 novos triggers criados (recalcular total)
1 view agregada (proposals_summary)
6 índices adicionais para performance
1 função helper (get_proposal_with_details)
```

---

### PASSO 2: Atualizar Prisma Client 🔄

O schema Prisma já foi atualizado, agora precisa gerar os tipos TypeScript:

```bash
cd zooming-crm
npx prisma generate
```

**Resultado esperado:**
```
✔ Generated Prisma Client to ./node_modules/@prisma/client
```

---

### PASSO 3: Substituir arquivo proposals.ts 🔧

**Opção A - Substituir completamente (RECOMENDADO):**

```bash
cd zooming-crm/src/actions
mv proposals.ts proposals-old.ts
mv proposals-complete.ts proposals.ts
```

**Opção B - Copiar manualmente:**

1. Abra [proposals-complete.ts](zooming-crm/src/actions/proposals-complete.ts)
2. Copie TODO o conteúdo
3. Cole em [proposals.ts](zooming-crm/src/actions/proposals.ts) (substituindo tudo)

---

### PASSO 4: Testar no Navegador 🧪

1. Inicie o servidor de desenvolvimento:
```bash
cd zooming-crm
npm run dev
```

2. Abra o navegador em: `http://localhost:3000`

3. Faça login no sistema

4. Vá para `/proposals`

5. Crie uma nova proposta e teste as funcionalidades básicas

---

## 📁 PRÓXIMOS ARQUIVOS A CRIAR

Agora que o backend está pronto, vou criar o frontend. São 4 componentes principais:

### Componentes que FALTAM (vou criar agora):

1. **Editor de Propostas**
   - `src/components/proposals/proposal-editor.tsx` ⏳
   - `src/app/(dashboard)/proposals/[id]/edit/page.tsx` ⏳

2. **Página Pública**
   - `src/components/proposals/proposal-public-view.tsx` ⏳
   - `src/app/(public)/p/[token]/page.tsx` ⏳

3. **Modais de Adição**
   - `src/components/proposals/add-item-modal.tsx` ⏳
   - `src/components/proposals/add-optional-modal.tsx` ⏳
   - `src/components/proposals/add-video-modal.tsx` ⏳

---

## ⚠️ IMPORTANTE

### Antes de Continuar, Confirme:

- [ ] Migrations SQL foram executadas no Supabase?
- [ ] `npx prisma generate` foi executado?
- [ ] Arquivo `proposals.ts` foi substituído?
- [ ] Servidor está rodando sem erros?

Se tudo acima estiver ✅, estou pronto para criar os componentes do frontend!

---

## 🐛 TROUBLESHOOTING

### Erro: "Column 'discount_amount' does not exist"
**Solução:** Execute novamente as migrations SQL no Supabase

### Erro: "Type 'sentAt' does not exist on Proposal"
**Solução:** Execute `npx prisma generate` novamente

### Erro: "Cannot find module '@/actions/proposals'"
**Solução:** Verifique se o arquivo foi renomeado corretamente

### Erro: "organization_id not found"
**Solução:** No arquivo `proposals.ts`, procure por `org_demo` e substitua pelo ID real da sua organização (ou implemente autenticação para pegar automaticamente)

---

## 📞 PRONTO PARA CONTINUAR?

Me confirme se:
1. ✅ Migrations SQL foram aplicadas
2. ✅ Prisma foi regenerado
3. ✅ Arquivo proposals.ts foi substituído

Aí eu continuo criando os componentes do frontend! 🚀
