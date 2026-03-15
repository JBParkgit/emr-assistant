import { useState, useEffect, useCallback } from 'react'
import { v4 as uuidv4 } from 'uuid'
import type { MacroData, Macro } from '../types/macro'

const EMPTY_DATA: MacroData = { macros: [] }

export function useMacros() {
  const [data, setData] = useState<MacroData>(EMPTY_DATA)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    const d = await window.api.getMacros()
    setData(d)
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const persist = useCallback(async (newData: MacroData) => {
    setData(newData)
    await window.api.saveMacros(newData)
  }, [])

  const addMacro = useCallback(
    (macro: Macro) => {
      const newMacro = { ...macro, id: uuidv4(), order: data.macros.length }
      persist({ macros: [...data.macros, newMacro] })
    },
    [data, persist]
  )

  const updateMacro = useCallback(
    (macro: Macro) => {
      const macros = data.macros.map((m) => (m.id === macro.id ? macro : m))
      persist({ macros })
    },
    [data, persist]
  )

  const deleteMacro = useCallback(
    (id: string) => {
      const macros = data.macros.filter((m) => m.id !== id)
      persist({ macros })
    },
    [data, persist]
  )

  const reorderMacro = useCallback(
    (id: string, direction: 'up' | 'down') => {
      const idx = data.macros.findIndex((m) => m.id === id)
      if (idx < 0) return
      const newIdx = direction === 'up' ? idx - 1 : idx + 1
      if (newIdx < 0 || newIdx >= data.macros.length) return
      const macros = [...data.macros]
      ;[macros[idx], macros[newIdx]] = [macros[newIdx], macros[idx]]
      macros.forEach((m, i) => (m.order = i))
      persist({ macros })
    },
    [data, persist]
  )

  return {
    data,
    loading,
    addMacro,
    updateMacro,
    deleteMacro,
    reorderMacro,
    reload: load
  }
}
