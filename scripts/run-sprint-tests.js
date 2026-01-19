#!/usr/bin/env node

/**
 * Script para executar testes dos Sprints 0 e 1 via TestSprite
 * Foca nos casos de teste relevantes para as funcionalidades implementadas
 */

const { execSync } = require('child_process');
const path = require('path');

const PROJECT_PATH = '/Users/viniciuspimentel/ProjetosDev/CRM ZOOMER/zooming-crm';
const PROJECT_NAME = 'zooming-crm';

// Testes selecionados para Sprints 0 e 1
const SELECTED_TESTS = [
  'TC001', // Signup com capital inicial
  'TC002', // Validação de email
  'TC004', // Login correto
  'TC005', // Login incorreto
  'TC006', // Toggle de senha
  'TC007', // Capital inicial único
  'TC008', // Adicionar despesa
  'TC009', // Validação de campos obrigatórios
  'TC010', // Valor negativo rejeitado
  'TC011', // Dashboard com dados financeiros
  'TC016', // Signout
];

const ADDITIONAL_INSTRUCTIONS = `
Focus on testing Sprint 0 and Sprint 1 features:
- Sprint 0: Authentication with initial capital, financial system base, current balance calculation
- Sprint 1: Password visibility toggle, auto-redirect after signup, expense management with categories (Fixed/Variable)

Test the signup flow with capital inicial optional field, dashboard displaying real-time balance, and add expense dialog with category selection.

IMPORTANT:
1. For signup test (TC001): Use unique email like test_${Date.now()}@zooming.com to avoid duplicates
2. For dashboard test (TC011): Verify the balance card shows formatted currency (R$)
3. For expense test (TC008): Test both Fixed Monthly (OFFICE_RENT) and Variable (CREW_TALENT) categories
4. For password toggle (TC006): Verify eye icon changes between Eye and EyeOff
5. The application is running on localhost:3000
`;

console.log('🧪 Iniciando testes dos Sprints 0 e 1...\n');
console.log('📋 Testes selecionados:', SELECTED_TESTS.join(', '));
console.log('🌐 Servidor: http://localhost:3000');
console.log('📁 Projeto:', PROJECT_NAME);
console.log('\n⏳ Executando testes via TestSprite MCP...\n');

try {
  // Executar TestSprite via npx
  const command = `npx @testsprite/testsprite-mcp generateCodeAndExecute \
    --projectPath "${PROJECT_PATH}" \
    --projectName "${PROJECT_NAME}" \
    --testIds '${JSON.stringify(SELECTED_TESTS)}' \
    --additionalInstruction '${ADDITIONAL_INSTRUCTIONS.replace(/\n/g, ' ').trim()}'`;

  console.log('🚀 Comando:', command.substring(0, 100) + '...\n');

  execSync(command, {
    cwd: PROJECT_PATH,
    stdio: 'inherit',
    env: { ...process.env }
  });

  console.log('\n✅ Testes concluídos!');
  console.log('📊 Relatório disponível em: testsprite_tests/testsprite-mcp-test-report.md');

} catch (error) {
  console.error('\n❌ Erro ao executar testes:', error.message);
  process.exit(1);
}
