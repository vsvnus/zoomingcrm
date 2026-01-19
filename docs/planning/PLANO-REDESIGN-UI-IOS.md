# 🎨 PLANO DE REDESIGN - CRM ZOOMER
## Design System iOS Moderno com Glassmorphism Profissional

**Data:** 13 de Janeiro de 2026
**Objetivo:** Redesign completo seguindo princípios de design do iOS mais recente
**Inspirações:** Linear, Notion, Stripe + iOS Human Interface Guidelines
**Suporte:** Dark Mode + Light Mode completo

---

## 📐 FUNDAÇÃO DO DESIGN SYSTEM

### 1. Direção de Design Escolhida

**Personalidade:** **Sofisticação & Modernidade com Densidade Funcional**

Este é um CRM para produtoras audiovisuais - precisa transmitir:
- ✨ **Criatividade visual** (é um negócio criativo)
- 💼 **Profissionalismo** (lida com orçamentos e projetos sérios)
- ⚡ **Eficiência** (usuários precisam trabalhar rápido)
- 🎬 **Modernidade** (indústria audiovisual é vanguarda tecnológica)

**Referências de Direção:**
- **60% Linear** - Densidade, precisão, information-forward
- **20% Notion** - Warmth nas interações, colaborativo
- **20% Stripe** - Sofisticação financeira, confiança em números

---

### 2. Sistema de Cores

#### 2.1 Fundação (Base Neutra)

**Dark Mode (Principal):**
```css
/* Backgrounds - Progressive depth */
--bg-primary: #000000;          /* Canvas principal */
--bg-secondary: #0a0a0a;        /* Cards elevados */
--bg-tertiary: #121212;         /* Cards sobre cards */
--bg-hover: rgba(255,255,255,0.05);

/* Glassmorphism backgrounds */
--glass-bg: rgba(18, 18, 18, 0.7);
--glass-border: rgba(255, 255, 255, 0.08);
--glass-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
```

**Light Mode:**
```css
/* Backgrounds */
--bg-primary: #ffffff;
--bg-secondary: #f8fafc;
--bg-tertiary: #f1f5f9;
--bg-hover: rgba(0,0,0,0.04);

/* Glassmorphism backgrounds */
--glass-bg: rgba(255, 255, 255, 0.7);
--glass-border: rgba(0, 0, 0, 0.08);
--glass-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
```

#### 2.2 Hierarquia de Texto

```css
/* Dark Mode */
--text-primary: rgba(255, 255, 255, 0.95);      /* Headlines, títulos */
--text-secondary: rgba(255, 255, 255, 0.70);    /* Body text */
--text-tertiary: rgba(255, 255, 255, 0.45);     /* Labels, hints */
--text-quaternary: rgba(255, 255, 255, 0.25);   /* Disabled, placeholders */

/* Light Mode */
--text-primary: rgba(0, 0, 0, 0.95);
--text-secondary: rgba(0, 0, 0, 0.70);
--text-tertiary: rgba(0, 0, 0, 0.50);
--text-quaternary: rgba(0, 0, 0, 0.30);
```

#### 2.3 Cor de Accent (Marca)

**Escolhida:** Violet/Purple (Criatividade + Tecnologia)

```css
/* Violet Scale - Inspirado em iOS */
--accent-50: #faf5ff;
--accent-100: #f3e8ff;
--accent-200: #e9d5ff;
--accent-300: #d8b4fe;
--accent-400: #c084fc;    /* Hover states */
--accent-500: #a855f7;    /* Primary accent */
--accent-600: #9333ea;    /* Active states */
--accent-700: #7e22ce;
--accent-800: #6b21a8;
--accent-900: #581c87;
```

**Uso da Cor Accent:**
- Botões primários
- Links interativos
- Indicadores de status "ativo"
- Highlights de seleção
- Progress bars
- **NUNCA** use accent em texto de corpo - apenas para ações e destaques

#### 2.4 Cores Semânticas (Status)

```css
/* Success - Green */
--success: #10b981;
--success-bg: rgba(16, 185, 129, 0.12);
--success-border: rgba(16, 185, 129, 0.3);

/* Warning - Amber */
--warning: #f59e0b;
--warning-bg: rgba(245, 158, 11, 0.12);
--warning-border: rgba(245, 158, 11, 0.3);

/* Error - Red */
--error: #ef4444;
--error-bg: rgba(239, 68, 68, 0.12);
--error-border: rgba(239, 68, 68, 0.3);

/* Info - Blue */
--info: #3b82f6;
--info-bg: rgba(59, 130, 246, 0.12);
--info-border: rgba(59, 130, 246, 0.3);
```

---

### 3. Espaçamento e Grid (4px Base)

**Sistema Completo:**
```css
--space-1: 4px;    /* Micro gaps (ícone interno) */
--space-2: 8px;    /* Tight (dentro de botões) */
--space-3: 12px;   /* Standard (between elements) */
--space-4: 16px;   /* Comfortable (padding padrão) */
--space-5: 20px;   /* */
--space-6: 24px;   /* Generous (entre seções) */
--space-8: 32px;   /* Major separation */
--space-10: 40px;  /* */
--space-12: 48px;  /* Page padding */
--space-16: 64px;  /* Hero spacing */
```

**Regra de Ouro:** SEMPRE usar múltiplos de 4px. Sem exceções.

---

### 4. Border Radius (iOS-style)

