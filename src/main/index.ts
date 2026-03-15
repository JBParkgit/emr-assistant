import { app, BrowserWindow, globalShortcut, ipcMain, screen } from 'electron'
import { join } from 'path'
import { is } from '@electron-toolkit/utils'
import { MacroStore } from './macroStore'
import { PasteService } from './pasteService'
import { HotkeyManager } from './hotkeyManager'
import { processTemplate } from './templateEngine'

let mainWindow: BrowserWindow | null = null
let macroStore: MacroStore
let pasteService: PasteService
let hotkeyManager: HotkeyManager

function createWindow(): void {
  const settings = macroStore.getSettings()

  mainWindow = new BrowserWindow({
    width: 320,
    height: settings.initialHeight || 700,
    minWidth: 260,
    minHeight: 300,
    frame: false,
    alwaysOnTop: true,
    transparent: false,
    skipTaskbar: false,
    resizable: true,
    opacity: settings.opacity ?? 1.0,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  // Restore saved position (not size)
  const saved = settings.windowBounds
  const x = saved?.x
  const y = saved?.y
  if (x !== undefined && y !== undefined) {
    const displays = screen.getAllDisplays()
    const onScreen = displays.some((d) => {
      const b = d.bounds
      return x >= b.x && x < b.x + b.width && y >= b.y && y < b.y + b.height
    })
    if (onScreen) {
      mainWindow.setPosition(x, y)
    }
  }

  // Force initial height after position restore
  const targetHeight = settings.initialHeight || 700
  const currentBounds = mainWindow.getBounds()
  if (currentBounds.height !== targetHeight) {
    mainWindow.setBounds({ ...currentBounds, height: targetHeight })
  }

  // Save window bounds on move/resize
  const saveBounds = (): void => {
    if (!mainWindow) return
    const b = mainWindow.getBounds()
    macroStore.updateSettings({ windowBounds: b })
  }
  mainWindow.on('moved', saveBounds)
  mainWindow.on('resized', saveBounds)

  // Start focus tracking
  pasteService = new PasteService(mainWindow)
  pasteService.startTracking()

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

function setupIPC(): void {
  // Macro CRUD
  ipcMain.handle('macro:getAll', () => macroStore.getAll())
  ipcMain.handle('macro:save', (_e, data) => {
    macroStore.saveAll(data)
    registerMacroHotkeys()
  })
  ipcMain.handle('macro:export', (_e, userId?: string) => macroStore.exportData(userId))
  ipcMain.handle('macro:import', (_e, json: string, userId?: string) => macroStore.importData(json, userId))

  // User profiles
  ipcMain.handle('profile:getAll', () => macroStore.getProfiles())
  ipcMain.handle('profile:getActiveId', () => macroStore.getActiveUserId())
  ipcMain.handle('profile:add', (_e, name: string) => macroStore.addProfile(name))
  ipcMain.handle('profile:rename', (_e, id: string, name: string) => macroStore.renameProfile(id, name))
  ipcMain.handle('profile:delete', (_e, id: string) => macroStore.deleteProfile(id))
  ipcMain.handle('profile:switch', (_e, userId: string) => {
    const data = macroStore.switchUser(userId)
    registerMacroHotkeys()
    return data
  })

  // Settings
  ipcMain.handle('settings:get', () => macroStore.getSettings())
  ipcMain.handle('settings:update', (_e, settings) => {
    macroStore.updateSettings(settings)
    if (settings.opacity !== undefined && mainWindow) {
      mainWindow.setOpacity(settings.opacity)
    }
  })

  // Paste action
  ipcMain.handle('paste:execute', async (_e, content: string) => {
    const processed = processTemplate(content)
    await pasteService.pasteToLastWindow(processed)
  })

  // Window controls
  ipcMain.handle('window:getHeight', () => {
    return mainWindow?.getBounds().height ?? 700
  })
  ipcMain.handle('window:resizeHeight', (_e, height: number) => {
    if (mainWindow) {
      const bounds = mainWindow.getBounds()
      mainWindow.setBounds({ ...bounds, height })
    }
  })
  ipcMain.handle('window:toggleAlwaysOnTop', () => {
    if (!mainWindow) return false
    const current = mainWindow.isAlwaysOnTop()
    if (current) {
      mainWindow.setAlwaysOnTop(false)
    } else {
      mainWindow.setAlwaysOnTop(true, 'floating')
    }
    return mainWindow.isAlwaysOnTop()
  })
  ipcMain.handle('window:isAlwaysOnTop', () => mainWindow?.isAlwaysOnTop() ?? true)
  ipcMain.on('window:minimize', () => mainWindow?.minimize())
  ipcMain.on('window:close', () => mainWindow?.close())
  ipcMain.on('window:toggle', () => {
    if (mainWindow?.isVisible()) {
      mainWindow.hide()
    } else {
      mainWindow?.show()
    }
  })
}

const macroHotkeys: string[] = []

function registerMacroHotkeys(): void {
  // Unregister previous macro hotkeys
  for (const key of macroHotkeys) {
    globalShortcut.unregister(key)
  }
  macroHotkeys.length = 0

  // Register hotkeys for current macros
  const data = macroStore.getAll()
  for (const macro of data.macros) {
    if (!macro.hotkey) continue
    try {
      const hasInputFields = /\{\{input:[^}]+\}\}/.test(macro.content)
      const success = globalShortcut.register(macro.hotkey, async () => {
        if (hasInputFields && mainWindow) {
          // Show window and let renderer handle input prompts
          mainWindow.show()
          mainWindow.webContents.send('hotkey:paste', macro.content)
        } else {
          const processed = processTemplate(macro.content)
          await pasteService.pasteToLastWindow(processed)
        }
      })
      if (success) {
        macroHotkeys.push(macro.hotkey)
      }
    } catch {
      // Invalid hotkey, skip
    }
  }
}

app.whenReady().then(() => {
  macroStore = new MacroStore()
  setupIPC()
  createWindow()

  // Global shortcut: Alt+Space to toggle window
  hotkeyManager = new HotkeyManager(mainWindow!)
  registerMacroHotkeys()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('will-quit', () => {
  globalShortcut.unregisterAll()
  pasteService?.stopTracking()
})

app.on('window-all-closed', () => {
  app.quit()
})
