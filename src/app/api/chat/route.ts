import OpenAI from 'openai';
import { OpenAIStream, StreamingTextResponse } from 'ai';
import { createClient, getUserOrganization } from '@/lib/supabase/server';
import { getToolsDefinitions, executeTool } from '@/lib/ai/tools';
import { SYSTEM_PROMPT } from '@/lib/ai/prompts';

export const maxDuration = 60;
// Desabilitar body parser padrão se necessário, mas em App Router geralmente não precisa.

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
    try {
        // 1. Auth & Context
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return new Response('Unauthorized', { status: 401 });

        let organizationId = '';
        try {
            organizationId = await getUserOrganization();
        } catch {
            return new Response('No Org Context', { status: 403 });
        }

        const { messages } = await req.json();

        // 2. Primeira Chamada para OpenAI
        const response = await openai.chat.completions.create({
            model: 'gpt-4o',
            stream: true,
            messages: [
                {
                    role: 'system',
                    content: `${SYSTEM_PROMPT}\n\nDATA ATUAL: ${new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}. Use esta data como referência absoluta para "hoje".`
                },
                ...messages
            ],
            functions: getToolsDefinitions(),
            function_call: 'auto',
        });

        // 3. Streaming com Suporte a Functions (Tool Calling Manual)
        const stream = OpenAIStream(response as any, {
            experimental_onFunctionCall: async (
                { name, arguments: args },
                createFunctionCallMessages
            ) => {
                // Callback quando a IA decide chamar uma função
                const result = await executeTool(name, args, supabase, organizationId);

                // Injeta o resultado da função de volta no histórico
                const newMessages = createFunctionCallMessages(result);

                // Faz a segunda chamada para a IA gerar a resposta final
                return openai.chat.completions.create({
                    model: 'gpt-4o',
                    stream: true,
                    messages: [
                        {
                            role: 'system',
                            content: `${SYSTEM_PROMPT}\n\nDATA ATUAL: ${new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}. Use esta data como referência absoluta para "hoje".`
                        },
                        ...messages,
                        ...newMessages
                    ],
                    functions: getToolsDefinitions(),
                }) as any;
            },
        });

        return new StreamingTextResponse(stream);

    } catch (error: any) {
        console.error('AI Error:', error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
