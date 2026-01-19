# ✅ CHECKLIST DE VALIDAÇÃO - SPRINTS 0 E 1

**Data:** 2026-01-13
**Projeto:** CRM Zoomer
**Sprints:** 0 (Sistema Financeiro Base) + 1 (Core Financeiro e Onboarding)

---

## 🎯 RESUMO EXECUTIVO

Este documento contém o checklist de validação manual das funcionalidades implementadas nos Sprints 0 e 1. Use este guia para testar o sistema antes do deploy.

---

## 📋 SPRINT 0 - SISTEMA FINANCEIRO BASE

### 1. Capital Inicial no Cadastro

**Funcionalidade:** Campo opcional para informar capital inicial durante o signup.

#### ✅ Testes Manuais:

- [ ] **TC-S0-01:** Cadastro SEM capital inicial
  - Criar conta sem preencher campo "Capital Inicial"
  - Verificar que usuário é criado com sucesso
  - Confirmar que saldo no dashboard = R$ 0,00

- [ ] **TC-S0-02:** Cadastro COM capital inicial válido
  - Criar conta com capital inicial = R$ 50.000,00
  - Verificar redirect automático para dashboard
  - Confirmar que saldo no dashboard = R$ 50.000,00
  - Verificar transação criada no financeiro

- [ ] **TC-S0-03:** Validação de valor negativo
  - Tentar cadastrar com capital inicial = -1000
  - Verificar que sistema rejeita (alert ou validação)

- [ ] **TC-S0-04:** Capital inicial é único por organização
  - Após criar conta com capital
  - Tentar adicionar capital inicial novamente (via API/DB)
  - Verificar que sistema rejeita com mensagem apropriada

**Arquivos Relacionados:**
- `src/app/login/page.tsx` (linhas 131-152)
- `src/actions/auth.ts` (linhas 68-87)
- `src/actions/financeiro.ts` (createInitialCapitalTransaction)

---

### 2. Cálculo de Saldo Atual

**Funcionalidade:** Fórmula `Saldo = Capital Inicial + Receitas - Despesas`

#### ✅ Testes Manuais:

- [ ] **TC-S0-05:** Saldo apenas com capital inicial
  - Cadastrar com R$ 50.000
  - Verificar dashboard mostra R$ 50.000,00

- [ ] **TC-S0-06:** Saldo com receita adicionada
  - Partindo de saldo R$ 50.000
  - Adicionar receita manual de R$ 10.000 (se disponível)
  - Verificar saldo = R$ 60.000,00

- [ ] **TC-S0-07:** Saldo com despesa adicionada
  - Partindo de saldo R$ 50.000
  - Adicionar despesa de R$ 5.000
  - Verificar saldo = R$ 45.000,00

- [ ] **TC-S0-08:** Saldo com múltiplas transações
  - Capital: R$ 50.000
  - Receita: +R$ 10.000
  - Despesa: -R$ 3.000
  - Despesa: -R$ 2.000
  - Saldo esperado: R$ 55.000,00

**Arquivos Relacionados:**
- `src/actions/financeiro.ts` (getCurrentBalance, linhas 392-435)
- `src/lib/financial.ts` (calculateCurrentBalance)
- `migrations/01-sprint-0-financial-foundation.sql` (função SQL)

---

### 3. Dashboard com Saldo Real

**Funcionalidade:** Dashboard exibe saldo calculado em tempo real

#### ✅ Testes Manuais:

- [ ] **TC-S0-09:** Card "Saldo em Caixa" visível
  - Fazer login e acessar dashboard
  - Verificar card verde "Saldo em Caixa" está presente
  - Confirmar ícone DollarSign está exibido

- [ ] **TC-S0-10:** Formatação em Real (R$)
  - Verificar valor exibido usa formato brasileiro
  - Exemplo: R$ 50.000,00 (não $50,000.00)

- [ ] **TC-S0-11:** Atualização dinâmica
  - Adicionar despesa no financeiro
  - Voltar ao dashboard (refresh ou navegação)
  - Verificar saldo atualizado

**Arquivos Relacionados:**
- `src/components/dashboard/dashboard-content.tsx` (linhas 61-66)
- `src/actions/dashboard.ts` (getDashboardStats, linhas 26-27)

---

## 📋 SPRINT 1 - CORE FINANCEIRO E ONBOARDING

### 4. Toggle de Visibilidade de Senha

**Funcionalidade:** Botão "olhinho" para mostrar/ocultar senha

#### ✅ Testes Manuais:

- [ ] **TC-S1-01:** Estado inicial (senha oculta)
  - Ir para /login
  - Verificar campo senha com type="password"
  - Verificar ícone "EyeOff" está visível

