import OpenAI from 'openai';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import { OpenAIStream, StreamingTextResponse } from 'ai';
import { createClient, getUserOrganization } from '@/lib/supabase/server';
import { getToolsDefinitions, executeTool } from '@/lib/ai/tools';
import { SYSTEM_PROMPT } from '@/lib/ai/prompts';
import { z } from 'zod';

export const maxDuration = 60;

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// --- Input validation schema ---
const messageSchema = z.object({
    role: z.enum(['user', 'assistant', 'system', 'function']),
    content: z.string().max(10000, 'Mensagem excede o limite de 10.000 caracteres').optional().nullable(),
    name: z.string().optional(),
    function_call: z.any().optional(),
});

const chatRequestSchema = z.object({
    messages: z
        .array(messageSchema)
        .min(1, 'Pelo menos uma mensagem e necessaria')
        .max(50, 'Limite de 50 mensagens por requisicao'),
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

        // 2. Parse and validate body
        let body: unknown;
        try {
            body = await req.json();
        } catch {
            return new Response(
                JSON.stringify({ error: 'Corpo da requisicao invalido' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } },
            );
        }

        const validation = chatRequestSchema.safeParse(body);
        if (!validation.success) {
            return new Response(
                JSON.stringify({
                    error: 'Dados de entrada invalidos',
                    details: validation.error.issues.map((i) => i.message),
                }),
                { status: 422, headers: { 'Content-Type': 'application/json' } },
            );
        }

        // Cast validated messages to OpenAI's discriminated union type.
        // The Zod schema already constrains role to valid values; the cast
        // bridges the structural gap between Zod's inferred type and OpenAI's
        // branded ChatCompletionMessageParam union.
        const messages = validation.data.messages as ChatCompletionMessageParam[];

        // 3. Primeira Chamada para OpenAI
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

        // 4. Streaming com Suporte a Functions (Tool Calling Manual)
        const stream = OpenAIStream(response as any, {
            experimental_onFunctionCall: async (
                { name, arguments: args },
                createFunctionCallMessages
            ) => {
                const result = await executeTool(name, args, supabase, organizationId);

                const newMessages = createFunctionCallMessages(result);

                return openai.chat.completions.create({
                    model: 'gpt-4o',
                    stream: true,
                    messages: [
                        {
                            role: 'system',
                            content: `${SYSTEM_PROMPT}\n\nDATA ATUAL: ${new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}. Use esta data como referência absoluta para "hoje".`
                        },
                        ...messages,
                        ...(newMessages as ChatCompletionMessageParam[])
                    ],
                    functions: getToolsDefinitions(),
                }) as any;
            },
        });

        return new StreamingTextResponse(stream);

    } catch (error: any) {
        // Sanitize: never leak internal error details to the client
        console.error('AI Error:', error);
        return new Response(
            JSON.stringify({ error: 'Erro interno no assistente. Tente novamente.' }),
            {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            },
        );
    }
}
