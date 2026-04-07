import { SupabaseClient } from '@supabase/supabase-js';
import { validateToolArgs, isWriteTool } from './tool-safety';

// ============================================
// STUDIO TOOLS: Definições (OpenAI Function Calling)
// ============================================

export const getStudioToolsDefinitions = () => [
    {
        name: 'studio_create_script',
        description: 'Cria um novo roteiro com metadados. Sempre chame esta ferramenta ANTES de studio_create_scenes_batch.',
        requiresConfirmation: true,
        parameters: {
            type: 'object',
            properties: {
                title: { type: 'string', description: 'Título do roteiro' },
                description: { type: 'string', description: 'Descrição/sinopse do roteiro' },
                video_format: {
                    type: 'string',
                    enum: ['16:9', '9:16', '1:1', '4:5'],
                    description: 'Formato do vídeo',
                },
                target_platform: {
                    type: 'string',
                    enum: ['YouTube', 'Instagram', 'TikTok', 'TV', 'Cinema', 'LinkedIn', 'Website'],
                    description: 'Plataforma alvo',
                },
                target_audience: { type: 'string', description: 'Público-alvo do vídeo' },
                tone: {
                    type: 'string',
                    enum: ['Formal', 'Casual', 'Emocional', 'Humorístico', 'Inspirador', 'Educativo', 'Urgente', 'Promocional', 'Drama', 'Suspense'],
                    description: 'Tom/estilo do roteiro',
                },
                project_id: { type: 'string', description: 'ID do projeto associado (opcional)' },
            },
            required: ['title'],
        },
    },
    {
        name: 'studio_create_scenes_batch',
        description: 'Cria múltiplas cenas de uma vez para um roteiro. Use para gerar o roteiro completo em uma única chamada.',
        requiresConfirmation: true,
        parameters: {
            type: 'object',
            properties: {
                script_id: { type: 'string', description: 'ID do roteiro onde criar as cenas' },
                scenes: {
                    type: 'array',
                    description: 'Array de cenas a criar',
                    items: {
                        type: 'object',
                        properties: {
                            order: { type: 'number', description: 'Número de ordem da cena (1, 2, 3...)' },
                            title: { type: 'string', description: 'Título da cena' },
                            duration: { type: 'number', description: 'Duração em segundos' },
                            description: { type: 'string', description: 'Descrição visual da cena' },
                            action: { type: 'string', description: 'Ações dos personagens/elementos' },
                            dialogue: { type: 'string', description: 'Falas dos personagens' },
                            voiceover: { type: 'string', description: 'Narração em off' },
                            lettering: { type: 'string', description: 'Textos na tela, títulos, lower thirds' },
                            sound_design: { type: 'string', description: 'Música, efeitos sonoros, ambiente' },
                            camera_angle: {
                                type: 'string',
                                enum: ['Close-up', 'Medium', 'Wide', 'Aerial', 'POV', 'Over the Shoulder', 'Low Angle', 'High Angle'],
                                description: 'Ângulo de câmera',
                            },
                            camera_movement: {
                                type: 'string',
                                enum: ['Static', 'Pan', 'Tilt', 'Dolly', 'Tracking', 'Crane', 'Handheld', 'Steadicam'],
                                description: 'Movimento de câmera',
                            },
                            transition: {
                                type: 'string',
                                enum: ['Cut', 'Fade In', 'Fade Out', 'Dissolve', 'Wipe', 'Match Cut', 'J-Cut', 'L-Cut'],
                                description: 'Transição para a próxima cena',
                            },
                            location_note: { type: 'string', description: 'Local/cenário da filmagem' },
                            equipment_notes: { type: 'string', description: 'Equipamentos sugeridos' },
                            notes: { type: 'string', description: 'Observações de produção' },
                        },
                        required: ['order', 'title', 'duration', 'description'],
                    },
                },
            },
            required: ['script_id', 'scenes'],
        },
    },
    {
        name: 'studio_update_script',
        description: 'Atualiza os metadados de um roteiro existente (título, descrição, formato, plataforma, tom, etc.).',
        requiresConfirmation: true,
        parameters: {
            type: 'object',
            properties: {
                script_id: { type: 'string', description: 'ID do roteiro' },
                title: { type: 'string', description: 'Novo título' },
                description: { type: 'string', description: 'Nova descrição' },
                video_format: { type: 'string', enum: ['16:9', '9:16', '1:1', '4:5'] },
                target_platform: { type: 'string', enum: ['YouTube', 'Instagram', 'TikTok', 'TV', 'Cinema', 'LinkedIn', 'Website'] },
                target_audience: { type: 'string' },
                tone: { type: 'string', enum: ['Formal', 'Casual', 'Emocional', 'Humorístico', 'Inspirador', 'Educativo', 'Urgente', 'Promocional', 'Drama', 'Suspense'] },
            },
            required: ['script_id'],
        },
    },
    {
        name: 'studio_update_scene',
        description: 'Atualiza uma cena específica de um roteiro (diálogo, descrição, câmera, etc.).',
        requiresConfirmation: true,
        parameters: {
            type: 'object',
            properties: {
                script_id: { type: 'string', description: 'ID do roteiro (para verificação de ownership)' },
                scene_id: { type: 'string', description: 'ID da cena a atualizar' },
                title: { type: 'string' },
                duration: { type: 'number' },
                description: { type: 'string' },
                action: { type: 'string' },
                dialogue: { type: 'string' },
                voiceover: { type: 'string' },
                lettering: { type: 'string' },
                sound_design: { type: 'string' },
                camera_angle: { type: 'string', enum: ['Close-up', 'Medium', 'Wide', 'Aerial', 'POV', 'Over the Shoulder', 'Low Angle', 'High Angle'] },
                camera_movement: { type: 'string', enum: ['Static', 'Pan', 'Tilt', 'Dolly', 'Tracking', 'Crane', 'Handheld', 'Steadicam'] },
                transition: { type: 'string', enum: ['Cut', 'Fade In', 'Fade Out', 'Dissolve', 'Wipe', 'Match Cut', 'J-Cut', 'L-Cut'] },
                location_note: { type: 'string' },
                equipment_notes: { type: 'string' },
                notes: { type: 'string' },
            },
            required: ['script_id', 'scene_id'],
        },
    },
    {
        name: 'studio_get_script',
        description: 'Lê o roteiro completo com todas as cenas e seus detalhes. Use para analisar o roteiro antes de fazer alterações ou sugerir melhorias.',
        parameters: {
            type: 'object',
            properties: {
                script_id: { type: 'string', description: 'ID do roteiro' },
            },
            required: ['script_id'],
        },
    },
    {
        name: 'studio_delete_scenes',
        description: 'Remove cenas de um roteiro. As cenas restantes são reordenadas automaticamente.',
        requiresConfirmation: true,
        parameters: {
            type: 'object',
            properties: {
                script_id: { type: 'string', description: 'ID do roteiro' },
                scene_ids: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'IDs das cenas a remover',
                },
            },
            required: ['script_id', 'scene_ids'],
        },
    },
];

