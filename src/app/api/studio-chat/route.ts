import OpenAI from 'openai';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import { OpenAIStream, StreamingTextResponse } from 'ai';
import { createClient, getUserOrganization } from '@/lib/supabase/server';
import { getStudioToolsDefinitions, executeStudioTool } from '@/lib/ai/studio-tools';
import { buildStudioSystemMessage } from '@/lib/ai/studio-prompts';
import { isWriteTool, logToolCall } from '@/lib/ai/tool-safety';
import { z } from 'zod';
import { checkRateLimit, getRequestIdentifier, rateLimitResponse } from '@/lib/security/rate-limit';

export const maxDuration = 60;

function getOpenAI() {
    return new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
    });
}

const messageSchema = z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string().max(10000, 'Mensagem excede o limite de 10.000 caracteres').optional().nullable(),
});

const chatRequestSchema = z.object({
    messages: z
        .array(messageSchema)
        .min(1, 'Pelo menos uma mensagem é necessária')
        .max(50, 'Limite de 50 mensagens por requisição'),
    context: z.object({
        scriptId: z.string().optional(),
        scriptTitle: z.string().optional(),
        scenesCount: z.number().optional(),
    }).optional(),
});

export async function POST(req: Request) {
    try {
        // 1. Auth & Context
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return new Response('Unauthorized', { status: 401 });

        // Rate limit: 10 req/min por usuário
        const rlKey = getRequestIdentifier(req, user.id);
        const rl = checkRateLimit(rlKey, { limit: 10, windowSeconds: 60 });
        if (!rl.success) return rateLimitResponse(rl.retryAfter);

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
                JSON.stringify({ error: 'Corpo da requisição inválido' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } },
            );
        }

        const validation = chatRequestSchema.safeParse(body);
        if (!validation.success) {
            return new Response(
                JSON.stringify({
                    error: 'Dados de entrada inválidos',
                    details: validation.error.issues.map((i) => i.message),
                }),
                { status: 422, headers: { 'Content-Type': 'application/json' } },
            );
        }

        const messages = validation.data.messages as ChatCompletionMessageParam[];
        const context = validation.data.context;

        // 3. Build system message with context
        const systemMessage = buildStudioSystemMessage({
            scriptId: context?.scriptId,
            scriptTitle: context?.scriptTitle,
            scenesCount: context?.scenesCount,
        });

        // 4. Call OpenAI
        const openai = getOpenAI();
        const response = await openai.chat.completions.create({
            model: 'gpt-4o',
            stream: true,
            messages: [
                { role: 'system', content: systemMessage },
                ...messages,
            ],
            functions: getStudioToolsDefinitions(),
            function_call: 'auto',
        });

        // 5. Streaming with Function Calling support
        const stream = OpenAIStream(response as any, {
            experimental_onFunctionCall: async (
                { name, arguments: args },
                createFunctionCallMessages
            ) => {
                // Log de seguranca para tools de escrita
                if (isWriteTool(name)) {
                    logToolCall({ tool: name, args, userId: user.id, orgId: organizationId });
                }

                const result = await executeStudioTool(
                    name,
                    args,
                    supabase,
                    organizationId,
                    user.id
                );

                const newMessages = createFunctionCallMessages(result);

                return openai.chat.completions.create({
                    model: 'gpt-4o',
                    stream: true,
                    messages: [
                        { role: 'system', content: systemMessage },
                        ...messages,
                        ...(newMessages as ChatCompletionMessageParam[]),
                    ],
                    functions: getStudioToolsDefinitions(),
                }) as any;
            },
        });

        return new StreamingTextResponse(stream);

    } catch (error: any) {
        console.error('Studio AI Error:', {
            message: error?.message,
            code: error?.code,
            status: error?.status,
            stack: error?.stack?.split('\n').slice(0, 5).join('\n'),
        });
        return new Response(
            JSON.stringify({ error: 'Erro interno no assistente do Studio. Tente novamente.' }),
            {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            },
        );
    }
}
