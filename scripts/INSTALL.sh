#!/bin/bash

# ============================================
# SPRINT 0 - INSTALAÇÃO AUTOMATIZADA
# Sistema Financeiro Base - CRM Zoomer
# ============================================

set -e  # Parar se houver erro

echo "🚀 Iniciando instalação do SPRINT 0 - Sistema Financeiro Base"
echo ""

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# ============================================
# 1. VERIFICAR DEPENDÊNCIAS
# ============================================

echo "📋 Verificando dependências..."

# Verificar se está no diretório correto
if [ ! -f "package.json" ]; then
  echo -e "${RED}❌ Erro: Execute este script do diretório raiz do projeto (clapper)${NC}"
  exit 1
fi

# Verificar se .env existe
if [ ! -f ".env" ] && [ ! -f ".env.local" ]; then
  echo -e "${RED}❌ Erro: Arquivo .env não encontrado${NC}"
  echo "Crie um arquivo .env com DATABASE_URL e DIRECT_URL"
  exit 1
fi

echo -e "${GREEN}✅ Dependências verificadas${NC}"
echo ""

# ============================================
# 2. PRISMA GENERATE
# ============================================

echo "🔧 Gerando cliente Prisma..."

npx prisma generate

echo -e "${GREEN}✅ Cliente Prisma gerado${NC}"
echo ""

# ============================================
# 3. PERGUNTAR SOBRE MIGRATION SQL
# ============================================

echo "⚠️  ATENÇÃO: A próxima etapa executará a migration SQL no banco de dados."
echo ""
echo "A migration irá:"
echo "  • Criar tabela financial_transactions"
echo "  • Criar 3 ENUMs (TransactionType, TransactionOrigin, TransactionStatus)"
echo "  • Criar função calculate_current_balance()"
echo "  • Criar view financial_summary"
echo "  • Adicionar campos em organizations"
echo ""

read -p "Deseja executar a migration SQL agora? (s/N): " execute_migration

if [[ $execute_migration =~ ^[Ss]$ ]]; then
  echo ""
  echo "🗄️  Executando migration SQL..."

  # Verificar se o arquivo existe
  if [ ! -f "sprint-0-financial-foundation.sql" ]; then
    echo -e "${RED}❌ Erro: Arquivo sprint-0-financial-foundation.sql não encontrado${NC}"
    exit 1
  fi

  # Extrair DATABASE_URL do .env
  if [ -f ".env.local" ]; then
    DATABASE_URL=$(grep DIRECT_URL .env.local | cut -d '=' -f2- | tr -d '"' | tr -d "'")
  else
    DATABASE_URL=$(grep DIRECT_URL .env | cut -d '=' -f2- | tr -d '"' | tr -d "'")
  fi

  if [ -z "$DATABASE_URL" ]; then
    echo -e "${RED}❌ Erro: DIRECT_URL não encontrado no .env${NC}"
    exit 1
  fi

  # Executar migration
  psql "$DATABASE_URL" -f sprint-0-financial-foundation.sql

  if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Migration SQL executada com sucesso${NC}"
  else
    echo -e "${RED}❌ Erro ao executar migration SQL${NC}"
    echo "Execute manualmente: psql \"DIRECT_URL\" -f sprint-0-financial-foundation.sql"
    exit 1
  fi
else
  echo -e "${YELLOW}⚠️  Migration SQL não executada${NC}"
  echo "Execute manualmente quando estiver pronto:"
  echo "  psql \"DIRECT_URL\" -f sprint-0-financial-foundation.sql"
fi

echo ""

# ============================================
# 4. PRISMA DB PUSH
# ============================================

echo "🔄 Sincronizando schema Prisma com banco..."

npx prisma db push --accept-data-loss

echo -e "${GREEN}✅ Schema sincronizado${NC}"
echo ""

# ============================================
# 5. VERIFICAR INSTALAÇÃO
# ============================================

echo "🔍 Verificando instalação..."

# Verificar se tabela foi criada
VERIFICATION=$(psql "$DATABASE_URL" -tAc "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'financial_transactions');")

if [ "$VERIFICATION" = "t" ]; then
  echo -e "${GREEN}✅ Tabela financial_transactions criada${NC}"
else
  echo -e "${RED}❌ Tabela financial_transactions não encontrada${NC}"
  echo "Execute a migration SQL manualmente"
fi

echo ""

# ============================================
# 6. CRIAR DADOS DE TESTE (OPCIONAL)
# ============================================

read -p "Deseja criar dados de teste? (s/N): " create_test_data

if [[ $create_test_data =~ ^[Ss]$ ]]; then
  echo ""
  echo "📝 Criando dados de teste..."

  # SQL para criar dados de teste
  TEST_SQL="
-- Criar capital inicial de teste
SELECT * FROM create_initial_capital_transaction('org_demo', 100000.00, NULL);

-- Criar algumas transações de teste
INSERT INTO financial_transactions (
  organization_id, type, origin, status, valor, description
) VALUES
  ('org_demo', 'receita', 'manual', 'confirmado', 15000, 'Projeto Teste ABC'),
  ('org_demo', 'despesa', 'manual', 'confirmado', 4500, 'Freelancer Editor'),
  ('org_demo', 'receita', 'manual', 'agendado', 8000, 'Projeto XYZ - Parcela 1'),
  ('org_demo', 'despesa', 'manual', 'pendente', 2000, 'Aluguel Estúdio');

-- Ver resumo
SELECT * FROM financial_summary WHERE organization_id = 'org_demo';
"

  echo "$TEST_SQL" | psql "$DATABASE_URL"

  echo -e "${GREEN}✅ Dados de teste criados${NC}"
  echo ""
  echo "Saldo calculado:"
  psql "$DATABASE_URL" -c "SELECT calculate_current_balance('org_demo');"
else
  echo -e "${YELLOW}⚠️  Dados de teste não criados${NC}"
fi

echo ""

# ============================================
# 7. RESUMO FINAL
# ============================================

echo "================================================"
echo "🎉 INSTALAÇÃO CONCLUÍDA!"
echo "================================================"
echo ""
echo "O que foi instalado:"
echo "  ✅ Cliente Prisma gerado"
echo "  ✅ Schema sincronizado com banco"
if [[ $execute_migration =~ ^[Ss]$ ]]; then
  echo "  ✅ Migration SQL executada"
fi
if [[ $create_test_data =~ ^[Ss]$ ]]; then
  echo "  ✅ Dados de teste criados"
fi
echo ""
echo "Próximos passos:"
echo "  1. Iniciar servidor: npm run dev"
echo "  2. Acessar: http://localhost:3000/login"
echo "  3. Criar conta informando capital inicial"
echo "  4. Ver saldo no dashboard"
echo ""
echo "Documentação:"
echo "  • SPRINT-0-FINANCIAL-IMPLEMENTATION.md - Guia completo"
echo "  • QUICK-START-GUIDE.md - Guia rápido"
echo ""
echo "Comandos úteis:"
echo "  • Abrir Prisma Studio: npx prisma studio"
echo "  • Ver transações: psql \"DIRECT_URL\" -c \"SELECT * FROM financial_transactions;\""
echo "  • Calcular saldo: psql \"DIRECT_URL\" -c \"SELECT calculate_current_balance('org_demo');\""
echo ""
echo -e "${GREEN}✨ Tudo pronto! Bom desenvolvimento!${NC}"
echo ""
