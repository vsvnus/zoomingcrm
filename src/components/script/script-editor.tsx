'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText,
  LayoutGrid,
  Clock,
  Plus,
  Save,
  ChevronLeft,
  GripVertical,
  Trash2,
  Copy,
  MoreHorizontal,
  Film,
  Eye,
  Video,
  Timer,
  AlignLeft,
  Mic,
  Type,
  Music,
  StickyNote,
  Camera,
  Move,
  Scissors,
  MapPin,
  Wrench,
  Table2,
  Image as ImageIcon,
  Sparkles,
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type {
  ScriptWithScenes,
  Scene,
  ScriptViewMode,
  UpdateSceneData,
  UpdateScriptData,
} from '@/types/scripts'
import {
  SCRIPT_STATUS_LABELS,
  SCRIPT_STATUS_COLORS,
  CAMERA_ANGLES,
  CAMERA_MOVEMENTS,
  SCENE_TRANSITIONS,
} from '@/types/scripts'
import {
  updateScript,
  createScene,
  updateScene,
  deleteScene,
  reorderScenes,
  duplicateScene,
} from '@/actions/scripts'
import { StoryboardUpload } from '@/components/script/storyboard-upload'
import { ScriptExportPdf } from '@/components/script/script-export-pdf'
import { StudioAIPanel } from '@/components/studio/studio-ai-panel'

// ============================================
// UTILITY
// ============================================

function formatDuration(seconds: number): string {
  if (!seconds || seconds <= 0) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

function formatTimeHMS(seconds: number): string {
  if (!seconds || seconds < 0) seconds = 0
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

// ============================================
// SORTABLE SCENE ITEM
// ============================================

function SortableSceneItem({
  scene,
  isSelected,
  onSelect,
  onDelete,
  onDuplicate,
  index,
}: {
  scene: Scene
  isSelected: boolean
  onSelect: () => void
  onDelete: () => void
  onDuplicate: () => void
  index: number
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: scene.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const [showMenu, setShowMenu] = useState(false)

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative flex items-center gap-2 rounded-lg border p-3 transition-all cursor-pointer ${
        isDragging ? 'opacity-50 z-50' : ''
      } ${
        isSelected
          ? 'border-accent-500/50 bg-accent-500/5'
          : 'border-transparent hover:border-border hover:bg-bg-hover'
      }`}
      onClick={onSelect}
    >
      {/* Drag Handle */}
      <button
        className="shrink-0 cursor-grab touch-none text-text-tertiary opacity-0 group-hover:opacity-100 transition-opacity"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </button>

      {/* Scene Number */}
      <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-xs font-bold ${
        isSelected ? 'bg-accent-500 text-white' : 'bg-bg-secondary text-text-secondary'
      }`}>
        {index + 1}
      </div>

      {/* Scene Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-text-primary truncate">
          {scene.title || `Cena ${index + 1}`}
        </p>
        <p className="text-xs text-text-tertiary truncate">
          {scene.description?.slice(0, 50) || 'Sem descrição'}
          {scene.description && scene.description.length > 50 ? '...' : ''}
        </p>
      </div>

      {/* Duration */}
      <span className="shrink-0 text-xs text-text-tertiary tabular-nums">
        {formatDuration(scene.duration || 0)}
      </span>

      {/* Menu */}
      <div className="relative">
        <button
          onClick={(e) => {
            e.stopPropagation()
            setShowMenu(!showMenu)
          }}
          className="shrink-0 text-text-tertiary opacity-0 group-hover:opacity-100 transition-opacity hover:text-text-primary"
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>

        {showMenu && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
            <div className="absolute right-0 top-6 z-50 w-36 rounded-lg border border-border bg-card p-1 shadow-lg">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onDuplicate()
                  setShowMenu(false)
                }}
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-text-secondary hover:bg-bg-hover hover:text-text-primary"
              >
                <Copy className="h-3.5 w-3.5" />
                Duplicar
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete()
                  setShowMenu(false)
                }}
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-red-400 hover:bg-red-500/10"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Excluir
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// ============================================
// SCENE FIELD EDITOR
// ============================================

