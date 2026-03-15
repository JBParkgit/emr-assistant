import React from 'react'
import { useTheme } from '../ThemeContext'

interface Props {
  query: string
  onChange: (q: string) => void
  onAdd: () => void
}

export function SearchBar({ query, onChange, onAdd }: Props) {
  const { theme } = useTheme()

  return (
    <div style={styles.bar}>
      <input
        style={{ ...styles.input, background: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }}
        type="text"
        placeholder="매크로 검색..."
        value={query}
        onChange={(e) => onChange(e.target.value)}
      />
      <button style={{ ...styles.addBtn, background: theme.success, color: theme.bg }} onClick={onAdd} title="매크로 추가">
        +
      </button>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  bar: {
    display: 'flex',
    gap: 6,
    padding: '8px 8px 4px',
    flexShrink: 0
  },
  input: {
    flex: 1,
    border: '1px solid',
    borderRadius: 6,
    fontSize: 13,
    padding: '6px 10px',
    outline: 'none'
  },
  addBtn: {
    border: 'none',
    borderRadius: 6,
    fontSize: 18,
    width: 32,
    cursor: 'pointer',
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }
}