- [ ] **TC-S1-02:** Toggle para mostrar senha
  - Clicar no ícone "olhinho"
  - Verificar campo muda para type="text"
  - Verificar ícone muda para "Eye"
  - Confirmar senha fica visível

- [ ] **TC-S1-03:** Toggle para ocultar novamente
  - Clicar no ícone novamente
  - Verificar campo volta para type="password"
  - Verificar ícone volta para "EyeOff"

- [ ] **TC-S1-04:** Toggle funciona no signup também
  - Ir para modo "Criar conta"
  - Repetir testes TC-S1-02 e TC-S1-03

**Arquivos Relacionados:**
- `src/app/login/page.tsx` (linhas 176-204)

---

### 5. Fluxo Automático: Cadastro → Dashboard

**Funcionalidade:** Após signup, usuário vai direto para dashboard sem login manual

#### ✅ Testes Manuais:

- [ ] **TC-S1-05:** Signup redireciona automaticamente
  - Criar nova conta (usar email único)
  - Preencher todos os campos obrigatórios
  - Clicar "Criar Conta"
  - **IMPORTANTE:** Verificar que NÃO aparece alert "Conta criada!"
  - Verificar que usuário é redirecionado para /dashboard
  - Confirmar que está logado (vê dados do dashboard)

- [ ] **TC-S1-06:** Sem necessidade de login manual
  - Após criar conta
  - Verificar que não precisa fazer login novamente
  - Sessão deve estar ativa automaticamente

**Arquivos Relacionados:**
- `src/actions/auth.ts` (linha 92: redirect('/dashboard'))
- `src/app/login/page.tsx` (linhas 37-49)

---

### 6. Sistema de Despesas com Categorias

**Funcionalidade:** Dialog "Nova Despesa" com categorias Fixas e Variáveis

#### ✅ Testes Manuais:

**Estrutura do Dialog:**

- [ ] **TC-S1-07:** Botão "Nova Despesa" funcional
  - Ir para /financeiro → aba "Contas a Pagar"
  - Clicar botão "Nova Despesa"
  - Verificar que dialog abre

**Categorias Variáveis (Projetos):**

- [ ] **TC-S1-08:** Selecionar tipo "Variável"
  - No dialog, selecionar "💼 Despesa Variável (Projeto)"
  - Verificar que dropdown mostra 6 categorias:
    - Equipe/Talento
    - Aluguel de Equipamento
    - Locação
    - Logística
    - Pós-produção
    - Produção

- [ ] **TC-S1-09:** Adicionar despesa variável
  - Tipo: Variável
  - Categoria: Equipe/Talento
  - Descrição: "Pagamento freelancer João"
  - Valor: 1500.00
  - Vencimento: (data futura)
  - Clicar "Adicionar Despesa"
  - Verificar despesa aparece na tabela
  - Verificar saldo no dashboard diminuiu R$ 1.500

**Categorias Fixas (Mensais):**

- [ ] **TC-S1-10:** Selecionar tipo "Fixo"
  - No dialog, selecionar "📅 Custo Fixo Mensal"
  - Verificar que dropdown mostra 8 categorias:
    - Aluguel Escritório
    - Contas (Água, Luz, Internet)
    - Software/Assinaturas
    - Salários
    - Seguros
    - Marketing
    - Manutenção
    - Outros

- [ ] **TC-S1-11:** Adicionar despesa fixa
  - Tipo: Fixo
  - Categoria: Aluguel Escritório
  - Descrição: "Aluguel Janeiro 2026"
  - Valor: 3500.00
  - Vencimento: 31/01/2026
  - Clicar "Adicionar Despesa"
  - Verificar despesa aparece na tabela com badge "Aluguel Escritório"
  - Verificar coluna "Origem" mostra "Custo Fixo"

**Validações:**

- [ ] **TC-S1-12:** Campos obrigatórios
  - Tentar salvar sem preencher categoria
  - Verificar que sistema não permite
  - Tentar salvar sem descrição
  - Verificar que sistema não permite
  - Tentar salvar sem valor
  - Verificar que sistema não permite

- [ ] **TC-S1-13:** Valor negativo rejeitado
  - Tentar adicionar despesa com valor = -100
  - Verificar que campo não aceita ou mostra erro

- [ ] **TC-S1-14:** Campos opcionais funcionam
  - Adicionar despesa SEM vencimento
  - Adicionar despesa SEM observações
  - Verificar que salva normalmente

**Auto-refresh:**

- [ ] **TC-S1-15:** Página atualiza automaticamente
  - Adicionar despesa
  - Verificar que tabela atualiza sem precisar dar F5
  - Ir para dashboard
  - Verificar saldo já está atualizado