**Sistema de Cantos:**
```css
--radius-xs: 4px;    /* Badges, tags pequenas */
--radius-sm: 6px;    /* Inputs, small buttons */
--radius-md: 8px;    /* Buttons, small cards */
--radius-lg: 12px;   /* Cards, modals */
--radius-xl: 16px;   /* Large cards, hero sections */
--radius-2xl: 20px;  /* iOS-style rounded panels */
--radius-full: 9999px; /* Pills, avatars */
```

**Consistência:**
- Inputs: `--radius-md (8px)`
- Botões: `--radius-md (8px)`
- Cards principais: `--radius-lg (12px)`
- Modais/Sheets: `--radius-xl (16px)`
- Sidebar panels: `--radius-2xl (20px)`

---

### 5. Glassmorphism Profissional

#### 5.1 Princípios

❌ **NÃO FAZER:**
- Blur exagerado (>20px)
- Transparência alta que dificulta leitura
- Glass em todos os elementos
- Bordas muito chamativas

✅ **FAZER:**
- Blur sutil (8-16px)
- Transparência moderada (70-80%)
- Usar glass apenas em elementos flutuantes
- Bordas finas com transparência

#### 5.2 Receitas de Glass

**Glass Panel (Sidebar, Modals):**
```css
.glass-panel {
  background: var(--glass-bg);
  backdrop-filter: blur(12px) saturate(180%);
  -webkit-backdrop-filter: blur(12px) saturate(180%);
  border: 1px solid var(--glass-border);
  box-shadow: var(--glass-shadow);
}
```

**Glass Card (Cards flutuantes):**
```css
.glass-card {
  background: var(--glass-bg);
  backdrop-filter: blur(8px) saturate(160%);
  -webkit-backdrop-filter: blur(8px) saturate(160%);
  border: 1px solid var(--glass-border);
  box-shadow:
    0 4px 16px rgba(0, 0, 0, 0.12),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
}
```

**Glass Hover Effect:**
```css
.glass-hover {
  transition: all 200ms cubic-bezier(0.25, 1, 0.5, 1);
}

.glass-hover:hover {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.12);
  transform: translateY(-1px);
  box-shadow:
    0 8px 24px rgba(0, 0, 0, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.08);
}
```

---

### 6. Tipografia (SF Pro inspired)

#### 6.1 Fonte Base

```typescript
// Usar Inter como fallback para SF Pro
import { Inter } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
})
```

#### 6.2 Escala Tipográfica

```css
/* Display - Grandes títulos */
--text-display: 48px / 56px;  /* line-height */
--weight-display: 700;
--tracking-display: -0.02em;

/* H1 - Page titles */
--text-h1: 32px / 40px;
--weight-h1: 600;
--tracking-h1: -0.01em;

/* H2 - Section titles */
--text-h2: 24px / 32px;
--weight-h2: 600;
--tracking-h2: -0.01em;

/* H3 - Card titles */
--text-h3: 18px / 28px;
--weight-h3: 600;
--tracking-h3: 0;

/* Body Large */
--text-body-lg: 16px / 24px;
--weight-body-lg: 400;

/* Body (Default) */
--text-body: 14px / 20px;
--weight-body: 400;

/* Body Small */
--text-body-sm: 13px / 18px;
--weight-body-sm: 400;

/* Caption */
--text-caption: 12px / 16px;
--weight-caption: 500;
--tracking-caption: 0.01em;

/* Label (Uppercase) */
--text-label: 11px / 16px;
--weight-label: 600;
--tracking-label: 0.06em;
text-transform: uppercase;
```

#### 6.3 Números e Monospace

```css
/* Para valores financeiros, IDs, timestamps */
font-variant-numeric: tabular-nums;
font-feature-settings: 'tnum';
/* Ou usar: */
font-family: 'SF Mono', 'Roboto Mono', 'Courier New', monospace;
```

---

### 7. Depth & Elevation (Sistema de Sombras)

**Approach:** Layered shadows para profundidade realista

```css
/* Level 0 - Flat (no shadow) */
--shadow-0: none;

/* Level 1 - Slight lift (inputs, small buttons) */
--shadow-1:
  0 1px 2px rgba(0, 0, 0, 0.05),
  0 1px 3px rgba(0, 0, 0, 0.03);

/* Level 2 - Cards */
--shadow-2:
  0 0 0 1px rgba(0, 0, 0, 0.05),
  0 2px 4px rgba(0, 0, 0, 0.06),
  0 4px 8px rgba(0, 0, 0, 0.04);

/* Level 3 - Dropdowns, popovers */
--shadow-3:
  0 0 0 1px rgba(0, 0, 0, 0.08),
  0 4px 8px rgba(0, 0, 0, 0.08),
  0 8px 16px rgba(0, 0, 0, 0.06);

/* Level 4 - Modals */
--shadow-4:
  0 0 0 1px rgba(0, 0, 0, 0.1),
  0 8px 16px rgba(0, 0, 0, 0.1),
  0 16px 32px rgba(0, 0, 0, 0.08),
  0 24px 48px rgba(0, 0, 0, 0.06);

/* Glow (para accent colors) */
--shadow-glow: 0 0 20px rgba(168, 85, 247, 0.4);
```

**Bordas vs Shadows:**
- Dark Mode: Priorizar **bordas sutis** + shadows leves
- Light Mode: Shadows mais visíveis, bordas mínimas

---

### 8. Animações e Transições

#### 8.1 Timing