// ============================================
// STUDIO TOOLS: Execução
// ============================================

export const executeStudioTool = async (
    toolName: string,
    args: any,
    supabase: SupabaseClient,
    organizationId: string,
    userId: string
) => {
    try {
        // Validar argumentos com Zod para tools de escrita
        if (isWriteTool(toolName)) {
            args = validateToolArgs(toolName, args);
        }

        switch (toolName) {
            case 'studio_create_script':
                return await createScript(args, supabase, organizationId, userId);
            case 'studio_create_scenes_batch':
                return await createScenesBatch(args, supabase, organizationId);
            case 'studio_update_script':
                return await updateScript(args, supabase, organizationId);
            case 'studio_update_scene':
                return await updateScene(args, supabase, organizationId);
            case 'studio_get_script':
                return await getScript(args, supabase, organizationId);
            case 'studio_delete_scenes':
                return await deleteScenes(args, supabase, organizationId);
            default:
                return 'Ferramenta não encontrada.';
        }
    } catch (err: any) {
        console.error(`Studio tool error [${toolName}]:`, err);
        return `Erro ao executar ferramenta: ${err.message}`;
    }
};

// ============================================
// Helpers
// ============================================

async function verifyScriptOwnership(supabase: SupabaseClient, scriptId: string, organizationId: string) {
    const { data } = await supabase
        .from('scripts')
        .select('id')
        .eq('id', scriptId)
        .eq('organization_id', organizationId)
        .single();
    if (!data) throw new Error('Roteiro não encontrado ou sem permissão');
    return data;
}

