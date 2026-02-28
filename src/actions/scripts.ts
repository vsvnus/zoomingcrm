'use server'

import { createClient, getUserOrganization } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type {
  Script,
  ScriptWithScenes,
  Scene,
  SceneWithAssets,
  CreateScriptData,
  UpdateScriptData,
  CreateSceneData,
  UpdateSceneData,
} from '@/types/scripts'
import { validateInput, createScriptSchema, createSceneSchema } from '@/lib/validations'

// ============================================
// HELPER: Verify Script Ownership
// ============================================

async function verifyScriptOwnership(supabase: any, scriptId: string, organizationId: string) {
  const { data } = await supabase
    .from('scripts').select('id')
    .eq('id', scriptId).eq('organization_id', organizationId).single()
  if (!data) throw new Error('Roteiro não encontrado')
  return data
}

// ============================================
// SCRIPTS: List All (for Studio)
// ============================================

export interface ScriptWithProject extends Script {
  scenes_count: number
  project_title: string
  project_status: string
  first_storyboard_url?: string | null
}

export async function getAllScripts(): Promise<ScriptWithProject[]> {
  const supabase = await createClient()
  const organizationId = await getUserOrganization()

  const { data: scripts, error } = await supabase
    .from('scripts')
    .select('*, projects!inner(title, status)')
    .eq('organization_id', organizationId)
    .order('updated_at', { ascending: false })

  if (error) {
    console.error('Error fetching all scripts:', error)
    return []
  }

  if (!scripts || scripts.length === 0) return []

  // Single query to get all scenes for all scripts (eliminates N+2 queries)
  const scriptIds = scripts.map(s => s.id)
  const { data: allScenes } = await supabase
    .from('scenes')
    .select('script_id, storyboard_url, "order"')
    .in('script_id', scriptIds)
    .order('order', { ascending: true })

  // Aggregate in memory
  const sceneCountMap: Record<string, number> = {}
  const firstStoryboardMap: Record<string, string | null> = {}

  allScenes?.forEach(scene => {
    sceneCountMap[scene.script_id] = (sceneCountMap[scene.script_id] || 0) + 1
    if (scene.storyboard_url && !firstStoryboardMap[scene.script_id]) {
      firstStoryboardMap[scene.script_id] = scene.storyboard_url
    }
  })

  return scripts.map((script: any) => ({
    ...script,
    scenes_count: sceneCountMap[script.id] || 0,
    project_title: script.projects?.title || 'Projeto sem nome',
    project_status: script.projects?.status || 'UNKNOWN',
    first_storyboard_url: firstStoryboardMap[script.id] || null,
    projects: undefined,
  }))
}

export async function getProjectsForStudio(): Promise<{ id: string; title: string; status: string }[]> {
  const supabase = await createClient()
  const organizationId = await getUserOrganization()

  const { data, error } = await supabase
    .from('projects')
    .select('id, title, status')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching projects for studio:', error)
    return []
  }

  return data || []
}

// ============================================
// SCRIPTS CRUD
// ============================================

export async function getProjectScript(projectId: string): Promise<ScriptWithScenes | null> {
  const supabase = await createClient()
  const organizationId = await getUserOrganization()

  // Fetch script for this project
  const { data: script, error } = await supabase
    .from('scripts')
    .select('*')
    .eq('project_id', projectId)
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    console.error('Error fetching script:', error)
    return null
  }

  if (!script) return null

  // Fetch scenes
  const { data: scenes, error: scenesError } = await supabase
    .from('scenes')
    .select('*')
    .eq('script_id', script.id)
    .order('order', { ascending: true })

  if (scenesError) {
    console.error('Error fetching scenes:', scenesError)
  }

  return {
    ...script,
    scenes: scenes || [],
  }
}

export async function getScript(scriptId: string): Promise<ScriptWithScenes | null> {
  const supabase = await createClient()
  const organizationId = await getUserOrganization()

  const { data: script, error } = await supabase
    .from('scripts')
    .select('*')
    .eq('id', scriptId)
    .eq('organization_id', organizationId)
    .single()

  if (error) {
    if (error.code !== 'PGRST116') {
      console.error('Error fetching script:', error)
    }
    return null
  }

  // Fetch scenes with assets
  const { data: scenes } = await supabase
    .from('scenes')
    .select('*, scene_assets(*)')
    .eq('script_id', scriptId)
    .order('order', { ascending: true })

  return {
    ...script,
    scenes: scenes || [],
  }
}

