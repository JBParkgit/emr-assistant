import React, { useState } from 'react'
import type { Category } from '../types/macro'

interface Props {
  categories: Category[]
  activeId: string
  onSelect: (id: string) => void
  onAdd: (name: string, shortName: string, color?: string) => void
  onUpdate: (category: Category) => void
  onDelete: (id: string) => void
}

export function CategoryTabs({ categories, activeId, onSelect, onAdd, onDelete }: Props) {
  const [showAdd, setShowAdd] = useState(false)
  const [newName, setNewName] = useState('')
  const [newShort, setNewShort] = useState('')

  const sorted = [...categories].sort((a, b) => a.order - b.order)

  const handleAdd = () => {
    if (newName.trim()) {
      onAdd(newName.trim(), newShort.trim() || newName.trim().charAt(0))
      setNewName('')
      setNewShort('')
      setShowAdd(false)
    }
  }

  return (
    <div style={styles.wrapper}>
      <div style={styles.tabs}>
        {sorted.map((cat) => (
          <button
            key={cat.id}
            style={{
              ...styles.tab,
              ...(activeId === cat.id ? styles.activeTab : {}),
              borderBottomColor: activeId === cat.id ? cat.color || '#89b4fa' : 'transparent'
            }}
            onClick={() => onSelect(cat.id)}
            onContextMenu={(e) => {
              e.preventDefault()
              if (cat.id !== 'all' && cat.id !== 'favorites') {
                if (confirm(`"${cat.name}" 카테고리를 삭제하시겠습니까?\n해당 카테고리의 매크로도 함께 삭제됩니다.`)) {
                  onDelete(cat.id)
                }
              }
            }}
            title={cat.name}
          >
            {cat.shortName}
          </button>
        ))}
        <button style={styles.addBtn} onClick={() => setShowAdd(!showAdd)} title="카테고리 추가">
          +
        </button>
      </div>

      {showAdd && (
        <div style={styles.addForm}>
          <input
            style={styles.input}
            placeholder="이름"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            autoFocus
          />
          <input
            style={{ ...styles.input, width: 40 }}
            placeholder="약칭"
            value={newShort}
            onChange={(e) => setNewShort(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            maxLength={3}
          />
          <button style={styles.confirmBtn} onClick={handleAdd}>
            추가
          </button>
        </div>
      )}
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    flexShrink: 0
  },
  tabs: {
    display: 'flex',
    gap: 2,
    padding: '4px 8px 0',
    overflowX: 'auto',
    overflowY: 'hidden',
    background: '#181825',
    scrollbarWidth: 'none' as any
  },
  tab: {
    background: 'none',
    border: 'none',
    borderBottom: '2px solid transparent',
    color: '#6c7086',
    fontSize: 12,
    padding: '6px 10px',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    transition: 'color 0.15s'
  },
  activeTab: {
    color: '#cdd6f4',
    fontWeight: 600
  },
  addBtn: {
    background: 'none',
    border: 'none',
    color: '#45475a',
    fontSize: 14,
    padding: '6px 8px',
    cursor: 'pointer'
  },
  addForm: {
    display: 'flex',
    gap: 4,
    padding: '6px 8px',
    background: '#181825',
    borderBottom: '1px solid #313244'
  },
  input: {
    flex: 1,
    background: '#313244',
    border: '1px solid #45475a',
    borderRadius: 4,
    color: '#cdd6f4',
    fontSize: 12,
    padding: '4px 8px',
    outline: 'none'
  },
  confirmBtn: {
    background: '#89b4fa',
    border: 'none',
    borderRadius: 4,
    color: '#1e1e2e',
    fontSize: 12,
    padding: '4px 10px',
    cursor: 'pointer',
    fontWeight: 600
  }
}