async function recalculateSceneTimes(supabase: SupabaseClient, scriptId: string) {
    const { data: scenes } = await supabase
        .from('scenes')
        .select('id, duration, "order"')
        .eq('script_id', scriptId)
        .order('order', { ascending: true });

    if (!scenes || scenes.length === 0) {
        await supabase.from('scripts').update({ total_duration: 0 }).eq('id', scriptId);
        return;
    }

    let currentTime = 0;
    for (const scene of scenes) {
        await supabase.from('scenes').update({ start_time: currentTime }).eq('id', scene.id);
        currentTime += scene.duration || 0;
    }

    await supabase.from('scripts').update({ total_duration: currentTime }).eq('id', scriptId);
}

// ============================================
// Tool Implementations
// ============================================

async function createScript(
    args: any,
    supabase: SupabaseClient,
    organizationId: string,
    userId: string
) {
    // Validate project_id if provided
    let validProjectId: string | null = null;
    if (args.project_id) {
        const { data: project } = await supabase
            .from('projects')
            .select('id')
            .eq('id', args.project_id)
            .eq('organization_id', organizationId)
            .single();
        if (project) {
            validProjectId = project.id;
        }
    }

    const { data, error } = await supabase
        .from('scripts')
        .insert({
            organization_id: organizationId,
            title: args.title,
            description: args.description || null,
            video_format: args.video_format || null,
            target_platform: args.target_platform || null,
            target_audience: args.target_audience || null,
            tone: args.tone || null,
            project_id: validProjectId,
            status: 'DRAFT',
            version: 1,
            created_by: userId,
        })
        .select('id, title')
        .single();

    if (error) throw error;
    return JSON.stringify({
        success: true,
        script_id: data.id,
        title: data.title,
        message: `Roteiro "${data.title}" criado com sucesso.`,
    });
}

async function createScenesBatch(
    args: any,
    supabase: SupabaseClient,
    organizationId: string
) {
    const { script_id, scenes } = args;
    await verifyScriptOwnership(supabase, script_id, organizationId);

    if (!scenes || !Array.isArray(scenes) || scenes.length === 0) {
        throw new Error('Nenhuma cena fornecida');
    }

    // Delete existing auto-created first scene if it's the only one and has no content
    const { data: existingScenes } = await supabase
        .from('scenes')
        .select('id, title, description, dialogue, voiceover')
        .eq('script_id', script_id);

    if (existingScenes && existingScenes.length === 1) {
        const first = existingScenes[0];
        const isEmpty = !first.description && !first.dialogue && !first.voiceover;
        if (isEmpty) {
            await supabase.from('scenes').delete().eq('id', first.id);
        }
    }

    // Prepare scenes for batch insert
    const scenesData = scenes.map((scene: any) => ({
        script_id,
        order: scene.order,
        title: scene.title || `Cena ${scene.order}`,
        duration: scene.duration || 5,
        start_time: 0, // Will be recalculated
        description: scene.description || null,
        action: scene.action || null,
        dialogue: scene.dialogue || null,
        voiceover: scene.voiceover || null,
        lettering: scene.lettering || null,
        sound_design: scene.sound_design || null,
        notes: scene.notes || null,
        camera_angle: scene.camera_angle || null,
        camera_movement: scene.camera_movement || null,
        transition: scene.transition || null,
        location_note: scene.location_note || null,
        equipment_notes: scene.equipment_notes || null,
    }));

    const { data, error } = await supabase
        .from('scenes')
        .insert(scenesData)
        .select('id, order, title');

    if (error) {
        // Rollback: delete the script if scenes failed and it was just created
        throw error;
    }

    // Recalculate start times and total duration
    await recalculateSceneTimes(supabase, script_id);

    return JSON.stringify({
        success: true,
        scenes_created: data.length,
        scenes: data.map((s: any) => ({ id: s.id, order: s.order, title: s.title })),
        message: `${data.length} cenas criadas com sucesso.`,
    });
}

