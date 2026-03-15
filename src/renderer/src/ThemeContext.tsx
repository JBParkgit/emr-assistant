import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { themes, defaultThemeId, type Theme } from './themes'

interface ThemeContextValue {
  theme: Theme
  themeId: string
  setThemeId: (id: string) => void
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: themes[defaultThemeId],
  themeId: defaultThemeId,
  setThemeId: () => {}
})

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeId, setThemeIdState] = useState(defaultThemeId)

  useEffect(() => {
    window.api.getSettings().then((s: any) => {
      if (s.themeId && themes[s.themeId]) {
        setThemeIdState(s.themeId)
      }
    })
  }, [])

  const setThemeId = (id: string) => {
    if (themes[id]) {
      setThemeIdState(id)
      window.api.updateSettings({ themeId: id } as any)
    }
  }

  return (
    <ThemeContext.Provider value={{ theme: themes[themeId], themeId, setThemeId }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