```css
/* Micro-interactions */
--timing-fast: 150ms;

/* Standard transitions */
--timing-base: 200ms;

/* Smooth, noticeable */
--timing-slow: 300ms;

/* Dramatic reveals */
--timing-slower: 450ms;
```

#### 8.2 Easing

```css
/* iOS-inspired easing */
--ease-in-out: cubic-bezier(0.25, 1, 0.5, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-in: cubic-bezier(0.4, 0, 1, 1);

/* Spring-like (for modals, sheets) */
--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
```

#### 8.3 Animações Proibidas

❌ **NUNCA:**
- Spring/bounce em enterprise UI
- Animações > 500ms
- Parallax exagerado
- Animações que bloqueiam interação

✅ **SEMPRE:**
- Transições suaves (200-300ms)
- Hover states responsivos (150ms)
- Feedback imediato em cliques
- Skeleton screens enquanto carrega

---

### 9. Iconografia

**Biblioteca:** Lucide React (já instalada)

**Sizing:**
```css
--icon-xs: 14px;   /* Inline com texto pequeno */
--icon-sm: 16px;   /* Inline com body text */
--icon-md: 20px;   /* Botões, tabs */
--icon-lg: 24px;   /* Headers, títulos */
--icon-xl: 32px;   /* Hero sections */
```

**Stroke Width:** 2px (padrão Lucide, iOS-like)

**Contextos de Ícones:**
```tsx
// Com container background (Standalone icons)
<div className="icon-container">
  <Icon size={20} />
</div>

.icon-container {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  background: var(--bg-secondary);
  border: 1px solid var(--glass-border);
}
```

---

## 🎯 COMPONENTES DO DESIGN SYSTEM

### 1. Button System

#### 1.1 Variantes

**Primary (Accent):**
```tsx
<Button variant="primary">
  Criar Projeto
</Button>
```

```css
.btn-primary {
  background: var(--accent-500);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: var(--radius-md);
  font-weight: 500;
  font-size: 14px;
  transition: all var(--timing-base) var(--ease-in-out);
}

.btn-primary:hover {
  background: var(--accent-600);
  transform: translateY(-1px);
  box-shadow: var(--shadow-2);
}

.btn-primary:active {
  transform: translateY(0);
  box-shadow: var(--shadow-1);
}
```

**Secondary (Ghost):**
```css
.btn-secondary {
  background: transparent;
  color: var(--text-secondary);
  border: 1px solid var(--glass-border);
  padding: 8px 16px;
  border-radius: var(--radius-md);
}

.btn-secondary:hover {
  background: var(--bg-hover);
  border-color: var(--text-tertiary);
  color: var(--text-primary);
}
```

**Destructive:**
```css
.btn-destructive {
  background: var(--error);
  color: white;
  /* ... mesmo comportamento do primary */
}
```

#### 1.2 Sizes

```css
/* Small */
.btn-sm {
  height: 32px;
  padding: 0 12px;
  font-size: 13px;
}

/* Medium (Default) */
.btn-md {
  height: 40px;
  padding: 0 16px;
  font-size: 14px;
}

/* Large */
.btn-lg {
  height: 48px;
  padding: 0 24px;
  font-size: 16px;
}
```

#### 1.3 Com Ícones

```tsx
<Button variant="primary">
  <Plus size={16} />
  <span>Novo Projeto</span>
</Button>
```

```css
.btn-with-icon {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
}
```

---

### 2. Card System

#### 2.1 Card Base

```tsx
<Card>
  <CardHeader>
    <CardTitle>Título do Card</CardTitle>
    <CardDescription>Descrição opcional</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Conteúdo */}
  </CardContent>
  <CardFooter>
    {/* Ações */}
  </CardFooter>
</Card>
```

```css
.card {
  background: var(--bg-secondary);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-2);
  overflow: hidden;
}

.card-header {
  padding: var(--space-6);
  border-bottom: 1px solid var(--glass-border);
}

.card-content {
  padding: var(--space-6);
}

.card-footer {
  padding: var(--space-6);
  border-top: 1px solid var(--glass-border);
  background: var(--bg-tertiary);
}
```

#### 2.2 Glass Card (Flutuante)

```css
.glass-card {
  background: var(--glass-bg);
  backdrop-filter: blur(12px) saturate(180%);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-3);
}
```

#### 2.3 Metric Card (KPIs)

```tsx
<MetricCard
  label="Receita Total"
  value="R$ 125.430,00"
  change={+12.5}
  trend="up"
/>
```

```css
.metric-card {
  /* Glass card base */
  padding: var(--space-6);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.metric-label {
  font-size: var(--text-caption);
  font-weight: var(--weight-caption);
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: var(--tracking-label);
}

.metric-value {
  font-size: var(--text-h1);
  font-weight: var(--weight-h1);
  color: var(--text-primary);
  font-variant-numeric: tabular-nums;
  letter-spacing: var(--tracking-h1);
}

.metric-change {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  font-size: var(--text-caption);
  font-weight: var(--weight-caption);
}

.metric-change.positive {
  color: var(--success);
}

.metric-change.negative {
  color: var(--error);
}
```

---

### 3. Input System

#### 3.1 Text Input

```tsx
<Input
  label="Nome do Projeto"
  placeholder="Ex: Vídeo institucional"
  helperText="Nome interno para identificação"
/>
```