function SceneField({
  icon: Icon,
  label,
  value,
  onChange,
  placeholder,
  multiline = true,
}: {
  icon: any
  label: string
  value: string
  onChange: (value: string) => void
  placeholder: string
  multiline?: boolean
}) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-2 text-xs font-medium text-text-tertiary uppercase tracking-wider">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </label>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={3}
          className="w-full resize-none rounded-lg border border-border bg-bg-primary px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary/50 focus:border-accent-500/50 focus:outline-none focus:ring-1 focus:ring-accent-500/25 transition-colors"
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-lg border border-border bg-bg-primary px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary/50 focus:border-accent-500/50 focus:outline-none focus:ring-1 focus:ring-accent-500/25 transition-colors"
        />
      )}
    </div>
  )
}

// ============================================
// STORYBOARD VIEW
// ============================================

function StoryboardView({
  scenes,
  scriptId,
  selectedSceneId,
  onSelectScene,
  onSceneUpdate,
}: {
  scenes: Scene[]
  scriptId: string
  selectedSceneId: string | null
  onSelectScene: (id: string) => void
  onSceneUpdate: (sceneId: string, field: string, value: any) => void
}) {
  return (
    <div className="grid grid-cols-2 gap-4 p-4 lg:grid-cols-3 xl:grid-cols-4">
      {scenes.map((scene, index) => (
        <motion.div
          key={scene.id}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.05 }}
          className={`group rounded-xl border overflow-hidden transition-all hover:shadow-lg ${
            selectedSceneId === scene.id
              ? 'border-accent-500/50 ring-1 ring-accent-500/25'
              : 'border-border hover:border-text-tertiary'
          }`}
        >
          {/* Storyboard Image Area with Upload */}
          <div className="relative">
            <StoryboardUpload
              sceneId={scene.id}
              scriptId={scriptId}
              currentUrl={scene.storyboard_url}
              onUpload={(url) => onSceneUpdate(scene.id, 'storyboard_url', url)}
              onRemove={() => onSceneUpdate(scene.id, 'storyboard_url', null)}
              compact
            />
            {/* Scene Number Badge */}
            <div className="absolute top-2 left-2 flex h-6 w-6 items-center justify-center rounded-md bg-black/60 text-xs font-bold text-white backdrop-blur-sm z-10 pointer-events-none">
              {index + 1}
            </div>
            {/* Duration Badge */}
            <div className="absolute top-2 right-2 flex items-center gap-1 rounded-md bg-black/60 px-2 py-0.5 text-xs text-white backdrop-blur-sm z-10 pointer-events-none">
              <Timer className="h-3 w-3" />
              {formatDuration(scene.duration || 0)}
            </div>
          </div>

          {/* Scene Info */}
          <div
            className="p-3 space-y-1 cursor-pointer"
            onClick={() => onSelectScene(scene.id)}
          >
            <p className="text-sm font-medium text-text-primary truncate">
              {scene.title || `Cena ${index + 1}`}
            </p>
            <p className="text-xs text-text-tertiary line-clamp-2">
              {scene.description || 'Sem descrição'}
            </p>
            {(scene.camera_angle || scene.camera_movement) && (
              <div className="flex items-center gap-2 pt-1">
                {scene.camera_angle && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-bg-secondary text-text-tertiary">
                    {scene.camera_angle}
                  </span>
                )}
                {scene.camera_movement && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-bg-secondary text-text-tertiary">
                    {scene.camera_movement}
                  </span>
                )}
              </div>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  )
}

// ============================================
// TIMELINE VIEW
// ============================================

function TimelineView({
  scenes,
  totalDuration,
  selectedSceneId,
  onSelectScene,
}: {
  scenes: Scene[]
  totalDuration: number
  selectedSceneId: string | null
  onSelectScene: (id: string) => void
}) {
  if (!totalDuration || totalDuration === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-text-tertiary">
        <p className="text-sm">Defina a duração das cenas para ver a timeline</p>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-4">
      {/* Time ruler */}
      <div className="flex items-center justify-between text-xs text-text-tertiary px-1">
        <span>0:00</span>
        <span>{formatDuration(Math.floor(totalDuration / 4))}</span>
        <span>{formatDuration(Math.floor(totalDuration / 2))}</span>
        <span>{formatDuration(Math.floor((totalDuration * 3) / 4))}</span>
        <span>{formatDuration(totalDuration)}</span>
      </div>

      {/* Timeline bar */}
      <div className="flex h-16 rounded-lg overflow-hidden border border-border">
        {scenes.map((scene, index) => {
          const width = totalDuration > 0 ? ((scene.duration || 0) / totalDuration) * 100 : 0
          const colors = [
            'bg-blue-500/30 border-blue-500/50 hover:bg-blue-500/40',
            'bg-purple-500/30 border-purple-500/50 hover:bg-purple-500/40',
            'bg-emerald-500/30 border-emerald-500/50 hover:bg-emerald-500/40',
            'bg-amber-500/30 border-amber-500/50 hover:bg-amber-500/40',
            'bg-rose-500/30 border-rose-500/50 hover:bg-rose-500/40',
            'bg-cyan-500/30 border-cyan-500/50 hover:bg-cyan-500/40',
            'bg-indigo-500/30 border-indigo-500/50 hover:bg-indigo-500/40',
            'bg-pink-500/30 border-pink-500/50 hover:bg-pink-500/40',
          ]
          const colorClass = colors[index % colors.length]
          const isSelected = selectedSceneId === scene.id

          return (
            <div
              key={scene.id}
              onClick={() => onSelectScene(scene.id)}
              className={`relative flex items-center justify-center border-r cursor-pointer transition-all ${colorClass} ${
                isSelected ? 'ring-2 ring-accent-500 ring-inset z-10' : ''
              }`}
              style={{ width: `${Math.max(width, 2)}%` }}
              title={`${scene.title || `Cena ${index + 1}`} - ${formatDuration(scene.duration || 0)}`}
            >
              {width > 8 && (
                <div className="flex flex-col items-center gap-0.5 text-center px-1">
                  <span className="text-xs font-medium text-text-primary truncate max-w-full">
                    {scene.title || `C${index + 1}`}
                  </span>
                  <span className="text-[10px] text-text-tertiary">
                    {formatDuration(scene.duration || 0)}
                  </span>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Scene list with times */}
      <div className="space-y-1">
        {scenes.map((scene, index) => (
          <div
            key={scene.id}
            onClick={() => onSelectScene(scene.id)}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm cursor-pointer transition-colors ${
              selectedSceneId === scene.id
                ? 'bg-accent-500/5 text-text-primary'
                : 'text-text-secondary hover:bg-bg-hover hover:text-text-primary'
            }`}
          >
            <span className="w-8 text-right text-xs text-text-tertiary tabular-nums">
              {formatDuration(scene.start_time || 0)}
            </span>
            <div className="h-4 w-px bg-border" />
            <span className="font-medium">{scene.title || `Cena ${index + 1}`}</span>
            <span className="ml-auto text-xs text-text-tertiary tabular-nums">
              {formatDuration(scene.duration || 0)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ============================================
// ROTEIRO TABLE VIEW (Tabela de Roteiro)
// ============================================

function SortableRoteiroRow({
  scene,
  index,
  scriptId,
  onFieldChange,
  onDelete,
}: {
  scene: Scene
  index: number
  scriptId: string
  onFieldChange: (sceneId: string, field: keyof UpdateSceneData, value: any) => void
  onDelete: (sceneId: string) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: scene.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`grid grid-cols-[72px_80px_120px_1fr_1fr_1fr_36px] border-b border-border transition-colors group/row ${
        isDragging ? 'opacity-50 z-50 bg-bg-secondary shadow-lg' : 'hover:bg-bg-hover/30'
      }`}
    >
      {/* Cena - Drag Handle + Number */}
      <div className="flex items-center gap-1 px-2 py-3 border-r border-border">
        <button
          className="shrink-0 cursor-grab touch-none text-text-tertiary/40 hover:text-text-secondary transition-colors"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <span className="text-sm font-bold text-text-secondary">#{index + 1}</span>
      </div>

      {/* Time */}
      <div className="flex flex-col items-center justify-center px-2 py-3 border-r border-border gap-0.5">
        <span className="text-[11px] font-medium text-text-primary tabular-nums">
          {formatTimeHMS(scene.start_time || 0)}
        </span>
        <div className="flex items-center gap-0.5">
          <Timer className="h-2.5 w-2.5 text-text-tertiary" />
          <input
            type="number"
            min="0"
            max="3600"
            value={scene.duration || 0}
            onChange={(e) => onFieldChange(scene.id, 'duration', parseInt(e.target.value) || 0)}
            className="w-7 bg-transparent text-[10px] text-text-tertiary text-center tabular-nums focus:outline-none focus:text-text-primary transition-colors"
          />
          <span className="text-[10px] text-text-tertiary">s</span>
        </div>
      </div>

      {/* Image */}
      <div className="p-2 border-r border-border">
        <StoryboardUpload
          sceneId={scene.id}
          scriptId={scriptId}
          currentUrl={scene.storyboard_url}
          onUpload={(url) => onFieldChange(scene.id, 'storyboard_url', url)}
          onRemove={() => onFieldChange(scene.id, 'storyboard_url', null)}
          compact
        />
      </div>

      {/* Descrição */}
      <div className="border-r border-border">
        <textarea
          value={scene.description || ''}
          onChange={(e) => onFieldChange(scene.id, 'description', e.target.value)}
          placeholder="Descrição da cena..."
          className="w-full h-full min-h-[100px] resize-none bg-transparent px-3 py-3 text-sm text-text-primary placeholder:text-text-tertiary/30 focus:outline-none focus:bg-accent-500/[0.02] transition-colors"
        />
      </div>

      {/* Texto */}
      <div className="border-r border-border">
        <textarea
          value={scene.dialogue || ''}
          onChange={(e) => onFieldChange(scene.id, 'dialogue', e.target.value)}
          placeholder="Texto / Diálogos..."
          className="w-full h-full min-h-[100px] resize-none bg-transparent px-3 py-3 text-sm text-text-primary placeholder:text-text-tertiary/30 focus:outline-none focus:bg-accent-500/[0.02] transition-colors"
        />
      </div>

      {/* Locução */}
      <div className="border-r border-border">
        <textarea
          value={scene.voiceover || ''}
          onChange={(e) => onFieldChange(scene.id, 'voiceover', e.target.value)}
          placeholder="Locução / Narração..."
          className="w-full h-full min-h-[100px] resize-none bg-transparent px-3 py-3 text-sm text-text-primary placeholder:text-text-tertiary/30 focus:outline-none focus:bg-accent-500/[0.02] transition-colors"
        />
      </div>

      {/* Delete */}
      <div className="flex items-start justify-center py-3">
        <button
          onClick={() => onDelete(scene.id)}
          className="text-text-tertiary/30 hover:text-red-400 transition-colors p-1 rounded-md hover:bg-red-500/10 opacity-0 group-hover/row:opacity-100"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

function RoteiroTableView({
  scenes,
  scriptId,
  onFieldChange,
  onDeleteScene,
  onAddScene,
  onDragEnd,
  sensors,
}: {
  scenes: Scene[]
  scriptId: string
  onFieldChange: (sceneId: string, field: keyof UpdateSceneData, value: any) => void
  onDeleteScene: (sceneId: string) => void
  onAddScene: () => void
  onDragEnd: (event: DragEndEvent) => void
  sensors: any
}) {
  return (
    <div className="p-4">
      <div className="rounded-xl border border-border overflow-hidden bg-card">
        {/* Header */}
        <div className="grid grid-cols-[72px_80px_120px_1fr_1fr_1fr_36px] border-b-2 border-border bg-bg-secondary/80">
          <div className="px-3 py-2.5 text-[11px] font-semibold text-accent-500 tracking-wider border-r border-border">
            Cena
          </div>
          <div className="px-3 py-2.5 text-[11px] font-semibold text-accent-500 tracking-wider border-r border-border text-center tabular-nums">
            00:00:00
          </div>
          <div className="px-3 py-2.5 text-[11px] font-semibold text-accent-500 tracking-wider border-r border-border text-center">
            Imagem
          </div>
          <div className="px-3 py-2.5 text-[11px] font-semibold text-accent-500 tracking-wider border-r border-border">
            Descrição
          </div>
          <div className="px-3 py-2.5 text-[11px] font-semibold text-accent-500 tracking-wider border-r border-border">
            Texto
          </div>
          <div className="px-3 py-2.5 text-[11px] font-semibold text-accent-500 tracking-wider border-r border-border">
            Locução
          </div>
          <div className="px-3 py-2.5" />
        </div>

        {/* Body */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={onDragEnd}
        >
          <SortableContext
            items={scenes.map((s) => s.id)}
            strategy={verticalListSortingStrategy}
          >
            {scenes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-text-tertiary">
                <Film className="h-10 w-10 opacity-20 mb-3" />
                <p className="text-sm">Nenhuma cena ainda</p>
                <p className="text-xs mt-1">Clique abaixo para adicionar a primeira cena</p>
              </div>
            ) : (
              scenes.map((scene, index) => (
                <SortableRoteiroRow
                  key={scene.id}
                  scene={scene}
                  index={index}
                  scriptId={scriptId}
                  onFieldChange={onFieldChange}
                  onDelete={onDeleteScene}
                />
              ))
            )}
          </SortableContext>
        </DndContext>

        {/* Add Scene */}
        <button
          onClick={onAddScene}
          className="flex w-full items-center justify-center gap-2 py-4 text-sm text-text-tertiary hover:text-text-secondary hover:bg-bg-hover/50 transition-colors border-t border-dashed border-border"
        >
          <Plus className="h-4 w-4" />
          Adicionar Cena
        </button>
      </div>
    </div>
  )
}

// ============================================
// MAIN SCRIPT EDITOR COMPONENT
// ============================================

interface ScriptEditorProps {
  script: ScriptWithScenes
  projectId: string
  projectTitle: string
  studioMode?: boolean
  initialAIOpen?: boolean
}

export function ScriptEditor({ script, projectId, projectTitle, studioMode, initialAIOpen }: ScriptEditorProps) {
  const router = useRouter()
  const [scenes, setScenes] = useState<Scene[]>(script.scenes || [])
  const [selectedSceneId, setSelectedSceneId] = useState<string | null>(
    script.scenes?.[0]?.id || null
  )
  const [viewMode, setViewMode] = useState<ScriptViewMode>('roteiro')
  const [isSaving, setIsSaving] = useState(false)
  const [scriptTitle, setScriptTitle] = useState(script.title)
  const [isAIPanelOpen, setIsAIPanelOpen] = useState(initialAIOpen ?? false)
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const selectedScene = scenes.find((s) => s.id === selectedSceneId) || null

  const totalDuration = scenes.reduce((sum, s) => sum + (s.duration || 0), 0)

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  // Auto-save scene changes with debounce
  const autoSaveScene = useCallback(
    (sceneId: string, data: UpdateSceneData) => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }

      saveTimeoutRef.current = setTimeout(async () => {
        try {
          setIsSaving(true)
          await updateScene(sceneId, data, script.id)
        } catch (error) {
          console.error('Auto-save error:', error)
        } finally {
          setIsSaving(false)
        }
      }, 800)
    },
    [script.id]
  )

  // Update local scene state + trigger auto-save
  const handleSceneFieldChange = useCallback(
    (field: keyof UpdateSceneData, value: any) => {
      if (!selectedSceneId) return

      setScenes((prev) =>
        prev.map((s) =>
          s.id === selectedSceneId ? { ...s, [field]: value } : s
        )
      )

      autoSaveScene(selectedSceneId, { [field]: value })
    },
    [selectedSceneId, autoSaveScene]
  )

  // Generic scene field change (for roteiro table view - any scene)
  const handleAnySceneFieldChange = useCallback(
    (sceneId: string, field: keyof UpdateSceneData, value: any) => {
      setScenes((prev) =>
        prev.map((s) =>
          s.id === sceneId ? { ...s, [field]: value } : s
        )
      )
      autoSaveScene(sceneId, { [field]: value })
    },
    [autoSaveScene]
  )

  // Drag end handler
  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event
      if (!over || active.id === over.id) return

      const oldIndex = scenes.findIndex((s) => s.id === active.id)
      const newIndex = scenes.findIndex((s) => s.id === over.id)

      const newScenes = arrayMove(scenes, oldIndex, newIndex)
      setScenes(newScenes)

      try {
        await reorderScenes(script.id, newScenes.map((s) => s.id))
        router.refresh()
      } catch (error) {
        console.error('Reorder error:', error)
        setScenes(scenes) // revert
      }
    },
    [scenes, script.id, router]
  )

  // Add new scene
  const handleAddScene = async () => {
    try {
      const newScene = await createScene({
        script_id: script.id,
        order: scenes.length + 1,
        title: `Cena ${scenes.length + 1}`,
        duration: 5,
      })

      setScenes((prev) => [...prev, newScene])
      setSelectedSceneId(newScene.id)
      router.refresh()
    } catch (error) {
      alert('Erro ao adicionar cena')
    }
  }

  // Delete scene
  const handleDeleteScene = async (sceneId: string) => {
    if (scenes.length <= 1) {
      alert('O roteiro precisa ter pelo menos uma cena')
      return
    }

    try {
      await deleteScene(sceneId, script.id)
      const newScenes = scenes.filter((s) => s.id !== sceneId)
      setScenes(newScenes)

      if (selectedSceneId === sceneId) {
        setSelectedSceneId(newScenes[0]?.id || null)
      }

      router.refresh()
    } catch (error) {
      alert('Erro ao remover cena')
    }
  }

  // Duplicate scene
  const handleDuplicateScene = async (sceneId: string) => {
    try {
      const newScene = await duplicateScene(sceneId, script.id)
      setScenes((prev) => [...prev, newScene])
      setSelectedSceneId(newScene.id)
      router.refresh()
    } catch (error) {
      alert('Erro ao duplicar cena')
    }
  }

  // Save script title
  const handleSaveTitle = async () => {
    if (scriptTitle === script.title) return
    try {
      await updateScript(script.id, { title: scriptTitle }, projectId)
    } catch (error) {
      console.error('Error saving title:', error)
    }
  }

  // Cleanup
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
    }
  }, [])

  const viewModes: { id: ScriptViewMode; label: string; icon: any }[] = [
    { id: 'roteiro', label: 'Tabela', icon: Table2 },
    { id: 'script', label: 'Editor', icon: FileText },
    { id: 'storyboard', label: 'Storyboard', icon: LayoutGrid },
    { id: 'timeline', label: 'Timeline', icon: Clock },
  ]

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      {/* Top Toolbar */}
      <div className="flex items-center justify-between border-b border-border bg-card px-4 py-3">
        <div className="flex items-center gap-3">
          <Link
            href={studioMode ? '/studio' as any : `/projects/${projectId}` as any}
            className="flex items-center gap-1.5 text-sm text-text-tertiary hover:text-text-primary transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            {studioMode ? 'Studio' : projectTitle}
          </Link>
          {studioMode && (
            <>
              <div className="h-4 w-px bg-border" />
              <span className="text-xs text-text-tertiary">{projectTitle}</span>
            </>
          )}
          <div className="h-4 w-px bg-border" />
          <input
            type="text"
            value={scriptTitle}
            onChange={(e) => setScriptTitle(e.target.value)}
            onBlur={handleSaveTitle}
            className="bg-transparent text-lg font-semibold text-text-primary focus:outline-none border-b border-transparent focus:border-accent-500/50 transition-colors"
          />
          <div className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${SCRIPT_STATUS_COLORS[script.status].bg} ${SCRIPT_STATUS_COLORS[script.status].text} border ${SCRIPT_STATUS_COLORS[script.status].border}`}>
            {SCRIPT_STATUS_LABELS[script.status]}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Total Duration */}
          <div className="flex items-center gap-1.5 text-sm text-text-secondary">
            <Timer className="h-4 w-4" />
            <span className="tabular-nums">{formatDuration(totalDuration)}</span>
            <span className="text-text-tertiary">({scenes.length} cenas)</span>
          </div>

          <div className="h-6 w-px bg-border" />

          {/* View Mode Toggle */}
          <div className="flex rounded-lg border border-border bg-bg-primary p-0.5">
            {viewModes.map((mode) => {
              const Icon = mode.icon
              return (
                <button
                  key={mode.id}
                  onClick={() => setViewMode(mode.id)}
                  className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                    viewMode === mode.id
                      ? 'bg-bg-secondary text-text-primary shadow-sm'
                      : 'text-text-tertiary hover:text-text-secondary'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {mode.label}
                </button>
              )
            })}
          </div>

          {/* Export PDF */}
          <ScriptExportPdf
            script={{ ...script, scenes }}
            projectTitle={projectTitle}
          />

          {/* AI Toggle */}
          <button
            onClick={() => setIsAIPanelOpen(!isAIPanelOpen)}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
              isAIPanelOpen
                ? 'bg-violet-500/15 text-violet-400 border border-violet-500/30'
                : 'bg-bg-primary text-text-tertiary hover:text-text-secondary border border-border hover:border-violet-500/30'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            Studio AI
          </button>

          {/* Save indicator */}
          {isSaving && (
            <div className="flex items-center gap-1.5 text-xs text-text-tertiary">
              <div className="h-2 w-2 animate-pulse rounded-full bg-amber-400" />
              Salvando...
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Scene List Sidebar (only in script mode) */}
        {viewMode === 'script' && (
          <div className="w-72 shrink-0 border-r border-border bg-card overflow-y-auto">
            <div className="p-3">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-semibold text-text-tertiary uppercase tracking-wider">
                  Cenas
                </h3>
                <button
                  onClick={handleAddScene}
                  className="flex items-center gap-1 rounded-md bg-accent-500/10 px-2 py-1 text-xs font-medium text-accent-500 hover:bg-accent-500/20 transition-colors"
                >
                  <Plus className="h-3 w-3" />
                  Nova
                </button>
              </div>

              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={scenes.map((s) => s.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-1">
                    {scenes.map((scene, index) => (
                      <SortableSceneItem
                        key={scene.id}
                        scene={scene}
                        index={index}
                        isSelected={selectedSceneId === scene.id}
                        onSelect={() => setSelectedSceneId(scene.id)}
                        onDelete={() => handleDeleteScene(scene.id)}
                        onDuplicate={() => handleDuplicateScene(scene.id)}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>

              {/* Add Scene Button */}
              <button
                onClick={handleAddScene}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border py-3 text-sm text-text-tertiary hover:border-text-tertiary hover:text-text-secondary transition-colors"
              >
                <Plus className="h-4 w-4" />
                Adicionar Cena
              </button>
            </div>
          </div>
        )}

        {/* Main Editor Area */}
        <div className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            {viewMode === 'roteiro' && (
              <motion.div
                key="roteiro"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full overflow-y-auto"
              >
                <RoteiroTableView
                  scenes={scenes}
                  scriptId={script.id}
                  onFieldChange={handleAnySceneFieldChange}
                  onDeleteScene={handleDeleteScene}
                  onAddScene={handleAddScene}
                  onDragEnd={handleDragEnd}
                  sensors={sensors}
                />
              </motion.div>
            )}

            {viewMode === 'storyboard' && (
              <motion.div
                key="storyboard"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <StoryboardView
                  scenes={scenes}
                  scriptId={script.id}
                  selectedSceneId={selectedSceneId}
                  onSelectScene={(id) => {
                    setSelectedSceneId(id)
                    setViewMode('script')
                  }}
                  onSceneUpdate={(sceneId, field, value) => {
                    setScenes((prev) =>
                      prev.map((s) =>
                        s.id === sceneId ? { ...s, [field]: value } : s
                      )
                    )
                    autoSaveScene(sceneId, { [field]: value })
                  }}
                />
              </motion.div>
            )}

            {viewMode === 'timeline' && (
              <motion.div
                key="timeline"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <TimelineView
                  scenes={scenes}
                  totalDuration={totalDuration}
                  selectedSceneId={selectedSceneId}
                  onSelectScene={setSelectedSceneId}
                />
              </motion.div>
            )}

            {viewMode === 'script' && selectedScene && (
              <motion.div
                key={`scene-${selectedScene.id}`}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="p-6 max-w-4xl mx-auto space-y-6"
              >
                {/* Scene Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      value={selectedScene.title || ''}
                      onChange={(e) => handleSceneFieldChange('title', e.target.value)}
                      placeholder="Nome da Cena"
                      className="bg-transparent text-xl font-bold text-text-primary focus:outline-none border-b border-transparent focus:border-accent-500/50 transition-colors"
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Duration Input */}
                    <div className="flex items-center gap-2 rounded-lg border border-border bg-bg-primary px-3 py-1.5">
                      <Timer className="h-4 w-4 text-text-tertiary" />
                      <input
                        type="number"
                        min="1"
                        max="3600"
                        value={selectedScene.duration || 0}
                        onChange={(e) =>
                          handleSceneFieldChange('duration', parseInt(e.target.value) || 0)
                        }
                        className="w-12 bg-transparent text-sm text-text-primary text-center focus:outline-none tabular-nums"
                      />
                      <span className="text-xs text-text-tertiary">seg</span>
                    </div>

                    {/* Start Time (read-only) */}
                    <span className="text-xs text-text-tertiary">
                      Início: {formatDuration(selectedScene.start_time || 0)}
                    </span>
                  </div>
                </div>

                {/* Storyboard Image Upload */}
                <StoryboardUpload
                  sceneId={selectedScene.id}
                  scriptId={script.id}
                  currentUrl={selectedScene.storyboard_url}
                  onUpload={(url) => handleSceneFieldChange('storyboard_url', url)}
                  onRemove={() => handleSceneFieldChange('storyboard_url', null)}
                />

                {/* Script Fields */}
                <div className="grid gap-4 lg:grid-cols-2">
                  <SceneField
                    icon={Eye}
                    label="Descrição Visual"
                    value={selectedScene.description || ''}
                    onChange={(v) => handleSceneFieldChange('description', v)}
                    placeholder="Descreva o que acontece visualmente nesta cena..."
                  />
                  <SceneField
                    icon={AlignLeft}
                    label="Ação"
                    value={selectedScene.action || ''}
                    onChange={(v) => handleSceneFieldChange('action', v)}
                    placeholder="Ações dos personagens..."
                  />
                  <SceneField
                    icon={Mic}
                    label="Diálogo"
                    value={selectedScene.dialogue || ''}
                    onChange={(v) => handleSceneFieldChange('dialogue', v)}
                    placeholder="Falas e diálogos..."
                  />
                  <SceneField
                    icon={Video}
                    label="Locução / Voiceover"
                    value={selectedScene.voiceover || ''}
                    onChange={(v) => handleSceneFieldChange('voiceover', v)}
                    placeholder="Texto do locutor..."
                  />
                  <SceneField
                    icon={Type}
                    label="Lettering / Grafismos"
                    value={selectedScene.lettering || ''}
                    onChange={(v) => handleSceneFieldChange('lettering', v)}
                    placeholder="Textos que aparecem na tela..."
                  />
                  <SceneField
                    icon={Music}
                    label="Sound Design"
                    value={selectedScene.sound_design || ''}
                    onChange={(v) => handleSceneFieldChange('sound_design', v)}
                    placeholder="Música, efeitos sonoros..."
                  />
                </div>

                {/* Camera & Technical */}
                <div className="rounded-xl border border-border bg-card p-4 space-y-4">
                  <h4 className="text-sm font-semibold text-text-primary flex items-center gap-2">
                    <Camera className="h-4 w-4 text-text-tertiary" />
                    Configurações de Câmera
                  </h4>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="space-y-1.5">
                      <label className="text-xs text-text-tertiary">Ângulo</label>
                      <select
                        value={selectedScene.camera_angle || ''}
                        onChange={(e) => handleSceneFieldChange('camera_angle', e.target.value || null)}
                        className="w-full rounded-lg border border-border bg-bg-primary px-3 py-2 text-sm text-text-primary focus:border-accent-500/50 focus:outline-none"
                      >
                        <option value="">Selecionar...</option>
                        {CAMERA_ANGLES.map((angle) => (
                          <option key={angle} value={angle}>{angle}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs text-text-tertiary">Movimento</label>
                      <select
                        value={selectedScene.camera_movement || ''}
                        onChange={(e) => handleSceneFieldChange('camera_movement', e.target.value || null)}
                        className="w-full rounded-lg border border-border bg-bg-primary px-3 py-2 text-sm text-text-primary focus:border-accent-500/50 focus:outline-none"
                      >
                        <option value="">Selecionar...</option>
                        {CAMERA_MOVEMENTS.map((movement) => (
                          <option key={movement} value={movement}>{movement}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs text-text-tertiary">Transição</label>
                      <select
                        value={selectedScene.transition || ''}
                        onChange={(e) => handleSceneFieldChange('transition', e.target.value || null)}
                        className="w-full rounded-lg border border-border bg-bg-primary px-3 py-2 text-sm text-text-primary focus:border-accent-500/50 focus:outline-none"
                      >
                        <option value="">Selecionar...</option>
                        {SCENE_TRANSITIONS.map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Production Notes */}
                <div className="grid gap-4 lg:grid-cols-2">
                  <SceneField
                    icon={MapPin}
                    label="Locação"
                    value={selectedScene.location_note || ''}
                    onChange={(v) => handleSceneFieldChange('location_note', v)}
                    placeholder="Informações sobre a locação..."
                    multiline={false}
                  />
                  <SceneField
                    icon={Wrench}
                    label="Equipamentos"
                    value={selectedScene.equipment_notes || ''}
                    onChange={(v) => handleSceneFieldChange('equipment_notes', v)}
                    placeholder="Equipamentos necessários..."
                    multiline={false}
                  />
                </div>

                {/* Notes */}
                <SceneField
                  icon={StickyNote}
                  label="Notas de Produção"
                  value={selectedScene.notes || ''}
                  onChange={(v) => handleSceneFieldChange('notes', v)}
                  placeholder="Observações gerais, referências, lembretes..."
                />
              </motion.div>
            )}

            {viewMode === 'script' && !selectedScene && (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex h-full items-center justify-center"
              >
                <div className="text-center space-y-3">
                  <Film className="h-12 w-12 text-text-tertiary mx-auto opacity-30" />
                  <p className="text-text-tertiary">Selecione uma cena para editar</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* AI Panel */}
        <AnimatePresence>
          {isAIPanelOpen && (
            <StudioAIPanel
              scriptId={script.id}
              scriptTitle={scriptTitle}
              scenesCount={scenes.length}
              isOpen={isAIPanelOpen}
              onClose={() => setIsAIPanelOpen(false)}
              onScenesUpdated={() => router.refresh()}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
