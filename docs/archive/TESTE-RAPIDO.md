# 🚀 TESTE RÁPIDO - SPRINTS 0 E 1

**Servidor:** ✅ Rodando em http://localhost:3000
**Tempo estimado:** 5 minutos

---

## ✅ TESTE 1: CADASTRO COM CAPITAL INICIAL (Sprint 0)

### Passos:

1. **Abrir:** http://localhost:3000/login

2. **Clicar em:** "Criar conta" ou toggle para signup

3. **Preencher:**
   ```
   Nome: João Teste
   Celular/WhatsApp: (11) 99999-9999
   Capital Inicial: 50000
   Email: teste_$(date +%s)@zooming.com  (usar timestamp único!)
   Senha: senha123
   ```

4. **TESTAR TOGGLE DE SENHA (Sprint 1):**
   - Clicar no ícone "olhinho" 👁️
   - ✅ Verificar: senha fica visível
   - ✅ Verificar: ícone muda de EyeOff para Eye
   - Clicar novamente
   - ✅ Verificar: senha fica oculta novamente

5. **Criar conta**

### ✅ Resultados Esperados:

- ✅ **NÃO aparece alert "Conta criada"**
- ✅ **Redirect AUTOMÁTICO para /dashboard**
- ✅ **Dashboard mostra saldo: R$ 50.000,00**
- ✅ **Sem erros no console (F12)**

---

## ✅ TESTE 2: ADICIONAR DESPESA FIXA (Sprint 1)

### Passos:

1. **Ir para:** http://localhost:3000/financeiro

2. **Clicar na aba:** "Contas a Pagar"

3. **Clicar no botão:** "Nova Despesa"

4. **No Dialog, preencher:**
   ```
   Tipo de Despesa: 📅 Custo Fixo Mensal
   Categoria: Aluguel Escritório
   Descrição: Aluguel Janeiro 2026
   Valor: 3500
   Vencimento: 31/01/2026 (opcional)
   ```

5. **Clicar:** "Adicionar Despesa"

### ✅ Resultados Esperados:

- ✅ **Despesa aparece na tabela**
- ✅ **Categoria mostra "Aluguel Escritório"**
- ✅ **Origem mostra "Custo Fixo"**
- ✅ **Valor: R$ 3.500,00**
- ✅ **Página atualiza automaticamente (sem F5)**

---

## ✅ TESTE 3: ADICIONAR DESPESA VARIÁVEL (Sprint 1)

### Passos:

1. **Ainda em /financeiro, clicar:** "Nova Despesa" novamente

2. **Preencher:**
   ```
   Tipo de Despesa: 💼 Despesa Variável (Projeto)
   Categoria: Equipe/Talento
   Descrição: Freelancer Maria Silva
   Valor: 1500
   ```

3. **Clicar:** "Adicionar Despesa"

### ✅ Resultados Esperados:

- ✅ **Segunda despesa aparece na tabela**
- ✅ **Categoria mostra "Equipe/Talento"**
- ✅ **Valor: R$ 1.500,00**

---

## ✅ TESTE 4: VERIFICAR SALDO ATUALIZADO (Sprint 0)

### Passos:

1. **Voltar para:** http://localhost:3000/dashboard

2. **Verificar o card "Saldo em Caixa"**

### ✅ Resultado Esperado:

```
Capital Inicial:  R$ 50.000,00
- Despesa 1:      R$  3.500,00
- Despesa 2:      R$  1.500,00
─────────────────────────────────
Saldo Final:      R$ 45.000,00  ✅
```

- ✅ **Card mostra: R$ 45.000,00**
- ✅ **Formatação brasileira (R$ com ponto e vírgula)**

---

## ✅ TESTE 5: VALIDAÇÕES (Sprint 1)

### Teste 5.1: Valor Negativo

1. **Ir em /financeiro → Nova Despesa**
2. **Tentar colocar valor:** -100
3. ✅ **Campo não aceita OU mostra erro**

### Teste 5.2: Campos Obrigatórios

1. **Tentar salvar sem preencher "Categoria"**
2. ✅ **Sistema impede o envio**
3. **Tentar salvar sem "Descrição"**
4. ✅ **Sistema impede o envio**
5. **Tentar salvar sem "Valor"**
6. ✅ **Sistema impede o envio**

---

## ✅ TESTE 6: CATEGORIAS COMPLETAS (Sprint 1)

### Categorias Variáveis (💼 Despesa Variável):
- [ ] Equipe/Talento
- [ ] Aluguel de Equipamento
- [ ] Locação
- [ ] Logística
- [ ] Pós-produção
- [ ] Produção

**Total:** 6 categorias

### Categorias Fixas (📅 Custo Fixo Mensal):
- [ ] Aluguel Escritório
- [ ] Contas (Água, Luz, Internet)
- [ ] Software/Assinaturas
- [ ] Salários
- [ ] Seguros
- [ ] Marketing
- [ ] Manutenção
- [ ] Outros

**Total:** 8 categorias

### Como testar:
1. Abrir dialog "Nova Despesa"
2. Selecionar "Variável" → contar categorias (deve ter 6)
3. Selecionar "Fixo" → contar categorias (deve ter 8)

---

## 🐛 PROBLEMAS COMUNS

### Servidor não carrega:
```bash
# Matar processo na porta 3000
lsof -ti:3000 | xargs kill -9

# Reiniciar servidor
cd /Users/viniciuspimentel/ProjetosDev/CRM\ ZOOMER/zooming-crm
npm run dev
```

### Erro "User already exists":
- Use email único: `teste_$(date +%s)@zooming.com`
- Ou mude o timestamp manualmente: `teste_123456@zooming.com`

### Dialog não abre:
- F12 → Console → Verificar erros
- Verificar se `organizationId` está sendo passado

### Saldo não atualiza:
- Dar F5 na página do dashboard
- Verificar no /financeiro se a despesa foi salva

---

## ✅ CHECKLIST FINAL

Após completar todos os testes:

- [ ] ✅ Cadastro com capital inicial funciona
- [ ] ✅ Toggle de senha funciona
- [ ] ✅ Redirect automático para dashboard
- [ ] ✅ Saldo exibido corretamente (R$ 50.000,00)
- [ ] ✅ Dialog "Nova Despesa" abre
- [ ] ✅ Despesa Fixa salva com sucesso
- [ ] ✅ Despesa Variável salva com sucesso
- [ ] ✅ Saldo atualiza corretamente (R$ 45.000,00)
- [ ] ✅ Validações de campo funcionam
- [ ] ✅ 6 categorias variáveis disponíveis
- [ ] ✅ 8 categorias fixas disponíveis
- [ ] ✅ Nenhum erro no console

---

## 🎉 SUCESSO!

Se todos os testes passaram, os **Sprints 0 e 1 estão 100% funcionais**! 🚀

### Próximos passos:
1. ✅ Validação completa ← VOCÊ ESTÁ AQUI
2. Deploy em staging
3. Monitoramento de produção
4. Planejamento do Sprint 2

---

**Tempo total:** ~5 minutos
**Status:** ✅ Pronto para produção

**Documentação completa:**
- [SPRINT-1-IMPLEMENTATION.md](SPRINT-1-IMPLEMENTATION.md)
- [SPRINT-0-1-VALIDATION-CHECKLIST.md](SPRINT-0-1-VALIDATION-CHECKLIST.md)
