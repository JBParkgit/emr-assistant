import React, { useState, useRef } from 'react'
import { useTheme } from '../ThemeContext'
import type { Macro } from '../types/macro'

interface Props {
  macro: Macro | null
  allMacros?: Macro[]
  onSave: (macro: Macro) => void
  onClose: () => void
}

const RESERVED_KEYS = ['Alt+Space']

export function MacroEditor({ macro, allMacros = [], onSave, onClose }: Props) {
  const { theme } = useTheme()
  const [title, setTitle] = useState(macro?.title || '')
  const [content, setContent] = useState(macro?.content || '')
  const [hotkey, setHotkey] = useState(macro?.hotkey || '')
  const [showFieldInput, setShowFieldInput] = useState(false)
  const [fieldName, setFieldName] = useState('')
  const fieldInputRef = useRef<HTMLInputElement>(null)

  const hotkeyConflict = hotkey
    ? RESERVED_KEYS.includes(hotkey)
      ? '시스템 단축키(창 토글)와 겹칩니다'
      : allMacros.find((m) => m.id !== macro?.id && m.hotkey === hotkey)
        ? `"${allMacros.find((m) => m.id !== macro?.id && m.hotkey === hotkey)!.title}"과(와) 겹칩니다`
        : ''
    : ''

  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const insertAtCursor = (text: string) => {
    const ta = textareaRef.current
    if (!ta) {
      setContent((c) => c + text)
      return
    }
    const start = ta.selectionStart
    const end = ta.selectionEnd
    const newContent = content.substring(0, start) + text + content.substring(end)
    setContent(newContent)
    requestAnimationFrame(() => {
      ta.selectionStart = ta.selectionEnd = start + text.length
      ta.focus()
    })
  }

  const handleInsertInput = () => {
    setShowFieldInput(true)
    setFieldName('')
    requestAnimationFrame(() => fieldInputRef.current?.focus())
  }

  const confirmFieldInsert = () => {
    if (fieldName.trim()) {
      insertAtCursor(`{{input:${fieldName.trim()}}}`)
    }
    setShowFieldInput(false)
    setFieldName('')
  }

  const handleHotkeyCapture = (e: React.KeyboardEvent) => {
    e.preventDefault()
    if (e.key === 'Backspace' || e.key === 'Delete') {
      setHotkey('')
      return
    }
    if (e.key === 'Escape') return
    if (['Control', 'Shift', 'Alt', 'Meta'].includes(e.key)) return

    const parts: string[] = []
    if (e.ctrlKey) parts.push('Ctrl')
    if (e.shiftKey) parts.push('Shift')
    if (e.altKey) parts.push('Alt')
    if (parts.length === 0) return

    let key = e.key.length === 1 ? e.key.toUpperCase() : e.key
    if (key === ' ') key = 'Space'
    parts.push(key)
    setHotkey(parts.join('+'))
  }

  const handleSave = () => {
    if (!title.trim() || !content.trim()) return
    onSave({
      id: macro?.id || '',
      title: title.trim(),
      content,
      order: macro?.order || 0,
      hotkey: hotkey || undefined
    })
  }

  const inputStyle: React.CSSProperties = {
    background: theme.inputBg,
    border: `1px solid ${theme.inputBorder}`,
    borderRadius: 6,
    color: theme.text,
    fontSize: 13,
    padding: '7px 10px',
    outline: 'none'
  }

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={{ ...styles.modal, background: theme.bg, borderColor: theme.buttonBorder }} onClick={(e) => e.stopPropagation()}>
        <div style={{ ...styles.header, borderBottomColor: theme.border }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: theme.text }}>
            {macro ? '매크로 편집' : '매크로 추가'}
          </span>
          <button style={{ background: 'none', border: 'none', color: theme.textDim, fontSize: 14, cursor: 'pointer' }} onClick={onClose}>
            &#10005;
          </button>
        </div>

        <div style={styles.body}>
          <label style={{ fontSize: 11, color: theme.textDim, fontWeight: 600, marginTop: 4 }}>이름</label>
          <input
            style={inputStyle}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="매크로 이름"
            autoFocus
          />

          <label style={{ fontSize: 11, color: theme.textDim, fontWeight: 600, marginTop: 4 }}>단축키 (선택)</label>
          <div style={{ position: 'relative' }}>
            <input
              style={inputStyle}
              value={hotkey || ''}
              placeholder="클릭 후 단축키 입력 (예: Ctrl+1)"
              onKeyDown={(e) => {
                e.preventDefault()
                e.stopPropagation()
                handleHotkeyCapture(e)
              }}
              onChange={() => {}}
            />
            {hotkey && (
              <button
                style={{ position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: theme.textDim, fontSize: 11, cursor: 'pointer', padding: '2px 4px' }}
                onClick={() => setHotkey('')}
                title="단축키 삭제"
              >
                &#10005;
              </button>
            )}
          </div>
          {hotkeyConflict && (
            <span style={{ fontSize: 11, color: theme.danger, marginTop: -2 }}>{hotkeyConflict}</span>
          )}

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
            <label style={{ fontSize: 11, color: theme.textDim, fontWeight: 600 }}>내용</label>
            <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
              {showFieldInput ? (
                <>
                  <input
                    ref={fieldInputRef}
                    style={{
                      background: theme.inputBg,
                      border: `1px solid ${theme.accent}`,
                      borderRadius: 4,
                      color: theme.text,
                      fontSize: 11,
                      padding: '2px 6px',
                      outline: 'none',
                      width: 100
                    }}
                    value={fieldName}
                    onChange={(e) => setFieldName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') confirmFieldInsert()
                      if (e.key === 'Escape') { setShowFieldInput(false); setFieldName('') }
                    }}
                    placeholder="필드 이름"
                  />
                  <button style={{ ...styles.insertBtn, background: theme.accent, color: theme.accentText }} onClick={confirmFieldInsert}>
                    삽입
                  </button>
                </>
              ) : (
                <button style={{ ...styles.insertBtn, background: theme.bgTertiary, color: theme.accent }} onClick={handleInsertInput} title="입력 필드 삽입">
                  + 입력필드
                </button>
              )}
            </div>
          </div>
          <textarea
            ref={textareaRef}
            style={{
              ...inputStyle,
              resize: 'vertical',
              fontFamily: "'Segoe UI', 'Malgun Gothic', monospace",
              lineHeight: 1.5
            }}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={"매크로 텍스트를 자유롭게 입력하세요.\n줄바꿈, 특수문자 모두 허용됩니다.\n\n입력필드: {{input:수술 후 일수}}"}
            rows={8}
          />
        </div>

        <div style={{ ...styles.footer, borderTopColor: theme.border }}>
          <button
            style={{ ...styles.footerBtn, background: theme.buttonBorder, color: theme.text }}
            onClick={onClose}
          >
            취소
          </button>
          <button
            style={{
              ...styles.footerBtn,
              background: theme.accent,
              color: theme.accentText,
              fontWeight: 600,
              opacity: title.trim() && content.trim() ? 1 : 0.5
            }}
            onClick={handleSave}
            disabled={!title.trim() || !content.trim()}
          >
            저장
          </button>
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
  modal: {
    border: '1px solid',
    borderRadius: 10,
    width: '90%',
    maxWidth: 340,
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
    overflowY: 'auto',
    overflowX: 'hidden',
    flex: 1,
    minHeight: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 6
  },
  footer: {
    display: 'flex',
    gap: 8,
    padding: '10px 14px',
    borderTop: '1px solid',
    justifyContent: 'flex-end'
  },
  insertBtn: {
    border: 'none',
    borderRadius: 4,
    fontSize: 10,
    padding: '2px 6px',
    cursor: 'pointer',
    fontWeight: 600
  },
  footerBtn: {
    border: 'none',
    borderRadius: 6,
    fontSize: 13,
    padding: '7px 16px',
    cursor: 'pointer'
  }
}