```css
.input-wrapper {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.input-label {
  font-size: var(--text-body-sm);
  font-weight: 500;
  color: var(--text-secondary);
}

.input {
  height: 40px;
  padding: 0 var(--space-4);
  background: var(--bg-secondary);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-md);
  font-size: var(--text-body);
  color: var(--text-primary);
  transition: all var(--timing-base) var(--ease-in-out);
}

.input:hover {
  border-color: var(--text-tertiary);
}

.input:focus {
  outline: none;
  border-color: var(--accent-500);
  box-shadow: 0 0 0 3px rgba(168, 85, 247, 0.12);
}

.input::placeholder {
  color: var(--text-quaternary);
}

.input-helper {
  font-size: var(--text-caption);
  color: var(--text-tertiary);
}
```

#### 3.2 Search Input

```tsx
<SearchInput
  placeholder="Buscar projetos..."
  onSearch={handleSearch}
/>
```

```css
.search-input {
  position: relative;
}

.search-input input {
  padding-left: 40px; /* Espaço para ícone */
}

.search-icon {
  position: absolute;
  left: var(--space-3);
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-tertiary);
  pointer-events: none;
}
```

---

### 4. Modal/Dialog System (iOS Sheet Style)

```tsx
<Modal isOpen={isOpen} onClose={onClose}>
  <ModalHeader>
    <ModalTitle>Novo Projeto</ModalTitle>
    <ModalClose />
  </ModalHeader>
  <ModalBody>
    {/* Formulário */}
  </ModalBody>
  <ModalFooter>
    <Button variant="secondary" onClick={onClose}>
      Cancelar
    </Button>
    <Button variant="primary" onClick={onSubmit}>
      Criar Projeto
    </Button>
  </ModalFooter>
</Modal>
```

```css
/* Overlay */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  z-index: 50;
  animation: fade-in var(--timing-base) var(--ease-out);
}

/* Modal Container (iOS Sheet) */
.modal {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 640px;
  max-height: 90vh;
  background: var(--glass-bg);
  backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-2xl) var(--radius-2xl) 0 0;
  box-shadow: var(--shadow-4);
  animation: slide-up var(--timing-slow) var(--ease-spring);
  overflow: hidden;
}

@keyframes slide-up {
  from {
    transform: translateX(-50%) translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateX(-50%) translateY(0);
    opacity: 1;
  }
}

/* Modal Header */
.modal-header {
  padding: var(--space-6);
  border-bottom: 1px solid var(--glass-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

/* Modal Body (Scrollable) */
.modal-body {
  padding: var(--space-6);
  max-height: calc(90vh - 140px);
  overflow-y: auto;
}

/* Modal Footer (Sticky) */
.modal-footer {
  padding: var(--space-6);
  border-top: 1px solid var(--glass-border);
  background: var(--bg-tertiary);
  display: flex;
  gap: var(--space-3);
  justify-content: flex-end;
}
```

---

### 5. Badge/Tag System

```tsx
<Badge variant="success">Ativo</Badge>
<Badge variant="warning">Pendente</Badge>
<Badge variant="error">Atrasado</Badge>
<Badge variant="info">Em Andamento</Badge>
```

```css
.badge {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  height: 24px;
  padding: 0 var(--space-3);
  border-radius: var(--radius-full);
  font-size: var(--text-caption);
  font-weight: var(--weight-caption);
  line-height: 1;
}

.badge-success {
  background: var(--success-bg);
  color: var(--success);
  border: 1px solid var(--success-border);
}

.badge-warning {
  background: var(--warning-bg);
  color: var(--warning);
  border: 1px solid var(--warning-border);
}

.badge-error {
  background: var(--error-bg);
  color: var(--error);
  border: 1px solid var(--error-border);
}

.badge-info {
  background: var(--info-bg);
  color: var(--info);
  border: 1px solid var(--info-border);
}

/* Com dot indicator */
.badge-with-dot::before {
  content: '';
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
}
```

---

### 6. Table System (Data-dense)

```css
.table-container {
  background: var(--bg-secondary);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.table {
  width: 100%;
  border-collapse: collapse;
}

.table thead {
  background: var(--bg-tertiary);
  border-bottom: 1px solid var(--glass-border);
}

.table th {
  padding: var(--space-3) var(--space-4);
  text-align: left;
  font-size: var(--text-caption);
  font-weight: var(--weight-caption);
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: var(--tracking-label);
}

.table td {
  padding: var(--space-4);
  font-size: var(--text-body-sm);
  color: var(--text-secondary);
  border-bottom: 1px solid var(--glass-border);
}

.table tr:last-child td {
  border-bottom: none;
}

.table tr:hover {
  background: var(--bg-hover);
}

/* Monospace para números */
.table td.numeric {
  font-variant-numeric: tabular-nums;
  text-align: right;
}
```

---

### 7. Navigation (Sidebar)

**Implementação Glass Sidebar:**

