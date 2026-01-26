'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    LayoutDashboard,
    Film,
    FileText,
    Users,
    Package,
    DollarSign,
    Play,
    Search,
    Bell,
    MoreHorizontal,
    Clock,
    CheckCircle2,
    TrendingUp,
    Wallet,
    Camera,
    Calendar,
    ArrowUpRight,
    ArrowDownRight,
    Filter,
    Plus
} from 'lucide-react'

// --- Types & Data ---

type Tab = 'dashboard' | 'proposals' | 'projects' | 'financeiro' | 'inventory'

const MENU_ITEMS = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'proposals', label: 'Propostas', icon: FileText, badge: 2 },
    { id: 'projects', label: 'Projetos', icon: Film, badge: 4 },
    { id: 'financeiro', label: 'Financeiro', icon: DollarSign, badge: '!' },
    { id: 'inventory', label: 'Equipamentos', icon: Package },
]

export function CrmSimulator() {
    const [activeTab, setActiveTab] = useState<Tab>('projects')

    return (
        <div className="relative w-full max-w-[1400px] mx-auto mt-20 px-4">
            {/* Background Glow */}
            <div className="absolute -inset-4 bg-gradient-to-t from-emerald-500/10 via-zinc-500/5 to-transparent rounded-3xl blur-2xl -z-10" />

            <div className="relative border border-zinc-800 bg-[#09090b] rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/5 flex flex-col md:flex-row h-[600px] md:h-[800px]">

                {/* --- Sidebar (Desktop) --- */}
                <div className="hidden md:flex w-64 flex-col border-r border-zinc-800/50 bg-zinc-900/40 backdrop-blur-sm z-20">
                    {/* Logo */}
                    <div className="flex items-center gap-3 px-6 h-16 border-b border-white/5">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-black shadow-lg shadow-emerald-500/20">
                            <Play className="w-4 h-4 fill-current" />
                        </div>
                        <span className="font-bold text-sm text-white tracking-wide">Zooming</span>
                    </div>

                    {/* Nav */}
                    <div className="p-4 space-y-1">
                        {MENU_ITEMS.map((item) => {
                            const isActive = activeTab === item.id
                            const Icon = item.icon
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveTab(item.id as Tab)}
                                    className={`relative w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${isActive
                                        ? 'bg-emerald-500/10 text-emerald-400'
                                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
                                        }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    <span className="flex-1 text-left">{item.label}</span>
                                    {item.badge && (
                                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${item.badge === '!'
                                            ? 'bg-red-500/20 text-red-400'
                                            : isActive
                                                ? 'bg-emerald-500 text-black'
                                                : 'bg-zinc-800 text-zinc-400'
                                            }`}>
                                            {item.badge}
                                        </span>
                                    )}
                                    {isActive && (
                                        <motion.div
                                            layoutId="sidebar-active"
                                            className="absolute left-0 w-1 h-6 bg-emerald-500 rounded-r-full"
                                        />
                                    )}
                                </button>
                            )
                        })}
                    </div>

                    {/* User Footer */}
                    <div className="mt-auto p-4 border-t border-white/5">
                        <div className="flex items-center gap-3 group cursor-pointer">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-zinc-700 to-zinc-600 border border-zinc-500 ring-2 ring-transparent group-hover:ring-zinc-600 transition-all flex items-center justify-center overflow-hidden">
                                <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop" alt="Admin" className="w-full h-full object-cover" />
                            </div>
                            <div className="text-left">
                                <div className="text-xs font-bold text-zinc-200 group-hover:text-white transition-colors">Vinicius P.</div>
                                <div className="text-[10px] text-zinc-500">Admin</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- Main Content --- */}
                <div className="flex-1 flex flex-col bg-black/40 min-w-0 relative z-10">

                    {/* Header */}
                    <div className="h-16 border-b border-zinc-800/50 flex items-center justify-between px-4 md:px-6 bg-zinc-900/20 backdrop-blur-md sticky top-0 z-30 shrink-0">
                        {/* Mobile Logo Title */}
                        <div className="md:hidden flex items-center gap-2">
                            <div className="w-6 h-6 rounded bg-emerald-500 flex items-center justify-center text-black">
                                <Play className="w-3 h-3 fill-current" />
                            </div>
                            <span className="font-bold text-sm text-white">Zooming</span>
                        </div>

                        <div className="hidden md:flex items-center gap-3 text-zinc-500 bg-zinc-900/50 px-3 py-1.5 rounded-lg border border-zinc-800/50 w-64 focus-within:border-zinc-700 transition-colors">
                            <Search className="w-4 h-4" />
                            <span className="text-xs">Buscar projetos...</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="relative cursor-pointer hover:bg-zinc-800 p-1.5 rounded-lg transition-colors">
                                <Bell className="w-5 h-5 text-zinc-400" />
                                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-[#09090b]" />
                            </div>
                            <div className="hidden md:block w-px h-6 bg-zinc-800" />
                            <div className="hidden md:flex text-xs font-medium text-emerald-400 border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 rounded-full items-center gap-2 shadow-[0_0_10px_-3px_rgba(16,185,129,0.3)]">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                {activeTab === 'projects' ? 'Produção Ativa' : 'Sistema Online'}
                            </div>
                        </div>
                    </div>

                    {/* Dynamic Interface */}
                    <div className="flex-1 relative overflow-hidden bg-zinc-900/10">
                        <AnimatePresence initial={false}>
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="absolute inset-0 w-full h-full"
                            >
                                {activeTab === 'dashboard' && <DashboardView />}
                                {activeTab === 'projects' && <ProjectsView />}
                                {activeTab === 'proposals' && <ProposalsView />}
                                {activeTab === 'financeiro' && <FinanceiroView />}
                                {activeTab === 'inventory' && <InventoryView />}
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Mobile Navigation Bar */}
                    <div className="md:hidden border-t border-zinc-800 bg-zinc-900/90 backdrop-blur-lg flex justify-around p-2 pb-safe shrink-0">
                        {MENU_ITEMS.map((item) => {
                            const isActive = activeTab === item.id
                            const Icon = item.icon
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveTab(item.id as Tab)}
                                    className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all ${isActive ? 'text-emerald-400 bg-emerald-500/10' : 'text-zinc-500'
                                        }`}
                                >
                                    <Icon className="w-5 h-5" />
                                    <span className="text-[10px] mt-1 font-medium">{item.label}</span>
                                </button>
                            )
                        })}
                    </div>
                </div>
            </div>
        </div>
    )
}

// --- View Components ---

function ProjectsView() {
    return (
        <div className="h-full flex flex-col p-4 md:p-6 w-full">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-4 shrink-0">
                <div>
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                        <span className="text-xs font-mono text-zinc-500 px-2 py-1 rounded bg-zinc-900 border border-zinc-800 tracking-tight">#PRJ-4291</span>
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20 uppercase tracking-wider">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                            Em Produção
                        </div>
                    </div>
                    <h2 className="text-xl md:text-2xl font-bold text-white mb-2 tracking-tight">Nike Summer Run 25</h2>
                    <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-400">
                        <div className="flex items-center gap-2 bg-zinc-900/50 px-2 py-1 rounded border border-zinc-800">
                            <Clock className="w-3 h-3 text-zinc-500" />
                            <span className="font-medium text-zinc-300">12 Fev</span>
                        </div>
                        <div className="flex items-center gap-2 bg-zinc-900/50 px-2 py-1 rounded border border-zinc-800">
                            <Wallet className="w-3 h-3 text-emerald-500" />
                            <span className="font-medium text-emerald-400">R$ 42.000</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <button className="hidden md:flex items-center gap-2 bg-white text-black px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-zinc-200 transition-colors">
                        <Plus className="w-3 h-3" /> Nova Tarefa
                    </button>
                    <div className="flex -space-x-2">
                        <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop" alt="User" className="w-8 h-8 rounded-full border-2 border-[#09090b] ring-2 ring-transparent hover:ring-zinc-700 transition-all cursor-pointer z-30" />
                        <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop" alt="User" className="w-8 h-8 rounded-full border-2 border-[#09090b] ring-2 ring-transparent hover:ring-zinc-700 transition-all cursor-pointer z-20" />
                        <img src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&h=100&fit=crop" alt="User" className="w-8 h-8 rounded-full border-2 border-[#09090b] ring-2 ring-transparent hover:ring-zinc-700 transition-all cursor-pointer z-10" />
                        <div className="w-8 h-8 rounded-full border-2 border-[#09090b] bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-zinc-400 z-0">
                            +2
                        </div>
                    </div>
                </div>
            </div>

            {/* Scrollable Kanban for Mobile, Grid for Desktop */}
            <div
                className="flex-1 overflow-x-auto md:overflow-visible pb-4 md:pb-0 min-h-0 w-full custom-scrollbar"
                style={{ scrollbarGutter: 'stable' }}
            >
                <div className="flex md:grid md:grid-cols-3 gap-4 lg:gap-6 min-w-[300px] h-full">
                    {/* Col 1 */}
                    <div className="flex flex-col gap-3 min-w-[260px]">
                        <div className="flex justify-between items-center px-1">
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-zinc-600" />
                                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">A Fazer (3)</span>
                            </div>
                            <MoreHorizontal className="w-4 h-4 text-zinc-600 cursor-pointer hover:text-zinc-400" />
                        </div>
                        <Card title="Aprovar roteiro final" tag="Roteiro" color="blue" assignees={2} />
                        <Card title="Contratar op. de drone" tag="Equipe" color="purple" assignees={1} />
                        <Card title="Locação Estúdio B" tag="Logística" color="amber" assignees={1} />
                    </div>

                    {/* Col 2 */}
                    <div className="flex flex-col gap-3 min-w-[260px]">
                        <div className="flex justify-between items-center px-1">
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                                <span className="text-[10px] font-bold text-zinc-200 uppercase tracking-wider">Em Produção (1)</span>
                            </div>
                            <MoreHorizontal className="w-4 h-4 text-zinc-600 cursor-pointer hover:text-zinc-400" />
                        </div>
                        <div className="bg-zinc-800/40 p-3 rounded-xl border border-l-2 border-zinc-700/50 border-l-amber-500 shadow-xl backdrop-blur-sm group hover:border-zinc-600 transition-all cursor-pointer">
                            <div className="flex justify-between mb-2">
                                <span className="text-[8px] bg-amber-500/10 text-amber-500 border border-amber-500/20 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">URGENTE</span>
                                <MoreHorizontal className="w-3 h-3 text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <h4 className="text-sm font-semibold text-zinc-200 mb-2 leading-snug">Shooting Dia 1 - Parque Ibirapuera</h4>
                            <div className="w-full bg-zinc-700/50 h-1 rounded-full overflow-hidden mb-2">
                                <div className="bg-amber-500 w-[60%] h-full rounded-full" />
                            </div>
                            <div className="flex justify-between items-center mt-2 pt-2 border-t border-white/5">
                                <div className="text-[10px] text-amber-400 flex items-center gap-1 font-medium bg-amber-500/5 px-1.5 py-0.5 rounded">
                                    <Clock className="w-3 h-3" /> Hoje 14:00
                                </div>
                                <div className="flex -space-x-2 opacity-80">
                                    <img src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&h=100&fit=crop" className="w-5 h-5 rounded-full border border-zinc-900" alt="Avatar" />
                                    <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop" className="w-5 h-5 rounded-full border border-zinc-900" alt="Avatar" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Col 3 */}
                    <div className="flex flex-col gap-3 min-w-[260px] opacity-60 hover:opacity-100 transition-opacity">
                        <div className="flex justify-between items-center px-1">
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Feito (12)</span>
                            </div>
                        </div>
                        <Card title="Pré-produção" tag="Geral" color="emerald" completed assignees={3} />
                        <Card title="Pagamento Entrada" tag="Financeiro" color="emerald" completed assignees={1} />
                        <Card title="Briefing Cliente" tag="Vendas" color="blue" completed assignees={2} />
                    </div>
                </div>
            </div>
        </div>
    )
}

function DashboardView() {
    return (
        <div className="h-full w-full overflow-y-auto p-4 md:p-6 custom-scrollbar" style={{ scrollbarGutter: 'stable' }}>
            <div className="space-y-6 md:space-y-8">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-white tracking-tight">Visão Geral</h2>
                    <div className="hidden md:flex gap-2">
                        <button className="text-xs bg-zinc-800 text-white px-3 py-1.5 rounded-md border border-zinc-700 hover:bg-zinc-700">Hoje</button>
                        <button className="text-xs bg-zinc-900 text-zinc-400 px-3 py-1.5 rounded-md border border-zinc-800 hover:bg-zinc-800">7 dias</button>
                    </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard title="Projetos Ativos" value="4" trend="+1" icon={Film} />
                    <StatCard title="Propostas" value="2" trend="Pendentes" neutral icon={FileText} />
                    <StatCard title="Receita Mês" value="R$ 18.2k" trend="+12%" icon={DollarSign} />
                    <StatCard title="Lucro Líquido" value="32%" trend="Saudável" icon={TrendingUp} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* SVG Chart Area */}
                    <div className="lg:col-span-2 bg-zinc-900/30 p-5 rounded-xl border border-zinc-800 relative group overflow-hidden">
                        <div className="flex justify-between items-center mb-6 relative z-10">
                            <h3 className="text-sm font-semibold text-zinc-300">Receita vs Despesas</h3>
                            <Filter className="w-4 h-4 text-zinc-500 cursor-pointer hover:text-white transition-colors" />
                        </div>

                        <div className="relative h-48 w-full">
                            <svg viewBox="0 0 800 200" className="w-full h-full overflow-visible">
                                <defs>
                                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
                                        <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                                    </linearGradient>
                                </defs>
                                {/* Grid Lines */}
                                {[0, 50, 100, 150].map((y, i) => (
                                    <line key={i} x1="0" y1={y} x2="800" y2={y} stroke="#27272a" strokeWidth="1" strokeDasharray="4 4" />
                                ))}

                                {/* Area Path */}
                                <path
                                    d="M0,150 C100,140 200,80 300,100 S500,40 600,60 S700,20 800,40 L800,200 L0,200 Z"
                                    fill="url(#chartGradient)"
                                />
                                {/* Main Line */}
                                <path
                                    d="M0,150 C100,140 200,80 300,100 S500,40 600,60 S700,20 800,40"
                                    fill="none"
                                    stroke="#10b981"
                                    strokeWidth="3"
                                    strokeLinecap="round"
                                />
                                {/* Expense Line (Dashed) */}
                                <path
                                    d="M0,180 C100,170 200,140 300,160 S500,120 600,130 S700,100 800,110"
                                    fill="none"
                                    stroke="#ef4444"
                                    strokeWidth="2"
                                    strokeDasharray="4 4"
                                    opacity="0.6"
                                />
                                {/* Points */}
                                <circle cx="300" cy="100" r="4" fill="#10b981" className="group-hover:r-6 transition-all" />
                                <circle cx="600" cy="60" r="4" fill="#10b981" className="group-hover:r-6 transition-all" />
                            </svg>

                            {/* Hover Tooltip Simulation */}
                            <div className="absolute top-[30%] left-[37%] bg-zinc-800 text-white text-[10px] px-2 py-1 rounded shadow-xl border border-zinc-700 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity transform -translate-y-2 group-hover:translate-y-0">
                                <span className="font-bold text-emerald-400">R$ 18.2k</span> • 15 Mar
                            </div>
                        </div>

                        <div className="flex justify-between mt-2 text-[10px] text-zinc-600 uppercase font-bold tracking-wider px-2">
                            <span>Jan</span><span>Fev</span><span>Mar</span><span>Abr</span><span>Mai</span><span>Jun</span>
                        </div>
                    </div>

                    <div className="bg-zinc-900/30 p-5 rounded-xl border border-zinc-800">
                        <h3 className="text-sm font-semibold text-zinc-400 mb-4 uppercase tracking-wider">Atividade</h3>
                        <div className="space-y-1">
                            <ActivityRow text="Novo lead: Studio One" time="2m" icon={Users} />
                            <ActivityRow text="Proposta #882 Aprovada" time="1h" highlight icon={CheckCircle2} />
                            <ActivityRow text="Devolução: Câmera A " time="3h" icon={Camera} />
                            <ActivityRow text="Fatura Paga: Nike" time="5h" icon={DollarSign} positive />
                            <ActivityRow text="Novo Comentário" time="6h" icon={MoreHorizontal} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

function FinanceiroView() {
    return (
        <div className="h-full w-full overflow-y-auto p-4 md:p-6 custom-scrollbar" style={{ scrollbarGutter: 'stable' }}>
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold text-white">Fluxo de Caixa</h2>
                <button className="bg-emerald-500 text-black text-xs font-bold px-4 py-2 rounded-lg hover:bg-emerald-400 transition-colors">
                    Nova Transação
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <div className="bg-zinc-900/40 p-6 rounded-xl border border-zinc-800 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <ArrowUpRight className="w-24 h-24 text-emerald-500" />
                    </div>
                    <div className="text-xs text-zinc-500 mb-2 uppercase tracking-wider font-bold">Entradas (Fev)</div>
                    <div className="text-3xl font-bold text-white mb-2">R$ 42.500,00</div>
                    <div className="text-xs text-emerald-400 font-medium bg-emerald-500/10 inline-block px-2 py-1 rounded border border-emerald-500/20">
                        + 12% vs mês anterior
                    </div>
                </div>
                <div className="bg-zinc-900/40 p-6 rounded-xl border border-zinc-800 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <ArrowDownRight className="w-24 h-24 text-red-500" />
                    </div>
                    <div className="text-xs text-zinc-500 mb-2 uppercase tracking-wider font-bold">Saídas (Fev)</div>
                    <div className="text-3xl font-bold text-white mb-2">R$ 12.450,00</div>
                    <div className="text-xs text-zinc-500 font-medium bg-zinc-800 inline-block px-2 py-1 rounded">
                        Previsto: R$ 15k
                    </div>
                </div>
            </div>

            <div className="flex-1 bg-zinc-900/20 rounded-xl border border-zinc-800/50 p-4 overflow-hidden">
                <div className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-4">Últimas Movimentações</div>
                <div className="space-y-2">
                    <TransactionRow title="Pagamento: Campanha Nike" category="Receita" value="+ R$ 21.000" date="Hoje" type="in" />
                    <TransactionRow title="Locação: Lente 24-70mm" category="Equipamento" value="- R$ 350" date="Ontem" type="out" />
                    <TransactionRow title="Freelancer: Editor Senior" category="Serviços" value="- R$ 1.200" date="12 Fev" type="pending" />
                    <TransactionRow title="Spotify Assinatura" category="Software" value="- R$ 29,90" date="10 Fev" type="out" />
                </div>
            </div>
        </div>
    )
}

function InventoryView() {
    return (
        <div className="h-full w-full overflow-y-auto p-4 md:p-6 custom-scrollbar" style={{ scrollbarGutter: 'stable' }}>
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-white">Inventário</h2>
                        <p className="text-zinc-500 text-sm">Gerencie equipamentos próprios e alugados.</p>
                    </div>
                    <div className="flex gap-2">
                        <button className="text-xs bg-zinc-800 text-zinc-300 px-3 py-2 rounded-lg font-bold hover:bg-zinc-700 border border-zinc-700">QR Code</button>
                        <button className="text-xs bg-white text-black px-3 py-2 rounded-lg font-bold hover:bg-zinc-200">Novo Item</button>
                    </div>
                </div>

                <div className="grid gap-3">
                    {[
                        { name: 'Sony A7S III', cat: 'Câmera', status: 'available', image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=100&h=100&fit=crop' },
                        { name: 'Lente 24-70mm GM', cat: 'Lente', status: 'rented', image: 'https://images.unsplash.com/photo-1617005082133-548c4dd27f35?w=100&h=100&fit=crop', project: 'Nike Run' },
                        { name: 'Drone Mavic 3', cat: 'Drone', status: 'maintenance', image: 'https://images.unsplash.com/photo-1473960104312-bf233a02c68a?w=100&h=100&fit=crop' },
                        { name: 'Aputure 300d', cat: 'Iluminação', status: 'available', image: 'https://images.unsplash.com/photo-1540339832862-474559135934?w=100&h=100&fit=crop' },
                        { name: 'Macbook Pro M3', cat: 'Computador', status: 'available', image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca4?w=100&h=100&fit=crop' },
                    ].map((item, i) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-zinc-900/30 border border-zinc-800 rounded-lg hover:border-zinc-700 transition-colors group">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-zinc-700">
                                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                </div>
                                <div>
                                    <div className="text-sm font-bold text-zinc-200">{item.name}</div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] text-zinc-500 uppercase tracking-wider">{item.cat}</span>
                                        <span className="text-[10px] text-zinc-600">•</span>
                                        <span className="text-[10px] text-zinc-500">ID: #EQ-{8020 + i}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className={`text-[10px] px-2 py-1 rounded font-bold uppercase tracking-wider inline-flex items-center gap-1.5 ${item.status === 'rented' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                                    item.status === 'maintenance' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                                        'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                                    }`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${item.status === 'rented' ? 'bg-amber-500' :
                                        item.status === 'maintenance' ? 'bg-red-500' :
                                            'bg-emerald-500'
                                        }`} />
                                    {item.status === 'rented' ? 'Em Uso' : item.status === 'maintenance' ? 'Manutenção' : 'Disponível'}
                                </div>
                                {item.project && <div className="text-[10px] text-zinc-500 mt-1">Projeto: {item.project}</div>}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

function ProposalsView() {
    return (
        <div className="flex flex-col h-full w-full justify-center items-center text-center p-6 overflow-y-auto custom-scrollbar" style={{ scrollbarGutter: 'stable' }}>
            <div className="w-20 h-20 bg-zinc-800/50 rounded-2xl flex items-center justify-center mb-6 border border-zinc-800 shadow-2xl skew-y-3">
                <FileText className="w-10 h-10 text-zinc-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">Editor de Propostas</h3>
            <p className="text-zinc-400 max-w-sm text-sm leading-relaxed mb-8">
                Crie propostas visuais que encantam. Arraste blocos de vídeo, orçamento e cronograma.
                Seus clientes aceitam com um clique.
            </p>

            <div className="grid grid-cols-3 gap-4 w-full max-w-md opacity-40 hover:opacity-60 transition-opacity">
                <div className="aspect-[3/4] bg-zinc-800 rounded-lg border border-zinc-700 shadow-lg transform -rotate-6 scale-90" />
                <div className="aspect-[3/4] bg-zinc-800 rounded-lg border border-zinc-700 shadow-2xl ring-2 ring-emerald-500/30 z-10" />
                <div className="aspect-[3/4] bg-zinc-800 rounded-lg border border-zinc-700 shadow-lg transform rotate-6 scale-90" />
            </div>
        </div>
    )
}

// --- Helpers ---

function Card({ title, tag, color, completed, assignees = 2 }: any) {
    const colors: any = {
        blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
        purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
        emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        amber: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    }

    // Fake avatars
    const avatars = [
        'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&h=100&fit=crop',
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop'
    ]

    return (
        <div className={`bg-zinc-800/40 p-3 rounded-xl border border-zinc-700/50 hover:border-zinc-500 transition-all cursor-pointer group ${completed ? 'opacity-60 hover:opacity-100' : ''}`}>
            <div className="flex justify-between mb-2">
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold border uppercase tracking-wider ${colors[color] || colors.blue}`}>{tag}</span>
                {completed && <CheckCircle2 className="w-3 h-3 text-emerald-500" />}
            </div>
            <h4 className={`text-sm font-semibold text-zinc-200 mb-3 leading-snug group-hover:text-white ${completed ? 'line-through text-zinc-500' : ''}`}>
                {title}
            </h4>
            <div className="flex justify-between items-center">
                <div className="flex -space-x-2">
                    {[...Array(assignees)].map((_, i) => (
                        <img
                            key={i}
                            src={avatars[i % avatars.length]}
                            className="w-5 h-5 rounded-full border border-zinc-900 object-cover"
                            alt="Avatar"
                        />
                    ))}
                </div>
                {!completed && <div className="text-[10px] text-zinc-500 bg-zinc-900/50 px-1.5 py-0.5 rounded border border-zinc-800 opacity-0 group-hover:opacity-100 transition-opacity">
                    12 Fev
                </div>}
            </div>
        </div>
    )
}

