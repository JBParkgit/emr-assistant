import { useState, useCallback, useEffect } from 'react'
import { TitleBar } from './components/TitleBar'
import { UserBar } from './components/UserBar'
import { SearchBar } from './components/SearchBar'
import { MacroList } from './components/MacroList'
import { MacroEditor } from './components/MacroEditor'
import { InputPrompt, extractInputFields, applyInputValues } from './components/InputPrompt'
import { SettingsPanel } from './components/SettingsPanel'
import { useMacros } from './hooks/useMacros'
import { useSearch } from './hooks/useSearch'
import { useTheme } from './ThemeContext'
import type { Macro, UserProfile } from './types/macro'

export default function App() {
  const { theme } = useTheme()
  const { data, loading, addMacro, updateMacro, deleteMacro, reorderMacro, reload } = useMacros()

  const [profiles, setProfiles] = useState<UserProfile[]>([])
  const [activeUserId, setActiveUserId] = useState('')
  const [showEditor, setShowEditor] = useState(false)
  const [editingMacro, setEditingMacro] = useState<Macro | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [pendingContent, setPendingContent] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([window.api.getProfiles(), window.api.getActiveUserId()]).then(([p, id]) => {
      setProfiles(p)
      setActiveUserId(id)
    })
    // Listen for hotkey-triggered pastes with input fields
    window.api.onHotkeyPaste((content) => {
      handlePaste(content)
    })
  }, [])

  const { query, setQuery, results } = useSearch(data.macros)

  const handlePaste = useCallback(async (content: string) => {
    const fields = extractInputFields(content)
    if (fields.length > 0) {
      setPendingContent(content)
    } else {
      await window.api.paste(content)
    }
  }, [])

  const handleInputSubmit = useCallback(async (values: Record<string, string>) => {
    if (pendingContent) {
      const processed = applyInputValues(pendingContent, values)
      setPendingContent(null)
      await window.api.paste(processed)
    }
  }, [pendingContent])

  const handleEdit = useCallback((macro: Macro) => {
    setEditingMacro(macro)
    setShowEditor(true)
  }, [])

  const handleAdd = useCallback(() => {
    setEditingMacro(null)
    setShowEditor(true)
  }, [])

  const handleSaveEditor = useCallback(
    (macro: Macro) => {
      if (editingMacro) {
        updateMacro(macro)
      } else {
        addMacro(macro)
      }
      setShowEditor(false)
      setEditingMacro(null)
    },
    [editingMacro, updateMacro, addMacro]
  )

  const handleSwitchUser = useCallback(
    async (userId: string) => {
      await window.api.switchUser(userId)
      setActiveUserId(userId)
      reload()
    },
    [reload]
  )

  const handleAddProfile = useCallback(async (name: string) => {
    const p = await window.api.addProfile(name)
    setProfiles((prev) => [...prev, p])
  }, [])

  const handleRenameProfile = useCallback(async (id: string, name: string) => {
    await window.api.renameProfile(id, name)
    setProfiles((prev) => prev.map((p) => (p.id === id ? { ...p, name } : p)))
  }, [])

  const handleDeleteProfile = useCallback(
    async (id: string) => {
      const ok = await window.api.deleteProfile(id)
      if (ok) {
        setProfiles((prev) => prev.filter((p) => p.id !== id))
        if (activeUserId === id) {
          const remaining = profiles.filter((p) => p.id !== id)
          if (remaining.length > 0) {
            await handleSwitchUser(remaining[0].id)
          }
        }
      }
    },
    [activeUserId, profiles, handleSwitchUser]
  )

  if (loading) {
    return (
      <div style={{ ...styles.container, background: theme.bg, color: theme.text, borderColor: theme.border }}>
        <TitleBar onSettings={() => {}} />
        <div style={styles.loading}>로딩 중...</div>
      </div>
    )
  }

  return (
    <div style={{ ...styles.container, background: theme.bg, color: theme.text, borderColor: theme.border }}>
      <TitleBar onSettings={() => setShowSettings(true)} />

      <UserBar
        profiles={profiles}
        activeUserId={activeUserId}
        onSwitch={handleSwitchUser}
        onAdd={handleAddProfile}
        onRename={handleRenameProfile}
        onDelete={handleDeleteProfile}
      />

      <SearchBar query={query} onChange={setQuery} onAdd={handleAdd} />

      <MacroList
        macros={results}
        onPaste={handlePaste}
        onEdit={handleEdit}
        onDelete={deleteMacro}
        onReorder={reorderMacro}
      />

      {showEditor && (
        <MacroEditor
          macro={editingMacro}
          allMacros={data.macros}
          onSave={handleSaveEditor}
          onClose={() => {
            setShowEditor(false)
            setEditingMacro(null)
          }}
        />
      )}

      {pendingContent && (
        <InputPrompt
          fields={extractInputFields(pendingContent)}
          onSubmit={handleInputSubmit}
          onCancel={() => setPendingContent(null)}
        />
      )}

      {showSettings && (
        <SettingsPanel
          profiles={profiles}
          activeUserId={activeUserId}
          onClose={() => setShowSettings(false)}
          onImport={async (json, userId) => {
            await window.api.importMacros(json, userId)
            if (userId === activeUserId) reload()
          }}
          onExport={(userId) => window.api.exportMacros(userId)}
        />
      )}
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    fontFamily: "'Segoe UI', 'Malgun Gothic', sans-serif",
    fontSize: 13,
    overflow: 'hidden',
    borderRadius: 8,
    border: '1px solid'
  },
  loading: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1
  }
}