```css
.sidebar {
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  width: 280px;
  background: var(--glass-bg);
  backdrop-filter: blur(20px) saturate(180%);
  border-right: 1px solid var(--glass-border);
  box-shadow: var(--shadow-2);
  z-index: 40;
}

/* Logo Section */
.sidebar-logo {
  height: 64px;
  padding: 0 var(--space-6);
  display: flex;
  align-items: center;
  gap: var(--space-3);
  border-bottom: 1px solid var(--glass-border);
}

.logo-icon {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-md);
  background: linear-gradient(135deg, var(--accent-500), var(--accent-600));
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

/* Navigation */
.sidebar-nav {
  padding: var(--space-6) var(--space-3);
  overflow-y: auto;
  height: calc(100vh - 64px - 80px); /* Logo + Footer */
}

.nav-section {
  margin-bottom: var(--space-6);
}

.nav-section-title {
  padding: 0 var(--space-3);
  margin-bottom: var(--space-2);
  font-size: var(--text-caption);
  font-weight: var(--weight-caption);
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: var(--tracking-label);
}

.nav-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  height: 44px;
  padding: 0 var(--space-3);
  border-radius: var(--radius-md);
  font-size: var(--text-body);
  font-weight: 500;
  color: var(--text-secondary);
  transition: all var(--timing-fast) var(--ease-in-out);
  cursor: pointer;
  position: relative;
}

.nav-item:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.nav-item.active {
  background: rgba(168, 85, 247, 0.12);
  color: var(--accent-500);
}

/* Active Indicator */
.nav-item.active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 24px;
  border-radius: 0 var(--radius-xs) var(--radius-xs) 0;
  background: var(--accent-500);
}

/* Badge (contador) */
.nav-badge {
  margin-left: auto;
  height: 20px;
  min-width: 20px;
  padding: 0 6px;
  border-radius: var(--radius-full);
  background: var(--bg-tertiary);
  font-size: 11px;
  font-weight: 600;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-item.active .nav-badge {
  background: var(--accent-500);
  color: white;
}

/* Sidebar Footer */
.sidebar-footer {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 80px;
  padding: var(--space-4) var(--space-3);
  border-top: 1px solid var(--glass-border);
  background: var(--bg-tertiary);
}
```

---

### 8. Dashboard Layout

```tsx
<div className="dashboard-layout">
  <Sidebar />
  <main className="dashboard-main">
    <Header />
    <div className="dashboard-content">
      {children}
    </div>
  </main>
</div>
```

```css
.dashboard-layout {
  display: flex;
  min-height: 100vh;
  background: var(--bg-primary);
}

.dashboard-main {
  flex: 1;
  margin-left: 280px; /* Sidebar width */
  display: flex;
  flex-direction: column;
}

.dashboard-header {
  height: 64px;
  border-bottom: 1px solid var(--glass-border);
  background: var(--glass-bg);
  backdrop-filter: blur(12px) saturate(180%);
  padding: 0 var(--space-8);
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  z-index: 30;
}

.dashboard-content {
  padding: var(--space-8);
  flex: 1;
}

/* Grid para KPI Cards */
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--space-6);
  margin-bottom: var(--space-8);
}
```

---

## 🔄 IMPLEMENTAÇÃO: DARK MODE + LIGHT MODE

### 1. Setup de Temas

```tsx
// src/app/layout.tsx
import { ThemeProvider } from '@/components/theme-provider'

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
```

### 2. CSS Variables (globals.css)

```css
/* globals.css */

@layer base {
  :root {
    /* Light Mode */
    --bg-primary: 255 255 255;
    --bg-secondary: 248 250 252;
    --bg-tertiary: 241 245 249;
    --bg-hover: 0 0 0 / 0.04;

    --glass-bg: 255 255 255 / 0.7;
    --glass-border: 0 0 0 / 0.08;

    --text-primary: 0 0 0 / 0.95;
    --text-secondary: 0 0 0 / 0.70;
    --text-tertiary: 0 0 0 / 0.50;
    --text-quaternary: 0 0 0 / 0.30;

    --accent-500: 168 85 247;
    --accent-600: 147 51 234;

    --success: 16 185 129;
    --warning: 245 158 11;
    --error: 239 68 68;
    --info: 59 130 246;
  }

  .dark {
    /* Dark Mode */
    --bg-primary: 0 0 0;
    --bg-secondary: 10 10 10;
    --bg-tertiary: 18 18 18;
    --bg-hover: 255 255 255 / 0.05;

    --glass-bg: 18 18 18 / 0.7;
    --glass-border: 255 255 255 / 0.08;

    --text-primary: 255 255 255 / 0.95;
    --text-secondary: 255 255 255 / 0.70;
    --text-tertiary: 255 255 255 / 0.45;
    --text-quaternary: 255 255 255 / 0.25;

    --accent-500: 168 85 247;
    --accent-600: 147 51 234;

    --success: 34 197 94; /* Mais brilhante no dark */
    --warning: 251 191 36;
    --error: 248 113 113;
    --info: 96 165 250;
  }
}

/* Usar as variáveis */
.element {
  background: rgb(var(--bg-primary));
  color: rgb(var(--text-primary));
  border: 1px solid rgb(var(--glass-border));
}

/* Com opacidade */
.element-transparent {
  background: rgb(var(--accent-500) / 0.12);
}
```

### 3. Theme Toggle Component

```tsx
// src/components/theme-toggle.tsx
'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="relative"
    >
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
```

---

## 📱 PÁGINAS ESPECÍFICAS DO CRM

### 1. Dashboard Principal

**Layout:**
```
┌─────────────────────────────────────────────────┐
│  Header (Search, Notificações, User)           │
├─────────────────────────────────────────────────┤
│                                                 │
│  [Metric] [Metric] [Metric] [Metric]          │
│   Saldo    Receita  Despesa   Lucro           │
│                                                 │
│  ┌─────────────────────┐  ┌─────────────────┐ │
│  │ Gráfico de Receita │  │ Projetos Ativos │ │
│  │   (7 dias)         │  │                 │ │
│  └─────────────────────┘  └─────────────────┘ │
│                                                 │
│  ┌──────────────────────────────────────────┐ │
│  │ Próximas Atividades (Timeline)          │ │
│  │ • Gravação Projeto X - Amanhã           │ │
│  │ • Entrega Projeto Y - 3 dias            │ │
│  └──────────────────────────────────────────┘ │
│                                                 │
└─────────────────────────────────────────────────┘
```

