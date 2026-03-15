/// <reference types="vite/client" />

interface Window {
  api: {
    getMacros: () => Promise<import('./types/macro').MacroData>
    saveMacros: (data: import('./types/macro').MacroData) => Promise<void>
    exportMacros: (userId?: string) => Promise<string>
    importMacros: (json: string, userId?: string) => Promise<import('./types/macro').MacroData>
    getProfiles: () => Promise<import('./types/macro').UserProfile[]>
    getActiveUserId: () => Promise<string>
    addProfile: (name: string) => Promise<import('./types/macro').UserProfile>
    renameProfile: (id: string, name: string) => Promise<void>
    deleteProfile: (id: string) => Promise<boolean>
    switchUser: (userId: string) => Promise<import('./types/macro').MacroData>
    getSettings: () => Promise<import('./types/macro').AppSettings>
    updateSettings: (settings: Partial<import('./types/macro').AppSettings>) => Promise<void>
    paste: (content: string) => Promise<boolean>
    onHotkeyPaste: (callback: (content: string) => void) => void
    getWindowHeight: () => Promise<number>
    resizeHeight: (height: number) => Promise<void>
    toggleAlwaysOnTop: () => Promise<boolean>
    isAlwaysOnTop: () => Promise<boolean>
    minimize: () => void
    close: () => void
    toggle: () => void
  }
}
