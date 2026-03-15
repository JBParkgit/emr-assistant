import React, { useState } from 'react'
import { useTheme } from '../ThemeContext'
import type { Macro } from '../types/macro'

interface Props {
  macro: Macro
  onPaste: (content: string) => void
  onEdit: (macro: Macro) => void
  onDelete: (id: string) => void
}

export function MacroButton({ macro, onPaste, onEdit, onDelete }: Props) {
  const { theme } = useTheme()
  const [hover, setHover] = useState(false)

  return (
    <div
      style={{
        ...styles.item,
        background: hover ? theme.buttonBorder : theme.buttonBg,
        overflow: 'hidden',
        minWidth: 0
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <button
        style={{ ...styles.mainBtn, color: theme.text }}
        onClick={() => onPaste(macro.content)}
        onContextMenu={(e) => { e.preventDefault(); onEdit(macro) }}
        title={macro.content}
      >
        <span style={styles.titleRow}>
          <span style={styles.title}>{macro.title}</span>
          {macro.hotkey && (
            <span style={{ ...styles.hotkey, color: theme.accent, background: theme.bg }}>
              {macro.hotkey}
            </span>
          )}
        </span>
        <span style={{ ...styles.preview, color: theme.textDim }}>
          {macro.content.length > 50 ? macro.content.substring(0, 50) + '...' : macro.content}
        </span>
      </button>

      {hover && (
        <div style={styles.actions}>
          <button style={{ ...styles.actionBtn, color: theme.textDim }} onClick={() => onEdit(macro)} title="편집">
            &#9998;
          </button>
          <button
            style={{ ...styles.actionBtn, color: theme.danger }}
            onClick={() => {
              if (confirm(`"${macro.title}" 매크로를 삭제하시겠습니까?`)) {
                onDelete(macro.id)
              }
            }}
            title="삭제"
          >
            &#10005;
          </button>
        </div>
      )}
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  item: {
    display: 'flex',
    alignItems: 'stretch',
    borderRadius: 6,
    transition: 'background 0.15s',
    position: 'relative'
  },
  mainBtn: {
    flex: 1,
    background: 'none',
    border: 'none',
    textAlign: 'left',
    padding: '8px 10px',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    minWidth: 0,
    overflow: 'hidden',
    maxWidth: '100%'
  },
  titleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    minWidth: 0,
    maxWidth: '100%'
  },
  title: {
    fontSize: 13,
    fontWeight: 600,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: 'block',
    maxWidth: '100%'
  },
  hotkey: {
    fontSize: 10,
    borderRadius: 3,
    padding: '1px 5px',
    whiteSpace: 'nowrap',
    flexShrink: 0
  },
  preview: {
    fontSize: 11,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: 'block',
    maxWidth: '100%'
  },
  actions: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: 2,
    paddingRight: 6
  },
  actionBtn: {
    background: 'none',
    border: 'none',
    fontSize: 12,
    cursor: 'pointer',
    padding: '2px 4px',
    borderRadius: 3
  }
}