**Componentes:**

```tsx
// Metric Card com Glass
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  <MetricCard
    icon={<DollarSign />}
    label="Saldo em Caixa"
    value="R$ 125.430,00"
    change={+12.5}
    trend="up"
    className="glass-card"
  />

  <MetricCard
    icon={<TrendingUp />}
    label="Receita (Mês)"
    value="R$ 85.200,00"
    change={+8.3}
    trend="up"
  />

  <MetricCard
    icon={<TrendingDown />}
    label="Despesas (Mês)"
    value="R$ 42.100,00"
    change={-5.2}
    trend="down"
  />

  <MetricCard
    icon={<Activity />}
    label="Lucro (Mês)"
    value="R$ 43.100,00"
    change={+15.7}
    trend="up"
  />
</div>
```

---

### 2. Kanban de Projetos

**Design:**
- Colunas com glass background
- Cards de projeto com hover lift
- Drag & drop suave com feedback visual
- Status badges coloridos

```css
.kanban-column {
  flex: 0 0 320px;
  background: var(--glass-bg);
  backdrop-filter: blur(12px) saturate(180%);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-xl);
  padding: var(--space-4);
}

.kanban-column-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-4);
  margin-bottom: var(--space-4);
}

.kanban-column-title {
  font-weight: 600;
  font-size: var(--text-body);
  color: var(--text-primary);
}

.kanban-card {
  background: var(--bg-secondary);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
  margin-bottom: var(--space-3);
  cursor: grab;
  transition: all var(--timing-base) var(--ease-in-out);
}

.kanban-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-3);
  border-color: var(--accent-500);
}

.kanban-card:active {
  cursor: grabbing;
  transform: rotate(2deg) scale(1.02);
  box-shadow: var(--shadow-4);
}
```

---

### 3. Modal de Detalhes do Projeto

**iOS Sheet Style:**
- Slide up do bottom
- Glass background
- Tabs para seções (Visão Geral, Datas, Equipe, Financeiro)
- Scrollable content

```css
.project-modal {
  /* iOS-style sheet */
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 90%;
  max-width: 1024px;
  max-height: 85vh;
  background: var(--glass-bg);
  backdrop-filter: blur(24px) saturate(200%);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-2xl) var(--radius-2xl) 0 0;
  box-shadow:
    0 -4px 32px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
  animation: slide-up 400ms var(--ease-spring);
}

/* Handle (iOS-style) */
.modal-handle {
  width: 40px;
  height: 4px;
  background: var(--text-quaternary);
  border-radius: var(--radius-full);
  margin: var(--space-3) auto var(--space-4);
}

/* Tabs */
.project-tabs {
  display: flex;
  gap: var(--space-2);
  padding: 0 var(--space-6);
  border-bottom: 1px solid var(--glass-border);
}

.project-tab {
  padding: var(--space-3) var(--space-4);
  font-size: var(--text-body-sm);
  font-weight: 500;
  color: var(--text-tertiary);
  border-bottom: 2px solid transparent;
  transition: all var(--timing-fast) var(--ease-in-out);
  cursor: pointer;
}

.project-tab:hover {
  color: var(--text-secondary);
}

.project-tab.active {
  color: var(--accent-500);
  border-bottom-color: var(--accent-500);
}
```

---

### 4. Tabela Financeira

**Data-dense com monospace:**

```tsx
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Data</TableHead>
      <TableHead>Descrição</TableHead>
      <TableHead>Categoria</TableHead>
      <TableHead className="text-right">Valor</TableHead>
      <TableHead>Status</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell className="tabular-nums">15/01/2026</TableCell>
      <TableCell>Pagamento Freelancer - João Silva</TableCell>
      <TableCell>
        <Badge variant="info">Equipe</Badge>
      </TableCell>
      <TableCell className="text-right tabular-nums font-semibold">
        R$ 3.500,00
      </TableCell>
      <TableCell>
        <StatusBadge status="paid" />
      </TableCell>
    </TableRow>
  </TableBody>
</Table>
```

```css
.financial-table {
  /* Table base styles */
}

.financial-table .amount-column {
  font-variant-numeric: tabular-nums;
  font-feature-settings: 'tnum';
  text-align: right;
  font-weight: 600;
}

.financial-table .amount-positive {
  color: var(--success);
}

.financial-table .amount-negative {
  color: var(--error);
}
```

---

### 5. Formulários (Modais)

**Formulário em 2 colunas (Desktop):**

```tsx
<form className="form-grid">
  <div className="form-group">
    <Label htmlFor="title">Título do Projeto *</Label>
    <Input id="title" placeholder="Ex: Vídeo Institucional" />
  </div>

  <div className="form-group">
    <Label htmlFor="client">Cliente *</Label>
    <Select id="client">
      <option>Selecione...</option>
    </Select>
  </div>

  <div className="form-group col-span-2">
    <Label htmlFor="description">Descrição</Label>
    <Textarea id="description" rows={4} />
  </div>

  <div className="form-group">
    <Label htmlFor="budget">Orçamento (R$) *</Label>
    <Input id="budget" type="number" step="0.01" />
  </div>

  <div className="form-group">
    <Label htmlFor="deadline">Prazo de Entrega</Label>
    <DatePicker id="deadline" />
  </div>
</form>
```

