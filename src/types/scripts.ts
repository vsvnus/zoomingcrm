// ============================================
// TYPES: Zooming Studio - Scripts & Storyboard Module
// ============================================

export type ScriptStatus =
  | 'DRAFT'
  | 'IN_REVIEW'
  | 'APPROVED'
  | 'CHANGES_REQUESTED'
  | 'IN_PRODUCTION'
  | 'COMPLETED'

export type SceneAssetType = 'IMAGE' | 'VIDEO_REF' | 'AUDIO_REF' | 'DOCUMENT'

export type CameraAngle = 'Close-up' | 'Medium' | 'Wide' | 'Aerial' | 'POV' | 'Over the Shoulder' | 'Low Angle' | 'High Angle'
export type CameraMovement = 'Static' | 'Pan' | 'Tilt' | 'Dolly' | 'Tracking' | 'Crane' | 'Handheld' | 'Steadicam'
export type SceneTransition = 'Cut' | 'Fade In' | 'Fade Out' | 'Dissolve' | 'Wipe' | 'Match Cut' | 'J-Cut' | 'L-Cut'

export type VideoFormatScript = '16:9' | '9:16' | '1:1' | '4:5'
export type TargetPlatform = 'YouTube' | 'Instagram' | 'TikTok' | 'TV' | 'Cinema' | 'LinkedIn' | 'Website'
export type ScriptTone = 'Formal' | 'Casual' | 'Emocional' | 'Humorístico' | 'Inspirador' | 'Educativo' | 'Urgente'

// ============================================
// Database Table Interfaces
// ============================================

export interface Script {
  id: string
  project_id: string
  organization_id: string
  title: string
  description?: string
  status: ScriptStatus
  version: number
  total_duration?: number
  video_format?: string
  target_platform?: string
  target_audience?: string
  tone?: string
  created_by?: string
  created_at: string
  updated_at: string
}

export interface Scene {
  id: string
  script_id: string
  order: number
  title?: string
  duration?: number
  start_time?: number
  description?: string
  action?: string
  dialogue?: string
  voiceover?: string
  lettering?: string
  sound_design?: string
  notes?: string
  storyboard_url?: string
  camera_angle?: string
  camera_movement?: string
  transition?: string
  location_note?: string
  equipment_notes?: string
  created_at: string
  updated_at: string
}

export interface SceneAsset {
  id: string
  scene_id: string
  type: SceneAssetType
  url: string
  name: string
  order: number
  created_at: string
}

export interface ScriptVersion {
  id: string
  script_id: string
  version: number
  snapshot: any
  change_note?: string
  created_by?: string
  created_at: string
}

// ============================================
// Enriched Interfaces
// ============================================

export interface SceneWithAssets extends Scene {
  scene_assets?: SceneAsset[]
}

export interface ScriptWithScenes extends Script {
  scenes?: SceneWithAssets[]
}

// ============================================
// Form Data Interfaces
// ============================================

export interface CreateScriptData {
  project_id: string
  title: string
  description?: string
  video_format?: string
  target_platform?: string
  target_audience?: string
  tone?: string
}

export interface UpdateScriptData {
  title?: string
  description?: string
  status?: ScriptStatus
  total_duration?: number
  video_format?: string
  target_platform?: string
  target_audience?: string
  tone?: string
}

export interface CreateSceneData {
  script_id: string
  order: number
  title?: string
  duration?: number
  description?: string
  action?: string
  dialogue?: string
  voiceover?: string
  lettering?: string
  sound_design?: string
  notes?: string
  camera_angle?: string
  camera_movement?: string
  transition?: string
  location_note?: string
  equipment_notes?: string
}

export interface UpdateSceneData {
  title?: string
  duration?: number
  description?: string
  action?: string
  dialogue?: string
  voiceover?: string
  lettering?: string
  sound_design?: string
  notes?: string
  storyboard_url?: string
  camera_angle?: string
  camera_movement?: string
  transition?: string
  location_note?: string
  equipment_notes?: string
}

// ============================================
// UI State Types
// ============================================

export type ScriptViewMode = 'script' | 'storyboard' | 'timeline'

// ============================================
// Constants
// ============================================

export const SCRIPT_STATUS_LABELS: Record<ScriptStatus, string> = {
  DRAFT: 'Rascunho',
  IN_REVIEW: 'Em Revisão',
  APPROVED: 'Aprovado',
  CHANGES_REQUESTED: 'Alterações Solicitadas',
  IN_PRODUCTION: 'Em Produção',
  COMPLETED: 'Concluído',
}

export const SCRIPT_STATUS_COLORS: Record<ScriptStatus, { bg: string; text: string; border: string }> = {
  DRAFT: { bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/20' },
  IN_REVIEW: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20' },
  APPROVED: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
  CHANGES_REQUESTED: { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/20' },
  IN_PRODUCTION: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
  COMPLETED: { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/20' },
}

export const CAMERA_ANGLES: CameraAngle[] = [
  'Close-up', 'Medium', 'Wide', 'Aerial', 'POV', 'Over the Shoulder', 'Low Angle', 'High Angle'
]

export const CAMERA_MOVEMENTS: CameraMovement[] = [
  'Static', 'Pan', 'Tilt', 'Dolly', 'Tracking', 'Crane', 'Handheld', 'Steadicam'
]

export const SCENE_TRANSITIONS: SceneTransition[] = [
  'Cut', 'Fade In', 'Fade Out', 'Dissolve', 'Wipe', 'Match Cut', 'J-Cut', 'L-Cut'
]

export const VIDEO_FORMATS_SCRIPT: { value: VideoFormatScript; label: string }[] = [
  { value: '16:9', label: '16:9 (Landscape)' },
  { value: '9:16', label: '9:16 (Vertical)' },
  { value: '1:1', label: '1:1 (Square)' },
  { value: '4:5', label: '4:5 (Portrait)' },
]

export const TARGET_PLATFORMS: { value: TargetPlatform; label: string }[] = [
  { value: 'YouTube', label: 'YouTube' },
  { value: 'Instagram', label: 'Instagram' },
  { value: 'TikTok', label: 'TikTok' },
  { value: 'TV', label: 'TV' },
  { value: 'Cinema', label: 'Cinema' },
  { value: 'LinkedIn', label: 'LinkedIn' },
  { value: 'Website', label: 'Website' },
]

export const SCRIPT_TONES: { value: ScriptTone; label: string }[] = [
  { value: 'Formal', label: 'Formal' },
  { value: 'Casual', label: 'Casual' },
  { value: 'Emocional', label: 'Emocional' },
  { value: 'Humorístico', label: 'Humorístico' },
  { value: 'Inspirador', label: 'Inspirador' },
  { value: 'Educativo', label: 'Educativo' },
  { value: 'Urgente', label: 'Urgente' },
]
