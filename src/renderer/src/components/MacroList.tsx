import React, { useState, useRef } from 'react'
import { useTheme } from '../ThemeContext'
import { MacroButton } from './MacroButton'
import type { Macro } from '../types/macro'

interface Props {
  macros: Macro[]
  onPaste: (content: string) => void
  onEdit: (macro: Macro) => void
  onDelete: (id: string) => void
  onReorder: (id: string, direction: 'up' | 'down') => void
}

export function MacroList({ macros, onPaste, onEdit, onDelete, onReorder }: Props) {
  const { theme } = useTheme()
  const sorted = [...macros].sort((a, b) => a.order - b.order)
  const [dragIdx, setDragIdx] = useState<number | null>(null)
  const [overIdx, setOverIdx] = useState<number | null>(null)
  const dragNode = useRef<HTMLDivElement | null>(null)

  const handleDragStart = (e: React.DragEvent, idx: number) => {
    setDragIdx(idx)
    dragNode.current = e.currentTarget as HTMLDivElement
    e.dataTransfer.effectAllowed = 'move'
    requestAnimationFrame(() => {
      if (dragNode.current) dragNode.current.style.opacity = '0.4'
    })
  }

  const handleDragEnd = () => {
    if (dragNode.current) dragNode.current.style.opacity = '1'
    if (dragIdx !== null && overIdx !== null && dragIdx !== overIdx) {
      const diff = overIdx - dragIdx
      const dir = diff > 0 ? 'down' : 'up'
      const id = sorted[dragIdx].id
      for (let i = 0; i < Math.abs(diff); i++) {
        onReorder(id, dir)
      }
    }
    setDragIdx(null)
    setOverIdx(null)
    dragNode.current = null
  }

  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setOverIdx(idx)
  }

  if (sorted.length === 0) {
    return (
      <div style={{ ...styles.empty, color: theme.textMuted }}>
        매크로가 없습니다.
        <br />
        <span style={{ fontSize: 11, color: theme.textDim }}>+ 버튼으로 추가하세요</span>
      </div>
    )
  }

  return (
    <div style={styles.list}>
      {sorted.map((macro, idx) => (
        <div
          key={macro.id}
          draggable
          onDragStart={(e) => handleDragStart(e, idx)}
          onDragEnd={handleDragEnd}
          onDragOver={(e) => handleDragOver(e, idx)}
          style={{
            borderTop:
              overIdx === idx && dragIdx !== null && dragIdx > idx
                ? `2px solid ${theme.accent}`
                : '2px solid transparent',
            borderBottom:
              overIdx === idx && dragIdx !== null && dragIdx < idx
                ? `2px solid ${theme.accent}`
                : '2px solid transparent',
            transition: 'border-color 0.15s'
          }}
        >
          <MacroButton macro={macro} onPaste={onPaste} onEdit={onEdit} onDelete={onDelete} />
        </div>
      ))}
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  list: {
    flex: 1,
    overflowY: 'auto',
    overflowX: 'hidden',
    padding: '4px 8px 8px',
    display: 'flex',
    flexDirection: 'column',
    gap: 2
  },
  empty: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 13,
    textAlign: 'center',
    padding: 20
  }
}