```css
.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-6);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.form-group.col-span-2 {
  grid-column: span 2;
}

/* Mobile: 1 coluna */
@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
  }

  .form-group.col-span-2 {
    grid-column: span 1;
  }
}
```

---

## 🚀 PLANO DE IMPLEMENTAÇÃO

### Fase 1: Fundação (1-2 dias)

**Tarefas:**
- [ ] Criar arquivo `globals.css` com todas as CSS variables
- [ ] Implementar ThemeProvider para dark/light mode
- [ ] Atualizar `tailwind.config.ts` com theme extends
- [ ] Criar componente `ThemeToggle`
- [ ] Testar toggle entre dark/light mode

**Arquivos:**
- `src/app/globals.css`
- `src/components/theme-provider.tsx`
- `src/components/theme-toggle.tsx`
- `tailwind.config.ts`

---

### Fase 2: Componentes Base (2-3 dias)

**Tarefas:**
- [ ] Reescrever componente `Button` com variantes
- [ ] Reescrever componente `Card` (base + glass + metric)
- [ ] Reescrever `Input`, `Textarea`, `Select`
- [ ] Criar `Badge` component com variantes semânticas
- [ ] Criar `Modal` component iOS-style
- [ ] Criar `Table` component

**Arquivos:**
- `src/components/ui/button.tsx`
- `src/components/ui/card.tsx`
- `src/components/ui/input.tsx`
- `src/components/ui/select.tsx`
- `src/components/ui/badge.tsx`
- `src/components/ui/modal.tsx`
- `src/components/ui/table.tsx`

---

### Fase 3: Redesign da Sidebar (1 dia)

**Tarefas:**
- [ ] Reescrever `Sidebar` component com glass effect
- [ ] Implementar active indicator (barra lateral)
- [ ] Adicionar badges de contagem
- [ ] Implementar hover states suaves
- [ ] Adicionar ThemeToggle no footer

**Arquivos:**
- `src/components/layout/sidebar.tsx`

---

### Fase 4: Redesign do Dashboard (1-2 dias)

**Tarefas:**
- [ ] Criar `MetricCard` component
- [ ] Implementar grid de métricas (4 cards KPI)
- [ ] Criar `RecentActivity` component (timeline)
- [ ] Criar chart component (receita 7 dias)
- [ ] Integrar dados reais (remover mocks)

**Arquivos:**
- `src/components/dashboard/metric-card.tsx`
- `src/components/dashboard/recent-activity.tsx`
- `src/components/dashboard/revenue-chart.tsx`
- `src/app/(dashboard)/dashboard/page.tsx`

---

### Fase 5: Redesign do Kanban (1-2 dias)

**Tarefas:**
- [ ] Reescrever `ProjectsKanban` com glass columns
- [ ] Implementar cards com hover lift effect
- [ ] Adicionar status badges coloridos
- [ ] Melhorar drag & drop visual feedback
- [ ] Adicionar empty states bonitos

**Arquivos:**
- `src/components/projects/projects-kanban.tsx`

---

### Fase 6: Redesign de Modais e Formulários (2 dias)

**Tarefas:**
- [ ] Reescrever todos os modais com iOS sheet style
- [ ] Implementar formulários em grid 2 colunas
- [ ] Criar `DatePicker` component (iOS-style)
- [ ] Melhorar validação visual de formulários
- [ ] Adicionar loading states

**Arquivos:**
- `src/components/projects/project-form-modal.tsx`
- `src/components/clients/client-form-modal.tsx`
- `src/components/proposals/proposal-form-modal.tsx`
- `src/components/ui/date-picker.tsx`

---

### Fase 7: Redesign da Página Financeiro (1-2 dias)

**Tarefas:**
- [ ] Reescrever tabelas financeiras com monospace
- [ ] Criar tabs para Visão Geral / Contas a Pagar / Contas a Receber
- [ ] Implementar filtros com glass background
- [ ] Adicionar gráficos de fluxo de caixa
- [ ] Melhorar status badges

**Arquivos:**
- `src/app/(dashboard)/financeiro/page.tsx`
- `src/components/financeiro/financial-tabs.tsx`
- `src/components/financeiro/overview-tab.tsx`
- `src/components/financeiro/payables-tab.tsx`
- `src/components/financeiro/receivables-tab.tsx`

---

### Fase 8: Página Pública de Proposta (1 dia)

**Tarefas:**
- [ ] Redesign completo da página `/p/[token]`
- [ ] Implementar layout mobile-first
- [ ] Adicionar animações de entrada suaves
- [ ] Criar botão de aceitar com confetti
- [ ] Melhorar apresentação de valores (monospace)

**Arquivos:**
- `src/app/(public)/p/[token]/page.tsx`
- `src/components/proposals/proposal-public-view.tsx`

---

### Fase 9: Responsividade e Mobile (1-2 dias)

**Tarefas:**
- [ ] Implementar sidebar mobile (drawer)
- [ ] Ajustar grids para breakpoints mobile
- [ ] Testar todos os formulários em mobile
- [ ] Implementar bottom sheet para modais mobile
- [ ] Touch-friendly interactions

**Breakpoints:**
```css
/* Mobile first */
@media (min-width: 640px) { /* sm */ }
@media (min-width: 768px) { /* md */ }
@media (min-width: 1024px) { /* lg */ }
@media (min-width: 1280px) { /* xl */ }
@media (min-width: 1536px) { /* 2xl */ }
```

