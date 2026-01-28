'use client';

import { useState, useRef, useEffect } from 'react';
import { useChat } from 'ai/react';
import { Message } from 'ai';
import { AnimatePresence, motion } from 'framer-motion';
import { Bot, X, Send, Sparkles, ChevronDown, Eraser, Loader2, Play } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export function AIChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const { messages, append, isLoading, stop, setMessages } = useChat({
        api: '/api/chat',
    });

    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isLoading]);

    const handleClear = () => {
        setMessages([]);
    };

    const handleFormSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!inputValue.trim()) return;

        const value = inputValue;
        setInputValue(''); // Optimistic clear

        await append({
            role: 'user',
            content: value,
        });
    };

    const handleSuggestionClick = (suggestion: string) => {
        setInputValue('');
        append({
            role: 'user',
            content: suggestion,
        });
    };

    return (
        <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end pointer-events-none font-sans">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95, filter: "blur(10px)" }}
                        animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                        exit={{ opacity: 0, y: 20, scale: 0.95, filter: "blur(10px)" }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="mb-4 pointer-events-auto origin-bottom-right"
                    >
                        <Card className="w-[400px] h-[650px] shadow-2xl border-white/10 bg-zinc-950/90 backdrop-blur-xl supports-[backdrop-filter]:bg-zinc-950/80 flex flex-col overflow-hidden rounded-[2rem] ring-1 ring-white/5 relative">
                            {/* Decorative Glows */}
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-primary/20 rounded-full blur-[80px] pointer-events-none" />
                            <div className="absolute bottom-0 right-0 w-40 h-40 bg-violet-500/10 rounded-full blur-[80px] pointer-events-none" />

                            {/* Header */}
                            <CardHeader className="p-5 border-b border-white/5 bg-white/5 backdrop-blur-md flex flex-row items-center justify-between space-y-0 z-10">
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <div className="bg-gradient-to-tr from-indigo-500 to-violet-500 p-2.5 rounded-xl shadow-lg shadow-indigo-500/20">
                                            <Sparkles className="h-4 w-4 text-white" />
                                        </div>
                                        <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-zinc-950 rounded-full animate-pulse" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-sm font-semibold text-white tracking-wide">Zooming AI</CardTitle>
                                        <p className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider">Conectado ao CRM</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                                        onClick={handleClear}
                                        title="Limpar conversa"
                                    >
                                        <Eraser className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardHeader>

                            {/* Chat Area */}
                            <CardContent className="flex-1 p-0 overflow-hidden relative z-10">
                                <div
                                    ref={scrollRef}
                                    className="h-full overflow-y-auto p-5 space-y-6 scroll-smooth scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent"
                                >
                                    {messages.length === 0 && (
                                        <div className="h-full flex flex-col items-center justify-center text-center p-6 text-zinc-500">
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.2 }}
                                                className="mb-6 relative"
                                            >
                                                <div className="w-16 h-16 bg-gradient-to-tr from-zinc-800 to-zinc-900 rounded-2xl flex items-center justify-center border border-white/5 shadow-inner">
                                                    <Bot className="h-8 w-8 text-zinc-400" />
                                                </div>
                                                <div className="absolute -inset-4 bg-primary/20 blur-xl -z-10 rounded-full opacity-50" />
                                            </motion.div>

                                            <h3 className="text-zinc-200 font-medium mb-1">Como posso ajudar hoje?</h3>
                                            <p className="text-xs text-zinc-500 max-w-[200px] leading-relaxed mb-8">
                                                Analiso dados, gerencio projetos e agendo compromissos.
                                            </p>

                                            <div className="grid grid-cols-1 gap-2 w-full max-w-[260px]">
                                                {[
                                                    "💰 Qual o resumo financeiro?",
                                                    "⚠️ Liste projetos atrasados",
                                                    "📅 Tenho reuniões hoje?"
                                                ].map((text, i) => (
                                                    <motion.button
                                                        key={i}
                                                        initial={{ opacity: 0, x: -10 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: 0.3 + (i * 0.1) }}
                                                        onClick={() => handleSuggestionClick(text.replace(/^[^\wÀ-ú]+/, ""))} // Remove emoji for query
                                                        className="group flex items-center gap-3 w-full p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 transition-all text-xs text-zinc-300 text-left"
                                                    >
                                                        <span className="opacity-70 group-hover:opacity-100 transition-opacity">{text.split(" ")[0]}</span>
                                                        <span className="font-medium">{text.substring(text.indexOf(" ") + 1)}</span>
                                                        <Play className="h-2 w-2 ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-primary" fill="currentColor" />
                                                    </motion.button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {messages.map((m: Message) => (
                                        <motion.div
                                            key={m.id}
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            className={cn(
                                                "flex w-full",
                                                m.role === 'user' ? "justify-end" : "justify-start"
                                            )}
                                        >
                                            <div
                                                className={cn(
                                                    "max-w-[85%] rounded-[1.25rem] px-5 py-3.5 text-sm shadow-sm relative overflow-hidden",
                                                    m.role === 'user'
                                                        ? "bg-blue-600 text-white rounded-br-none shadow-[0_0_15px_rgba(37,99,235,0.3)]"
                                                        : "bg-zinc-800/80 backdrop-blur-md text-zinc-100 rounded-bl-none border border-white/5 shadow-inner"
                                                )}
                                            >
                                                {/* Markdown Rendering for AI */}
                                                {m.role === 'assistant' ? (
                                                    <div className="prose prose-sm prose-invert max-w-none text-zinc-100">
                                                        {m.content.length > 0 ? (
                                                            <ReactMarkdown
                                                                remarkPlugins={[remarkGfm]}
                                                                components={{
                                                                    // Custom Premium Table Styling
                                                                    table: ({ node, ...props }) => (
                                                                        <div className="my-4 w-full overflow-hidden rounded-xl border border-white/10 bg-zinc-900/50 shadow-sm">
                                                                            <table className="w-full text-sm text-left" {...props} />
                                                                        </div>
                                                                    ),
                                                                    thead: ({ node, ...props }) => (
                                                                        <thead className="bg-white/5 text-xs uppercase tracking-wider text-zinc-400 font-medium" {...props} />
                                                                    ),
                                                                    th: ({ node, ...props }) => (
                                                                        <th className="px-4 py-3 border-b border-white/10" {...props} />
                                                                    ),
                                                                    tr: ({ node, ...props }) => (
                                                                        <tr className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors" {...props} />
                                                                    ),
                                                                    td: ({ node, ...props }) => (
                                                                        <td className="px-4 py-3 align-top text-zinc-300" {...props} />
                                                                    ),
                                                                    // Styling Highlights
                                                                    strong: ({ node, ...props }) => (
                                                                        <strong className="font-bold text-white" {...props} />
                                                                    ),
                                                                    a: ({ node, ...props }) => (
                                                                        <a className="text-blue-400 hover:text-blue-300 underline underline-offset-4" {...props} />
                                                                    ),
                                                                    p: ({ node, ...props }) => (
                                                                        <p className="leading-relaxed mb-2 last:mb-0" {...props} />
                                                                    ),
                                                                    ul: ({ node, ...props }) => (
                                                                        <ul className="list-disc pl-4 space-y-1 mb-4 text-zinc-300" {...props} />
                                                                    ),
                                                                }}
                                                            >
                                                                {m.content}
                                                            </ReactMarkdown>
                                                        ) : (
                                                            <div className="flex items-center gap-2 text-zinc-400">
                                                                <Loader2 className="h-3 w-3 animate-spin text-blue-500" />
                                                                <span className="text-xs font-medium animate-pulse">Processando...</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="whitespace-pre-wrap relative z-10 font-medium tracking-wide">{m.content}</div>
                                                )}
                                            </div>
                                        </motion.div>
                                    ))}

                                    {/* Loading State */}
                                    {isLoading && messages[messages.length - 1]?.role === 'user' && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="flex justify-start w-full"
                                        >
                                            <div className="bg-zinc-900/50 rounded-2xl rounded-bl-none px-4 py-3 border border-white/10 flex items-center gap-3">
                                                <div className="flex gap-1">
                                                    <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1, repeat: Infinity }} className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
                                                    <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1, repeat: Infinity, delay: 0.2 }} className="w-1.5 h-1.5 bg-indigo-400 rounded-full" />
                                                    <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1, repeat: Infinity, delay: 0.4 }} className="w-1.5 h-1.5 bg-indigo-300 rounded-full" />
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </div>
                            </CardContent>

                            {/* Footer Input */}
                            <CardFooter className="p-4 border-t border-white/5 bg-zinc-900/30 backdrop-blur-md relative z-10">
                                <form
                                    onSubmit={handleFormSubmit}
                                    className="flex w-full items-end gap-2 bg-zinc-950/50 border border-white/10 p-1.5 rounded-[1.25rem] focus-within:ring-2 focus-within:ring-primary/50 focus-within:border-primary/50 transition-all shadow-lg"
                                >
                                    <Input
                                        value={inputValue}
                                        onChange={(e) => setInputValue(e.target.value)}
                                        placeholder="Digite sua mensagem..."
                                        className="flex-1 min-h-[44px] bg-transparent border-0 focus-visible:ring-0 text-zinc-100 placeholder:text-zinc-500 px-4 py-3"
                                        autoFocus
                                    />
                                    <Button
                                        type="submit"
                                        size="icon"
                                        disabled={isLoading || !inputValue.trim()}
                                        className={cn(
                                            "h-10 w-10 rounded-full transition-all duration-300 shadow-md",
                                            inputValue.trim()
                                                ? "bg-indigo-600 hover:bg-indigo-500 text-white"
                                                : "bg-zinc-800 text-zinc-500"
                                        )}
                                    >
                                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                                    </Button>
                                </form>
                            </CardFooter>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative group"
            >
                {/* Subtle Breathing Glow Layer */}
                <motion.div
                    animate={{ opacity: [0.2, 0.5, 0.2], scale: [0.8, 1.1, 0.8] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    className={cn(
                        "absolute inset-0 rounded-full blur-xl -z-10 transition-colors duration-500",
                        isOpen ? "bg-red-500/20" : "bg-indigo-500/30"
                    )}
                />

                <Button
                    onClick={() => setIsOpen(!isOpen)}
                    size="lg"
                    className={cn(
                        "h-14 w-14 rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.1)] transition-all duration-500 pointer-events-auto border relative overflow-hidden",
                        isOpen
                            ? "bg-zinc-950 text-white border-white/10"
                            : "bg-white/90 backdrop-blur-md text-zinc-800 border-white/20 hover:bg-white"
                    )}
                >
                    <AnimatePresence mode="wait">
                        {isOpen ? (
                            <motion.div
                                key="close"
                                initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
                                animate={{ rotate: 0, opacity: 1, scale: 1 }}
                                exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
                                transition={{ duration: 0.2 }}
                                className="relative z-10"
                            >
                                <ChevronDown className="h-6 w-6 text-zinc-400" />
                            </motion.div>
                        ) : (
                            <motion.div
                                key="open"
                                initial={{ scale: 0.5, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.5, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="relative z-10 flex items-center justify-center"
                            >
                                {/* Animated Star Icon */}
                                <motion.div
                                    animate={{ rotate: [0, 45, 0] }}
                                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                                >
                                    <Sparkles strokeWidth={2} className="h-6 w-6 text-indigo-600 fill-indigo-100" />
                                </motion.div>

                                {/* Orbital Dot */}
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                                    className="absolute w-full h-full"
                                >
                                    <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full blur-[0.5px] absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 opacity-80" />
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </Button>
            </motion.div>
        </div>
    );
}
