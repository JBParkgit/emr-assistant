import { useState, useMemo } from 'react'
import type { Macro } from '../types/macro'

export function useSearch(macros: Macro[]) {
  const [query, setQuery] = useState('')

  const results = useMemo(() => {
    if (!query.trim()) return macros
    const lower = query.toLowerCase()
    return macros.filter(
      (m) =>
        m.title.toLowerCase().includes(lower) ||
        m.content.toLowerCase().includes(lower)
    )
  }, [macros, query])

  return { query, setQuery, results }
}