---

### Fase 10: Polimento Final (1 dia)

**Tarefas:**
- [ ] Revisar todas as animações (timing consistente)
- [ ] Verificar contraste de cores (WCAG AA)
- [ ] Testar dark/light mode em todas as páginas
- [ ] Adicionar skeleton screens para loading
- [ ] Empty states ilustrados
- [ ] Error states com feedback claro

---

## 📦 ESTRUTURA DE ARQUIVOS FINAL

```
src/
├── app/
│   ├── globals.css (NOVO - com CSS variables)
│   ├── layout.tsx (atualizado com ThemeProvider)
│   └── (dashboard)/
│       ├── layout.tsx
│       ├── dashboard/page.tsx (redesign)
│       ├── projects/page.tsx (redesign)
│       ├── financeiro/page.tsx (redesign)
│       └── ...
├── components/
│   ├── ui/ (REDESIGN COMPLETO)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── select.tsx
│   │   ├── badge.tsx
│   │   ├── modal.tsx
│   │   ├── table.tsx
│   │   ├── date-picker.tsx
│   │   └── ...
│   ├── layout/ (REDESIGN)
│   │   ├── sidebar.tsx (glass sidebar)
│   │   └── header.tsx
│   ├── dashboard/ (NOVO)
│   │   ├── metric-card.tsx
│   │   ├── recent-activity.tsx
│   │   └── revenue-chart.tsx
│   ├── theme-provider.tsx (NOVO)
│   └── theme-toggle.tsx (NOVO)
└── lib/
    └── utils.ts
```

---

## 🎯 CHECKLIST DE QUALIDADE

Antes de dar como concluído, verificar:

### Visual
- [ ] Todas as cores seguem o sistema de design
- [ ] Todos os espaçamentos são múltiplos de 4px
- [ ] Border radius consistente em toda aplicação
- [ ] Glassmorphism apenas onde faz sentido (não exagerado)
- [ ] Sombras seguem sistema de elevação
- [ ] Ícones consistentes (tamanho, stroke)

### Tipografia
- [ ] Hierarquia clara (H1 > H2 > H3 > Body > Caption)
- [ ] Números financeiros em monospace
- [ ] Letter-spacing correto em headlines e labels
- [ ] Line-height confortável para leitura

### Interatividade
- [ ] Todos os botões têm hover/active states
- [ ] Feedback imediato em cliques
- [ ] Loading states visíveis
- [ ] Animações suaves (200-300ms)
- [ ] Sem animações blocantes

### Acessibilidade
- [ ] Contraste mínimo WCAG AA (4.5:1 para texto)
- [ ] Estados de foco visíveis (keyboard navigation)
- [ ] Labels em todos os inputs
- [ ] Alt text em imagens
- [ ] Aria labels onde necessário

### Dark/Light Mode
- [ ] Todas as páginas testadas em ambos os modos
- [ ] Transição suave entre modos
- [ ] Cores semânticas adaptadas para cada modo
- [ ] Glassmorphism funciona em ambos os modos

### Responsividade
- [ ] Mobile (320px - 768px) testado
- [ ] Tablet (768px - 1024px) testado
- [ ] Desktop (1024px+) testado
- [ ] Sidebar vira drawer em mobile
- [ ] Grids adaptam para 1 coluna em mobile
- [ ] Modais viram bottom sheets em mobile

---

## 🎨 INSPIRAÇÕES VISUAIS

**Referências para cada componente:**

1. **Sidebar:** Linear sidebar + Raycast command bar
2. **Dashboard Cards:** Stripe dashboard + Notion database cards
3. **Modals:** iOS Sheets + Linear modal system
4. **Tables:** GitHub tables + Linear issue lists
5. **Forms:** Apple Human Interface Guidelines
6. **Kanban:** Linear project views + Trello (mas minimal)
7. **Glassmorphism:** iOS 15+ design language

---

## ⚡ QUICK WINS (Implementar Primeiro)

Se quiser ver impacto visual rápido:

1. **Sidebar Glass** (30 min) - Imediatamente muda o look
2. **CSS Variables + Dark Mode Toggle** (1h) - Permite testar modos
3. **Button Redesign** (1h) - Usado em toda aplicação
4. **Card System** (1h) - Base de todos os layouts
5. **Dashboard Metrics** (2h) - Primeira impressão do sistema

---

## 📝 NOTAS FINAIS

### Princípios para Manter Durante Implementação:

1. **Menos é Mais:** Se em dúvida, simplifique
2. **Consistência > Criatividade:** Use o sistema, não invente
3. **Função > Forma:** Design serve a funcionalidade
4. **Performance:** Glassmorphism deve ser performático
5. **Acessibilidade:** Nunca sacrifique por estética

### Tecnologias Já Disponíveis:

✅ Next.js 16
✅ Tailwind CSS 3.4
✅ Radix UI (componentes primitivos)
✅ Framer Motion (animações)
✅ Lucide React (ícones)

### O Que Instalar:

```bash
npm install next-themes
npm install class-variance-authority
npm install @radix-ui/react-dialog
npm install @radix-ui/react-popover
```

---

**Documento criado em:** 13/01/2026
**Versão:** 1.0
**Status:** Pronto para Implementação

**Próximo Passo:** Escolher qual fase começar e criar branch:
```bash
git checkout -b redesign/fase-1-fundacao
```
