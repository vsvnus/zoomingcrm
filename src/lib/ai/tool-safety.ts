import { z, ZodSchema } from 'zod';

// ============================================
// WRITE TOOLS: Set de tools que modificam dados
// ============================================

export const WRITE_TOOLS = new Set([
    // Chat principal (tools.ts)
    'update_proposal_status',
    'schedule_calendar_event',
    'memorize_fact',
    // Studio (studio-tools.ts)
    'studio_create_script',
    'studio_create_scenes_batch',
    'studio_update_script',
    'studio_update_scene',
    'studio_delete_scenes',
]);

/**
 * Verifica se uma tool modifica dados (INSERT/UPDATE/DELETE).
 */
export function isWriteTool(name: string): boolean {
    return WRITE_TOOLS.has(name);
}

// ============================================
// Zod Schemas para validacao de argumentos
// ============================================

const updateProposalStatusSchema = z.object({
    proposalId: z.string().uuid('proposalId deve ser um UUID valido'),
    status: z.enum(['DRAFT', 'SENT', 'ACCEPTED', 'REJECTED']),
    notes: z.string().max(2000).optional(),
});

const scheduleCalendarEventSchema = z.object({
    title: z.string().min(1, 'Titulo e obrigatorio').max(200),
    description: z.string().max(2000).optional(),
    startDate: z.string().min(1, 'Data de inicio e obrigatoria'),
    endDate: z.string().min(1, 'Data de termino e obrigatoria'),
    type: z.enum(['meeting', 'shooting', 'delivery', 'other']),
    projectId: z.string().uuid().optional(),
});

const memorizeFactSchema = z.object({
    content: z.string().min(1, 'Conteudo e obrigatorio').max(5000),
    category: z.enum(['client_preference', 'project_insight', 'negotiation', 'other']).optional(),
});

const studioCreateScriptSchema = z.object({
    title: z.string().min(1, 'Titulo e obrigatorio').max(300),
    description: z.string().max(5000).optional(),
    video_format: z.enum(['16:9', '9:16', '1:1', '4:5']).optional(),
    target_platform: z.enum(['YouTube', 'Instagram', 'TikTok', 'TV', 'Cinema', 'LinkedIn', 'Website']).optional(),
    target_audience: z.string().max(500).optional(),
    tone: z.enum(['Formal', 'Casual', 'Emocional', 'Humoristico', 'Inspirador', 'Educativo', 'Urgente', 'Promocional', 'Drama', 'Suspense']).optional(),
    project_id: z.string().uuid().optional(),
});

const sceneSchema = z.object({
    order: z.number().int().positive(),
    title: z.string().min(1).max(300),
    duration: z.number().positive(),
    description: z.string().min(1).max(5000),
    action: z.string().max(2000).optional(),
    dialogue: z.string().max(5000).optional(),
    voiceover: z.string().max(5000).optional(),
    lettering: z.string().max(2000).optional(),
    sound_design: z.string().max(2000).optional(),
    camera_angle: z.enum(['Close-up', 'Medium', 'Wide', 'Aerial', 'POV', 'Over the Shoulder', 'Low Angle', 'High Angle']).optional(),
    camera_movement: z.enum(['Static', 'Pan', 'Tilt', 'Dolly', 'Tracking', 'Crane', 'Handheld', 'Steadicam']).optional(),
    transition: z.enum(['Cut', 'Fade In', 'Fade Out', 'Dissolve', 'Wipe', 'Match Cut', 'J-Cut', 'L-Cut']).optional(),
    location_note: z.string().max(500).optional(),
    equipment_notes: z.string().max(500).optional(),
    notes: z.string().max(2000).optional(),
});

const studioCreateScenesBatchSchema = z.object({
    script_id: z.string().uuid('script_id deve ser um UUID valido'),
    scenes: z.array(sceneSchema).min(1, 'Pelo menos uma cena e necessaria').max(100),
});

