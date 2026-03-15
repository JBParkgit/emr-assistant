import React, { useState, useEffect, useRef } from 'react'
import { useTheme } from '../ThemeContext'

export interface InputField {
  type: 'input' | 'select'
  label: string
  placeholder: string
  options?: string[]  // for select fields
}

interface Props {
  fields: InputField[]
  onSubmit: (values: Record<string, string>) => void
  onCancel: () => void
}

export function extractInputFields(content: string): InputField[] {
  const fields: InputField[] = []
  const seen = new Set<string>()

  // Match {{input:label}} and {{select:label:opt1,opt2,opt3}}
  const regex = /\{\{(input|select):([^}]+)\}\}/g
  let match: RegExpExecArray | null
  while ((match = regex.exec(content)) !== null) {
    const type = match[1] as 'input' | 'select'
    const raw = match[2]

    if (type === 'select') {
      const colonIdx = raw.indexOf(':')
      if (colonIdx === -1) continue
      const label = raw.substring(0, colonIdx).trim()
      const options = raw.substring(colonIdx + 1).split(',').map((o) => o.trim()).filter(Boolean)
      if (!seen.has(label) && options.length > 0) {
        seen.add(label)
        fields.push({ type: 'select', label, placeholder: label, options })
      }
    } else {
      const label = raw.trim()
      if (!seen.has(label)) {
        seen.add(label)
        fields.push({ type: 'input', label, placeholder: label })
      }
    }
  }
  return fields
}

export function applyInputValues(content: string, values: Record<string, string>): string {
  let result = content
  for (const [label, value] of Object.entries(values)) {
    // Replace {{input:label}}
    result = result.replace(new RegExp(`\\{\\{input:${escapeRegex(label)}\\}\\}`, 'g'), value)
    // Replace {{select:label:...}} — match the label part, any options
    result = result.replace(new RegExp(`\\{\\{select:${escapeRegex(label)}:[^}]+\\}\\}`, 'g'), value)
  }
  return result
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export function InputPrompt({ fields, onSubmit, onCancel }: Props) {
  const { theme } = useTheme()
  const [values, setValues] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {}
    fields.forEach((f) => {
      init[f.label] = f.type === 'select' && f.options?.length ? f.options[0] : ''
    })
    return init
  })
  const firstRef = useRef<HTMLInputElement | HTMLSelectElement>(null)

  useEffect(() => {
    firstRef.current?.focus()
  }, [])

  const handleSubmit = () => {
    onSubmit(values)
  }

  const allFilled = fields.every((f) => values[f.label].trim() !== '')

  const controlStyle: React.CSSProperties = {
    background: theme.inputBg,
    border: `1px solid ${theme.inputBorder}`,
    borderRadius: 6,
    color: theme.text,
    fontSize: 13,
    padding: '7px 10px',
    outline: 'none',
    width: '100%'
  }

  return (
    <div style={styles.overlay} onClick={onCancel}>
      <div style={{ ...styles.modal, background: theme.bg, borderColor: theme.buttonBorder }} onClick={(e) => e.stopPropagation()}>
        <div style={{ ...styles.header, borderBottomColor: theme.border }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: theme.text }}>값 입력</span>
        </div>

        <div style={styles.body}>
          {fields.map((f, i) => (
            <div key={f.label} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: 12, color: theme.textDim, fontWeight: 600 }}>{f.label}</label>
              {f.type === 'select' ? (
                <select
                  ref={i === 0 ? (firstRef as React.Ref<HTMLSelectElement>) : undefined}
                  style={controlStyle}
                  value={values[f.label]}
                  onChange={(e) => setValues((v) => ({ ...v, [f.label]: e.target.value }))}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && allFilled) handleSubmit()
                    if (e.key === 'Escape') onCancel()
                  }}
                >
                  {f.options!.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              ) : (
                <input
                  ref={i === 0 ? (firstRef as React.Ref<HTMLInputElement>) : undefined}
                  style={controlStyle}
                  value={values[f.label]}
                  onChange={(e) => setValues((v) => ({ ...v, [f.label]: e.target.value }))}
                  placeholder={f.placeholder}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && allFilled) handleSubmit()
                    if (e.key === 'Escape') onCancel()
                  }}
                />
              )}
            </div>
          ))}
        </div>

        <div style={{ ...styles.footer, borderTopColor: theme.border }}>
          <button
            style={{ ...styles.btn, background: theme.buttonBorder, color: theme.text }}
            onClick={onCancel}
          >
            취소
          </button>
          <button
            style={{
              ...styles.btn,
              background: theme.accent,
              color: theme.accentText,
              fontWeight: 600,
              opacity: allFilled ? 1 : 0.5
            }}
            onClick={handleSubmit}
            disabled={!allFilled}
          >
            확인
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
    zIndex: 200
  },
  modal: {
    border: '1px solid',
    borderRadius: 10,
    width: '90%',
    maxWidth: 300,
    overflow: 'hidden'
  },
  header: {
    padding: '10px 14px',
    borderBottom: '1px solid'
  },
  body: {
    padding: '12px 14px',
    display: 'flex',
    flexDirection: 'column',
    gap: 10
  },
  footer: {
    display: 'flex',
    gap: 8,
    padding: '10px 14px',
    borderTop: '1px solid',
    justifyContent: 'flex-end'
  },
  btn: {
    border: 'none',
    borderRadius: 6,
    fontSize: 13,
    padding: '7px 16px',
    cursor: 'pointer'
  }
}
