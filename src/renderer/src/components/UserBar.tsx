import React, { useState } from 'react'
import { useTheme } from '../ThemeContext'
import type { UserProfile } from '../types/macro'

interface Props {
  profiles: UserProfile[]
  activeUserId: string
  onSwitch: (userId: string) => void
  onAdd: (name: string) => void
  onRename: (id: string, name: string) => void
  onDelete: (id: string) => void
}

export function UserBar({ profiles, activeUserId, onSwitch, onAdd, onRename, onDelete }: Props) {
  const { theme } = useTheme()
  const [showAdd, setShowAdd] = useState(false)
  const [newName, setNewName] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')

  const handleAdd = () => {
    if (newName.trim()) {
      onAdd(newName.trim())
      setNewName('')
      setShowAdd(false)
    }
  }

  const startRename = (p: UserProfile) => {
    setEditingId(p.id)
    setEditName(p.name)
  }

  const handleRename = () => {
    if (editingId && editName.trim()) {
      onRename(editingId, editName.trim())
      setEditingId(null)
    }
  }

  return (
    <div style={{ flexShrink: 0, borderBottom: `1px solid ${theme.border}` }}>
      <div style={styles.bar}>
        {profiles.map((p) => (
          <button
            key={p.id}
            style={{
              ...styles.userBtn,
              background: p.id === activeUserId ? theme.accent : theme.buttonBg,
              borderColor: p.id === activeUserId ? theme.accent : theme.buttonBorder,
              color: p.id === activeUserId ? theme.accentText : theme.textDim,
              fontWeight: p.id === activeUserId ? 600 : 400
            }}
            onClick={() => onSwitch(p.id)}
            onContextMenu={(e) => {
              e.preventDefault()
              startRename(p)
            }}
            title={`${p.name} (우클릭: 이름 변경)`}
          >
            {p.name}
          </button>
        ))}
        <button
          style={{ ...styles.addBtn, borderColor: theme.buttonBorder, color: theme.textMuted }}
          onClick={() => setShowAdd(!showAdd)}
          title="사용자 추가"
        >
          +
        </button>
      </div>

      {showAdd && (
        <div style={styles.inputRow}>
          <input
            style={{ ...styles.input, background: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }}
            placeholder="사용자 이름"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            autoFocus
          />
          <button style={{ ...styles.confirmBtn, background: theme.accent, color: theme.accentText }} onClick={handleAdd}>추가</button>
        </div>
      )}

      {editingId && (
        <div style={{ padding: '4px 8px 6px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          <input
            style={{ ...styles.input, background: theme.inputBg, borderColor: theme.inputBorder, color: theme.text, width: '100%' }}
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleRename()
              if (e.key === 'Escape') setEditingId(null)
            }}
            autoFocus
          />
          <div style={{ display: 'flex', gap: 4 }}>
            <button style={{ ...styles.confirmBtn, flex: 1, background: theme.accent, color: theme.accentText }} onClick={handleRename}>변경</button>
            {profiles.length > 1 && (
              <button
                style={{ ...styles.confirmBtn, flex: 1, background: theme.danger, color: theme.accentText }}
                onClick={() => {
                  if (confirm(`"${profiles.find((p) => p.id === editingId)?.name}" 사용자를 삭제하시겠습니까?`)) {
                    onDelete(editingId)
                    setEditingId(null)
                  }
                }}
              >
                삭제
              </button>
            )}
            <button style={{ ...styles.confirmBtn, flex: 1, background: theme.buttonBorder, color: theme.text }} onClick={() => setEditingId(null)}>취소</button>
          </div>
        </div>
      )}
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  bar: {
    display: 'flex',
    gap: 4,
    padding: '6px 8px',
    overflowX: 'auto',
    overflowY: 'hidden',
    scrollbarWidth: 'none' as any
  },
  userBtn: {
    border: '1px solid',
    borderRadius: 6,
    fontSize: 12,
    padding: '4px 12px',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    transition: 'all 0.15s'
  },
  addBtn: {
    background: 'none',
    border: '1px dashed',
    borderRadius: 6,
    fontSize: 14,
    padding: '4px 10px',
    cursor: 'pointer'
  },
  inputRow: {
    display: 'flex',
    gap: 4,
    padding: '4px 8px 6px',
    alignItems: 'center'
  },
  input: {
    flex: 1,
    border: '1px solid',
    borderRadius: 4,
    fontSize: 12,
    padding: '4px 8px',
    outline: 'none'
  },
  confirmBtn: {
    border: 'none',
    borderRadius: 4,
    fontSize: 12,
    padding: '4px 10px',
    cursor: 'pointer',
    fontWeight: 600
  }
}
