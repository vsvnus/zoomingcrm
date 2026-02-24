'use client'

import { useState, useRef } from 'react'
import { Download, FileText, Printer } from 'lucide-react'
import type { ScriptWithScenes, Scene } from '@/types/scripts'
import { SCRIPT_STATUS_LABELS } from '@/types/scripts'

interface ScriptExportPdfProps {
  script: ScriptWithScenes
  projectTitle: string
}

function formatDuration(seconds: number): string {
  if (!seconds || seconds <= 0) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export function ScriptExportPdf({ script, projectTitle }: ScriptExportPdfProps) {
  const [isExporting, setIsExporting] = useState(false)
  const printRef = useRef<HTMLDivElement>(null)

  const handleExport = () => {
    setIsExporting(true)

    // Small delay to allow rendering
    setTimeout(() => {
      const printContent = printRef.current
      if (!printContent) {
        setIsExporting(false)
        return
      }

      const printWindow = window.open('', '_blank')
      if (!printWindow) {
        alert('Permita pop-ups para exportar o PDF')
        setIsExporting(false)
        return
      }

      const totalDuration = script.scenes?.reduce((sum, s) => sum + (s.duration || 0), 0) || 0
      const scenes = script.scenes || []

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>${script.title} - Roteiro</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              color: #1a1a1a;
              line-height: 1.5;
              padding: 40px;
            }
            .header {
              text-align: center;
              margin-bottom: 40px;
              padding-bottom: 20px;
              border-bottom: 2px solid #e5e5e5;
            }
            .header h1 { font-size: 28px; margin-bottom: 8px; }
            .header .subtitle { color: #666; font-size: 14px; }
            .meta {
              display: flex;
              justify-content: center;
              gap: 24px;
              margin-top: 12px;
              font-size: 12px;
              color: #888;
            }
            .meta span { display: flex; align-items: center; gap: 4px; }
            .scene {
              page-break-inside: avoid;
              margin-bottom: 32px;
              border: 1px solid #e5e5e5;
              border-radius: 8px;
              overflow: hidden;
            }
            .scene-header {
              display: flex;
              align-items: center;
              justify-content: space-between;
              padding: 12px 16px;
              background: #f5f5f5;
              border-bottom: 1px solid #e5e5e5;
            }
            .scene-header .scene-num {
              display: flex;
              align-items: center;
              gap: 8px;
              font-weight: 700;
              font-size: 14px;
            }
            .scene-header .scene-num .num {
              display: flex;
              align-items: center;
              justify-content: center;
              width: 28px;
              height: 28px;
              border-radius: 6px;
              background: #1a1a1a;
              color: white;
              font-size: 12px;
            }
            .scene-header .scene-meta {
              font-size: 12px;
              color: #888;
            }
            .scene-body {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 0;
            }
            .scene-storyboard {
              border-right: 1px solid #e5e5e5;
              padding: 16px;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 180px;
              background: #fafafa;
            }
            .scene-storyboard img {
              max-width: 100%;
              max-height: 200px;
              border-radius: 6px;
            }
            .scene-storyboard .no-image {
              color: #ccc;
              font-size: 12px;
              text-align: center;
            }
            .scene-fields {
              padding: 16px;
            }
            .field {
              margin-bottom: 10px;
            }
            .field-label {
              font-size: 10px;
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              color: #999;
              margin-bottom: 3px;
            }
            .field-value {
              font-size: 13px;
              color: #333;
              white-space: pre-wrap;
            }
            .camera-row {
              display: flex;
              gap: 12px;
              margin-top: 8px;
              padding-top: 8px;
              border-top: 1px solid #eee;
            }
            .camera-tag {
              font-size: 11px;
              padding: 2px 8px;
              background: #f0f0f0;
              border-radius: 4px;
              color: #666;
            }
            .footer {
              margin-top: 40px;
              padding-top: 16px;
              border-top: 1px solid #e5e5e5;
              text-align: center;
              font-size: 11px;
              color: #aaa;
            }
            @media print {
              body { padding: 20px; }
              .scene { page-break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${escapeHtml(script.title)}</h1>
            <div class="subtitle">${escapeHtml(projectTitle)}</div>
            <div class="meta">
              <span>${scenes.length} cenas</span>
              <span>${formatDuration(totalDuration)} total</span>
              ${script.video_format ? `<span>${escapeHtml(script.video_format)}</span>` : ''}
              ${script.target_platform ? `<span>${escapeHtml(script.target_platform)}</span>` : ''}
              ${script.tone ? `<span>Tom: ${escapeHtml(script.tone)}</span>` : ''}
              <span>Status: ${SCRIPT_STATUS_LABELS[script.status]}</span>
            </div>
          </div>

          ${script.description ? `<p style="margin-bottom: 32px; color: #666; text-align: center; font-size: 14px;">${escapeHtml(script.description)}</p>` : ''}

          ${scenes.map((scene, index) => `
            <div class="scene">
              <div class="scene-header">
                <div class="scene-num">
                  <div class="num">${index + 1}</div>
                  ${escapeHtml(scene.title || 'Cena ' + (index + 1))}
                </div>
                <div class="scene-meta">
                  ${formatDuration(scene.start_time || 0)} - ${formatDuration((scene.start_time || 0) + (scene.duration || 0))}
                  (${formatDuration(scene.duration || 0)})
                </div>
              </div>
              <div class="scene-body">
                <div class="scene-storyboard">
                  ${scene.storyboard_url
                    ? `<img src="${escapeHtml(scene.storyboard_url)}" alt="Cena ${index + 1}" />`
                    : '<div class="no-image">Sem imagem<br/>de storyboard</div>'
                  }
                </div>
                <div class="scene-fields">
                  ${renderField('Descrição Visual', scene.description)}
                  ${renderField('Ação', scene.action)}
                  ${renderField('Diálogo', scene.dialogue)}
                  ${renderField('Locução', scene.voiceover)}
                  ${renderField('Lettering', scene.lettering)}
                  ${renderField('Sound Design', scene.sound_design)}
                  ${renderField('Notas', scene.notes)}
                  ${(scene.camera_angle || scene.camera_movement || scene.transition) ? `
                    <div class="camera-row">
                      ${scene.camera_angle ? `<span class="camera-tag">${escapeHtml(scene.camera_angle)}</span>` : ''}
                      ${scene.camera_movement ? `<span class="camera-tag">${escapeHtml(scene.camera_movement)}</span>` : ''}
                      ${scene.transition ? `<span class="camera-tag">${escapeHtml(scene.transition)}</span>` : ''}
                    </div>
                  ` : ''}
                  ${scene.location_note ? renderField('Locação', scene.location_note) : ''}
                  ${scene.equipment_notes ? renderField('Equipamentos', scene.equipment_notes) : ''}
                </div>
              </div>
            </div>
          `).join('')}

          <div class="footer">
            Gerado por Zooming CRM - ${new Date().toLocaleDateString('pt-BR')}
          </div>
        </body>
        </html>
      `)

      printWindow.document.close()

      // Wait for images to load then trigger print
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print()
          setIsExporting(false)
        }, 500)
      }

      // Fallback if onload doesn't fire
      setTimeout(() => {
        setIsExporting(false)
      }, 3000)
    }, 100)
  }

  return (
    <button
      onClick={handleExport}
      disabled={isExporting}
      className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-bg-hover transition-colors disabled:opacity-50"
      title="Exportar PDF / Imprimir"
    >
      {isExporting ? (
        <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-text-tertiary/30 border-t-text-secondary" />
      ) : (
        <Printer className="h-3.5 w-3.5" />
      )}
      PDF
    </button>
  )
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/\n/g, '<br/>')
}

function renderField(label: string, value?: string | null): string {
  if (!value) return ''
  return `
    <div class="field">
      <div class="field-label">${escapeHtml(label)}</div>
      <div class="field-value">${escapeHtml(value)}</div>
    </div>
  `
}
