import React, { useState, useEffect } from 'react'
import { useTheme } from '../ThemeContext'

interface Props {
  onSettings: () => void
}

export function TitleBar({ onSettings }: Props) {
  const { theme } = useTheme()
  const [pinned, setPinned] = useState(true)

  useEffect(() => {
    window.api.isAlwaysOnTop().then(setPinned)
  }, [])

  const handleTogglePin = async () => {
    const next = await window.api.toggleAlwaysOnTop()
    setPinned(next)
  }

  return (
    <div style={{ ...styles.bar, background: theme.bgSecondary, borderBottomColor: theme.border }}>
      <div style={styles.dragArea}>
        <span style={{ ...styles.title, color: theme.text }}>EMR Assistant</span>
      </div>
      <div style={styles.controls}>
        <button
          style={{
            ...styles.pinBtn,
            background: pinned ? theme.accent : 'transparent',
            color: pinned ? theme.accentText : theme.textMuted,
            border: pinned ? 'none' : `1px solid ${theme.textMuted}`
          }}
          onClick={handleTogglePin}
          title={pinned ? '항상 위에 (활성)' : '항상 위에 (비활성)'}
        >
          PIN
        </button>
        <button style={{ ...styles.btn, color: theme.textDim }} onClick={onSettings} title="설정">
          &#9881;
        </button>
        <button style={{ ...styles.btn, color: theme.textDim }} onClick={() => window.api.minimize()} title="최소화">
          &#8722;
        </button>
        <button style={{ ...styles.btn, color: theme.danger }} onClick={() => window.api.close()} title="닫기">
          &#10005;
        </button>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  bar: {
    display: 'flex',
    alignItems: 'center',
    height: 32,
    // @ts-ignore
    WebkitAppRegion: 'drag',
    userSelect: 'none',
    borderBottom: '1px solid',
    flexShrink: 0
  },
  dragArea: {
    flex: 1,
    paddingLeft: 12,
    display: 'flex',
    alignItems: 'center'
  },
  title: {
    fontSize: 12,
    fontWeight: 600
  },
  controls: {
    display: 'flex',
    // @ts-ignore
    WebkitAppRegion: 'no-drag'
  },
  pinBtn: {
    fontSize: 9,
    fontWeight: 700,
    borderRadius: 4,
    padding: '2px 6px',
    cursor: 'pointer',
    marginRight: 2,
    lineHeight: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  btn: {
    background: 'none',
    border: 'none',
    fontSize: 14,
    width: 36,
    height: 32,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }
}