const studioUpdateScriptSchema = z.object({
    script_id: z.string().uuid('script_id deve ser um UUID valido'),
    title: z.string().min(1).max(300).optional(),
    description: z.string().max(5000).optional(),
    video_format: z.enum(['16:9', '9:16', '1:1', '4:5']).optional(),
    target_platform: z.enum(['YouTube', 'Instagram', 'TikTok', 'TV', 'Cinema', 'LinkedIn', 'Website']).optional(),
    target_audience: z.string().max(500).optional(),
    tone: z.enum(['Formal', 'Casual', 'Emocional', 'Humoristico', 'Inspirador', 'Educativo', 'Urgente', 'Promocional', 'Drama', 'Suspense']).optional(),
});

const studioUpdateSceneSchema = z.object({
    script_id: z.string().uuid('script_id deve ser um UUID valido'),
    scene_id: z.string().uuid('scene_id deve ser um UUID valido'),
    title: z.string().min(1).max(300).optional(),
    duration: z.number().positive().optional(),
    description: z.string().max(5000).optional(),
    action: z.string().max(2000).optional(),
    dialogue: z.string().max(5000).optional(),
    voiceover: z.string().max(5000).optional(),
    lettering: z.string().max(2000).optional(),
    sound_design: z.string().max(2000).optional(),
    camera_angle: z.enum(['Close-up', 'Medium', 'Wide', 'Aerial', 'POV', 'Over the Shoulder', 'Low Angle', 'High Angle']).optional(),
    camera_movement: z.enum(['Static', 'Pan', 'Tilt', 'Dolly', 'Tracking', 'Crane', 'Handheld', 'Steadicam']).optional(),
    transition: z.enum(['Cut', 'Fade In', 'Fade Out', 'Dissolve', 'Wipe', 'Match Cut', 'J-Cut', 'L-Cut']).optional(),
    location_note: z.string().max(500).optional(),
    equipment_notes: z.string().max(500).optional(),
    notes: z.string().max(2000).optional(),
});

const studioDeleteScenesSchema = z.object({
    script_id: z.string().uuid('script_id deve ser um UUID valido'),
    scene_ids: z.array(z.string().uuid()).min(1, 'Pelo menos um scene_id e necessario').max(100),
});

/**
 * Mapa de schemas Zod por nome da tool.
 */
const TOOL_SCHEMAS: Record<string, ZodSchema> = {
    update_proposal_status: updateProposalStatusSchema,
    schedule_calendar_event: scheduleCalendarEventSchema,
    memorize_fact: memorizeFactSchema,
    studio_create_script: studioCreateScriptSchema,
    studio_create_scenes_batch: studioCreateScenesBatchSchema,
    studio_update_script: studioUpdateScriptSchema,
    studio_update_scene: studioUpdateSceneSchema,
    studio_delete_scenes: studioDeleteScenesSchema,
};

/**
 * Valida os argumentos de uma tool usando Zod.
 * Retorna os args tipados e validados, ou lanca erro com detalhes.
 */
export function validateToolArgs<T>(
    toolName: string,
    args: unknown,
    schema?: ZodSchema<T>
): T {
    const zodSchema = schema || TOOL_SCHEMAS[toolName];
    if (!zodSchema) {
        // Tool sem schema definido - passa sem validacao (tools de leitura)
        return args as T;
    }

    const result = zodSchema.safeParse(args);
    if (!result.success) {
        const issues = result.error.issues
            .map((i) => `${i.path.join('.')}: ${i.message}`)
            .join('; ');
        throw new Error(`Argumentos invalidos para ${toolName}: ${issues}`);
    }

    return result.data as T;
}

/**
 * Log de seguranca para chamadas de tools de escrita.
 */
export function logToolCall(params: {
    tool: string;
    args: unknown;
    userId: string;
    orgId: string;
}) {
    console.log('[AI_TOOL_CALL]', {
        tool: params.tool,
        args: params.args,
        userId: params.userId,
        orgId: params.orgId,
        timestamp: new Date().toISOString(),
    });
}
