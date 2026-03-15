import { contextBridge, ipcRenderer } from 'electron'

const api = {
  // Macro CRUD
  getMacros: () => ipcRenderer.invoke('macro:getAll'),
  saveMacros: (data: any) => ipcRenderer.invoke('macro:save', data),
  exportMacros: (userId?: string) => ipcRenderer.invoke('macro:export', userId),
  importMacros: (json: string, userId?: string) => ipcRenderer.invoke('macro:import', json, userId),

  // User profiles
  getProfiles: () => ipcRenderer.invoke('profile:getAll'),
  getActiveUserId: () => ipcRenderer.invoke('profile:getActiveId'),
  addProfile: (name: string) => ipcRenderer.invoke('profile:add', name),
  renameProfile: (id: string, name: string) => ipcRenderer.invoke('profile:rename', id, name),
  deleteProfile: (id: string) => ipcRenderer.invoke('profile:delete', id),
  switchUser: (userId: string) => ipcRenderer.invoke('profile:switch', userId),

  // Settings
  getSettings: () => ipcRenderer.invoke('settings:get'),
  updateSettings: (settings: any) => ipcRenderer.invoke('settings:update', settings),

  // Paste
  paste: (content: string) => ipcRenderer.invoke('paste:execute', content),

  // Hotkey paste listener (for macros with input fields)
  onHotkeyPaste: (callback: (content: string) => void) => {
    ipcRenderer.on('hotkey:paste', (_e, content: string) => callback(content))
  },

  // Window controls
  getWindowHeight: () => ipcRenderer.invoke('window:getHeight'),
  resizeHeight: (height: number) => ipcRenderer.invoke('window:resizeHeight', height),
  toggleAlwaysOnTop: () => ipcRenderer.invoke('window:toggleAlwaysOnTop'),
  isAlwaysOnTop: () => ipcRenderer.invoke('window:isAlwaysOnTop'),
  minimize: () => ipcRenderer.send('window:minimize'),
  close: () => ipcRenderer.send('window:close'),
  toggle: () => ipcRenderer.send('window:toggle')
}

contextBridge.exposeInMainWorld('api', api)