**Arquivos Relacionados:**
- `src/components/financeiro/add-expense-dialog.tsx` (todo o arquivo)
- `src/components/financeiro/payables-tab.tsx` (linhas 88, 102-104)
- `src/app/(dashboard)/financeiro/page.tsx`

---

## 🔐 AUTENTICAÇÃO E SEGURANÇA

### 7. Fluxos de Autenticação

#### ✅ Testes Manuais:

- [ ] **TC-AUTH-01:** Login com credenciais corretas
  - Email: demo@zooming.com
  - Senha: demo123456
  - Verificar redirect para /dashboard

- [ ] **TC-AUTH-02:** Login com credenciais incorretas
  - Email válido + senha errada
  - Verificar mensagem de erro
  - Não redireciona

- [ ] **TC-AUTH-03:** Validação de email inválido
  - Tentar cadastrar com "emailinvalido"
  - Verificar validação HTML5 ou mensagem de erro

- [ ] **TC-AUTH-04:** Logout funcional
  - Fazer login
  - Clicar em logout (se disponível na UI)
  - Verificar que volta para página inicial ou login

---

## 📊 TESTES DE INTEGRAÇÃO

### 8. Fluxo Completo End-to-End

#### ✅ Cenário: Novo Usuário Completo

- [ ] **TC-E2E-01:** Fluxo de novo usuário
  1. Ir para /login
  2. Clicar "Criar conta"
  3. Preencher:
     - Nome: "João Silva"
     - Celular: "(11) 99999-9999"
     - Capital Inicial: 50000
     - Email: test_TIMESTAMP@zooming.com
     - Senha: senha123
  4. Ver senha com toggle
  5. Criar conta
  6. **ESPERAR:** Redirect automático para /dashboard
  7. Verificar saldo = R$ 50.000,00
  8. Ir para /financeiro
  9. Adicionar despesa fixa:
     - Tipo: Fixo
     - Categoria: Aluguel Escritório
     - Descrição: "Aluguel Janeiro"
     - Valor: 3500
  10. Voltar ao dashboard
  11. Verificar saldo = R$ 46.500,00
  12. Adicionar despesa variável:
      - Tipo: Variável
      - Categoria: Equipe/Talento
      - Descrição: "Freelancer Maria"
      - Valor: 1500
  13. Verificar saldo = R$ 45.000,00

**Tempo estimado:** 3-5 minutos

---

## 🐛 BUGS CONHECIDOS / LIMITAÇÕES

### Itens a Verificar:

- [ ] Organização está hardcoded como "org_demo" (não multi-tenant ainda)
- [ ] Capital inicial só pode ser definido no cadastro (não tem UI para editar depois)
- [ ] Não há funcionalidade de editar/excluir transações ainda
- [ ] Receitas ainda não têm UI própria (apenas despesas)
- [ ] Dashboard não tem gráficos (apenas cards com números)

---

## 📈 MÉTRICAS DE SUCESSO

### Critérios de Aceitação:

- ✅ **100% dos testes de Sprint 0 passam**
- ✅ **100% dos testes de Sprint 1 passam**
- ✅ **Fluxo E2E completo funciona sem erros**
- ✅ **Saldo calculado está correto**
- ✅ **Nenhum erro no console do navegador**
- ✅ **Nenhum erro 500 no servidor**

### Performance:

- [ ] Dashboard carrega em < 2 segundos
- [ ] Dialog de despesa abre instantaneamente
- [ ] Salvar despesa leva < 1 segundo
- [ ] Sem travamentos ou lentidão

---

## 🚀 PRÓXIMOS PASSOS

Após validação completa dos Sprints 0 e 1:

1. **Deploy em staging/produção**
2. **Monitorar erros via Sentry/similar**
3. **Coletar feedback de usuários reais**
4. **Planejar Sprint 2:**
   - Receitas (dialog similar ao de despesas)
   - Editar/excluir transações
   - Gráficos de fluxo de caixa
   - Multi-organização (remover hardcode)

---

## ✅ ASSINATURAS

**Desenvolvedor:**
Nome: _____________
Data: __/__/____

**QA/Tester:**
Nome: _____________
Data: __/__/____

**Product Owner:**
Nome: _____________
Data: __/__/____

---

**Versão:** 1.0
**Última atualização:** 2026-01-13
**Status:** ✅ Pronto para validação

---

## 📝 NOTAS ADICIONAIS

Use este espaço para anotar bugs encontrados, melhorias sugeridas ou observações durante os testes:

```
_____________________________________________________________

_____________________________________________________________

_____________________________________________________________

_____________________________________________________________
```
