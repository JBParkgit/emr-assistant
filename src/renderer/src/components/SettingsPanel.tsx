import React, { useState, useEffect, useRef } from 'react'
import { useTheme } from '../ThemeContext'
import { themes } from '../themes'
import type { AppSettings, UserProfile } from '../types/macro'

interface Props {
  profiles: UserProfile[]
  activeUserId: string
  onClose: () => void
  onImport: (json: string, userId: string) => void
  onExport: (userId: string) => Promise<string>
}

export function SettingsPanel({ profiles, activeUserId, onClose, onImport, onExport }: Props) {
  const { theme, themeId, setThemeId } = useTheme()
  const [settings, setSettings] = useState<AppSettings>({ pasteDelay: 100, opacity: 1.0, initialHeight: 700, activeUserId: '' })
  const [currentHeight, setCurrentHeight] = useState(700)
  const [exportUserId, setExportUserId] = useState(activeUserId)
  const [importUserId, setImportUserId] = useState(activeUserId)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    window.api.getSettings().then((s) => {
      setSettings(s)
    })
    window.api.getWindowHeight().then((h) => {
      setCurrentHeight(h)
      setSettings((s) => ({ ...s, initialHeight: h }))
    })
  }, [])

  const handleOpacityChange = (val: number) => {
    const clamped = Math.max(0.3, Math.min(1, val))
    setSettings((s) => ({ ...s, opacity: clamped }))
    window.api.updateSettings({ opacity: clamped })
  }

  const handleExport = async () => {
    const json = await onExport(exportUserId)
    const userName = profiles.find((p) => p.id === exportUserId)?.name || 'unknown'
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `emr-macros-${userName}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const json = reader.result as string
        JSON.parse(json)
        onImport(json, importUserId)
        const userName = profiles.find((p) => p.id === importUserId)?.name || ''
        alert(`"${userName}"에 가져오기 완료!`)
      } catch {
        alert('올바른 JSON 파일이 아닙니다.')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const selectStyle: React.CSSProperties = {
    background: theme.inputBg,
    border: `1px solid ${theme.inputBorder}`,
    borderRadius: 4,
    color: theme.text,
    fontSize: 12,
    padding: '4px 6px',
    outline: 'none',
    flex: 1
  }

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={{ ...styles.panel, background: theme.bg, borderColor: theme.buttonBorder }} onClick={(e) => e.stopPropagation()}>
        <div style={{ ...styles.header, borderBottomColor: theme.border }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: theme.text }}>설정</span>
          <button style={{ background: 'none', border: 'none', color: theme.textDim, fontSize: 14, cursor: 'pointer' }} onClick={onClose}>
            &#10005;
          </button>
        </div>

        <div style={styles.body}>
          {/* Theme selector */}
          <span style={{ fontSize: 12, color: theme.textDim, fontWeight: 600 }}>테마</span>
          <div style={styles.themeGrid}>
            {Object.values(themes).map((t) => (
              <button
                key={t.id}
                onClick={() => setThemeId(t.id)}
                style={{
                  ...styles.themeBtn,
                  background: t.bg,
                  borderColor: themeId === t.id ? t.accent : t.border,
                  borderWidth: themeId === t.id ? 2 : 1,
                  color: t.text
                }}
              >
                <span style={{ ...styles.themePreview, background: t.accent }} />
                <span style={{ fontSize: 11 }}>{t.name}</span>
              </button>
            ))}
          </div>

          <div style={{ ...styles.divider, background: theme.border }} />

          {/* Initial Height */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={styles.row}>
              <label style={{ fontSize: 13, color: theme.text, minWidth: 70 }}>초기 높이</label>
              <input
                type="number"
                min="300"
                max="1600"
                step="10"
                value={settings.initialHeight || 700}
                onChange={(e) => {
                  const val = Number(e.target.value)
                  if (val >= 300 && val <= 1600) {
                    setSettings((s) => ({ ...s, initialHeight: val }))
                    window.api.updateSettings({ initialHeight: val })
                    window.api.resizeHeight(val)
                  }
                }}
                style={{
                  width: 60,
                  background: theme.inputBg,
                  border: `1px solid ${theme.inputBorder}`,
                  borderRadius: 4,
                  color: theme.text,
                  fontSize: 13,
                  padding: '4px 6px',
                  outline: 'none',
                  textAlign: 'right'
                }}
              />
              <span style={{ fontSize: 12, color: theme.textDim }}>px</span>
            </div>
            <input
              type="range"
              min="300"
              max="1600"
              step="10"
              value={settings.initialHeight || 700}
              onChange={(e) => {
                const val = Number(e.target.value)
                setSettings((s) => ({ ...s, initialHeight: val }))
                window.api.updateSettings({ initialHeight: val })
                window.api.resizeHeight(val)
              }}
              style={{ width: '100%', accentColor: theme.accent }}
            />
          </div>

          {/* Opacity */}
          <div style={styles.row}>
            <label style={{ fontSize: 13, color: theme.text, minWidth: 70 }}>투명도</label>
            <input
              type="range"
              min="0.3"
              max="1"
              step="0.05"
              value={settings.opacity}
              onChange={(e) => handleOpacityChange(Number(e.target.value))}
              style={{ flex: 1, accentColor: theme.accent }}
            />
            <span style={{ fontSize: 12, color: theme.textDim, minWidth: 44, textAlign: 'right' }}>
              {Math.round((settings.opacity ?? 1) * 100)}%
            </span>
          </div>

          <div style={{ ...styles.divider, background: theme.border }} />

          {/* Data management */}
          <span style={{ fontSize: 12, color: theme.textDim, fontWeight: 600 }}>데이터 관리</span>

          {/* Export */}
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <select style={selectStyle} value={exportUserId} onChange={(e) => setExportUserId(e.target.value)}>
              {profiles.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <button
              style={{ ...styles.actionBtn, background: theme.buttonBg, borderColor: theme.buttonBorder, color: theme.text, flex: 'none', padding: '5px 12px' }}
              onClick={handleExport}
            >
              내보내기
            </button>
          </div>

          {/* Import */}
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <select style={selectStyle} value={importUserId} onChange={(e) => setImportUserId(e.target.value)}>
              {profiles.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <button
              style={{ ...styles.actionBtn, background: theme.buttonBg, borderColor: theme.buttonBorder, color: theme.text, flex: 'none', padding: '5px 12px' }}
              onClick={handleImport}
            >
              가져오기
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
          </div>

          <div style={{ ...styles.divider, background: theme.border }} />

          <div style={{ fontSize: 11, color: theme.textMuted, lineHeight: 1.8 }}>
            <p>Alt + Space: 창 표시/숨기기</p>
            <p>매크로 클릭: EMR에 자동 붙여넣기</p>
            <p>사용자 우클릭: 이름 변경/삭제</p>
          </div>
        </div>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100
  },
  panel: {
    border: '1px solid',
    borderRadius: 10,
    width: '90%',
    maxWidth: 320,
    maxHeight: '90vh',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 14px',
    borderBottom: '1px solid'
  },
  body: {
    padding: '12px 14px',
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    overflowY: 'auto',
    flex: 1,
    minHeight: 0
  },
  themeGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 6
  },
  themeBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '8px 10px',
    borderRadius: 6,
    border: '1px solid',
    cursor: 'pointer',
    transition: 'border-color 0.15s'
  },
  themePreview: {
    width: 14,
    height: 14,
    borderRadius: '50%',
    flexShrink: 0
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    gap: 8
  },
  divider: {
    height: 1,
    margin: '4px 0'
  },
  actionBtn: {
    border: '1px solid',
    borderRadius: 6,
    fontSize: 12,
    cursor: 'pointer',
    whiteSpace: 'nowrap'
  }
}
