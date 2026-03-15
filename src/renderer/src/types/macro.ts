export interface Macro {
  id: string
  title: string
  content: string
  order: number
  hotkey?: string  // e.g. "Ctrl+1", "Ctrl+Shift+A"
}

export interface MacroData {
  macros: Macro[]
}

export interface UserProfile {
  id: string
  name: string
}

export interface AppSettings {
  pasteDelay: number
  opacity: number
  initialHeight: number
  themeId?: string
  activeUserId: string
  windowBounds?: { x: number; y: number; width: number; height: number }
}