export async function createScript(formData: CreateScriptData): Promise<Script> {
  validateInput(createScriptSchema, formData)
  const supabase = await createClient()
  const organizationId = await getUserOrganization()

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('scripts')
    .insert({
      project_id: formData.project_id,
      organization_id: organizationId,
      title: formData.title,
      description: formData.description || null,
      video_format: formData.video_format || null,
      target_platform: formData.target_platform || null,
      target_audience: formData.target_audience || null,
      tone: formData.tone || null,
      status: 'DRAFT',
      version: 1,
      created_by: user?.id || null,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating script:', error)
    throw new Error('Erro ao criar roteiro: ' + error.message)
  }

  // Create first scene automatically
  await supabase.from('scenes').insert({
    script_id: data.id,
    order: 1,
    title: 'Cena 1',
    duration: 5,
    start_time: 0,
  })

  revalidatePath(`/projects/${formData.project_id}`)
  revalidatePath('/studio')
  return data
}

export async function updateScript(scriptId: string, formData: UpdateScriptData, projectId: string) {
  const supabase = await createClient()
  const organizationId = await getUserOrganization()

  const { data, error } = await supabase
    .from('scripts')
    .update(formData)
    .eq('id', scriptId)
    .eq('organization_id', organizationId)
    .select()
    .single()

  if (error) {
    console.error('Error updating script:', error)
    throw new Error('Erro ao atualizar roteiro')
  }

  revalidatePath(`/projects/${projectId}`)
  return data
}

export async function deleteScript(scriptId: string, projectId: string) {
  const supabase = await createClient()
  const organizationId = await getUserOrganization()

  const { error } = await supabase
    .from('scripts')
    .delete()
    .eq('id', scriptId)
    .eq('organization_id', organizationId)

  if (error) {
    console.error('Error deleting script:', error)
    throw new Error('Erro ao deletar roteiro')
  }

  revalidatePath(`/projects/${projectId}`)
}

// ============================================
// SCENES CRUD
// ============================================

export async function createScene(formData: CreateSceneData): Promise<Scene> {
  validateInput(createSceneSchema, formData)
  const supabase = await createClient()
  const organizationId = await getUserOrganization()
  await verifyScriptOwnership(supabase, formData.script_id, organizationId)

  const { data, error } = await supabase
    .from('scenes')
    .insert({
      script_id: formData.script_id,
      order: formData.order,
      title: formData.title || `Cena ${formData.order}`,
      duration: formData.duration || 5,
      start_time: formData.order > 1 ? undefined : 0,
      description: formData.description || null,
      action: formData.action || null,
      dialogue: formData.dialogue || null,
      voiceover: formData.voiceover || null,
      lettering: formData.lettering || null,
      sound_design: formData.sound_design || null,
      notes: formData.notes || null,
      camera_angle: formData.camera_angle || null,
      camera_movement: formData.camera_movement || null,
      transition: formData.transition || null,
      location_note: formData.location_note || null,
      equipment_notes: formData.equipment_notes || null,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating scene:', error)
    throw new Error('Erro ao criar cena')
  }

  // Recalculate start times
  await recalculateSceneTimes(formData.script_id)

  return data
}

export async function updateScene(sceneId: string, formData: UpdateSceneData, scriptId: string) {
  const supabase = await createClient()
  const organizationId = await getUserOrganization()
  await verifyScriptOwnership(supabase, scriptId, organizationId)

  const { data, error } = await supabase
    .from('scenes')
    .update({
      ...formData,
      updated_at: new Date().toISOString(),
    })
    .eq('id', sceneId)
    .select()
    .single()

  if (error) {
    console.error('Error updating scene:', error)
    throw new Error('Erro ao atualizar cena')
  }

  // Recalculate if duration changed
  if (formData.duration !== undefined) {
    await recalculateSceneTimes(scriptId)
  }

  return data
}

export async function deleteScene(sceneId: string, scriptId: string) {
  const supabase = await createClient()
  const organizationId = await getUserOrganization()
  await verifyScriptOwnership(supabase, scriptId, organizationId)

  const { error } = await supabase
    .from('scenes')
    .delete()
    .eq('id', sceneId)

  if (error) {
    console.error('Error deleting scene:', error)
    throw new Error('Erro ao deletar cena')
  }

  // Reorder remaining scenes
  const { data: remainingScenes } = await supabase
    .from('scenes')
    .select('id')
    .eq('script_id', scriptId)
    .order('order', { ascending: true })

  if (remainingScenes) {
    for (let i = 0; i < remainingScenes.length; i++) {
      await supabase
        .from('scenes')
        .update({ order: i + 1 })
        .eq('id', remainingScenes[i].id)
    }
  }

  await recalculateSceneTimes(scriptId)
}

export async function reorderScenes(scriptId: string, sceneIds: string[]) {
  const supabase = await createClient()
  const organizationId = await getUserOrganization()
  await verifyScriptOwnership(supabase, scriptId, organizationId)

  // Update order for each scene
  for (let i = 0; i < sceneIds.length; i++) {
    await supabase
      .from('scenes')
      .update({ order: i + 1 })
      .eq('id', sceneIds[i])
  }

  await recalculateSceneTimes(scriptId)
}

export async function duplicateScene(sceneId: string, scriptId: string): Promise<Scene> {
  const supabase = await createClient()
  const organizationId = await getUserOrganization()
  await verifyScriptOwnership(supabase, scriptId, organizationId)

  // Fetch the scene to duplicate
  const { data: original, error: fetchError } = await supabase
    .from('scenes')
    .select('*')
    .eq('id', sceneId)
    .single()

  if (fetchError || !original) {
    throw new Error('Cena não encontrada')
  }

  // Get current max order
  const { data: scenes } = await supabase
    .from('scenes')
    .select('order')
    .eq('script_id', scriptId)
    .order('order', { ascending: false })
    .limit(1)

  const nextOrder = scenes && scenes.length > 0 ? scenes[0].order + 1 : 1

  // Create duplicate
  const { id, created_at, updated_at, start_time, ...sceneData } = original

  const { data: newScene, error } = await supabase
    .from('scenes')
    .insert({
      ...sceneData,
      order: nextOrder,
      title: `${original.title || 'Cena'} (cópia)`,
    })
    .select()
    .single()

  if (error) {
    throw new Error('Erro ao duplicar cena')
  }

  await recalculateSceneTimes(scriptId)
  return newScene
}

// ============================================
// HELPER: Recalculate Scene Times
// ============================================

async function recalculateSceneTimes(scriptId: string) {
  const supabase = await createClient()

  // Fetch all scenes in order
  const { data: scenes } = await supabase
    .from('scenes')
    .select('id, duration, "order"')
    .eq('script_id', scriptId)
    .order('order', { ascending: true })

  if (!scenes || scenes.length === 0) {
    // Update total duration to 0
    await supabase
      .from('scripts')
      .update({ total_duration: 0 })
      .eq('id', scriptId)
    return
  }

  let currentTime = 0
  for (const scene of scenes) {
    await supabase
      .from('scenes')
      .update({ start_time: currentTime })
      .eq('id', scene.id)

    currentTime += scene.duration || 0
  }

  // Update total duration on the script
  await supabase
    .from('scripts')
    .update({ total_duration: currentTime })
    .eq('id', scriptId)
}

// ============================================
// SCENE ASSETS CRUD
// ============================================

export async function addSceneAsset(sceneId: string, asset: {
  type: string
  url: string
  name: string
  order?: number
}) {
  const supabase = await createClient()
  const organizationId = await getUserOrganization()

  // Get script_id from scene, then verify script ownership
  const { data: scene } = await supabase
    .from('scenes').select('script_id').eq('id', sceneId).single()
  if (!scene) throw new Error('Cena não encontrada')
  await verifyScriptOwnership(supabase, scene.script_id, organizationId)

  const { data, error } = await supabase
    .from('scene_assets')
    .insert({
      scene_id: sceneId,
      type: asset.type,
      url: asset.url,
      name: asset.name,
      order: asset.order || 0,
    })
    .select()
    .single()

  if (error) {
    console.error('Error adding scene asset:', error)
    throw new Error('Erro ao adicionar asset')
  }

  return data
}

export async function deleteSceneAsset(assetId: string) {
  const supabase = await createClient()
  const organizationId = await getUserOrganization()

  // Traverse asset -> scene -> script to verify ownership
  const { data: assetData } = await supabase
    .from('scene_assets').select('scene_id').eq('id', assetId).single()
  if (!assetData) throw new Error('Asset não encontrado')

  const { data: sceneData } = await supabase
    .from('scenes').select('script_id').eq('id', assetData.scene_id).single()
  if (!sceneData) throw new Error('Cena não encontrada')
  await verifyScriptOwnership(supabase, sceneData.script_id, organizationId)

  const { error } = await supabase
    .from('scene_assets')
    .delete()
    .eq('id', assetId)

  if (error) {
    console.error('Error deleting scene asset:', error)
    throw new Error('Erro ao remover asset')
  }
}

export async function getSceneAssets(sceneId: string) {
  const supabase = await createClient()
  const organizationId = await getUserOrganization()

  // Get script_id from scene, then verify script ownership
  const { data: sceneData } = await supabase
    .from('scenes').select('script_id').eq('id', sceneId).single()
  if (!sceneData) throw new Error('Cena não encontrada')
  await verifyScriptOwnership(supabase, sceneData.script_id, organizationId)

  const { data, error } = await supabase
    .from('scene_assets')
    .select('*')
    .eq('scene_id', sceneId)
    .order('order', { ascending: true })

  if (error) {
    console.error('Error fetching scene assets:', error)
    return []
  }

  return data || []
}