async function updateScript(
    args: any,
    supabase: SupabaseClient,
    organizationId: string
) {
    const { script_id, ...updateData } = args;
    await verifyScriptOwnership(supabase, script_id, organizationId);

    // Filter out undefined/null values and script_id
    const cleanData: Record<string, any> = {};
    for (const [key, value] of Object.entries(updateData)) {
        if (value !== undefined && value !== null) {
            cleanData[key] = value;
        }
    }

    if (Object.keys(cleanData).length === 0) {
        return 'Nenhum campo para atualizar.';
    }

    const { error } = await supabase
        .from('scripts')
        .update(cleanData)
        .eq('id', script_id)
        .eq('organization_id', organizationId);

    if (error) throw error;
    return JSON.stringify({
        success: true,
        message: `Roteiro atualizado com sucesso. Campos: ${Object.keys(cleanData).join(', ')}`,
    });
}

async function updateScene(
    args: any,
    supabase: SupabaseClient,
    organizationId: string
) {
    const { script_id, scene_id, ...updateData } = args;
    await verifyScriptOwnership(supabase, script_id, organizationId);

    const cleanData: Record<string, any> = {};
    for (const [key, value] of Object.entries(updateData)) {
        if (value !== undefined && value !== null) {
            cleanData[key] = value;
        }
    }

    if (Object.keys(cleanData).length === 0) {
        return 'Nenhum campo para atualizar.';
    }

    cleanData.updated_at = new Date().toISOString();

    const { error } = await supabase
        .from('scenes')
        .update(cleanData)
        .eq('id', scene_id);

    if (error) throw error;

    // Recalculate if duration changed
    if (cleanData.duration !== undefined) {
        await recalculateSceneTimes(supabase, script_id);
    }

    return JSON.stringify({
        success: true,
        message: `Cena atualizada. Campos: ${Object.keys(cleanData).filter(k => k !== 'updated_at').join(', ')}`,
    });
}

async function getScript(
    args: any,
    supabase: SupabaseClient,
    organizationId: string
) {
    const { script_id } = args;

    const { data: script, error } = await supabase
        .from('scripts')
        .select('*')
        .eq('id', script_id)
        .eq('organization_id', organizationId)
        .single();

    if (error) throw error;

    const { data: scenes } = await supabase
        .from('scenes')
        .select('*')
        .eq('script_id', script_id)
        .order('order', { ascending: true });

    return JSON.stringify({
        script: {
            id: script.id,
            title: script.title,
            description: script.description,
            status: script.status,
            video_format: script.video_format,
            target_platform: script.target_platform,
            target_audience: script.target_audience,
            tone: script.tone,
            total_duration: script.total_duration,
            version: script.version,
        },
        scenes: (scenes || []).map((s: any) => ({
            id: s.id,
            order: s.order,
            title: s.title,
            duration: s.duration,
            start_time: s.start_time,
            description: s.description,
            action: s.action,
            dialogue: s.dialogue,
            voiceover: s.voiceover,
            lettering: s.lettering,
            sound_design: s.sound_design,
            notes: s.notes,
            camera_angle: s.camera_angle,
            camera_movement: s.camera_movement,
            transition: s.transition,
            location_note: s.location_note,
            equipment_notes: s.equipment_notes,
        })),
        total_scenes: scenes?.length || 0,
    });
}

async function deleteScenes(
    args: any,
    supabase: SupabaseClient,
    organizationId: string
) {
    const { script_id, scene_ids } = args;
    await verifyScriptOwnership(supabase, script_id, organizationId);

    if (!scene_ids || scene_ids.length === 0) {
        return 'Nenhuma cena para remover.';
    }

    const { error } = await supabase
        .from('scenes')
        .delete()
        .in('id', scene_ids)
        .eq('script_id', script_id);

    if (error) throw error;

    // Reorder remaining scenes
    const { data: remainingScenes } = await supabase
        .from('scenes')
        .select('id')
        .eq('script_id', script_id)
        .order('order', { ascending: true });

    if (remainingScenes) {
        for (let i = 0; i < remainingScenes.length; i++) {
            await supabase
                .from('scenes')
                .update({ order: i + 1 })
                .eq('id', remainingScenes[i].id);
        }
    }

    await recalculateSceneTimes(supabase, script_id);

    return JSON.stringify({
        success: true,
        deleted: scene_ids.length,
        remaining: remainingScenes?.length || 0,
        message: `${scene_ids.length} cena(s) removida(s). Cenas restantes reordenadas.`,
    });
}
