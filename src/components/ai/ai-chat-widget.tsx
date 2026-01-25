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
        <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end pointer-events-none">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="mb-4 pointer-events-auto origin-bottom-right"
                    >
                        <Card className="w-[380px] h-[600px] shadow-2xl border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 flex flex-col overflow-hidden">
                            {/* Header */}
                            <CardHeader className="p-4 border-b bg-muted/30 flex flex-row items-center justify-between space-y-0">
                                <div className="flex items-center gap-2">
                                    <div className="bg-primary/10 p-2 rounded-full">
                                        <Sparkles className="h-4 w-4 text-primary" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-sm font-medium">Zooming AI</CardTitle>
                                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                            Online • Conectado ao CRM
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleClear} title="Limpar conversa">
                                        <Eraser className="h-4 w-4 text-muted-foreground" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setIsOpen(false)}>
                                        <X className="h-4 w-4 text-muted-foreground" />
                                    </Button>
                                </div>
                            </CardHeader>

                            {/* Chat Area */}
                            <CardContent className="flex-1 p-0 overflow-hidden relative">
                                <div
                                    ref={scrollRef}
                                    className="h-full overflow-y-auto p-4 space-y-4 scroll-smooth"
                                >
                                    {messages.length === 0 && (
                                        <div className="h-full flex flex-col items-center justify-center text-center p-6 text-muted-foreground opacity-60">
                                            <Bot className="h-12 w-12 mb-3 text-primary/50" />
                                            <p className="text-sm font-medium">Como posso ajudar hoje?</p>
                                            <p className="text-xs mt-1">Busque projetos, verifique o financeiro ou consulte freelancers.</p>

                                            <div className="mt-6 grid grid-cols-1 gap-2 w-full">
                                                <Button
                                                    variant="secondary"
                                                    size="sm"
                                                    className="text-xs justify-start h-auto py-2 whitespace-normal text-left"
                                                    onClick={() => handleSuggestionClick("Qual o resumo financeiro deste mês?")}
                                                >
                                                    "Qual o resumo financeiro deste mês?"
                                                </Button>
                                                <Button
                                                    variant="secondary"
                                                    size="sm"
                                                    className="text-xs justify-start h-auto py-2 whitespace-normal text-left"
                                                    onClick={() => handleSuggestionClick("Liste os projetos em atraso")}
                                                >
                                                    "Liste os projetos em atraso"
                                                </Button>
                                            </div>
                                        </div>
                                    )}

                                    {messages.map((m: Message) => (
                                        <div
                                            key={m.id}
                                            className={cn(
                                                "flex w-full mb-4",
                                                m.role === 'user' ? "justify-end" : "justify-start"
                                            )}
                                        >
                                            <div
                                                className={cn(
                                                    "max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm",
                                                    m.role === 'user'
                                                        ? "bg-primary text-primary-foreground rounded-br-none"
                                                        : "bg-muted text-foreground rounded-bl-none border border-border/50"
                                                )}
                                            >
                                                {/* Markdown Rendering for AI */}
                                                {m.role === 'assistant' ? (
                                                    <div className="prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-background/50">
                                                        {m.content.length > 0 ? (
                                                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                                {m.content}
                                                            </ReactMarkdown>
                                                        ) : (
                                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                                <Loader2 className="h-3 w-3 animate-spin" />
                                                                <span className="text-xs">Consultando dados...</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="whitespace-pre-wrap">{m.content}</div>
                                                )}
                                            </div>
                                        </div>
                                    ))}

                                    {/* Loading State */}
                                    {isLoading && messages[messages.length - 1]?.role === 'user' && (
                                        <div className="flex justify-start w-full">
                                            <div className="bg-muted rounded-2xl rounded-bl-none px-4 py-3 border border-border/50 flex items-center gap-2">
                                                <Loader2 className="h-3 w-3 animate-spin text-primary" />
                                                <span className="text-xs text-muted-foreground">Analisando...</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>

                            {/* Footer Input */}
                            <CardFooter className="p-3 border-t bg-background">
                                <form
                                    onSubmit={handleFormSubmit}
                                    className="flex w-full items-center gap-2"
                                >
                                    <Input
                                        value={inputValue}
                                        onChange={(e) => setInputValue(e.target.value)}
                                        placeholder="Pergunte sobre seus projetos..."
                                        className="flex-1 min-h-[44px] bg-muted/40 border-0 focus-visible:ring-1 focus-visible:ring-primary focus-visible:bg-background transition-colors"
                                    />
                                    <Button
                                        type="submit"
                                        size="icon"
                                        disabled={isLoading || !inputValue.trim()}
                                        className={cn(
                                            "transition-all duration-200",
                                            inputValue.trim() ? "opacity-100" : "opacity-50"
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

            <Button
                onClick={() => setIsOpen(!isOpen)}
                size="lg"
                className={cn(
                    "h-14 w-14 rounded-2xl shadow-xl transition-all duration-300 pointer-events-auto hover:scale-105 hover-lift ring-2 ring-white/10",
                    isOpen ? "bg-zinc-800 text-white" : "bg-gradient-to-br from-zinc-100 to-zinc-400 text-black"
                )}
            >
                <AnimatePresence mode="wait">
                    {isOpen ? (
                        <motion.div
                            key="close"
                            initial={{ rotate: -90, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            exit={{ rotate: 90, opacity: 0 }}
                        >
                            <ChevronDown className="h-6 w-6" />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="open"
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.5, opacity: 0 }}
                            className="relative"
                        >
                            <Play className="h-6 w-6 ml-0.5 drop-shadow-sm" fill="currentColor" />
                            <motion.div
                                animate={{ opacity: [0.5, 1, 0.5], scale: [1, 1.1, 1] }}
                                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                className="absolute -top-2.5 -right-2.5 bg-white rounded-full p-0.5 shadow-sm"
                            >
                                <Sparkles className="h-3 w-3 text-indigo-600" fill="currentColor" />
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </Button>
        </div>
    );
}