function StatCard({ title, value, trend, neutral, icon: Icon }: any) {
    return (
        <div className="bg-zinc-900/30 p-4 rounded-xl border border-zinc-800 hover:border-zinc-700 transition-colors group">
            <div className="flex justify-between items-start mb-2">
                <div className="text-xs text-zinc-500 font-medium">{title}</div>
                {Icon && <Icon className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400 transition-colors" />}
            </div>
            <div className="flex items-end justify-between">
                <div className="text-xl font-bold text-white tracking-tight">{value}</div>
                <div className={`text-[10px] px-1.5 py-0.5 rounded font-bold bg-zinc-900 ${neutral ? 'text-zinc-500' : 'text-emerald-400 bg-emerald-500/10'}`}>{trend}</div>
            </div>
        </div>
    )
}

function ActivityRow({ text, time, highlight, positive, icon: Icon }: any) {
    return (
        <div className={`flex items-center gap-3 p-2.5 rounded-lg transition-colors ${highlight ? 'bg-emerald-500/5 border border-emerald-500/10' : 'hover:bg-white/5'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${highlight ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' :
                positive ? 'bg-emerald-900/20 border-emerald-900/50 text-emerald-500' :
                    'bg-zinc-800 border-zinc-700 text-zinc-400'
                }`}>
                {Icon ? <Icon className="w-4 h-4" /> : <div className="w-2 h-2 bg-current rounded-full" />}
            </div>
            <div className="flex-1 min-w-0">
                <div className={`text-xs font-medium truncate ${highlight ? 'text-emerald-200' : 'text-zinc-300'}`}>{text}</div>
            </div>
            <div className="text-[10px] text-zinc-600 font-mono">{time}</div>
        </div>
    )
}

function TransactionRow({ title, category, value, date, type }: any) {
    return (
        <div className="flex items-center justify-between p-2.5 rounded-lg hover:bg-zinc-900/50 transition-colors group">
            <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${type === 'in' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' :
                    type === 'pending' ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' :
                        'bg-zinc-800 border-zinc-700 text-zinc-400'
                    }`}>
                    <DollarSign className="w-4 h-4" />
                </div>
                <div>
                    <div className="text-xs font-bold text-zinc-200">{title}</div>
                    <div className="text-[10px] text-zinc-500">{category} • {date}</div>
                </div>
            </div>
            <div className={`text-xs font-bold text-right ${type === 'in' ? 'text-emerald-400' :
                type === 'pending' ? 'text-amber-500' :
                    'text-zinc-400'
                }`}>
                {value}
                {type === 'pending' && <div className="text-[8px] font-normal opacity-70">Pendente</div>}
            </div>
        </div>
    )
}
